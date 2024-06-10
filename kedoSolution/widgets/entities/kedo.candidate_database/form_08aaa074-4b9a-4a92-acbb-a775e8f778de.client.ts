/* Client scripts module */
async function onInit(): Promise<void> {
    Context.data.responsible_reception_staff = await Context.fields.responsible_reception_staff.app.search().where((f,g) => g.and(f.__deletedAt.eq(null), f.ext_user.eq(Context.data.__createdBy))).first();
    const entity = await Context.data.organization!.fetch();
    if (entity.data.hr_department) {
        const hr_ids = entity.data.hr_department.map(f=>f.id)
        Context.fields.responsible_reception_staff.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
            appFields.__id.in(hr_ids)
        ));
    }
    

}