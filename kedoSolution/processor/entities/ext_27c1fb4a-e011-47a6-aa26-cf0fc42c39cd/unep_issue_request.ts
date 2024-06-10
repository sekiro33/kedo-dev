// class SignMeLogger {
//     async logData(response: FetchResponse, body?: string) {
//         let requestEndpoint: string = "";

//         if (response.url.includes("sign/cer/")) {
//             requestEndpoint = "cer"
//         } else {
//             requestEndpoint = response.url.split("/").slice(-1)[0];
//         };

//         let responseJson: any = {};
//         let responseText: string = "";
//         Context.data.stage = requestEndpoint;

//         switch (requestEndpoint) {
//             case "precheck":
//                 responseJson = await response.json();

//                 if (Object.keys(responseJson).length > 0) {
//                     let rootObj = responseJson.email || responseJson.phone || responseJson.inn || responseJson.snils;
//                     Context.data.request_exists = true;
//                     Context.data.debug = JSON.stringify(rootObj);

//                     if (rootObj.created && rootObj.approved && !rootObj.rejected) {
//                         let existsField = Object.keys(responseJson)[0];
//                         let existsValue = JSON.parse(Context.data.json_obj!).precheckDataObj[existsField];
//                         Context.data.response = `Найдена подтвержденнная заявка в системе, совпадение по полю ${existsField}: ${existsValue}`;
//                     } else if (!rootObj.created && !rootObj.approved && !rootObj.rejected) {
//                         let existsField = Object.keys(responseJson)[0];
//                         let existsValue = JSON.parse(Context.data.json_obj!).precheckDataObj[existsField];
//                         Context.data.response = `Найдена неподтвержденнная заявка в системе, совпадение по полю ${existsField}: ${existsValue}, идентификатор заявки: ${rootObj.id}. На данном этапе заявки вы можете изменить её данные.`;
//                     } else if (rootObj.rejected) {
//                         let rejectComment = rootObj.reject_comment;
//                         Context.data.response = `Заявка отклонена, причина: ${rejectComment}`;
//                         Context.data.request_exists = true;
//                     };
//                 };
//                 break;
//             case "api":
//                 responseText = await response.text();
//                 Context.data.debug = responseText;

//                 if (responseText.includes("error")) {
//                     Context.data.error = responseText;
//                     Context.data.error_exists = true;
//                     return;
//                 };

//                 responseJson = JSON.parse(responseText);
//                 let requestId = responseJson.id.toString();
//                 let requestBase64 = responseJson.pdf;
//                 let requestBuffer = base64ToArrayBuffer(requestBase64);
//                 let requestFile = await Context.fields.release_statement.create("Заявка на выпуск сертификата.pdf", requestBuffer);
//                 Context.data.release_statement = requestFile;
//                 Context.data.request_id = requestId;
//                 break;
//             case "photo": 
//                 if (!response.ok) {
//                     responseJson = (await response.json()).error;
//                     let errorCode = responseJson.code;
//                     let errorMessage: string = "";
//                     let docType: any;

//                     switch (errorCode) {
//                         case 1:
//                         case "1":
//                             errorMessage = `HHTP 500: Ошибка сервера, у нас сохранились логи, запишите точное время для поиска ошибки. (Точное время выполнения запроса: ${new Datetime().format("DD.MM.YY HH:MM:SS")})`;
//                             break
//                         case 2:
//                         case "2":
//                             errorMessage = `HTTP 400: Неправильный json: ${body}`;
//                             break;
//                         case 3:
//                         case "3":
//                             errorMessage = `HTTP 403: Неверный API-ключ.`;
//                             break;
//                         case 4:
//                         case "4":
//                             let userSnils = Context.data.snils;
//                             errorMessage = `HTTP 404: Пользователь со СНИЛС ${userSnils} не найден.`;
//                             break;
//                         case 6:
//                         case "6":
//                             docType = JSON.parse(body!).doctype;
//                             errorMessage = `Неправильный тип документа: ${docType}, разрешенные виды документов - между 1 и 17.`;
//                             break;
//                         case 7:
//                         case "7":
//                             docType = JSON.parse(body!).doctype;
//                             errorMessage = `Проверьте base64 содержимое файла ${docType}`;
//                             break;
//                         case 8:
//                         case "8":
//                             let fileName = JSON.parse(body!).name;
//                             errorMessage = `Неправильное имя файла: ${fileName}`;
//                             break;
//                     };

