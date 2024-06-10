/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_kedo_settings(): Promise<void> {
    const alternative_integration = await Namespace.app.settings.search().where(f => f.code.eq('use_alternative_integration')).first();
    Context.data.alternative_integration = alternative_integration ? alternative_integration.data.status : false;
}

async function get_await_document(): Promise<void> {
    if (Context.data.await_document_id) {
        const id = Context.data.await_document_id;
        Context.data.await_document = await Context.fields.await_document.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(id)
        ))
        .first();
    }
}

async function get_print_forms(): Promise<void> {
    if (Context.data.await_document) {
        const await_document = await Context.data.await_document.fetch();
        const print_forms = await_document.data.print_forms;

        if (print_forms && print_forms.length > 0) {
            Context.data.order_file = print_forms[0];
        }
    }
}

async function delete_await_document(): Promise<void> {
    if (Context.data.await_document) {
        await Context.data.await_document.delete();
    }
}
