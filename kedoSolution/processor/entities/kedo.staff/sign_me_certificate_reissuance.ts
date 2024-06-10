/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type Organization = ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>;
type Staff = ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>;
type groupMeta = {name: string, fieldCode: string};
type accessSettingsMeta = {
    organizationId: string,
    accessSettingsId: string,
    docs: string[];
};
type orgDataKey = keyof typeof Context.fields.org_app.data;
type accessFieldsKey = keyof typeof Context.fields.access_settings.app.fields;
type accessDataKey = keyof typeof Context.fields.access_settings.data;

class MyRole {
    group: UserGroupItem | UserItem[] | OrganisationStructureItem
    type: 'group' | 'user' | 'orgstruct'
    code: string
    constructor(group: UserGroupItem | UserItem[] | OrganisationStructureItem, type: 'group' | 'user' | 'orgstruct', code: string) {
        this.code = code;
        this.group = group;
        this.type = type;
    };
    getUsers(): Promise<UserItem[]> {
        if (this.type == "group") {
            return (<UserGroupItem>this.group).users();
        }
        else if (this.type == "orgstruct") {
            return System.users.search().where(i => i.osIds.has((<OrganisationStructureItem>this.group))).size(10000).all()
        }
        else return new Promise<UserItem[]>(() => <UserItem[]>this.group)
    }
    json(): any {
        return {
            code: this.code,
            type: this.type
        }
    }
};

// const namespaces = [
//     "kedo",
//     "kedo_ext",
//     "personnel_documents",
//     "absences",
//     "time_tracking",
//     "absences_ext",
//     "business_trips",
//     "business_trips_ext"
// ];

// const solutionsNames = [
//     "kedo",
//     "otpuska",
//     "komandirovki"
// ];

const uselessNsCodes = [
    "admin",
    "messages",
    "company",
    "support",
    "files",
    "tasks"
];

let docCodes = [
    "Авансовые отчеты;avansovyi_otchet",
    "Служебные задания;service_assignments",
    "Служебные записки на командировку;trip_requests",
    "Приказы на командировку;order_for_a_business_trip",
    "Согласия на обработку ПДн ребенка;child_personal_data_consent",
    "Заявления на присвоение категории;application_category_assignment",
    "Доп. соглашения на ИО;execution_responsibilities_additional_agreement",
    "Приказы на перевод;order_for_transfer",
    "Заявления на увольнение;letter_of_resignation",
    "Документы для Госключа;goskey_files",
    "Доп. соглашения на перевод;additional_transfer_agreement",
    "Приказы на ИО;order_execution_responsibilities",
    "Служебные записки на ИО;memo_execution_responsibilities",
    "Согласия на перевод;transfer_approve",
    "Документы 1С;docs_1c",
    "Трудовые договоры;labor_contract",
    "Приказы о изменении паспортных данных;passport_data_change_order",
    "Соглашения об ЭВ;electronic_interaction_agreement",
    "Прочие документы трудоустройства;additional_agreement_to_the_contract",
    "Согласия на ИО;execution_responsibilities_consent",
    "Документы ЛНА;docs_lna",
    "Заявки на перевод;transfer_application",
    "Заявления на трудоустройство;job_application",
    "Доп. соглашения;additional_agreement",
    "Приказы о приеме;admission_order",
    "Приказы на увольнение;dismissal_order",
    "Приказы ЛНА;orders_lna",
    "Согласия на обработку персональных данных;consent_processing_personal_data",
    "Отзывы заявлений на увольнение;recall_dismissal",
    "Заявления на изменение паспортных данных;passport_data_application",
    "Личные документы;personal_documents",
    "Заявления о предоставлении сведений о трудовой деятельности;information_about_labor_activity",
    "На выплату пособия;benefit_application",
    "На материальную помощь;application_for_financial_assistance",
    "Расчетные листы;setlement_sheet",
    "Прочие документы;other_documents",
    "На оплачиваемый отпуск;paid_leave",
    "На материальную помощь;order_financial_assistance",
    "На командировку;memo_business_trip",
    "На перечисление ЗП на р/с;application_for_the_transfer_of_salary_to_the_current_account",
    "На отпуск без сохранения оплаты;leave_without_pay",
    "На отпуск без сохранения оплаты;application_for_leave_without_pay",
    "Совмещения;combination",
    "Справки;certificate",
    "На командировку;order_for_business_trip",
    "На оплачиваемый отпуск;paid_leave_order",
    "В свободной форме;free_from",
    "Прочие документы;prochie_dokumenty",
    "Графики отпусков;vacation_schedule",
    "Приказы на отпуск;vacation_orders",
    "Предложение в график отпусков;offer_vacation_schedule",
    "Заявления на отпуск;vacation_docs",
    "Отсрочка от мобилизации;mobilization",
    "Приказы на работу в нерабочее время;overtimeWorkOrders",
    "Приказы на сверхурочную работу;overtimeOrders",
    "Уведомления о праве отказаться;overtimeWorkNotifications",
    "Служебные записки на работу в нерабочее время;overtime_requests",
    "Согласия на работу в нерабочее время;overtimeWorkConsent",
    "Распоряжения о вызове на работу в нерабочее время;overtime_order",
    "Сотрудники;staff",
    "Заявки на перевод;transfer_application",
    "Заявки на ИО;execution_duties",
    "Заявки на присвоение категории;category_assignment",
    "Заявки на изменение персональных данных;employees_personal_data",
    "Заявки на медосмотр;medical_request",
    "Документы ЛНА;docs_lna",
    "Медосмотры;medical_examination",
    "Отпуска/отсутствия;vacations",
    "Работа в нерабочее время;overtime_work",
    "Командировки;businesstrip_requests",
    "Подразделения;structural_subdivision"
];

