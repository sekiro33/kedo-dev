type certificateInfo = {
    type: string,
    nonExportable: boolean
};

type docField = {
    type: string,
    value: string
};

type cspInfo = {
    type: string
};

type passportInfoData = {
    requisitesToAddOrUpdate: docField[]
};

type issueData = {
    certificateTemplateInfo: certificateInfo,
    subjectInfo: userData,
    cspInfo: cspInfo
};

type confirmIssueData = {
    operationToConfirm: string,
    parameters: {
        snilsNumber: string,
        birthDate: string
    }
};

type userData = {
    inn: string,
    lastname: string,
    firstname: string,
    middlename: string,
    email: string,
    phone: string,
    type: string
};

type fileData = {
    size: string,
    extension: string,
    fileBuffer: ArrayBuffer,
    name: string
};

type requestData = issueData | passportInfoData;
type errorKey = keyof typeof Context.fields.error_type.variants

const statusReference: Record<string, string> = {
    "unknown": "Неизвестен",
    "preparing": "Создана",
    "validating": "На проверке",
    "correction": "На исправлении",
    "approved": "Данные проверены",
    "releasing": "Выпуск сертификата",
    "released": "Выпущена"
};

const triggerWords = [
    "inn",
    "email",
    "firstname",
    "lastname",
    "middlename",
    "passport.number",
    "passport.series",
    "passport"
];

const readableErrors = {
    "inn": "ошибка в ИНН",
    "email": "ошибка в электронной почте",
    "firstname": "ошибка в имени, возможно использованы латинские символы",
    "lastname": "ошибка в фамилии, возможно использованы латинские символы",
    "middlename": "ошибка в отчестве, возможно использованы латинские символы",
    "passport.number": "ошибка в номере документа",
    "passport.series": "ошибка в серии документа",
    "passportexpired": "ошибка в дате выдачи паспорта",
    "filecorrupted": "файл паспорта повреждён"
};

const blankFileBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAMSURBVBhXY/j//z8ABf4C/qc1gYQAAAAASUVORK5CYII=";

const stableData = {
    certificateType: {
        type: "notQualified",
        nonExportable: false
    },
    personType: "naturalPerson",
    cspType: "asess"
};

let releaseStatementObj: passportInfoData = {
    requisitesToAddOrUpdate: []
};
let userDataObj: userData;
let certificateTemplateInfoObj: certificateInfo;
let cspInfoObj: cspInfo;
let issueDataObj: issueData;
let passportInfoObj: passportInfoData = {
    requisitesToAddOrUpdate: []
};
let releaseStatementInfo: passportInfoData = {
    requisitesToAddOrUpdate: []
};
let fileDataObj: fileData = {
    fileBuffer: new ArrayBuffer(0),
    size: "0",
    extension: "",
    name: ""
};

let confirmIssueDataObj: confirmIssueData = {
    operationToConfirm: "",
    parameters: {
        snilsNumber: "",
        birthDate: ""
    }
};

let dataObj: any;

function base64ToArrayBuffer(base64: string) {
    let binaryString = atob(base64);
    let bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    };
    return bytes.buffer;
};

class KonturLogger {
    data: string;
    error: string;
    baseUrl = Namespace.params.data.kontur_server_address;

    async logData(response: FetchResponse | undefined) {
        try {
            response = response!;
            let responseEndpoint = response.url.replace(`${this.baseUrl}/v1/issues`, "");
            let responseJson: any;
            let currentDoc = Context.data.current_doc;
            let requestId = Context.data.request_id!;
            let responseStatus: string = "";
            let fileName: string = "";
            let currentIssue: DigitalSign | undefined = undefined;
            let currentSignItem: ApplicationItem<Application$kedo$digital_signs_list$Data, any> | undefined;
            let issueId: string = "";
            let user = await Context.data.user!.fetch();
            let staff: any;
            let organizationName = "";
            staff = await Namespace.params.fields.staff_app.app.search().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(user)
            )).first();
            if (staff) {
                let organization = await staff!.data.organization!.fetch();
                organizationName = organization.data.__name;
                Context.data.organization_name = organizationName
            };


