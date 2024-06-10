/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function set_xml(): Promise<void> {
    let doc: any;

    if (Context.data.personel_document) {
        const pd = await Context.data.personel_document.fetch();
        doc = await pd.data.__sourceRef!.fetch();
    }

    if (Context.data.document_for_employment) {
        const de = await Context.data.document_for_employment.fetch();
        doc = await de.data.__sourceRef!.fetch();
    }

    if (doc) {
        doc.data.xml_file = Context.data.xml_file;
        await doc.save();
    }
}

async function set_signed_status(): Promise<void> {
    let doc: any;

    if (Context.data.personel_document) {
        const pd = await Context.data.personel_document.fetch();
        doc = await pd.data.__sourceRef!.fetch();
    }

    if (Context.data.document_for_employment) {
        const de = await Context.data.document_for_employment.fetch();
        doc = await de.data.__sourceRef!.fetch();
    }

    if (doc.fields.__status && doc.fields.__status.variants.signed) {
        await doc.setStatus(doc.fields.__status.variants.signed);
    }
}

async function set_rejected_status(): Promise<void> {
    let doc: any;

    if (Context.data.personel_document) {
        const pd = await Context.data.personel_document.fetch();
        doc = await pd.data.__sourceRef!.fetch();
    }

    if (Context.data.document_for_employment) {
        const de = await Context.data.document_for_employment.fetch();
        doc = await de.data.__sourceRef!.fetch();
    }

    if (doc.fields.__status && doc.fields.__status.variants.rejected) {
        await doc.setStatus(doc.fields.__status.variants.rejected);
    }
}

async function set_on_sign_status(): Promise<void> {
    let doc: any;

    if (Context.data.personel_document) {
        const pd = await Context.data.personel_document.fetch();
        doc = await pd.data.__sourceRef!.fetch();
    }

    if (Context.data.document_for_employment) {
        const de = await Context.data.document_for_employment.fetch();
        doc = await de.data.__sourceRef!.fetch();
    }

    if (doc.fields.__status && doc.fields.__status.variants.signing) {
        await doc.setStatus(doc.fields.__status.variants.signing);
    }
}

//Не используется после изменений по тикету 1731
// async function get_org_head_app(): Promise<void> {
//     const org_head = await Context.fields.staff_chief_kedo.app.search()
//         .where((f, g) => g.and(
//             f.__deletedAt.eq(null),
//             f.ext_user.eq(Context.data.staff_chief!),
//             f.__status.eq(Context.fields.staff_chief_kedo.app.fields.__status.variants.signed_documents),
//         ))
//         .first();

//     Context.data.staff_chief_kedo = org_head;
// }

async function add_to_signers_group(): Promise<void> {
    const signers_group = await System.userGroups.search().where((f, g) =>
        g.and(
            f.__deletedAt.eq(null),
            f.__id.eq('721d2836-3d06-42ec-ac3d-e8002d2d897e'),
        )).first();

    if (signers_group) {
        signers_group.addItem(Context.data.staff_chief!);
        await signers_group.save();
    }
}

async function delete_from_signers_group(): Promise<void> {
    const signers_group = await System.userGroups.search().where((f, g) =>
        g.and(
            f.__deletedAt.eq(null),
            f.__id.eq('721d2836-3d06-42ec-ac3d-e8002d2d897e'),
        )).first();

    const subOrgunitIds = signers_group!.data.subOrgunitIds;
    subOrgunitIds!.filter(f => f != Context.data.staff_chief!.id);
    signers_group!.data.subOrgunitIds = subOrgunitIds;
}

async function line_status_set(): Promise<void> {
    let doc: any;

    if (Context.data.personel_document) {
        const pd = await Context.data.personel_document.fetch();
        doc = await pd.data.__sourceRef!.fetch();
    }

    if (Context.data.document_for_employment) {
        const de = await Context.data.document_for_employment.fetch();
        doc = await de.data.__sourceRef!.fetch();
    }

    doc.data.line_status = `${doc.data.__status!.code};${doc.data.__status!.name}`
    await doc.save();
}


async function generate_alert(): Promise<void> {
    Context.data.alert_body_email = `Вам поступил документ на подписание на портале КЭДО. Подпишите документ до ${Context.data.limit!.format('DD.MM.YYYY HH:mm')}.`;
    Context.data.alert_body_sms = `Вам поступил документ на подписание на портале КЭДО. Подпишите документ до ${Context.data.limit!.format('DD.MM.YYYY HH:mm')}. (ссылка)`
}

async function calcOverdueDate(): Promise<void> {
    const overdue_date = await System.productionSchedule.calcDate(new Datetime(), new Duration(1, "days"));
    Context.data.limit = overdue_date;
}
