/* Client scripts module */
async function onInit(): Promise<void> {
    const user = await System.users.getCurrentUser();

    const staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user),
            f.__status.eq(Context.fields.staff.app.fields.__status.variants.signed_documents)
        ))
        .first();

    if (!staff) {
        throw new Error("Для данного пользователя не найдена карточка сотрудника");
    }

    Context.data.staff = staff;
}

async function duration_calculate(): Promise<void> {
    if (!Context.data.start_date || !Context.data.end_date) {
        Context.data.duration = undefined;
        return;
    }

    const start_date = Context.data.start_date.asDatetime(new TTime(0, 0, 0, 0));
    const end_date = Context.data.end_date.asDatetime(new TTime(23, 59, 0, 0));

    const duration = end_date.sub(start_date);
    Context.data.duration = Math.floor(duration.days);
}