            switch (responseEndpoint) {
                case "":
                    responseJson = await response.json();
                    issueId = responseJson.id;

                    if (!Context.data.issue_created) {
                        let digitalSignItem = Namespace.params.fields.digital_signs_list.app.create()
                        let digitalSignItemExists = !!await Namespace.params.fields.digital_signs_list.app.search().where((f, g) => g.and(
                            f.__deletedAt.eq(null),
                            f.external_id.eq(issueId)
                        )).first();
                        if (!digitalSignItemExists) {
                            digitalSignItem.data.name = `${Context.data.surname} ${Context.data.name} ${Context.data.lastname || ""}`;
                            digitalSignItem.data.email = Context.data.email![0].email;
                            digitalSignItem.data.country = Context.data.country;
                            digitalSignItem.data.inn = Context.data.inn;
                            digitalSignItem.data.external_id = issueId;
                            digitalSignItem.data.user = user;
                            digitalSignItem.data.status = statusReference[<string>responseJson.status];
                            digitalSignItem.data.__name = `${Context.data.surname} ${Context.data.name} ${Context.data.lastname || ""} (${new Datetime(responseJson.createdAt).format("DD.MM.YY HH:MM:SS")})`;
                            digitalSignItem.data.organization = organizationName;
                            digitalSignItem.data.provider = 'Контур';
                            await digitalSignItem.save();
                        }
                        // let elmaKonturProvider = await System.signs.providers.search().where(f => f.code.eq("Kontur")).first();
                        let elmaKonturProvider = await System.signs.providers.search().where(f => f.code.eq("KonturNew")).first();
                        if (!elmaKonturProvider) {
                            elmaKonturProvider = await System.signs.providers.createDraft("KonturNew");
                        }
                        if (!elmaKonturProvider) {
                            this.logError("sdk_error", undefined, "Не удалось найти провайдера Контур");
                        };
                        let newIssue = await System.signs.digitalSigns.createDraft(issueId, elmaKonturProvider!);
                        Context.data.issue_created = true;
                    };
                    currentIssue = await System.signs.digitalSigns.search().where((f, g) => g.and(
                        f.issueID.eq(issueId),
                        //@ts-ignore
                        // f.certStatus.neq(<DigitalSignRequestStatus>"error"),
                        //@ts-ignore
                        // f.certStatus.neq(undefined)
                    )).first();
                    currentSignItem = await Namespace.params.fields.digital_signs_list.app.search().where((f, g) => g.and(
                        f.__deletedAt.eq(null),
                        f.external_id.eq(issueId)
                    )).first();
                    if (currentSignItem) {
                        currentSignItem.data.status = statusReference[<string>responseJson.status];
                        await currentSignItem.save();
                    };
                    Context.data.request_id = issueId;
    
                    break;
                case `/${requestId}`:
                    responseJson = await response.json();
                    if (Context.data.request_exists && responseJson.certificateReleasedInfo) {
                        const certificateJson = responseJson.certificateReleasedInfo
                        const certificateInfoObj = {
                            validTo: new Datetime(certificateJson.validTo).format("DD.MM.YY"),
                            id: responseJson.id,
                            createdAt: new Datetime(certificateJson.validFrom).format("DD.MM.YY"),
                            serialNumber: certificateJson.serialNumber
                        };
                        let certificatesInfo = JSON.parse(Context.data.response!)
                        if (certificatesInfo.certificateInfoObj) {
                            certificatesInfo.certificateInfoObj.push(certificateInfoObj);
                            Context.data.response = JSON.stringify(certificatesInfo);
                        } else {
                            Context.data.response = JSON.stringify({certificateInfoObj: [certificateInfoObj]})
                        };
                        return;
                    };
                    let issueStatus = responseJson.status;
                    currentIssue = await System.signs.digitalSigns.search().where(f => f.issueID.eq(requestId)).first();
                    currentSignItem = await Namespace.params.fields.digital_signs_list.app.search().where((f, g) => g.and(
                        f.__deletedAt.eq(null),
                        f.external_id.eq(Context.data.request_id!)
                    )).first();
                    if (currentSignItem) {
                        currentSignItem.data.status = statusReference[<string>responseJson.status];
                        await currentSignItem.save();
                    };
                    let actualized = responseJson.actualized;
                    Context.data.issue_status = responseJson.status;
                    Context.data.request_actualized = actualized;
                    if (issueStatus == "released") {
                        Context.data.cert_released = true;
                        Context.data.response = JSON.stringify(responseJson);
                        if (currentSignItem) {
                            currentSignItem.data.serial_number = responseJson.certificateReleasedInfo.serialNumber;
                            currentSignItem.data.valid_to = new Datetime(responseJson.certificateReleasedInfo.validTo)
                            await currentSignItem.save();
                        };
                    } else if (issueStatus == "correction") {
                        Context.data.error_exists = true;
                        Context.data.error = responseJson.correctionInfo;
                    };
                    break;
                case `/${requestId}/documents/${currentDoc}`:
                    if (response.status == 204) {
                        responseStatus = `Документ ${currentDoc} успешно загружен.`;
                    } else {
                        this.logError("data_error", undefined, `Не удалось загрузить документ ${currentDoc}.`);
                    };
                    break;
                case `/${requestId}/documents/${currentDoc}/pages`:
                    if (response.status == 204) {
                        responseStatus = `Страница документа ${currentDoc} успешно загружена.`;
                    } else {
                        this.logError("data_error", undefined, `Не удалось загрузить страницу к документу ${currentDoc}.`);
                    };
                    break;
                case `/${requestId}/templates/releaseStatement`:
                    fileName = `Заявление на выпуск сертификата для ${Context.data.surname} ${Context.data.name} ${Context.data.lastname} ${new TDate().format("DD.MM.YYYY")}.pdf`;
                    let releaseStatement = await Context.fields.release_statement.create(fileName, await response.arrayBuffer());
                    Context.data.release_statement = releaseStatement;
                    break;
                case `/${requestId}/documents/releaseStatement/sign`:
                    Context.data.request_confirmed = true;
                    break;
                case `/${Context.data.current_issue_id}/download-certificate`:
                    try {
                        let certificate = await response.arrayBuffer();
                        let elmaKonturProvider = await System.signs.providers.search().where(f => f.code.eq("KonturNew")).first();
                        if (!elmaKonturProvider) {
                            elmaKonturProvider = await System.signs.providers.createDraft("KonturNew");
                        }
                        let issueInformation = JSON.parse(Context.data.response!).certificateInfoObj;
   
                        if (!Context.data.request_id) {
                            Context.data.debug += "creating issue"
                            currentIssue = await System.signs.digitalSigns.createDraft(Context.data.current_issue_id!, elmaKonturProvider!);
                            // let signExist = !!await System.signs.digitalSigns.search().where((f, g) => g.and(
                                // f.issueID.eq(Context.data.current_issue_id!),
                                // f.__createdBy.eq(Context.data.user!),
                                // g.or(
                                    //@ts-ignore
                                    // f.certStatus.neq('error'),
                                    //@ts-ignore
                                    // f.cert_status.neq("error")
                                // )
                            // )).first();
                            // if (!signExist) {
                            // } else {
                            //     return;
                            // };
                        } else {
                            Context.data.debug += "creating issue"
                            currentIssue = await System.signs.digitalSigns.createDraft(Context.data.request_id!, elmaKonturProvider!);
                                // currentIssue = await System.signs.digitalSigns.search().where((f, g) => g.and(
                                    // f.issueID.eq(requestId),
                                    //@ts-ignore
                                    // f.certStatus.neq(<DigitalSignRequestStatus>"error"),
                                    //@ts-ignore
                                    // f.certStatus.neq(undefined)
                                // )).first();
                            // }
                        };
                        currentSignItem = await Namespace.params.fields.digital_signs_list.app.search().where((f, g) => g.and(
                            f.__deletedAt.eq(null),
                            f.external_id.eq(Context.data.request_id!)
                        )).first();
                        let issueId = currentIssue!.data.issueID;
                        if (issueInformation) {
                            let issueObj = issueInformation.find((i: any) => i.id === issueId);
                            let certFile: FileItem;
                            if (currentSignItem) {
                                certFile = await Context.fields.passport_main_page.create(`${currentSignItem.data.name} (${issueObj.createdAt}).cer`, certificate)
                                currentSignItem.data.cert_file = certFile;
                            } else {
                                currentSignItem = Namespace.params.fields.digital_signs_list.app.create();
                                certFile = await Context.fields.passport_main_page.create(`${currentSignItem.data.name} (${issueObj.createdAt}).cer`, certificate)
                                currentSignItem.data.name = `${Context.data.surname} ${Context.data.name} ${Context.data.lastname || ""}`
                                currentSignItem.data.email = Context.data.email![0].email;
                                currentSignItem.data.country = Context.data.country;
                                currentSignItem.data.inn = Context.data.inn;
                                currentSignItem.data.external_id = issueId;
                                currentSignItem.data.user = user;
                                currentSignItem.data.status = statusReference.released;
                                currentSignItem.data.__name = `${Context.data.surname} ${Context.data.name} ${Context.data.lastname || ""} (${issueObj.createdAt})`;
                                currentSignItem.data.organization = organizationName;
                                currentSignItem.data.provider = 'Контур';
                                currentSignItem.data.cert_file = certFile
                                currentSignItem.data.valid_to = issueObj.validTo;
                                currentSignItem.data.serial_number = issueObj.serialNumber;
                            };
                            await currentSignItem.save();
                        }

                        await currentIssue!.setPublicKey(certificate);
                        await currentIssue!.setStatus(<DigitalSignRequestStatus>"released");
                    } catch (err) {
                        throw new Error(err.message);
                    };
            };
            if (response.url.includes("status")) {
                responseJson = (await response.json()).issues.filter((issue: any) => issue["cspType"] === "asess" && issue["certificateState"] === "valid");
                if (responseJson.length < 1) {
                    return;
                };
                let issueIds = responseJson.map((issue: any) => issue.id);
                
                Context.data.response = JSON.stringify(issueIds);
                Context.data.request_exists = true;
            };
        } catch (err) {
            Context.data.error_exists = true;
            throw new Error(err.message)
        }
    };

    async logError(_type: Enum$Context$error_type, response?: FetchResponse, error?: string) {
        Context.data.error_exists = true;
        let errorVariant: TEnum<Enum$Context$error_type> = {name: Context.fields.error_type.variants[_type as errorKey].name, code: _type};
        Context.data.error_type = errorVariant;

        if (!!response) {
            if (response!.url.includes("confirmation-requests")) {
                Context.data.error = await response!.text();
                throw new Error();
            };
            switch (response.status) {
                case 400:
                    if (response.url.includes("sign")) {
                        Context.data.request_confirmed = false;
                        let responseJson = await response.json();
                        let errorCode = responseJson.error.code;
                        switch (errorCode) {
                            case "ConfirmationInProgress":
                                Context.data.error_exists = false;
                                break;
                            case "ConfirmationFailed":
                                let errorType = responseJson.error.details[0].code;
                                if (errorType == "ConfirmationRejected") {
                                    Context.data.confirmation_error_reason = "Пользователь отказался от выпуска УНЭП.";
                                    Context.data.issue_data_can_be_changed = true;
                                    break;
                                } else if (errorType == "UserNotFoundInEsia") {
                                    Context.data.confirmation_error_reason = "У пользователя отсутствует подтвержденная учетная запись в ЕСИА.";
                                    break;
                                } else if (errorType == "ConfirmationExpired"){
                                    Context.data.confirmation_error_reason = "Истекло время на подтверждение личности";
                                    break;
                                };
                                break;
                        };
                        return;
                    };
                    const responseJson = await response.json()
                    const errorDetails = responseJson.error.details;
                    Context.data.issue_data_can_be_changed = true;
                    let errorString = "";
                    for (let word of triggerWords) {
                        for (let field of errorDetails) {
                            if (field.target.toLowerCase().match(word)) {
                                errorString += `${readableErrors[word as keyof typeof readableErrors] ? readableErrors[word as keyof typeof readableErrors] : readableErrors[field.code as  keyof typeof readableErrors] || ""}, `;
                            };
                        };
                    };
                    errorString = errorString.replace(/,\s$/, ".");

                    throw new Error(`Ошибка в данных: ${errorString}`);
                case 401:
                    throw new Error("Неверный api-ключ");
                case 403:
                    throw new Error("Недостаточно прав на создание заявки");
                case 404:
                    throw new Error("Заявка с данным идентификатором не найдена.");
                case 408:
                    Context.data.connection_timed_out = true;
                    throw new Error("Превышено время ожидания запроса.")
                case 409:
                    throw new Error("Данная заявка в процессе актуализации.")
                case 429:
                    throw new Error("Данные заявки изменялись слишком много раз, попробуйте заново.")
            };
        };

        throw new Error(error);
    };
};

