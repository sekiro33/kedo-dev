/* Client scripts module */
async function onInit(): Promise<void> {
    if (Context.data.execution_dutie) {
        const app = await Context.data.execution_dutie.fetch();
        ViewContext.data.is_cancellation_process = app.data.is_cancellation_process;
    }
}