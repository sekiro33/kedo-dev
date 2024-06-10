// /**
// Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
// Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
// Документация TS SDK доступна на сайте https://tssdk.elma365.com.
// **/

enum InfoType {
    ORGANIZATION = "organization",
    USER = "user",
};

//Интерфейс ответа от контура. Ключ - ид документа в нашей системе, значение - b64 с файлом для прикрепления внутри.
interface IKonturDocsResponse {
    [key: string]: string
}

async function getAwaitingTable(req: FetchRequest): Promise<HttpResponse | void> {
    const method = req.method
    if (method === "GET") {
        return await handleGetAwaitingTable(req)
    } else if (method === "POST") {
        return await handlePostAwaitingTable(req)
    } else {
        const response = new HttpResponse()
        response.status(405)
            .content("Unsupported method")
        return response
    }
}

async function handlePostAwaitingTable(req: FetchRequest): Promise<HttpResponse | void> {
    const response = new HttpResponse()

    const personalGuid = req.query?.guid
    const base1c = req.query?.sourceName

    try {
        const body = req.body!.toString()
        const jsonBody = JSON.parse(body)

        await fetch(`https://webhook.site/cf39975e-ad34-4715-b7e6-b1901f6bc196`, {
            method: "POST",
            body: JSON.stringify(jsonBody),
        })

        const jsonBodyArray = jsonBody["Array"]
        const receivedStatus = Namespace.params.fields.awaiting_docs_table_1c.app.fields.__status.variants.received

        for (let i = 0; i < jsonBodyArray.length; i++) {
            let docRecieved: boolean = false
            let targetDoc: ApplicationItem<Application$kedo$awaiting_documents_table_1c$Data, Application$kedo$awaiting_documents_table_1c$Params> | undefined

            const
                result = jsonBodyArray[i]["result"],
                guid_Elma = jsonBodyArray[i]["guid_Elma"],
                guid_1c = jsonBodyArray[i]["guid_1c"],
                personal_guid_1c = jsonBodyArray[i]["personIds"],
                error_description = jsonBodyArray[i]["error_description"],
                print_forms = jsonBodyArray[i]["print_forms"],
                docType = jsonBodyArray[i]["documentType"],
                employees = jsonBodyArray[i]["employeeIds"],
                docNumber = jsonBodyArray[i]["docNumber"],
                docDate = jsonBodyArray[i]["docDate"],
                objectData = JSON.stringify(jsonBodyArray[i]["objectData"])

            if (guid_Elma) {
                targetDoc = await Namespace.params.fields.awaiting_docs_table_1c.app.search()
                    .where((f, g) => g.and(
                        f.__deletedAt.eq(null),
                        f.__id.eq(guid_Elma)
                    )).first()
                if (targetDoc) {
                    targetDoc.data.processed_elma = false;
                    targetDoc.data.update_time = new Datetime();
                    targetDoc.data.document_number = docNumber;
                    targetDoc.data.document_date = docDate ? new Datetime(docDate, "YYYY-MM-DDTHH:mm:ss") : undefined;
                    targetDoc.data.document_1c_data = objectData;
                }
            } else {
                targetDoc = Namespace.params.fields.awaiting_docs_table_1c.app.create()
                const elmaAccounting = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c
                targetDoc.data.__name = docType.split("_")[1]
                if (base1c && !Array.isArray(base1c)) {
                    targetDoc.data.base_1c_name = base1c
                }
                targetDoc.data.accounting_systems = elmaAccounting
                targetDoc.data.document_odata_name = docType
                targetDoc.data.document_number = docNumber;
                targetDoc.data.document_date = docDate ? new Datetime(docDate, "YYYY-MM-DDTHH:mm:ss") : undefined;
                targetDoc.data.document_1c_data = objectData;
                targetDoc.data.personal_guid_1c = JSON.stringify(personal_guid_1c)
                targetDoc.data.id_1c = JSON.stringify(employees);
                targetDoc.data.is_external = true;
                targetDoc.data.processed_elma = false;
                targetDoc.data.update_time = new Datetime();
            }

            if (!targetDoc) {
                return bodyError(response, `Couldn't find element with passed guid "${guid_Elma}"`, 500)
            }

            if (Array.isArray(print_forms)) {
                const files: FileItem[] = []
                const fileTypes: string[] = []

                const isSigned = print_forms[0]?.Data["ПодписьВерна"]
                targetDoc.data.is_signed_1c = !!isSigned

                const print_forms_table = targetDoc.data.print_forms_table!;

                for (let i = 0; i < print_forms.length; i++) {
                    const item = print_forms[i];
                    const fileExtension = item.Data.type;
                    const fileName = item.PrintFormName;
                    const fileString = item.Data.data.replace(/\r\n/g, '');//.replace(/\\r\\n/g, '')
                    const fileArrayBuffer = await getArrayBufferFromBase64(fileString);
                    const newFile = await targetDoc.fields.print_forms.create(`${fileName}.${fileExtension.toLowerCase()}`, fileArrayBuffer)

                    let row = print_forms_table.find((f: any) => f.id_1c == item.PrintFormID);
                    if (!row) row = print_forms_table.insert();

                    row.print_form = newFile;
                    row.id_1c = item.PrintFormID;

                    if (item["Signature"]) {
                        const sign_data = await handleSignature(item["Signature"]);

                        if (sign_data) {
                            row.sign_file = sign_data.sign;
                            row.stamp = sign_data.stamp;
                            row.signatory_id_1c = item["ELMASignatory"];
                        }
                    }

                    files.push(newFile)
                    fileTypes.push(item.PrintFormID)
                }
                // логика по созданию элемента приложения при смене статуса, временно забракована
                // for (let file of files) {
                //     try {
                //         let externalGuid = JSON.parse(targetDoc.data.personal_guid_1c)[0];
                //         if (!externalGuid) {
                //             continue;
                //         };
                //         let newDoc = Namespace.params.fields.docs_1c.app.create();
                //         newDoc.data.__file = file;
                //         newDoc.data.staff_1c_id = externalGuid;

                //         await newDoc.save();
                //     } catch (e){
                //         response
                //             .status(500)
                //             .set('Content-Type', 'application/json')
                //             .json({
                //                 success: false,
                //                 error: {
                //                     name: e.name,
                //                     message: e.message
                //                 }
                //             })
                //         break;
                //     }
                // }
                targetDoc.data.print_forms = files;
                targetDoc.data.print_forms_id = JSON.stringify(fileTypes)
            }
            if (!!personalGuid) {
                const guid = Array.isArray(personalGuid) ? personalGuid[0] : personalGuid
                targetDoc.data.last_action_author = guid
            }
            if (typeof result === "boolean") {
                if (result === true) {
                    docRecieved = true
                    targetDoc.data.id_document_created_1c = true;
                    targetDoc.data.doc_id_1c = guid_1c;
                } else {
                    docRecieved = false
                    targetDoc.data.id_document_created_1c = false
                    targetDoc.data.error = error_description;
                }
            } else {
                docRecieved = false
            }

            await targetDoc.save()
            if (docRecieved) {
                await targetDoc.setStatus(receivedStatus)
            }
        }

        response.status(201)


    } catch (e: any) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: e.name,
                    message: e.message,
                    stack: e.stack,
                }
            })
    }
    return response
}