class KonturProvider {
    constructor (logger: KonturLogger) {
        this.logger = logger;
    };

    private baseUrl = `${Namespace.params.data.kontur_server_address}/v1/issues`;
    // private baseUrl = `https://api.kontur.ru/kcr/v1/issues`;
    private apiToken = Context.data.api_key!;
    private headers: Record<string, string> = {
        "X-KONTUR-APIKEY": this.apiToken,
        "Content-Type": "application/json"
    };
    private logger: KonturLogger;

    private apiPaths = {
        create_issue: {
            path: this.baseUrl,
            method: "POST"
        },
        check_issue: {
            path: `${this.baseUrl}/issueId`,
            method: "GET",
            getPath: function(id: string) {
                return this.path.replace("issueId", id);
            }
        },
        send_doc_info: {
            path: `${this.baseUrl}/issueId/documents/docType`,
            method: "PUT",
            getPath(id: string, docType: string) {
                return this.path.replace("issueId", id).replace("docType", docType)
            }
        },
        send_doc_page: {
            path: `${this.baseUrl}/issueId/documents/docType/pages`,
            method: "POST",
            getPath: function(id: string, docType: string) {
                return this.path.replace("issueId", id).replace("docType", docType)
            }
        },
        create_doc_template: {
            path: `${this.baseUrl}/issueId/templates/templateType`,
            method: "POST",
            getPath: function(id: string, template: string) {
                return this.path.replace("issueId", id).replace("templateType", template);
            }
        },
        send_to_confirmation: {
            path: `${this.baseUrl}/issueId/confirmation-requests`,
            method: "POST",
            getPath: function(id: string) {
                return this.path.replace("issueId", id)
            }
        },
        confirm_release: {
            path: `${this.baseUrl}/issueId/documents/releaseStatement/sign`,
            method: "POST",
            getPath: function(id: string) {
                return this.path.replace("issueId", id);
            }
        },
        validate_issue: {
            path: `${this.baseUrl}/issueId/validate`,
            method: "POST",
            getPath: function(id: string) {
                return this.path.replace("issueId", id)
            }
        },
        get_certificate: {
            path: `${this.baseUrl}/issueId/download-certificate`,
            method: "POST",
            getPath: function(id: string) {
                return this.path.replace("issueId", id)
            }
        },
        subject_identification: {
            path: `${this.baseUrl}/issueId/subject-identification`,
            method: "PUT",
            getPath: function(id: string) {
                return this.path.replace("issueId", id)
            }
        },
        add_note: {
            path: `${this.baseUrl}/issueId/note`,
            method: "POST",
            getPath: function(id: string) {
                return this.path.replace("issueId", id)
            }
        }
    };

