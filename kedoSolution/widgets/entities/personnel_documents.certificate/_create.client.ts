
//Ищем текущего сотрудника и ставим фильтр на желаемую дату выдачи
async function onInit(): Promise<void> {
    let user = await System.users.getCurrentUser();
    Context.data.staff = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(user)
    )).first();
    if (!Context.data.staff) {
        throw new Error('Отсутствует карточка сотрудника');
    }
    const now = new TDate()
    Context.fields.requested_issuance_date.data.setFilter((f, g) => f.gte(now));
}

//Скрипт на изменение вида справки
async function onChangeType(): Promise<void> {
    const certificate_type = await Context.data.certificate_type!.fetch();
    if (certificate_type.data.form_is_required === true) {
        ViewContext.data.are_files_required = true;
        ViewContext.data.required_files = certificate_type.data.list_of_required_documents;
    } else {
        ViewContext.data.are_files_required = false;
        ViewContext.data.required_files = '';
    }
    if (certificate_type.data.period_is_required === true) {
        ViewContext.data.show_dates = true;
    } else {
        ViewContext.data.show_dates = false;
    }
}

//Проверка дат
async function checkDate(): Promise<void> {
    await check_date_to();

    const certificate_type = await Context.data.certificate_type!.fetch();
    if (certificate_type && certificate_type.data.__name == '2-НДФЛ') {
        if (Context.data.date_from) {
            Context.fields.date_to.data.setFilter((f, g) => g.and(f.lte(new TDate((Context.data.date_from!.year), 12, 31)),f.gte(new TDate((Context.data.date_from!.year), 1,1).addDate(0,0,-1))))
            if(Context.data.date_to){
                Context.data.date_to = undefined;
            }
        }
    }
    else {
        Context.fields.date_from.data.clearFilter();
        Context.fields.date_to.data.clearFilter();
    }

}

//Валидация формы
async function validationFunction(): Promise<ValidationResult> {
    const result = new ValidationResult();
    if (ViewContext.data.show_error_dates_from === true) {
        result.addContextError('date_to', `Дата окончания периода не может быть раньше даты начала периода`);
    }
    return result
}

//Проверка даты окончания
async function check_date_to(): Promise<void> {
    let check_date_to = 0;

    if (Context.data.date_from && Context.data.date_to && Context.data.date_to.before(Context.data.date_from)) {
        check_date_to++;
        ViewContext.data.error_message += 'Дата окончания периода не может быть раньше даты начала периода';
    }
    ViewContext.data.show_error_dates_from = check_date_to > 0 ? true : false;

}
