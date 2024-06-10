/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function getSettings(): Promise<void> {
    //Интеграция с учетной системой
    const integration_1c = await Context.fields.settings_kedo.app.search()
        .size(10000)
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('integration_1c')
        ))
        .first();
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;
    //Использовать 1С как мастер систему
    const alternative_integration = await Context.fields.settings_kedo.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('use_alternative_integration')
        ))
        .first();
    Context.data.use_alternative_integration = alternative_integration ? alternative_integration.data.status : false;
    //Использовать альтернативную учетную систему
    const alternative_system = await Context.fields.settings_kedo.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('use_alternative_system')
        ))
        .first();
    Context.data.use_alternative_system = alternative_system ? alternative_system.data.status : false;
}