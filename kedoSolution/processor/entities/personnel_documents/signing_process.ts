/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function searchStaff(): Promise<void> {
    const staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(Context.data.__createdBy)
        ))
        .first();
    Context.data.staff_user = staff
}

async function check_file_format(): Promise<boolean> {
    const file = await Context.data.file!.fetch();
    return file.data.__name.includes('.pdf');
}
