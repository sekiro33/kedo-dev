/* Client scripts module */
async function onInit(): Promise<void> {
    if (Context.data.application_transfer) {
        const app = await Context.data.application_transfer.fetch();
        ViewContext.data.is_cancellation_process = app.data.is_cancellation_process;
    }
}