/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_organization_head(): Promise<void> {
    if (!Context.data.organization) {
        Context.data.text_error = 'Организация не выбрана.';
        throw new Error(Context.data.text_error);
    }

    // Получаем организацию.
    const organization = await Context.data.organization.fetch();

    if (!organization.data.position_head) {
        Context.data.text_error = `Не указана должность руководителя организации ${organization.data.__name}`;
        throw new Error(Context.data.text_error);
    }

    // Получаем должность руководителя организации.
    const position_head = await organization.data.position_head.fetch();

    const staffs = await Promise.all(
        [
            ...(position_head.data.staff ?? []),
            ...(position_head.data.staff_internal_combination ?? []),
            ...(position_head.data.staff_external_combination ?? [])
        ].map(s => s.fetch())
    );

    if (staffs.length == 0) {
        Context.data.text_error = `Не указаны сотрудники на должности руководителя организации ${organization.data.__name}`;
        throw new Error(Context.data.text_error);
    }

    // Проводим фильтрацию: сотрудник в статусе "Трудоустроен" и есть пользователь.
    const head_staffs = staffs.filter(f => f.data.__status?.code == f.fields.__status.variants.signed_documents.code && f.data.ext_user);

    if (head_staffs && head_staffs.length == 0) {
        Context.data.text_error = `Нет трудоустроенных сотрудников на должности руководителя организации ${organization.data.__name}`;
        throw new Error(Context.data.text_error);
    }

    // Получаем первого сотрудника.
    const head = head_staffs[0];

    // Заполняем поля контектса.
    Context.data.organization_head = head;
    Context.data.organization_head_user = head.data.ext_user;
}

async function get_supervisor(): Promise<void> {
    const supervisor = await System.userGroups.search().where(f => f.__id.eq('331e62d2-072e-58ac-9581-74abcc67f050')).first();
    const user = await System.users.search().where(f => f.groupIds.has(supervisor!)).first();
    const staff = await Context.fields.organization_head.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user!)
        ))
        .first();
    Context.data.organization_head_user = user;
    Context.data.organization_head = staff
}
