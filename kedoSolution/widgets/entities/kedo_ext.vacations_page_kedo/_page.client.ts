declare const console: any;

async function onInit(): Promise<void> {
    console.log("vacation init")
    const user = await System.users.getCurrentUser();
    const staff = await Context.fields.staff_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(user)
    )).first();

    if (!staff) {
        return;
    };

    const allVacation = await Context.fields.vacations_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.kedo_staff.link(staff)
    )).count().then(async count => await Context.fields.vacations_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.kedo_staff.link(staff)
    )).size(count).all());

    Context.data.vacations_app = allVacation.slice(0, 2);
    Context.data.all_vacations = allVacation;
    Context.data.all_statuses = await Context.fields.all_statuses.app.search().where(f => f.__deletedAt.eq(null)).size(100).all();
};