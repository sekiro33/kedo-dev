/* Client scripts module */
async function onInit(): Promise<void>{
    ViewContext.data.required_requisites = true
}


async function changeTable(): Promise<void> {
    if (Context.data.additional_personal_documents && Context.data.additional_personal_documents.length > 0) {
        for (let i = 0; i < Context.data.additional_personal_documents.length; i++) {
            if (!Context.data.additional_personal_documents[i].document_type && Context.data.additional_personal_documents[i].file_document) {
                Context.data.additional_personal_documents.delete(i);
                Context.data.additional_personal_documents = Context.data.additional_personal_documents;
            }
        }
    }
}
async function changeLaterSpecify(): Promise<void> {
    if (Context.data.specify_later) {
        ViewContext.data.required_requisites = false
    } else {
        ViewContext.data.required_requisites = true
    }
}

async function changeOpeningAccount(): Promise<void> {
    if (Context.data.opening_account_employer) {
        ViewContext.data.required_requisites = false
    } else {
        await changeLaterSpecify()
    }
}
