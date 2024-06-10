type createSignData = {
    ConfirmMessage: {
        Template: string
    },
    FileIds?: string[],
    FileHashes?: hashFile[],
    SerializedFiles?: base64File[]
    SignType: string,
    CertificateBase64?: string
};

type base64File = {
    Id: string,
    FileName: string,
    ContentBase64: string
};

type hashFile = {
    FileName: string,
    HashContent: string
};


const chunkSize = 10000;
const apiKey = "393a34b7-a20a-498d-9a1b-4fca580e8a9d";
const konturSignUrl = Namespace.params.data.kontur_sign_server;
let headers: Record<string, string> = {
    "X-KONTUR-APIKEY": apiKey
};
const stableData: createSignData = {
    ConfirmMessage: {
        Template: "0"
    },
    SignType: "0",
    FileIds: []
};

const stableDataForHash: createSignData = {
    ConfirmMessage: {
        Template: "0"
    },
    SignType: "0",
    FileHashes: []
};

const stableDataForBase64: createSignData = {
    ConfirmMessage: {
        Template: "0"
    },
    SignType: "0",
    SerializedFiles: []
};

let prodServer: boolean;

async function getCerts(): Promise<void> {
    try {
        Context.data.debug = `${Context.data.applicationRef!.namespace}/${Context.data.applicationRef!.code}`

    } catch {
        throw new Error(`no appref: ${Context.data.applicationRef}`)
    }
    let currentUser = await System.users.getCurrentUser();
    let certs = await System.signs.digitalSigns.search().where((f ,g) => g.and(
        f.__createdBy.eq(currentUser),
        f.__deletedAt.eq(null)
    )).size(1000).sort("__createdAt").all();
    certs = certs.filter(cert => {
        return (cert.data.sign_provider?.code === "Kontur" || cert.data.signProvider?.code === "Kontur" || cert.data.signProvider?.code === "KonturNew" || cert.data.sign_provider?.code === "KonturNew") && ((cert.data.cert_status === "released" || cert.data.certStatus === "released") || !!cert.data.cert)
    });
    
    certs = [...new Map(certs.map(item => [item.data.issueID, item])).values()]

    let certItems = await Namespace.params.fields.digital_signs_list.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.user.eq(currentUser),
            f.status.like('Выпущена')
    )).size(10000).all();
    let allCerts = certs.map(cert => {
        let certItem = certItems.find(c => c.data.external_id === cert.data.issueID)
        return  {
            name: certItem ? certItem.data.__name : `${currentUser.data.__name} ${cert.data.__createdAt.format("DD.MM.YY")}`,
            code: cert.data.__id
        };
    });
    if (!allCerts || allCerts.length < 1) {
        Context.data.error = "Нет сертификатов";
        Context.data.sign_error = true;
        Context.data.empty_certs = true;
        return;
    };
    Context.data.certs_json = JSON.stringify(allCerts);
};

async function createFile(): Promise<void> {
    try {
        prodServer = Namespace.params.data.kontur_server.code == "production";
        const uploadType = Namespace.params.data.file_upload_type ? Namespace.params.data.file_upload_type.code : undefined;

        switch (uploadType) {
            case "hash_only":
                Context.data.hash_only = true;
                break
            case "base64_only":
                Context.data.base64_only = true;
                break;
            case "full_body":
            case undefined:
                let responseJson: any;
                let docApp = await Context.data.applicationRef!.fetch();
                if (!docApp.data.__file) {
                    throw new Error("Отсутствует файл в документе")
                };
                let file: FileItem = await docApp.data.__file.fetch();
                let fileLink = await file.getDownloadUrl();
                Context.data.file_link = fileLink;
                let fileBuffer = await fetch(fileLink).then(r => r.arrayBuffer());
                let fileSize = fileBuffer.byteLength.toString();
                let fileHash = await file.getFileMD5Hash();
                let fileName = file.data.__name;
                let fullUrl: string = "";
                
                let response: FetchResponse;
                if (prodServer) {
                    fullUrl = `${konturSignUrl}/CreateFile?md5=${fileHash}&fileName=${fileName}&length=${fileSize}`
                    response = await fetch(fullUrl, {
                        // headers,
                        method: "POST"
                    });
                } else {
                    fullUrl = `${konturSignUrl}/CreateFile?certificate=${apiKey}&md5=${fileHash}&fileName=${fileName}&length=${fileSize}`
                    response = await fetch(fullUrl, {
                        method: "POST"
                    });
                };
                if (!response.ok) {
                    let errorMsg = `${konturSignUrl}/CreateFile?certificate=${apiKey}&md5=${fileHash}&fileName=${fileName}&length=${fileSize} ` + await response.text();
                    errorMsg += prodServer ? " (production server)" : " (test server)"
                    throw new Error(errorMsg);
                };
                responseJson = await response.json();
                let fileId: string = responseJson.FileId;
                Context.data.file_id = fileId;

                const uploadedLength = Number(responseJson.Length);
                Context.data.full_size = Number(fileSize);

                Context.data.debug = JSON.stringify({
                    file_length: Number(fileSize),
                    uploaded_size: uploadedLength
                });

                if (uploadedLength < Number(fileSize)) {
                    Context.data.debug += " uploading chunk.."
                    Context.data.file_length = uploadedLength;
                    await uploadChunk();
                };
                break;
        };
        
        await createSignDraft();
    } catch (err) {
        Context.data.error = err.message;
        Context.data.sign_error = true;
        return;
    };
};

