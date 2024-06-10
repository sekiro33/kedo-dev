/* Client scripts module */

async function onInit(): Promise<void> {
    const currentDate = new Datetime();

    Context.fields.overdue_date.data.setFilter((f,g) => g.and(
        f.gte(currentDate)
    ));
}

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();
    let app = await Context.data.free_from!.fetch();
    if (!Context.data.text_response && !Context.data.data_file) {
        result.addMessage('Заполните один из вариантов ответа')
    }
    return result
}

async function sign_required(): Promise<void> {
    if (Context.data.data_file)
        ViewContext.data.sign_required = true;
    else
        ViewContext.data.sign_required = false;

    if (Context.data.sign_required == true) {
        ViewContext.data.hide_date = true;
    } else {
        ViewContext.data.hide_date = false;
    }
}

async function changeFieldsFile(): Promise<void> {
    if (ViewContext.data.plus_file == false) {
        Context.data.data_file = undefined;
        Context.data.sign_required = false;
        Context.data.overdue_date = undefined;
        ViewContext.data.hide_date = false;
        ViewContext.data.text_required = true;
    } else {
        ViewContext.data.text_required = false;
    }
}
