/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function fileds_set(): Promise<void> {
    let app = await Context.data.child_personal_data_consent!.fetch();
    app.data.__file = Context.data.file;
    app.data.line_file_name = (await Context.data.file!.fetch()).data.__name;
    app.data.staff = Context.data.staff;
    await app.save();
    await status_set();
}

async function status_set(): Promise<void> {
    let app = await Context.data.child_personal_data_consent!.fetch();
    app.data.line_status = `${app.data.__status!.code};${app.data.__status!.name}`
    await app.save();
}

async function set_status(app: any, status: TStatus<StatusItem$kedo$passport_data_application$__default, StatusGroups$kedo$passport_data_application>): Promise<void> {
    await app.setStatus(status);
}

async function set_status_signed(): Promise<void> {
    let app = await Context.data.child_personal_data_consent!.fetch();
    await set_status(app, app.fields.__status.variants.signed);
}

async function set_status_rejected(): Promise<void> {
    let app = await Context.data.child_personal_data_consent!.fetch();
    await set_status(app, app.fields.__status.variants.removed);
}

async function getBossPosition(): Promise<void> {
    if (Context.data.signatories) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.signatories!)
            ))
            .first()
        Context.data.boss_position = headApp!.data.position
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

async function createStatusCancelled(): Promise<void> {
    createStatusObj(Context.data.child_personal_data_consent, 'cancelled');
}

async function createStatusSigned(): Promise<void> {
    createStatusObj(Context.data.child_personal_data_consent, 'signed');
}

async function createStatusSigning(): Promise<void> {
    createStatusObj(Context.data.child_personal_data_consent, 'signing');
}