const defaultGroups: groupMeta[] = [
    {
        name: "Отдел кадров",
        fieldCode: "hr_department"
    },
    {
        name: "Бухгалтерия",
        fieldCode: "accounting"
    },
    {
        name: "Внутренние сотрудники организации",
        fieldCode: "inner_org_users"
    },
    {
        name: "Внешние сотрудники организации",
        fieldCode: "external_org_users"
    },
    {
        name: "Подписанты",
        fieldCode: "signatories"
    },
    {
        name: "Ответственные за КЭДО",
        fieldCode: "special_access_new"
    },
];

//Создаем группы по умолчанию для каждой организации
async function createGroupNew(): Promise<void> {
    async function saveData(group: UserGroupItem, organization: ApplicationItem<Application$kedo$organization$Data, any>): Promise<void> {
        const newRole = new MyRole(group, "group", group.id) as Role;
        let accessSettings: ApplicationItem<Application$kedo$access_settings_organization$Data, any>;
        const accessSettingsExists = allAccessSettings.length > 0 && allAccessSettings.find(setting => setting.data.organization!.id === organization.id);
        if (accessSettingsExists) {
            accessSettings = allAccessSettings.find(setting => setting.data.organization!.id === organization.id)!;
            Context.data.debug += `accessSettings ${accessSettings.data.__name} exists` + "\n";
        } else {
            accessSettings = Context.fields.access_settings.app.create();
            accessSettings.data.organization = organization;
            accessSettings.data.__name = `Доступы ${organization.data.__name}`
        }
        if (accessSettings.fields[groupObj.fieldCode as accessFieldsKey]) {
            accessSettings.data[groupObj.fieldCode as accessDataKey] = [newRole];
        };

        await accessSettings.save();

        if (!organization.data.org_groups) {
            organization.data.org_groups = [];
        };
        if (organization.data.org_groups.map(gr => gr.code).indexOf(newRole.code) == -1) {
            organization.data.org_groups.push(newRole);
            organization.data.access_settings_organization = accessSettings;
            await organization.save();
        };
    };

    const maxIterations = defaultGroups.length;
    const groupObj = defaultGroups[Context.data.iteration!];
    const allStaff = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.neq(null)
    )).size(10000).all();
    const groups = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.namespace.eq("kedo")
    )).size(10000).all();
    const organizations = await Context.fields.staff.app.fields.organization.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allAccessSettings = await Context.fields.access_settings.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.organization.neq(null)
    )).size(10000).all();
    const promises: Promise<void>[] = [];

    for (let org of organizations) {
        const newGroupName = `${groupObj.name}: ${org.data.__name}`
        let newGroup: UserGroupItem;
        if (groups.find(gr => gr.data.__name === newGroupName)) {
            newGroup = groups.find(gr => gr.data.__name === newGroupName)!;
            Context.data.debug += `group ${newGroup.data.__name} exists` + "\n";
        } else {
            newGroup = System.userGroups.create();
            newGroup.data.__name = newGroupName;
            newGroup.data.namespace = "kedo";
            newGroup.data.description = org.id;
        };

        const orgGroupMembers = <Staff[] | undefined>org.data[groupObj.fieldCode as orgDataKey];
        if (orgGroupMembers && orgGroupMembers.length > 0) {
            const staffIds = allStaff.filter(s => orgGroupMembers.map(m => m.id).indexOf(s.id) != -1).map(s => s.data.ext_user!.id);
            newGroup.data.subOrgunitIds = staffIds;
        };

        promises.push(new Promise(async function (resolve, reject) {
            await newGroup.save();
            resolve(await saveData(newGroup, org))
        }));

        // const newRole = new MyRole(newGroup, "group", newGroup.id) as Role;
        // let accessSettings: ApplicationItem<Application$kedo$access_settings_organization$Data, any>;
        // if (allAccessSettings.length > 0 && allAccessSettings.find(setting => setting.data.organization!.id === org.id)) {
        //     accessSettings = allAccessSettings.find(setting => setting.data.organization!.id === org.id)!;
        // } else {
        //     accessSettings = Context.fields.access_settings.app.create();
        //     accessSettings.data.organization = org;
        //     accessSettings.data.__name = `Доступы ${org.data.__name}`
        // }
        // if (accessSettings.fields[groupObj.fieldCode as accessFieldsKey]) {
        //     accessSettings.data[groupObj.fieldCode as accessDataKey] = [newRole];
        // };
        // await accessSettings.save();
        // if (!org.data.org_groups) {
        //     org.data.org_groups = [];
        // };
        // org.data.org_groups.push(newRole);
        // org.data.access_settings_organization = accessSettings;
        // await org.save();
    };

    await Promise.all(promises)

    if (Context.data.iteration == maxIterations - 1) {
        Context.data.all_objects_processed = true;
        Context.data.iteration = 0;
    } else {
        Context.data.iteration!++;
    }
};

