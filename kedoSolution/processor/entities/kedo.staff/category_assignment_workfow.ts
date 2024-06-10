/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function category_assignment(): Promise<void> {
    if (Context.data.staff) {
        let staff = await Context.data.staff.fetch();
        let row = staff.data.categories_table!.insert();
        row.staff_categories = Context.data.staff_categories!;
        row.assignment_date = Context.data.assignment_date!;
        row.expiration_date = Context.data.expiration_date!;
        if (Context.data.vacation_invalid_child_days != 0) {
            if (staff.data.vacation_invalid_child_days == undefined || staff.data.vacation_invalid_child_days == 0) { staff.data.vacation_invalid_child_days = 0 }
            staff.data.vacation_invalid_child_days! += Context.data.vacation_invalid_child_days!
        }
        await staff.save();
    }
    if (Context.data.staffs && Context.data.staffs.length > 0) {
        let promises: Promise<void>[] = [];
        let staffs = await Promise.all(Context.data.staffs.map(item => item.fetch()));
        for (let item of staffs) {
            let row = item.data.categories_table!.insert();
            row.staff_categories = Context.data.staff_categories!;
            row.assignment_date = Context.data.assignment_date!;
            row.expiration_date = Context.data.expiration_date!;
            if (Context.data.vacation_invalid_child_days != 0) {
                if (item.data.vacation_invalid_child_days == undefined || item.data.vacation_invalid_child_days == 0) { item.data.vacation_invalid_child_days = 0 }
                item.data.vacation_invalid_child_days! += Context.data.vacation_invalid_child_days!
            }
            promises.push(item.save())
        }
        await Promise.all([promises])
    }
}
