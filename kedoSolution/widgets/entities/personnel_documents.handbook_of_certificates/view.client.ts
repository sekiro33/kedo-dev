/* Client scripts module */
async function onInit(): Promise<void> {
    if (Context.data.universal_responsible) {
        ViewContext.data.view_responsible = true;
        ViewContext.data.view_responsible_table = false;
    } else if (Context.data.universal_responsible == false) {
        ViewContext.data.view_responsible_table = true;
        ViewContext.data.view_responsible = false;
    }
    else {
        ViewContext.data.view_responsible = true;
        ViewContext.data.view_responsible_table = false;
    }
}