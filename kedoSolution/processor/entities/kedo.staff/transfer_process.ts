/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function blockUser(): Promise<void> {
    const staff = await Context.data.kedo_staff!.fetch();
    if (staff.data.external_user && staff.data.external_user.length > 0)
        Context.fields.exy_user_app.app.block(staff.data.external_user[0])
    else if (staff.data.ext_user)
        await staff.data.ext_user.block()
}
