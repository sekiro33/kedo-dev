/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type PositionApp = TApplication<Application$kedo$position$Data, Application$kedo$position$Params, Application$kedo$position$Processes>;
type Position = ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>;

async function get_kedo_settings(): Promise<void> {
    const settings = await Context.fields.kedo_settings.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const integration_1c = settings.find(f => f.data.code == 'integration_1c');
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;

    const alternative_integration_1c = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.use_alternative_integration = alternative_integration_1c ? alternative_integration_1c.data.status : false;
}

async function get_staffs_by_organization(): Promise<void> {
    Context.data.staffs_pack = await Context.fields.staffs.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__status.eq(Context.fields.staffs.app.fields.__status.variants.signed_documents),
        f.organization.link(Context.data.organization!),
        f.id_1c.neq(null),
        f.individual_id_1c.neq(null),
    ))
        .from(Context.data.from!)
        .size(100)
        .all();

    Context.data.from! += 100;

    Context.data.counter! += Context.data.staffs_pack.length;
}

async function get_staffs_by_subdivisions(): Promise<void> {
    const subdivisions = await Context.fields.subdivisions.fetchAll();

    if (!subdivisions || subdivisions && subdivisions.length == 0) {
        throw new Error('Подразделения не выбраны');
    }

    Context.data.staffs = [];

    let positionsApp: PositionApp[] = [];
    subdivisions.forEach(s => positionsApp.push(...s.data.positions ?? []));
    const positions = await Promise.all(positionsApp.map(p => p.fetch()));

    for (const position of positions) {
        Context.data.staffs = Context.data.staffs.concat(position.data.staff ?? []);
    }
}

async function get_staffs_pack(): Promise<void> {
    const pack = await Promise.all(Context.data.staffs!.slice(Context.data.from!, 100).map(f => f.fetch()));
    Context.data.staffs_pack = pack.filter(f => f.data.id_1c && f.data.individual_id_1c);
    Context.data.from! += 100;

    Context.data.counter! += Context.data.staffs_pack.length;
}

async function check_staff_list(): Promise<boolean> {
    return Context.data.staffs_pack!.length > 0 ? true : false;
}
