/* Client scripts module */

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();
    let app =  await Context.data.free_from!.fetch();
    if(!Context.data.text_response && !Context.data.data_file)
    {
        result.addMessage('Заполните один из вариантов ответа')
    }
    return result
}

async function sign_required(): Promise<void> {
    if(Context.data.data_file) ViewContext.data.sign_required = true;
    else ViewContext.data.sign_required = false;
}
