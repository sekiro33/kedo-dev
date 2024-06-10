/* Client scripts module */
async function onInit(): Promise<void> {
    if (Context.data.category_assignment) {
        let app = await Context.data.category_assignment!.fetch();
        if (app.data.staff_category) {
            let category = await app.data.staff_category.fetch();
            if (category.data.code == 'invalid_child') {
                ViewContext.data.view_invalid_child = true;
            } else {
                ViewContext.data.view_invalid_child = false;
            }
        }
    }
}