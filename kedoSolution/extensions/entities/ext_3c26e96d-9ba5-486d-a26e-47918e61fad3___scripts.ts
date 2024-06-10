/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
Документация TS SDK доступна на сайте https://tssdk.elma365.com.
**/

const DATE_FORMAT_1C = "YYYY-MM-DD";
const DATETIME_FORMAT_1C = "YYYY-MM-DDTHH:mm:ss";

/** Создание файла */
async function createFile(name: string | undefined, extension: string, base64: string | undefined): Promise<FileItem | undefined> {
    if (!name) {
        name = "Без имени";
    }

    if (!base64) {
        return;
    }

    base64 = base64.replace(/\\r\\n/g, '');

    const array_buffer = getArrayBufferFromBase64(base64);

    if (array_buffer.byteLength == 0) {
        return;
    }

    const file = await System.files.createTemporary(`${name}.${extension}`, array_buffer);

    return file;
}

function getArrayBufferFromBase64(base64: string): ArrayBuffer {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}


type PayslipApp = ApplicationItem<Application$kedo$payslip_requests_1c$Data, Application$kedo$payslip_requests_1c$Params>;
type IntegrationApp = ApplicationItem<Application$kedo$awaiting_documents_table_1c$Data, Application$kedo$awaiting_documents_table_1c$Params>;
type PostedData1CApp = ApplicationItem<Application$kedo$posted_1c_data$Data, Application$kedo$posted_1c_data$Params>;

const PayslipStatuses = Namespace.params.fields.payslip_requests.app.fields.__status.variants;
const IntegrationAppStatuses = Namespace.params.fields.integration_app.app.fields.__status.variants;
const AccountingSystem = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants;

interface PayslipResponseData {
    id: string,
    startDate: string,
    endDate: string,
    employeeId: string,
}

interface PayslipRequestData {
    Type: string,
    BinaryData?: string,
    id: string,
}

interface PayslipResponse {
    success: true,
    data?: PayslipResponseData[],
}

interface PayslipRequest {
    success: boolean,
    data?: PayslipRequestData[],
}

interface IntegrationAppRequestData {
    Array: {
        result: boolean,
        guid_Elma: string,
        guid_1c: string,
        employeeIds: string[],
        personIds: string[],
        documentType: string,
        docNumber: string,
        docDate: string,
        objectData: any,
        print_forms: PrintForm[],
    }[]
}

interface PrintForm {
    PrintFormID: string,
    PrintFormName: string,
    Data: {
        type: string,
        data: string,
    },
    Signature: Signature,
    ELMASignatory: string,
}

interface Signature {
    "Подпись": string,
    "УстановившийПодпись": {
        "Представление": string,
        "Идентификатор": string,
    },
    "Комментарий"?: string,
    "ИмяФайлаПодписи"?: string,
    "ДатаПодписи": string,
    "ДатаПроверкиПодписи": string,
    "ПодписьВерна": boolean,
    "Сертификат": string,
    "Отпечаток": string,
    "КомуВыданСертификат": string,
    "ТипПодписи": string,
    "СрокДействияПоследнейМеткиВремени"?: string,
    "ДатаПодписиИзМетки"?: string,
    "НеподтвержденнаяДатаПодписи": string,
    "РасширениеФайлаПодписи": string,
}

interface SignData1C {
    sign: FileItem,
    stamp: string,
}

interface IntegrationAppResponseData {
    id: string,
    documentName: string,
    documentData: any,
    employeesId: string[],
    isCorrection: boolean,
    creationDate: string,
    addInfo?: string,
}

interface IntegrationAppResponse {
    success: boolean,
    data?: IntegrationAppResponseData[],
}

interface IntegrationAppRequest {
    success: boolean,
    data?: IntegrationAppRequestData,
}

interface PostedData1CRequest {
    type: string,
    data: string,
}


async function handlePayslip(req: HttpApiRequest): Promise<HttpResponse | void> {
    const method = req.method;

    switch (method) {
        case "GET": {
            return getPayslip(req);
        }

        case "POST": {
            return postPayslip(req);
        }

        default: {
            return new HttpResponse()
                .status(405)
                .content("Unsupoorted method");
        }
    }
}

