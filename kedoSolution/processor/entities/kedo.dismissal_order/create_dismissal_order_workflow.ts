/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getKedoSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .size(1000)
        .all();

    const integration_1c = settings.find(f => f.data.code == "integration_1c");
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;
}

async function setLineStatus(): Promise<void> {

}

async function getLaborContract(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined");
    }

    Context.data.labor_contract = await Context.fields.labor_contract.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.staff!)
        ))
        .first();
}
