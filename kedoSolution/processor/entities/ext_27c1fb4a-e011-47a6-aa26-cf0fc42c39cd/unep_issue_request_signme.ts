class SignMeLogger {
    async logData(response: FetchResponse, body?: string) {
        let requestEndpoint: string = "";
        let provider: SignProviderItem | undefined;

        if (response.url.includes("sign/cer/")) {
            requestEndpoint = "cer"
        } else {
            requestEndpoint = response.url.split("/").slice(-1)[0];
        };

        let responseJson: any = {};
        let responseText = await response.text();;
        Context.data.stage = requestEndpoint;

        try {
            switch (requestEndpoint) {
                case "precheck":
                    responseJson = JSON.parse(responseText);
                    if (Object.keys(responseJson).length > 0) {
                        let rootObj = responseJson.phone || responseJson.email || responseJson.inn || responseJson.snils;
                        Context.data.request_exists = true;
                        Context.data.debug = JSON.stringify(rootObj)

                        if (rootObj.created && rootObj.approved && !rootObj.rejected) {
                            Context.data.debug += " issue exists"
                            const user = await Context.data.user!.fetch();
                            const now = new TDate();
                            let existsField = Object.keys(responseJson)[0];
                            let existsValue = JSON.parse(Context.data.json_obj!).precheckDataObj[existsField];
                            const issueId = rootObj.id.toString();
                            Context.data.request_id = issueId;
                            const issueExists = await System.signs.digitalSigns.search().where((f, g) => g.and(
                                f.__deletedAt.eq(null),
                                f.issueID.eq(issueId)
                            )).first();
                            Context.data.debug += ` ${issueId}, issueExists = ${issueExists}`;
                            if (!issueExists) {
                                Context.data.debug += " creating issue in system.."
                                provider = await System.signs.providers.search().where(f => f.code.eq("SignMe")).first();
                                await System.signs.digitalSigns.createDraft(Context.data.request_id!, provider!);
                                const newdigitalSignApp = Namespace.params.fields.digital_signs_list.app.create();
                                newdigitalSignApp.data.country = Context.data.country;
                                newdigitalSignApp.data.email = Context.data.email![0].email;
                                newdigitalSignApp.data.external_id = Context.data.request_id;
                                newdigitalSignApp.data.__name = `${user.data.__name} (${now.format("DD.MM.YY")})`;
                                newdigitalSignApp.data.name = user.data.__name;
                                newdigitalSignApp.data.status = "Создана";
                                newdigitalSignApp.data.inn = Context.data.inn;
                                newdigitalSignApp.data.user = user;
                                await newdigitalSignApp.save();
                            };
                            Context.data.response = `Найдена подтвержденнная заявка в системе, совпадение по полю ${existsField}: ${existsValue}`;
                        } else if (!rootObj.created && !rootObj.approved && !rootObj.rejected) {
                            let existsField = Object.keys(responseJson)[0];
                            let existsValue = JSON.parse(Context.data.json_obj!).precheckDataObj[existsField];
                            Context.data.request_id = rootObj.id;
                            Context.data.response = `Найдена неподтвержденнная заявка в системе, совпадение по полю ${existsField}: ${existsValue}, идентификатор заявки: ${rootObj.id}. На данном этапе заявки вы можете изменить её данные.`;
                        } else if (rootObj.rejected) {
                            let rejectComment = rootObj.reject_comment;
                            Context.data.response = `Заявка отклонена, причина: ${rejectComment}`;
                        };
                    };
                    break;
                case "api":
                    if (responseText.includes("error")) {
                        Context.data.error = responseText;
                        Context.data.error_exists = true;
                        return;
                    };

                    responseJson = JSON.parse(responseText);
                    provider = await System.signs.providers.search().where(f => f.code.eq("SignMe")).first();
                    let requestId = responseJson.id.toString();
                    await System.signs.digitalSigns.createDraft(requestId, provider!);
                    let requestBase64 = responseJson.pdf;
                    let requestBuffer = base64ToArrayBuffer(requestBase64);
                    let requestFile = await Context.fields.release_statement.create("Заявка на выпуск сертификата.pdf", requestBuffer);
                    Context.data.release_statement = requestFile;
                    Context.data.request_id = requestId;
                    break;
                case "photo": 
                    if (!response.ok) {
                        responseJson = JSON.parse(responseText).error;
                        let errorCode = responseJson.code;
                        let errorMessage: string = "";
                        let docType: any;

                        switch (errorCode) {
                            case 1:
                            case "1":
                                errorMessage = `HHTP 500: Ошибка сервера, у нас сохранились логи, запишите точное время для поиска ошибки. (Точное время выполнения запроса: ${new Datetime().format("DD.MM.YY HH:MM:SS")})`;
                                break
                            case 2:
                            case "2":
                                errorMessage = `HTTP 400: Неправильный json: ${body}`;
                                break;
                            case 3:
                            case "3":
                                errorMessage = `HTTP 403: Неверный API-ключ.`;
                                break;
                            case 4:
                            case "4":
                                let userSnils = Context.data.snils;
                                errorMessage = `HTTP 404: Пользователь со СНИЛС ${userSnils} не найден.`;
                                break;
                            case 6:
                            case "6":
                                docType = JSON.parse(body!).doctype;
                                errorMessage = `Неправильный тип документа: ${docType}, разрешенные виды документов - между 1 и 17.`;
                                break;
                            case 7:
                            case "7":
                                docType = JSON.parse(body!).doctype;
                                errorMessage = `Проверьте base64 содержимое файла ${docType}`;
                                break;
                            case 8:
                            case "8":
                                let fileName = JSON.parse(body!).name;
                                errorMessage = `Неправильное имя файла: ${fileName}`;
                                break;
                        };

                        Context.data.error = errorMessage;
                        Context.data.error_exists = true;
                    };
                case "activate":
                    if (responseText.includes("1")) {
                        Context.data.request_confirmed = true;
                        let currentDigitalSign = await System.signs.digitalSigns.search().where((f, g) => g.and(
                            f.__deletedAt.eq(null),
                            f.issueID.eq(Context.data.request_id!),
                            f.__createdBy.eq(Context.data.user!)
                        )).first();
                    };

                    break;
                case "comstaff":
                    if (responseText.includes("error")) {
                        Context.data.error = responseText;
                        return;
                    };

                    let userId = responseText;
                    Context.data.staff_id = userId;
                    break;
                case "userinfo":
                    if (responseText.includes("error")) {
                        Context.data.error_exists = true;
                        Context.data.error = responseText;
                        return;
                    };
                    responseJson = JSON.parse(responseText);
                    const certData = responseJson.keys.map((key: any) => {
                        return {
                            id: key.id.toString(),
                            valid: key.date
                        };
                    });
                    Context.data.certs_json = JSON.stringify(certData);
                    break;
                case "keys":
                    responseJson = JSON.parse(responseText);
                    if (responseJson.error) {
                        Context.data.error_exists = true;
                        Context.data.error = responseJson.error;
                        return;
                    };

                    let certificateId = responseJson[0].id;
                    Context.data.certificate_id = certificateId;
                    break;
                case "cer":
                    if (!response.ok) {
                        Context.data.error_exists = true;
                        return;
                    };
                    responseJson = JSON.parse(responseText)
                    provider = await System.signs.providers.search().where(f => f.code.eq("SignMe")).first();
                    let user = await Context.data.user!.fetch();
                    const certsData = JSON.parse(Context.data.certs_json!);
                    const now = new TDate();
                    for (let key of Object.keys(responseJson)) {
                        const certItem = certsData.find((cert: any) => cert.id === key)
                        const newdigitalSignApp = await Namespace.params.fields.digital_signs_list.app.search().where((f, g) => g.and(
                            f.__deletedAt.eq(null),
                            f.external_id.eq(certItem.id)
                        )).first();
                        let certBase64 = responseJson[key];
                        const certFile = await Context.fields.passport_main_page.create(`${user.data.__name} (${now.format("DD.MM.YY")})`, base64ToArrayBuffer(certBase64));
                        if (newdigitalSignApp) {
                            newdigitalSignApp!.data.valid_to = new Datetime(certItem.valid);
                            newdigitalSignApp!.data.cert_file = certFile;
                            newdigitalSignApp!.data.serial_number = certItem.id;
                            await newdigitalSignApp!.save();
                        }
                        let certArrayBuffer = base64ToArrayBuffer(certBase64);
                        const issueExists = !!await System.signs.digitalSigns.search().where((f, g) => g.and(
                            f.__deletedAt.eq(null),
                            f.issueID.eq(Context.data.request_id!),
                            f.__createdBy.eq(Context.data.user!)
                        )).first();
                        if (!issueExists) {
                            let newIssue = await System.signs.digitalSigns.createDraft(Context.data.request_id!, provider!);
                            await newIssue.setPublicKey(certArrayBuffer);
                            await newIssue.setStatus(<DigitalSignRequestStatus>"released");
                        }
                        let newCert = await Context.fields.certs.create(`${user.data.__name}.cer`, certArrayBuffer);
                        Context.data.certs ? Context.data.certs!.push(newCert): Context.data.certs = [newCert];
                    };
                    break;
            };
        } catch {
            throw new Error(responseText)
        }

    };
};

