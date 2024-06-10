/* Client scripts module */

async function onInit(): Promise<void> {

    //Получаем настройки КЭДО
    const settings = await ViewContext.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .size(10000)
        .all();

    const employed = settings.find(f => f.data.code === 'mass_invitation_employed');
    Context.data.employed = employed ? employed.data.status : true;

    const unep_required = settings.find(f => f.data.code === 'mass_invitation_need_signature');
    Context.data.unep_required = unep_required ? unep_required.data.status : true;

    const electronic_agreement_required = settings.find(f => f.data.code === 'mass_invitation_need_consent_data_processing');
    Context.data.electronic_agreement_required = electronic_agreement_required ? electronic_agreement_required.data.status : false;

    const personal_data_employee = settings.find(f => f.data.code === 'mass_invitation_personal_data_entered_employee');
    Context.data.personal_data_employee = personal_data_employee ? personal_data_employee.data.status : false;

    const soev_signing_in_office = settings.find(f => f.data.code === 'mass_invitation_agreement_signed_in_office');
    Context.data.soev_signing_in_office = soev_signing_in_office ? soev_signing_in_office.data.status : true;

}
