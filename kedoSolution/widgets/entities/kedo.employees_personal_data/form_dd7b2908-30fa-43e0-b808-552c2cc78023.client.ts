/* Client scripts module */

declare const document: any;

async function checkingTypePersonalData(): Promise<void> {
    if (Context.data.type_personal_data && Context.data.staff) {
        ViewContext.data.not_null_type_personal_data = true;
        const type_personal_data = await Context.data.type_personal_data.fetch();
        const staff = await Context.data.staff.fetch();

        if (type_personal_data.data.code == 'passport_data') {
            ViewContext.data.view_form_passport = true;
            Context.data.staff_passport_series = staff.data.passport_series;
            Context.data.staff_passport_number = staff.data.passport_number;
            Context.data.staff_passport_code = staff.data.passport_department_code;
            if (ViewContext.data.pass_file) {
                Context.data.staff_passport_file = ViewContext.data.pass_file;
            }
            Context.data.staff_passport_date = staff.data.date_of_issue;
            Context.data.staff_passport_issued_by = staff.data.issued_by;
            Context.data.staff_full_name = staff.data.full_name;
        } else {
            ViewContext.data.view_form_passport = false;
            Context.data.staff_passport_series = undefined;
            Context.data.staff_passport_number = undefined;
            Context.data.staff_passport_code = undefined;
            ViewContext.data.pass_file = Context.data.staff_passport_file;
            Context.data.staff_passport_file = undefined;
            Context.data.staff_passport_date = undefined;
            Context.data.staff_passport_issued_by = undefined;
            Context.data.staff_full_name = undefined;
        }

        if (type_personal_data.data.code == 'marriage_information') {
            ViewContext.data.view_form_marriage_information = true;
        } else {
            ViewContext.data.view_form_marriage_information = false;
            Context.data.marriage_certificate = undefined;
            Context.data.passport_data_changed = false;
        }

        if (type_personal_data.data.code == 'change_residence') {
            ViewContext.data.view_form_adress = true;
        } else {
            ViewContext.data.view_form_adress = false;
            Context.data.staff_address = undefined;
        }

        if (type_personal_data.data.code == 'change_phone_number') {
            ViewContext.data.view_form_phone = true;
        } else {
            ViewContext.data.view_form_phone = false;
            Context.data.staff_phone = undefined;
        }

        if (type_personal_data.data.code == 'changt_snils') {
            ViewContext.data.view_form_snils = true;
        } else {
            ViewContext.data.view_form_snils = false;
            Context.data.staff_snils = undefined;
        }

        if (type_personal_data.data.code == 'change_address_registration') {
            Context.data.change_registration_address = true;
            ViewContext.data.view_form_address_registration = true;
        } else {
            ViewContext.data.view_form_address_registration = false;
            ViewContext.data.view_label_temporary_registration = false;
            ViewContext.data.view_label_current_registration = false;
            Context.data.change_registration_address = undefined;
            Context.data.staff_passport_current_registration = undefined;
            Context.data.staff_temporary_registration = undefined;
        }

        if (type_personal_data.data.code == 'military_registration') {
            ViewContext.data.view_form_military_record_document = true;
        } else {
            ViewContext.data.view_form_military_record_document = false;
            Context.data.military_record_document = undefined;
        }

        if (type_personal_data.data.code == 'data_driver') {
            ViewContext.data.view_form_diver_license = true;
        } else {
            ViewContext.data.view_form_diver_license = false;
            Context.data.diver_license = undefined;
        }

        if (type_personal_data.data.code == 'data_language') {
            ViewContext.data.view_form_foreign_language = true;
        } else {
            ViewContext.data.view_form_foreign_language = false;
            Context.data.staff_foreign_language = undefined;
            Context.data.proficience_level = undefined;
        }

        if (type_personal_data.data.code == 'data_education') {
            ViewContext.data.view_form_education_information = true;
        } else {
            ViewContext.data.view_form_education_information = false;
            Context.data.education_level = undefined;
            Context.data.completion_certificate = undefined;
        }

        if (type_personal_data.data.code == 'composition_family_information') {
            table_fill();
            ViewContext.data.not_null_type_personal_data = false;
            ViewContext.data.view_form_composition_family_information = true;
        } else {
            ViewContext.data.view_form_composition_family_information = false;
            ViewContext.data.current_family_info = undefined;
            Context.data.relation_degree = undefined;
            Context.data.relative_full_name = undefined;
            Context.data.relative_sex = undefined;
            Context.data.relative_birth_date = undefined;
            Context.data.relative_phone = undefined;
            Context.data.relative_marriage_certificate = undefined;
            Context.data.relative_birth_certificate = undefined;
            Context.data.relative_other_documents = undefined;
            Context.data.relative_snils = undefined;
        }


    } else {
        ViewContext.data.not_null_type_personal_data = false;
    }
}

