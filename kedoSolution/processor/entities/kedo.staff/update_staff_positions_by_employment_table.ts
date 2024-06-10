/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface Combination {
    position: ApplicationItem<Application$kedo$position$Data, any>,
    type_employment: string | undefined,
}

async function update_positions(): Promise<void> {
    const staff = await Context.data.staff!.fetch();

    const employment_table = staff.data.employment_table;

    if (!employment_table || employment_table.length == 0) {
        return;
    }

    const staff_position = await Namespace.app.position.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        g.or(
            f.staff.has(staff),
            f.staff_internal_combination.has(staff),
            f.staff_external_combination.has(staff),
        )
    )).size(10000).all();

    await Promise.all(staff_position.map(f => {
        const main_pos_index = f.data.staff!.findIndex(f => f.id == staff.id);
        const external_pos_index = f.data.staff_external_combination!.findIndex(f => f.id == staff.id);
        const internal_pos_index = f.data.staff_internal_combination!.findIndex(f => f.id == staff.id);

        if (main_pos_index != -1) {
            f.data.staff!.splice(main_pos_index, 1);
        }

        if (external_pos_index != -1) {
            f.data.staff_external_combination!.splice(external_pos_index, 1);
        }

        if (internal_pos_index != -1) {
            f.data.staff_internal_combination!.splice(internal_pos_index, 1);
        }

        return f.save();
    }))

    const positions = await Promise.all(employment_table.map(f => f.position.fetch()));

    const combination: Combination[] = positions.map(f => {
        return {
            position: f,
            type_employment: employment_table.find(e => e.position.id == f.id)?.type_employment.code
        }
    });
    if (staff.data.__status && staff.data.__status.code == "dismissed") {
        await Promise.all(combination.map(f => {
            if (f.type_employment == 'main_workplace') {
                f.position.data.old_staff!.push(staff);
            }

            if (f.type_employment == 'internal_combination') {
                f.position.data.old_staff_internal_combination!.push(staff);
            }

            if (f.type_employment == 'external_combination') {
                f.position.data.old_staff_external_combination!.push(staff);
            }

            return f.position.save();
        }))
    } else {
        await Promise.all(combination.map(f => {
            if (f.type_employment == 'main_workplace') {
                f.position.data.staff!.push(staff);
            }

            if (f.type_employment == 'internal_combination') {
                f.position.data.staff_internal_combination!.push(staff);
            }

            if (f.type_employment == 'external_combination') {
                f.position.data.staff_external_combination!.push(staff);
            }

            return f.position.save();
        }))
    }
}