class SignMeProvider {
    private method = "POST";
    private contentType = "application/json"
    private headers: Record<string, string> = {
        "Content-Type": this.contentType
    };
    private baseUrl: string = Namespace.params.data.sign_me_server_address;
    private logger: SignMeLogger;

    private paths = {
        precheckPath: `${this.baseUrl}/register/precheck`,
        registerPath: `${this.baseUrl}/register/api`,
        activatePath: `${this.baseUrl}/register/activate`,
        comstaffPath: `${this.baseUrl}/register/comstaff`,
        userInfoPath: `${this.baseUrl}/register/userinfo`,
        certsInfoPath: `${this.baseUrl}/certapi/keys`,
        sendDocsPath: `${this.baseUrl}/photo`,
        getCertsPath: `${this.baseUrl}/sign/cer/`
    };

    constructor(logger: SignMeLogger) {
        this.logger = logger;
    };

    async makeRequest(path: string, body: string | any) {
        Context.data.error_exists = false;
        Context.data.error = "";
        let response: FetchResponse | undefined;
        let headers = this.headers;
        let method = this.method
        if (path.includes("cer")) {
            headers = {
                
            }
        }
        try {
            response = await fetch(path, {
                headers,
                method,
                body
            });

            if (path.includes("photo")) {
                await this.logger.logData(response, body);
            } else {
                await this.logger.logData(response);
            };
        } catch (err) {
            Context.data.error = err.message;
            Context.data.error_exists = true;
        };
    };