//                     Context.data.error = errorMessage;
//                     Context.data.error_exists = true;
//                 };
//             case "activate":
//                 responseText = await response.text();

//                 if (responseText.includes("1")) {
//                     Context.data.request_confirmed = true;
//                 };

//                 break;
//             case "comstaff":
//                 responseText = await response.text();

//                 if (responseText.includes("error")) {
//                     Context.data.error = responseText;
//                     Context.data.request_exists = true;
//                     return;
//                 };

//                 let userId = responseText;
//                 Context.data.staff_id = userId;
//                 break;
//             case "keys":
//                 responseJson = await response.json();

//                 if (responseJson.error) {
//                     Context.data.error_exists = true;
//                     Context.data.error = responseJson.error;
//                     return;
//                 };

//                 let certificateId = responseJson[0].id;
//                 Context.data.certificate_id = certificateId;
//                 break;
//         };
//     };
// };

// class SignMeProvider {
//     private method = "POST";
//     private contentType = "application/json"
//     private headers: Record<string, string> = {
//         "Content-Type": this.contentType
//     };
//     private baseUrl: string = Namespace.params.data.sign_me_server_address;
//     private logger: SignMeLogger;

//     private paths = {
//         precheckPath: `${this.baseUrl}/register/precheck`,
//         registerPath: `${this.baseUrl}/register/api`,
//         activatePath: `${this.baseUrl}/register/activate`,
//         comstaffPath: `${this.baseUrl}/register/comstaff`,
//         certsInfoPath: `${this.baseUrl}/certapi/keys`,
//         sendDocsPath: `${this.baseUrl}/photo`,
//         getCertsPath: `${this.baseUrl}/sign/cer`
//     };

//     constructor(logger: SignMeLogger) {
//         this.logger = logger;
//     };

//     async makeRequest(path: string, body: string) {
//         let response: FetchResponse | undefined;
//         let headers = this.headers;
//         let method = this.method

//         try {
//             response = await fetch(path, {
//                 headers,
//                 method,
//                 body
//             });

//             if (path.includes("photo")) {
//                 await this.logger.logData(response, body);
//             } else {
//                 await this.logger.logData(response);
//             };
//         } catch (err) {
//             Context.data.error = err.message;
//             Context.data.error_exists = true;
//         };
//     };

//     async precheck() {
//         let path = this.paths.precheckPath;
//         let body = JSON.stringify(JSON.parse(Context.data.json_obj!).precheckDataObj);
//         await this.makeRequest(path, body);
//     };

//     async register() {
//         let path = this.paths.registerPath;

//         if (Context.data.data_changed) {
//             await serializeData();
//             Context.data.data_changed = false;
//         };

//         let body = JSON.stringify(JSON.parse(Context.data.json_obj!).registerDataObj);

//         await this.makeRequest(path, body);
//     };

//     async activate() {
//         let path = this.paths.activatePath;
//         let activateBody: activateData = {
//             api_key,
//             uid: Context.data.request_id!,
//             noemail: true
//         };
//         let body = JSON.stringify(activateBody);
//         await this.makeRequest(path, body);
//     };

//     async sendDocs() {
//         let path = this.paths.sendDocsPath;
//         let documentsObj: documentsData = JSON.parse(Context.data.json_obj!).documentsDataObj;
//         let body: string;

//         for (let document of documentsObj) {
//             body = JSON.stringify(document);
//             await this.makeRequest(path, body);
//         };
//     };

//     async createUser() {
//         let path = this.paths.comstaffPath;
//         let body = JSON.stringify(JSON.parse(Context.data.json_obj!).staffDataObj);
//         await this.makeRequest(path, body);
//     };

//     async getCertsInfo() {
//         let path = this.paths.certsInfoPath;
//         let body = JSON.stringify(JSON.parse(Context.data.json_obj!).certRequestDataObj);
//         await this.makeRequest(path, body);
//     };
// };


// const numberToDocTypeReference: Record<string, string> = {
//     "1": "passport_main_page",
//     "2": "passport_living_page",
//     "3": "snils_file",
//     "4": "release_statement"
// };
// const signMeLogger = new SignMeLogger();
// const signMeProvider = new SignMeProvider(signMeLogger);
// const api_key = "0AXPZD21MY812DYA";
// const ogrn = "171341863204";
// const method: string = "POST";
// const headers = {
//     "Content-Type": "application/json"
// };


