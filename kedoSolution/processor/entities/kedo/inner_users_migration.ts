const chunkSize = Context.data.chunk_size!;

//Миграция пользователей в группы доступа
async function migrateInnerUsers(): Promise<void> {
    const allStaff = await Context.fields.staff_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all().then(r => r.filter(s => s.data.ext_user));
    const allOrgs = await Context.fields.organization_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allGroups = await System.userGroups.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allOrgRights = await Context.fields.access_rights_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allUsers = await System.users.search().size(10000).all();
    const staffChunk: {id: string, access: string}[] = Context.data.id_chunks[Context.data.iteration!];
    const promises: Promise<void>[] = [];
    let idsWithPositions: string[] = [];
    
    if (Context.data.staff_with_roles) {
        idsWithPositions = Context.data.staff_with_roles;
    } else if (!Context.data.add_hr_and_accounting_to_inner_users) {
        idsWithPositions = [].concat.apply([], Array.from(new Set(allOrgs.map(org => {
            const hrIds = org.data.hr_department && org.data.hr_department.length > 0 ? org.data.hr_department.map(item => {
                const staff = allStaff.find(s => s.id === item.id);
                if (staff && staff.data.ext_user) {
                    const user = allUsers.find(u => u.id === staff.data.ext_user!.id);
                    if (user) {
                        return user.id
                    }
                }
                return "";
            }) : [];
            const accountingIds = org.data.accounting && org.data.accounting.length > 0 ? org.data.accounting.map(item => {
                const staff = allStaff.find(s => s.id === item.id);
                if (staff && staff.data.ext_user) {
                    const user = allUsers.find(u => u.id === staff.data.ext_user!.id);
                    if (user) {
                        return user.id
                    }
                }
                return "";
            }) : [];
            const specialsIds = org.data.special_access_new && org.data.special_access_new.length > 0 ? org.data.special_access_new.map(item => {
                const staff = allStaff.find(s => s.id === item.id);
                if (staff && staff.data.ext_user) {
                    const user = allUsers.find(u => u.id === staff.data.ext_user!.id);
                    if (user) {
                        return user.id
                    }
                }
                return "";
            }) : [];
            return [].concat.apply([], [...hrIds, ...accountingIds, ...specialsIds])
        }))));
        Context.data.staff_with_roles = idsWithPositions
    };

    for (let item of staffChunk) {
        const staff = allStaff.find(s => s.id === item.id);
        if (!staff || !staff.data.organization || !staff.data.ext_user) {
            Context.data.debug += `no organization at staff ${item.id} or no staff `
            continue;
        };
        if (idsWithPositions.indexOf(staff.data.ext_user!.id) != -1) {
            Context.data.debug += `skip staff ${staff.data.__name}`
            continue;
        };
        const staffAccessNamespace = item.access;
        if (staff.data.employment_table && staff.data.employment_table.length > 1) {
            const staffOrgsIds = staff.data.employment_table.filter(row => row.organization).map(row => row.organization.id);
            const staffAccessIds = allOrgs.filter(org => staffOrgsIds.indexOf(org.id) != -1 && org.data.access_settings_organization).map(org => org.data.access_settings_organization!.id);
            const staffAccess = allOrgRights.filter(access => staffAccessIds.indexOf(access.id) != -1 && access.data.inner_org_users);
            for (let access of staffAccess) {
                let userGroup: UserGroupItem;
                if (staffAccessNamespace === "portal") {
                    userGroup = allGroups.find(g => g.id === access.data.external_org_users![0].code)!;
                } else {
                    userGroup = allGroups.find(g => g.id === access.data.inner_org_users![0].code)!;
                }
                if (userGroup) {
                    const user = allUsers.find(u => u.id === staff.data.ext_user!.id);
                    if (!userGroup.data.subOrgunitIds || userGroup.data.subOrgunitIds.length < 1) {
                        userGroup.data.subOrgunitIds = [];
                    };
                    if (userGroup.data.subOrgunitIds.indexOf(staff.data.ext_user!.id) === -1) {
                        userGroup.data.subOrgunitIds.push(staff.data.ext_user!.id);
                        await userGroup.save().catch(err => {
                            Context.data.debug += `error at userId ${user!.id}: ${err}`
                        });
                    };
                };
            };
            continue;
        }
        const org = allOrgs.find(org => org.id === staff.data.organization!.id);
        if (!org!.data.access_settings_organization) {
            Context.data.debug += `no access settings at org ${staff.data.organization!.id} or no org `
            continue;
        };
        const orgRights = allOrgRights.find(right => right.id === org!.data.access_settings_organization!.id);
        if (!orgRights!.data.inner_org_users || orgRights!.data.inner_org_users.length < 1) {
            Context.data.debug += `no inner user role at access settings ${org!.data.access_settings_organization!.id} or no access settings `
            continue;
        };
        let userGroup: UserGroupItem;
        if (staffAccessNamespace === "portal") {
            userGroup = allGroups.find(g => g.id === orgRights!.data.external_org_users![0].code)!;
        } else {
            userGroup = allGroups.find(g => g.id === orgRights!.data.inner_org_users![0].code)!;
        }
        if (userGroup) {
            const user = allUsers.find(u => u.id === staff.data.ext_user!.id);
            if (user && !user.data.__deletedAt) {
                if (!userGroup.data.subOrgunitIds || userGroup.data.subOrgunitIds.length < 1) {
                    userGroup.data.subOrgunitIds = [];
                };
                if (userGroup.data.subOrgunitIds.indexOf(staff.data.ext_user!.id) === -1) {
                    userGroup.data.subOrgunitIds.push(staff.data.ext_user!.id);
                    await userGroup.save().catch(err => {
                        Context.data.debug += `error at userId ${user!.id}: ${err}`
                    });
                };
                // promises.push(innerUsersGroup.save());
            } else {
                Context.data.debug += `deleted user at staffId ${item.id}`
            }
        };
    };
    // await Promise.all(promises);
    Context.data.iteration!++;
    if (staffChunk.length < chunkSize) {
        Context.data.all_staff_processed = true;
        // Context.data.debug = `items processed: ${[].concat.apply([], (Context.data.id_chunks)).length}`;
    };
};

//Находим всех пользователей и разделяем на чанки
async function getAndSplitUsers(): Promise<void> {
    let staffIdsChunks: {id: string, access: string}[][] = [];
    const allStaff = await Context.fields.staff_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all().then(r => r.filter(s => s.data.ext_user));
    const mappedStaff = allStaff.map(s => {
        return {
            id: s.id,
            access: s.data.staff_access ? "portal" : "system"
        }
    });
    for (let i = 0; i < mappedStaff.length; i += chunkSize) {
        const chunk = mappedStaff.slice(i, i + chunkSize)
        staffIdsChunks.push(chunk)
    };
    if (staffIdsChunks.length > 0) {
        Context.data.users_exists = true;
        Context.data.id_chunks = staffIdsChunks;
    };
}