async function getPayslip(req: HttpApiRequest): Promise<HttpResponse> {
    const response = new HttpResponse();

    try {
        // Вернуть после доработок по разным базам ЗУП. 
        // const base_1c = req.query?.sourceName;
        const base_1c = undefined;
        const size = req.query && req.query.pageSize && !Number.isNaN(req.query.pageSize) ? Number(req.query.pageSize) : 10;

        const payslip_requests = await Namespace.params.fields.payslip_requests.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__status.eq(PayslipStatuses.ready),
                f.start_date.neq(null),
                f.end_date.neq(null),
                f.personal_id.neq(null),
                // Вернуть после доработок по разным базам ЗУП. 
                //f.base_1c_name.eq(base_1c)
            ))
            .size(size)
            .all();

        const payslip_response = {
            success: true,
            data: payslip_requests.map(payslip => {
                return <PayslipResponseData>{
                    id: payslip.data.__id,
                    startDate: payslip.data.start_date?.format(DATE_FORMAT_1C) ?? "",
                    endDate: payslip.data.end_date?.format(DATE_FORMAT_1C) ?? "",
                    employeeId: payslip.data.personal_id ?? "",
                }
            })
        };

        response
            .status(200)
            .content("application/json")
            .json(payslip_response);

    } catch (error) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            });
    }

    return response;
}

async function postPayslip(req: HttpApiRequest): Promise<HttpResponse> {
    const response = new HttpResponse();

    try {
        // Вернуть после доработок по разным базам ЗУП. 
        // const base_1c = req.query?.sourceName;
        const base_1c = undefined;

        const body = req.body?.toString();
        const request: PayslipRequest = body ? JSON.parse(body) : undefined;

        if (!request) {
            throw new Error("Payslip request is undefined");
        }

        const payslip_ids = (request.data ?? []).map(f => f.id);

        const payslips = await Namespace.params.fields.payslip_requests.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.in(payslip_ids)
            ))
            .size(payslip_ids.length)
            .all();

        let promises: Promise<void>[] = [];

        for (const payslip_request of (request.data ?? [])) {
            const
                guid_elma = payslip_request.id,
                print_form_type = payslip_request.Type,
                binary_data = payslip_request.BinaryData;

            const payslip = payslips.find(f => f.data.__id === guid_elma);

            if (!payslip) {
                continue;
            }

            promises.push((async () => {
                const payslip_file = await createFile(`Расчетный лист`, print_form_type, binary_data);

                if (!payslip_file) {
                    return;
                }

                payslip.data.print_forms = [payslip_file];

                await payslip.save();
                await payslip.setStatus(PayslipStatuses.payslip_ready);

            })());

            if (promises.length > 10) {
                await Promise.all(promises);
                promises = [];
            }
        }

        response.status(201);
    } catch (error) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            });
    }

    return response;
}

async function handleIntegrationApp(req: HttpApiRequest): Promise<HttpResponse | void> {
    const method = req.method;

    switch (method) {
        case "GET": {
            return getIntegrationApps(req);
        }

        case "POST": {
            return postIntegrationApps(req);
        }

        default: {
            return new HttpResponse()
                .status(405)
                .content("Unsupported method");
        }
    }
}

async function getIntegrationApps(req: HttpApiRequest): Promise<HttpResponse> {
    const response = new HttpResponse();

    try {
        // Вернуть после доработок по разным базам ЗУП.
        // const base_1c = req.query?.sourceName;
        const base1c = undefined;

        const integration_apps = await Namespace.params.fields.integration_app.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__status.eq(IntegrationAppStatuses.ready),
                f.accounting_systems.eq(AccountingSystem.zup_1c),
                f.document_creation_data.neq(null),
            ))
            .size(100)
            .all();

        const integration_apps_response: IntegrationAppResponse = {
            success: true,
            data: integration_apps.map(integration_app => {
                return {
                    id: integration_app.data.__id,
                    documentName: integration_app.data.document_odata_name ?? "",
                    documentData: integration_app.data.document_creation_data ? JSON.parse(integration_app.data.document_creation_data) : {},
                    employeesId: integration_app.data.personal_guid_1c ? JSON.parse(integration_app.data.personal_guid_1c) : [],
                    isCorrection: !!integration_app.data.isCorrection,
                    creationDate: integration_app.data.__createdAt.format(DATETIME_FORMAT_1C),
                    addInfo: integration_app.data.additional_info ?? "",
                }
            })
        };

        response
            .status(200)
            .content('application/json')
            .json(integration_apps_response)
    } catch (error) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            });
    }

    return response;
}