    private body: any;
    private fileDataObj: fileData;

    private async serializeFiles() {
        let passportFile: FileItem;
        let passportFileLink: string
        let passportFileExtension: string;
        let passportArrayBuffer: ArrayBuffer;
        let passportFileSize: number;
        if (!!Context.data.passport_main_page) {
            passportFile = await Context.data.passport_main_page!.fetch();
            passportFileLink = await passportFile.getDownloadUrl();
            passportFileExtension = passportFile.data.__name.split(".").slice(-1)[0];
            passportArrayBuffer = await fetch(passportFileLink).then(async file => await file.arrayBuffer());
            passportFileSize = passportArrayBuffer.byteLength;
        } else {
            passportArrayBuffer = base64ToArrayBuffer(blankFileBase64);
            passportFile = await Context.fields.passport_main_page.create("blank.jpg", passportArrayBuffer);
            passportFileExtension = "jpg";
            passportFileSize = 116;
        }

        this.fileDataObj = {
            extension: passportFileExtension,
            size: passportFileSize.toString(),
            fileBuffer: passportArrayBuffer,
            name: passportFile.data.__name
        };
    };

    private actualize() {
        Context.data.request_actualized = false;
        Context.data.issue_data_can_be_changed = false;
        Context.data.data_changed = false;
        Context.data.error = "";
        Context.data.repeat_confirmation = false;
        Context.data.error_exists = false;
        Context.data.create_new_issue = false;
        Context.data.issue_created = false;
    };

