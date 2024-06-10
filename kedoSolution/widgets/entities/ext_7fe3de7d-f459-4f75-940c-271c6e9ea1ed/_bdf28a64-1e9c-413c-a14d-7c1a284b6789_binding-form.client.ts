/* Client scripts module */

async function alternative_integration_onchange(): Promise<void> {
    if (Context.data.is_alternative) {
        ViewContext.data.full_status_name_required = !Context.data.is_alternative;
    }

    Context.data.staff_id_1c = undefined;
}

async function doc_status_onchange(): Promise<void> {
    if (ViewContext.data.statusy_dokumentov) {
        const doc_status = await ViewContext.data.statusy_dokumentov.fetch();
        Context.data.polnoe_imya_statusa = doc_status.data.full_name;
    }
}

async function staff_id_1c_onchange(): Promise<void> {
    ViewContext.data.doc_id_1c_required = true;
    if (Context.data.staff_id_1c && Context.data.staff_id_1c.length > 0) {
        ViewContext.data.doc_id_1c_required = false;
    }
}

async function document_status_onchange(): Promise<void> {
    if (ViewContext.data.document_status_1c) {
        const status = await ViewContext.fields.statusy_dokumentov.app.search().size(10000).all();

        switch (ViewContext.data.document_status_1c.code) {
            case ViewContext.fields.document_status_1c.variants.on_sign.code:
                ViewContext.data.statusy_dokumentov = status.find(f => f.data.guid == '5b7a2767-c0a6-11ed-80cb-f20017d1803e');
                break;

            case ViewContext.fields.document_status_1c.variants.rejected.code:
                ViewContext.data.statusy_dokumentov = status.find(f => f.data.guid == '5b7a2769-c0a6-11ed-80cb-f20017d1803e');
                break;

            case ViewContext.fields.document_status_1c.variants.signed.code:
                ViewContext.data.statusy_dokumentov = status.find(f => f.data.guid == '5b7a2768-c0a6-11ed-80cb-f20017d1803e');
                break;
        }
    }
}