// type revokeCertificate = {
//     id: string,
//     api_key: string
// };

// type documentData = {
//     api_key: string,
//     utype: string,
//     uid: string,
//     name: string,
//     file: string,
//     doctype: string
// };

// type documentsData = documentData[];

// type activateData = {
//     api_key: string,
//     uid: string,
//     noemail?: Boolean
// };

// type staffData = {
//     key: string,
//     phone: string,
//     cogrn: string
// };

// interface certRequestData {
//     api_key: string,
//     snils: string,
//     inn?: string,
//     kpp?: string
// };

// interface precheckData extends certRequestData {
//     phone: string,
//     email: string,
// };

// interface registerData extends precheckData {
//     name: string,
//     surname: string,
//     lastname: string,
//     bdate: string,
//     gender: string,
//     ps: string,
//     pn: string,
//     issued: string,
//     pcode: string,
//     pdate: string,
//     country: string,
//     region: string,
//     city: string,
//     street?: string,
//     house?: string,
//     building?: string,
//     room?: string,
//     regtype: string,
//     external?: string,
//     delivery: string,
//     ca: string
// };

// type requestBody = certRequestData | precheckData | registerData | activateData | staffData | revokeCertificate | FormData | undefined;
// type contextKey = keyof typeof Context.data;


// let documentsDataObj: documentsData = [];
// let certsRequestData = new FormData()
// let cecrtificateBase64: string;
// let certRequestDataObj: certRequestData; 
// let precheckDataObj: precheckData;
// let registerDataObj: registerData;
// let staffDataObj: staffData; 
// let user: UserItem;
// let responseData: string;

// async function serializeData(): Promise<void> {
//     try {
//         let inn = Context.data.inn!;
//         let name = Context.data.name!;
//         let surname = Context.data.surname!;
//         let lastname = Context.data.lastname!;
//         let email = Context.data.email![0].email;
//         let phone = Context.data.phone![0].tel;
//         let gender = Context.data.gender!.code.toUpperCase();;
//         let bdate = Context.data.birth_date!.format("YYYY-MM-DD");
//         let pn = Context.data.passport_number!;
//         let ps = Context.data.passport_series!;
//         let pdate = Context.data.passport_date!.format("YYYY-MM-DD");
//         let pcode = Context.data.passport_code!;
//         let issued = Context.data.issued_by!;
//         let snils = Context.data.snils!;
//         let country = "ru";
//         let region = Context.data.region!;
//         let city = Context.data.city!;
//         let jsonObj = {};

//         for (let key of Object.keys(numberToDocTypeReference)) {
//             let contextKey: contextKey = numberToDocTypeReference[key];
//             let downloadUrl = await Context.data[contextKey].getDownloadUrl();
//             let fileName = await Context.data[contextKey].fetch().then((f: any) => f.data.__name);
//             let currentDocBuffer = await fetch(downloadUrl).then(async r => await r.arrayBuffer());
//             let fileBase64 = arrayBufferToBase64(currentDocBuffer);
//             let currentDocObj: documentData = {
//                 api_key,
//                 utype: "1",
//                 uid: snils,
//                 doctype: key,
//                 file: fileBase64,
//                 name: fileName
//             };
//             documentsDataObj.push(currentDocObj);
//         };

//         registerDataObj = {
//             api_key,
//             inn,
//             name,
//             surname,
//             lastname,
//             email,
//             phone,
//             gender,
//             bdate,
//             pn,
//             ps,
//             pdate,
//             pcode,
//             issued,
//             snils,
//             country,
//             region,
//             city,
//             regtype: Context.data.data_changed ? "3" : "2",
//             delivery: "0",
//             ca: "NKEP12"
//         };

//         precheckDataObj = {
//             api_key,
//             phone,
//             snils,
//             email,
//             inn
//         };

//         certRequestDataObj = {
//             api_key,
//             snils
//         };

//         staffDataObj = {
//             key: api_key,
//             cogrn: ogrn,
//             phone
//         };
        
//         certsRequestData.append("key", api_key);
//         certsRequestData.append("user_ph", registerDataObj.phone);

//         jsonObj = {
//             registerDataObj,
//             precheckDataObj,
//             certRequestDataObj,
//             staffDataObj,
//             documentsDataObj
//         };