async function changeTypeAddress(): Promise<void> {
    if (Context.data.change_registration_address == true) {
        ViewContext.data.view_label_current_registration = true;
        ViewContext.data.view_label_temporary_registration = false;
    }
    if (Context.data.change_registration_address == false) {
        ViewContext.data.view_label_current_registration = false;
        ViewContext.data.view_label_temporary_registration = true;
    }
}

async function changeRelationDegree(): Promise<void> {
    if (Context.data.relation_degree) {
        if (Context.data.relation_degree.code == 'husband_wife') {
            ViewContext.data.relation_degree_is_husband_wife = true;
        } else {
            ViewContext.data.relation_degree_is_husband_wife = false;
        }

        if (Context.data.relation_degree.code == 'child') {
            ViewContext.data.relation_degree_is_child = true;
        } else {
            ViewContext.data.relation_degree_is_child = false;
        }

        if (Context.data.relation_degree.code != 'child' && Context.data.relation_degree.code != 'husband_wife') {
            ViewContext.data.relation_degree_is_other = true;
        } else {
            ViewContext.data.relation_degree_is_other = false;
        }

        if (Context.data.relation_degree.code == "mother") {
            Context.data.relative_sex = Context.fields.relative_sex.variants.female;
        }

        if (Context.data.relation_degree.code == "father") {
            Context.data.relative_sex = Context.fields.relative_sex.variants.male;
        }

        if (Context.data.relation_degree.code == "sister") {
            Context.data.relative_sex = Context.fields.relative_sex.variants.female;
        }

        if (Context.data.relation_degree.code == "brother") {
            Context.data.relative_sex = Context.fields.relative_sex.variants.male;
        }
    }

    await checkSex();
}

async function changePassport(): Promise<void> {
    if (Context.data.type_personal_data) {
        const type_personal_data = await Context.data.type_personal_data.fetch();

        if (Context.data.passport_data_changed == true) {
            ViewContext.data.view_form_passport = true;
        }
        if (type_personal_data.data.code != 'passport_data' && Context.data.passport_data_changed == false) {
            ViewContext.data.view_form_passport = false;
        }
    }
}

async function table_fill(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error('staff is undefined');
    }
    let family_members = await ViewContext.fields.family_composition.app.search().where((f, q) => q.and(
        f.staff.link(Context.data.staff!),
        f.__deletedAt.eq(null)
    )).size(10000).all();
    if (family_members && family_members.length > 0) {
        for (let member of family_members) {
            let row = ViewContext.data.current_family_info_table!.insert();
            row.family_conposition = member;
            row.birth_date = member.data.birth_date!;
            row.relation_degree = member.data.relation_degree!;
            row.status = member.data.__status!.name
        }
    }
    ViewContext.data.current_family_info_table = ViewContext.data.current_family_info_table;
}

// async function validation(): Promise<ValidationResult> {
//     const result = new ValidationResult();
//     if (Context.data.type_personal_data) {
//         const type_personal_data = await Context.data.type_personal_data.fetch();
//         if ((type_personal_data.data.code == 'composition_family_information' && !Context.data.relative_personal_data_accepting)
//             || (type_personal_data.data.code != 'composition_family_information' && !Context.data.staff_personal_data_accepting)) {
//             result.addMessage('Должны быть проставлены все флажки на форме');
//         }
//     }
//     return result;
// }

async function changeAccepting(): Promise<void> {
    if (Context.data.relative_personal_data_accepting == false) {
        Context.data.relative_personal_data_accepting = undefined;
    }
    if (Context.data.staff_personal_data_accepting == false) {
        Context.data.staff_personal_data_accepting = undefined;
    }
}

