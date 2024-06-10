/* Client scripts module */

async function onInit(): Promise<void> {
    const user = await System.users.getCurrentUser();

    const staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user)
        ))
        .first();

    if (!staff) {
        throw new Error("Не удалось найти карточку сотрудника для текущего пользователя.");
    }

    Context.data.staff = staff;

    const staff_employment_table = staff.data.employment_table;

    if (!staff_employment_table || staff_employment_table.length == 0) {
        throw new Error("У текущего сотрудника не заполнена таблица занятости.");
    }

    const organizations = staff_employment_table
        .filter(r => r.organization)
        .map(r => r.organization);

    if (organizations.length == 0) {
        throw new Error("Не найдены организации в таблице занятости сотрудника.");
    }

    Context.fields.organization.data.setFilter((f, c, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.in(organizations.map(o => o.id))
    ))

    Context.data.organization = organizations[0];
}