const apiKey = "0AXPZD21MY812DYA";
// let signmeUrl = Namespace.params.data.sign_me_server_address;
let signmeUrl = "https://gost-tls-signme-test.elma-bpm.com"
let user: UserItem;

async function getCertificates(): Promise<void> {
    user = await System.users.getCurrentUser();
    let certificates = await System.signs.digitalSigns.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__createdBy.eq(user),
        //@ts-ignore
        // f.certStatus.eq("released")
    )).size(1000).all();
    certificates = certificates.filter(cert => cert.data.signProvider?.code === "SignMe" || cert.data.sign_provider?.code === "SignMe");
    if (!certificates || certificates.length < 1) {
        Context.data.error = "Нет сертификатов";
        Context.data.error_exists = true;
        Context.data.certificates_empty = true;
        return;
    };
    const mappedCertificates = certificates.map((cert) => {
        return {
            name: `${user.data.__name} ${cert.data.__createdAt.format("DD.MM.YY")}`,
            code: cert.data.__id
        };
    });
    Context.data.certificates_json = JSON.stringify(mappedCertificates);
};

async function createSign(): Promise<void> {
    try {
        if (!signmeUrl.endsWith("/")) {
            signmeUrl += "/";
        };
        const docApp = await Context.data.applicationRef!.fetch();
        if (!docApp) {
            Context.data.error = "Не получается получить документ";
            Context.data.error_exists = true;
            return;
        };
        const fileLink: string = await docApp.data.__file.getDownloadUrl();
        const fileBuffer = await fetch(fileLink).then(r => r.arrayBuffer());
        const fileBase64 = _arrayBufferToBase64(fileBuffer);
        user = await System.users.getCurrentUser();
        
        let phone: any;
        if (user.data.workPhone && user.data.workPhone.tel) {
            phone = user.data.workPhone!.tel;
        } else {
            phone = user.data.mobilePhone!.tel
        }

        if (!phone) {
            
            Context.data.error = "У пользователя отсутствует телефон";
            Context.data.error_exists = true;
            return;
        };
        Context.data.user_phone = phone;
        const response = await fetch(`${signmeUrl}signapi/sjson`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                key: apiKey,
                filet: fileBase64,
                fname: docApp.data.__name,
                user_ph: phone,
                noemail: 1
            })
        });
        const responseBody = await response.text();
        if (!response.ok || responseBody.includes("error")) {
            Context.data.error = responseBody;
            Context.data.error_exists = true;
            return;
        };
        const [operationId, fileId] = responseBody.split("/");
        Context.data.sign_operation_id = operationId;
        Context.data.external_doc_id = fileId;
        const provider = await System.signs.providers.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq("SignMe")
        )).first();
        const digitalSignId = <string>Context.data.certs!.code;
        const itemRef = <RefItem> {
            code: docApp.code,
            namespace: docApp.namespace,
            id: docApp.id
        };
        const providerRef = <any> {
            code: provider!.data.code,
            namespace: "system.__digital_sign_provider",
            id: provider!.id
        };
        const dataSigns = await docApp.getDataSigns();
        const signType = <SignType>"file";
        const updatedAt = docApp.data.__updatedAt.format();

        Context.data.debug = JSON.stringify({
            operationId,
            digitalSignId,
            itemRef,
            dataSigns,
            updatedAt,
            signType,
            providerRef
        })

        const newSign = await System.signs.entitySigns.createDraft(operationId, digitalSignId, itemRef, dataSigns, updatedAt, signType, "", providerRef);
        Context.data.inner_sign_id = newSign.id;
        await signFile();
    } catch (err) {
        Context.data.error = err.message;
        Context.data.error_exists = true;
        return;
    };
};

async function signFile(): Promise<void> {
    let body = new FormData();
    body.append("key", apiKey);
    body.append("type", "single");
    body.append("id", Context.data.sign_operation_id!);
    body.append("user_ph", Context.data.user_phone!);
    body.append("passw", Context.data.password!);
    
    Context.data.debug = JSON.stringify(body)

    const response = await fetch(`${signmeUrl}signapi/sign/`, {
        method: "POST",
        headers: {
            'ContentType': 'multipart/form-data'
        },
        body
    });

    const responseText = await response.text();
    if (!response.ok || responseText.includes("error")) {
        Context.data.error = "signFile error " + responseText;
        Context.data.error_exists = true;
        return;
    };
    await getSignFile();
};

async function checkSign(): Promise<boolean> {
    const fileId = Context.data.external_doc_id;
    const operationId = Context.data.sign_operation_id;
    const response = await fetch(`${signmeUrl}signapi/check/${operationId}/${fileId}`);
    const responseText = await response.text();
    if (!response.ok || responseText.includes("error")) {
        Context.data.error = responseText;
        Context.data.error_exists = true;
        return false;
    };
    const responseJson = JSON.parse(responseText);
    return responseJson.status == 1 || responseJson.status == "1";
};

async function getSignFile(): Promise<void> {
    try {
        const itemRef = await Context.data.applicationRef!.fetch();
        const hash = await itemRef.data.__file.getFileMD5Hash();
        const operationId = Context.data.sign_operation_id;
        const signFileFormed = await checkSign();
        if (signFileFormed) {
            const response = await fetch(`${signmeUrl}signaturecheck/get_t_pkcs/hash/${hash}/${operationId}`);
            const signBuffer = await response.arrayBuffer();
            const currentSign = await System.signs.entitySigns.search().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.eq(Context.data.inner_sign_id!)
            )).first();
            await currentSign!.uploadSign(signBuffer);
            try {
                await currentSign!.setStatus(<EntitySignOperationStatus>"completed");
            } catch (err) {
                throw new Error("setStatus error")
            }
            Context.data.isDone = true;
        };
    } catch (err) {
        Context.data.error = "getSignFile error" + err.message;
        Context.data.error_exists = true;
    };
};

async function mockFetch(user: UserItem): Promise<string | undefined> {
    const extUser = await Namespace.params.fields.ext_user_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        //@ts-ignore
        f.__id.eq(user.originalData.profiles[0].id)
    )).first();
    
    if (!extUser) {
        return;
    };
    return extUser.data.phone ? extUser.data.phone[0].tel : undefined;
};

function _arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    };
    return btoa(binary);
};