/* Client scripts module */

async function onInit(): Promise<void> {
    let user = await System.users.getCurrentUser();
    Context.data.staff = await Context.fields.staff.app.search().where(f => f.ext_user.eq(user)).first();
    if (Context.data.staff) {
        let staff = await Context.data.staff!.fetch();
        Context.data.organizaion = staff.data.organization;
        let organization = await Context.data.organizaion!.fetch();
        Context.data.entity = organization.data.entity;
    }
    let date = new Date();
    date.getTimezoneOffset();
    Context.data.start_line = (-(date.getTimezoneOffset() / 60)).toString();
}
async function duration_calculate(): Promise<void> {
    const start = Context.data.start_date ? Context.data.start_date : undefined;
    const end = Context.data.end_date ? Context.data.end_date : undefined
    if (start && end) {
        const duration = end.sub(start);
        const check = start.sub(end);
        if (Math.abs(duration.minutes) == 1) {
            Context.data.start_date = Context.data.start_date!.add(new Duration(3,'hours'));
            Context.data.end_date = Context.data.end_date!.add(new Duration(3,'hours'))
        }
        Context.data.duration = Math.floor(duration.hours / 24) + 1;
    }
}
