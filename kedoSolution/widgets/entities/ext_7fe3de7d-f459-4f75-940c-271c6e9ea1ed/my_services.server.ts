async function getManagerGroups(): Promise< void> {
    const user = await System.users.getCurrentUser();
    const staff = await Namespace.params.fields.employee_app.app.search().where(f => f.ext_user.eq(user)).first();
    if (staff) {
        const subdividions = await staff!.fields.structural_subdivision.app.search().size(1000).all();
        const chiefPositions = subdividions.map(sub => sub.data.position?.id);
        if (staff.data.position) {
            if (chiefPositions.some(id => id == staff.data.position!.id) || staff.data.employment_table!.some(pos => chiefPositions.indexOf(pos.position.id) != -1)) {
                Context.data.show_overtime_work = true;
            };
        };
    };
    const groups = await System.userGroups.search().where((f, g) => g.or(
        f.code.eq("administrators"),
        f.code.eq("supervisor"),
        f.code.eq("758c8975-1651-41a1-9c18-b6daa1d4886d"),
        f.code.eq("abdecf4b-b6ba-419f-bac7-c1455d2a6159"),
        f.code.eq("1f19a907-9462-51f9-b9d7-55fa07777807"),
        f.code.eq("27548939-874c-433f-8f2a-bb5b13dd031d")
    )).all();

    let groupsJson: any[] = [];

    for (let group of groups) {
        let users = await group.users();
        let groupObj = {
            code: group.code,
            usersIds: users.map(u => u.id)
        };
        groupsJson.push(groupObj)
    };

    Context.data.groups_json = JSON.stringify(groupsJson)
};