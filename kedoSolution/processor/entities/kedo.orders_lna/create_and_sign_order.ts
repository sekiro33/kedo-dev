/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_signatory(): Promise<void> {
    if (Context.data.boss) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.boss!)
            ))
            .first()
        Context.data.job_position = (await headApp!.data.position!.fetch()).data.__name
    }
}

async function getSigners(): Promise<void> {
    const kedo_settings = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('head_signing_notification')
        ))
        .first();
    Context.data.head_signing_notification = kedo_settings ? kedo_settings.data.status : false;

    const document_lna = await Context.data.document_lna!.fetch();
    const organization_staff = await document_lna?.data.organization?.fetch();
    Context.data.signers_app = organization_staff?.data.signatories;
}