interface ISignature {
    "Подпись": string,
    "Отпечаток": string,
    "РасширениеФайлаПодписи" : string,
}

async function handleSignature(signature: ISignature): Promise<{ sign: FileItem, stamp: string } | undefined> {
    if (!signature["Подпись"]) return;

    const sign_base64 = signature["Подпись"].replace(/\r\n/g, '');
    const sign_file = await System.files.createTemporary(`sign.${signature["РасширениеФайлаПодписи"]}`, base64ToArrayBuffer(sign_base64));

    return {
        sign: sign_file,
        stamp: signature["Отпечаток"]
    };
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function str2ab(str: string): ArrayBuffer {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function bodyError(response: HttpResponse, message: string, status: number): HttpResponse {
    return response.status(status).content(message)
}

async function handleGetAwaitingTable(req: FetchRequest): Promise<HttpResponse | void> {
    const response = new HttpResponse()
    const personalGuid = req.query?.guid
    const base1c = undefined//req.query?.sourceName
    try {
        const readyStatus = Namespace.params.fields.awaiting_docs_table_1c.app.fields.__status.variants.ready
        const sentStatus = Namespace.params.fields.awaiting_docs_table_1c.app.fields.__status.variants.sent
        const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c
        let awaitingDocs: ApplicationItem<Application$kedo$awaiting_documents_table_1c$Data, Application$kedo$awaiting_documents_table_1c$Params>[]

        if (!base1c || Array.isArray(base1c)) {
            awaitingDocs = await Namespace.params.fields.awaiting_docs_table_1c.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null)
                )).size(10000).all()
        } else {
            awaitingDocs = await Namespace.params.fields.awaiting_docs_table_1c.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.base_1c_name.eq(base1c)
                )).size(10000).all()
        }

        awaitingDocs = awaitingDocs.filter(item => {
            let result = true
            if (!!item.data.accounting_systems && !!item.data.document_creation_data) {
                result = item.data.accounting_systems.code === accounting1c.code
            }
            return result && item.data.__status!.name === readyStatus.name
        })


        const resultJSON = {
            success: true,
            data: awaitingDocs.map(item => {
                return {
                    id: item.data.__id,
                    documentName: item.data.document_odata_name,
                    documentData: JSON.parse(item.data.document_creation_data!),
                    employeesId: JSON.parse(item.data.personal_guid_1c!),
                    isCorrection: !!item.data.isCorrection,
                    creationDate: item.data.__createdAt.format('YYYY-MM-DDTHH:mm:ss'),
                    addInfo: item.data.additional_info ?? "",
                }
            })
        }

        response
            .status(200)
            .content('application/json')
            .json(resultJSON)

        // for(let i = 0; i < awaitingDocs.length; i++) {
        //     await awaitingDocs[i].setStatus(sentStatus)
        // }
    } catch (e: any) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: e.name,
                    message: e.message
                }
            })
    }
    return response
}

