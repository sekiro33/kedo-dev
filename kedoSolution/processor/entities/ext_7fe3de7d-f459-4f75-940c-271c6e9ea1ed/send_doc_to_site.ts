const accessToken = Namespace.params.data.api_token;
const userId = Namespace.params.data.user_id;
const headers = <Record<string, string>> {
    "Content-Type": "application/json",
    "Authorization": `Basic ${accessToken}`
};
const baseUrl = "https://ekd-integration.trudvsem.ru";
const invalidFieldsRegexp = /\[(?<value>.*)\]/


type docData = {
    userId: string,
    name: string,
    fileName: string,
    comment?: string,
    docEffectiveDate?: string,
    docNumber?: string,
    groupId?: string,
    docKindId?: string
};

type signData = {
    userId: string,
    signatureFormat: string,
    signature: string,
    signatureFileName: string,
    certificate?: string,
    noVerify?: boolean
};

type sendDocData = {
    userId: string,
    snils: string 
};

type jsonData = {
    docData: docData,
    signData: signData,
    sendDocData: sendDocData
};


async function logError(response?: FetchResponse, error?: string) {
    const errorCode = response!.status;
    let responseText = await response!.text();
    Context.data.error = responseText;
    if (!response) {
        throw new Error(error)
    };
    switch (errorCode) {
        case 400:
            let errMessage: string = ""
            if (response.url.includes("storeSign")) {
                errMessage = "Неподдерживаемый формат подписи."
                Context.data.error = errMessage;
                throw new Error("Неподдерживаемый формат подписи.")
            }
            const regMatch = responseText.match(invalidFieldsRegexp);

            if (!!regMatch && regMatch.length > 0) {
                const invalidFields = regMatch[1];
                errMessage = invalidFields
                Context.data.error = `Не заданы обязательные поля: ${errMessage}.`;
            };

            throw new Error(Context.data.error);
        case 401:
            throw new Error("Неверный api-ключ.");
        case 403:
            throw new Error("Отсутствуют права на создание или изменение документов.");
        case 404:
            throw new Error("Не найден работодатель, соответствующий пользователю.")
        case 415:
            throw new Error("Документ не соответствует формату PDF/A-1 или в запросе передан тип данных, отличающийся от 'application/json'");
    };
};

async function serialize(): Promise<void> {
    Context.data.api_token = accessToken
    Context.data.user_id = userId
    try {
        const doc = await Context.data.doc!.fetch();
        let snils = Context.data.snils!;
        if (snils.includes("-") || snils.includes(" ")) {
            snils = snils.replace(/-/g, "").replace(/\s/g, "")
        };
        let signature: string = "";
        let fetchedDoc: any;

        if (!!doc.data.__sourceRef) {
            fetchedDoc = await doc.data.__sourceRef.fetch();
        } else {
            fetchedDoc = doc;
        };

        const fileBuffer = await fetch(await fetchedDoc.data.__file.getDownloadUrl()).then(async resp => resp.arrayBuffer());
        const file = arrayBufferToBase64(fileBuffer)
        Context.data.debug = file
        const fileName = await fetchedDoc.data.__file.fetch().then((r: any) => r.data.__name);
        const name = fileName;

        try {
            const signHistory = await fetchedDoc.getSignHistory();
            signature = signHistory[0].signs[0].sign;
        } catch (err) {
            throw new Error(`Ошибка ${err.message}: у документа отсутствуют подписи.`)
        };

        const docDataObj = <docData> {
            userId,
            name,
            fileName,
            file
        };

        const signDataObj = <signData> {
            userId,
            signatureFormat: "CADESBES",
            signature,
            signatureFileName: `${fileName}.sig`
        };

        const sendDocDataObj = <sendDocData> {
            userId,
            snils
        };

        let jsonData = <jsonData> {
            docData: docDataObj,
            signData: signDataObj,
            sendDocData: sendDocDataObj
        };
        Context.data.json_data_obj = JSON.stringify(jsonData);
    } catch (err) {
        Context.data.error = err.message;
        throw new Error(err.message)
    };
};

async function sendDoc(): Promise<void> {
    try {
        const body = JSON.stringify(JSON.parse(Context.data.json_data_obj!).docData);
        const response = await fetch(`${baseUrl}/docs`, {
            method: "POST",
            headers,
            body
        });

        if (!response.ok) {
            await logError(response);
        };
        const responseText = await response.text();
        const responseJson = JSON.parse(responseText);
        Context.data.doc_id = responseJson.documentId;
    } catch (err) {
        throw new Error(err.message);
    };
};

async function storeSign(): Promise <void> {
    try {
        const body = JSON.stringify(JSON.parse(Context.data.json_data_obj!).signData);
        const docId = Context.data.doc_id;
        const response = await fetch(`${baseUrl}/docs/${docId}/storeSign`, {
            method: "POST",
            headers,
            body
        });

        if (!response.ok) {
            await logError(response);
        };

    } catch (err) {
        throw new Error(err.message)
    };
};

async function sendDocForSigning(): Promise<void> {
    try {
        const body = JSON.stringify(JSON.parse(Context.data.json_data_obj!).sendDocData);
        const docId = Context.data.doc_id;
        const response = await fetch(`${baseUrl}/docs/${docId}/send`, {
            method: "POST",
            headers,
            body
        });

        if (!response.ok) {
            await logError(response);
        };

        const inviteLink = (await response.json()).inviteLink;
        Context.data.invite_link = inviteLink;
    } catch (err) {
        throw new Error(err.message)
    };
};

async function getFileWithSigns(): Promise<void> {
    try {
        const docId = Context.data.doc_id;
        const response = await fetch(`${baseUrl}/docs/${docId}/signedFile?userId=${userId}`, {
            headers: {
                "Authorization": `Basic ${accessToken}`
            }
        });

        if (!response.ok) {
            await logError(response);
        };

        const responseJson = await response.json();
        const fileName = responseJson.fileName;
        const zipFileBase64 = responseJson.file;
        const zipFileBuffer = base64ToArrayBuffer(zipFileBase64);
        const zipFile = await Context.fields.zip_file.create(fileName, zipFileBuffer);
        Context.data.zip_file = zipFile;
    } catch (err) {
        throw new Error(err.message);
    };
};

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = atob(base64);
    const len = binary_string.length;
    let bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    };

    return bytes.buffer;
}


function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    let bytes = new Uint8Array( buffer );
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return btoa(binary);
};
