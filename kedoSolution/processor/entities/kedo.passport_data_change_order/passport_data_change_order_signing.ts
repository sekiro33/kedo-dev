/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function fileds_set(): Promise<void> {
    let app = await Context.data.passport_data_change_order!.fetch();
    app.data.__file = Context.data.file;
    app.data.line_file_name = (await Context.data.file!.fetch()).data.__name;
    app.data.staff = Context.data.staff;
    await app.save();
    await status_set();
}



async function status_set():Promise<void>
{
    let app = await Context.data.passport_data_change_order!.fetch();
    app.data.duration = Math.round(app.data.duration!)
    app.data.line_status = `${app.data.__status!.code};${app.data.__status!.name}`
    await app.save();
}



async function get_labor_number():Promise<void>
{
    let staff = await Context.data.staff!.fetch();
    let doc = await Context.fields.labor_contract.app.search().where(f=> f.staff.link(staff)).first();
    if(!doc)
    return
    Context.data.labor_contract = doc;
}





async function set_status(app:any,status: TStatus<StatusItem$kedo$passport_data_application$__default, StatusGroups$kedo$passport_data_application>): Promise<void> {
    await app.setStatus(status);
}

async function set_status_signed(): Promise<void> {
    let app = await Context.data.passport_data_change_order!.fetch();
    await set_status(app,app.fields.__status.variants.signed);
}


async function set_status_rejected(): Promise<void> {
    let app = await Context.data.passport_data_change_order!.fetch();
    await set_status(app,app.fields.__status.variants.removed);
}

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

async function createStatusAppChiefDocSigning(): Promise<void> {
    createStatusObj(Context.data.application_pd, 'chief_doc_signing');
}
async function createStatusAppStaffDocSigning(): Promise<void> {
    createStatusObj(Context.data.application_pd, 'staff_doc_signing');
}
async function createStatusAppCancelled(): Promise<void> {
    createStatusObj(Context.data.application_pd, 'cancelled');
}
async function createStatusAppOrderSigned(): Promise<void> {
    createStatusObj(Context.data.application_pd, 'order_signed');
}


async function createStatusCancelled(): Promise<void> {
    createStatusObj(Context.data.passport_data_change_order, 'cancelled');
}
async function createStatusChiefSigning(): Promise<void> {
    createStatusObj(Context.data.passport_data_change_order, 'chief_order_signing');
}
async function createStatusStaffSigning(): Promise<void> {
    createStatusObj(Context.data.passport_data_change_order, 'staff_order_signing');
}
async function createStatusSigned(): Promise<void> {
    createStatusObj(Context.data.passport_data_change_order, 'signed');
}