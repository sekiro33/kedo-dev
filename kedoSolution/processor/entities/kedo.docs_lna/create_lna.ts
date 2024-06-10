/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_staffs(): Promise<void> {
    const app = await Context.data.docs_lna!.fetch();
    Context.data.staff = app.data.staff;
    Context.data.lna_file = app.data.file_lna;
    Context.data.organiaztion = app.data.organization;
    const positions = await Promise.all(app.data.agreement_position!.map(f => f.fetch()));
    let staffs: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[] = [];
    for (const position of positions) {
        if (position.data.staff && position.data.staff.length > 0)
            staffs = staffs.concat(position.data.staff)
    }
    let staffsFetch = await Promise.all(staffs.map(f => f.fetch()));
    staffsFetch = staffsFetch.filter(f => f.data.__status && f.data.__status.code == f.fields.__status.variants.signed_documents.code);
    Context.data.approving_persons = [];
    for (const staff of staffsFetch) {
        if (staff.data.ext_user)
            Context.data.approving_persons.push(staff.data.ext_user)
    }
}

async function getApprovalOrder(): Promise<void> {
    const positions = await Promise.all(Context.data.approval_order!.map(f => f.fetch()));
    let staffs: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[] = [];
    for (const position of positions) {
        if (position.data.staff && position.data.staff.length > 0)
            staffs = staffs.concat(position.data.staff)
    }
    const staffsFetch = await Promise.all(staffs.map(f => f.fetch()));
    Context.data.approval_order_users = [];
    for (const staff of staffsFetch) {
        if (staff.data.ext_user)
            Context.data.approval_order_users.push(staff.data.ext_user)
    }
}

async function check_order_status(): Promise<boolean> {
    let app = await Context.data.order_lna!.fetch();
    if (app.data.__status && app.data.__status.code == app.fields.__status.variants.rejected.code)
        return false
    else
        return true
}

async function get_staffs_for_familiarization(): Promise<void> {
    let app = await Context.data.docs_lna!.fetch();
    let positionsF: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>[];
    if (app.data.wWho_acquainted && app.data.wWho_acquainted.code == 'groups') {
        const groups = await Promise.all(app.data.groups_lna!.map(f => f.fetch()));
        let positions: TApplication<Application$kedo$position$Data, Application$kedo$position$Params, Application$kedo$position$Processes>[] = [];
        for (const group of groups) {
            positions = positions.concat(group.data.positions || [])
        }
        positionsF = await Promise.all(positions.map(f => f.fetch()))
    } else {
        positionsF = await Namespace.app.position.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.organization.link(app.data.organization!)
            ))
            .size(10000)
            .all()
    }
    app.data.positions_review = positionsF;
    await app.save();
    let staffs: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[] = [];
    for (const position of positionsF) {
        if (position.data.staff && position.data.staff.length > 0)
            staffs = staffs.concat(position.data.staff)
    }
    let staffsFetch = await Promise.all(staffs.map(f => f.fetch()));
    staffsFetch = staffsFetch.filter(item=>item.data.__status!.code == item.fields.__status.variants.signed_documents.code);
    Context.data.familiarizing = [];
    for (const staff of staffsFetch) {
        if (staff.data.ext_user)
            Context.data.familiarizing.push(staff.data.ext_user)
    }
    Context.data.review_date = new Datetime().addDate(0, 0, app.data.familiarize_days || 1)
}

////////////////////////////////////////////////////////////////////////////////////////////////////////helpers
async function createStatusObj(app: any, status: string): Promise<void> {  
    
    const obj_status = {
        'app' : {
            'namespace' : app.namespace,
            'code'      : app.code,
            'id'        : app.id,
        },
        'status'    : status,
    }

    Context.data.kedo_status = JSON.stringify(obj_status);
}

///////////////////////////////////////////////////////statuses
async function createStatusLNASigned(): Promise<void> {
    createStatusObj(Context.data.docs_lna, 'signed');  
}

async function createStatusLNAAgreed(): Promise<void> {
    createStatusObj(Context.data.docs_lna, 'agreed_signed');  
}

async function createStatusLNACancelled(): Promise<void> {
    createStatusObj(Context.data.docs_lna, 'cancelled');  
}

async function checkSettingsKEDO(): Promise<void> {
    const setting = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('director_signing')
        ))
        .first();
    if (setting) {
        Context.data.director_signing = setting.data.status;
    }
}
