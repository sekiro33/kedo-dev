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
    const current_date = new Datetime();

    const users = await System.users.search()
        .where(field => field.__deletedAt.eq(null))
        .size(10000)
        .all();

    const staffs = await Context.fields.staff.app.search()
        .where(field => field.__deletedAt.eq(null))
        .size(10000)
        .all();

    const signsAll = await System.signs.digitalSigns.search()
            .where((field, group) => group.and(
                field.__deletedAt.eq(null),
                field.cert_status.like("released"),
            ))
            .size(10000)
            .all();

    for (let user of users) {
        let user_sing: DigitalSign;
        const signs = signsAll.filter(field => field.data.__createdBy.id === user.id);

        if (signs && signs.length > 0) {
            const sortSigns = signs.sort(
                (itemFirst, itemSecond) =>
                    Date.parse(itemSecond.data.validUntilAt!.format("YYYY-MM-DDTHH:mm:ss.SSSZ")) - Date.parse(itemFirst.data.validUntilAt!.format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
            )
            user_sing = sortSigns[0];

            if (user_sing && user_sing.data.validUntilAt) {
                const currection_date = user_sing.data.validUntilAt.add(new Duration(-days_offset, 'days'));

                if (current_date.beforeOrEqual(user_sing.data.validUntilAt) && current_date.afterOrEqual(currection_date)) {
                    const staff = staffs.find(field => field.data.ext_user?.id == user.id);
                    if (staff) {
                        Context.data.staff_list.push(staff);
                    }
                }
            }
        }
    }
}