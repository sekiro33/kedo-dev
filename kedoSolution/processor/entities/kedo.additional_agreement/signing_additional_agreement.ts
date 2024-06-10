
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

async function createStatusStaffOrderSigning(): Promise<void> {
    createStatusObj(Context.data.additional_agreement, 'staff_order_signing');
}
async function createStatusAppStaffOrderSigning(): Promise<void> {
    createStatusObj(Context.data.staff_personal_data, 'staff_doc_signing');
}
async function createStatusSigned(): Promise<void> {
    createStatusObj(Context.data.additional_agreement, 'signed');
}
async function createStatusAppOrderSigned(): Promise<void> {
    createStatusObj(Context.data.staff_personal_data, 'order_signed');
}
async function createStatusCancelled(): Promise<void> {
    createStatusObj(Context.data.additional_agreement, 'cancelled');
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
