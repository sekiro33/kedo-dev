/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

//Формируем тело оповещения
async function alert_create(): Promise<void> {
    if (Context.data.certificate && Context.data.responsible) {
        const user = await Context.data.__createdBy.fetch()
        const responsible = await Context.data.responsible[0].fetch()
        const user_timezone = System.timezones.all().find(n => n.name === user.data.timezone);
        const certificate = await Context.data.certificate.fetch()
        if (certificate.data.certificate_type) {
            Context.data.alert_body = 
                `Здравствуйте, ${user.data.__name}!<br>
                <br>
                Запрошенная Вами ${certificate.data.__createdAt.getDate(user_timezone ? user_timezone : System.timezones.default).format("DD.MM.YYYY")} справка вида ${(await certificate.data.certificate_type.fetch()).data.__name} готова.<br>
                <br>
                С уважением,<br>
                ${responsible.data.__name}<br>`//getDate(...) по идее должно возвращать дату в таймзоне юзера, но если ее по каким то причинам нет - в тз компании
        }

        const responsible_staff = await Context.fields.staff.app.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.ext_user.eq(responsible))).first();
        if (responsible_staff && responsible_staff.data.structural_subdivision) {
            Context.data.responsible_department = (await responsible_staff.data.structural_subdivision.fetch()).data.__name;
        }
    }
}

//Получаем настройки КЭДО
async function get_settigns(): Promise<void> {
    const integration_1c = await Context.fields.kedo_settings.app.search().where(f => f.code.eq('integration_1c')).first();
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;
    if (Context.data.certificate) {
        const app = await Context.data.certificate.fetch();
        if (app.data.certificate_type) {
            const certificate_type = await app.data.certificate_type.fetch();
            Context.data.type_string = certificate_type.data.__name;
        }
    }
}

//Получаем комментарий при отказе в подписании ответственным
async function get_comment(): Promise<void> {
    if (Context.data.certificate) {
        const app = await Context.data.certificate.fetch();
        const signHistory = await app.getSignHistory();
        Context.data.hr_comment = signHistory[0].signs[0].comment
    }
}

//Получаем пользователя из роли
async function get_user(id: string): Promise<UserItemRef | undefined> {
    const user = await System.users.search().where(f => f.__id.eq(id)).first();
    return user
}

//Получаем ответственных за справку
async function get_responsible(): Promise<void> {
    if (Context.data.certificate) {
        const certificate = await Context.data.certificate.fetch();
        if (certificate.data.certificate_type) {
            const certificate_type = await certificate.data.certificate_type.fetch();
            //Используем универсальных ответственных
            if (certificate_type.data.universal_responsible || certificate_type.data.universal_responsible == undefined) {
                const roles = certificate_type.data.responsible;
                let users: UserItemRef[] = [];
                if (roles && roles.length > 0) {
                    for (const res of roles) {
                        if (res.type == 'user') {
                            const user = await get_user(res.code);
                            if (user) users.push(user);
                        } else if (res.type == 'group') {
                            users = users.concat(await res.getUsers());
                        }
                    }
                }
                Context.data.responsible = users;
            } else {    //Используем Ответственных в разрезе организации
                if (certificate.data.staff) {
                    const organization = (await certificate.data.staff.fetch()).data.organization;
                    if (organization) {
                        if (certificate_type.data.organizations_reponsible_table && certificate_type.data.organizations_reponsible_table.length > 0) {
                            const item_current_organization = certificate_type.data.organizations_reponsible_table.find(item => item.organization!.id == organization!.id)
                            Context.data.responsible = item_current_organization ? item_current_organization.responsible : undefined;
                        }
                    }
                }
            }
        } else {
            throw new Error('У справки не присвоен вид')
        }
    } else {
        throw new Error('В контексте БП нет справки')
    }
}

