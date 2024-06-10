/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/


//Запись сотрудников по ролям hr, бухгалтеры, подписанты, внутренние сотрудники
async function setUsers(): Promise<void> {
    //поиск групп
    const groups = await System.userGroups.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.namespace.eq(Namespace.code)
        ))
        .size(10000)
        .all()
    if (groups.length == 0)
        return
    const hr_dep = groups.find(f => f.data.__name == 'Отдел кадров')!;
    const accounting = groups.find(f => f.data.__name == 'Бухгалтеры')!;
    const signatories = groups.find(f => f.data.__name == 'Подписанты')!;
    const innerUsers = groups.find(f => f.data.__name === "Внутренние сотрудники организации")!
    if (!hr_dep || !accounting || !signatories || !innerUsers) {
        Context.data.debug = JSON.stringify(groups.map(gr => {
            return {id: gr.id, name: gr.data.__name}
        }))
    }
    hr_dep.data.description = accounting.data.description = signatories.data.description = undefined;
    hr_dep.data.subOrgunitIds = accounting.data.subOrgunitIds = signatories.data.subOrgunitIds = undefined;
    hr_dep.data.subOrgunitIds = [];
    accounting.data.subOrgunitIds = [];
    signatories.data.subOrgunitIds = [];
    innerUsers.data.subOrgunitIds = [];

    //распределение сотрудников по группам
    const organizations = await Namespace.app.organization.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const staffs = await Namespace.app.staff.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    for (const organiaztion of organizations) {
        if (organiaztion.data.hr_department && organiaztion.data.hr_department.length > 0) {
            for (const staff of organiaztion.data.hr_department) {
                const user = staffs.find(f => f.id == staff.id)!;
                if (user && user.data.ext_user) {
                    hr_dep.data.subOrgunitIds.push(user.data.ext_user!.id)
                }
            }
        }
        if (organiaztion.data.inner_org_users && organiaztion.data.inner_org_users.length > 0) {
            for (const staff of organiaztion.data.inner_org_users) {
                const user = staffs.find(f => f.id == staff.id)!;
                if (user && user.data.ext_user) {
                    innerUsers.data.subOrgunitIds.push(user.data.ext_user!.id)
                }
            }
        }
        if (organiaztion.data.accounting && organiaztion.data.accounting.length > 0) {
            for (const staff of organiaztion.data.accounting) {
                const user = staffs.find(f => f.id == staff.id)!;
                if (user && user.data.ext_user) {
                    accounting.data.subOrgunitIds.push(user.data.ext_user!.id)
                }
            }
        }
        if (organiaztion.data.signatories && organiaztion.data.signatories.length > 0) {
            for (const staff of organiaztion.data.signatories) {
                const user = staffs.find(f => f.id == staff.id)!;
                if (user && user.data.ext_user) {
                    signatories.data.subOrgunitIds.push(user.data.ext_user!.id)
                }
            }
        }
    }
    hr_dep.data.subOrgunitIds = [...new Set(hr_dep.data.subOrgunitIds)];
    accounting.data.subOrgunitIds = [...new Set(accounting.data.subOrgunitIds)];
    signatories.data.subOrgunitIds = [...new Set(signatories.data.subOrgunitIds)];

   // await Promise.all([hr_dep.save(), accounting.save(), signatories.save()])
    await accounting.save();
    await signatories.save();
    await hr_dep.save();
    await innerUsers.save();
}