//Наполняем группы бухгалтеров и кадровиков пользователями
async function fillAccountingAndHrGroups(): Promise<void> {
    const organizations = await Context.fields.org_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    let hrUsers: UserItemRef[] = [];
    let accountingUsers: UserItemRef[] = [];
    let specialUsers: UserItemRef[] = [];

    const accountingGroup = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq("dfede5be-5011-4ec9-b535-8c9ca3fc4d19")
    )).first();
    const hrGroup = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq("abdecf4b-b6ba-419f-bac7-c1455d2a6159")
    )).first();
    const specialAccessGroup = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq("0798a43a-8ed9-4b30-8dfe-e16559fb7695")
    )).first();

    const existingHrUsersIds = await hrGroup!.users(0, 500).then(users => users.map(u => u.id));
    const existingAccountingUsersIds = await accountingGroup!.users(0, 500).then(users => users.map(u => u.id));
    const existingSpecialUsersIds = await specialAccessGroup!.users(0, 500).then(users => users.map(u => u.id));

    for (let org of organizations) {
        try {
            if ((!org.data.hr_department || org.data.hr_department.length < 1) && (!org.data.accounting || org.data.accounting.length < 1) && (!org.data.special_access_new || org.data.special_access_new.length < 1)) {
                Context.data.debug += `no hr, accounting, or special users for ${org.data.__name}`
                continue;
            };
            const hrStaff = await org.fields.hr_department.fetchAll();
            const filteredHr = hrStaff.filter(s => s.data.ext_user && existingHrUsersIds.indexOf(s.data.ext_user.id) === -1);
            hrUsers.push(...filteredHr.map(s => s.data.ext_user!));
            const accountingStaff = await org.fields.accounting.fetchAll();
            const filteredStaff = accountingStaff.filter(s => s.data.ext_user && existingAccountingUsersIds.indexOf(s.data.ext_user.id) === -1);
            accountingUsers.push(...filteredStaff.map(s => s.data.ext_user!));
            const specialStaff = await org.fields.special_access_new.fetchAll();
            const filteredSpecials = specialStaff.filter(s => s.data.ext_user && existingSpecialUsersIds.indexOf(s.data.ext_user.id) === -1);
            specialUsers.push(...filteredSpecials.map(s => s.data.ext_user!))
        } catch {
            continue;
        };
    };

    const filteredHr = Array.from(new Set(hrUsers));
    const filteredAccounting = Array.from(new Set(hrUsers));
    const filteredSpecials = Array.from(new Set(specialUsers))
    await hrGroup!.addItem(...filteredHr);
    await accountingGroup!.addItem(...filteredAccounting);
    await specialAccessGroup!.addItem(...filteredSpecials)
    await accountingGroup!.save();
    await hrGroup!.save();
    await specialAccessGroup!.save();
};