    async makeRequest(url: string, method: string) {
        this.actualize();
        let response: FetchResponse | undefined = undefined;
        try {
            response = await fetch(url, {
                method,
                headers: this.headers,
                body: this.body || undefined
            });
        } catch (err) {
            await this.logger.logError("sdk_error", undefined, err.message);
        };
        
        if (!response!.ok) {
            await this.logger.logError("data_error", response!)
        };
        if (method !== "PATCH" && method !== "DELETE") {
            await this.logger.logData(response);
        }
    };

    async checkCertificate() {
        let issueData = JSON.parse(Context.data.json_obj!).issueDataObj.subjectInfo;
        let subjectInfoObj = {
            // "subjectEmail": issueData.email,
            "subjectPhone": issueData.phone,
            // "inn": issueData.inn
        };
        let fieldsToCheck = ["subjectPhone"];
        let pathObj = this.apiPaths.create_issue;
        let [path, method] = [pathObj.path, "GET"];

        for (let field of fieldsToCheck) {
            await this.makeRequest(`${path}/?status=released&${field}=${subjectInfoObj[field as keyof typeof subjectInfoObj]}&inn=${issueData.inn}`, method);
            if (Context.data.request_exists) {
                break;
            };
        };

        let issueIds = JSON.parse(Context.data.response!);
        if (!issueIds) {
            throw new Error("Ошибка в checkCertificate")
        }
        if (Context.data.issue_for_new_subject) {
            path = this.apiPaths.check_issue.getPath(Context.data.request_id!);
            await this.makeRequest(path, method);
        } else {
            for (let issue of issueIds) {
                path = this.apiPaths.check_issue.getPath(issue)
                await this.makeRequest(path, method);
            };
        };
    };