async function get_table_data(req: FetchRequest): Promise<HttpResponse | void> {
    const method = req.method

    if (method !== "POST") {
        const response = new HttpResponse()
        response.status(405)
            .content("Unsupported method")
        return response
    }

    const response = new HttpResponse()
    try {
        const personalGuid = req.query?.guid
        const base1c = req.query?.sourceName

        const body = req.body!.toString()
        const jsonBody = JSON.parse(body)

        if (!jsonBody["type"] || !jsonBody["data"]) {
            response.status(400)
                .content("No required body fields. {\"type\", \"data\"} body expected")
            return response
        }

        const newApp = Namespace.params.fields.posted_data.app.create()

        newApp.data.table_name = jsonBody["type"]
        newApp.data.table_data = JSON.stringify(jsonBody["data"])


        if (base1c && !Array.isArray(base1c)) {
            newApp.data.base_1c_name = base1c
        }


        if (!!personalGuid) {
            const guid = Array.isArray(personalGuid) ? personalGuid[0] : personalGuid
            newApp.data.last_action_author = guid
        }

        //newApp.data.last_action_author = 
        await newApp.save()

        response
            .status(201)
            .json({
                success: true
            })
    } catch (e: any) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: e.name,
                    message: e.message,
                    stackTrace: e.stack
                }
            })
    }

    return response
}



async function getArrayBufferFromBase64(base64: string): Promise<ArrayBuffer> {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

async function getting_docs_kontur(req: FetchRequest): Promise<HttpResponse | void> {
    const method = req.method
    if (method === "GET") {
        return await getAwaitingTableForKontur(req)
    } else if (method === "POST") {
        return await handlePostAwaitingTable(req)
    } else {
        const response = new HttpResponse()
        response.status(405)
            .content("Unsupported method")
        return response
    }



}

async function getAwaitingTableForKontur(req: FetchRequest): Promise<HttpResponse | void> {
    const response = new HttpResponse()
    try {
        const awaitingDocs = await Namespace.params.fields.awaiting_docs_table_1c.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.accounting_systems.eq(Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.kontur_gov), //Документы Контура
                f.__status.eq(Namespace.params.fields.awaiting_docs_table_1c.app.fields.__status.variants.ready)                           //Ожидающие отправки
            )).all()
        const resultJSON = {
            success: true,
            data: awaitingDocs.filter(filterItem => {
                return !!filterItem.data.document_creation_data
            }).map(item => {
                return {
                    id: item.data.__id,
                    documentName: item.data.document_odata_name,
                    documentData: JSON.parse(item.data.document_creation_data!),
                    employeesId: JSON.parse(item.data.personal_guid_1c!)
                }
            })
        }

        response
            .status(200)
            .content('application/json')
            .json(resultJSON)

        changeDocsStatusToSent(awaitingDocs);
    } catch (e: any) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: e.name,
                    message: e.message
                }
            })
    }
    return response
}

async function handleKonturDocsResponse(req: FetchRequest) {
    const response = new HttpResponse()
    try {
        if (!req.body) {
            throw new Error('No or empty body provided')
        }
        const parsedJSON: IKonturDocsResponse = JSON.parse(req.body as string);
        const parsedJSONKeys = Object.keys(parsedJSON);
        for (let docID of parsedJSONKeys) {
            const b64doc = parsedJSON[docID];
            let elmaDoc = await Namespace.params.fields.awaiting_docs_table_1c.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.__id.eq(docID),
                    f.accounting_systems.eq(Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.kontur_gov), //Документы Контура
                    f.__status.eq(Namespace.params.fields.awaiting_docs_table_1c.app.fields.__status.variants.sent)                           //Отправленные
                )).first();
            if (elmaDoc) {
                const file = await elmaDoc.fields.file.create('Название файла', await getArrayBufferFromBase64(b64doc))
                elmaDoc.data.file = file;
                await elmaDoc.save();
                await elmaDoc.setStatus(elmaDoc.fields.__status.variants.received);
            }
        }
    } catch (e: any) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: e.name,
                    message: e.message
                }
            })
    }
    return response
}