//Получаем все решения
async function getSolutions(): Promise<void> {
    const tokenSetting = await Namespace.app.settings.search().where(f => f.code.eq("api_key")).first();
    // const domenSetting = await Namespace.app.settings.search().where(f => f.code.eq("domen")).first();
    
    if (!tokenSetting) {
        throw new Error("Проверьте заполненность настроек Домен и Api-токен для методов в модуле в приложении Меню настроек.")
    };

    const token = tokenSetting.data.value;
    const domen = System.getBaseUrl();
    Context.data.domen = domen;
    Context.data.token = token;

    const fullUrl = `${domen}/pub/v1/scheme/namespaces`;
    const response = await fetch(fullUrl, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error(JSON.stringify({
            func: "getSolutions",
            err: await response.text()
        }));
    };
    const responseJson = await response.json();
    if (responseJson.result.result.length < 1) {
        throw new Error("Не найдено разделов");
    };
    let allNamespaces = responseJson.result.result.map((solution: any) => solution.code);

    allNamespaces = allNamespaces.filter((ns: string) => {
        return !ns.startsWith("ext_") && !ns.startsWith("_") && uselessNsCodes.indexOf(ns) == -1
    });
    Context.data.max_iteration = allNamespaces.length;
    Context.data.ns_codes = JSON.stringify(allNamespaces);
};

//Получаем все приложения
async function getAllApps(): Promise<void> {
    const namespaces = JSON.parse(Context.data.ns_codes!);
    const childProcessJson: {name: string, path: string}[] = Context.data.child_process_json ? JSON.parse(Context.data.child_process_json) : [];
    const currentNs = namespaces[Context.data.iteration!];
    let allDocs: string[] = Context.data.app_codes ? JSON.parse(Context.data.app_codes) : [];

    const appsUrl = `${Context.data.domen}/pub/v1/scheme/namespaces/${currentNs}/apps`;
    const response = await fetch(appsUrl, {
        headers: {
            Authorization: `Bearer ${Context.data.token}`
        }
    });
    
    if (!response.ok) {
        Context.data.debug += ` ${JSON.stringify({url: appsUrl, func: "getAllApps", err: await response.text()})} `;
        return;
    };
    const responseJson = await response.json();
    const apps = responseJson.result.result;
    if (apps.length < 1) {
        Context.data.debug += `ns ${currentNs} Не найдено приложений`;
    };
    const appCodes = apps.map((app: any) => {
        const appCode = app.code;
        const appObj = `${app.namespace};${appCode}`;
        return appObj;
    });
    const childProcessData = apps.map((app: any) => {
        const appCode = app.code;
        const ns = app.namespace;
        const name = app.name;
        return {
            name,
            path: `${ns};${appCode}`
        }
    });

    childProcessJson.push(...childProcessData);
    allDocs.push(...appCodes);
    Context.data.app_codes = JSON.stringify(allDocs);
    Context.data.child_process_json = JSON.stringify(childProcessJson);
    if (Context.data.iteration === Context.data.max_iteration! - 1) {
        Context.data.all_apps_processed = true;
        Context.data.iteration = 0;
    } else {
        Context.data.iteration!++;
    }
};

