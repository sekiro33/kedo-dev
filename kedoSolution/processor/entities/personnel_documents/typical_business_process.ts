/** 
 * Поиск элемента приложения заявления.
 * На основе приложения контракта выполняет поиск конкретного элемента приложения.
 *  */
async function app_get(): Promise<void> {
    Context.data.is_financial_assistance = false;

    if (!Context.data.personnel_documents) {
        throw new Error("Context.data.personnel_documents is undefined");
    }

    const personnel_document = await Context.data.personnel_documents.fetch();
    const { id, code } = personnel_document.data.__sourceRef!;
    /**
     * На уровне раздела можно получить ссылку на конкретное приложение по коду приложения.
     */
    const app = (Namespace as any).app[code];
    const document_app = await app.search().where((f: { __id: { eq: (arg0: string) => any; }; }) => f.__id.eq(id)).first();
    Context.data.app = document_app;

    switch (code) {
        // Заявление на отпуск без сохранения оплаты
        case "application_for_leave_without_pay": {
            Context.data.leave_application_withoutpay = document_app;
            break;
        }

        // Заявление на оплачиваемый отпуск
        case "paid_leave": {
            Context.data.leavle_application = document_app;
            break;
        }

        // Служебная записка на командировку
        case "memo_business_trip": {
            Context.data.business_trip = document_app;
            break;
        }

        // Заявление на выплату пособия
        case "benefit_application": {
            Context.data.benefit_application = document_app;
            break;
        }

        // Заявление на материальную помощь
        case "application_for_financial_assistance": {
            Context.data.financial_assistance_application = document_app;

            if (Context.data.financial_assistance_application) {
                const financial_assistance_application = await Context.data.financial_assistance_application.fetch();
                const type_of_financial_assistance = await financial_assistance_application.data.type_of_financial_assistance?.fetch();
                Context.data.money = type_of_financial_assistance?.data.sum;
                Context.data.is_financial_assistance = true;
            }

            break;
        }

        // Заявление на перечисление ЗП на расчетный счет
        case "application_for_the_transfer_of_salary_to_the_current_account": {
            Context.data.application_for_transfer_to_account = document_app;
            break;
        }

        // Расчетный лист
        case "setlement_sheet": {
            Context.data.settlement_sheet = document_app;
            break;
        }

        default: {
            throw new Error("Не удалось определить тип заявления");
        }
    }
}

/** Получение настроек КЭДО. */
async function get_kedo_settings(): Promise<void> {
    const codes: string[] = [
        "custom_generate_financial_assistance_doc",
        "custom_generate_benefit_doc",
        "integration_1c",
    ]

    const settings = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.in(codes)
        ))
        .size(codes.length)
        .all();

    // Интеграция с 1С
    const integration_1c = settings.find(f => f.data.code == "integration_1c");
    Context.data.integration_1c = integration_1c && integration_1c.data.status ? integration_1c.data.status : false;

    // Проектная генерация заявления на мат. помощь
    const custom_generate_financial_assistance_doc = settings.find(f => f.data.code == "custom_generate_financial_assistance_doc");
    Context.data.custom_generate_financial_assistance_doc = custom_generate_financial_assistance_doc ? custom_generate_financial_assistance_doc.data.status : false;

    // Проектная генерация заявления на выплату пособия
    const custom_generate_benefit_doc = settings.find(f => f.data.code == "custom_generate_benefit_doc");
    Context.data.custom_generate_benefit_doc = custom_generate_benefit_doc && custom_generate_benefit_doc.data.status ? custom_generate_benefit_doc.data.status : false;
}

async function order_check(): Promise<boolean> {
    const statement = await Context.data.app!.fetch();
    if (statement.fields.linked_order) {
        Context.data.decree = statement.data.linked_order;
        return true
    }
    return false;
}

/** Обновление файла в элементе приложения. */
async function setFile(): Promise<void> {
    if (!Context.data.app) {
        throw new Error("Context.data.app is undefined");
    }

    if (!Context.data.document_file) {
        throw new Error("Context.data.document_file is undefined");
    }

    const app = await Context.data.app.fetch();
    const file = await Context.data.document_file.fetch();

    app.data.__file = file;
    app.data.line_file_name = file.data.__name;

    await app.save();
}

/** Установка статуса элемента приложения.
 * @param status_code код статуса.
 */
