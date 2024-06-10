/* Client scripts module */
async function onInit(): Promise<void> {
    if (Context.data.type_personal_data && Context.data.staff_personal_data) {
        const app = await Context.data.staff_personal_data.fetch();

        if (Context.data.type_personal_data.code == "passport_data") {
            ViewContext.data.personal_data_passport = true;
            ViewContext.data.data_pass_required = true;

            Context.data.full_name = app.data.full_name;
            Context.data.series = app.data.series;
            Context.data.number = app.data.number;
            Context.data.issue_date = app.data.date_of_issue;
            Context.data.issued_by = app.data.issued_by;
            Context.data.department_code = app.data.department_code;
            Context.data.page_photos_and_data = app.data.page_photos_and_data;
        }

        if (Context.data.type_personal_data.code == "marriage_information") {
            ViewContext.data.marriage_information = true;
            ViewContext.data.data_married_required = true;

            Context.data.marriage_certificate = app.data.marriage_certificate;
        }

        if (Context.data.type_personal_data.code == "change_residence") {
            ViewContext.data.change_residence = true;
            ViewContext.data.data_residence_required = true;

            Context.data.address = app.data.address;
        }

        if (Context.data.type_personal_data.code == "change_phone_number") {
            ViewContext.data.change_phone_number = true;
            ViewContext.data.data_phone_required = true;

            Context.data.phone = app.data.phone;
        }

        if (Context.data.type_personal_data.code == "changt_snils") {
            ViewContext.data.change_snils = true;
            ViewContext.data.data_snils_required = true;

            Context.data.snils = app.data.snils;
        }

        if (Context.data.type_personal_data.code == "change_address_registration") {
            ViewContext.data.change_address_registration = true;
            ViewContext.data.data_adress_required = true;

            if (app.data.temporary_registration) {
                Context.data.temporary_registration = app.data.temporary_registration;
            }
            if (app.data.page_current_registration) {
                Context.data.page_current_registration = app.data.page_current_registration;
            }
        }

        if (Context.data.type_personal_data.code == "military_registration") {
            ViewContext.data.military_registration = true;
            ViewContext.data.data_military_required = true;

            Context.data.military_record_document = app.data.military_record_document;
        }

        if (Context.data.type_personal_data.code == "data_driver") {
            ViewContext.data.data_driver = true;
            ViewContext.data.data_driver_required = true;

            Context.data.diver_license = app.data.diver_license;
        }

        if (Context.data.type_personal_data.code == "data_language") {
            ViewContext.data.data_language = true;
            ViewContext.data.data_lang_required = true;

            Context.data.proficience_level = app.data.proficience_level;
            Context.data.foreign_language = app.data.foreign_language;
        }

        if (Context.data.type_personal_data.code == "data_education") {
            ViewContext.data.data_education = true;
            ViewContext.data.data_education_required = true;

            Context.data.education_level = app.data.education_level;
            if (app.data.completion_certificate) {
                Context.data.completion_certificate = app.data.completion_certificate[0];
            }
        }

        if (Context.data.type_personal_data.code == "composition_family_information") {
            ViewContext.data.composition_family_information = true;
            ViewContext.data.data_family_required = true;
        }
    }
}
async function changePass(): Promise<void> {
    if (Context.data.passport_data_changed == true) {
        ViewContext.data.personal_data_passport = true;
        ViewContext.data.data_pass_required = true;
    } else {
        ViewContext.data.personal_data_passport = false;
        ViewContext.data.data_pass_required = false;
    }
}

async function typeAdress(): Promise<void> {
    if (ViewContext.data.type_adress == true && ViewContext.data.change_address_registration == true) {
        ViewContext.data.constant_adress = true;
        ViewContext.data.temporary_adress = false;
    }
    if (ViewContext.data.type_adress == false && ViewContext.data.change_address_registration == true) {
        ViewContext.data.constant_adress = false;
        ViewContext.data.temporary_adress = true;
    }
}

async function changeFamily(): Promise<void> {
    if (Context.data.relation_degree) {
        if (Context.data.relation_degree.code == "husband_wife" && ViewContext.data.composition_family_information == true) {
            ViewContext.data.husband_or_wife = true;
            ViewContext.data.child = false;
            ViewContext.data.other_doc = false;
        } else {
            if (Context.data.relation_degree.code == "child" && ViewContext.data.composition_family_information == true) {
                ViewContext.data.child = true;
                ViewContext.data.husband_or_wife = false;
                ViewContext.data.other_doc = false;
            } else {
                ViewContext.data.other_doc = true
                ViewContext.data.child = false;
                ViewContext.data.husband_or_wife = false;
            }
        }
    }
}
