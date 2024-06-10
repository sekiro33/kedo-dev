/* Client scripts module */

async function onInit(): Promise<void> {
    let user = await System.users.getCurrentUser();
    let staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user)
        ))
        .first();
    if (staff) {
        Context.data.staff = staff;
    }
}

async function getPositions(): Promise<void> {
    if (Context.data.wWho_acquainted!.code == 'groups') {
        ViewContext.data.view_groups = true
    } else {
        ViewContext.data.view_groups = false
    }
}
