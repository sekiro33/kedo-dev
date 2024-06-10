/* Client scripts module */
async function changeLabel(): Promise<void> {
    if (Context.data.need_approval == true && Context.data.need_statement == false) {
        ViewContext.data.text_error = true;
    } else {
        ViewContext.data.text_error = false;
    } 
}