//Получаем все документы
async function getAllDocs(): Promise<void> {
    Context.data.pause_process = false;
    let childProcessJson: {name: string, path: string}[] = JSON.parse(Context.data.child_process_json!);
    const allCodes: string[] = JSON.parse(Context.data.app_codes!);
    const chunk = allCodes.slice(Context.data.from!, Context.data.from! + Context.data.max_chunk_size!);
    let allDocs: string[] = Context.data.all_docs ? JSON.parse(Context.data.all_docs!) : []
    if (!chunk || chunk.length === 0) {
        Context.data.all_namespacess_processed = true;
        return;
    };

    let promises: Promise<any>[] = [];

    for (let app of chunk) {
        const [currentNs, appCode] = app.split(";");

        const fullUrl = `${Context.data.domen}/pub/v1/scheme/namespaces/${currentNs}/apps/${appCode}`;
        promises.push(fetch(fullUrl, {
            headers: {
                Authorization: `Bearer ${Context.data.token}`
            }
        }).then(async resp => {
            if (!resp.ok) {
                const respText = await resp.text();
                if (respText.includes("too many")) {
                    Context.data.pause_process = true;
                    Context.data.timeout = new TTime().add(new Duration(30, "seconds"));
                };
                Context.data.debug += ` ${JSON.stringify({url: fullUrl, func: "getAllDocs", error: respText})} `;
                return;
            };
            return resp.json();
        }).catch(err => {
            Context.data.debug += ` error at getAllDocs check apps cycle: ${err.message} `
            return ""
        }));
    };
    const jsonData = await Promise.all(promises).then(items => items.filter(item => item));
    if (Context.data.pause_process) {
        return;
    };
    let docs: string[] = [];

    for (let data of jsonData) {
        const appCode = data.application.code;

        if (!data.application.fields.find((field: any) => field.code === "access_group")) {
            childProcessJson = childProcessJson.filter(app => {
                const itemCode = app.path.split(";")[1];
                return appCode !== itemCode;
            });
            continue;
        };

        const fullCode = docCodes.map(obj => obj.split(";")[1]).indexOf(appCode) === -1 ? appCode + "_extended" : appCode
        const appObj = `${data.application.name};${fullCode}`;
        
        if (docCodes.indexOf(appObj) === -1) {
            docCodes.push(appObj);
        };

        docs.push(appObj);
    };


    allDocs.push(...docs.filter(doc => doc));
    Context.data.child_process_json = JSON.stringify(childProcessJson);
    Context.data.all_docs = JSON.stringify(allDocs);

    if (chunk.length < Context.data.max_chunk_size!) {
        Context.data.all_namespacess_processed = true;
        await formMetaData();
    } else {
        Context.data.debug += ` processed codes: ${JSON.stringify(chunk)} `;
        Context.data.from! += Context.data.max_chunk_size!;
    };
};

async function formMetaData(): Promise<void> {
    const docs = JSON.parse(Context.data.all_docs!);
    const organizations = await Context.fields.org_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    let chunks: accessSettingsMeta[] = [];

    for (let org of organizations) {
        if (org.data.access_settings_organization) {
            chunks.push({
                organizationId: org.id,
                accessSettingsId: org.data.access_settings_organization.id,
                docs
            });
        };
    };
    Context.data.max_iteration = chunks.length;
    Context.data.chunks = chunks;
};

//Создаем группы для документов
async function createAllGroups(): Promise<void> {
    const groups = await System.userGroups.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const metaData = Context.data.chunks ? <accessSettingsMeta> Context.data.chunks[Context.data.iteration!] : undefined;
    if (metaData) {
        const org = await Context.fields.org_app.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(metaData!.organizationId)
        )).first();

        let promises: Promise<void>[] = [];

        for (let docObj of metaData.docs) {
            const docName = docObj.split(";")[0];
            const groupExists = groups.find(gr => gr.data.__name === `Доступы для ${docName} ${org!.data.__name}`);
            if (!groupExists) {
                const newGroup = System.userGroups.create();
                newGroup.data.__name = `Доступы для ${docName} ${org!.data.__name}` 
                newGroup.data.namespace = "kedo";
                newGroup.data.subOrgunitIds = org!.data.org_groups && org!.data.org_groups.length > 0 ? groups.filter(group => org!.data.org_groups!.map(gr => gr.code).indexOf(group.id!) != -1).map(gr => gr.id) : undefined;
                newGroup.data.description = org!.id;
                promises.push(newGroup.save());
                if (promises.length >= Context.data.max_chunk_size!) {
                    await Promise.all(promises);
                    promises = [];
                }
            };
        };
    await Promise.all(promises);
    };
    if (Context.data.iteration == Context.data.max_iteration! - 1) {
        Context.data.all_groups_created = true;
        Context.data.iteration = 0;
    } else {
        Context.data.iteration!++;
    };
};

