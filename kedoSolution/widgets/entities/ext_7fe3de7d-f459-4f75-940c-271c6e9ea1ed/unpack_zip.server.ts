async function getFile(): Promise<void> {
    const fileLink = await Context.data.zip_file!.getDownloadUrl();
    const fileBuffer = await (await fetch(fileLink)).arrayBuffer();
    const base64String = _arrayBufferToBase64(fileBuffer);
    Context.data.file_base64 = base64String;
};

async function getFileWithSigns(): Promise<void> {
    const baseUrl = "https://ekd-integration.trudvsem.ru";
    const accessToken = Context.data.api_token;
    const userId = Context.data.user_id;
    const docId = Context.data.doc_id;
    const response = await fetch(`${baseUrl}/docs/${docId}/signedFile?userId=${userId}`, {
        headers: {
            "Authorization": `Basic ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(await response.text());
    };

    const responseJson = await response.json();

    const fileName = responseJson.fileName;
    const zipFileBase64 = responseJson.file;
    const zipFileBuffer = base64ToArrayBuffer(zipFileBase64);
    const zipFile = await Context.fields.zip_file.create(fileName, zipFileBuffer);
    Context.data.zip_file = zipFile;
    Context.data.response = fileName;
    Context.data.file_base64 = zipFileBase64;
}

function _arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    let bytes = new Uint8Array( buffer );
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    };
    return btoa(binary);
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