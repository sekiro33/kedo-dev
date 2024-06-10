/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

//нужно для перехода от использования поля individual_id_1c к таблице с айди ref_eq_table
async function fillTable(): Promise<void> {
    
    let promises: Promise<void>[] = [];

    const allEmployees = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
    )).size(10000).all();

    for (let employee of allEmployees) {
        if (employee.data.individual_id_1c && employee.data.ref_eq_table!.length === 0) {
            let row = employee.data.ref_eq_table!.insert();
            row.individual_ref = employee.data.individual_id_1c;

            promises.push(employee.save())
            if (promises.length >= 30) {
                await Promise.all(promises)
                promises = [];
            }
        }
    }
    await Promise.all(promises);
}
