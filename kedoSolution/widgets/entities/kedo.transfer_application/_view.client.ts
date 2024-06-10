
declare const document: any, console: any;

async function onInit(): Promise<void> {
    console.log("test change")
    if (Context.data.kedo_status) {
        const status = await Context.data.kedo_status.fetch();
        const button_cancel_documents = document.querySelectorAll('.btn-danger');
        for (let button of button_cancel_documents) {
            if (button.innerText.includes('Отменить документы')) {
                if (Context.data.is_cancellation_process === true || status.data.code == "signing_application") {
                    button.hidden = true;
                } else {
                    button.hidden = false;
                }
            }
        }
    }

    if (Context.data.__file) {
        ViewContext.data.show_tab = true;
    } else {
        ViewContext.data.show_tab = false;
    }

    if (Context.data.linked_order) {
        ViewContext.data.view_order = true;
    } else {
        ViewContext.data.view_order = false;
    }

    if (Context.data.transfer_approve) {
        ViewContext.data.view_approve = true;
    } else {
        ViewContext.data.view_approve = false;
    }
    const app = await Application.search().where(f => f.__id.eq(Context.data.__id)).first();
    const additional_transfer_agreement = await Namespace.app.additional_transfer_agreement.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.transfer_application.link(app!))).first();
    if (additional_transfer_agreement) {
        ViewContext.data.view_additional_agreement = true;
    } else {
        ViewContext.data.view_additional_agreement = false;
    }
}