/**
 * Асинхронно изменяет статус указанных документов на "Отправлено"
 */
async function changeDocsStatusToSent(awaitingDocs: ApplicationItem<Application$kedo$awaiting_documents_table_1c$Data, Application$kedo$awaiting_documents_table_1c$Params>[]) {
    let promises: Promise<boolean>[] = [];
    const PROMISE_STACK_SIZE = 5;
    for (let awaitingDoc of awaitingDocs) {
        promises.push(awaitingDoc.setStatus(awaitingDoc.fields.__status.variants.sent));
        if (promises.length >= PROMISE_STACK_SIZE) {
            await Promise.all(promises);
            promises = [];
        }
    }
    await Promise.all(promises);
}


async function checkEmployeeExists(req: FetchRequest): Promise<HttpResponse | void> {
    const response = new HttpResponse()
    try {
        const personalGuid = req.query?.guid
        const base1c = req.query?.sourceName
        if (!!personalGuid) {
            const guid = Array.isArray(personalGuid) ? personalGuid[0] : personalGuid
            let employee: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params> | undefined
            if (base1c && !Array.isArray(base1c)) {
                employee = await Namespace.params.fields.employee_app.app.search()
                    .where((f, g) => g.and(
                        f.__deletedAt.eq(null),
                        f.individual_id_1c.eq(guid),
                        f.base_1c_name.eq(base1c)
                    ))
                    .first()
            } else {
                employee = await Namespace.params.fields.employee_app.app.search()
                    .where((f, g) => g.and(
                        f.__deletedAt.eq(null),
                        f.individual_id_1c.eq(guid)
                    ))
                    .first()
            }
            response
                .status(200)
                .set('Content-Type', 'application/json')
                .json({
                    employeeExists: !!employee
                })
        } else {
            response.status(400)
                .content("No required parameters: guid")
            return response
        }
    } catch (e: any) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: e.name,
                    message: e.message
                }
            })
    }
    return response
}

async function handleGetAwaitingTableStatuses(req: FetchRequest): Promise<HttpResponse | void> {
    const response = new HttpResponse()
    try {
        const base1c = req.query?.sourceName
        let awaitingDocs: ApplicationItem<Application$kedo$awaiting_documents_table_1c$Data, Application$kedo$awaiting_documents_table_1c$Params>[]
        if (base1c && !Array.isArray(base1c)) {
            awaitingDocs = await Namespace.params.fields.awaiting_docs_table_1c.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.status_1c.neq(null),
                    f.doc_id_1c.neq(null),
                    f.base_1c_name.eq(base1c)
                )).all()
        } else {
            awaitingDocs = await Namespace.params.fields.awaiting_docs_table_1c.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.status_1c.neq(null),
                    f.doc_id_1c.neq(null)
                )).all()
        }
        const parsedDocs = awaitingDocs.map(item => {
            return {
                DocId: item.data.doc_id_1c,
                StateId: item.data.status_1c
            }
        })

        const resultJSON = {
            success: true,
            array: parsedDocs
        }

        response
            .status(200)
            .content('application/json')
            .json(resultJSON)


    } catch (e: any) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: e.name,
                    message: e.message
                }
            })
    }
    return response


}

async function getDocsStatuses(req: FetchRequest): Promise<HttpResponse | void> {
    const method = req.method
    if (method === "GET") {
        return await handleGetAwaitingTableStatuses(req)
    } else {
        const response = new HttpResponse()
        response.status(405)
            .content("Unsupported method")
        return response
    }
}

async function handlePayslip(req: FetchRequest): Promise<HttpResponse | void> {
    const method = req.method
    if (method === "GET") {
        return await getPayslip(req)
    } else if (method === "POST") {
        return await postPayslip(req)
    } else {
        const response = new HttpResponse()
        response.status(405)
            .content("Unsupported method")
        return response
    }
}

interface IPayslipRequestData {
    Type: string,
    BinaryData: string,
    id: string,
}

interface IPayslipRequest {
    success: boolean,
    data: IPayslipRequestData[],
}

type PayslipApp = ApplicationItem<Application$kedo$payslip_requests_1c$Data, Application$kedo$payslip_requests_1c$Params>

