/* Client scripts module */

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();

    if (new TDate().after(Context.data.dismissal_date!) && new TDate().format() !== Context.data.dismissal_date!.format()) {
        result.addContextError('dismissal_date', "Дата увольнения не может быть раньше текущей даты")
    }

    if (!Context.data.employment_placement) {
        result.addContextError("employment_placement", "Укажите место занятости, по которому требуется оформить заявку");
    }

    return result;
}
