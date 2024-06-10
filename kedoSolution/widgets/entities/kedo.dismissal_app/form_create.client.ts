/* Client scripts module */
async function onInit(): Promise<void>
{
    const current_user = await System.users.getCurrentUser();

    Context.data.staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(current_user),
            f.__status.eq(Context.fields.staff.app.fields.__status.variants.signed_documents)
        ))
        .first();
}

async function validate(): Promise<ValidationResult> {
    const result = new ValidationResult();

    if (new TDate().after(Context.data.date_of_dismissal!) && new TDate().format() !== Context.data.date_of_dismissal!.format()) {
        result.addContextError('date_of_dismissal', "Дата увольнения не может быть раньше текущей даты")
    }

    if (!Context.data.employment_placement) {
        result.addContextError("employment_placement", "Укажите место занятости, по которому требуется оформить заявку");
    }

    return result;
}
