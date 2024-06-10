/* Client scripts module */
async function onInit(): Promise<void>
{
    let user = await System.users.getCurrentUser();
    let user_card = await Context.fields.staff.app.search().where(f=> f.ext_user.eq(user)).first();
    if(user_card)
    {
        Context.data.staff =  user_card!;
    }
}

async function validate(): Promise<ValidationResult> {
    const result = new ValidationResult();
    if (new TDate().after(Context.data.date_of_dismissal!) && new TDate().format() !== Context.data.date_of_dismissal!.format()) {
        result.addContextError('date_of_dismissal', "Дата увольнение не может быть раньше текущей даты")
    }
    return result;
}
