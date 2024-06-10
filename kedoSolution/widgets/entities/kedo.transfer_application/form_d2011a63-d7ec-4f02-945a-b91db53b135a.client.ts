/* Client scripts module */

async function onInit(): Promise<void> {
    if (Context.data.transfer_application) {
        const app = await Context.data.transfer_application.fetch();
        Context.data.is_cancellation_process = app.data.is_cancellation_process;
    }
}