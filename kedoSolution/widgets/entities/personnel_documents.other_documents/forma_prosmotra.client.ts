/* Client scripts module */
async function onInit(): Promise <void> {
    if (Context.data.app_basis) {
        ViewContext.data.tab_visibility = true;
    } else {
        ViewContext.data.tab_visibility = false;
    }
}