//         Context.data.json_obj = JSON.stringify(jsonObj);
//     } catch (err) {
//         Context.data.error_exists = true;
//         Context.data.error = err.message;
//     };
// };

// function base64ToArrayBuffer(base64: string) {
//     let binary_string = atob(base64);
//     let len = binary_string.length;
//     let bytes = new Uint8Array(len);

//     for (var i = 0; i < len; i++) {
//         bytes[i] = binary_string.charCodeAt(i);
//     }
//     return bytes.buffer;
// }

// function arrayBufferToBase64(buffer: ArrayBuffer): string {
//     let binary = '';
//     let bytes = new Uint8Array(buffer);
//     let len = bytes.byteLength;

//     for (let i = 0; i < len; i++) {
//         binary += String.fromCharCode(bytes[i]);
//     };

//     return btoa(binary);
// };

// async function precheck(): Promise<void> {
//     try {
//         await serializeData();
//         await signMeProvider.precheck();
//     } catch (err) {
//         throw new Error(err.message)
//     };
// };

// async function register(): Promise<void> {
//     try {
//         await signMeProvider.register();
//     } catch (err) {
//         throw new Error(err.message)
//     };
// };

// async function sendPhotos(): Promise<void> {
//     try {
//         await signMeProvider.sendDocs();
//     } catch (err) {
//         throw new Error(err.message);
//     };
// };

// async function activate(): Promise<void> {
//     try {
//         await signMeProvider.activate();
//     } catch (err) {
//         throw new Error(err.message)
//     };
// };

// async function refreshData(): Promise<void> {
//     Context.data.data_changed = true;
// };

// type certificateInfo = {
//     type: string,
//     nonExportable: boolean
// };

// type docField = {
//     type: string,
//     value: string
// };

// type cspInfo = {
//     type: string
// };

// type passportInfoData = {
//     requisitesToAddOrUpdate: docField[]
// };

// type issueData = {
//     certificateTemplateInfo: certificateInfo,
//     subjectInfo: userData,
//     cspInfo: cspInfo
// };

// type confirmIssueData = {
//     operationToConfirm: string,
//     parameters: {
//         snilsNumber: string,
//         birthDate: string
//     }
// };

// type userData = {
//     inn: string,
//     lastname: string,
//     firstname: string,
//     middlename: string,
//     email: string,
//     phone: string,
//     type: string
// };

// type fileData = {
//     size: string,
//     extension: string,
//     fileBuffer: ArrayBuffer,
//     name: string
// };

// type requestData = issueData | passportInfoData;
// type errorKey = keyof typeof Context.fields.error_type.variants

// const stableData = {
//     certificateType: {
//         type: "notQualified",
//         nonExportable: false
//     },
//     personType: "naturalPerson",
//     cspType: "asess"
// };
// let releaseStatementObj: passportInfoData = {
//     requisitesToAddOrUpdate: []
// };
// let userDataObj: userData;
// let certificateTemplateInfoObj: certificateInfo;
// let cspInfoObj: cspInfo;
// let issueDataObj: issueData;
// let passportInfoObj: passportInfoData = {
//     requisitesToAddOrUpdate: []
// };
// let releaseStatementInfo: passportInfoData = {
//     requisitesToAddOrUpdate: []
// };
// let fileDataObj: fileData = {
//     fileBuffer: new ArrayBuffer(0),
//     size: "0",
//     extension: "",
//     name: ""
// };

// let confirmIssueDataObj: confirmIssueData = {
//     operationToConfirm: "",
//     parameters: {
//         snilsNumber: "",
//         birthDate: ""
//     }
// };

// let dataObj: any;

// class KonturLogger {
//     data: string;
//     error: string;
//     baseUrl = Namespace.params.data.kontur_server_address;

//     async logData(response: FetchResponse | undefined) {
//         response = response!;
//         let responseEndpoint = response.url.replace(`${this.baseUrl}/v1/issues`, "");
//         let responseJson: any;
//         let currentDoc = Context.data.current_doc;
//         let requestId = Context.data.request_id;
//         let responseStatus: string = "";
//         let fileName: string = ""

