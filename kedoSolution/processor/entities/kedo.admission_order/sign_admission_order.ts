/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function line_status_set(): Promise<void> {
    let doc = await Context.data.admission_order!.fetch();
    doc.data.line_status = `${doc.data.__status!.code};${doc.data.__status!.name}`
    await doc.save();
}

async function check_integration(): Promise<boolean> {
    const integration = Namespace.params.data.enable_1c
    if (integration && integration === true) return true
    return false
}