    async getCertificates() {
        let issueIds = JSON.parse(Context.data.response!).certificateInfoObj;
        if (!issueIds) {
            issueIds = JSON.parse(Context.data.response!);
        }
        let pathObj = this.apiPaths.get_certificate;
        for (let issue of issueIds) {
            Context.data.current_issue_id = issue.id ? issue.id : issue;
            let [path, method] = [pathObj.getPath(issue.id ? issue.id : issue), pathObj.method];
            await this.makeRequest(path, method);
        };
    };

    async createIssue() {
        let issueData = JSON.parse(Context.data.json_obj!).issueDataObj
        this.body = JSON.stringify(issueData);
        let pathObj = this.apiPaths.create_issue;
        let [path, method] = [pathObj.path, pathObj.method];
        await this.makeRequest(path, method);
        let notePathObj = this.apiPaths.add_note;
        [path, method] = [notePathObj.getPath(Context.data.request_id!), pathObj.method];
        const domenSetting = await Namespace.params.fields.settings_app.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq("domen")
        )).first();
        let domen = "";
        if (domenSetting) {
            domen = domenSetting.data.value!;
        };
        this.body = JSON.stringify({
            content: `${Context.data.organization_name};${domen}`
        });
        await this.makeRequest(path, method);
        this.body = "";
    };

    async checkIssue() {
        let pathObj = this.apiPaths.check_issue;
        let [path, method] = [pathObj.getPath(Context.data.request_id!), pathObj.method];
        this.body = "";
        await this.makeRequest(path, method);
    };

    async createDocs() {
        let passportInfo = JSON.parse(Context.data.json_obj!).passportInfoObj;
        let releaseStatementInfo = JSON.parse(Context.data.json_obj!).releaseStatementInfo;
        let requestId = Context.data.request_id!;
        let pathObj = this.apiPaths.send_doc_info;
        let method = pathObj.method;
        let path: string;
        let docCode = Context.data.document_type!.code;
        if (docCode == "passport") {
            path = pathObj.getPath(requestId, "passport")
        } else {
            path = pathObj.getPath(requestId, "otherIdentity")
        }
        Context.data.current_doc = docCode;
        this.body = JSON.stringify(passportInfo);
        await this.makeRequest(path, method);
        path = pathObj.getPath(requestId, "releaseStatement");
        Context.data.current_doc = "releaseStatement";
        // this.body = JSON.stringify(releaseStatementInfo);
        // await this.makeRequest(path, pathObj.method);
    };

    async sendPages() {
        try {
            await this.serializeFiles();
        } catch (err) {
            this.logger.logError("data_error", undefined, "Не заполнено поле с файлом паспорта");
        }
        let requestId = Context.data.request_id!;
        let pathObj = this.apiPaths.send_doc_page;
        let method = pathObj.method;
        let path: string;
        let docCode = Context.data.document_type!.code;
        if (docCode == "passport") {
            path = pathObj.getPath(requestId, "passport") 
        } else {
            path = pathObj.getPath(requestId, "otherIdentity") 
        }
        let contentType: string = "";
        let fileExt = this.fileDataObj.extension;
        this.body = this.fileDataObj.fileBuffer;

        if (fileExt === "jpg" || fileExt === "jpeg") {
            contentType = "image/jpeg"
        } else if (fileExt === "pdf") {
            contentType = "application/pdf"
        } else if (fileExt === "png") {
            contentType = "image/png"
        } else if (fileExt === "gif") {
            contentType = "image/gif"
        } else {
            await this.logger.logError("data_error", undefined, `Неподдерживаемый формат файла для документа ${this.fileDataObj.name}: .${this.fileDataObj.extension}`);
        };

        this.headers["Content-Type"] = contentType;
        this.headers["Content-Length"] = this.fileDataObj.size;
        await this.makeRequest(path, method);

        // [path, method] = [pathObj.getPath(requestId, "releaseStatement"), pathObj.method];
        // await this.makeRequest(path, method);
    };

    async createTemplate() {
        this.body = undefined;
        let pathObj = this.apiPaths.create_doc_template;
        let [path, method] = [pathObj.getPath(Context.data.request_id!, "releaseStatement"), pathObj.method];
        await this.makeRequest(path, method);
        Context.data.connection_timed_out = false;
    };

    async createConfirmationRequest() {
        let snils = Context.data.snils!;
        snils = snils.replace(/-/g, "").replace(/\s/g, "");
        this.body = JSON.stringify({
            operationToConfirm: "signingReleaseStatementWithEsia",
            parameters: {
                snilsNumber: snils,
                birthDate: Context.data.birth_date!.asDatetime(new TTime()).format()
            }
        });
        let pathObj = this.apiPaths.send_to_confirmation;
        let [path, method] = [pathObj.getPath(Context.data.request_id!), pathObj.method];
        await this.makeRequest(path, method);
    };

    // async signReleaseStatement() {
    //     this.body = JSON.stringify({});
    //     let pathObj = this.apiPaths.confirm_release;
    //     let [path, method] = [pathObj.getPath(Context.data.request_id!), pathObj.method];
    //     await this.makeRequest(path, method);
    // };

    async changeIssueData() {
        //TODO: check data changing
        let issueData = JSON.parse(Context.data.json_obj!).issueDataObj
        this.body = JSON.stringify(issueData);
        let pathObjDocs = this.apiPaths.send_doc_info;
        let path: string = "";
        let method: string = "DELETE";
        path = pathObjDocs.getPath(Context.data.request_id!, "passport");
        await this.makeRequest(path, method);
        let pathObjPatch = this.apiPaths.check_issue;
        path = pathObjPatch.getPath(Context.data.request_id!);
        method = "PATCH";
        await this.makeRequest(path, method);
    };

    async validateIssue() {
        let pathObj = this.apiPaths.validate_issue;
        let [path, method] = [pathObj.getPath(Context.data.request_id!), pathObj.method];
        await this.makeRequest(path, method);
    };

    async sendIdentificationInfo() {
        let pathObj = this.apiPaths.subject_identification;
        let [path, method] = [pathObj.getPath(Context.data.request_id!), pathObj.method];
        this.body = JSON.stringify({
            identifiedBy: Context.data.responsible_user!.id,
            identificationSubjectType: "employee"
        });
        await this.makeRequest(path, method)
    }

};

