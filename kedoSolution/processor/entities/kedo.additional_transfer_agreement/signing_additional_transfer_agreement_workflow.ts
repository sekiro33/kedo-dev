/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function set_contract_filed(): Promise<void> {
    let additional_transfer_agreement = await Context.data.additional_transfer_agreement!.fetch();
    additional_transfer_agreement.data.line_status = `${additional_transfer_agreement.data.__status!.code};${additional_transfer_agreement.data.__status!.name}`;
    await additional_transfer_agreement.save();
}

async function set_file_name_filed(): Promise<void> {
    let additional_transfer_agreement = await Context.data.additional_transfer_agreement!.fetch();
    additional_transfer_agreement.data.line_file_name = (await additional_transfer_agreement.data.__file!.fetch()).data.__name;
    await additional_transfer_agreement.save();
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

async function createStatusAppChiefDocSigning(): Promise<void> {
    createStatusObj(Context.data.application_transfer, 'chief_doc_signing');
}
async function createStatusAppStaffDocSigning(): Promise<void> {
    createStatusObj(Context.data.application_transfer, 'staff_doc_signing');
}
async function createStatusAppCancelled(): Promise<void> {
    createStatusObj(Context.data.application_transfer, 'cancelled');
}


async function createStatusCancelled(): Promise<void> {
    createStatusObj(Context.data.additional_transfer_agreement, 'cancelled');
}
async function createStatusChiefOrderSigning(): Promise<void> {
    createStatusObj(Context.data.additional_transfer_agreement, 'chief_order_signing');
}
async function createStatusStaffOrderSigning(): Promise<void> {
    createStatusObj(Context.data.additional_transfer_agreement, 'staff_order_signing');
}
async function createStatusSigned(): Promise<void> {
    createStatusObj(Context.data.additional_transfer_agreement, 'signed');
}

async function getSigners(): Promise<void> {
    const kedo_settings = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('head_signing_notification')
        ))
        .first();
    Context.data.head_signing_notification = kedo_settings ? kedo_settings.data.status : false;
    const additional_transfer_agreement = await Context.data.additional_transfer_agreement?.fetch();
    const staff = await additional_transfer_agreement?.data.staff?.fetch();
    const organization_staff = await staff?.data.organization?.fetch();
    Context.data.signers_app = organization_staff?.data.signatories;
}

