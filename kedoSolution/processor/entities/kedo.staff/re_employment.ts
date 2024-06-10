/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function user_unban(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    if (staff.data.external_user && staff.data.external_user.length > 0) {
        const ext_user = await staff.data.external_user[0].fetch();
        if (ext_user.data.__user_status && ext_user.data.__user_status.code == ext_user.fields.__user_status.variants.blocked.code)
            await staff.fields.external_user.app.unblock(staff.data.external_user[0])
    } else if (staff.data.ext_user) {
        const user = await staff.data.ext_user.fetch();
        if (user.data.__status && user.data.__status.index == UserStatus.Blocked)
            await staff.data.ext_user.unblock()
    }
    if (!staff.data.email || staff.data.email.email !== Context.data.email!.email) {
        staff.data.user_already_exists = false;
        staff.data.ext_user = undefined;
        staff.data.email = Context.data.email
    }
    if (!staff.data.phone || staff.data.phone.tel !== Context.data.phone!.tel) {
        // staff.data.user_already_exists = false;
        // staff.data.ext_user = undefined;
        staff.data.phone = Context.data.phone
    }
    await staff.save()
}

async function update_employment_table(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    const employment_table = staff.data.employment_table!;

    let row = employment_table.find(f => f.position.id == Context.data.position!.id)

    if (!row) {
        row = employment_table.insert();
    }

    row.position = Context.data.position!;
    row.organization = Context.data.organization!;
    row.subdivision = Context.data.subdivision!;
    row.admission_date_organization = Context.data.admission_date!;
    row.admission_date_position = Context.data.admission_date!;
    row.type_employment = Context.data.employment_type!;

    await staff.save();
}

async function interrupt_process(): Promise<void> {
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
        active_process.forEach(map => {
            map.interrupt(`Запущено повторное трудоустройство для ${staff.data.__name}`);
        });
    }
}
