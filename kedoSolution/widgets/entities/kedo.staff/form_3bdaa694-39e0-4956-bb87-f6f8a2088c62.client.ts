/* Client scripts module */

async function onInit(): Promise<void> {
    ViewContext.data.stopper_need = true;
}

async function setStopper(): Promise<void> {
    if (ViewContext.data.valid_string === "true"){
        ViewContext.data.stopper_need = false;
    } else {
        ViewContext.data.stopper_need = true;
    }
}

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();
    if(!ViewContext.data.valid_string)
    {
        result.addMessage('Подпишите все документы')
    }
    return result
}
