/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function staffs_get(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    Context.data.staff_user = staff.data.ext_user;
    let position: TApplication<Application$kedo$position$Data, Application$kedo$position$Params, Application$kedo$position$Processes> | undefined;
    position = Context.data.position ? Context.data.position : staff.data.position;
    const documents_pull = await Context.fields.docs_lna.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.positions_review.has(position!),
            g.or(
                f.__status.eq(Context.fields.docs_lna.app.fields.__status.variants.approved),
                f.__status.eq(Context.fields.docs_lna.app.fields.__status.variants.current)
            )
        ))
        .size(10000)
        .all();
    Context.data.all_docs_lna = documents_pull;
    Context.data.docs_count = Context.data.all_docs_lna ? Context.data.all_docs_lna.length : 0;
    Context.data.counter = 0;
}

async function set_current_lna(): Promise<boolean> {
    if (Context.data.all_docs_lna && Context.data.all_docs_lna.length > 0) {
        Context.data.docs_lna = Context.data.all_docs_lna[0];
        Context.data.all_docs_lna.splice(0, 1);
        return true
    }
    return false;
}

async function get_doc(): Promise<void> {
    const start = Context.data.counter;
    const end = Context.data.counter! + 1;
    Context.data.docs_lna = Context.data.all_docs_lna!.slice(start, end)[0];
    Context.data.counter = end;
    const app = await Context.data.docs_lna.fetch();
    Context.data.review_date = new Datetime().addDate(0, 0, app.data.familiarize_days || 1)
}

async function add_lna_doc(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff!.fetch();
        if (Context.data.docs_lna) {
            if(staff.data.list_sign_lna) {
                staff.data.list_sign_lna.push(Context.data.docs_lna)
            } else {
                staff.data.list_sign_lna = [];
                staff.data.list_sign_lna.push(Context.data.docs_lna)
            }
            staff.data.list_sign_lna = staff.data.list_sign_lna
            await staff.save();

            const lna = await Context.data.docs_lna.fetch();
            const row_list = lna.data.list_acquaintances!.insert();
            row_list.staff = Context.data.staff;
            row_list.date_review = new Datetime;
            lna.data.list_acquaintances = lna.data.list_acquaintances;
            await lna.save();
        }
    }
}

async function addUserToGroup(): Promise<void> {
    const user = await Context.data.staff_user!.fetch();
    const staff = await Context.data.staff!.fetch();
    const readPermission = [new PermissionValue(user, [PermissionType.READ, PermissionType.ASSIGN, PermissionType.UPDATE, PermissionType.CREATE])];
    await staff.setPermissions(new Permissions(readPermission));
    
    let userIsHrOrAccounting = false;
    if (staff.data.position && staff.data.organization) {
        const organization = await staff.data.organization.fetch();
        const hrPositions = organization.data.hr_department_positions ? organization.data.hr_department_positions.map(pos => pos.id) : undefined;
        const accountingPositions = organization.data.accounting_positions ? organization.data.accounting_positions.map(pos => pos.id) : undefined;
        if (hrPositions) {
            const userIsHr = hrPositions.indexOf(staff.data.position.id) != -1;
            if (userIsHr) {
                const hrGroup = await System.userGroups.search().where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.code.eq("abdecf4b-b6ba-419f-bac7-c1455d2a6159")
                )).first();
                if (hrGroup) {
                    userIsHrOrAccounting = true;
                    if (!organization.data.hr_department || organization.data.hr_department.length < 1) {
                        organization.data.hr_department = [staff]
                    } else {
                        organization.data.hr_department.push(staff)
                    };
                    await organization.save();
                    await hrGroup.addItem(user);
                    await hrGroup.save();
                };
            };
        } else if (accountingPositions) {
            const userIsAccounting = accountingPositions.indexOf(staff.data.position.id) != -1;
            if (userIsAccounting) {
                const accountingGroup = await System.userGroups.search().where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.code.eq("dfede5be-5011-4ec9-b535-8c9ca3fc4d19")
                )).first();
                if (accountingGroup) {
                    if (!organization.data.accounting || organization.data.accounting.length < 1) {
                        organization.data.accounting = [staff];
                    } else {
                        organization.data.accounting.push(staff);
                    };
                    userIsHrOrAccounting = true;
                    await organization.save();
                    await accountingGroup.addItem(user);
                    await accountingGroup.save();
                };
            }
        }
    };
    if (staff.data.organization && staff.data.ext_user && !userIsHrOrAccounting) {
        const org = await staff.fields.organization.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(staff.data.organization!.id)
        )).first();
        if (!org || !org.data.access_settings_organization) {
            return;
        };
        const orgRights = await org.fields.access_settings_organization.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(org.data.access_settings_organization!.id)
        )).first();
        if (staff.data.staff_access == false && orgRights) {
            if (!orgRights.data.inner_org_users || orgRights.data.inner_org_users.length < 1) {
                return;
            };
            const group = await System.userGroups.search().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.eq(orgRights.data.inner_org_users![0].code)
            )).first();
            const innerUsersGroup = await System.userGroups.search().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.code.eq("04df3ffc-9921-4854-abe1-59ec199212ae")
            )).first();
            if (innerUsersGroup) {
                await innerUsersGroup.addItem(staff.data.ext_user);
                await innerUsersGroup.save()
            };
            if (group) {
                await group.addItem(staff.data.ext_user);
                await group.save();
            }
        } else {
            if (!orgRights!.data.external_org_users || orgRights!.data.external_org_users.length < 1) {
                return;
            };
            const extUsersGroup = await System.userGroups.search().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.code.eq("e50cb6cb-ea63-4d4e-8585-eb234a070256")
            )).first();
            if (extUsersGroup) {
                await extUsersGroup.addItem(staff.data.ext_user);
                await extUsersGroup.save()
            };
            const group = await System.userGroups.search().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.eq(orgRights!.data.external_org_users![0].code)
            )).first();
            if (group) {
                await group.addItem(staff.data.ext_user);
                await group.save();
            };
        };
    };
};
