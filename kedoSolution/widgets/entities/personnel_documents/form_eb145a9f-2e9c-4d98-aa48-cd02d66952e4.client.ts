/* Client scripts module */

async function onInit(): Promise<void> {
    ViewContext.data.document_data = Context.data.document_data ? JSON.parse(Context.data.document_data) : undefined;
}