async function postPayslip(req: FetchRequest): Promise<HttpResponse | void> {
    const response = new HttpResponse()

    try {
        // Пока не реализовано.
        const base1c = undefined//req.query?.sourceName

        const body = req.body!.toString()
        const jsonBody: IPayslipRequest = JSON.parse(body)
        const recievedData = jsonBody.data;

        const sentStatus = Namespace.params.fields.payslip_app.app.fields.__status.variants.sent;
        const receivedStatus = Namespace.params.fields.payslip_app.app.fields.__status.variants.payslip_ready;

        let payslipApps: PayslipApp[] = [];

        const payslip_ids = recievedData.map(f => f.id);

        payslipApps = await Namespace.params.fields.payslip_app.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(payslip_ids),
            //f.__status.eq(sentStatus)
        )).size(1000).all();

        const handledApps: PayslipApp[] = [];

        for (const data of recievedData) {
            const
                guid_elma = data.id,
                printFormType = data.Type,
                binaryData = data.BinaryData;

            const payslip_app = payslipApps.find(f => f.data.__id === guid_elma);

            if (!payslip_app) {
                return bodyError(response, `Couldn't find element with passed guid "${guid_elma}"`, 500);
            }

            const files: FileItem[] = []
            const fileExtension = printFormType;
            const fileName = "Расчетный листок";
            const fileString = binaryData.replace(/\\r\\n/g, '')
            const fileArrayBuffer = await getArrayBufferFromBase64(fileString);

            if (fileArrayBuffer.byteLength == 0) {
                payslip_app.data.print_forms = undefined;
            } else {
                const newFile = await payslip_app.fields.print_forms.create(`${fileName}.${fileExtension.toLowerCase()}`, fileArrayBuffer)
                files.push(newFile)
                payslip_app.data.print_forms = files;
                payslip_app.data.base_1c_name = `Запрос обработан ${new Datetime().format()}`;
            }

            handledApps.push(payslip_app);
        }

        const chunkSize = 100;

        for (let i = 0; i < handledApps.length; i += chunkSize) {
            const chunck = handledApps.slice(i, i + chunkSize);
            await Promise.all(chunck.map(f => f.setStatus(receivedStatus)));
            await Promise.all(chunck.map(f => f.save()));
        }

        response.status(201)

        // if (base1c && !Array.isArray(base1c)) {
        //     payslipApps = await Namespace.params.fields.payslip_app.app.search()
        //         .where((f, g) => g.and(
        //             f.__deletedAt.eq(null),
        //             f.__status.eq(sentStatus),
        //             f.base_1c_name.eq(base1c)
        //         ))
        //         .size(10000)
        //         .all();
        // } else {
        //     payslipApps = await Namespace.params.fields.payslip_app.app.search()
        //         .where((f, g) => g.and(
        //             f.__deletedAt.eq(null),
        //             f.__status.eq(sentStatus)
        //         ))
        //         .size(10000)
        //         .all();
        // }

        // for (let i = 0; i < recievedData.length; i++) {
        //     const
        //         guid_Elma = recievedData[i]["id"],
        //         formType = recievedData[i]["Type"],
        //         binaryData = recievedData[i]["BinaryData"]

        //     /*const targetDoc = await Namespace.params.fields.payslip_app.app.search()
        //         .where((f, g) => g.and(
        //             f.__deletedAt.eq(null),
        //             f.__id.eq(guid_Elma)
        //         )).first()*/

        //     const payslipApp = payslipApps.find(doc => doc.data.__id === guid_Elma);

        //     if (!payslipApp) {
        //         return bodyError(response, `Couldn't find element with passed guid "${guid_Elma}"`, 500)
        //     }

        //     const files: FileItem[] = []
        //     const fileExtension = formType;
        //     const fileName = "Расчетный листок";
        //     const fileString = binaryData.replace(/\\r\\n/g, '')
        //     const fileArrayBuffer = await getArrayBufferFromBase64(fileString);

        //     let isFileCreated = false
        //     if (fileArrayBuffer.byteLength > 0) {
        //         const newFile = await targetDoc.fields.print_forms.create(`${fileName}.${fileExtension.toLowerCase()}`, fileArrayBuffer)
        //         files.push(newFile)
        //         isFileCreated = true
        //     }

        //     targetDoc.data.print_forms = files

        //     if (isFileCreated) {
        //         docs.push(targetDoc);
        //     }

        //     //await targetDoc.save()
        //     //await targetDoc.setStatus(receivedStatus)
        // }
    } catch (e: any) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: e.name,
                    message: e.message
                }
            })
    }

    return response
}

