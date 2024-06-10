/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type PositionApp = TApplication<Application$kedo$position$Data, Application$kedo$position$Params, Application$kedo$position$Processes>;
type Position = ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>;

const CHUNK_SIZE = 20;

async function get_kedo_settings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const integration_1c = settings.find(f => f.data.code == 'integration_1c');
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;

    const alternative_integration_1c = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.alternative_integration_1c = alternative_integration_1c ? alternative_integration_1c.data.status : false;
}

async function get_staffs_by_organization(): Promise<void> {
    const employment_placement = await Namespace.app.employment_directory.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__status.eq(Namespace.app.employment_directory.fields.__status.variants.actual),
            f.organization.link(Context.data.organization!)
        ))
        .size(10000)
        .all();

    const staff_ids = [...new Set(
        employment_placement
            .filter(f => f.data.staff != undefined)
            .map(f => f.data.staff!.id)
    )];

    const staffs = await Context.fields.staffs.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__status.eq(Context.fields.staffs.app.fields.__status.variants.signed_documents),
            f.individual_id_1c.neq(null),
            f.__id.in(staff_ids)
        ))
        .size(staff_ids.length)
        .all();

    Context.data.staffs_pack = staffs.slice(Context.data.from!, Context.data.from! + 100);
    Context.data.from! += 100;
    Context.data.payslip_counter! += Context.data.staffs_pack.length;
}

async function get_staffs_by_subdivisions(): Promise<void> {
    if (!Context.data.subdivisions || Context.data.subdivisions.length == 0) {
        throw new Error('Подразделения не выбраны');
    }

    const subdivision_ids = Context.data.subdivisions.map(f => f.id);

    const subdivisions = await Context.fields.subdivisions.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(subdivision_ids)
        ))
        .size(subdivision_ids.length)
        .all();

    Context.data.staffs = [];


    let positionsApp: PositionApp[] = [];

    subdivisions.forEach(s => {
        positionsApp.push(...s.data.positions ?? [])
    });

    let staffs: typeof Context.data.staffs = [];

    for (let i = 0; i < positionsApp.length; i += CHUNK_SIZE) {
        const chunk = positionsApp.slice(i, i + CHUNK_SIZE);

        await Promise.all(
            chunk.map(f => f.fetch())
        )
            .then((pos) => pos.forEach(p => {
                staffs.push(...p.data.staff ?? [], ...p.data.staff_external_combination ?? [], ...p.data.staff_internal_combination ?? []);
            }))
    }

    Context.data.staffs = staffs;
}

async function get_staffs_pack(): Promise<void> {
    const pack = await Promise.all(Context.data.staffs!.slice(Context.data.from!, 100).map(f => f.fetch()));
    Context.data.staffs_pack = pack.filter(f => f.data.individual_id_1c);
    Context.data.from! += 100;

    Context.data.payslip_counter! += Context.data.staffs_pack.length;
}

async function check_staff_list(): Promise<boolean> {
    return Context.data.staffs_pack!.length > 0 ? true : false;
}
