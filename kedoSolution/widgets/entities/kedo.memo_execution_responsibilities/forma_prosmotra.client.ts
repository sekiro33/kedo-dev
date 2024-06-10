/* Client scripts module */

async function onInit(): Promise<void> {
    if(Context.data.view_consent && (await Context.data.execution_dutie!.fetch()).data.execution_responsibilities_consent) {
        ViewContext.data.view_tab_consent = true;
    } else {
        ViewContext.data.view_tab_consent = false;
    }

    if (Context.data.execution_dutie) {
        const app = await Context.data.execution_dutie.fetch();
        ViewContext.data.is_cancellation_process = app.data.is_cancellation_process;
    }
}
