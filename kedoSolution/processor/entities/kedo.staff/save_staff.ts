/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function changeUserFullName(): Promise<void> {
    // const staff = await Context.data.staff!.fetch();

    // const find_staff = await Application.search().where((f, g) => g.and(
    //     f.__id.eq(Context.data.__id),
    //     f.__deletedAt.eq(null)
    // )).first();
    
    if (Context.data.user) {
        const fetch_user = await Context.data.user.fetch();
        fetch_user.data.fullname = Context.data.full_name;
        await fetch_user.save()
    }

    if (Context.data.ext_user) {
        const fetch_ext = await Context.data.ext_user.fetch();
        fetch_ext.data.fullname = Context.data.full_name;
        await fetch_ext.save();
    }
}
