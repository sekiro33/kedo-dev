/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function migrationPositions(): Promise<void> {
    if (!Context.data.offset_iterations) {
        Context.data.offset_iterations = 0;
    }

    const size_iterations = 5;

    let searchElementsPosition = await Context.fields.position.app.search().where(f => f.__deletedAt.eq(null)).sort("__createdAt", true).size(5).from(Context.data.offset_iterations).all();
    if (!Context.data.count) {
        Context.data.count = 0;
    }
    if (searchElementsPosition) {
        Context.data.count += searchElementsPosition.length;
        for (let element of searchElementsPosition) {
            //const element_data = await element.fetch();

            if (element.data.staff && element.data.staff.length > 0) {
                const old_staff_array = element.data.old_staff ?? [];
                const staff_array = element.data.staff;
                const staff_length = staff_array.length;

                for (let index = 0; index < staff_length; index++) {
                    const staff = await staff_array[index].fetch();
                    //Context.data.staff = staff;
                    const staff_status_code = staff.data.__status!.code;

                    Context.data.debug += staff_status_code + ' статус полученного сотрудника(основное место работы) \n';

                    if (staff_status_code == "dismissed") {
                        old_staff_array.push(staff_array[index]);
                        staff_array.splice(index, 1);
                    }
                }
                element.data.staff = staff_array;
                element.data.old_staff = old_staff_array;
                await element.save();
            }

            if (element.data.staff_external_combination && element.data.staff_external_combination.length > 0) {
                const old_staff_array = element.data.old_staff_external_combination ?? [];
                const staff_array = element.data.staff_external_combination;
                const staff_length = staff_array.length;

                for (let index = 0; index < staff_length; index++) {
                    const staff = await staff_array[index].fetch();
                    //Context.data.staff = staff;
                    const staff_status_code = staff.data.__status!.code;

                    Context.data.debug += staff_status_code + ' статус полученного сотрудника(основное место работы) \n';

                    if (staff_status_code == "dismissed") {
                        old_staff_array.push(staff_array[index]);
                        staff_array.splice(index, 1);
                    }
                }
                element.data.staff_external_combination = staff_array;
                element.data.old_staff_external_combination = old_staff_array;
                await element.save();
            }

            if (element.data.staff_internal_combination && element.data.staff_internal_combination.length > 0) {
                const old_staff_array = element.data.old_staff_internal_combination ?? [];
                const staff_array = element.data.staff_internal_combination;
                const staff_length = staff_array.length;

                for (let index = 0; index < staff_length; index++) {
                    const staff = await staff_array[index].fetch();
                    //Context.data.staff = staff;
                    const staff_status_code = staff.data.__status!.code;

                    Context.data.debug += staff_status_code + ' статус полученного сотрудника(основное место работы) \n';

                    if (staff_status_code == "dismissed") {
                        old_staff_array.push(staff_array[index]);
                        staff_array.splice(index, 1);
                    }
                }
                element.data.staff_internal_combination = staff_array;
                element.data.old_staff_internal_combination = old_staff_array;
                await element.save();
            }
        }
    }

    if (searchElementsPosition.length < size_iterations) {
        Context.data.end_processing = true;
    } else {
        Context.data.offset_iterations += 5;
    }
}

// if (Context.data.staff && Context.data.staff.length > 0) {
        
    //     const old_staff_arr = Context.data.old_staff ?? [];
    //     const staff_arr = Context.data.staff ?? [];

    //     Context.data.debug = '';

    //     for (let index = 0; index < Context.data.staff.length; index++) {
    //         const staff = await Context.data.staff[index].fetch();
    //         const status_code = staff.data.__status!.code;

    //         Context.data.debug += status_code;

    //         if (status_code == "dismissed") {
    //             old_staff_arr.push(Context.data.staff[index]);
    //             staff_arr.splice(index, 1);
    //         }
    //     }
    //     Context.data.old_staff = old_staff_arr;
    //     Context.data.staff = staff_arr;
    // }