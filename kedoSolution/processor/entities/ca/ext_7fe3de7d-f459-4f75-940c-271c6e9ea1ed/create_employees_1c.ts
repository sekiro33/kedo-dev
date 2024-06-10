/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
Документация TS SDK доступна на сайте https://tssdk.elma365.com.

Сигнатуры функций

Для синхронного взаимодействия:
	async function action(): Promise<void>;

Для модели проверки результата:
	async function action(): Promise<void>;
	async function check(): Promise<boolean>;

Для модели обратного вызова:
	async function action(url: string): Promise<void>;
	async function callback(req: HTTPRequest): Promise<void>;

**/

interface EmployeeInfo {
    id: string;
    code: string;
    individual_id: string;
    name: TFullName;
    email?: TEmail<EmailType.Work>;
    phoneNumber?: TPhone<PhoneType.Work>;
    sex: boolean;
    marriage: boolean;
    birthDate: TDate;
    city: string;
    street?: string;
    home?: string;
    apartment?: string;
    housing?: string;
    passportSeries: string;
    passportNumber: string;
    passportDepCode: string;
    passportIssueDate: TDate;
    passportIssuer: string;
    snils: string;
    inn: string;
    category?: any;
    organisation?: any;
    entity?: any;
    position?: any;
    subdivision?: any;
    value_1?: string;
    value_2?: string;
    value_3?: string;
}

let baseUrl: string;
let login: string
let password: string
let myHeaders: any

