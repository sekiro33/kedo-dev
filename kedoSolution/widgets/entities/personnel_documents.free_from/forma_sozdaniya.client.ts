/* Client scripts module */
async function onInit(): Promise<void> {
    let current_user = await System.users.getCurrentUser();
    Context.data.staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(current_user)))
        .first();
}