async function getPayslip(req: FetchRequest): Promise<HttpResponse | void> {
    const response = new HttpResponse();

    try {
        //Вернуть после доработок по разным базам ЗУП. 
        //const base_1c = req.query?.sourceName;
        const base_1c = undefined;
        const page_size = req.query && req.query.pageSize && !Number.isNaN(req.query.pageSize) ? Number(req.query.pageSize) : 10;

        const readyStatus = Namespace.params.fields.payslip_app.app.fields.__status.variants.ready;
        let awaitingDocs: ApplicationItem<Application$kedo$payslip_requests_1c$Data, Application$kedo$payslip_requests_1c$Params>[];

        if (base_1c && !Array.isArray(base_1c)) {
            awaitingDocs = await Namespace.params.fields.payslip_app.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.__status.eq(readyStatus),
                    //f.base_1c_name.eq(base1c)
                ))
                .size(page_size)
                .all()
        } else {
            awaitingDocs = await Namespace.params.fields.payslip_app.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.__status.eq(readyStatus)
                ))
                .size(page_size)
                .all()
        }

        const resultJSON = {
            success: true,
            data: awaitingDocs.map(item => {
                return {
                    id: item.data.__id,
                    startDate: item.data.start_date?.format('YYYY-MM-DD'),
                    endDate: item.data.end_date?.format('YYYY-MM-DD'),
                    employeeId: item.data.personal_id
                }
            })
        }

        response
            .status(200)
            .content('application/json')
            .json(resultJSON);

    } catch (error: any) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: error.name,
                    message: error.message
                },
            })
    }

    return response;
}

async function change_hr_department_and_accounting(req: FetchRequest): Promise<HttpResponse | void> {
    if (!req.body) {
        return;
    };

    const orgId = JSON.parse(req.body as string).org_id;
    const accountingIds = JSON.parse(<string>req.body).accounting_ids || [];
    const hrIds = JSON.parse(<string>req.body).hr_ids || [];
    const specialIds = JSON.parse(<string>req.body).special_ids || [];
    const signatoriesIds = JSON.parse(<string>req.body).signatories_ids || [];
    const signatoriesCode = "0b7cab5e-31ef-4bd8-8f91-b5689111cf7a";
    const hrDepartmentCode = "abdecf4b-b6ba-419f-bac7-c1455d2a6159";
    const accountingCode = "dfede5be-5011-4ec9-b535-8c9ca3fc4d19";
    const specialAccessCode = "0798a43a-8ed9-4b30-8dfe-e16559fb7695";
    const allOrganizations = await Namespace.params.fields.org_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const hrDepartmentGroup = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq(hrDepartmentCode)
    )).first();
    const signatoriesGroup = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq(signatoriesCode)
    )).first();
    const accountingGroup = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq(accountingCode)
    )).first();
    const specialAccessGroup = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq(specialAccessCode)
    )).first();
    const allStaff = await Namespace.params.fields.employee_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null)
    )).size(10000).all();

    let allUids: string[] = [];

    try {
        const organizationHrs = await System.userGroups.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.namespace.eq("kedo"),
            f.__name.like("Отдел кадров"),
            f.description.eq(orgId)
        )).first();
        const organizationSignatories = await System.userGroups.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.namespace.eq("kedo"),
            f.__name.like("Подписанты"),
            f.description.eq(orgId)
        )).first();
        const organizationAccounting = await System.userGroups.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__name.like("Бухгалтерия"),
            f.description.eq(orgId),
            f.namespace.eq("kedo")
        )).first();
        const organizationSpecials = await System.userGroups.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__name.like("Ответственные за КЭДО"),
            f.description.eq(orgId),
            f.namespace.eq("kedo")
        )).first();

        const nonEmptySpecials = allOrganizations.filter(org => org.data.special_access_new && org.data.special_access_new.length > 0);
        allUids = [].concat.apply([], [].concat.apply(nonEmptySpecials.map(org => org.data.special_access_new!.map(staff => {
            const staffApp = allStaff.find(s => s.id === staff.id);
            if (staffApp && staffApp.data.ext_user) {
                return staffApp.data.ext_user.id
            };
        }))));
        if (allUids && allUids.length > 0) {
            allUids = allUids.filter(id => id);
        }
        if (specialIds) {
            allUids.push(...specialIds);
        };
        if (organizationSpecials && specialIds) {
            organizationSpecials.data.subOrgunitIds = [...specialIds];
            await organizationSpecials.save();
        };

        specialAccessGroup!.data.subOrgunitIds = allUids
        await specialAccessGroup!.save();
        const nonEmptySignatroies = allOrganizations.filter(org => org.data.signatories && org.data.signatories.length > 0);
        allUids = [].concat.apply([], [].concat.apply(nonEmptySignatroies.map(org => org.data.signatories!.map(staff => {
            const staffApp = allStaff.find(s => s.id === staff.id);
            if (staffApp && staffApp.data.ext_user) {
                return staffApp.data.ext_user.id
            };
        }))));
        if (allUids && allUids.length > 0) {
            allUids = allUids.filter(id => id);
        }
        if (signatoriesIds) {
            allUids.push(...signatoriesIds);
        };
        if (organizationSignatories && signatoriesIds) {
            organizationSignatories.data.subOrgunitIds = [...signatoriesIds];
            await organizationSignatories.save();
        };

        signatoriesGroup!.data.subOrgunitIds = allUids
        await signatoriesGroup!.save();

        const nonEmptyAccounting = allOrganizations.filter(org => org.data.accounting && org.data.accounting.length > 0);
        allUids = [].concat.apply([], [].concat.apply(nonEmptyAccounting.map(org => org.data.accounting!.map(staff => {
            const staffApp = allStaff.find(s => s.id === staff.id);
            if (staffApp && staffApp.data.ext_user) {
                return staffApp.data.ext_user.id;
            };
        }))));
        if (allUids && allUids.length > 0) {
            allUids = allUids.filter(id => id);
        };
        if (accountingIds) {
            allUids.push(...accountingIds);
        }
        if (organizationAccounting && accountingIds) {
            organizationAccounting.data.subOrgunitIds = [...accountingIds]
            await organizationAccounting.save();
        };

        accountingGroup!.data.subOrgunitIds = allUids;
        await accountingGroup!.save();

        const nonEmptyHr = allOrganizations.filter(org => org.data.hr_department && org.data.hr_department.length > 0);
        allUids = [].concat.apply([], [].concat.apply(nonEmptyHr.map(org => org.data.hr_department!.map(staff => {
            const staffApp = allStaff.find(s => s.id === staff.id);
            if (staffApp && staffApp.data.ext_user) {
                return staffApp.data.ext_user.id;
            };
        }))));
        if (allUids && allUids.length > 0) {
            allUids = allUids.filter(id => id);
        }

        if (hrIds) {
            allUids.push(...hrIds)
        }
        if (organizationHrs && hrIds) {
            organizationHrs.data.subOrgunitIds = [...hrIds]
            await organizationHrs.save();
        };

        hrDepartmentGroup!.data.subOrgunitIds = allUids;
        await hrDepartmentGroup!.save();
        await checkInnerUsers(hrDepartmentGroup!, accountingGroup!, specialAccessGroup!, orgId);
    } catch (err) {
        return;
    };
};