async function action(): Promise<void> {
	const personalInfo = await makeRequest('GET', "Catalog_ФизическиеЛица?$format=json")
	const docs = await makeRequest('GET', "InformationRegister_ДокументыФизическихЛиц?$format=json")
	const employees = await makeRequest('GET', `Catalog_Сотрудники?$format=json&$skip=${Context.data.skip_amount}&$top=${Context.data.batch_size}`)
    const positions = await makeRequest('GET', "InformationRegister_ЗанятостьПозицийШтатногоРасписания?$format=json")

	let promises: Promise<void>[] = [];
    if (!(employees && personalInfo && docs && positions))
        return;

    const category = await Namespace.params.fields.category_app.app.search().where(f => f.__name.eq("Сотрудник без ограничений")).first();
    const allStaffs = await Namespace.params.fields.employee_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allOrganizations = await Namespace.params.fields.org_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allSubdivisions = await Namespace.params.fields.subdiv_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allPositions = await Namespace.params.fields.position_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    let positionsArray: any[] = [];
    for (const position of positions.value) {
        positionsArray = positionsArray.concat(position.RecordSet)
    }

    for (let i = 0; i < employees.value.length; i++) {
        const data = employees.value[i];
        const employeePersonalInfo = personalInfo.value.find((info: any) => info.Ref_Key === data["ФизическоеЛицо_Key"]);
        const employeePassportInfo = docs.value.find((info: any) => info["Физлицо_Key"] === data["ФизическоеЛицо_Key"]);
        if (!(employeePersonalInfo && employeePassportInfo)) continue;
        const address = employeePersonalInfo["КонтактнаяИнформация"].find((info: any) => info["Тип"] === "Адрес");
        let addressObj: any;
        // if (address["Значение"])
        //     addressObj = JSON.parse(address["Значение"]);
        const email = employeePersonalInfo["КонтактнаяИнформация"].find((info: any) => info["Тип"] === "АдресЭлектроннойПочты");
        const phoneNumber = employeePersonalInfo["КонтактнаяИнформация"].find((info: any) => info["Тип"] === "Телефон");
        const [birthYear, birthMonth, birthDay] = employeePersonalInfo["ДатаРождения"].split("T")[0].split("-").map((item: string) => parseInt(item));
        const [issueYear, issueMonth, issueDay] = employeePassportInfo["ДатаВыдачи"].split("T")[0].split("-").map((item: string) => parseInt(item));
        //находим организацию, отдел и позицию ШР
        let entityUser: TApplication<Application$_system_catalogs$_my_companies$Data, Application$_system_catalogs$_my_companies$Params, Application$_system_catalogs$_my_companies$Processes> | undefined;
        let positionUser: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params> | undefined;
        let subdivisionUser: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params> | undefined;
        const orgId = data["ГоловнаяОрганизация_Key"];
        const organization = allOrganizations.find(f => f.data.ref_key === orgId);
        if (organization) {
            entityUser = organization.data.entity
            const positionsUser = positionsArray.filter(f => f["ФизическоеЛицо_Key"] === data["ФизическоеЛицо_Key"] && f["ГоловнаяОрганизация_Key"] === data["ГоловнаяОрганизация_Key"]);
            if (positionsUser.length > 0) {
                positionUser = allPositions.find(f => f.data.ref_key === positionsUser[0]["ПозицияШтатногоРасписания_Key"]);
                if (positionUser) {
                    const subdivisions = allSubdivisions.filter(f => f.data.organization && f.data.organization.id === organization.id);
                    subdivisionUser = subdivisions.find(f => f.data.positions && f.data.positions.find(f => f.id === positionUser!.id))
                }
            }
        }

        const singleEmployeeData: EmployeeInfo = {
            id: data.Ref_Key,
            code: data.Code,
            name: {
                firstname: employeePersonalInfo["Имя"],
                lastname: employeePersonalInfo["Фамилия"],
                middlename: employeePersonalInfo["Отчество"],
            },
            email: email ? {
                email: email["АдресЭП"],
                type: EmailType.Work,
            } : undefined,
            phoneNumber: phoneNumber ? {
                tel: phoneNumber["Представление"].replace(/\D+/g, ""),
                type: PhoneType.Work,
            } : undefined,
            sex: employeePersonalInfo["Пол"] === "Мужской",
            marriage: false,
            birthDate: new TDate(birthYear, birthMonth, birthDay),
            city: addressObj ? addressObj.city || addressObj.area : undefined,
            street: addressObj ? addressObj.street : undefined,
            home: addressObj ? addressObj.houseNumber : undefined,
            apartment: addressObj ? addressObj.apartments ? addressObj.apartments[0].number : undefined : undefined,
            housing: addressObj ? addressObj.buildings ? addressObj.buildings[0].number : undefined : undefined,
            passportSeries: employeePassportInfo["Серия"].replace(/\s/g, ''),
            passportNumber: employeePassportInfo["Номер"],
            passportDepCode: employeePassportInfo["КодПодразделения"],
            passportIssueDate: new TDate(issueYear, issueMonth, issueDay),
            passportIssuer: employeePassportInfo["КемВыдан"],
            snils: employeePersonalInfo["СтраховойНомерПФР"],
            inn: employeePersonalInfo["ИНН"],
            individual_id: employeePersonalInfo.Ref_Key,
            organisation: organization,
            entity: entityUser,
            position: positionUser,
            subdivision: subdivisionUser,

            value_1: Context.data.value_1 && personalInfo[`${Context.data.value_1}`] ? personalInfo[`${Context.data.value_1}`] : undefined,
            value_2: Context.data.value_2 && personalInfo[`${Context.data.value_2}`] ? personalInfo[`${Context.data.value_2}`] : undefined,
            value_3: Context.data.value_3 && personalInfo[`${Context.data.value_3}`] ? personalInfo[`${Context.data.value_3}`] : undefined,
        }
        // создаём нового сотрудника или обновляем уже имеющегося
        let userApp: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>;
        const user = allStaffs.find(f => f.data.id_1c === singleEmployeeData.id);
        if (user)
            userApp = user
        else
            userApp = Namespace.params.fields.employee_app.app.create()

        userApp.data.full_name = singleEmployeeData.name;
        userApp.data.name = singleEmployeeData.name.firstname;
        userApp.data.surname = singleEmployeeData.name.lastname;
        userApp.data.middlename = singleEmployeeData.name.middlename;
        userApp.data.personal_number = singleEmployeeData.code;
        userApp.data.email = singleEmployeeData.email;
        // userApp.data.staff_member = Context.data.staff_member;
        userApp.data.phone = singleEmployeeData.phoneNumber;
        userApp.data.sex = singleEmployeeData.sex;
        userApp.data.position = singleEmployeeData.position;
        userApp.data.structural_subdivision = singleEmployeeData.subdivision;
        userApp.data.marriage = singleEmployeeData.marriage;
        userApp.data.date_of_birth = singleEmployeeData.birthDate;
        userApp.data.city = singleEmployeeData.city;
        userApp.data.street = singleEmployeeData.street;
        userApp.data.home = singleEmployeeData.home;
        userApp.data.apartment = singleEmployeeData.apartment;
        userApp.data.housing = singleEmployeeData.housing;
        userApp.data.passport_series = singleEmployeeData.passportSeries;
        userApp.data.passport_number = singleEmployeeData.passportNumber;
        userApp.data.passport_department_code = singleEmployeeData.passportDepCode;
        userApp.data.date_of_issue = singleEmployeeData.passportIssueDate;
        userApp.data.issued_by = singleEmployeeData.passportIssuer;
        userApp.data.snils = singleEmployeeData.snils;
        userApp.data.inn = singleEmployeeData.inn;
        userApp.data.organization = singleEmployeeData.organisation;
        userApp.data.entity = singleEmployeeData.entity;
        if (userApp.data.staff_categories && userApp.data.staff_categories.length > 0)
            userApp.data.staff_categories = userApp.data.staff_categories
        else if (category)
            userApp.data.staff_categories = (userApp.data.staff_categories || []).concat(category)
        userApp.data.notification = userApp.fields.notification.variants.email;
        userApp.data.id_1c = singleEmployeeData.id;
        userApp.data.individual_id_1c = singleEmployeeData.individual_id;
        // userApp.data.is_employed = Context.data.is_employed;
        // userApp.data.unep_issue_required = Context.data.unep_issue_required;
        userApp.data.staff_access = true;
        userApp.data.address = `
                ${singleEmployeeData.city ? singleEmployeeData.city : ""}
                ${singleEmployeeData.street ? ", ул. " + singleEmployeeData.street : ""}
                ${singleEmployeeData.home ? ", д. " + singleEmployeeData.home : ""}
                ${singleEmployeeData.housing ? ", корп. " + singleEmployeeData.housing : ""}
                ${singleEmployeeData.apartment ? ", кв. " + singleEmployeeData.apartment : ""}
            `;

        userApp.data.value_1 = singleEmployeeData.value_1;
        userApp.data.value_2 = singleEmployeeData.value_2;
        userApp.data.value_3 = singleEmployeeData.value_3;

        promises.push(userApp.save());
        if (promises.length > 10) {
            await Promise.all(promises)
            promises = []
        }
    }
    await Promise.all(promises)
}


