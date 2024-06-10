/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

/** Поиск приложений интеграции. */
async function search_integration_apps(): Promise<void> {
    if (!Context.data.integration_apps) {
        Context.data.integration_apps = [];
    }

    const integration_apps = await Context.fields.integration_apps.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.document_odata_name.eq("Document_ПриемНаРаботу"),
            f.__status.eq(Context.fields.await_document.app.fields.__status.variants.received),
            f.processed_elma.eq(false),
        ))
        .size(10000)
        .sort("__createdAt", true)
        .all();

    const staff = await Context.data.staff!.fetch();

    const promises: Promise<void>[] = [];

    for (const doc of integration_apps) {
        if (!doc.data.personal_guid_1c) {
            continue;
        }

        const personal_guid_1c = JSON.parse(doc.data.personal_guid_1c);

        if (personal_guid_1c[0] == staff.data.id_1c || personal_guid_1c[0] == staff.data.individual_id_1c) {
            Context.data.integration_apps!.push(doc);
            doc.data.processed_elma = true;
            promises.push(doc.save());
        }

    }

    await Promise.all(promises);
}

async function check_document(): Promise<boolean> {
    return Context.data.integration_apps && Context.data.integration_apps.length > 0 ? true : false;
}

async function get_id_document_1c(): Promise<void> {
    if (Context.data.integration_apps && Context.data.integration_apps.length > 0) {
        const integration_app = await Context.data.integration_apps[0].fetch();
        Context.data.id_document_1c = integration_app.data.doc_id_1c;
    }
}

async function getOtherDocFile(): Promise<void> {
    const index = Context.data.row_counter!;
    const file = Context.data.docs![index].doc_file;
    Context.data.file = file;
}

async function getAdditionalDocFile(): Promise<void> {
    const index = Context.data.row_counter!;
    const file = Context.data.additional_agreements![index].file;
    Context.data.file = file;
}

// Получить название файла.
async function getFileName(): Promise<void> {
    if (!Context.data.file) {
        return;
    }

    const file = await Context.data.file.fetch();
    Context.data.file_name = file.data.__name.replace(/\.[^.$]+$/, '');
}

async function fill_doc_table(): Promise<void> {
    if (!Context.data.integration_apps || Context.data.integration_apps.length == 0) {
        Context.data.error = 'Не найдено приложение интеграции'
        throw new Error(Context.data.error);
    }

    const integration_apps = await Context.fields.integration_apps.fetchAll();

    // Получаем все типы документов 1С.
    const document_types = await Context.fields.document_types.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    // Прочие документы для трудоустройства.
    const doc_table = Context.data.docs!;
    // Дополнительные соглашения.
    const additional_agreement = Context.data.additional_agreements!;

    for (const app of integration_apps) {
        // Печатные формы.
        const print_forms_table = app.data.print_forms_table!;

        for (const row of print_forms_table) {
            const doc_type = document_types.find(f => f.data.doc_type_id_1c == row.id_1c);

            if (!doc_type) {
                continue;
            }

            switch (doc_type.data.app_code) {
                case 'labor_contract':
                    Context.data.labor_contract_file = row.print_form;
                    break;

                case 'admission_order':
                    Context.data.admission_order_file = row.print_form;
                    break;

                case 'job_application':
                    Context.data.file_job_application = row.print_form;
                    break;

                case 'information_about_labor_activity':
                    Context.data.file_information_about_labor_activity = row.print_form;
                    break;

                case 'additional_agreement':
                    let additional_agreement_row = additional_agreement.find(f => f.print_form_id == row.id_1c);

                    if (!additional_agreement_row) {
                        additional_agreement_row = additional_agreement.insert();
                    }

                    additional_agreement_row.file = row.print_form;
                    additional_agreement_row.view_file = row.print_form;
                    additional_agreement_row.print_form_id = row.id_1c;
                    break;

                case 'additional_agreement_to_the_contract':
                default:
                    let other_employment_doc_row = doc_table.find(f => f.print_form_id == row.id_1c);

                    if (!other_employment_doc_row) {
                        other_employment_doc_row = doc_table.insert();
                    }

                    other_employment_doc_row.doc_file = row.print_form;
                    other_employment_doc_row.view_file = row.print_form;
                    other_employment_doc_row.print_form_id = row.id_1c;
                    break;
            }
        }
    }
}