async function setStatus(status_code: string): Promise<void> {
    if (!Context.data.app) {
        throw new Error("Context.data.app is undefined");
    }

    const app = await Context.data.app.fetch();

    const app_statuses = app.fields.__status.all;
    const status = app_statuses.find((i: { code: string; }) => i.code == status_code);

    if (!status) {
        throw new Error(`Не найден статус с кодом ${status_code}`);
    }

    await app.setStatus(status);

    app.data.line_status = `${app.data.__status.code};${app.data.__status.name}`;
    await app.save();
}

async function status_editing(): Promise<void> {
    await setStatus('agrement');
}

async function status_signing(): Promise<void> {
    await setStatus('signing');
}

async function status_signed(): Promise<void> {
    await setStatus('signed');
}

async function status_agrement(): Promise<void> {
    await setStatus('agrement');
}

async function status_rejected(): Promise<void> {
    await setStatus('removed');
}

async function approval_list(): Promise<void> {
    const item = await Context.data.personnel_documents!.fetch();
    const approvalLists = await item.docflow().getApprovalLists();
    let list = approvalLists[approvalLists.length - 1];
    let respondets = list.respondents;
    for (let respondent of respondets) {
        if (respondent.status == "approved") {
            Context.data.responsible = await System.users.search().where(f => f.__id.eq(respondent.id)).first();
            item.data.responsible_user = Context.data.responsible;
            break;
        }
    }
    await item.save();
}

async function comment_get(): Promise<void> {
    const item = await Context.data.personnel_documents!.fetch();
    let source_item: any = item.data.__sourceRef;
    const approvalLists = await source_item!.docflow().getApprovalLists();
    Context.data.comment = '';
    let list = approvalLists[0];
    let respondets = list.respondents;
    for (let respondent of respondets) {
        if (respondent.status == "rejected") {
            Context.data.comment = respondent.comment;
            Context.data.responsible = await System.users.search().where(f => f.__id.eq(respondent.id)).first();
            break;
        }
    }
}

/** Получить файлы шаблонов по заданному приложению.
 * @param app приложение из которого будут получены файлы шаблонов.
 */
async function getAppTemplates(app: any): Promise<FileItem[]> {
    const templates: FileItem[] = [];

    const app_settings = await app.getSettings();
    const app_templates = await app_settings.getDocTemplates();

    if (app_templates && app_templates.length > 0) {
        const files = await System.files.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.in(app_templates.map((t: any) => t.fileId))
            ))
            .size(app_templates.length)
            .all();

        templates.push(...(files ?? []));
    }

    return templates;
}

/** Поиск шаблона заявления. */
async function getStatementTemplate(): Promise<void> {
    if (!Context.data.personnel_documents) {
        throw new Error("Context.data.personnel_documents is undefined");
    }

    const personnel_document = await Context.data.personnel_documents.fetch();

    if (!personnel_document.data.__sourceRef) {
        throw new Error("Context.data.personnel_documents filed '__sourceRef' is undefined");
    }

    const { id, code } = personnel_document.data.__sourceRef;

    const app = (Namespace as any).app[code];
    const app_templates = await getAppTemplates(app);

    if (app_templates.length == 0) {
        throw new Error(`Не найден файл шаблона для данного типа заявления: app_code = ${code}`);
    }

    Context.data.template_file = app_templates[0];
}

/** Создание приложения приказа и поиск шаблона. */
async function createOrderApp(): Promise<void> {
    if (!Context.data.app) {
        throw new Error("Context.data.app is undefined");
    }

    const app = await Context.data.app.fetch();

    /**
     * Если в полях заявления есть ссылка на приказ, то мы можем по этой ссылке
     * создать элемент приложения приказа.
     */
    const order = app.fields.linked_order.app.create();
    order.data.staff = Context.data.user;
    await order.save();

    app.data.linked_order = order;
    await app.save();

    Context.data.decree = order;

    // Получаем шаблон приказа.
    const templates = await getAppTemplates(app.fields.linked_order.app);

    if (templates.length == 0) {
        throw new Error(`Не найден файл шаблона для данного типа приказа: app_code = ${order.code}`);
    }

    Context.data.template_file = templates[0];

    switch (order.code) {
        // Приказ на отпуск без сохранения оплаты
        case "leave_without_pay": {
            Context.data.order_leave_without_pay = order;
            break;
        }

        // Приказ на оплачиваемый отпуск
        case "paid_leave_order": {
            Context.data.paid_leave_order = order;
            break;
        }

        // Приказ на командировку
        case "order_for_business_trip": {
            Context.data.order_for_business_trip = order;
            break;
        }

        // Приказ на материальную помощь
        case "order_financial_assistance": {
            Context.data.order_financial_assistance = order;
            break;
        }

        default: {
            break;
        }
    }
}