//         switch (responseEndpoint) {
//             case "":
//                 responseJson = await response.json();
//                 let issueId = responseJson.id;
//                 Context.data.debug = JSON.stringify(responseJson);
//                 Context.data.request_id = issueId;
//                 break;
//             case `/${requestId}`:
//                 responseJson = await response.json();
//                 let actualized = responseJson.actualized;
//                 Context.data.issue_status = responseJson.status;
//                 Context.data.request_actualized = actualized;
//                 Context.data.debug = JSON.stringify(responseJson);
//                 break;
//             case `/${requestId}/documents/${currentDoc}`:
//                 if (response.status == 204) {
//                     responseStatus = `Документ ${currentDoc} успешно загружен.`;
//                 } else {
//                     this.logError("data_error", undefined, `Не удалось загрузить документ ${currentDoc}.`);
//                 };

//                 Context.data.debug = responseStatus;
//                 break;
//             case `/${requestId}/documents/${currentDoc}/pages`:
//                 if (response.status == 204) {
//                     responseStatus = `Страница документа ${currentDoc} успешно загружена.`;
//                 } else {
//                     this.logError("data_error", undefined, `Не удалось загрузить страницу к документу ${currentDoc}.`);
//                 }
//                 Context.data.debug = responseStatus;
//                 break;
//             case `/${requestId}/templates/releaseStatement`:
//                 fileName = `Заявление на выпуск сертификата для ${Context.data.surname} ${Context.data.name} ${Context.data.lastname} ${new TDate().format("DD.MM.YYYY")}.pdf`;
//                 let releaseStatement = await Context.fields.release_statement.create(fileName, await response.arrayBuffer());
//                 Context.data.release_statement = releaseStatement;
//                 break;
//             case `/${requestId}/documents/releaseStatement/sign`:
//                 Context.data.request_confirmed = true;
//                     let confirmTask = await Namespace.processes.unep_issue_request._searchTasks().where((f, g) => g.and(
//                     f.performers.has(Context.data.user!),
//                     f.state.like("in_progress")
//                 )).first();
//                 if (confirmTask) {
//                     let taskExits = await confirmTask!.getExits();
//                     await confirmTask!.submitTask(taskExits[0].id)
//                     return;
//                 };
//                 break;
//         };
//     };

//     async logError(_type: Enum$Context$error_type, response?: FetchResponse, error?: string) {
//         Context.data.error_exists = true;
//         let errorVariant: TEnum<Enum$Context$error_type> = {name: Context.fields.error_type.variants[_type as errorKey].name, code: _type};
//         Context.data.error_type = errorVariant;
//         if (response!.url.includes("confirmation-requests")) {
//             let confirmTask = await Namespace.processes.unep_issue_request._searchTasks().where((f, g) => g.and(
//                 f.performers.has(Context.data.user!),
//                 f.state.like("in_progress")
//             )).first();
//             if (confirmTask) {
//                 let taskExits = await confirmTask!.getExits();
//                 await confirmTask!.submitTask(taskExits[0].id);
//                 Context.data.error = await response!.text();
//             };
//             return;
//         };

//         if (!!response) {
//             switch (response.status) {
//                 case 400:
//                     if (response.url.includes("sign")) {
//                         let responseJson = await response.json();
//                         let errorCode = responseJson.error.code;
//                         switch (errorCode) {
//                             case "ConfirmationInProgress":
//                                 Context.data.error_exists = false;
//                                 Context.data.request_confirmed = false;
//                                 break;
//                             case "ConfirmationFailed":
//                                 let errorType = responseJson.error.details[0].code;
//                                 if (errorType == "ConfirmationRejected") {
//                                     Context.data.confirmation_error_reason = "Пользователь отказался от выпуска УНЭП.";
//                                     break;
//                                 } else if (errorType == "UserNotFoundInEsia") {
//                                     Context.data.confirmation_error_reason = "У пользователя отсутствует подтвержденная учетная запись в ЕСИА.";
//                                     break;
//                                 } else if (errorType == "ConfirmationExpired"){
//                                     Context.data.confirmation_error_reason = "Истекло время на подтверждение личности";
//                                     break;
//                                 };
//                             default:
//                                 Context.data.error = responseJson.error.message;
//                                 throw new Error();
//                         };
//                     }
//                     const errorDetails = (await response.json()).error.details;
//                     const errorFields = errorDetails.map((field: any) => {
//                         return JSON.stringify({
//                             'Поле': field.target,
//                             'Причина': field.message
//                         });
//                     }).join(", ");
//                     throw new Error(`Ошибка в данных, неверные поля: ${errorFields}`);
//                 case 401:
//                     throw new Error("Неверный api-ключ");
//                 case 403:
//                     throw new Error("Недостаточно прав на создание заявки");
//                 case 404:
//                     throw new Error("Заявка с данным идентификатором не найдена.");
//                 case 408:
//                     Context.data.connection_timed_out = true;
//                     throw new Error("Превышено время ожидания запроса.")
//                 case 409:
//                     throw new Error("Данная заявка в процессе актуализации.")
//                 case 429:
//                     throw new Error("Данные заявки изменялись слишком много раз, попробуйте заново.")
//             };
//         };

