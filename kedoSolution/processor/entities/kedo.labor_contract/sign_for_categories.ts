/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_labor_number(): Promise<void> {
    let staff = await Context.data.staff!.fetch();
    let doc = await Context.fields.labor_contract.app.search().where(f => f.staff.link(staff)).first();
    if (!doc)
        return
    Context.data.labor_contract = doc;
    await status_set()
    await set_status_signing()
}

async function fileds_set(): Promise<void> {
    let app = await Context.data.additional_agreement_to_the_contract!.fetch();
    app.data.__file = Context.data.file;
    app.data.line_file_name = (await Context.data.file!.fetch()).data.__name;
    app.data.staff = Context.data.staff;
    await app.save();
    await status_set();
}

async function status_set(): Promise<void> {
    let app = await Context.data.additional_agreement_to_the_contract!.fetch();
    app.data.line_status = `${app.data.__status!.code};${app.data.__status!.name}`
    await app.save();
}

async function set_status(app: any, status: TStatus<StatusItem$kedo$passport_data_application$__default, StatusGroups$kedo$passport_data_application>): Promise<void> {
    await app.setStatus(status);
}

async function set_status_signed(): Promise<void> {
    let app = await Context.data.additional_agreement_to_the_contract!.fetch();
    await set_status(app, app.fields.__status.variants.signed);
}


async function set_status_rejected(): Promise<void> {
    let app = await Context.data.additional_agreement_to_the_contract!.fetch();
    await set_status(app, app.fields.__status.variants.removed);
}

async function set_status_signing(): Promise<void> {
    let app = await Context.data.additional_agreement_to_the_contract!.fetch();
    await set_status(app, app.fields.__status.variants.signed);
}

async function getBossPosition(): Promise<void> {
    const staff = await Context.data.staff?.fetch();
    const organization_staff = await staff?.data.organization?.fetch();
    Context.data.signers_app = organization_staff?.data.signatories;

    if (Context.data.boss) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.boss!)
            ))
            .first()
        Context.data.boss_position = headApp!.data.position
    }
}

async function createStatusObj(app: any, status: string): Promise<void> {

    const obj_status = {
        'app': {
            'namespace': app.namespace,
            'code': app.code,
            'id': app.id,
        },
        'status': status,
    }

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function createStatusCategoryChiefOrderSigning(): Promise<void> {
    createStatusObj(Context.data.additional_agreement_to_the_contract, 'chief_order_signing');
}
async function createStatusCategoryStaffOrderSigning(): Promise<void> {
    createStatusObj(Context.data.additional_agreement_to_the_contract, 'staff_order_signing');
}
async function createStatusCategoryCancelled(): Promise<void> {
    createStatusObj(Context.data.additional_agreement_to_the_contract, 'cancelled');
}
async function createStatusCategorySigned(): Promise<void> {
    createStatusObj(Context.data.additional_agreement_to_the_contract, 'signed');
}

//заявки
async function createStatusAppChiefDocSigning(): Promise<void> {
    createStatusObj(Context.data.staff_personal_data, 'chief_doc_signing');
}
async function createStatusAppStaffDocSigning(): Promise<void> {
    createStatusObj(Context.data.staff_personal_data, 'staff_doc_signing');
}
async function createStatusAppOrderSigned(): Promise<void> {
    createStatusObj(Context.data.staff_personal_data, 'order_signed');
}

async function getSigners(): Promise<void> {
    const kedo_settings = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('head_signing_notification')
        ))
        .first();
    Context.data.head_signing_notification = kedo_settings ? kedo_settings.data.status : false;
    const staff = await Context.data.staff?.fetch();
    const organization_staff = await staff?.data.organization?.fetch();
    Context.data.signers_app = organization_staff?.data.signatories;
}