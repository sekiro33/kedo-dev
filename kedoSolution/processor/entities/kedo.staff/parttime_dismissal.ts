/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function parttimeDismissal(): Promise<void> {

    Context.data.debug = ' in val ';
    Context.data.debug += Context.data.firing_position_ref;

    if (Context.data.staff && Context.data.firing_position_ref) {
        Context.data.debug += ' in if '
        const employee = await Context.data.staff.fetch();
        const index = employee.data.employment_table!.findIndex(elem => elem.id_1c === Context.data.firing_position_ref)
        Context.data.debug += index;

        if (index != -1) {
            employee.data.employment_table!.delete(index);
            await employee.save();

            Context.data.debug += ' saved ';
        }
    }

    Context.data.debug += ' out ';
}

async function validate(): Promise<void> {

    if (Context.data.dissmissal_date) {
        Context.data.is_date = true;
    } else {
        Context.data.is_date = false;
    }
}
