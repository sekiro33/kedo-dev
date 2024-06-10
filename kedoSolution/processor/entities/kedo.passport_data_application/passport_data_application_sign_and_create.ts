/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function fileds_set(): Promise<void> {

    let app = await Context.data.passport_data_application!.fetch();
    app.data.__file = Context.data.file;
    // app.data.line_file_name = (await Context.data.file!.fetch()).data.__name;
    app.data.staff = Context.data.staff;
    await app.save();
    await status_set();
}

async function status_set(): Promise<void> {
    let app = await Context.data.passport_data_application!.fetch();
    app.data.duration = Math.round(app.data.duration!)
    app.data.line_status = `${app.data.__status!.code};${app.data.__status!.name}`
    await app.save();
}

// async function set_status(app: any, status: TStatus<StatusItem$kedo$passport_data_application$__default, StatusGroups$kedo$passport_data_application>): Promise<void> {
//     await app.setStatus(status);
// }

// async function set_status_signed(): Promise<void> {
//     let app = await Context.data.passport_data_application!.fetch();
//     await set_status(app, app.fields.__status.variants.signed);
// }


// async function set_status_rejected(): Promise<void> {
//     let app = await Context.data.passport_data_application!.fetch();
//     await set_status(app, app.fields.__status.variants.removed);
// }

async function getSettings(): Promise<void> {
    const custom_generate_personal_data_doc = await Context.fields.settings_kedo.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('custom_generate_personal_data_doc')
        ))
        .first();
    Context.data.custom_generate_personal_data_doc = custom_generate_personal_data_doc ? custom_generate_personal_data_doc.data.status : false;
    if (Context.data.signatory) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.signatory!)
            ))
            .first()
        Context.data.boss_position = headApp!.data.position
        Context.data.boss_fio = (await Context.data.signatory.fetch()).data.fullname;
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

async function createStatusPDCancelled(): Promise<void> { 
    createStatusObj(Context.data.passport_data_application, 'cancelled');
}

async function createStatusPDApproval(): Promise<void> {
    createStatusObj(Context.data.passport_data_application, 'approval');
}
async function createStatusPDSigning(): Promise<void> {
    createStatusObj(Context.data.passport_data_application, 'signing');
}