async function changePassDepCode(): Promise<void> {
    if (Context.data.staff_passport_code) {
        let split_str = Context.data.staff_passport_code.match(/(\d{1,3})/g);
        if (split_str && split_str[0].length == 3 && (split_str[1])) {
            Context.data.staff_passport_code = split_str[0] + '-' + split_str[1];
        }
    }
}

async function checkNumber(): Promise<void> {
    if (Context.data.staff_passport_number) {
        let split_str = Context.data.staff_passport_number.match(/(\d{1,6})/g);
        if (split_str && split_str[0].length == 6 && (split_str[1])) {
            Context.data.staff_passport_number = split_str[0];
        }
    }
}

async function checkSeries(): Promise<void> {
    if (Context.data.staff_passport_series) {
        let split_str = Context.data.staff_passport_series.match(/(\d{1,4})/g);
        if (split_str && split_str[0].length == 4 && (split_str[1])) {
            Context.data.staff_passport_series = split_str[0];
        }
    }
}

async function checkSnils(): Promise<void> {
    if (Context.data.staff_snils) {
        let split_str = Context.data.staff_snils.match(/(\d{1,3})/g);
        if (split_str && split_str[0].length == 3 && (split_str[1])) {
            Context.data.staff_snils = split_str[0] + '-' + split_str[1];
        }
        if (split_str && split_str[1].length == 3 && (split_str[2])) {
            Context.data.staff_snils += '-' + split_str[2];
        }

        if (split_str && split_str[2].length == 3 && (split_str[3])) {
            Context.data.staff_snils += ' ' + split_str![3];
        }
    }
}

async function checkRelativeSnils(): Promise<void> {
    if (Context.data.relative_snils) {
        let split_str = Context.data.relative_snils.match(/(\d{1,3})/g);
        if (split_str && split_str[0].length == 3 && (split_str[1])) {
            Context.data.relative_snils = split_str[0] + '-' + split_str[1];
        }
        if (split_str && split_str[1].length == 3 && (split_str[2])) {
            Context.data.relative_snils += '-' + split_str[2];
        }

        if (split_str && split_str[2].length == 3 && (split_str[3])) {
            Context.data.relative_snils += ' ' + split_str![3];
        }
    }
}

async function changeChildDate(): Promise<void> {
    if (Context.data.relative_birth_date) {
        const current_date = new TDate();
        if (Context.data.relative_birth_date.after(current_date)) {
            ViewContext.data.error_child_date = "Дата рождения не может быть позднее текущей даты."
            ViewContext.data.view_error_child_date = true;
        } else {
            ViewContext.data.error_child_date = "";
            ViewContext.data.view_error_child_date = false;
        }
    }

    checkLabels();
}

function checkLabels() {
    const button_save = document.querySelectorAll('.btn-primary');
    for (let button of button_save) {
        if (button.innerText.includes('Сформировать заявку')) {
            if (ViewContext.data.view_error_child_date === true || ViewContext.data.view_sex_error === true) {
                button.disabled = true;
            } else {
                button.disabled = false;
            }
        }
    }
}

async function checkSex(): Promise<void> {
    if (Context.data.relation_degree && Context.data.relative_sex) {
        if ((Context.data.relation_degree.code == "mother" || Context.data.relation_degree.code == "sister") && Context.data.relative_sex.code == "male") {
            ViewContext.data.view_sex_error = true;
            ViewContext.data.sex_error = 'Указан неккоректный пол родственника.';

            checkLabels();
            return;
        } else {
            ViewContext.data.view_sex_error = false;
            ViewContext.data.sex_error = '';
        }

        if ((Context.data.relation_degree.code == "father" || Context.data.relation_degree.code == "brother") && Context.data.relative_sex.code == "female") {
            ViewContext.data.view_sex_error = true;
            ViewContext.data.sex_error = 'Указан неккоректный пол родственника.';

            checkLabels();
            return;
        } else {
            ViewContext.data.view_sex_error = false;
            ViewContext.data.sex_error = '';
        }
    }

    checkLabels();
}

