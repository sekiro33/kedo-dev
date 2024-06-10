/* Client scripts module */

async function onInit(): Promise<void> {
    if (Context.data.signing_error) {
        ViewContext.data.view_signing_error = true;
    } else {
        ViewContext.data.view_signing_error = false;
    }
}

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();
    if (Context.data.application_order_signed === true && Context.data.order_is_signed === false && (Context.data.order_generation_again === false && Context.data.resigning_order === false)) {
        result.addMessage('Для отправки повторно необходимо выбрать действия для приказа');
    }

    if (Context.data.application_agreement_signed === true && Context.data.agreement_is_signed === false && (Context.data.agreement_generation_again === false && Context.data.resigning_agreement === false)) {
        result.addMessage('Для отправки повторно необходимо выбрать действия для доп.соглашения');
    }

    return result
}


async function changeLabel(): Promise<void> {
    // if ((Context.data.order_is_signed === false && (Context.data.order_generation_again === false || Context.data.resigning_order === false))) {
    //     ViewContext.data.text_error_order = true;
    // } else {
    //     ViewContext.data.text_error_order = false
    // }

    // if (Context.data.agreement_is_signed === false && (Context.data.agreement_generation_again === false || Context.data.resigning_agreement === false)) {
    //     ViewContext.data.text_error_agreement = true;
    // } else {
    //     ViewContext.data.text_error_agreement = false
    // }
}
