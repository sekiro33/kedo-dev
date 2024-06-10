/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
Документация TS SDK доступна на сайте https://tssdk.elma365.com.
**/
async function writeToDocApp(): Promise<void> {
   const serverApp = await Namespace.params.fields.additional_app.app.search().first();
   if (!!serverApp) {
      const knownDocuments = serverApp.data.massiv_izvestnykh_dokumentov ? JSON.parse(serverApp.data.massiv_izvestnykh_dokumentov) : [];
      knownDocuments.push(Context.data.document_id);
      serverApp.data.massiv_izvestnykh_dokumentov = JSON.stringify(knownDocuments);
      await serverApp.save();
   }
}

async function fillRequestData(): Promise<void> {
    Context.data.request_url = 'InformationRegister_EM_ДокументыСотрудников?$format=json'
    Context.data.iteration_number = 0
}

async function parseData(): Promise<void> {
    const response = JSON.parse(Context.data.response!);
    const documents = response.value.filter((item: any) => {
        return item["Документ"] === Context.data.document_id;
    })

    if (!!documents) {
        Context.data.document_found = true
    }

    Context.data.iteration_number = Context.data.iteration_number! + 1
}

async function getArrayBufferFromBase64(base64: string):Promise<ArrayBuffer> {
    var binary_string = atob(base64);
    var len = binary_string.length; 
    var bytes = new Uint8Array(len); 
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i); 
    } 
    return bytes.buffer; 
}

async function fillDocRequestData(): Promise<void> {
    Context.data.request_url = `InformationRegister_EM_ПечатныеФормыДокументов?$format=json`;
}

async function parseFiles(): Promise<void> {
    const response = JSON.parse(Context.data.response!);
    const documents = response.value.filter((item: any) => {
        return item["Документ"] === Context.data.document_id;
    })

    if (!!documents){
        const allFiles: FileItem[] = []
        for(let document of documents) {
            const fileArrayBuffer = await getArrayBufferFromBase64(document["ХранилищеПечатнойФормы_Base64Data"]);
            const newFile = await Context.fields.document_file.create(`${document["ПечатнаяФорма"]}.pdf`, fileArrayBuffer);
            allFiles.push(newFile)
        }
        Context.data.found_files = allFiles
    }
}
