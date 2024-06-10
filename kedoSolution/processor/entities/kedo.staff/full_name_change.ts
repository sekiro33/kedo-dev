/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function full_name_change(): Promise<void> {
    let staff = await Context.data.staff!.fetch();
    if(!staff.data.ext_user)
    return
    let user = await staff.data.ext_user.fetch();
    user.data.fullname = staff.data.full_name;
    user.data.email = staff.data.email!.email;
    await user.save();
}
