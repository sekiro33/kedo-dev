/* Client scripts module */

async function onInit(): Promise<void> {
    const user = await System.users.getCurrentUser();
    const staff = await Namespace.app.staff.search()
        .where((f,g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user)
        ))
        .first();
    if (!staff)
        return
    Context.data.staff = staff;
    Context.data.old_postion = staff.data.position;
    const position = await staff.data.position!.fetch();
    Context.data.harmful_factors = position.data.harmful_production_factors;
    Context.data.sort_of_medical_examination = Context.fields.sort_of_medical_examination.variants.special_examination
}
