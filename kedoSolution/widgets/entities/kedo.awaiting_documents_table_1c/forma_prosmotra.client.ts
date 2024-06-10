/* Client scripts module */

async function onInit(): Promise<void> {
    ViewContext.data.document_data_json = Context.data.document_creation_data ? JSON.parse(Context.data.document_creation_data) : undefined;
    ViewContext.data.document_1c_data_view = Context.data.document_1c_data ? JSON.parse(Context.data.document_1c_data) : undefined;

    await getStaffs();
    await getPrintForms();
}

async function getStaffs(): Promise<void> {
    let guid_1c: string[] = Context.data.personal_guid_1c ? JSON.parse(Context.data.personal_guid_1c) : [];
    let id_1c: string[] = Context.data.id_1c ? JSON.parse(Context.data.id_1c) : [];

    id_1c = id_1c.filter(id => id != undefined && id != null);

    const employment_placements = await Namespace.app.employment_directory.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.id_1c.in(id_1c)
        ))
        .size(id_1c.length)
        .all();

    const staff_table = ViewContext.data.staff_table ?? ViewContext.fields.staff_table.create();

    for (let i = 0; i < id_1c.length; i++) {
        const id = id_1c[i];
        const employment_placement = employment_placements.find(f => f.data.id_1c == id);

        const row = staff_table.insert();

        row.id_1c = id;
        row.individual_id = guid_1c[i] ?? "";

        if (employment_placement) row.employment_placement = employment_placement;
        if (employment_placement?.data.staff) row.staff = employment_placement.data.staff;
    }

    ViewContext.data.staff_table = staff_table;
}

async function getPrintForms(): Promise<void> {
    const ids = Context.data.print_forms_table!.map(f => f.id_1c);
    const signatories_ids = Context.data.print_forms_table!.map(f => f.signatory_id_1c);

    const signatories = await Namespace.app.staff.search()
        .where((f, g) => g.and(
            f.id_1c.in(signatories_ids),
            f.__deletedAt.eq(null),
        ))
        .size(signatories_ids.length)
        .all();

    if (ids.length > 0) {
        const viewTable = ViewContext.data.print_forms;

        const doc_types_1c = await ViewContext.fields.print_forms.fields.doc_type_1c.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.doc_type_id_1c.in(ids)
        )).size(ids.length).all();

        for (const row of Context.data.print_forms_table!) {
            const viewRow = viewTable!.insert();

            viewRow.print_form = row.print_form;
            viewRow.print_form_id = row.id_1c;
            viewRow.sign_file = row.sign_file;
            viewRow.stamp = row.stamp;

            const doc_type = doc_types_1c.find(f => f.data.doc_type_id_1c == row.id_1c);

            if (doc_type) {
                viewRow.doc_type_1c = doc_type;
            }

            const signatory = signatories.find(f => f.data.id_1c == row.signatory_id_1c);

            if (signatory) {
                viewRow.signatory = signatory;
            }
        }

        ViewContext.data.print_forms = ViewContext.data.print_forms;
    }
}
