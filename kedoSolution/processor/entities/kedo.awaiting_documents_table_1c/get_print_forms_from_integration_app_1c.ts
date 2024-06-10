/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function check_integration_app(): Promise<boolean> {
    if (!Context.data.awaiting_documents_table_1c) {
        Context.data.error = `Отсутствует приложение интеграции 1С.`;
        return false;
    }

    const integration_app = await Context.data.awaiting_documents_table_1c.fetch();

    if (integration_app.data.print_forms_table && integration_app.data.print_forms_table.length == 0) {
        Context.data.error = `Отсутствуют печатные формы в приложении интеграции. Убедитесь, что печатные формы были отправлены из ЗУП.`;
        return false;
    }

    return true;
}

async function get_print_forms(): Promise<void> {
    const integration_app = await Context.data.awaiting_documents_table_1c!.fetch();

    const doc_types_1c = await Context.fields.doc_types_1c.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const docs_table = Context.data.print_forms_table!;
    const unknown_docs_table = Context.data.unknown_print_forms_table!;

    for (const row of integration_app.data.print_forms_table!) {
        const doc_type = doc_types_1c.find(f => f.data.doc_type_id_1c == row.id_1c);

        if (doc_type) {
            const docRow = docs_table.insert();

            docRow.print_form = row.print_form;
            docRow.id_1c = row.id_1c
            docRow.doc_type_1c = doc_type;
            docRow.integration_app = integration_app;
        } else {
            const unknownDocRow = unknown_docs_table.insert();

            unknownDocRow.print_form = row.print_form;
            unknownDocRow.print_form_id = row.id_1c;
            unknownDocRow.integration_app = integration_app;
        }
    }    
}

async function check_unknown_forms_table(): Promise<boolean> {
    if (Context.data.unknown_print_forms_table && Context.data.unknown_print_forms_table.length > 0) {
        return true;
    }

    return false;
}

async function concat_table(): Promise<void> {
    const unknown_docs_table = Context.data.unknown_print_forms_table!;
    const print_forms_table = Context.data.print_forms_table!;

    for (const row of unknown_docs_table) {
        const new_row = print_forms_table.insert();
        new_row.id_1c = row.print_form_id;
        new_row.print_form = row.print_form;
        new_row.doc_type_1c = row.doc_type_1c;
        new_row.integration_app = row.integration_app;
    }

    Context.data.print_forms_table = Context.data.print_forms_table;
}

async function check_integration_apps(): Promise<boolean> {
    const counter = Context.data.integration_app_counter!;

    if (Context.data.integration_apps && Context.data.integration_apps[counter]) {
        return true;
    }

    return false;
}

async function get_integration_app(): Promise<void> {
    const counter = Context.data.integration_app_counter!;

    if (Context.data.integration_apps && Context.data.integration_apps[counter]) {
        Context.data.awaiting_documents_table_1c = Context.data.integration_apps[counter];
    }

    Context.data.integration_app_counter! += 1;
}
async function setTimer2Seconds(): Promise<void> {
    Context.data.timer = new Datetime().add(new Duration(2, "seconds"));
}
