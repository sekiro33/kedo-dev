/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function fileds_set(): Promise<void> {
    let app = await Context.data.application_category_assignment!.fetch();
    app.data.__file = Context.data.file;
    app.data.line_file_name = (await Context.data.file!.fetch()).data.__name;
    app.data.staff = Context.data.staff;
    app.data.category_assignment = Context.data.category_assignment;
    await app.save();
    await status_set();
}



async function status_set():Promise<void>
{
    let app = await Context.data.application_category_assignment!.fetch();
    app.data.duration = Math.round(app.data.duration!)
    app.data.line_status = `${app.data.__status!.code};${app.data.__status!.name}`
    await app.save();
}





async function set_status(app:any,status: TStatus<StatusItem$kedo$passport_data_application$__default, StatusGroups$kedo$passport_data_application>): Promise<void> {
    await app.setStatus(status);
}

async function set_status_signed(): Promise<void> {
    let app = await Context.data.application_category_assignment!.fetch();
    await set_status(app,app.fields.__status.variants.signed);
}


async function set_status_rejected(): Promise<void> {
    let app = await Context.data.application_category_assignment!.fetch();
    await set_status(app,app.fields.__status.variants.removed);
}
async function get_fio(): Promise<void> {
    if(Context.data.signatory){
        let app= await Context.data.signatory.fetch();
        Context.data.fio_director = app.data.fullname;
    }
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

async function createStatusCanceled(): Promise<void> {
    createStatusObj(Context.data.application_category_assignment, 'cancelled');
}

async function createStatusSigning(): Promise<void> {
    createStatusObj(Context.data.application_category_assignment, 'signing');
}

async function createStatusApproval(): Promise<void> {
    createStatusObj(Context.data.application_category_assignment, 'approval');
}
