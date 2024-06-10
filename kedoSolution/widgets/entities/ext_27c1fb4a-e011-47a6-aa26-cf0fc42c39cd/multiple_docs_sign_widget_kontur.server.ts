type createSignData = {
    ConfirmMessage: {
        Template: string
    },
    FileIds: string[],
    SignType: string,
    CertificateBase64?: string
};

type createFileData = {
    fileName: string,
    fileHash: string,
    fileSize: number,
    fileBuffer?: ArrayBuffer,
    refId: string,
    fileId?: string,
    issueId?: string
};

const apiKey = "393a34b7-a20a-498d-9a1b-4fca580e8a9d";
const konturSignUrl = Namespace.params.data.kontur_sign_server;
const headers: Record<string, string> = {
    "X-KONTUR-APIKEY": apiKey
};
const stableData: createSignData = {
    ConfirmMessage: {
        Template: "0"
    },
    SignType: "0",
    FileIds: []
};

let filesMeta: createFileData[] = [];

let prodServer: boolean;

async function getCertificates(): Promise<void> {
    const currentUser = await System.users.getCurrentUser();
    const certs = await System.signs.digitalSigns.search().where((f ,g) => g.and(
        f.__createdBy.eq(currentUser),
        f.__deletedAt.eq(null)
    )).size(1000).sort("__createdAt").all().then(items => items.filter(cert => {
        return (
                cert.data.sign_provider?.code === "Kontur" || cert.data.signProvider?.code === "Kontur" || cert.data.signProvider?.code === "KonturNew" || cert.data.sign_provider?.code === "KonturNew"
            ) && (
                (cert.data.cert_status === "released" || cert.data.certStatus === "released") || !!cert.data.cert
            )
    }));


    const certItems = await Namespace.params.fields.digital_signs_list.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.user.eq(currentUser),
            f.status.like('Выпущена')
    )).size(10000).all();
    const allCerts = certs.map(cert => {
        const certItem = certItems.find(c => c.data.external_id === cert.data.issueID)
        return  {
            name: certItem ? certItem.data.__name : `${currentUser.data.__name} ${cert.data.__createdAt.format("DD.MM.YY")}`,
            code: cert.data.__id
        };
    });
    if (!allCerts || allCerts.length < 1) {
        Context.data.error = "Нет сертификатов";
        Context.data.error_exists = true;
        return;
    };
    Context.fields.certs_choice.data.variants = allCerts;
};

async function createFile(): Promise<void> {
    Context.data.error_exists = false;
    Context.data.docs_signed = false;
    Context.data.error = "";
    try {
        prodServer = Namespace.params.data.kontur_server.code == "production";
        
        const docs = await Promise.all(Context.data.docs_array!.map(doc => doc.fetch())).then(docs => docs.filter(doc => doc.data.__file));
        filesMeta = await Promise.all(docs.map(async doc => {
            const file: FileItem = await doc.data.__file.fetch();
            const fileHash = await file.getFileMD5Hash();
            const fileName = file.data.__name;
            const fileSize = file.data.size!;
            const fileLink = await file.getDownloadUrl();
            const fileBuffer = await fetch(fileLink).then(r => r.arrayBuffer());
            const refId = doc.id;

            return {
                fileHash,
                fileName,
                fileSize,
                fileBuffer,
                refId
            };
        }));
        let fullUrl: string = "";

        for (let file of filesMeta) {
            if (prodServer) {
                fullUrl = `${konturSignUrl}/CreateFile?md5=${file.fileHash}&fileName=${file.fileName}&length=${file.fileSize}`
            } else {
                fullUrl = `${konturSignUrl}/CreateFile?certificate=${apiKey}&md5=${file.fileHash}&fileName=${file.fileName}&length=${file.fileSize}`
            };
            const response = await fetch(fullUrl, {
                headers,
                method: "POST"
            });
            if (!response.ok) {
                Context.data.error = await response.text();
                Context.data.error_exists = true;
                return;
            };
            const responseJson = await response.json();
            const fileId: string = responseJson.FileId;
            file.fileId = fileId;
            
            if (responseJson.Length !== file.fileSize) {
                await uploadChunk(file.fileId, file.fileBuffer!, );
            };
            if (Context.data.error_exists) {
                return;
            };
        };
        await createSignDraft();
    } catch (err) {
        Context.data.error = err.message;
        Context.data.sign_error = true;
        return;
    };
};

async function uploadChunk(fileId: string, fileBuffer: ArrayBuffer): Promise<void> {
    try {
        let fullUrl: string = "";
        if (prodServer) {
            fullUrl = `${konturSignUrl}/UploadChunk?fileId=${fileId}&offset=0`;
        } else {
            fullUrl = `${konturSignUrl}/UploadChunk?certificate=${apiKey}&fileId=${fileId}&offset=0`;
        };
        const response = await fetch(fullUrl, {
            headers,
            method: "POST",
            body: fileBuffer
        });
        if (!response.ok) {
            Context.data.error_exists = true;
            Context.data.error = await response.text();
            return;
        };
    } catch (err) {
        Context.data.error_exists = true;
        Context.data.error = err.message;
        return
    };
};

