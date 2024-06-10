
interface EmployeeInfo {
    id: string;
    code: string;
    individual_id: string;
    russianPassport: boolean;
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
//const iterationBatch: number = 30;
const iterationBatch: number = 100;

async function createNoConnectionsError(): Promise<void> {
    Context.data.error = "Нет доступных подключений 1С"
}

async function errorHandler(): Promise<void> {
    if (!Context.data.error) {
        Context.data.error = "Обнаружена неизвестная ошибка в сценарии"
    }
}

async function parseConnectionsObject(): Promise<void> {
    const connectionsArray = Context.data.connection_object ? JSON.parse(Context.data.connection_object) : [];
    if (connectionsArray.length === 0) return;
    Context.data.number_of_iter = connectionsArray.length;
    Context.data.current_iteration = 0
}

async function startIteration(): Promise<void> {
    const connectionsArray = Context.data.connection_object ? JSON.parse(Context.data.connection_object) : [];
    Context.data.connection_name = connectionsArray[Context.data.current_iteration!].name
}

async function fillInfoForRequests(): Promise<void> {
    Context.data.numberOfEmployeesParams = "Catalog_Сотрудники?$format=json&$skip=999999&$inlinecount=allpages";
    Context.data.positionParams = "InformationRegister_ЗанятостьПозицийШтатногоРасписания?$format=json";
    Context.data.batch_size = iterationBatch
}

async function getNumberOfEmployees(): Promise<void> {
    if (!Context.data.numberOfEmployeesParams) {
        Context.data.error = "Couldn\'t find number of all employees"
        return
    }
    const responseObj = JSON.parse(Context.data.employee_number_json!);
    const numberOfEmpl = parseInt(responseObj["odata.count"], 10);
    if (!!numberOfEmpl) {
        Context.data.full_iteration_amount = numberOfEmpl;
        Context.data.iteration_number = 0
    } else {
        Context.data.full_iteration_amount = 0;
        Context.data.error = "Не найдены сотрудники в базе"
    }
}

async function fillContext(): Promise<void> {
    const startSkip = Context.data.iteration_number!;
    const endSkip = Context.data.iteration_number! + iterationBatch;
    Context.data.iteration_number = endSkip;
    Context.data.personalInfoParams = `Catalog_ФизическиеЛица?$format=json&$skip=${startSkip}&$top=${endSkip}&$orderby=Ref_Key asc`;
    Context.data.employeesParams = `Catalog_Сотрудники?$format=json&$skip=${startSkip}&$top=${endSkip}&$orderby=ФизическоеЛицо_Key asc`;
    Context.data.docsParams = `InformationRegister_ДокументыФизическихЛиц?$format=json&$skip=${startSkip}&$top=${endSkip}&$orderby=Физлицо_Key asc`;

    //fix 

}

async function employeesIterationHandler(): Promise<void> {
    const promises: Promise<void>[] = [];
    const employees = Context.data.employees ? JSON.parse(Context.data.employees) : undefined;
    const personalInfo = Context.data.personalInfo ? JSON.parse(Context.data.personalInfo) : undefined;
    const docs = Context.data.docs ? JSON.parse(Context.data.docs) : undefined;
    const positions = Context.data.positions ? JSON.parse(Context.data.positions) : undefined;
    if (!(employees && personalInfo && docs && positions))
        return;

    const category = await Namespace.app.employees_categories.search().where(f => f.__name.eq("Сотрудник без ограничений")).first();
    const allStaffs = await Namespace.app.staff.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allOrganizations = await Namespace.app.organization.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allSubdivisions = await Namespace.app.structural_subdivision.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allPositions = await Namespace.app.position.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
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
            positionUser = allPositions.find(f => f.data.ref_key === positionsUser[0]["ПозицияШтатногоРасписания_Key"]);
            if (positionUser) {
                const subdivisions = allSubdivisions.filter(f => f.data.organization && f.data.organization.id === organization.id);
                subdivisionUser = subdivisions.find(f => f.data.positions && f.data.positions.find(f => f.id === positionUser!.id))
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
                tel: formatPhoneNumber(phoneNumber["Представление"]),
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
            russianPassport: employeePassportInfo["Представление"].includes("Паспорт гражданина РФ"),
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
            userApp = Namespace.app.staff.create()

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
        userApp.data.russian_passport = singleEmployeeData.russianPassport;
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
    }
    await Promise.all(promises)
}

async function endConnectionIteration(): Promise<void> {
    Context.data.current_iteration!++
}



async function array_length(): Promise<number> {
    if (Context.data.staff)
        return Context.data.staff.length;
    return 0;
}

async function check_fields(): Promise<boolean> {
    let filled = false;
    let fetched_staff = Context.data.staff!.map(async f => {
        let staff = await f.fetch();
        if (!staff.data.email || !staff.data.phone) {
            if (staff) {
                let row = Context.data.staff_table!.insert();
                row.staff = staff;
                if (staff.data.phone) row.phone = staff.data.phone;
                if (staff.data.email) row.email = staff.data.email;
            }

        }
    });
    await Promise.all(fetched_staff);
    if (Context.data.staff_table && Context.data.staff_table.length > 0) {
        return false;
    }
    return true;

}

async function staff_set(): Promise<void> {
    let promises: Promise<void>[] = [];
    for (let row of Context.data.staff_table!) {
        if (row.staff) {
            let staff = await row.staff.fetch();
            staff.data.email = row.email;
            staff.data.phone = row.phone;
            promises.push(staff.save());
        }
    }
    await Promise.all(promises);
}

async function prepare_staffs(): Promise<boolean> {
    Context.data.max_count = Math.floor(Context.data.staff!.length / 3);
    Context.data.bp_staffs = [];
    if (Context.data.current_count! > Context.data.max_count) return true;
    for (let i = Context.data.current_count! * 3; i < (Context.data.current_count! + 1) * 3; i++) {
        if (Context.data.staff![i])
            Context.data.bp_staffs.push(Context.data.staff![i]);
    }
    Context.data.current_count! += 1;
    return false;
}

async function getParams(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const alternative_integration = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.is_alternative = alternative_integration ? alternative_integration.data.status : false;
}

///////////////////////////////////////////////////////////////////////////////helpers

//задача 1261
function formatPhoneNumber(phoneNumber: string, plus: boolean = true): string {
    
    debugger;
    
    const startsWith = plus ? '+7' : '8';
    let phone = phoneNumber.replace(/[^0-9]/g, '');
    if (phone.startsWith('7') && plus) {
        phone = phone.substring(1);
    }
    if (phone.startsWith('8')) {
        phone = phone.substring(1);
    }
    
    return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/g, `${startsWith}$1$2$3$4`);
}