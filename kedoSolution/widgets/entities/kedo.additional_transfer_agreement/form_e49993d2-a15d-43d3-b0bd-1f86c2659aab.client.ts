/* Client scripts module */

async function onInit(): Promise<void> {
    const now = new TDate().addDate(0, 0, -1);
    Context.fields.date.data.setFilter(f => f.gte(now));

    if (Context.data.transfer_application) {
        const app = await Context.data.transfer_application.fetch();
        ViewContext.data.is_cancellation_process = app.data.is_cancellation_process;
    }
}