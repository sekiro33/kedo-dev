/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function searchCertificates(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    Context.data.staff_user = staff.data.ext_user;
    Context.data.staff_inn = staff.data.inn;
    const digital_signs_list = await Context.fields.digital_signs_list.app.search()
    .where((f,g) => g.and(
        f.__deletedAt.eq(null),
        f.user.eq(Context.data.staff_user!)
    ))
    .all();
    if (digital_signs_list && digital_signs_list.length > 0) {
        Context.data.digital_signs_list = digital_signs_list;
        Context.data.number_of_certificates = digital_signs_list.length;
        if (Context.data.number_of_certificates === 1) {
            Context.data.certificate = digital_signs_list[0];
        }
    }
}

async function getExternalId(): Promise <void> {
    const certificate = await Context.data.certificate!.fetch();
    Context.data.external_id = certificate.data.external_id;
}
