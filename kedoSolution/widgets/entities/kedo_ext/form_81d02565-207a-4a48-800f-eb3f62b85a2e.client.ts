/* Client scripts module */

async function onInit(): Promise<void> {
    if (Context.data.documents && Context.data.documents.length > 0) {
        ViewContext.data.view_documents = true;
        ViewContext.data.view_document = false;
    } else {
        ViewContext.data.view_document = true;
        ViewContext.data.view_documents = false;
    }
}
