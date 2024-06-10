/* Client scripts module */

async function onInit(): Promise<void> {
    if (Context.data.staff_double)
        ViewContext.data.view_double = true
    await checkPhone();
}

async function checkPhone(): Promise<void> {
    if (!Context.data.staff) {
        return;
    }

    const staff = await Context.data.staff.fetch();
    
    if (staff.data.phone && staff.data.phone.tel.length >= 10) {
        const double = await Application.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.phone.eq(staff.data.phone!),
                f.__id.neq(staff.data.__id)
            ))
            .first()
        if (double) {
            ViewContext.data.staff = double;
            ViewContext.data.view_doublephone = true;
        } else {
            ViewContext.data.staff = undefined;
            ViewContext.data.view_doublephone = false;
        }

    } else {
        ViewContext.data.staff = undefined;
        ViewContext.data.view_doublephone = false;
    }
}