async function checkInnerUsers(hrGroup: UserGroupItem, accountingGroup: UserGroupItem, specialAccessGroup: UserGroupItem, orgId: string): Promise<void> {
    const org = await Namespace.params.fields.org_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(orgId)
    )).first()
    if (!org || org.data.access_settings_organization) {
        return;
    };

    const accessSettingsId = org.data.access_settings_organization!.id;
    const orgRights = await Namespace.params.fields.access_settings_organization_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(accessSettingsId)
    )).first();
    if (!orgRights) {
        return;
    };
    const innerUsersField = orgRights.data.inner_org_staff;
    if (!innerUsersField || innerUsersField.length < 1) {
        return;
    };

    const innerUsersRights = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(innerUsersField[0].code)
    )).first();
    if (!innerUsersRights) {
        return;
    };
    const innerUsersIds = innerUsersRights.data.subOrgunitIds;
    if (!innerUsersIds || innerUsersIds.length < 1) {
        return;
    };
    const groupsIds: string[] = [].concat.apply([], [accountingGroup.data.subOrgunitIds, hrGroup.data.subOrgunitIds]).filter((item: any) => item != null);
    if (groupsIds && groupsIds.length > 0) {
        const idsToDelete = innerUsersIds.filter(id => groupsIds.indexOf(id) != -1);
        for (let id of innerUsersRights!.data.subOrgunitIds!) {
            if (idsToDelete.indexOf(id) != -1) {
                delete innerUsersRights.data.subOrgunitIds![innerUsersRights.data.subOrgunitIds!.indexOf(id)];
            };
        };
        await innerUsersRights.save();
    };
};

interface IRelatedDocuments {
    namespace: string,
    code: string,
    documents: IDocument[],
}

interface IDocument {
    namespace: string,
    code: string,
    related_field_code: string,
}