async function uploadChunk(): Promise<void> {
    try {
        let fileId = Context.data.file_id;
        let fileLink = Context.data.file_link!;
        let fileBuffer = await fetch(fileLink).then(r => r.arrayBuffer());
        let fullUrl: string = "";
        let response: FetchResponse;
        if (prodServer) {
            fullUrl = `${konturSignUrl}/UploadChunk?fileId=${fileId}&offset=${Context.data.file_length}`;
            response = await fetch(fullUrl, {
                // headers,
                method: "POST",
                body: fileBuffer
            });
        } else {
            fullUrl = `${konturSignUrl}/UploadChunk?certificate=${apiKey}&fileId=${fileId}&offset=${Context.data.file_length}`;
            response = await fetch(fullUrl, {
                method: "POST",
                body: fileBuffer
            });
        };

        if (!response.ok) {
            throw new Error(await response.text());
        };

    } catch (err) {
        Context.data.sign_error = true;
        Context.data.error = err.message;
        return
    };
};

async function createSignDraft(): Promise<void> {
    try {
        let issueId = Context.data.certificates!.code;
        let selectedIssue = await System.signs.digitalSigns.search().where(f => f.__id.eq(issueId!)).first();
        let certificateBase64 = selectedIssue!.data.cert;
        let fileId = Context.data.file_id!;
        let response: FetchResponse;
        let dataForRequest: createSignData = {
            ConfirmMessage: {
                Template: "0"
            },
            SignType: "0"
        };

        const docApp = await Context.data.applicationRef!.fetch();

        if (!docApp.data.__file) {
            throw new Error("Отсутствует файл в документе");
        };
        
        const file: FileItem = await docApp.data.__file.fetch();

        if (Context.data.hash_only) {
            const fileHash = await file.getFileMD5Hash();

            stableDataForHash.FileHashes = [{
                FileName: file.data.__name,
                HashContent: fileHash
            }];
            
            dataForRequest = stableDataForHash;
        } else if (Context.data.base64_only) {
            const fileLink = await file.getDownloadUrl();
            const fileBuffer = await fetch(fileLink).then(r => r.arrayBuffer());
            const fileBase64 = arrayBufferToBase64(fileBuffer);

            stableDataForBase64.SerializedFiles = [{
                Id: file.id,
                FileName: file.data.__name,
                ContentBase64: fileBase64
            }];
            dataForRequest = stableDataForBase64;
        } else {
            stableData.FileIds!.push(fileId)
            dataForRequest = stableData;
        }

        dataForRequest.CertificateBase64 = certificateBase64;

        // Context.data.debug = JSON.stringify({
        //     url: `${konturSignUrl}/Sign?certificate=${apiKey}`,
        //     method: "POST",
        //     data: dataForRequest
        // });
        
        let fullUrl: string = "";
        if (prodServer) {
            fullUrl = `${konturSignUrl}/Sign`
            response = await fetch(fullUrl, {
                // headers,
                method: "POST",
                body: JSON.stringify(dataForRequest)
            });
        } else {
            fullUrl = `${konturSignUrl}/Sign?certificate=${apiKey}`
            response = await fetch(fullUrl, {
                method: "POST",
                body: JSON.stringify(dataForRequest)
            });
        }
        if (!response.ok) {
            throw new Error(await response.text());
        };
        let responseJson = await response.json();
        let operationId = responseJson.OperationId;
        Context.data.operation_id = operationId;
        const provider = await System.signs.providers.search().where(f => f.code.eq("Kontur")).first();

        let dataSigns = await docApp.getDataSigns();
        let signType = <SignType>"file";
        let updatedAt = docApp.data.__updatedAt.format();
        let newIssue: EntitySignItem;

        newIssue = await System.signs.entitySigns.createDraft(operationId, issueId, Context.data.applicationRef!, dataSigns, updatedAt, signType, "", provider!);

        Context.data.inner_sign_id = newIssue.id;
        Context.data.draft_created = true;
    } catch (err) {
        Context.data.sign_error = true;
        Context.data.error = `createSignDraft: ${err.message}`;
        return;
    };
};

