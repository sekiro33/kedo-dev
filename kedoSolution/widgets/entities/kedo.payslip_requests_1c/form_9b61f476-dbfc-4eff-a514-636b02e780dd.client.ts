/* Client scripts module */

// Статус трудоустроен.
const signed_document = Context.fields.staffs.app.fields.__status.variants.signed_documents;

async function onInit(): Promise<void> {
    const user = await System.users.getCurrentUser();

    const staff = await Context.fields.staffs.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user)
        ))
        .first();

    if (!staff) {
        throw new Error("Не найдена карточка сотрудника.");
    }

    if (!staff.data.organization) {
        throw new Error("В карточке сотрудника не указана организация.");
    }

    Context.data.organization = staff.data.organization;

    /** Вешаем ограничения на подразделения */
    Context.fields.subdivisions.data.setFilter((f, c, g) => g.and(
        f.__deletedAt.eq(null),
        f.is_closed.eq(false),
        f.organization.link(Context.data.organization!)
    ));

    // Устанавливаем текущую дату и год.
    await set_date();
    // Расчёт периода.
    await set_period();

    /** На основе мест занятости по организации сотрудника-инициатора получаем всех сотрудников  */
    const employment_placement = await Namespace.app.employment_directory.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__status.eq(Namespace.app.employment_directory.fields.__status.variants.actual),
            f.organization.link(Context.data.organization!)
        ))
        .size(10000)
        .all();

    const staff_ids = [... new Set(
        employment_placement
            .filter(f => f.data.staff != undefined)
            .map(f => f.data.staff!.id)
    )];

    Context.fields.staffs.data.setFilter((f, c, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.in(staff_ids),
        f.__status.eq(signed_document),
    ));
}

async function generateByOnChange(): Promise<void> {
    ViewContext.data.subdivisions_visible = false;
    ViewContext.data.staffs_visible = false;

    if (!Context.data.generate_by) {
        return;
    }

    const variants = Context.fields.generate_by.variants;

    switch (Context.data.generate_by.code) {
        case variants.organization.code: {
            break;
        }

        case variants.staff.code: {
            ViewContext.data.staffs_visible = true;
            break;
        }

        case variants.subdivision.code: {
            ViewContext.data.subdivisions_visible = true;
            break;
        }

        default: {
            break;
        }
    }
}

// На основе текущей даты установить год и месяц.
async function set_date(): Promise<void> {
    const currentDate = new Datetime();
    const month = currentDate.month;

    Context.data.year = String(currentDate.year);

    switch (month) {
        case 1:
            Context.data.month = Context.fields.month.variants.january;
            break;

        case 2:
            Context.data.month = Context.fields.month.variants.february;
            break;

        case 3:
            Context.data.month = Context.fields.month.variants.march;
            break;

        case 4:
            Context.data.month = Context.fields.month.variants.april;
            break;

        case 5:
            Context.data.month = Context.fields.month.variants.may;
            break;

        case 6:
            Context.data.month = Context.fields.month.variants.june;
            break;

        case 7:
            Context.data.month = Context.fields.month.variants.july;
            break;

        case 8:
            Context.data.month = Context.fields.month.variants.august;
            break;

        case 9:
            Context.data.month = Context.fields.month.variants.september;
            break;

        case 10:
            Context.data.month = Context.fields.month.variants.october;
            break;

        case 11:
            Context.data.month = Context.fields.month.variants.november;
            break;

        case 12:
            Context.data.month = Context.fields.month.variants.december;
            break;

        default:
            break;
    }
}

// Вычисление расчётного периода.
async function set_period(): Promise<void> {
    if (Context.data.month && Context.data.year) {
        const year = Number(Context.data.year);
        const month = Context.fields.month.data.variants.findIndex(f => f.code == Context.data.month!.code) + 1;
        const start_date = new TDate(year, month, 1);
        const end_date = new TDate(year, month + 1, 1).addDate(0, 0, -1);
        Context.data.start_period_date = start_date;
        Context.data.end_period_date = end_date;
        ViewContext.data.period = `с ${start_date.format('DD MMMM YYYY г.')} по ${end_date.format('DD MMMM YYYY г.')}`;
    }
}