const related_documents: IRelatedDocuments[] = [
    {
        "namespace": "business_trips",
        "code": "businesstrip_requests",
        "documents": [
            {
                "namespace": "business_trips",
                "code": "trip_requests",
                "related_field_code": "businesstrip_requests"
            },
            {
                "namespace": "business_trips",
                "code": "business_trip_consent",
                "related_field_code": "business_trip"
            },
            {
                "namespace": "business_trips",
                "code": "business_trip_change_service_note",
                "related_field_code": "business_trip"
            },
            {
                "namespace": "business_trips",
                "code": "service_note_accountable_funds",
                "related_field_code": "business_trip"
            },
            {
                "namespace": "business_trips",
                "code": "order_for_a_business_trip",
                "related_field_code": "business_trip"
            },
            {
                "namespace": "business_trips",
                "code": "avansovyi_otchet",
                "related_field_code": "businesstrip_requests"
            },
            {
                "namespace": "business_trips",
                "code": "service_assignments",
                "related_field_code": "businesstrip_requests"
            }
        ]
    },
    {
        "namespace": "time_tracking",
        "code": "overtime_work",
        "documents": [
            {
                "namespace": "time_tracking",
                "code": "overtime_requests",
                "related_field_code": "overtime_work"
            },
            {
                "namespace": "time_tracking",
                "code": "overtimeWorkOrders",
                "related_field_code": "overtime_work"
            },
            {
                "namespace": "time_tracking",
                "code": "overtimeWorkNotifications",
                "related_field_code": "overtime_work"
            },
            {
                "namespace": "time_tracking",
                "code": "overtimeWorkConsent",
                "related_field_code": "overtime_work"
            },
            {
                "namespace": "time_tracking",
                "code": "overtime_order",
                "related_field_code": "overtime_work"
            }
        ]
    },
    {
        "namespace": "absences",
        "code": "vacations",
        "documents": [
            {
                "namespace": "absences",
                "code": "vacation_docs",
                "related_field_code": "vacation"
            },
            {
                "namespace": "absences",
                "code": "vacation_orders",
                "related_field_code": "vacation"
            },
            {
                "namespace": "absences",
                "code": "memo_recall_vacation",
                "related_field_code": "vacation"
            },
            {
                "namespace": "absences",
                "code": "consent_recall_vacation",
                "related_field_code": "vacation"
            }
        ]
    },
    {
        "namespace": "kedo",
        "code": "staff",
        "documents": [
            {
                "namespace": "personnel_documents",
                "code": "application_for_financial_assistance",
                "related_field_code": "staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "benefit_application",
                "related_field_code": "staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "application_for_the_transfer_of_salary_to_the_current_account",
                "related_field_code": "staffstaff"
            },
            {
                "namespace": "personnel_documents",
                "code": "free_from",
                "related_field_code": "staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "certificate",
                "related_field_code": "staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "other_documents",
                "related_field_code": "staff"
            },
            {
                "namespace": "absences",
                "code": "vacation_docs",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "absences",
                "code": "vacation_orders",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "time_tracking",
                "code": "overtime_work",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "kedo",
                "code": "additional_agreement",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "employees_personal_data",
                "related_field_code": "staff"
            },
            {
                "namespace": "business_trips",
                "code": "trip_requests",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "business_trips",
                "code": "order_for_a_business_trip",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "combination",
                "related_field_code": "substitute"
            },
            {
                "namespace": "personnel_documents",
                "code": "combination_additional_agreement",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "letter_of_resignation",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "electronic_interaction_agreement",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "labor_contract",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "admission_order",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "information_about_labor_activity",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "job_application",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "additional_agreement_to_the_contract",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "consent_processing_personal_data",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "transfer_application",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "order_for_transfer",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "transfer_approve",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "additional_transfer_agreement",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "dismissal_app",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "letter_of_resignation",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "dismissal_order",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "recall_dismissal",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "category_assignment",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "application_category_assignment",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "employees_personal_data",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "passport_data_application",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "passport_data_change_order",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "child_personal_data_consent",
                "related_field_code": "staff"
            }
        ]
    }
]

async function fill_related_documents(req: HttpApiRequest): Promise<HttpResponse | void> {
    await Namespace.storage.setItem("related_documents", JSON.stringify(related_documents));

    return new HttpResponse()
        .status(201)
        .json({
            status: "success"
        });
}

async function getStaffSignInfo(req: HttpApiRequest): Promise<HttpResponse | void> {
    if (!req.body) {
        return;
    };

    const bodyJson = JSON.parse(<string>req.body);

    if (!bodyJson.p1) {
        return;
    };

    const infoType = bodyJson.p2;

    const userId = bodyJson.p1;
    const user = await System.users.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(userId)
    )).first();

    if (user) {
        const staff = await Namespace.params.fields.employee_app.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user)
        )).first();
        if (staff && staff.data.organization) {
            if (infoType === InfoType.USER) {
                return new HttpResponse(200).content(staff.data.__name);
            };
            const organization = await staff.data.organization.fetch();
            return new HttpResponse(200).content(organization.data.__name)
            // await fetch("https://webhook.site/724f38cf-219a-4db8-8284-4769e50a7ae4", {
            //     method: "POST",
            //     body: organization.data.__name
            // })
        }
    }
}
