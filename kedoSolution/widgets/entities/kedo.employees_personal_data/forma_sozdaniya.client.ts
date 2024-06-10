/* Client scripts module */

async function onInit(): Promise<void> {
    await hide_all();
    let user = await System.users.getCurrentUser();
    Context.data.staff = await Context.fields.staff.app.search().where(f => f.ext_user.eq(user)).first();
    Context.data.change_registration_address = undefined;
    ViewContext.data.personal_data_agreement = false;
    if (Context.data.personal_data_type)
        await dynamic_change();
    if (ViewContext.data.__formType && ViewContext.data.__formType.code == ViewContext.fields.__formType.variants.edit.code) {
        ViewContext.data.read_only = true;
        ViewContext.data.view_result = true
    }
    Context.fields.personal_data_type.data.variants = Context.fields.personal_data_type.data.variants.filter(
        f => f.code !== 'data_invalid_child'
    );
}


async function dynamic_change(): Promise<void> {
    if (!Context.data.personal_data_type!) {
        await hide_all();
        return
    }
    await hide_all();
    ViewContext.data.personal_data_agreement = true;
    if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.passport_data.code) {
        ViewContext.data.passport_data_dynamic = true;
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.marriage_information.code) {
        ViewContext.data.marriage_information_dynamic = true;
        Context.data.passport_data_changed = false;
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.change_residence.code) {
        ViewContext.data.residence_dynamic = true;
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.change_address_registration.code) {
        ViewContext.data.change_registration_address_dynamic = true;
        await address_change();
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.change_phone_number.code) {
        ViewContext.data.phone_dynamic = true;
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.changt_snils.code) {
        ViewContext.data.snils_dynamic = true;
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.data_driver.code) {
        ViewContext.data.diver_license_dynamic = true;
        ViewContext.data.issue_driver_license_date_dynamic = true;
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.data_language.code) {
        ViewContext.data.foreign_language_dynamic = true;
        ViewContext.data.proficience_level_dynamic = true;
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.military_registration.code) {
        ViewContext.data.military_record_document_dynamic = true;
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.data_education.code) {
        ViewContext.data.education_level_dynamic = true;
        ViewContext.data.completion_certificate_dynamic = true;
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.composition_family_information.code) {
        ViewContext.data.family_information_dynamic = true;
        ViewContext.data.personal_data_agreement = false;
        await table_fill();
    }
    else if (Context.data.personal_data_type!.code == Context.fields.personal_data_type.variants.data_invalid_child.code) {
        ViewContext.data.data_invalid_child = true;
        ViewContext.data.personal_data_agreement = false;
        Context.fields.family_composition_app.data.setFilter((f, c, g) => g.and(f.__deletedAt.eq(null), f.staff.link(Context.data.staff!), f.relation_degree.eq(Context.fields.family_composition_app.app.fields.relation_degree.variants.child)))
    }

}

async function hide_all(): Promise<void> {
    ViewContext.data.actual_address_same_registration_address = false;
    ViewContext.data.change_registration_address_dynamic = false;
    ViewContext.data.child_info = false;
    ViewContext.data.child_personal_data_agreement = false;
    ViewContext.data.child_information_dynamic = false;
    ViewContext.data.completion_certificate_dynamic = false;
    ViewContext.data.diver_license_dynamic = false;
    ViewContext.data.education_level_dynamic = false;
    ViewContext.data.foreign_language_dynamic = false;
    ViewContext.data.issue_driver_license_date_dynamic = false;
    ViewContext.data.marriage_information_dynamic = false;
    ViewContext.data.military_record_document_dynamic = false;
    ViewContext.data.page_current_registration_dynamic = false;
    ViewContext.data.passport_data_dynamic = false;
    ViewContext.data.phone_dynamic = false;
    ViewContext.data.proficience_level_dynamic = false;
    ViewContext.data.registration_address_dynamic = false;
    ViewContext.data.relation_degree_dynamic = false;
    ViewContext.data.residence_dynamic = false;
    ViewContext.data.snils_dynamic = false;
    ViewContext.data.spouse_mobilization_dynamic = false;
    ViewContext.data.temporary_registration_dynamic = false;
    ViewContext.data.family_birth_certificate = false;
    ViewContext.data.marriage_certificate_family_dynamic = false;
    ViewContext.data.other_documents_dynamic = false;
    ViewContext.data.family_information_dynamic = false;
    ViewContext.data.data_invalid_child = false;
    Context.data.full_name = undefined;
    Context.data.series = undefined;
    Context.data.number = undefined;
    Context.data.issued_by = undefined;
    Context.data.date_of_issue = undefined;
    Context.data.department_code = undefined;
    Context.data.page_photos_and_data = undefined;
    Context.data.certificate = undefined;
    Context.data.address = undefined;
    Context.data.phone = undefined;
    Context.data.snils = undefined;
    Context.data.temporary_registration = undefined;
    Context.data.page_current_registration = undefined;
    Context.data.military_record_document = undefined;
    Context.data.diver_license = undefined;
    Context.data.foreign_language = undefined;
    Context.data.proficience_level = undefined;
    Context.data.education_level = undefined;
    Context.data.completion_certificate = undefined;
    Context.data.relation_degree = undefined;
    Context.data.full_name_family = undefined;
    Context.data.sex = undefined;
    Context.data.birth_date = undefined;
    Context.data.relative_phone = undefined;
    Context.data.snils_family = undefined;
    Context.data.marriage_certificate = undefined;
    Context.data.birth_certificate = undefined;
    Context.data.other_documents = undefined;
}
async function child_age_check(): Promise<void> {
    if (!Context.data.birth_date) {
        return
    }
    if (new Datetime(new Date()).sub(Context.data.birth_date!.asDatetime(new TTime(0, 0, 0, 0))).days > (365 * 14)) {
        ViewContext.data.child_info = true;
    }
    await child_agreement_check();
}

