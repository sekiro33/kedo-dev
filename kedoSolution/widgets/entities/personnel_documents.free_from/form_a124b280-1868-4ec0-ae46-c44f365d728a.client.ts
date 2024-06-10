/* Client scripts module */
async function onInit(): Promise <void> {
    if (Context.data.data_file) {
        ViewContext.data.file_visibility = true;
    } else {
        ViewContext.data.file_visibility = false;
    }
}