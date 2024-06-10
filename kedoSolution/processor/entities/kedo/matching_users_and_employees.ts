async function getAllEmployee(): Promise<void> {

    if (!Context.data.offset_iterations) {
        Context.data.offset_iterations = 0;
    }

    const size_iterations = 100;

    let resultEmployee: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>[] = [];
    let appSearchEmployee = Context.fields.staff.app.search();

    try {
        const items: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>[] = await appSearchEmployee.where(f => f.ext_user.eq(null)).sort("__createdAt", true)
            .size(100)
            .from(Context.data.offset_iterations)
            .all();

        resultEmployee.push(...items);
    } catch (e) {
        Context.data.string_error = e.message;
        return
    }

    if (!Context.data.count_users) {
        Context.data.count_users = 0;
    }

    for (let row_employee of resultEmployee) {
        let fio = row_employee.data.full_name?.lastname + ' ' + row_employee.data.full_name?.firstname;
        if (row_employee.data.full_name?.middlename) {
            fio = fio + ' ' + row_employee.data.full_name.middlename;
        }

        let find_user = await System.users.search().where(f => f.__name.eq(fio)).first();
        if (find_user) {

            if ((find_user.data.email && row_employee.data.email && (find_user.data.email == row_employee.data.email.email)) ||
                (find_user.data.workPhone && row_employee.data.phone && (find_user.data.workPhone == row_employee.data.phone)) ||
                (find_user.data.mobilePhone && row_employee.data.phone && (find_user.data.mobilePhone.tel == row_employee.data.phone.tel))) {
                row_employee.data.ext_user = find_user;
                Context.data.is_matching = true;
                Context.data.count_users = Context.data.count_users + 1;

                await row_employee.save();
            }
        }
    }

    if (resultEmployee.length < size_iterations) {
        Context.data.end_processing = true;
    } else {
        Context.data.offset_iterations += 100;
    }
}