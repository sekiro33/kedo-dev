/* Client scripts module */

async function onInit(): Promise<void> {

}

async function loadHistory(): Promise<void> {
    if (!Context.data.staff) {
        return;
    }

    const employment_directory = await Namespace.app.employment_directory.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.staff!)
        ))
        .size(1000)
        .all();
}