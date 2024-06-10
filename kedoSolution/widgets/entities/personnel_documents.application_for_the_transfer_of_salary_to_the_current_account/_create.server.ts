async function onInit(): Promise<void> {
    ViewContext.data.staff_hide = true;
    let user = await System.users.getCurrentUser();
    let group = await System.userGroups.search().where(f => f.__id.eq('f25906e4-41c3-5a89-8ec2-06648dd1f614')).first();
    let ext_user = (await group!.users(0, group!.users.length)).find(f => f.data.email == user.data.email);
    if (ext_user) {
        Context.data.staff = await Context.fields.staff.app.search().where(f => f.ext_user.eq(ext_user!)).first();
    }
    else {
        //ViewContext.data.staff_hide = false;
    }
}