async function create_other_docs(): Promise<void> {
    const index = Context.data.row_counter!;
    const row = Context.data.docs![index];

    if (row && row.doc_type) {
        const other_doc = Context.fields.additional_agreement_to_the_contract.app.create();
        other_doc.data.doc_type = row.doc_type ?? undefined;
        other_doc.data.__file = Context.data.file;
        other_doc.data.line_file_name = Context.data.file_name;
        other_doc.data.staff = Context.data.staff;
        other_doc.data.responsible_user = Context.data.responsible;
        other_doc.data.responsible = Context.data.responsible_name;
        await other_doc.save();
    }
}

async function check_docs_table(): Promise<boolean> {
    // Проверка на заполненость таблицы.
    if (!Context.data.docs || Context.data.docs && Context.data.docs.length == 0) {
        return false;
    }

    if (Context.data.row_counter! < Context.data.docs!.length) {
        return true;
    }

    return false;
}

async function inc_counter(): Promise<void> {
    Context.data.row_counter! += 1;
}

async function reset_counter(): Promise<void> {
    Context.data.row_counter = 0;
}

async function create_additional_agreement(): Promise<void> {
    const index = Context.data.row_counter!;
    const row = Context.data.additional_agreements![index];

    if (row) {
        const additional_agreement = Context.fields.additional_agreement.app.create();
        additional_agreement.data.__file = Context.data.file;
        additional_agreement.data.line_file_name = Context.data.file_name;
        additional_agreement.data.staff = Context.data.staff;
        additional_agreement.data.responsible_user = Context.data.responsible;
        additional_agreement.data.responsible = Context.data.responsible_name;
        await additional_agreement.save();
    }
}

async function check_additional_agreement_table(): Promise<boolean> {
    // Проверка на заполненость таблицы.
    if (!Context.data.additional_agreements || Context.data.additional_agreements && Context.data.additional_agreements.length == 0) {
        return false;
    }

    if (Context.data.row_counter! < Context.data.additional_agreements!.length) {
        return true;
    }

    return false;
}

async function get_kedo_settings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
    )).size(10000).all();

    const app_employment = settings.find(f => f.data.code == 'app_employment');
    Context.data.app_employment_required = app_employment ? app_employment.data.status : false;

    const admission_order = settings.find(f => f.data.code == 'admission_order');
    Context.data.admission_order_required = admission_order ? admission_order.data.status : false;

    const app_labor = settings.find(f => f.data.code == 'information_about_labor_activity');
    Context.data.app_labor_required = app_labor ? app_labor.data.status : false;
}

async function check_print_forms_table(): Promise<boolean> {
    if (Context.data.print_forms_table && Context.data.print_forms_table.length > 0) {
        return true;
    }

    return false;
}

// Получить номер трудового догвора.
async function getLaborContractNumber(): Promise<void> {
    if (!Context.data.labor_contract) {
        throw new Error("Не найдено приложение трудового договора. Context.data.labor_contract is undefined");
    }

    const labor_contract = await Context.data.labor_contract.fetch();

    if (!labor_contract.data.__index) {
        throw new Error("Не удалось получить номер трудового договора. labor_contract.data.__index is undefined");
    }

    Context.data.labor_contract_number = labor_contract.data.__index.toString();
}

// Получить номер приказа о приеме.
async function getAdmissionOrderNumber(): Promise<void> {
    if (!Context.data.admission_order) {
        throw new Error("Не найдено приложение приказа о приеме. Context.data.admission_order is undefined");
    }

    const admission_order = await Context.data.admission_order.fetch();

    if (!admission_order.data.__index) {
        throw new Error("Не удалось получить номер приказа о приеме. admission_order.data.__index is undefined");
    }

    Context.data.admission_order_number = admission_order.data.__index.toString();
}

// Получить ответственного за процесс.
async function getResponsibleUser(): Promise<void> {
    if (!Context.data.hr_staff || Context.data.hr_staff.length == 0) {
        throw new Error("Не найден ответственный пользователь. Context.data.hr_staff is empty or undefined");
    }

    const responsible = await Context.data.hr_staff[0].fetch();
    const full_name = responsible.data.fullname;
    const formatted_name = responsible.data.responsible = full_name?.middlename ?
        `${full_name?.lastname} ${full_name?.firstname[0]}. ${full_name?.middlename[0]}.` :
        `${full_name?.lastname} ${full_name?.firstname[0]}`;

    Context.data.responsible = responsible;
    Context.data.responsible_name = formatted_name;
}
