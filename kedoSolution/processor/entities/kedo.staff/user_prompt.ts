/** Проверка: есть ли пользователь у сотрудника. */
async function checkUserProfile(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Не указан сотрудник. Context.data.staff is undefined");
    }

    const staff = await Context.data.staff.fetch();

    if (staff.data.ext_user) {
        staff.data.user_already_exists = true;
        await staff.save();
    }
}

/** Получение настроек КЭДО. */
async function getSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    // Параметр "Альтернативное создание пользователя";
    const alternative_user_creation = settings.find(f => f.data.code == 'alternative_user_creation');
    Context.data.alternative_user_creation = alternative_user_creation ? alternative_user_creation.data.status : false;
}

async function linkForUser(): Promise<void> {
    try {
        const staff = await Context.data.staff!.fetch();
        const ext_user = Context.fields.external_staff.app.create();
        ext_user.data.__name = staff.data.__name;
        ext_user.data.fullname = {
            firstname: staff.data.full_name!.firstname,
            lastname: staff.data.full_name!.lastname,
            middlename: staff.data.full_name!.middlename ? staff.data.full_name!.middlename : ''
        };
        ext_user.data.phone = (ext_user.data.phone || []).concat(staff.data.phone!);
        if (ext_user.data.phone && ext_user.data.phone.length > 0) {
            ext_user.data.phone.forEach(phone => phone.type = PhoneType.Mobile);
        };
        if (staff.data.email) {
            ext_user.data.email = staff.data.email!.email;
        }
        await ext_user.save();

        const portal = await System.portals.get('kedo_ext');
        await portal!.grantAccess(ext_user);
        const user = await portal!.addUser(ext_user);
        const link = await portal!.signupUrl(ext_user, { withSign: true, refresh: true });

        staff.data.external_user = (staff.data.external_user || []).concat(ext_user);
        staff.data.ext_user = user;

        // --- Сохранение инвайт ссылки в карточку сотрудника для того, чтобы не перегенерировать ссылку повторно, если пользователь уже существует, т.е. отправлять уже готовую (Никита) ---
        staff.data.const_invitation_link = link;
        await staff.save();

        Context.data.external_staff = ext_user;
        Context.data.ext_user = user;
        Context.data.invitation_link_for_new_user = staff.data.const_invitation_link
    } catch (err) {
        Context.data.error_string = `Ошибка создания внешнего пользователя: ${err.message}`;
        throw new Error("Ошибка создания внешнего пользователя: " + err.message)
    }
}

async function addPortalUser(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined");
    }

    const staff = await Context.data.staff.fetch();
    const ext_user_app = staff.data.external_user![0];

    const portal = await System.portals.get('kedo_ext');

    await portal!.grantAccess(ext_user_app);
    const user = await portal!.profiles.getUser(ext_user_app)

    staff.data.ext_user = user;

    await staff.save();

    const ext_user = await ext_user_app.fetch();

    if (ext_user.data.__user_status && ext_user.data.__user_status.code === ext_user.fields.__user_status.variants.not_registered.code) {
        Context.data.invitation_link_for_new_user = await portal!.signupUrl(ext_user, { withSign: true, refresh: true });
        //Context.data.invitation_link_for_new_user = staff.data.const_invitation_link
    }
    Context.data.external_staff = ext_user_app;
    Context.data.ext_user = user;
}

async function aboutRegistrationClients(): Promise<boolean> {
    const active = await Context.data.external_staff!.fetch();
    if (active.data.__user_status && active.data.__user_status.code === active.fields.__user_status.variants.active.code) {
        return true;
    }
    return false;
}

async function notificationCheck(): Promise<boolean> {
    const worker = await Context.data.staff!.fetch();
    if (worker.data.notification!.code == worker.fields.notification.variants.sms.code) {
        return true;
    }
    return false;
}