async function createSignDraft(): Promise<void> {
    Context.data.docs_signed = false;
    Context.data.error = "";
    Context.data.error_exists = false;
    try {
        const issueId = Context.data.issue_id;
        const selectedIssue = await System.signs.digitalSigns.search().where(f => f.__id.eq(issueId!)).first();
        const certificateBase64 = selectedIssue!.data.cert;
        stableData.CertificateBase64 = certificateBase64;
        stableData.FileIds = filesMeta.map(file => file.fileId!);

        let fullUrl: string = "";
        if (prodServer) {
            fullUrl = `${konturSignUrl}/Sign`
        } else {
            fullUrl = `${konturSignUrl}/Sign?certificate=${apiKey}`
        };
        const response = await fetch(fullUrl, {
            headers,
            method: "POST",
            body: JSON.stringify(stableData)
        });
        if (!response.ok) {
            Context.data.error = await response.text();
            Context.data.error_exists = true;
            return;
        };
        const responseJson = await response.json();
        const operationId = responseJson.OperationId;
        Context.data.operation_id = operationId;

        const docs = await Promise.all(Context.data.docs_array!.map(doc => doc.fetch()));
        const provider = await System.signs.providers.search().where(f => f.code.eq("Kontur")).first();
        const providerRef = <any> {
            namespace: "system.__digital_sign_provider",
            code: provider!.data.code,
            id: provider!.id
        };
        const signType = <SignType>"file";

        for (let doc of docs) {
            const dataSigns = await doc.getDataSigns();
            const updatedAt = doc.data.__updatedAt;
            const newIssue = await System.signs.entitySigns.createDraft(operationId, issueId!, doc, dataSigns, updatedAt, signType, "", providerRef);
            const fileObj = filesMeta.find(obj => obj.refId === doc.id);
            fileObj!.issueId = newIssue.id;
        };

        Context.data.draft_created = true;
    } catch (err) {
        Context.data.error_exists = true;
        Context.data.error = err.message;
        return;
    };
    Context.data.files_meta = JSON.stringify(filesMeta.map(obj => {
        return {
            fileId: obj.fileId,
            issueId: obj.issueId
        }
    }));
};

async function sendCode(): Promise<void> {
    try {
        const confirmationCode = Context.data.sms_code;
        const operationId = Context.data.operation_id;

        let fullUrl: string = "";
        if (prodServer) {
            fullUrl = `${konturSignUrl}/Confirm?confirmationCode=${confirmationCode}&operationId=${operationId}`;
        } else {
            fullUrl =`${konturSignUrl}/Confirm?certificate=${apiKey}&confirmationCode=${confirmationCode}&operationId=${operationId}`;
        };
        const response = await fetch(fullUrl, {
            headers,
            method: "POST"
        });
        if (!response.ok) {
            Context.data.error = await response.text();
            Context.data.error_exists = true;
            return;
        };
    } catch (err) {
        Context.data.error_exists = true;
        Context.data.error = err.message;
        return;
    };
};

async function closeDraft(): Promise<void> {
    try {
        filesMeta = JSON.parse(Context.data.files_meta!)
        Context.data.debug = JSON.stringify(filesMeta);

        let fullUrl: string = "";

        if (prodServer) {
            fullUrl = `${konturSignUrl}/GetStatus?operationId=${Context.data.operation_id}`;
        } else {
            fullUrl = `${konturSignUrl}/GetStatus?certificate=${apiKey}&operationId=${Context.data.operation_id}`;
        };

        const responseCheck = await fetch(fullUrl, {
            headers
        });

        if (!responseCheck.ok) {
            Context.data.error = await responseCheck.text();
            Context.data.error_exists = true;
            return;
        };

        const responseJson = await responseCheck.json();
        const resultStatuses: {size: string, resId: string, fileId: string}[] = responseJson["FileStatuses"].map((status: any) => {
            return {
                size: String(status.ResultSize),
                resId: status.ResultId,
                fileId: status.FileId
            };
        });
        
        const promises: Promise<void>[] = [];

        Context.data.debug += "" + JSON.stringify(responseJson);

        for (let status of resultStatuses) {
            if (prodServer) {
                fullUrl = `${konturSignUrl}/GetResult?resultId=${status.resId}&offset=0&size=${status.size}`
            } else {
                fullUrl = `${konturSignUrl}/GetResult?certificate=${apiKey}&resultId=${status.resId}&offset=0&size=${status.size}`
            };

            promises.push(fetch(fullUrl, {
                headers
            }).then(async res => {
                const signBuffer = await res.arrayBuffer();
                const fileObj = filesMeta.find(obj => obj.fileId === status.fileId);
                const entitySign = await System.signs.entitySigns.search().where(f => f.__id.eq(fileObj!.issueId!)).first();
                await entitySign!.uploadSign(signBuffer);
                await entitySign!.setStatus(<EntitySignOperationStatus>"completed");
                await entitySign!.createSignFile();
            }));
        };

        await Promise.all(promises);

        if (Context.data.error_exists) {
            return;
        };

        Context.data.docs_signed = true;
    } catch (err) {
        Context.data.error_exists = true;
        Context.data.error = err.message;
        return;
    };
};