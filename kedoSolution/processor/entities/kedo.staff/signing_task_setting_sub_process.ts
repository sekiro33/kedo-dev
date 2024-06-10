/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    const integration_1c = settings.find(f => f.data.code == 'integration_1c');
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;
    const alternative_integration = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.use_alternative_integration = alternative_integration ? alternative_integration.data.status : false;
    Context.data.counter = 0;
    const deadline_candidate_task_sign_employment_documents = settings.find(f => f.data.code == 'deadline_candidate_task_sign_employment_documents');
    let term_signing: TDatetime;
    if (deadline_candidate_task_sign_employment_documents && deadline_candidate_task_sign_employment_documents.data.quantity) {
        term_signing = await System.productionSchedule.calcDate(new Datetime(), new Duration(deadline_candidate_task_sign_employment_documents.data.quantity, 'hours'))
    } else {
        term_signing = await System.productionSchedule.calcDate(new Datetime(), new Duration(16, 'hours'))
    }
    
    Context.data.term_signing = term_signing;
    Context.data.docs = [];

    // Трудовой договор.
    const contract = await Namespace.app.labor_contract.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.kedo_staff!),
            f.__status.neq(Namespace.app.labor_contract.fields.__status.variants.removed),
            f.__status.neq(Namespace.app.labor_contract.fields.__status.variants.signed)
        ))
        .first();
    Context.data.docs = Context.data.docs.concat(contract || []);

    // Приказ о приёме.
    const admission_order = await Namespace.app.admission_order.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.kedo_staff!),
            f.__status.neq(Namespace.app.admission_order.fields.__status.variants.removed),
            f.__status.neq(Namespace.app.admission_order.fields.__status.variants.signed)
        ))
        .first();
    Context.data.docs = Context.data.docs.concat(admission_order || []);

    // Заявления о предоставлении сведений о трудовой деятельности.
    const app_information_labor_activity = await Namespace.app.information_about_labor_activity.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.kedo_staff!),
            f.__status.neq(Namespace.app.information_about_labor_activity.fields.__status.variants.removed),
            f.__status.neq(Namespace.app.information_about_labor_activity.fields.__status.variants.signed)
        ))
        .first();
    Context.data.docs = Context.data.docs.concat(app_information_labor_activity || []);

    // Согласие на обработку ПД
    const consent_processing_personal_data = await Namespace.app.consent_processing_personal_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.kedo_staff!),
            f.__status.neq(Namespace.app.information_about_labor_activity.fields.__status.variants.signed)
        ))
        .first();

    Context.data.docs = Context.data.docs.concat(consent_processing_personal_data || []);

    // Прочие документы трудоустройства.
    const other_docs = await Namespace.app.additional_agreement_to_the_contract.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.kedo_staff!),
            f.doc_type.neq(null),
            f.__status.neq(Namespace.app.additional_agreement_to_the_contract.fields.__status.variants.removed),
            f.__status.neq(Namespace.app.additional_agreement_to_the_contract.fields.__status.variants.signed)
        ))
        .size(10000)
        .all();
    const typesDocs = await Namespace.app.types_other_employment_docs.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const myOtherDocs = other_docs.filter(f => {
        const myType = typesDocs.find(i => i.id == f.data.doc_type!.id);
        if (myType)
            return f
    })
    Context.data.docs = Context.data.docs.concat(myOtherDocs || []);

    // Дополнительное соглашение.
    const additional_agreement = await Namespace.app.additional_agreement.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.staff.link(Context.data.kedo_staff!),
        f.__status.neq(Namespace.app.additional_agreement.fields.__status.variants.signed)
    ))
        .size(10000)
        .all();
    Context.data.docs = Context.data.docs.concat(additional_agreement || []);

    const staff = await Context.data.kedo_staff!.fetch();
    Context.data.sign_type = staff.data.docs_signing_type!.code === "goskey" ? Context.fields.sign_type.variants.goskey : Context.fields.sign_type.variants.inner_sign;
}

async function setXML(): Promise<void> {
    const doc = await Context.data.doc!.fetch();
    doc.data.xml_file = Context.data.xml;
    await doc.save()
}

async function getDoc(): Promise<boolean> {
    if (!Context.data.docs)
        return false
    const countFiles = Context.data.docs.length;
    if (Context.data.counter! < countFiles) {
        Context.data.doc = Context.data.docs[Context.data.counter!];
        Context.data.counter!++;
        return true
    } else {
        return false
    }
}

async function set_line_status(): Promise<void> {
    const doc = await Context.data.doc!.fetch();
    doc.data.line_status = `${doc.data.__status!.code};${doc.data.__status!.name}`
    await doc.save();
}

async function set_status(): Promise<void> {
    const doc = await Context.data.doc!.fetch();
    await doc.setStatus(doc.fields.__status.variants.signed);
}