//Заполнение групп доступа
async function fillOrgRights(): Promise<void> {
    const chunk = <accessSettingsMeta>Context.data.chunks[Context.data.iteration!];
    const orgId = chunk.organizationId;
    const accessSettingsId = chunk.accessSettingsId;
    const docs = chunk.docs;
    const groups = await System.userGroups.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const org = await Context.fields.org_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(orgId)
    )).first();
    const orgRights = await Context.fields.access_settings.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(accessSettingsId)
    )).first();

    if (!orgRights) {
        Context.data.iteration!++;
        return;
    };
    for (let doc of docs) {
        let [docName, docCode] = doc.split(";");
        if (!org || !orgRights.fields[docCode as keyof typeof orgRights.fields]) {
            Context.data.debug += `no field code ${docCode} at ${orgRights.data.__name}`
            continue;
        };
        const group = groups.find(gr => gr.data.__name === `Доступы для ${docName} ${org!.data.__name}`);
        if (group) {
            const groupRole = new MyRole(group, "group", group.data.__id) as Role;
            if (!orgRights.data[docCode as accessDataKey]) {
                orgRights.data[docCode as accessDataKey] = [groupRole];
                Context.data.debug += `field ${docCode} assigned to ${orgRights.data.__name}`
            } else {
                Context.data.debug += `field ${docCode} at ${orgRights.data.__name} already filled`
            };
        };
    };
    
    await orgRights.save();
    if (Context.data.iteration! >= Context.data.max_iteration! - 1) {
        Context.data.all_objects_processed = true;
        Context.data.iteration = 0;
    } else {
        Context.data.iteration!++;
    };
};

//deprecate
// async function getAppNamespaces(solutions: string[]): Promise<any[]> {
//     let allNamespaces: any[] = [];
//     for (let code of solutions) {
//         const fullUrl = `${Context.data.domen!}/pub/v1/scheme/solutions/${code}`;
//         const response = await fetch(fullUrl, {
//             headers: {
//                 Authorization: `Bearer ${Context.data.token}`
//             }
//         });
//         if (!response.ok) {
//             throw new Error(JSON.stringify({
//                 func: "getAppNamespaces",
//                 err: await response.text()
//             }));
//         };
//         const responseJson = await response.json();
//         const content = responseJson.solution.content;
//         if (content.length < 1) {
//             Context.data.debug +=`no apps in namespace ${code}`;
//             continue;
//         };
//         const mappedNamespaces = content.map((ns: any) => ns.code);
//         allNamespaces.push(...mappedNamespaces);
//     };
//     return allNamespaces;
// };


//Проверка незаполненных полей
async function setMissingFields(): Promise<void> {
    const allOrgs = await Context.fields.org_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allOrgRights = await Context.fields.access_settings.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allGroups = await System.userGroups.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    for (let orgRights of allOrgRights) {
        const org = allOrgs.find(o => o.id === orgRights.data.organization!.id);
        const newRightsFields: string[] = [];
        for (let field of docCodes) {
            const [appCode, appName] = [field.split(";")[1], field.split(";")[0]]
            if (!orgRights.data[appCode as keyof typeof orgRights.data]) {
                const group = allGroups.find(group => group.data.__name === `Доступы для ${appName} ${org!.data.__name}`)
                if (group) {
                    const newRole = new MyRole(group, "group", group.id);
                    orgRights.data[appCode as keyof typeof orgRights.data] = [newRole];
                    newRightsFields.push(appName)
                };
            };
        };
        await orgRights.save().then(_ => Context.data.debug += `${orgRights.data.__name} processed, new fields: ${newRightsFields.join(", ")} `)
    };
};