/* Client scripts module */

declare const document: any;

async function onInit(): Promise<void> {
    if (Context.data.kedo_status) {
        const status = await Context.data.kedo_status.fetch();
        const button_cancel_documents = document.querySelectorAll('.btn-danger');
        for (let button of button_cancel_documents){
            if (button.innerText.includes('Отменить документы')) {
                if (Context.data.is_cancellation_process === true || status.data.code == "signing_application") {
                    button.hidden = true;
                } else {
                    button.hidden = false;
                }
            }
        }
    }
}