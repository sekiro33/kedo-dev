/* Client scripts module */
async function onInit(): Promise<void> {
    ViewContext.data.driver_dynamic = false;
    ViewContext.data.military_dynamic = false;
    ViewContext.data.show_file = false;
    ViewContext.data.application_file = Context.data.file;
    ViewContext.data.show_error = false;

    if (!Context.data.staff_personal_data) {
        throw new Error("staff_personal_data is undefined");
    }
    let personal_type = await Context.data.staff_personal_data.fetch();

    if (personal_type.data.page_photos_and_data) {
        ViewContext.data.file = personal_type.data.page_photos_and_data
        ViewContext.data.show_file = true;
    }
    if (personal_type.data.personal_data_type) {
        switch (personal_type.data.personal_data_type.code) {
            case "data_driver": {
                ViewContext.data.driver_dynamic = true;
                ViewContext.data.file = personal_type.data.diver_license;
                ViewContext.data.show_file = true;
                break;
            }
            case "military_registration": {
                ViewContext.data.military_registration = true;
                ViewContext.data.file = personal_type.data.military_record_document;
                ViewContext.data.show_file = true;
                break;
            }
            case "change_address_registration": {
                ViewContext.data.file = personal_type.data.page_current_registration;
                ViewContext.data.show_file = true;
                break;
            }
            case "change_residence": {
                ViewContext.data.file = personal_type.data.temporary_registration;
                ViewContext.data.show_file = true;
                break;
            }
            case "marriage_information": {
                ViewContext.data.file = personal_type.data.certificate;
                ViewContext.data.show_file = true;
                break;
            }
            case "data_education": {
                if (personal_type.data.completion_certificate && personal_type.data.completion_certificate.length > 0) {
                    ViewContext.data.file = personal_type.data.completion_certificate![0];
                    ViewContext.data.show_file = true;
                }
                break;
            }
            default: {
                ViewContext.data.show_file = false;
                break;
            }

        }
    }
    if (Context.data.file) {
        ViewContext.data.tab_visibility = true;
    } else {
        ViewContext.data.tab_visibility = false;
    }

    if (!Context.data.staff) {
        return;
    }
    const staff = await Context.data.staff.fetch();
    if (staff.data.employment_table) {
        if (Context.data.type_employment_string != 'Внешнее совместительство') {
            let count = Context.data.count_type_employment ?? 0;

            const info_additional_table = Context.data.info_additional_table ?? Context.fields.info_additional_table.create();

            for (count; count != 0; count--) {
                if (staff.data.employment_table && staff.data.employment_table.length > 0) {
                    const row = staff.data.employment_table[count - 1];
                    if (row.type_employment.code == 'main_workplace' || row.type_employment.code == 'internal_combination') {
                        const row_insert_doc = info_additional_table.insert();
                        row_insert_doc.place_employment_string = row.type_employment.name;
                        row_insert_doc.organization_employee = row.organization;
                        row_insert_doc.employment_contract_number = row.number_employment_contract;
                        row_insert_doc.date_employment_contract = row.date_employment_contract_as_date;
                    }
                }
            }
            Context.data.info_additional_table = Context.data.info_additional_table;
        }
    }

    if (Context.data.type_employment_string == 'Внешнее совместительство') {
        if (Context.data.place_employment) {
            const place_emloyment = await Context.data.place_employment.fetch();
            const row_insert_doc = Context.data.info_additional_table!.insert();
            row_insert_doc.place_employment_string = place_emloyment.data.type_employment!.name;
            row_insert_doc.organization_employee = place_emloyment.data.organization!;

            Context.data.info_additional_table = Context.data.info_additional_table;
        }
    }

}

async function date_check(): Promise<void> {
    let current_date = new TDate();
    if (Context.data.issue_date!.after(current_date)) ViewContext.data.show_error = true
    else ViewContext.data.show_error = false;
}
