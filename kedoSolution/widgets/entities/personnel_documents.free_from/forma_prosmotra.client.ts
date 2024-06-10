/* Client scripts module */
async function onInit(): Promise <void> {
    if (Context.data.provided_information_file) {
        ViewContext.data.file_visibility = true;
    } else {
        ViewContext.data.file_visibility = false;
    }
}