async function user_create(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("staff is undefined");
    }
    const staff = await Context.data.staff.fetch();

    let newUser = System.users.create();

    newUser.data.fullname = {
        firstname: staff.data.full_name!.firstname,
        lastname: staff.data.full_name!.lastname,
        middlename: staff.data.full_name!.middlename ?? "",
    };
    newUser.data.mobilePhone = <TPhone<PhoneType.Mobile>>{ type: PhoneType.Mobile, tel: staff.data.phone!.tel };

    if (staff.data.email) {
        newUser.data.email = staff.data.email.email;
    }

    await newUser.save();

    staff.data.ext_user = newUser;
    await staff.save();

    Context.data.ext_user = newUser;
}

async function interlal_user_link(): Promise<void> {
    const user = await Context.data.staff!.fetch();
    const entity = await user.data.organization!.fetch();
    Context.data.alert = `Приглашаем вас на портал обмена кадровыми электронными документами ${entity?.data.__name}.
        На портале вы сможете создавать и подписывать кадровые документы в электронном виде.
        Перейдите по ссылке и пройдите процедуру регистрации на портале.`
}

async function exist_user_link(): Promise<void> {
    const user = await Context.data.staff!.fetch();
    const entity = await user.data.organization!.fetch();
    Context.data.alert = `Приглашаем вас на портал обмена кадровыми электронными документами ${entity?.data.__name}.
        На портале вы сможете создавать и подписывать кадровые документы в электронном виде.
        Перейдите по ссылке и пройдите процедуру регистрации на портале.`
}

// async function setFilesPermissions(): Promise<void> {
//     let staff = await Context.data.staff!.fetch();
//     let externalUser = Context.data.ext_user ? Context.data.ext_user.fetch() : await staff.data.ext_user!.fetch();
//     let docsTable = staff?.data.documents_for_employment;
//     if (!docsTable && !externalUser) {
//         return;
//     };
//     let permissions = new Permissions([
//         new PermissionValue(externalUser!, [PermissionType.READ])
//     ])
//     for (let row of docsTable!) {
//         if (row.file_doc) {
//             row.file_doc.setPermissions(permissions)
//         };
//     };
// }


//Добавляем сотрудника в группы внутренних/внешних пользователей, в группы hr/бухлагтеров
async function addUserToGroup(): Promise<void> {
    const user = await Context.data.ext_user!.fetch();
    const staff = await Context.data.staff!.fetch();
    const readPermission = [new PermissionValue(user, [PermissionType.READ, PermissionType.ASSIGN, PermissionType.UPDATE])];
    await staff.setPermissions(new Permissions(readPermission));
    if (Context.data.access_portal == true) {
        const kedoUsersGroup = await System.userGroups.search().where(f => f.__name.eq("Внешние сотрудники организации")).first();
        if (!kedoUsersGroup) {
            return;
        };

        const kedoGroupUsers = await kedoUsersGroup.users(0, 1000);

        if (kedoGroupUsers.map(u => u.id).indexOf(user.id) === -1) {
            await kedoUsersGroup.addItem(user);
        }
    } else {
        const kedoUsersGroup = await System.userGroups.search().where(f => f.__name.eq("Внутренние сотрудники организации")).first();
        if (!kedoUsersGroup) {
            return;
        };

        const kedoGroupUsers = await kedoUsersGroup.users(0, 1000);

        if (kedoGroupUsers.map(u => u.id).indexOf(user.id) === -1) {
            await kedoUsersGroup.addItem(user);
        };
    }
    let userIsHrOrAccounting = false;
    //сравниваем позицию пользоваетеля с позицией hr/бухгалтера указанной в организации
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
                    const hrUsers = await hrGroup.users(0, 1000);
                    if (hrUsers.map(u => u.id).indexOf(user.id) === -1) {
                        await hrGroup.addItem(user);
                        await hrGroup.save();
                    };
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
                    const accountingUsers = await accountingGroup.users(0, 1000);

                    if (accountingUsers.map(u => u.id).indexOf(user.id) === -1) {
                        await accountingGroup.addItem(user);
                        await accountingGroup.save();
                    };
                };
            }
        }
    };
};