function getConnectionInfo(): Error | null {
	const connectionsArray = Namespace.params.data.list_of_connected_platforms ? JSON.parse(Namespace.params.data.list_of_connected_platforms) : undefined;
	if (!connectionsArray) {
		return new Error(`Не найдено записей подключения`)
	}

	const currentConnection = connectionsArray.length > 1 ? connectionsArray.find((item: any) => {
		return item.name === Context.data.connection_name
	}) : connectionsArray[0]
	if(!currentConnection) {
		return new Error(`Не найдено подключение c именем ${Context.data.connection_name}`)
	}

	baseUrl = currentConnection.url;
	login = currentConnection.login
	password = currentConnection.password
	myHeaders = {
		Authorization: `Basic ${btoa(login + ':' + password)}`,
	};
	return null
}

async function makeRequest(method: string, url: string, body?: string): Promise<any> {
	const error = getConnectionInfo();
	if (error !== null) {
		Context.data.error = error.message
		return null
	}
	const requestOptions: FetchRequest = {
		method: method,
		headers: myHeaders,
	};

	if (!!body) {
		requestOptions.body = body;
	}

	const resUrl = baseUrl + '/' + url;

	try {
		const response = await fetch(`${encodeURI(resUrl)}`, requestOptions)
		if (!response.ok) {
			Context.data.error += ` staff data res.status error; resUrl - ${resUrl} `
			throw new Error(`res error ${resUrl}`);
		}
		const responseJSON = await response.json()
		return responseJSON
	} catch (err){
		Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `
		throw new Error(err)
	}
}