/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

/** Получить настройки КЭДО. */
async function getKedoSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const alternative_integration = settings.find(f => f.data.code == "use_alternative_integration");
    Context.data.alternative_integration = alternative_integration ? alternative_integration.data.status : false;

    const integration_1c = settings.find(f => f.data.code == "integration_1c");
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;
}

/** Найти приложение интеграции. */
async function checkIntegrationApp(): Promise<void> {
    if (!Context.data.integration_app) {
        Context.data.error = `Отсутствует приложениt интеграции. Context.data.integration_app is undefined`;
        throw new Error(Context.data.error);
    }
}

/** Проверка таблицы полученных печатных форм. */
async function checkPrintFormsTable(): Promise<boolean> {
    if (!Context.data.print_forms_table || Context.data.print_forms_table.length == 0) {
        return false;
    }

    return true;
}

async function prepareDocuments(): Promise<void> {
    const print_forms_table = Context.data.print_forms_table!;

    const doc_types = await Namespace.app.document_types.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    for (const row of print_forms_table) {
        const doc_type = doc_types.find(f => f.id == row.doc_type_1c.id)!;
        const app_code = doc_type.data.app_code;

        /*
            Код приложения в типах документов 1С совпадает с полям контекста,
            где хранятся файлы печатных форм документов, поэтому можем обращаться
            по коду + "_file".
        */

        if (Context.fields[`${app_code}_file`]) {
            Context.data[`${app_code}_file`] = row.print_form;
        }

        if (app_code === "additional_agreement") {
            push_additional_agreement(row.print_form);
        }

        if (app_code == "additional_agreement_to_the_contract") {
            push_other_doc(row.print_form);
        }
    }
}

function push_additional_agreement(file: FileItemRef): void {
    const additional_agreement_table = Context.data.additional_agreement_table!;

    const row = additional_agreement_table.insert();
    row.file = file;
}

function push_other_doc(file: FileItemRef): void {
    const other_docs_table = Context.data.other_docs_table!;

    const row = other_docs_table.insert();
    row.doc_file = file;
}

async function fillResponsibleFio(): Promise<void> {
    if (!Context.data.hr) {
        throw new Error("Кадровый сотрудник не определен. Context.data.hr is undefined");
    }

    const responsible = await Context.data.hr.fetch();

    const full_name = responsible.data.fullname;
    const formatted_name = responsible.data.responsible = full_name?.middlename ?
        `${full_name?.lastname} ${full_name?.firstname[0]}. ${full_name?.middlename[0]}.` :
        `${full_name?.lastname} ${full_name?.firstname[0]}`;

    Context.data.responsible_fio = formatted_name;
}

async function getDocumentsSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
    )).size(10000).all();

    const app_employment = settings.find(f => f.data.code == 'app_employment');
    Context.data.job_application_required = app_employment ? app_employment.data.status : false;

    const admission_order = settings.find(f => f.data.code == 'admission_order');
    Context.data.admission_order_required = admission_order ? admission_order.data.status : false;

    const app_labor = settings.find(f => f.data.code == 'information_about_labor_activity');
    Context.data.information_about_labor_activity_required = app_labor ? app_labor.data.status : false;
}

/** Сброс счетчика. */
async function resetCounter(): Promise<void> {
    Context.data.counter = 0;
}

async function incCounter(): Promise<void> {
    Context.data.counter! += 1;
}

async function checkAdditionalAgreementTable(): Promise<boolean> {
    const counter = Context.data.counter!;

    if (!Context.data.additional_agreement_table || Context.data.additional_agreement_table.length == 0) {
        return false;
    }

    if (Context.data.additional_agreement_table.length > counter) {
        return true;
    }

    return false;
}

async function checkOtherDocsTable(): Promise<boolean> {
    const counter = Context.data.counter!;

    if (!Context.data.other_docs_table || Context.data.other_docs_table.length == 0) {
        return false;
    }

    if (Context.data.other_docs_table.length > counter) {
        return true;
    }

    return false;
}

async function getAdditionalAgreement(): Promise<void> {
    const counter = Context.data.counter!;
    const additional_agreement_table = Context.data.additional_agreement_table!;

    const row = additional_agreement_table[counter];
    Context.data.file = row.file;
}

async function getOtherDoc(): Promise<void> {
    const counter = Context.data.counter!;
    const other_docs_table = Context.data.other_docs_table!;

    const row = other_docs_table[counter];
    Context.data.file = row.doc_file;
}

async function getLaborContractNumber(): Promise<void> {
    
}

async function getAdmissionOrderNumber(): Promise<void> {
    
}

/** Очистка таблиц. */
async function clearTables(): Promise<void> {
    Context.data.additional_agreement_table = Context.fields.additional_agreement_table.create();
    Context.data.other_docs_table = Context.fields.other_docs_table.create();
}

/** Получить место занятости сотрудника */
async function getStaffEmploymentPlacement(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Сотрудник не указан");
    }

    const staff = await Context.data.staff.fetch();

    const employment_table = staff.data.employment_table;

    if (!employment_table || employment_table.length == 0) {
        throw new Error("У сотрудника не заполнена таблица занятости");
    }

    const employment_placement = employment_table[0].employment_placement_app;

    if (!employment_placement) {
        throw new Error("В таблице занятости отсуствует ссылка на элемент справочника занятости");
    }

    Context.data.employment_placement = employment_placement;
}