//         throw new Error(error);
//     };
// };

// class KonturProvider {
//     constructor (logger: KonturLogger) {
//         this.logger = logger;
//     };

//     private baseUrl = `${Namespace.params.data.kontur_server_address}/v1/issues`;
//     private apiToken = "7a823d8d-098b-30c2-2ac8-05d773c1e494"
//     private headers: Record<string, string> = {
//         "X-KONTUR-APIKEY": this.apiToken,
//         "Content-Type": "application/json"
//     };
//     private logger: KonturLogger;

//     private apiPaths = {
//         create_issue: {
//             path: this.baseUrl,
//             method: "POST"
//         },
//         check_issue: {
//             path: `${this.baseUrl}/issueId`,
//             method: "GET",
//             getPath: function(id: string) {
//                 return this.path.replace("issueId", id);
//             }
//         },
//         send_doc_info: {
//             path: `${this.baseUrl}/issueId/documents/docType`,
//             method: "PUT",
//             getPath(id: string, docType: string) {
//                 return this.path.replace("issueId", id).replace("docType", docType)
//             }
//         },
//         send_doc_page: {
//             path: `${this.baseUrl}/issueId/documents/docType/pages`,
//             method: "POST",
//             getPath: function(id: string, docType: string) {
//                 return this.path.replace("issueId", id).replace("docType", docType)
//             }
//         },
//         create_doc_template: {
//             path: `${this.baseUrl}/issueId/templates/templateType`,
//             method: "POST",
//             getPath: function(id: string, template: string) {
//                 return this.path.replace("issueId", id).replace("templateType", template);
//             }
//         },
//         send_to_confirmation: {
//             path: `${this.baseUrl}/issueId/confirmation-requests`,
//             method: "POST",
//             getPath: function(id: string) {
//                 return this.path.replace("issueId", id)
//             }
//         },
//         confirm_release: {
//             path: `${this.baseUrl}/issueId/documents/releaseStatement/sign`,
//             method: "POST",
//             getPath: function(id: string) {
//                 return this.path.replace("issueId", id);
//             }
//         },
//         validate_issue: {
//             path: `${this.baseUrl}/issueId/validate`,
//             method: "POST",
//             getPath: function(id: string) {
//                 return this.path.replace("issueId", id)
//             }
//         },
//         get_certificate: {
//             path: `${this.baseUrl}/issueId/download-certificate`,
//             method: "POST",
//             getPath: function(id: string) {
//                 return this.path.replace("issueId", id)
//             }
//         }
//     };

//     private body: any;
//     private fileDataObj: fileData

//     private async serializeFiles() {
//         const passportFile = await Context.data.passport_main_page!.fetch();
//         const passportFileLink = await passportFile.getDownloadUrl();
//         const passportFileExtension = passportFile.data.__name.split(".").slice(-1)[0];
//         const passportArrayBuffer = await fetch(passportFileLink).then(async file => await file.arrayBuffer());
//         const passportFileSize = passportArrayBuffer.byteLength;

//         this.fileDataObj = {
//             extension: passportFileExtension,
//             size: passportFileSize.toString(),
//             fileBuffer: passportArrayBuffer,
//             name: passportFile.data.__name
//         };
//     };

//     private actualize() {
//         Context.data.request_actualized = false;
//         Context.data.error = "";
//     };

//     async makeRequest(url: string, method: string) {
//         this.actualize();
//         let response: FetchResponse | undefined = undefined;
//         try {
//             response = await fetch(url, {
//                 method,
//                 headers: this.headers,
//                 body: this.body || undefined
//             });
//         } catch (err) {
//             Context.data.error = err.message;
//             await this.logger.logError("sdk_error", undefined, err.message);
//         };
        
//         if (!response!.ok) {
//             await this.logger.logError("data_error", response!)
//         };
//         await this.logger.logData(response);
//     };


