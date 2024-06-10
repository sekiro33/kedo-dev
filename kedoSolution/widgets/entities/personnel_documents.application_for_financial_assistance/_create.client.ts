async function onInit(): Promise<void> {
    const user = await System.users.getCurrentUser();

    Context.data.staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user)
        ))
        .first();
}

async function get_instruction(): Promise<void> {
    if (Context.data.type_of_financial_assistance) {
        const type_of_financial_assistance = await Context.data.type_of_financial_assistance!.fetch();
        Context.data.list_of_required_documents = type_of_financial_assistance.data.list_of_required_documents;
    } else {
        Context.data.list_of_required_documents = '';
    }
}
