
async function processingRows(): Promise<void> {
    Context.data.count_iteration!++;
    Context.data.is_main_workplace = false;
    Context.data.is_internal_combination = false;
    Context.data.is_external_combination = false;

    if (!Context.data.staff) {
        throw new Error("staff is undefined")
    }

    const staff = await Context.data.staff.fetch();
    if (staff.data.employment_table) {
        const row = staff.data.employment_table[Context.data.count_type_employment! - 1];
        Context.data.type_employment_string = row.type_employment.name;
        Context.data.organization_employee = row.organization;
        Context.data.place_employment = row.employment_placement_app;
        Context.data.count_type_employment!--;

        if (row.type_employment.code == 'main_workplace') {
            Context.data.is_main_workplace = true;
        }
        if (row.type_employment.code == 'internal_combination') {
            Context.data.is_internal_combination = true;
            Context.data.is_internal_place = true;
        }
        if (row.type_employment.code == 'external_combination') {
            Context.data.is_external_combination = true;
        }
        if (Context.data.is_internal_place === true && Context.data.is_external_combination === false) {
            Context.data.type_employment_string = `Основное место работы и внутреннее(-ие) совместительство(-а)`;
        }

        if (Context.data.count_type_employment == 0) {
            Context.data.isEmployeeProcessed = true;
        } else {
            Context.data.isEmployeeProcessed = false;
        }
    }
}

async function processingTable(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("staff is undefined")
    }
    const staff = await Context.data.staff.fetch();
    if (staff.data.employment_table) {
        Context.data.count_type_employment = staff.data.employment_table.length;
    }
}

async function fillingContext(): Promise<void> {
    let user = await System.users.getCurrentUser();
    Context.data.staff = await Context.fields.staff.app.search().where(f => f.ext_user.eq(user)).first();
}

async function initializingAdditionalVariables(): Promise<void> {
    if (Context.data.type_personal_data) {
        const type_data = await Context.data.type_personal_data.fetch();


        Context.fields.category_type_personal_data.data.variants.push({ code: type_data.data.code!, name: type_data.data.name! });
        Context.data.category_type_personal_data = Context.fields.category_type_personal_data.data.variants.find(f => f.code == type_data.data.code!) as never;
    }
}