//     async createIssue() {
//         let issueData = JSON.parse(Context.data.json_obj!).issueDataObj
//         this.body = JSON.stringify(issueData);
//         let pathObj = this.apiPaths.create_issue;
//         let [path, method] = [pathObj.path, pathObj.method];
//         await this.makeRequest(path, method);
//     };

//     async checkIssue() {
//         let pathObj = this.apiPaths.check_issue;
//         let [path, method] = [pathObj.getPath(Context.data.request_id!), pathObj.method];
//         this.body = "";
//         await this.makeRequest(path, method);
//     };

//     async createDocs() {
//         let passportInfo = JSON.parse(Context.data.json_obj!).passportInfoObj;
//         let releaseStatementInfo = JSON.parse(Context.data.json_obj!).releaseStatementInfo;
//         Context.data.debug = JSON.stringify(passportInfo)
//         let requestId = Context.data.request_id!;
//         let pathObj = this.apiPaths.send_doc_info;
//         let method = pathObj.method;
//         let path: string;
//         let docCode = Context.data.document_type!.code;
//         if (docCode == "passport") {
//             path = pathObj.getPath(requestId, "passport")
//         } else {
//             path = pathObj.getPath(requestId, "otherIdentity")
//         }
//         Context.data.current_doc = docCode;
//         this.body = JSON.stringify(passportInfo);
//         await this.makeRequest(path, method);
//         path = pathObj.getPath(requestId, "releaseStatement");
//         Context.data.current_doc = "releaseStatement";
//         this.body = JSON.stringify(releaseStatementInfo);
//         await this.makeRequest(path, pathObj.method);
//     };

//     async sendPages() {
//         await this.serializeFiles();
//         let requestId = Context.data.request_id!;
//         let pathObj = this.apiPaths.send_doc_page;
//         let method = pathObj.method;
//         let path: string;
//         let docCode = Context.data.document_type!.code;
//         if (docCode == "passport") {
//             path = pathObj.getPath(requestId, "passport") 
//         } else {
//             path = pathObj.getPath(requestId, "otherIdentity") 
//         }
//         let contentType: string = "";
//         let fileExt = this.fileDataObj.extension;
//         this.body = this.fileDataObj.fileBuffer;

//         if (fileExt === "jpg" || fileExt === "jpeg") {
//             contentType = "image/jpeg"
//         } else if (fileExt === "pdf") {
//             contentType = "application/pdf"
//         } else if (fileExt === "png") {
//             contentType = "image/png"
//         } else if (fileExt === "gif") {
//             contentType = "image/gif"
//         } else {
//             await this.logger.logError("data_error", undefined, `Неподдерживаемый формат файла для документа ${this.fileDataObj.name}: .${this.fileDataObj.extension}`);
//         };

//         this.headers["Content-Type"] = contentType;
//         this.headers["Content-Length"] = this.fileDataObj.size;
//         await this.makeRequest(path, method);

//         [path, method] = [pathObj.getPath(requestId, "releaseStatement"), pathObj.method];
//         await this.makeRequest(path, method);
//     };

//     async createTemplate() {
//         this.body = undefined;
//         let pathObj = this.apiPaths.create_doc_template;
//         let [path, method] = [pathObj.getPath(Context.data.request_id!, "releaseStatement"), pathObj.method];
//         await this.makeRequest(path, method);
//         Context.data.connection_timed_out = false;
//     };

//     async createConfirmationRequest() {
//         let snils = Context.data.snils!;
//         snils = snils.replace(/-/g, "").replace(/\s/g, "");
//         this.body = JSON.stringify({
//             operationToConfirm: "signingReleaseStatementWithEsia",
//             parameters: {
//                 snilsNumber: snils,
//                 birthDate: Context.data.birth_date!.asDatetime(new TTime()).format()
//             }
//         });
//         let pathObj = this.apiPaths.send_to_confirmation;
//         let [path, method] = [pathObj.getPath(Context.data.request_id!), pathObj.method];
//         await this.makeRequest(path, method);
//     };

//     async signReleaseStatement() {
//         this.body = JSON.stringify({});
//         let pathObj = this.apiPaths.confirm_release;
//         let [path, method] = [pathObj.getPath(Context.data.request_id!), pathObj.method];
//         await this.makeRequest(path, method);
//     };

// };

