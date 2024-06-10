/* Client scripts module */


async function onInit(): Promise<void> {
    Context.data.assignment_date = new TDate();
    if (!!Context.data.bulk_edit) {
        ViewContext.data.view_staff = false;
    } else {
        ViewContext.data.view_staff = true;
    }
}
async function category_change(): Promise<void> {
    if (Context.data.staff_categories) {
        let app = await Context.data.staff_categories.fetch();
        if (app.data.perpetual == false || undefined) {
            ViewContext.data.view_expiration_date = true;
        }
        else {
            ViewContext.data.view_expiration_date = false;
        }

        if (app.data.code == 'invalid_child') {
            ViewContext.data.view_invalid_child = true;
        }
        else {
            ViewContext.data.view_invalid_child = false;
        }

    }

}

async function validate(): Promise<ValidationResult> {
    const result = new ValidationResult();
    if(Context.data.staff && Context.data.staff_categories){
        let staff = await Context.data.staff.fetch();
        if(staff.data.categories_table && staff.data.categories_table.find(item=>item.staff_categories.id == Context.data.staff_categories!.id)){
            result.addMessage('Данная категория уже присвоена сотруднику')
        }
    }


    return result
}
