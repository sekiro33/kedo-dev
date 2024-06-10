/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function setDocsPermissions(): Promise<void> {
  Context.data.docs = [];

  // Трудовой договор.
  const contract = await Namespace.app.labor_contract.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.staff.link(Context.data.staff!),
      f.__status.neq(Namespace.app.labor_contract.fields.__status.variants.removed),
      f.__status.neq(Namespace.app.labor_contract.fields.__status.variants.signed)
    ))
    .first();
  Context.data.docs = Context.data.docs.concat(contract || []);

  // Приказ о приёме.
  const admission_order = await Namespace.app.admission_order.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.staff.link(Context.data.staff!),
      f.__status.neq(Namespace.app.admission_order.fields.__status.variants.removed),
      f.__status.neq(Namespace.app.admission_order.fields.__status.variants.signed)
    ))
    .first();
  Context.data.docs = Context.data.docs.concat(admission_order || []);

  // Прочие документы для трудоустройства.
  const other_docs = await Namespace.app.additional_agreement_to_the_contract.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.staff.link(Context.data.staff!),
      f.__status.neq(Namespace.app.additional_agreement_to_the_contract.fields.__status.variants.removed),
      f.__status.neq(Namespace.app.additional_agreement_to_the_contract.fields.__status.variants.signed)
    ))
    .size(10000)
    .all();
  const typesDocs = await Namespace.app.types_other_employment_docs.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
  if (other_docs && other_docs.length > 0) {
    const myOtherDocs = other_docs.filter(f => {
      if (!f.data.doc_type) {
        return;
      };
      const myType = typesDocs.find(i => i.id == f.data.doc_type!.id);
      if (myType && myType.data.only_employee_signs != true)
        return f
    })
    Context.data.docs = Context.data.docs.concat(myOtherDocs || [])
  }

  const additional_agreement = await Namespace.app.additional_agreement.search().where((f, g) => g.and(
    f.__deletedAt.eq(null),
    f.staff.link(Context.data.staff!),
    f.__status.neq(Namespace.app.additional_agreement.fields.__status.variants.signed)
  ))
    .size(10000)
    .all();

  Context.data.docs = Context.data.docs.concat(additional_agreement || []);
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