// async function serialize() {
//     try {
//         const personType = stableData.personType;
//         const inn = Context.data.inn!;
//         const lastname = Context.data.lastname!;
//         const firstname = Context.data.name!;
//         const middlename = Context.data.surname!;
//         const email = Context.data.email![0].email!;
//         const phone = Context.data.phone![0].tel.slice(-10);
//         const series = Context.data.passport_series!;
//         const passportNumber = Context.data.passport_number!;
//         const issueDate = Context.data.passport_date!.format("DD.MM.YYYY");
//         const birthDate = Context.data.birth_date!.format("DD.MM.YYYY");
//         const birthPlace = `${Context.data.country} ${Context.data.region} ${Context.data.city}`;
//         let issueOrganizationId = Context.data.passport_code!;
//         const docCode = Context.data.document_type!.code;

//         if (issueOrganizationId.includes("-")) {
//             issueOrganizationId = issueOrganizationId.replace(/-/g, "");
//         };

//         if (docCode == "passport") {
//             passportInfoObj.requisitesToAddOrUpdate = [
//                 {type: "series", value: series},
//                 {type: "number", value: passportNumber},
//                 {type: "issueDate", value: issueDate},
//                 {type: "birthDate", value: birthDate},
//                 {type: "birthPlace", value: birthPlace},
//                 {type: "issueOrganizationId", value: issueOrganizationId},
//             ];
//         } else {
//             let expirationDate = Context.data.identity_expiration ? Context.data.identity_expiration.format("DD.MM.YYYY") : "";
//             let issuedBy = Context.data.issued_by!;
//             passportInfoObj.requisitesToAddOrUpdate = [
//                 {type: "number", value: passportNumber},
//                 {type: "issueDate", value: issueDate},
//                 {type: "issueOrganization", value: issuedBy}
//             ];
//             if (!!expirationDate) {
//                 passportInfoObj.requisitesToAddOrUpdate.push({type: "validTo", value: expirationDate});
//             };
//             if (!!Context.data.passport_series) {
//                 passportInfoObj.requisitesToAddOrUpdate.push({type: "series", value: series});
//             };
//         };

//         certificateTemplateInfoObj = stableData.certificateType;
//         cspInfoObj = {
//             type: stableData.cspType
//         };
//         userDataObj = {
//             inn,
//             lastname,
//             firstname,
//             middlename,
//             email,
//             type: personType,
//             phone
//         };
//         issueDataObj = {
//             certificateTemplateInfo: certificateTemplateInfoObj,
//             subjectInfo: userDataObj,
//             cspInfo: cspInfoObj
//         };

//         Context.data.json_obj = JSON.stringify({issueDataObj, passportInfoObj, releaseStatementInfo})
//     } catch (err) {
//         await konturLogger.logError("sdk_error", undefined, `Ошибка в данных: ${err.message}`);
//     };
// };

// const konturLogger = new KonturLogger();
// const konturProvider = new KonturProvider(konturLogger);

// async function createIssue(): Promise<void> {
//     Context.data.error_exists = false;
//     await serialize();

//     try {
//         await konturProvider.createIssue();
//     } catch (err) {
//         Context.data.error = err.message;
//     };
// };

// async function checkIssue(): Promise<void> {
//     Context.data.error_exists = false;
    
//     try {
//         await konturProvider.checkIssue();
//     } catch (err) {
//         Context.data.error = err.message;
//     };
// };

// async function sendDocs(): Promise<void> {
//     Context.data.error_exists = false;

//     try {
//         await konturProvider.createDocs();
//     } catch (err) {
//         Context.data.error = err.message;
//     };
// };

// async function sendPages(): Promise<void> {
//     Context.data.error_exists = false;

//     try {
//         await konturProvider.sendPages();
//     } catch (err) {
//         Context.data.error = err.message;
//     };
// };

// async function createReleaseStatementTemplate(): Promise<void> {
//     Context.data.error_exists = false;

//     try {
//         await konturProvider.createTemplate();
//     } catch (err) {
//         Context.data.error = err.message;
//     };
// };

// async function createConfirmationRequest(): Promise<void> {
//     Context.data.error_exists = false;

//     try {
//         await konturProvider.createConfirmationRequest();
//     } catch (err) {
//         Context.data.error = err.message;
//     };
// };

// async function confirmIssue(): Promise<void> {
//     Context.data.error_exists = false;
//     try {
//         await konturProvider.signReleaseStatement();
//     } catch (err) {
//         Context.data.error = err.message;
//     };
// };