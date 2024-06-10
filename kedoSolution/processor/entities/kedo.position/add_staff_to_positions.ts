/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function update_staffs(): Promise<void> {
    const staffs = await Context.fields.staffs.fetchAll();
    const position = await Context.data.position!.fetch();
    const type_employment = Context.data.type_employment!;

    let promises: Promise<void>[] = [];

    for (const staff of staffs) {
        const employment_table = staff.data.employment_table!;
        const line = employment_table.find(f => f.position?.id == position.id);

        if (!line) {
            const id = employment_table.length > 0 ? employment_table[employment_table.length - 1].id + 1 : 0;
            const new_line = employment_table.insert();
            new_line.id = id;
            new_line.position = position;
            if (position.data.organization) new_line.organization = position.data.organization;
            if (position.data.subdivision) new_line.subdivision = position.data.subdivision;
            new_line.type_employment = type_employment;
            new_line.admission_date_position = new TDate();
            new_line.admission_date_organization = new TDate();
        } else {
            line.type_employment = type_employment;
            line.admission_date_position = new TDate();
            line.admission_date_organization = new TDate();
        }

        promises.push(staff.save());

        if (promises.length > 20) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);

}
