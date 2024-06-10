/* Client scripts module */

let user: CurrentUserItem;
let staff: TApplication<Application$kedo$staff$Data, any, Application$kedo$staff$Processes> | undefined = undefined;

async function onInit(): Promise<void> {
    if (ViewContext.data.__formType && ViewContext.data.__formType.code == ViewContext.fields.__formType.variants.edit.code)
        ViewContext.data.correction = true
    user = await System.users.getCurrentUser();
    staff = await Context.fields.staff.app.search().where(f => f.ext_user.eq(user)).first();
    if (staff)
        Context.data.staff = staff;
    Context.fields.staff_category.data.setFilter(f => f.assigning_category_employee_application.eq(true));
    await hide_all();
    if (Context.data.staff_category)
        await fields_hide();
}

async function fields_hide(): Promise<void> {
    await hide_all();
    await reset_value();
    let other_documents = false;
    Context.fields.information_about_child.data.clearFilter();
    Context.fields.spouse.data.clearFilter();
    let category = await Context.data.staff_category!.fetch();
    if (category.data.__name == 'Родитель ребенка до четырнадцати лет, если второй родитель призван на военную службу по мобилизации' ||
        category.data.__name == 'Родитель, воспитывающий без супруга (супруги) детей в возрасте до четырнадцати лет' ||
        category.data.__name == 'Родитель в случае, если другой родитель работает вахтовым методом' ||
        category.data.__name == 'Работник воспитывает ребенка-инвалида') {
        Context.fields.information_about_child.data.setFilter((f, g, t) => t.and(
            f.staff.link(staff!),
            f.__status.eq(Context.fields.information_about_child.app.fields.__status.variants.valid),
            f.relation_degree.eq(Context.fields.information_about_child.app.fields.relation_degree.variants.child.code))
        );
        ViewContext.data.child_info_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Родитель ребенка до четырнадцати лет, если второй родитель призван на военную службу по мобилизации') ||
        category.data.__name == ('Родитель, воспитывающий без супруга (супруги) детей в возрасте до четырнадцати лет') ||
        category.data.__name == ('Родитель в случае, если другой родитель работает вахтовым методом') ||
        category.data.__name == ('Супруга военнослужащего') ||
        category.data.__name == ('Военнослужащий, проходящие военную службу в зоне отчуждения') ||
        category.data.__name == ('Сотрудник постоянно проживал (работал) в зоне отселения до переселения с 02.12.1995г.') ||
        category.data.__name == ('Сотрудник постоянно проживал (работал) в зоне отселения до переселения с 26.04.1986г.')) {
        other_documents = true;
        ViewContext.data.confirmation_document_dynamic = true;
    }
    if (category.data.__name == ('Родитель ребенка до четырнадцати лет, если второй родитель призван на военную службу по мобилизации') ||
        category.data.__name == ('Работник в период нахождения его жены в отпуске по беременности и родам')) {
        ViewContext.data.marriage_certificate_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Родитель ребенка до четырнадцати лет, если второй родитель призван на военную службу по мобилизации')) {
        ViewContext.data.start_date_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Беременная женщина') ||
        category.data.__name == ('Сотрудник имеет ограничения по здоровью для работы в ночное время и сверхурочно') ||
        category.data.__name == ('Работник в период нахождения его жены в отпуске по беременности и родам')) {
        ViewContext.data.medical_confirmation_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Работник воспитывает ребенка-инвалида') ||
        category.data.__name == ('Инвалид I или II группы')) {
        ViewContext.data.medical_disability_confirmation_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Работник, ухаживающий за больным членом семьи')) {
        ViewContext.data.sick_family_member_certificate_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Работник воспитывает ребенка-инвалида')) {
        ViewContext.data.residence_child_confirmation_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Почетный донор')) {
        ViewContext.data.honorary_donor_confirmation_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Работник/ветеран удостоенный высшего звания или награжденный государственными орденами высшей степени')) {
        ViewContext.data.award_document_confirming_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Участник ликвидации последствий аварии в пределах зоны отчуждения на период 1986–1987 гг.')) {
        ViewContext.data.member_confirmation_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Сотрудник, который совмещает работу и получение образования')) {
        ViewContext.data.accreditation_certificate_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Сотрудник, который совмещает работу и получение образования')) {
        ViewContext.data.education_confirming_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Работник, пострадавшие в результате радиационных аварий или катастроф')) {
        ViewContext.data.radiation_victim_certificate_dynamic = true;
        other_documents = true;
    }
    if (category.data.__name == ('Родитель ребенка до четырнадцати лет, если второй родитель призван на военную службу по мобилизации') ||
        category.data.__name == ('Работник в период нахождения его жены в отпуске по беременности и родам') ||
        category.data.__name == ('Супруга военнослужащего')) {
        ViewContext.data.spounse_dynamic = true;
        other_documents = true;
        Context.fields.spouse.data.setFilter((f, g, t) => t.and
            (
                f.staff.link(staff!),
                f.__status.eq(Context.fields.spouse.app.fields.__status.variants.valid),
                f.relation_degree.eq(Context.fields.spouse.app.fields.relation_degree.variants.husband_wife.code)
            )
        )
    }
    if (category.data.__name == ('Работник в период нахождения его жены в отпуске по беременности и родам') ||
        category.data.__name == ('Родитель ребенка до четырнадцати лет, если второй родитель призван на военную службу по мобилизации') ||
        category.data.__name == ('Работник в период нахождения его жены в отпуске по беременности и родам') ||
        category.data.__name == ('Супруга военнослужащего')) {
        ViewContext.data.personal_data_relative_dynamic = true;
        other_documents = true;
        await Server.rpc.set_file();
    }
    if (!other_documents) {
        ViewContext.data.category_confirm_documents_dynamic = true;
    }

}

async function marriage_certificate_set(): Promise<void> {
    Context.data.marriage_certificate = (await Context.data.spouse!.fetch()).data.marriage_certificate
}

async function hide_all(): Promise<void> {
    ViewContext.data.accreditation_certificate_dynamic = false;
    ViewContext.data.award_document_confirming_dynamic = false;
    ViewContext.data.category_confirm_documents_dynamic = false;
    ViewContext.data.child_info_dynamic = false;
    ViewContext.data.confirmation_document_dynamic = false;
    ViewContext.data.education_confirming_dynamic = false;
    ViewContext.data.honorary_donor_confirmation_dynamic = false;
    ViewContext.data.marriage_certificate_dynamic = false;
    ViewContext.data.medical_confirmation_dynamic = false;
    ViewContext.data.medical_disability_confirmation_dynamic = false;
    ViewContext.data.member_confirmation_dynamic = false;
    ViewContext.data.radiation_victim_certificate_dynamic = false;
    ViewContext.data.residence_child_confirmation_dynamic = false;
    ViewContext.data.sick_family_member_certificate_dynamic = false;
    ViewContext.data.start_date_dynamic = false;
    ViewContext.data.spounse_dynamic = false;
    ViewContext.data.personal_data_relative_dynamic = false;
}

async function reset_value(): Promise<void> {
    Context.data.marriage_certificate = Context.data.marriage_certificate_family = Context.data.medical_confirmation = Context.data.medical_disability_confirmation = Context.data.sick_family_member_certificate = Context.data.residence_child_confirmation =
    Context.data.honorary_donor_confirmation = Context.data.award_document_confirming = Context.data.medical_confirmation = Context.data.accreditation_certificate = Context.data.education_confirming = Context.data.radiation_victim_certificate =
    Context.data.category_confirm_documents = Context.data.personal_data_relative = Context.data.personal_data_relative_scan = undefined;
  
}