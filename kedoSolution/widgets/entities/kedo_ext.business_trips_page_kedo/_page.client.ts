declare const console: any;

async function onInit(): Promise<void> {
    const user = await System.users.getCurrentUser();
    const staff = await Context.fields.staff_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(user)
    )).first();

    if (!staff) {
        return;
    };

    const allBusinessTrip = await Context.fields.business_trips_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.kedo_staff.link(staff)
    )).count().then(async count => await Context.fields.business_trips_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.kedo_staff.link(staff)
    )).size(count).all());

    Context.data.business_trips_app = allBusinessTrip.slice(0, 2);
    Context.data.all_businessTrips = allBusinessTrip;
    Context.data.all_statuses = await Context.fields.all_statuses.app.search().where(f => f.__deletedAt.eq(null)).size(100).all();
};