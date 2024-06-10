/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function data_calculation(): Promise<void> {
    const promises: Promise<void>[] = [];
    let current_date = new TDate();
    Context.data.debug = '';
    Context.data.debug += current_date.format('YYYY-MM-DD') + '\n';

    let category = await Context.fields.staff.app.fields.staff_categories.app.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.code.eq('invalid_child'))).first();
    let staffs = await Context.fields.staff.app.search().where((f, g) => g.and(f.__deletedAt.eq(null))).size(10000).all();
    if (category) {
        for (let staff of staffs!) {
            if (staff.data.categories_table) {
                staff.data.categories_table!.map(item => {
                    if (item.staff_categories.id == category!.id) {
                        if (staff.data.vacation_invalid_child_days == undefined) { staff.data.vacation_invalid_child_days = 0 };
                        if (staff.data.full_name && staff.data.full_name.firstname && staff.data.full_name.lastname) {
                            Context.data.debug += staff.data.full_name!.firstname + ' ' + staff.data.full_name!.lastname + '\n'
                        }
                        staff.data.vacation_invalid_child_days! += 4;
                        if ((current_date.month - item.assignment_date.month) == 1) {
                            staff.data.vacation_invalid_child_days! += 4;
                        }
                        promises.push(staff.save())
                    }
                });
            }
        }
        await Promise.all(promises)
    }
}