async function address_change(): Promise<void> {
    if (Context.data.change_registration_address == false)
        ViewContext.data.temporary_registration_dynamic = true;
    else
        ViewContext.data.temporary_registration_dynamic = false;
}

async function relation_degree_check(): Promise<void> {
    ViewContext.data.relation_degree_dynamic = false;
    ViewContext.data.family_birth_certificate = false;
    ViewContext.data.marriage_certificate_family_dynamic = false;
    ViewContext.data.other_documents_dynamic = false;
    if (Context.data.relation_degree) {
        if (Context.data.relation_degree!.code == Context.fields.relation_degree.variants.other_degree.code ||
            Context.data.relation_degree!.code == Context.fields.relation_degree.variants.husband_wife.code ||
            Context.data.relation_degree!.code == Context.fields.relation_degree.variants.mother.code ||
            Context.data.relation_degree!.code == Context.fields.relation_degree.variants.father.code ||
            Context.data.relation_degree!.code == Context.fields.relation_degree.variants.brother.code ||
            Context.data.relation_degree!.code == Context.fields.relation_degree.variants.sister.code) {
            if (Context.data.relative_phone && Context.data.snils_family) {
                ViewContext.data.relation_degree_dynamic = true;
            }
        }
        if (Context.data.relation_degree!.code == Context.fields.relation_degree.variants.husband_wife.code)
            ViewContext.data.marriage_certificate_family_dynamic = true;
        else if (Context.data.relation_degree!.code == Context.fields.relation_degree.variants.child.code)
            ViewContext.data.family_birth_certificate = true;
        else
            ViewContext.data.other_documents_dynamic = true;

    }
}

async function table_fill(): Promise<void> {
    let user = await System.users.getCurrentUser();
    let staff = await ViewContext.fields.staff.app.search().where(f => f.ext_user.eq(user)).first();
    if (!staff)
        return
    let family_members = await ViewContext.fields.family_composition.app.search().where((f, q) => q.and(f.staff.link(staff!), f.__deletedAt.eq(null))).size(10000).all();
    if (family_members && family_members.length > 0) {
        for (let member of family_members) {

            let row = ViewContext.data.current_family_info!.insert();
            row.family_conposition = member;
            row.birth_date = member.data.birth_date!;
            row.relation_degree = member.data.relation_degree!;
            row.status = member.data.__status!.name
        }
    }
    ViewContext.data.current_family_info = ViewContext.data.current_family_info;
}
async function passport_data_change(): Promise<void> {
    if (Context.data.passport_data_changed)
        ViewContext.data.passport_data_dynamic = true;
    else
        ViewContext.data.passport_data_dynamic = false;
}



async function child_agreement_check(): Promise<void> {
    ViewContext.data.relation_degree_dynamic = false;
    ViewContext.data.child_personal_data_agreement = true;
    Context.data.adult_child = false;
    if (!Context.data.birth_date) return;
    let age = new Datetime(new Date()).sub(Context.data.birth_date!.asDatetime(new TTime(0, 0, 0, 0)));
    if (age.days > (365 * 18)) {
        ViewContext.data.relation_degree_dynamic = true;
        ViewContext.data.child_personal_data_agreement = false;
        Context.data.adult_child = true;
    }
    else return
}

async function boolean_validation(): Promise<ValidationResult> {
    const result = new ValidationResult();
    if ((ViewContext.data.child_personal_data_agreement && !Context.data.child_personal_data_accept)
        || (ViewContext.data.personal_data_agreement && !Context.data.personal_data_accepting)) {
        result.addMessage('Должны быть проставлены все флажки на форме')
    }
    return result
}

async function snils_family_change(): Promise<void> {
    if (Context.data.snils_family && Context.data.relative_phone) {
        ViewContext.data.relation_degree_dynamic = true;
    } else {
        ViewContext.data.relation_degree_dynamic = false;
    }
}

async function relavite_phone_change(): Promise<void> {
    if (Context.data.snils_family && Context.data.relative_phone) {
        ViewContext.data.relation_degree_dynamic = true;
    } else {
        ViewContext.data.relation_degree_dynamic = false;
    }
}
