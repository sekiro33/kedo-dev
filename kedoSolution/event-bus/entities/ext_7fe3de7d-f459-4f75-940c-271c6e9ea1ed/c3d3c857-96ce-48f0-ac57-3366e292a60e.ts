class MyRole {
    group: UserGroupItem | UserItem[] | OrganisationStructureItem
    type: 'group' | 'user' | 'orgstruct'
    code: string
    constructor(group: UserGroupItem | UserItem[] | OrganisationStructureItem, type: 'group' | 'user' | 'orgstruct', code: string) {
        this.code = code;
        this.group = group;
        this.type = type;
    }
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

let appCodes = [
    "avansovyi_otchet",
    "service_assignments",
    "trip_requests",
    "order_for_a_business_trip",
    "child_personal_data_consent",
    "application_category_assignment",
    "execution_responsibilities_additional_agreement",
    "order_for_transfer",
    "letter_of_resignation",
    "additional_transfer_agreement",
    "order_execution_responsibilities",
    "memo_execution_responsibilities",
    "transfer_approve",
    "docs_1c",
    "labor_contract",
    "passport_data_change_order",
    "electronic_interaction_agreement",
    "additional_agreement_to_the_contract",
    "execution_responsibilities_consent",
    "docs_lna",
    "transfer_application",
    "job_application",
    "additional_agreement",
    "admission_order",
    "dismissal_order",
    "orders_lna",
    "consent_processing_personal_data",
    "recall_dismissal",
    "passport_data_application",
    "personal_documents",
    "information_about_labor_activity",
    "benefit_application",
    "application_for_financial_assistance",
    "setlement_sheet",
    "other_documents",
    "paid_leave",
    "order_financial_assistance",
    "memo_business_trip",
    "application_for_the_transfer_of_salary_to_the_current_account",
    "leave_without_pay",
    "application_for_leave_without_pay",
    "certificate",
    "order_for_business_trip",
    "paid_leave_order",
    "free_from",
    "prochie_dokumenty",
    "vacation_schedule",
    "vacation_orders",
    "offer_vacation_schedule",
    "vacation_docs",
    "mobilization",
    "overtimeWorkOrders",
    "overtimeOrders",
    "overtimeWorkNotifications",
    "overtime_requests",
    "overtimeWorkConsent",
    "overtime_order",
    "staff",
    "transfer_application",
    "execution_duties",
    "category_assignment",
    "employees_personal_data",
    "medical_request",
    "docs_lna",
    "vacations",
    "overtime_work",
    "businesstrip_requests",
    "personnel_documents",
    "structural_subdivision"
];

let customAppCodes: string[] = [];

async function logError(message: string): Promise<void> {
    const newLogItem = Namespace.params.fields.logs_app.app.create();
    newLogItem.data.log = message;
    await newLogItem.save();
};

async function action(): Promise<void> {
    const customCodesSetting = await Namespace.params.fields.settings.app.search().where(f => f.code.eq("custom_app_codes")).first();
    if (customCodesSetting && customCodesSetting.data.value) {
        customAppCodes = customCodesSetting.data.value.split(",").map(code => code.trim());
        appCodes = appCodes.concat(customAppCodes);
    };
    let appCode = Context.data.__item!.code;
    if (appCode === "kedo_logs") {
        return;
    };
    if (appCodes.indexOf(appCode) == -1 || !Context.data.__item) {
        // await logError(`app code ${appCode} not in appCodes`)
        return;
    };
    let staff: ApplicationItem<Application$kedo$staff$Data, any> | undefined;
    try {
        if (appCode === "staff") {
            staff = await Namespace.params.fields.employee_app.app.search().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.eq(Context.data.item.__id)
            )).first();
        } else if  ([
                "vacations",
                "vacation_docs",
                "vacation_orders",
                "offer_vacation_schedule",
                "overtime_work",
                "businesstrip_requests",
                "trip_requests",
                "order_for_a_business_trip",
                "avansovyi_otchet",
                "service_assignments"
            ].indexOf(appCode) != -1) {
                try {
                    staff = await Namespace.params.fields.employee_app.app.search().where((f, g) => g.and(
                        f.__deletedAt.eq(null),
                        f.__id.eq(Context.data.item.kedo_staff[0])
                    )).first();
                } catch {
                    throw new Error(`Cоздание элемента: no staff[0] at ${Context.data.__item.code}/${Context.data.__item.id}`);
                };
        } else if (appCode === "structural_subdivision") {
            staff = undefined;
        } else {
            try {
                staff = await Namespace.params.fields.employee_app.app.search().where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.__id.eq(Context.data.item.staff[0])
                )).first();
            } catch {
                throw new Error(`Cоздание элемента: no staff[0] at ${Context.data.__item.code}/${Context.data.__item.id}`)
            }
        };

        if (customAppCodes.indexOf(appCode) !== -1) {
            appCode += "_extended"
        };

        if (staff || appCode === "structural_subdivision") {
            if (staff && appCode == "staff" && staff!.data.employment_table && staff!.data.employment_table.length > 1) {
                const staffOrgs = staff!.data.employment_table.map(row => row.organization.id);
                const orgsWithAccessRights = await Namespace.params.fields.org_app.app.search().where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.__id.in(staffOrgs),
                    f.access_settings_organization.neq(null)
                )).size(10000).all();
                const orgsAccessSettings = await Promise.all(orgsWithAccessRights.map(org => org.data.access_settings_organization!.fetch())).then(accessSettings => accessSettings.filter(setting => setting.data.staff));
                let accessRightsForElement = await Promise.all(orgsAccessSettings.map(async accessSetting => {
                    try {
                        const accessGroup = await System.userGroups.search().where((f ,g) => g.and(
                            f.__deletedAt.eq(null),
                            f.__id.eq(accessSetting.data.staff![0].code)
                        )).first();
                        if (accessGroup) {
                            const newRole = new MyRole(accessGroup, "group", accessGroup.id) as Role;
                            return newRole
                        };
                    } catch {
                        throw new Error(`Cоздание элемента: no code staff at access settings ${accessSetting.id} for item ${Context.data.__item!.code}/${Context.data.__item!.id}`)
                    };
                }));
                accessRightsForElement = accessRightsForElement.filter(item => item);
                const itemToChange = await Context.data.__item.fetch();
                itemToChange.data.access_group = accessRightsForElement
                await itemToChange.save();
            } else {
                if (!staff && appCode !== "structural_subdivision") {
                    await logError(`Cоздание элемента: Приложение - не подразделение и не найдено поле staff: ${Context.data.__item.code}/${Context.data.__item.id}`)
                    return;
                };
                if (staff && !staff.data.organization) {
                    await logError(`Cоздание элемента: У сотрудника ${staff.id} не присвоена организация`)
                    return;
                }

                let organization: ApplicationItem<Application$kedo$organization$Data, any> | undefined;

                try {
                    organization = appCode == "structural_subdivision" ? await Namespace.params.fields.org_app.app.search().where((f, g) => g.and(
                        f.__deletedAt.eq(null),
                        f.__id.eq(Context.data.item.organization[0])
                    )).first() : await staff!.data.organization!.fetch();
                } catch {
                    throw new Error(`Cоздание элемента: no organization for item ${Context.data.__item.code}/${Context.data.__item.id}`)
                };

                if (!organization || !organization.data.access_settings_organization) {
                    await logError(`Cоздание элемента: У сотрудника ${staff!.id} не присвоена организация или у организации ${organization ? organization.id : "undefined"} не привязаны настройки доступа`);
                    return;
                };
                const accessSettings = await organization.data.access_settings_organization.fetch();
                if (!accessSettings.data[appCode as keyof typeof accessSettings.data] || accessSettings.data[appCode as keyof typeof accessSettings.data].length < 1) {
                    await logError(`Cоздание элемента: У настроек доступа ${accessSettings!.id} не заполнено поле ${appCode}`);
                    return;
                };

                let accessGroup: UserGroupItem | undefined

                try {
                    accessGroup = await System.userGroups.search().where((f ,g) => g.and(
                        f.__deletedAt.eq(null),
                        f.__id.eq(accessSettings.data[appCode as keyof typeof accessSettings.data]![0].code)
                    )).first();
                } catch {
                    throw new Error(`no field ${appCode} at access setting ${accessSettings.id}`);
                };

                if (accessGroup) {
                    const newRole = new MyRole(accessGroup, "group", accessGroup.id) as Role
                    const itemToChange = await Context.data.__item.fetch();
                    itemToChange.data.access_group = [newRole];
                    await itemToChange.save();
                } else {
                    await logError(`Cоздание элемента: Не найдена группа с id ${accessSettings.data[appCode as keyof typeof accessSettings.data]![0].code}`);
                    return;
                };
            }
        } else {
            await logError(`Cоздание элемента: Не заполнено поле staff у ${Context.data.__item.code}/${Context.data.__item.id}`);
            return;
        }

    } catch (err) {
        await logError(`Cоздание элемента: ${Context.data.__item.code}/${Context.data.__item.id} : ${err.message}`)
        return;
    }
};
    