    async precheck() {
        let path = this.paths.precheckPath;
        let body = JSON.stringify(JSON.parse(Context.data.json_obj!).precheckDataObj);
        await this.makeRequest(path, body);
    };

    async register() {
        let path = this.paths.registerPath;

        if (Context.data.data_changed) {
            await serializeData();
            Context.data.data_changed = false;
        };

        let body = JSON.stringify(JSON.parse(Context.data.json_obj!).registerDataObj);

        await this.makeRequest(path, body);
    };

    async activate() {
        let path = this.paths.activatePath;
        let activateBody: activateData = {
            api_key,
            uid: Context.data.request_id!,
            noemail: true
        };
        let body = JSON.stringify(activateBody);
        await this.makeRequest(path, body);
    };

    async sendDocs() {
        let path = this.paths.sendDocsPath;
        let documentsObj: documentsData = JSON.parse(Context.data.json_obj!).documentsDataObj;
        let body: string;

        for (let document of documentsObj) {
            body = JSON.stringify(document);
            await this.makeRequest(path, body);
        };
    };

    async createUser() {
        let path = this.paths.comstaffPath;
        let data = new FormData();
        data.append("user_ph", Context.data.phone![0].tel);
        data.append("key", Context.data.api_key!);
        await this.makeRequest(path, data);
    };

    async getCertsInfo() {
        let path = this.paths.userInfoPath;
        let body = JSON.stringify({
            key: api_key,
            phone: Context.data.phone![0].tel,
            id: Context.data.request_id
        });
        await this.makeRequest(path, body)
        path = this.paths.getCertsPath;
        let data = new FormData();
        data.append("user_ph", Context.data.phone![0].tel);
        data.append("key", Context.data.api_key!);
        await this.makeRequest(path, data);
    };
};


const numberToDocTypeReference: Record<string, string> = {
    "1": "passport_main_page",
    "2": "passport_living_page",
    "3": "snils_file",
    "4": "release_statement"
};
const signMeLogger = new SignMeLogger();
const signMeProvider = new SignMeProvider(signMeLogger);
const api_key = Context.data.api_key!;
const ogrn = Context.data.ogrn!;
const method: string = "POST";
const headers = {
    "Content-Type": "application/json"
};
const blankFileBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAMSURBVBhXY/j//z8ABf4C/qc1gYQAAAAASUVORK5CYII=";

type revokeCertificate = {
    id: string,
    api_key: string
};

type documentData = {
    api_key: string,
    utype: string,
    uid: string,
    name: string,
    file: string,
    doctype: string
};

type documentsData = documentData[];

type activateData = {
    api_key: string,
    uid: string,
    noemail?: Boolean
};

type staffData = {
    key: string,
    phone: string,
    cogrn: string
};

interface certRequestData {
    api_key: string,
    snils: string,
    inn?: string,
    kpp?: string
};

interface precheckData extends certRequestData {
    phone: string,
    email: string,
};