/** Обновить файл в приказе. */
async function setOrderFile(): Promise<void> {
    if (!Context.data.decree) {
        throw new Error("Context.data.decree is undefined");
    }

    if (!Context.data.document_file) {
        throw new Error("Context.data.document_file is undfined");
    }

    const order = await Context.data.decree.fetch();
    const file = await Context.data.document_file.fetch();

    order.data.__file = file;
    order.data.line_file_name = file.data.__name;

    await order.save();
}

async function get_responsibe(): Promise<void> {
    const item = await Context.data.app!.fetch();
    const approvalLists = await item.docflow().getApprovalLists();
    let list = approvalLists[0];
    let respondets = list.respondents;
    for (let respondent of respondets) {
        if (respondent.status == "approved") {
            Context.data.responsible = await System.users.search().where(f => f.__id.eq(respondent.id)).first();
            let responsible = await Context.data.responsible!.fetch();
            let full_name = responsible.data.fullname;
            Context.data.responsible_full_name = full_name!.lastname + ' ' + full_name?.firstname.slice(0, 1) + '.' + full_name?.middlename.slice(0, 1);
            break;
        }
    }
}

async function alert_set(): Promise<void> {
    let statement = await Context.data.app!.fetch();
    Context.data.alert_body = `${statement.data.__name} согласовано. Подпишите его электронной подписью на портале КЭДО`
}

/** 
 * Пересчет дат и длительности.
 * Выполняется только для заявлений на отпуск или командировку.
 */
async function calculate_duration(): Promise<void> {
    if (!Context.data.leave_application_withoutpay || !Context.data.leavle_application || !Context.data.business_trip) {
        return;
    }

    if (Context.data.leave_application_withoutpay) {
        const app = await Context.data.leave_application_withoutpay.fetch();

        const start_date = app.data.start_date;
        const end_date = app.data.end_date;

        if (start_date && end_date) {
            const duration = end_date.sub(start_date);

            app.data.duration = Math.floor(duration.hours / 24) + 1;
            app.data.start_line = start_date.format("DD.MM.YYYY");
            app.data.end_line = end_date.format("DD.MM.YYYY");
        }

        await app.save();
    }

    if (Context.data.leavle_application) {
        const app = await Context.data.leavle_application.fetch();

        const time = new TTime(0, 0, 0, 0);
        const start_date = app.data.start_date ? app.data.start_date.asDatetime(time) : undefined;
        const end_date = app.data.end_date ? app.data.end_date.asDatetime(time) : undefined;

        if (start_date && end_date) {
            const duration = end_date.sub(start_date);

            app.data.duration = Math.floor(duration.hours / 24) + 1;
            app.data.start_line = start_date.format("DD.MM.YYYY");
            app.data.end_line = end_date.format("DD.MM.YYYY");
        }

        await app.save();
    }

    if (Context.data.business_trip) {
        let app = await Context.data.business_trip.fetch();

        const time = new TTime(0, 0, 0, 0);
        const start_date = app.data.start_date ? app.data.start_date.asDatetime(time) : undefined;
        const end_date = app.data.end_date ? app.data.end_date.asDatetime(time) : undefined;

        if (start_date && end_date) {
            const duration = end_date.sub(start_date);

            app.data.duration = Math.floor(duration.hours / 24) + 1;
            app.data.start_line = start_date.format("DD.MM.YYYY");
            app.data.end_line = end_date.format("DD.MM.YYYY");
        }

        await app.save();
    }
}

/** Присваивание XML файла в элемент приложения. */
async function setXmlFile(): Promise<void> {
    if (!Context.data.app) {
        throw new Error("Context.data.app is undefined");
    }

    const app = await Context.data.app.fetch();
    app.data.xml_file = Context.data.xml_file;
    await app.save();
}
async function get_accounting(): Promise<void> {
    if (Context.data.organization) {
        const staffs = await Context.fields.organization.app.fields.accounting.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null)
            ))
            .size(10000)
            .all();
        let organization = await Context.data.organization.fetch();
        if (organization.data.accounting && organization.data.accounting.length > 0) {
            for (const item of organization.data.accounting) {
                const staff = staffs.find(f => f.id == item.id);
                if (staff && staff.data.ext_user && staff.data.__status && staff.data.__status.code == staff.fields.__status.variants.signed_documents.code) {
                    Context.data.accounting = (Context.data.accounting || []).concat(staff.data.ext_user!)
                }
            }
        }
    }
}
