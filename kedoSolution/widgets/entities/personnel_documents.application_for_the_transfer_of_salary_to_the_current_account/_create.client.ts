async function onInit(): Promise<void> {
    let user = await System.users.getCurrentUser();
    Context.data.staff = await Context.fields.staff.app.search().where(f => f.ext_user.eq(user)).first();
}