interface registerData extends precheckData {
    name: string,
    surname: string,
    lastname: string,
    bdate: string,
    gender: string,
    ps: string,
    pn: string,
    issued: string,
    pcode: string,
    pdate: string,
    country: string,
    region: string,
    city: string,
    street?: string,
    house?: string,
    building?: string,
    room?: string,
    regtype: string,
    external?: string,
    delivery: string,
    ca: string,
    noemail: string
};

type requestBody = certRequestData | precheckData | registerData | activateData | staffData | revokeCertificate | FormData | undefined;
type contextKey = keyof typeof Context.data;


let documentsDataObj: documentsData = [];
let certsRequestData = new FormData()
let cecrtificateBase64: string;
let certRequestDataObj: certRequestData; 
let precheckDataObj: precheckData;
let registerDataObj: registerData;
let staffDataObj: staffData; 
let user: UserItem;
let responseData: string;


async function serializeData(): Promise<void> {
    Context.data.error = "";
    Context.data.error_exists = false;
    try {
        let inn = Context.data.inn!;
        let name = Context.data.name!;
        let surname = Context.data.surname!;
        let lastname = Context.data.lastname!;
        let email = Context.data.email![0].email;
        let phone = Context.data.phone![0].tel;
        let gender = Context.data.gender!.code.toUpperCase();;
        let bdate = Context.data.birth_date!.format("YYYY-MM-DD");
        let pn = Context.data.passport_number!;
        let ps = Context.data.passport_series!;
        let pdate = Context.data.passport_date!.format("YYYY-MM-DD");
        let pcode = Context.data.passport_code!;
        let issued = Context.data.issued_by!;
        let snils = Context.data.snils!;
        let country = "ru";
        let region = Context.data.region!;
        let city = Context.data.city!;
        let jsonObj = {};

        for (let key of Object.keys(numberToDocTypeReference)) {
            let contextKey: contextKey = numberToDocTypeReference[key];
            let fileName: string;
            let fileBase64: string;
            if (!Context.data[contextKey]) {
                fileName = "blank.png";
                fileBase64 = blankFileBase64;
            } else {
                fileName = await Context.data[contextKey].fetch().then((f: any) => f.data.__name);
                let downloadUrl = await Context.data[contextKey].getDownloadUrl();
                let currentDocBuffer = await fetch(downloadUrl).then(async r => await r.arrayBuffer());
                fileBase64 = arrayBufferToBase64(currentDocBuffer);
            }
            let currentDocObj: documentData = {
                api_key,
                utype: "1",
                uid: snils,
                doctype: key,
                file: fileBase64,
                name: fileName
            };
            documentsDataObj.push(currentDocObj);
        };

        registerDataObj = {
            api_key,
            inn,
            name,
            surname,
            lastname,
            email,
            phone,
            gender,
            bdate,
            pn,
            ps,
            pdate,
            pcode,
            issued,
            snils,
            country,
            region,
            city,
            regtype: Context.data.data_changed ? "3" : "2",
            delivery: "0",
            ca: "NKEP12",
            noemail: "1"
        };

        precheckDataObj = {
            api_key,
            phone,
            snils,
            email,
            inn
        };

        certRequestDataObj = {
            api_key,
            snils
        };

        staffDataObj = {
            key: api_key,
            cogrn: ogrn,
            phone
        };
        
        certsRequestData.append("key", api_key);
        certsRequestData.append("user_ph", registerDataObj.phone);

        jsonObj = {
            registerDataObj,
            precheckDataObj,
            certRequestDataObj,
            staffDataObj,
            documentsDataObj
        };

        Context.data.json_obj = JSON.stringify(jsonObj);
    } catch (err) {
        Context.data.error_exists = true;
        Context.data.error = err.message;
    };
};

function base64ToArrayBuffer(base64: string) {
    let binary_string = atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);

    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    };

    return btoa(binary);
};

async function precheck(): Promise<void> {
    try {
        await signMeProvider.precheck();
    } catch (err) {
        throw new Error(err.message)
    };
};

async function register(): Promise<void> {
    try {
        await signMeProvider.register();
    } catch (err) {
        throw new Error(err.message)
    };
};

async function sendPhotos(): Promise<void> {
    try {
        await signMeProvider.sendDocs();
    } catch (err) {
        throw new Error(err.message);
    };
};

async function activate(): Promise<void> {
    try {
        await signMeProvider.activate();
    } catch (err) {
        throw new Error(err.message)
    };
};

async function getCerts(): Promise<void> {
    try {
        await signMeProvider.getCertsInfo();
    } catch (err) {
        throw new Error(err.message)
    };
};