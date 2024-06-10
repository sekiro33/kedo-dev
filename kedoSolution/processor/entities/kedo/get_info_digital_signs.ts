/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getSettingsKedo(): Promise<void> {
    const settings = await Context.fields.settings_kedo.app.search()
        .where(field => field.__deletedAt.eq(null))
        .size(10000)
        .all();

    const automatic_reissue = settings.find(field => field.data.code == 'automatic_reissue_certificates');
    Context.data.automatic_reissue_active = automatic_reissue ? automatic_reissue.data.status : false;
    Context.data.days_offset = automatic_reissue ? automatic_reissue.data.quantity : 7;
}

async function getCertificates(): Promise<void> {
    Context.data.staff_list = [];
    const days_offset = Context.data.days_offset ?? 7;
    const users = await System.users.search()
        .where(field => field.__createdAt.eq(null))
        .size(10000)
        .all();
    const current_date = new Datetime();

    const signs = await System.signs.digitalSigns.search()
        .where((field, group) => group.and(
            field.__createdAt.eq(null),
            field.cert_status.like("released"),
        ))
        .size(10000)
        .all();

    if (signs && signs.length > 0) {
        for (let item of signs) {
            const user = users.find(field => field.id === item.data.__createdBy.id);
            if (user) {
                const staff = await Context.fields.staff.app.search()
                    .where((field, group) => group.and(
                        field.ext_user.eq(user),
                        field.__deletedAt.eq(null),
                    ))
                    .first();
                if (staff && item.data.validUntilAt) {
                    const currection_date = item.data.validUntilAt.add(new Duration(-days_offset, 'days'));
                    if (user && (current_date.beforeOrEqual(item.data.validUntilAt) && current_date.afterOrEqual(currection_date))) {
                        const row = Context.data.certs_info_table!.insert();
                        row.user = user;
                        row.end_date = item.data.validUntilAt;
                        row.currect_date = currection_date;

                        Context.data.staff_list.push(staff);
                    }
                }
            }
        }
    }
    
}