async function postIntegrationApps(req: HttpApiRequest): Promise<HttpResponse> {
    const response = new HttpResponse();

    try {
        // Вернуть после доработок по разным базам ЗУП. 
        // const base_1c = req.query?.sourceName;
        const base_1c = undefined;

        const body = req.body?.toString();
        const request: IntegrationAppRequest = body ? JSON.parse(body) : undefined;

        if (!request) {
            throw new Error("Integration app request is undefined");
        }

        const documents = request.data?.Array ?? [];

        let promises: Promise<void>[] = [];

        const integration_app_ids = documents
            .filter(f => f.guid_Elma != undefined)
            .map(f => f.guid_Elma);

        const integration_apps = await Namespace.params.fields.integration_app.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.in(integration_app_ids)
            ))
            .size(integration_app_ids.length)
            .all();

        for (const document of documents) {
            let integration_app: IntegrationApp | undefined;

            if (document.guid_Elma) {
                integration_app = integration_apps.find(f => f.id == document.guid_Elma);

                if (!integration_app) {
                    throw new Error(`Не удалось найти приложение интеграции с ID = ${document.guid_Elma}`)
                }

                integration_app.data.processed_elma = false;
                integration_app.data.update_time = new Datetime();
                integration_app.data.document_number = document.docNumber;
                integration_app.data.document_date = document.docDate ? new Datetime(document.docDate, DATETIME_FORMAT_1C) : undefined;
                integration_app.data.document_1c_data = document.objectData;
            } else {
                integration_app = Namespace.params.fields.integration_app.app.create();

                integration_app.data.__name = document.documentType.split("_")[1];
                integration_app.data.accounting_systems = AccountingSystem.zup_1c;
                integration_app.data.document_odata_name = document.documentType
                integration_app.data.document_number = document.docNumber;
                integration_app.data.document_date = document.docDate ? new Datetime(document.docDate, DATETIME_FORMAT_1C) : undefined;
                integration_app.data.document_1c_data = document.objectData;
                integration_app.data.personal_guid_1c = JSON.stringify(document.personIds)
                integration_app.data.id_1c = JSON.stringify(document.employeeIds);
                integration_app.data.is_external = true;
                integration_app.data.processed_elma = false;
                integration_app.data.update_time = new Datetime();

                if (base_1c && !Array.isArray(base_1c)) {
                    integration_app.data.base_1c_name = base_1c;
                }
            }

            const print_forms_table = integration_app.data.print_forms_table ?? integration_app.fields.print_forms_table.create();

            if (Array.isArray(document.print_forms) && document.print_forms.length > 0) {
                for (const print_form of document.print_forms) {
                    const file = await createFile(print_form.PrintFormName, print_form.Data.type, print_form.Data.data);

                    if (!file) {
                        continue;
                    }

                    let row = print_forms_table.find(f => f.id_1c === print_form.PrintFormID);
                    if (!row) row = print_forms_table.insert();

                    row.print_form = file;
                    row.id_1c = print_form.PrintFormID;

                    if (print_form.Signature) {
                        const sign_data = await handleSignature(print_form.Signature);

                        if (sign_data) {
                            row.sign_file = sign_data.sign;
                            row.stamp = sign_data.stamp;
                            row.signatory_id_1c = print_form.ELMASignatory;
                        }
                    }
                }
            }

            promises.push(integration_app.save());

            if (promises.length > 10) {
                await Promise.all(promises);
                promises = [];
            }
        }

        await Promise.all(promises);

        response.status(201);

    } catch (error) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            });
    }

    return response;
}

async function handleSignature(signature: Signature): Promise<SignData1C | undefined> {
    if (!signature["Подпись"]) return;

    const sign_file = await createFile(signature["ИмяФайлаПодписи"], signature["РасширениеФайлаПодписи"], signature["Подпись"]);

    if (!sign_file) {
        return;
    }

    return {
        sign: sign_file,
        stamp: signature["Отпечаток"],
    }
}