async function serialize(): Promise<void> {
    try {
        const personType = stableData.personType;
        const inn = Context.data.inn!;
        const lastname = Context.data.surname!.trim();
        const firstname = Context.data.name!.trim();
        const middlename = Context.data.lastname ? Context.data.lastname.trim() : "";
        const email = Context.data.email![0].email!;
        const phone = Context.data.phone![0].tel.slice(-10);
        const series = Context.data.passport_series!;
        const passportNumber = Context.data.passport_number!;
        const issueDate = Context.data.passport_date!.format("DD.MM.YYYY");
        const birthDate = Context.data.birth_date!.format("DD.MM.YYYY");
        const birthPlace = `${Context.data.country} ${Context.data.region} ${Context.data.city}`;
        const docCode = Context.data.document_type!.code;
        let issueOrganizationId = Context.data.passport_code!;

        if (issueOrganizationId.includes("-")) {
            issueOrganizationId = issueOrganizationId.replace(/-/g, "");
        };

        if (docCode == "passport") {
            passportInfoObj.requisitesToAddOrUpdate = [
                {type: "series", value: series},
                {type: "number", value: passportNumber},
                {type: "issueDate", value: issueDate},
                {type: "birthDate", value: birthDate},
                {type: "birthPlace", value: birthPlace},
                {type: "issueOrganizationId", value: issueOrganizationId},
            ];
        } else {
            let expirationDate = Context.data.identity_expiration ? Context.data.identity_expiration.format("DD.MM.YYYY") : "";
            let issuedBy = Context.data.issued_by!;
            passportInfoObj.requisitesToAddOrUpdate = [
                {type: "number", value: passportNumber},
                {type: "issueDate", value: issueDate},
                {type: "issueOrganization", value: issuedBy}
            ];
            if (!!expirationDate) {
                passportInfoObj.requisitesToAddOrUpdate.push({type: "validTo", value: expirationDate});
            };
            if (!!Context.data.passport_series) {
                passportInfoObj.requisitesToAddOrUpdate.push({type: "series", value: series});
            };
        };

        certificateTemplateInfoObj = stableData.certificateType;
        cspInfoObj = {
            type: stableData.cspType
        };
        userDataObj = {
            inn,
            lastname,
            firstname,
            middlename,
            email,
            type: personType,
            phone
        };
        issueDataObj = {
            certificateTemplateInfo: certificateTemplateInfoObj,
            subjectInfo: userDataObj,
            cspInfo: cspInfoObj
        };

        Context.data.json_obj = JSON.stringify({issueDataObj, passportInfoObj, releaseStatementInfo})
    } catch (err) {
        await konturLogger.logError("sdk_error", undefined, `Ошибка в данных: ${err.message}`);
    };
};

