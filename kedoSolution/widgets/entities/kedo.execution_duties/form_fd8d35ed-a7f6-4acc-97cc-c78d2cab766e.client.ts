/* Client scripts module */

async function onInit(): Promise<void> {
    if (Context.data.execution_duties) {
        const app = await Context.data.execution_duties.fetch();
        ViewContext.data.is_cancellation_process = app.data.is_cancellation_process;
    }
}