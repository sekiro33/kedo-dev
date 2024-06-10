/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

/** Поиск приложений интеграции. */
async function searchIntegrationApps(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined");
    }

    if (!Context.data.integration_apps) {
        Context.data.integration_apps = [];
    }

    // Статус "Получено" для приложения интеграции.
    const received_status = Context.fields.integration_apps.app.fields.__status.variants.received;

    /**
     * Поиск приложений интеграции. Ищем по фильтрам:
     * - Не удалено
     * - В статусе "Получен"
     * - Ещё не обработан
     */
    const integration_apps = await Context.fields.integration_apps.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__status.eq(received_status),
            f.processed_elma.eq(false),
        ))
        .size(10000)
        .sort("__createdAt", true)
        .all();

    const staff = await Context.data.staff.fetch();
    const promises: Promise<void>[] = [];

    for (const app of integration_apps) {
        if (!app.data.personal_guid_1c) {
            continue;
        }

        // ID физ. лица передается в виде массива ID.
        const personal_guid_1c: string[] = JSON.parse(app.data.personal_guid_1c);

        if (personal_guid_1c.find(f => f == staff.data.id_1c) || personal_guid_1c.find(f => f == staff.data.individual_id_1c)) {
            Context.data.integration_apps.push(app);
            app.data.processed_elma = true;
            if (app.data.__name == 'ПриемНаРаботу') {
                Context.data.labor_contract_date = app.data.document_date;
                Context.data.labor_contract_number = app.data.document_number;
            }
            promises.push(app.save());
        }
    }

    await Promise.all(promises);

}

/** Проверка наличия приложений интеграции. */
async function checkIntegrationApps(): Promise<boolean> {
    return Context.data.integration_apps != undefined && Context.data.integration_apps.length > 0;
}

/** Проверка полученных печатных форм. */
async function checkPrintForms(): Promise<boolean> {
    return Context.data.print_forms_table != undefined && Context.data.print_forms_table.length > 0;
}

/** Обработка полученных печатных форм. */
async function handlePrintForms(): Promise<void> {
    const print_forms = Context.data.print_forms_table!;

    for (const row of print_forms) {
        const doc_type = await row.doc_type_1c.fetch();
        const app_code = doc_type.data.app_code;

        /*
            Код приложения в типах документов 1С совпадает с полям контекста,
            где хранятся файлы печатных форм документов, поэтому можем обращаться
            по коду + "_file".
        */

        if (Context.fields[`${app_code}_file`]) {
            Context.data[`${app_code}_file`] = row.file;
        }

        if (app_code === "additional_agreement") {
            pushAdditionalAgreement(row.file);
        }

        if (app_code == "additional_agreement_to_the_contract") {
            pushAdditionalAgreementContract(row.file);
        }
    }
}

/** Добавить строку в таблицу прочих док-ов для трудоустройства. */
function pushAdditionalAgreementContract(file: FileItemRef) {
    const additional_agreement_to_the_contract_table = Context.data.additional_agreement_to_the_contract_table!;

    const row = additional_agreement_to_the_contract_table.insert();
    row.file = file;
}

/** Добавить строку в таблицу дополнительных соглашений. */
function pushAdditionalAgreement(file: FileItemRef) {
    const additional_agreement = Context.data.additional_agreement_table!;

    const row = additional_agreement.insert();
    row.file = file;
}

/** Записать ФИО ответственного сотрудника. */
async function fillResponsibleFio(): Promise<void> {
    if (!Context.data.responsible) {
        throw new Error("Context.data.responsible is undefined");
    }

    const responsible = await Context.data.responsible.fetch();

    const full_name = responsible.data.fullname;
    const formatted_name = responsible.data.responsible = full_name?.middlename ?
        `${full_name?.lastname} ${full_name?.firstname[0]}. ${full_name?.middlename[0]}.` :
        `${full_name?.lastname} ${full_name?.firstname[0]}`;

    Context.data.fio_responsible = formatted_name;
}

/** Получить номер трудового договора. */
async function getLaborContractNumber(): Promise<void> {
    if (!Context.data.labor_contract) {
        Context.data.labor_contract_number = "1";
        return;
    }

    const labor_contract = await Context.data.labor_contract.fetch();

    if (!labor_contract.data.__index) {
        Context.data.labor_contract_number = "1";
        return;
    }

    Context.data.labor_contract_number = labor_contract.data.__index.toString();
}

/** Получить номер приказа о приеме. */
async function getOrderNumber(): Promise<void> {
    if (!Context.data.admission_order) {
        Context.data.labor_contract_number = "1";
        return;
    }

    const admission_order = await Context.data.admission_order.fetch();

    if (!admission_order.data.__index) {
        Context.data.admission_order_number = "1";
        return;
    }

    Context.data.admission_order_number = admission_order.data.__index.toString();
}

/** Проверка прочих документов для трудоустройства. */
async function checkAdditionalAgreementTable(): Promise<boolean> {
    if (!Context.data.additional_agreement_table || Context.data.additional_agreement_table.length == 0) {
        return false;
    }

    if (Context.data.row_counter! < Context.data.additional_agreement_table!.length) {
        return true;
    }

    return false;
}

/** Проверка таблицы дополнительных соглашений. */
async function checkOtherEmploymentsDocsTable(): Promise<boolean> {
    if (!Context.data.additional_agreement_to_the_contract_table || Context.data.additional_agreement_to_the_contract_table.length == 0) {
        return false;
    }

    if (Context.data.row_counter! < Context.data.additional_agreement_to_the_contract_table!.length) {
        return true;
    }

    return false;
}

/** Получить файл из таблицы дополнительных соглашений. */
async function getAdditionalAgreementFile(): Promise<void> {
    const index = Context.data.row_counter ?? 0;
    const row = Context.data.additional_agreement_table![index];

    const file = await row.file.fetch();

    Context.data.file = file;
    Context.data.file_name = file.data.__name.replace(/\.[^.$]+$/, '');
}

/** Получить файл из таблицы прочих документов для трудоустройства. */
async function getOtherEmploymentDocFile(): Promise<void> {
    const index = Context.data.row_counter ?? 0;
    const row = Context.data.additional_agreement_to_the_contract_table![index];

    const file = await row.file.fetch();

    Context.data.file = file;
    Context.data.file_name = file.data.__name.replace(/\.[^.$]+$/, '');
    Context.data.types_other_employment_docs = row.doc_type;
}

async function incCounter(): Promise<void> {
    Context.data.row_counter! += 1;
}

async function resetCounter(): Promise<void> {
    Context.data.row_counter = 0;
}

async function setIdProcess(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();
        if (staff && staff.data.id_process_recruitment && staff.data.id_process_recruitment.length > 0) {
            staff.data.id_process_recruitment += ',' + '018e56d4-5c9b-7280-a13d-0fc993812d5d'
        } else {
            staff!.data.id_process_recruitment = Context.data.__id
        }
        await staff.save()
    }
}