async function sendCode(): Promise<void> {
    try {
        let confirmationCode = Context.data.sms_code;
        let operationId = Context.data.operation_id;
        let fullUrl: string = "";
        let response: FetchResponse;
        if (prodServer) {
            fullUrl = `${konturSignUrl}/Confirm?confirmationCode=${confirmationCode}&operationId=${operationId}`;
            response = await fetch(fullUrl, {
                // headers,
                method: "POST"
            });
        } else {
            fullUrl =`${konturSignUrl}/Confirm?certificate=${apiKey}&confirmationCode=${confirmationCode}&operationId=${operationId}`;
            response = await fetch(fullUrl, {
                method: "POST"
            });
        };
        if (!response.ok) {
            throw new Error(await response.text());
        };
    } catch (err) {
        Context.data.sign_error = true;
        Context.data.error = err.message;
        return;
    };
};

async function closeDraft(): Promise<void> {
    try {
        let fullUrl: string = "";
        if (prodServer) {
            fullUrl = `${konturSignUrl}/GetStatus?operationId=${Context.data.operation_id}`;
        } else {
            fullUrl = `${konturSignUrl}/GetStatus?certificate=${apiKey}&operationId=${Context.data.operation_id}`;
        };
        let responseCheck = await fetch(fullUrl, {
            // headers
        });
        if (!responseCheck.ok) {
            throw new Error(`getstatus error: ${await responseCheck.text()}`);
        };
        let responseJson = await responseCheck.json();
        let resultId = responseJson["FileStatuses"][0].ResultId;
        let resultSize = responseJson["FileStatuses"][0].ResultSize;
        let responseGet: FetchResponse;
        if (prodServer) {
            fullUrl = `${konturSignUrl}/GetResult?resultId=${resultId}&offset=0&size=${resultSize}`
            responseGet = await fetch(fullUrl, {
                // headers
            });
        } else {
            fullUrl = `${konturSignUrl}/GetResult?certificate=${apiKey}&resultId=${resultId}&offset=0&size=${resultSize}`
            responseGet = await fetch(fullUrl, {
                method: "GET"
            });
        }
        if (!responseGet.ok) {
            throw new Error(`getresult error: ${await responseGet.text()}`);
        };
        try {
            let signBuffer = await responseGet.arrayBuffer();

            let entitySign = await System.signs.entitySigns.search().where(f => f.__id.eq(Context.data.inner_sign_id!)).first();
            await entitySign!.uploadSign(signBuffer);
            
            try {
                await entitySign!.setStatus(<EntitySignOperationStatus>"completed");
            } catch {
                await entitySign!.setStatus(EntitySignOperationStatus.Completed);
            };

            Context.data.sign_success = true;
            Context.data.isDone = true;
        } catch (err) {
            throw new Error(`Произошла ошибка при подписании: ${err.message}, пожалуйста, попробуйте еще раз.`);
        };
    } catch (err) {
        Context.data.sign_error = true;
        Context.data.error = err.message;
        return;
    };
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    let bytes = new Uint8Array( buffer );
    let len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    };

    return btoa(binary);
}