const konturLogger = new KonturLogger();
const konturProvider = new KonturProvider(konturLogger);

async function setUserData(): Promise<void> {
    const staff = await Namespace.params.fields.staff_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(Context.data.user!)
    )).first();
    if (staff) {
        staff.data.passport_number = Context.data.passport_number;
        staff.data.passport_department_code = Context.data.passport_code;
        staff.data.passport_series = Context.data.passport_series;
        staff.data.inn = Context.data.inn;
        staff.data.date_of_issue = Context.data.passport_date;
        staff.data.full_name = {
            firstname: Context.data.name!,
            lastname: Context.data.surname!,
            middlename: Context.data.lastname || ""
        };
        staff.data.date_of_birth = Context.data.date_of_birth;
        staff.data.phone!.tel = Context.data.phone![0].tel
        staff.data.issued_by = Context.data.issued_by;
        if (staff.data.email) {
            staff.data.email!.email = Context.data.email![0].email;
        };
        
        if (Context.data.snils) {
            staff.data.snils = Context.data.snils;
        };
        await staff.save();
    };
};

async function checkCertificate(): Promise<void> {
    try {
        await konturProvider.checkCertificate();
    } catch (err) {
        Context.data.error = err.message;
    };
};

async function getExistingCertificates(): Promise<void> {
    try {
        await konturProvider.getCertificates();
    } catch (err) {
        Context.data.error = err.message;
    };
};

async function createIssue(): Promise<void> {
    try {
        if (Context.data.create_new_issue) {
            await serialize();
        };
        await konturProvider.createIssue();
    } catch (err) {
        Context.data.error = err.message;
    };
};

async function checkIssue(): Promise<void> {
    try {
        await konturProvider.checkIssue();
    } catch (err) {
        Context.data.error = err.message;
    };
};

async function sendDocs(): Promise<void> {
    try {
        await konturProvider.createDocs();
    } catch (err) {
        Context.data.error = err.message;
    };
};

async function sendPages(): Promise<void> {
    try {
        await konturProvider.sendPages();
    } catch (err) {
        Context.data.error = err.message;
    };
};

async function createReleaseStatementTemplate(): Promise<void> {
    try {
        await konturProvider.createTemplate();
    } catch (err) {
        Context.data.error = err.message;
    };
};

async function createConfirmationRequest(): Promise<void> {
    try {
        await konturProvider.createConfirmationRequest();
    } catch (err) {
        Context.data.error = err.message;
    };
};

// async function confirmIssue(): Promise<void> {
//     try {
//         await konturProvider.signReleaseStatement();
//     } catch (err) {
//         Context.data.error = err.message;
//     };
// };
async function patchIssueData(): Promise<void> {
    try {
        Context.data.data_changed = true;
        await serialize();
        await konturProvider.changeIssueData();
        await setUserData();
        const staff = await Namespace.params.fields.staff_app.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(Context.data.user!)
        )).first();
        if (staff && staff.data.__status!.code !== "signed_documents") {
            await staff.setStatus(staff.fields.__status.variants.UNEP_release_confirmation)
        };
    } catch (err) {
        Context.data.error = err.message;
        throw new Error(err.message)
    };
};

async function validateIssue(): Promise<void> {
    try {
        await konturProvider.validateIssue();
    } catch (err) {
        Context.data.error = err.message;
    };
};

async function confirmSubjectIdentification(): Promise<void> {
    try {
        await konturProvider.sendIdentificationInfo();
    } catch (err) {
        Context.data.error = err.message;
    };
};