async function handleDocumentsStatus(req: FetchRequest): Promise<HttpResponse | void> {
    const method = req.method;

    switch (method) {
        case "GET": {
            return getDocumentsStatus(req);
        }

        default: {
            return new HttpResponse()
                .status(405)
                .content("Unsupported method");
        }
    }
}

async function getDocumentsStatus(req: FetchRequest): Promise<HttpResponse> {
    const response = new HttpResponse();

    try {
        const base_1c = req.query?.sourceName;

        const integration_apps = await Namespace.params.fields.integration_app.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.status_1c.neq(null),
                f.doc_id_1c.neq(null),
                // f.base_1c_name.eq(base_1c)
            ))
            .size(1000)
            .all();

        const integration_apps_response = {
            success: true,
            array: integration_apps.map(integration_app => {
                return {
                    DocId: integration_app.data.doc_id_1c,
                    StateId: integration_app.data.status_1c,
                }
            }),
        };

        response
            .status(201)
            .content('application/json')
            .json(integration_apps_response);
    } catch (error) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
            })
    }

    return response;
}

async function handleTableData(req: FetchRequest): Promise<HttpResponse | void> {
    const method = req.method;

    switch (method) {
        case "POST": {
            return postTableData(req);
        }

        default: {
            return new HttpResponse()
                .status(405)
                .content("Unsupported method");
        }
    }
}

async function postTableData(req: FetchRequest): Promise<HttpResponse> {
    const response = new HttpResponse();

    try {
        const base_1c = req.query?.sourceName;
        const personal_guid = req.query?.guid;

        const body = req.body?.toString();
        const request: PostedData1CRequest = body ? JSON.parse(body) : undefined;

        if (!request) {
            throw new Error("Request body is undefined");
        }

        const posted_data: PostedData1CApp = Namespace.params.fields.data_1c.app.create();

        posted_data.data.table_name = request.type;
        posted_data.data.table_data = JSON.stringify(request.data);

        if (base_1c && !Array.isArray(base_1c)) {
            posted_data.data.base_1c_name = base_1c;
        }

        if (personal_guid) {
            const guid = Array.isArray(personal_guid) ? personal_guid[0] : personal_guid;
            posted_data.data.last_action_author = guid;
        }

        await posted_data.save();

        response
            .status(201)
            .json({
                success: true
            });

    } catch (error) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            });
    }

    return response;
}

async function handleCheckEmployee(req: HttpApiRequest): Promise<HttpResponse | void> {
    const method = req.method;

    switch (method) {
        case "GET": {
            return checkEmployee(req);
        }

        default: {
            return new HttpResponse()
                .status(405)
                .content("Unsupported method");
        }
    }
}


async function checkEmployee(req: HttpApiRequest): Promise<HttpResponse> {
    const response = new HttpResponse();
    
    // Узнать необходимость этого метода
    try {
        // const personal_guid = req.query?.guid;
        // const base1c = req.query?.sourceName;

        // if (!personal_guid) {
        //     response
        //         .status(400)
        //         .content("No required parameters: guid");
        // } else {
        //     const guid = Array.isArray(personal_guid) ? personal_guid[0] : personal_guid;
        //     const staff = await 
        // }

        // if (!!personal_guid) {
        //     const guid = Array.isArray(personal_guid) ? personal_guid[0] : personal_guid
        //     let employee: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params> | undefined
        //     if (base1c && !Array.isArray(base1c)) {
        //         employee = await Namespace.params.fields.employee_app.app.search()
        //             .where((f, g) => g.and(
        //                 f.__deletedAt.eq(null),
        //                 f.individual_id_1c.eq(guid),
        //                 f.base_1c_name.eq(base1c)
        //             ))
        //             .first()
        //     } else {
        //         employee = await Namespace.params.fields.employee_app.app.search()
        //             .where((f, g) => g.and(
        //                 f.__deletedAt.eq(null),
        //                 f.individual_id_1c.eq(guid)
        //             ))
        //             .first()
        //     }
        //     response
        //         .status(200)
        //         .set('Content-Type', 'application/json')
        //         .json({
        //             employeeExists: !!employee
        //         })
        // } else {
        //     response.status(400)
        //         .content("No required parameters: guid")
        //     return response
        // }

        return response.status(400);

    } catch (error) {
        response
            .status(500)
            .set('Content-Type', 'application/json')
            .json({
                success: false,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
            });
    }

    return response;
}
