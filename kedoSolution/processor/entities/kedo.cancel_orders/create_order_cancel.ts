
async function setCancelDocName(): Promise<void> {
    if (Context.data.order_file) {
        const doc_name = await Context.data.order_file.fetch();
        Context.data.order_name = doc_name.data.__name;
    }
}

async function generateFile(): Promise<void> {
    if (Context.data.cancel_doc_app) {
        const statement = await Context.data.cancel_doc_app.fetch();
        Context.data.statement_name = statement.data.__name;
    }
    if (Context.data.cancel_memo) {
        const memo = await Context.data.cancel_memo.fetch();
        Context.data.memo_name = memo.data.__name;
    }
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();
        Context.data.staff_full_name = `${staff.data.surname} ${staff.data.name} ${staff.data.middlename}`;

        if (staff.data.position) {
            const position = await staff.data.position.fetch();
            Context.data.staff_position = position.data.__name;
        }
    }

    if (Context.data.order_signatory_app) {
        const director = await Context.data.order_signatory_app.fetch();
        Context.data.director_full_name = `${director.data.surname} ${director.data.name} ${director.data.middlename}`;

        if (director.data.position) {
            const position = await director.data.position.fetch();
            Context.data.director_position = position.data.__name;
        }
    }
}

async function getSignatoryStaff(): Promise<void> {
    if (Context.data.order_signatory_user) {
        const signatoryStaff = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.order_signatory_user!),
            ))
            .first();
        Context.data.order_signatory_app = signatoryStaff!;
    }
}