async function updateUserData(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error('Отсутствует карточка пользователя.');
    }

    const staff = await Context.data.staff.fetch();
    if (staff.data.ext_user) {
        const ext_user = await staff.data.ext_user.fetch();

        // --- Логика обновления полей внутреннего пользователя (Никита) ---
        if (!Context.data.external_user_app && ext_user) {
            if (ext_user.data.mobilePhone) {
                ext_user.data.mobilePhone.tel = staff.data.phone!.tel;
                ext_user.data.mobilePhone.ext = staff.data.phone!.ext;
            } else {
                ext_user.data.mobilePhone = <TPhone<PhoneType.Mobile>>{
                    tel: staff.data.phone!.tel,
                    type: PhoneType.Mobile,
                }
            }
            if (ext_user.data.email) {
                ext_user.data.email = staff.data.email?.email;
            }

            await ext_user.save();
        }

        // --- Новая логика обновления полей карточки внешнего пользователя (Никита) ---
        if (Context.data.external_user_app && ext_user) {
            const external_user = await Context.data.external_user_app.fetch();
            if (external_user) {
                if (external_user.data.mobilePhone) {
                    external_user.data.mobilePhone.tel = staff.data.phone!.tel;
                    external_user.data.mobilePhone.ext = staff.data.phone!.ext;
                } else {
                    external_user.data.mobilePhone = <TPhone<PhoneType.Mobile>>{
                        tel: staff.data.phone!.tel,
                        type: PhoneType.Mobile,
                    }
                }

                if (external_user.data.email) {
                    external_user.data.email = staff.data.email?.email;
                }

                await external_user.save();
            }
        }
    }

    // --- Старая логика обновления карточки внешнего пользователя (Никита) ---

    // if (staff.data.external_user && staff.data.external_user.length > 0) {
    //     const ext_user = await staff.data.external_user[0].fetch();
    //     ext_user.data.phone = [<TPhone<PhoneType.Mobile>>{ tel: staff.data.phone!.tel, type: PhoneType.Mobile }];
    //     await ext_user.save();

    //     const portal = await System.portals.get('kedo_ext');
    //     const user = await portal!.profiles.getUser(ext_user);

    //     if (user) {
    //         if (user.data.mobilePhone) {
    //             user.data.mobilePhone.tel = staff.data.phone!.tel;
    //             user.data.mobilePhone.ext = staff.data.phone!.ext;
    //         } else {
    //             user.data.mobilePhone = <TPhone<PhoneType.Mobile>>{
    //                 tel: staff.data.phone!.tel,
    //                 type: PhoneType.Mobile,
    //             }
    //         }

    //         user.data.email = staff.data.email?.email;

    //         await user.save();
    //     }

    // }
}

async function setContextStaff(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error('staff is required');
    }
    const staff = await Context.data.staff.fetch();
    if (Context.data.user_already_exists == true) {
        staff.data.user_created = true;
        Context.data.user_created = true;

        await staff.save();
    } else {
        staff.data.user_created = false;
        Context.data.user_created = false;

        await staff.save();
    }
}

async function checkTypeUser(): Promise<boolean> {
    if (!Context.data.staff) {
        throw new Error('staff is required');
    }
    const staff = await Context.data.staff.fetch();
    if (staff.data.external_user && staff.data.external_user.length > 0) {
        return true;
    }
    return false;
}

// async function setStaffsPermissions(): Promise<void> {
//     try {
//         const staff = await Context.data.staff!.fetch();
//         const staff_organization = await staff.data.organization!.fetch();
//         const access_settings_organization = await staff_organization.data.access_settings_organization!.fetch();
//         const staff_role = access_settings_organization.data.staff![0];
//         if (staff_role.type === "group") {
//             const staff_group = await System.userGroups.search()
//                 .where((f, g) => g.and(
//                     f.__deletedAt.eq(null),
//                     f.__id.eq(staff_role.code)
//                 ))
//                 .first();
//             if (staff_group) {
//                 let staff_permissions = await staff.getPermissions();
//                 if (staff_permissions) {
//                     staff_permissions.values.push(new PermissionValue(staff_group, [PermissionType.READ]))
//                 } else {
//                     staff_permissions = new Permissions([new PermissionValue(staff_group, [PermissionType.READ])])
//                 }
//                 await staff.setPermissions(staff_permissions);
//             }
//         }
//     } catch (error) {
//         Context.data.error_message = error.message;
//     }
// }

