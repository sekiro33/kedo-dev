/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

const PROMISE_SIZE = 20;

async function createDocTypes(): Promise<void> {
    const unknown_doc_types = Context.data.unknown_doc_types ?? Context.fields.unknown_doc_types.create();
    const unknown_print_forms_table = Context.data.unknown_print_forms_table ?? Context.fields.unknown_print_forms_table.create();

    const doc_types = await Context.fields.document_types.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
        ))
        .size(10000)
        .all();

    let promises: Promise<void>[] = [];

    for (const row of unknown_doc_types) {
        // Если указали, что печатку нужно пропустить, то удаляем из таблицы все печатные формы с ID пропускаемой печатки.
        if (row.skip_print_form == true) {
            for (let i = unknown_print_forms_table.length - 1; i >= 0; i--) {
                if (unknown_print_forms_table[i].print_form_id == row.print_form_id) {
                    unknown_print_forms_table.delete(i);
                }
            }

            continue;
        }

        let doc_type = doc_types.find(f => f.data.doc_type_id_1c == row.print_form_id);

        if (!doc_type) {
            doc_type = Context.fields.document_types.app.create();

            doc_type.data.app_code = row.app_code;
            doc_type.data.doc_type_id_1c = row.print_form_id;
            doc_type.data.__name = row.doc_type_name;

            promises.push(doc_type.save());
        }

        if (promises.length > PROMISE_SIZE) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);
}

async function fillDocType(): Promise<void> {
    const unknown_print_forms_table = Context.data.unknown_print_forms_table ?? Context.fields.unknown_print_forms_table.create();

    const doc_types = await Context.fields.document_types.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
        ))
        .size(10000)
        .all();

    for (const row of unknown_print_forms_table) {
        const doc_type = doc_types.find(f => f.data.doc_type_id_1c == row.print_form_id);

        if (!doc_type) continue;

        row.doc_type_1c = doc_type;
    }
}

async function getUnknownTypes(): Promise<void> {
    const unknown_print_forms_table = Context.data.unknown_print_forms_table ?? Context.fields.unknown_print_forms_table.create();
    const unknown_doc_types = Context.fields.unknown_doc_types.create();

    for (const unknown_print_form of unknown_print_forms_table) {
        const row = unknown_doc_types.find(f => f.print_form_id === unknown_print_form.print_form_id) ?? unknown_doc_types.insert();

        row.print_form_id = unknown_print_form.print_form_id;
        row.skip_print_form = false;
        row.print_form = [...(row.print_form ?? []), unknown_print_form.print_form];
    }

    Context.data.unknown_doc_types = unknown_doc_types;
}
