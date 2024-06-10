/* Client scripts module */

async function onInit(): Promise<void> {
    if (!Context.data.personal_id) {
        return;
    }

    ViewContext.data.staff = await ViewContext.fields.staff.app.search().where(f => f.individual_id_1c.eq(Context.data.personal_id!)).first();
}