async function checkLoginExternalUser(): Promise<boolean> {
    if (!Context.data.staff) {
        throw new Error('staff is required');
    }
    const staff = await Context.data.staff.fetch();
    const status_external_user = await staff.data.external_user![0].fetch();
    if (status_external_user.data.__user_status && status_external_user.data.__user_status.code == "active") {
        Context.data.is_login_user = true;
        return true;
    }
    return false;
}

async function checkLoginExtUser(): Promise<boolean> {
    if (!Context.data.staff) {
        throw new Error('staff is required');
    }
    const staff = await Context.data.staff.fetch();
    const status_ext_user = await staff.data.ext_user!.fetch();
    if (status_ext_user.data.__status && status_ext_user.data.__status.id == UserStatus.Active) {
        Context.data.is_login_user = true;
        return true;
    }
    return false;
}

async function interruptProcess(): Promise<void> {
    const staff = await Context.data.staff!.fetch();

    const active_process = await Application.processes.Employment._searchInstances()
        .where((f, g) => g.and(
            g.or(
                f.__state.like(ProcessInstanceState.exec),
                f.__state.like(ProcessInstanceState.error),
                f.__state.like(ProcessInstanceState.wait),
            ),
            (f as any)['__item'].eq(Context.data.staff)
        )).size(100).all();

    if (active_process) {
        for (let process of active_process) {
            await process.interrupt(`Не зарегистрированный пользователь ${staff.data.__name} приглашен снова`);
        }
    }
}

async function distributionOrgGroups(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    //Ищем все организации сотрудника по местам занятости и добавляем в необходимые группы
    if (staff.data.employment_table && staff.data.employment_table.length > 1 && staff.data.ext_user) {
        const orgs = staff.data.employment_table.map(row => row.organization.id);
        const orgsWithAccessRights = await Context.fields.staff.app.fields.organization.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(orgs),
            f.access_settings_organization.neq(null)
        )).size(10000).all();
        const orgsAccessSettings = await Promise.all(orgsWithAccessRights.map(org => org.data.access_settings_organization!.fetch())).then(accessSettings => accessSettings.filter(setting => setting.data.staff));
        //отфильтровали организации по заполненности поля "Настройки доступа по организациям" и нашли их настройки
        for (let orgRights of orgsAccessSettings) {
            if (staff.data.staff_access == false && orgRights) {    //группа внутренних сотрудников
                if (!orgRights.data.inner_org_users || orgRights.data.inner_org_users.length < 1) {
                    continue;
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
                    const innerGroupUsers = await innerUsersGroup.users(0, 1000);

                    if (innerGroupUsers.map(u => u.id).indexOf(staff.data.ext_user.id) === -1) {
                        await innerUsersGroup.addItem(staff.data.ext_user);
                        await innerUsersGroup.save()
                    };
                };
                if (group) {
                    const groupUsers = await group.users(0, 1000);

                    if (groupUsers.map(u => u.id).indexOf(staff.data.ext_user.id) === -1) {
                        await group.addItem(staff.data.ext_user);
                        await group.save();
                    };
                }
            } else {
                if (!orgRights.data.external_org_users || orgRights.data.external_org_users.length < 1) {
                    continue;
                };
                const extUsersGroup = await System.userGroups.search().where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.code.eq("e50cb6cb-ea63-4d4e-8585-eb234a070256")
                )).first();
                if (extUsersGroup) {
                    const extGroupUsers = await extUsersGroup.users(0, 1000);

                    if (extGroupUsers.map(u => u.id).indexOf(staff.data.ext_user.id) === -1) {
                        await extUsersGroup.addItem(staff.data.ext_user);
                        await extUsersGroup.save();
                    };
                };
                const group = await System.userGroups.search().where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.__id.eq(orgRights.data.external_org_users![0].code)
                )).first();
                if (group) {
                    const groupUsers = await group.users(0, 1000);

                    if (groupUsers.map(u => u.id).indexOf(staff.data.ext_user.id) === -1) {
                        await group.addItem(staff.data.ext_user);
                        await group.save();
                    };
                };
            };
        }

    };
}
