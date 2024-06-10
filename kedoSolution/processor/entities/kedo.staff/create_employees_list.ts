/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function setPermissions(): Promise<void> {
    const nameSpace = 'testovyi';
    const staff = await Context.data.staff!.fetch();
    const organisation = staff.data.organization!;
    const groups = await System.userGroups.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.namespace.eq(nameSpace)
        ))
        .size(10000)
        .all();
    const myGroup = groups.find(f => f.data.description == organisation.id);
    if (myGroup) {
        const app = await Context.data.doc!.fetch();
        const perm = new Permissions([new PermissionValue(myGroup, [PermissionType.READ])]);
        await app.setPermissions(perm)
    }
}
