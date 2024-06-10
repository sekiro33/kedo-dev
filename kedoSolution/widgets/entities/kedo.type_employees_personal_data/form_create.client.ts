/* Client scripts module */
async function onInit(): Promise<void> {
}

async function changeLabels(): Promise<void> {
    if (Context.data.application_personal_data == false && (Context.data.order_personal_data == true || Context.data.additional_agreement_personal_data == true)) {
        ViewContext.data.text_error = true;
    } else {
        ViewContext.data.text_error = false;
    }
}
