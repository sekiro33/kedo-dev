async function additional_agreement_table_onchange(): Promise<void> {
    const additional_agreement_table = Context.data.additional_agreements!;

    for (const row of additional_agreement_table) {
        if (row.file && !row.view_file) {
            const file = await row.file.fetch();
            const new_file = await Context.fields.additional_agreements.fields.file.createFromLink(file.data.__name, await file.getDownloadUrl());
            row.view_file = new_file;
        }

        if (!row.file && row.view_file) {
            row.view_file = row.file;
        }
    }

    if (JSON.stringify((Context.data.additional_agreements as any).json()) !== ViewContext.data.additional_agreement_table_string) {
        ViewContext.data.additional_agreement_table_string = JSON.stringify((Context.data.additional_agreements as any).json());
        Context.data.additional_agreements = Context.data.additional_agreements;
    }
}

async function employment_documents_table_onchange(): Promise<void> {
    const employment_documents = Context.data.docs!;

    for (const row of employment_documents) {
        if (row.doc_file && !row.view_file) {
            const file = await row.doc_file.fetch();
            const new_file = await Context.fields.docs.fields.doc_file.createFromLink(file.data.__name, await file.getDownloadUrl());
            row.view_file = new_file;
        }

        if (!row.doc_file && row.view_file) {
            row.view_file = row.doc_file;
        }
    }

    if (JSON.stringify((Context.data.docs as any).json()) !== ViewContext.data.docs_table_string) {
        ViewContext.data.docs_table_string = JSON.stringify((Context.data.docs as any).json());
        Context.data.docs = Context.data.docs;
    }
}
