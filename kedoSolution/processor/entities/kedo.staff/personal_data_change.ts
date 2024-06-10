/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function changeAdress(): Promise<void> {
    let app = await Context.data.staff_personal_data!.fetch();
    if (app.data.personal_data_type!.code != app.fields.personal_data_type.variants.change_address_registration.code) {
        app.data.change_registration_address = undefined;
        await app.save();
    }
}

async function refusal_text_generate(): Promise<void> {
    let staff = await Context.data.staff!.fetch();
    let app = await Context.data.staff_personal_data!.fetch();
    app.data.reject_comment = Context.data.refusal_comment;
    await app.save();
    Context.data.alert_body = `Уважаемый ${staff.data.full_name!.lastname} ${staff.data.full_name!.firstname} Вашу заявку необходимо скорректировать по следующей причине: ${Context.data.refusal_comment}`
}

async function category_check(): Promise<void> {
    Context.data.need_alert = false;
    let staff: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params> | undefined = undefined
    if (!Context.data.staff)
        return
    staff = await Context.data.staff.fetch();
    let personal_data = await Context.data.staff_personal_data!.fetch();

    if (personal_data.data.relation_degree) {

        let family_info = Context.fields.family_info.app.create();
        let family = await Context.fields.family_info.app.search().where((f, g) => g.and(
            f.staff.link(Context.data.staff!),
            f.__deletedAt.eq(null)
        )).size(100).all();

        if (family) {
            const find_fam = family.find(map => map.data.full_name == personal_data.data.full_name_family || map.data.full_name == personal_data.data.child_full_name);
            if (find_fam) {
                family_info = find_fam;
            }
        }

        family_info.data.birth_certificate = personal_data.data.family_birth_certificate;
        family_info.data.birth_date = personal_data.data.birth_date;
        family_info.data.relation_degree = personal_data.data.relation_degree;
        family_info.data.staff = staff;
        family_info.data.sex = personal_data.data.sex;
        family_info.data.full_name = personal_data.data.full_name_family;
        family_info.data.marriage_certificate = personal_data.data.marriage_certificate_family;
        family_info.data.other_documents = personal_data.data.other_documents_family;
        family_info.data.phone = personal_data.data.relative_phone;
        family_info.data.user = staff.data.ext_user;
        await family_info.save();
        await family_info.setStatus(family_info.fields.__status.variants.valid);
        if (personal_data.data.relation_degree && personal_data.data.relation_degree.code == personal_data.fields.relation_degree.variants.child.code) {
            if (new Datetime(new Date()).sub(personal_data.data.birth_date!.asDatetime(new TTime(0, 0, 0, 0))).days < (365 * 3) && staff.data.sex == false) {
                let staff = await Context.data.staff!.fetch();
                let category = await Context.fields.staff_categories.app.search().where(f => f.__name.like('Женщина, имеющая детей в возрасте до трех лет')).first();
                if (category) {
                    Context.data.need_alert = true;
                    Context.data.alert_body = 'Вам присвоена категория "Женщина, имеющая детей в возрасте до трех лет"';
                    staff.data.staff_categories!.push(category);
                    let row = staff.data.categories_table!.insert();
                    row.expiration_date = personal_data.data.birth_date!.addDate(3, 0, 0);
                    row.staff_categories = category;
                    await staff.save();
                }
                let category1 = await Context.fields.staff_personal_data.app.search().where((f, q) => q.and
                    (f.staff.link(staff),
                        f.relation_degree.eq(personal_data.fields.relation_degree.variants.child.code),
                        f.__status.eq(personal_data.fields.__status.variants.agreed))).size(10000).all();
                let expiration_date = new TDate();

                if (category1 && category1.length > 0) {
                    if (category1.length > 2) {
                        let category2 = await Context.fields.staff_categories.app.search().where(f => f.__name.like('Многодетный родитель')).first();
                        let childs = await Context.fields.family_info.app.search().where((f, q) => q.and(f.staff.link(staff),
                            f.relation_degree.eq(Context.fields.family_info.app.fields.relation_degree.variants.child.code),
                            f.__status.eq(Context.fields.family_info.app.fields.__status.variants.valid))).size(10000).all();
                        let durations: number[] = [];
                        let current_date = new Datetime(new Date());
                        let young_childs = await Promise.all(childs.map(async f => {
                            let age = new Datetime(new Date()).sub(f.data.birth_date!.asDatetime(new TTime(0, 0, 0, 0))).days;
                            if (age < (365 * 18)) {
                                return f;
                            }
                        }));
                        if (!young_childs)
                            return
                        for (let child of young_childs) {
                            let age = new Datetime(new Date()).sub(child!.data.birth_date!.asDatetime(new TTime(0, 0, 0, 0))).days;
                            if (age < (18 * 365) && age > (14 * 365))
                                durations.push((365 * 18) - age);
                            else if (age < 14)
                                durations.push(365 * 14) - age
                        }
                        if (category2) {
                            var min = Math.min.apply(null, durations);
                            Context.data.need_alert = true;
                            Context.data.alert_body = 'Вам присвоена категория "Многодетный родитель';
                            staff.data.staff_categories!.push(category2);
                            let row = staff.data.categories_table!.insert();
                            row.expiration_date = new Datetime(new Date()).add(new Duration(min, "days")).getDate();
                            row.staff_categories = category2;
                            await staff.save();
                        }
                    }
                }
            }
        }
    }
    if (!Context.data.need_alert) {
        Context.data.need_alert = true;
        Context.data.alert_body = 'Ваши личные данные успешно изменены.'
    }

    if (personal_data.data.personal_data_type!.code == personal_data.fields.personal_data_type.variants.data_invalid_child.code) {
        if (personal_data.data.location_disabled_child) {
            let app = Context.fields.personal_documents.app.create();
            app.data.staff = staff;
            app.data.type_personal_documents = await Context.fields.personal_documents.app.fields.type_personal_documents.app.search().where((f, g) => g.and(f.__deletedAt.eq(null),
                f.__name.eq('Документ о месте жительства ребёнка-инвалида'))).first();
            app.data.__file = personal_data.data.location_disabled_child;
            if (personal_data.data.family_composition_app) {
                app.data.family_composition = personal_data.data.family_composition_app;
            }
            await app.save();
        }
        if (personal_data.data.certificate_disability) {
            let app = Context.fields.personal_documents.app.create();
            app.data.staff = staff;
            app.data.type_personal_documents = await Context.fields.personal_documents.app.fields.type_personal_documents.app.search().where((f, g) => g.and(f.__deletedAt.eq(null),
                f.__name.eq('Справка об установлении инвалидности'))).first();
            app.data.__file = personal_data.data.certificate_disability
            app.data.expiration_date = personal_data.data.validity_period_isability_certificate;
            if (personal_data.data.family_composition_app) {
                app.data.family_composition = personal_data.data.family_composition_app;
            }
            await app.save();
        }
    }
}

async function fileds_check(): Promise<void> {
    let data = await Context.data.staff_personal_data!.fetch();
    let staff = await Context.data.staff!.fetch();

    if (data.data.snils)
        staff.data.snils = data.data.snils;
    if (data.data.specialization)
        staff.data.specialization = data.data.specialization;
    if (data.data.profession)
        staff.data.profession = data.data.profession
    if (data.data.expiration_date)
        staff.data.expiration_date = data.data.expiration_date;
    if (data.data.institution_name)
        staff.data.institution_name = data.data.institution_name;
    if (data.data.completion_certificate && data.data.completion_certificate.length > 0)
        staff.data.certificate_of_completion = data.data.completion_certificate;
    if (data.data.education_level)
        staff.data.education_level = data.data.education_level;
    if (data.data.Consists_military_registration_special)
        staff.data.consists_military_registration_special = data.data.Consists_military_registration_special;
    if (data.data.consists_military_registration_general)
        staff.data.consists_military_registration_general = data.data.consists_military_registration_general;
    if (data.data.military_record_document_text)
        staff.data.military_record_document_text = data.data.military_record_document_text;
    if (data.data.name_military_commissariat)
        staff.data.name_military_registration = data.data.name_military_commissariat;
    if (data.data.military_service_category)
        staff.data.category_for_military_service = data.data.military_service_category;
    if (data.data.full_code_designation)
        staff.data.code_designation = data.data.full_code_designation;
    if (data.data.composition)
        staff.data.composition = data.data.composition;
    if (data.data.military_rank)
        staff.data.military_rank = data.data.military_rank;
    if (data.data.stock_category)
        staff.data.stock_category = data.data.stock_category;
    if (data.data.military_record_document)
        staff.data.military_record_document = staff.data.military_record_document!.concat(data.data.military_record_document);
    if (data.data.proficience_level)
        staff.data.proficiency_level = data.data.proficience_level;
    if (data.data.foreign_language)
        staff.data.foreign_language = data.data.foreign_language;
    if (data.data.issue_driver_license_date)
        staff.data.driver_license_issue_date = data.data.issue_driver_license_date;
    if (data.data.category)
        staff.data.category = data.data.category;
    if (data.data.id_number)
        staff.data.id_number = data.data.id_number;
    if (data.data.id_series)
        staff.data.id_series = data.data.id_series;
    if (data.data.diver_license)
        staff.data.driver_license = data.data.diver_license;
    if (data.data.registration_address)
        staff.data.address = data.data.registration_address;
    if (data.data.temporary_registration)
        staff.data.temporary_registration = data.data.temporary_registration;
    if (data.data.page_current_registration)
        staff.data.the_passport_page_with_current_registration = data.data.page_current_registration;
    if (data.data.address)
        staff.data.actual_address = data.data.address;
    if (data.data.page_photos_and_data)
        staff.data.passport_page_with_photo_and_data = data.data.page_photos_and_data;
    if (data.data.department_code)
        staff.data.passport_department_code = data.data.department_code;
    if (data.data.issued_by)
        staff.data.issued_by = data.data.issued_by;
    if (data.data.date_of_issue)
        staff.data.date_of_issue = data.data.date_of_issue;
    if (data.data.number)
        staff.data.passport_number = data.data.number;
    if (data.data.series)
        staff.data.passport_series = data.data.series;
    if (data.data.full_name) {
        staff.data.full_name = data.data.full_name;
        await staff.save();
        let ext_user = await staff.data.ext_user!.fetch();
        ext_user.data.fullname = staff.data.full_name;
        await ext_user.save();
        return;
    }
    if (data.data.phone) {
        staff.data.phone = data.data.phone;
        await staff.save();
        let ext_user = await staff.data.ext_user!.fetch();
        ext_user.data.fullname = staff.data.full_name;
        await ext_user.save();
        return;
    }
    await staff.save();
}

async function child_consent_status_check(): Promise<boolean> {
    let app = await Context.data.child_personal_data_consent!.fetch();
    if (app.data.__status!.code == app.fields.__status.variants.signed.code)
        return true;
    return false;
}

async function passport_data_application_status_check(): Promise<boolean> {
    let app = await Context.data.passport_data_application!.fetch();
    if (app.data.__status!.code == app.fields.__status.variants.signed.code)
        return true;
    return false;
}

async function set_permissions(): Promise<void> {
    if (!Context.data.head_user) {
        let staff = await Context.data.staff!.fetch();
        await staff.sendMessage('Отсутствует руководитель', 'Не удалось определить руководителя сотрудника');
        return;
    }
    let app = await Context.data.staff_personal_data!.fetch();
    const props = Object.getOwnPropertyNames(app.fields)
    await Promise.all(props.map(async prop => {
        if ((app.fields[prop] as any).type && (app.fields[prop] as any).type == "FILE") {
            if (app.data[prop]) {
                if (app.data[prop].length != undefined) {
                    for (let file of (app.data[prop] as FileItemRef[])) {
                        let old_perms = await file.getPermissions();
                        old_perms.values.push(new PermissionValue(Context.data.head_user!, [PermissionType.READ]))
                        await file.setPermissions(old_perms)
                    }
                }
                else {
                    let old_perms = await app.data[prop].getPermissions();
                    old_perms.values.push(new PermissionValue(Context.data.head_user!, [PermissionType.READ]))
                    await (app.data[prop] as FileItem).setPermissions(old_perms)
                }
            }
        }
    }))
}


async function documents_status_check(): Promise<boolean> {
    let app1 = await Context.data.additional_agreement_to_the_contract!.fetch();
    let app2 = await Context.data.passport_data_change_order!.fetch();
    if (app1.data.__status1.code == app1.fields.__status.variants.signed.code || app2.data.__status1.code == app2.fields.__status.variants.signed.code) return true;
    return false;
}

async function fields_set(): Promise<void> {
    const app = await Context.data.staff_personal_data!.fetch();
    Context.data.refusal_comment = app.data.reject_comment;

    //передаю тип заявления для формы корректировки
    Context.data.type_personal_data = app.data.personal_data_type;
    let codes = Object.getOwnPropertyNames(app.fields);
    codes = codes.filter(f => !f.includes('__'));
    for (let code of codes) {
        if (typeof Context.data[code] == typeof app.data[code])
            Context.data[code] = app.data[code]
    }
}

async function app_fields_set(): Promise<void> {
    let app = await Context.data.staff_personal_data!.fetch();
    app.data.reject_comment = Context.data.refusal_comment;
    let codes = Object.getOwnPropertyNames(app.fields);
    codes = codes.filter(f => !f.includes('__'));
    for (let code of codes) {
        if (typeof Context.data[code] == typeof app.data[code])
            app.data[code] = Context.data[code];
    }
    await app.save();
}

async function get_kedo_settings(): Promise<void> {
    const integration_1c = await Namespace.app.settings.search().where(f => f.code.eq('integration_1c')).first();
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;

    const alternative_integration = await Namespace.app.settings.search().where(f => f.code.eq('use_alternative_integration')).first();
    Context.data.alternative_integration = alternative_integration ? alternative_integration.data.status : false;

    const use_alternative_system = await Namespace.app.settings.search().where(f => f.code.eq('use_alternative_system')).first();
    Context.data.use_alternative_system = use_alternative_system ? use_alternative_system.data.status : false;
}

async function get_responsible_hr_dep(): Promise<void> {
    let current_user = await System.users.getCurrentUser();
    if (current_user) {
        Context.data.responsible_hr_dep = await Context.fields.staff.app.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.ext_user.eq(current_user))).first();
    }
    if (Context.data.staff) {
        let staff = await Context.data.staff.fetch();
        if (staff.data.organization) {
            let org = await staff.data.organization.fetch();
            if (org.data.accounting && org.data.accounting.length > 0) {
                Context.data.responsible_accounting = org.data.accounting[0];
            }
        }
    }
    //Context.data.file_hands = false // файл приложен не руками
    //Context.data.flag_ds_file_hands = false
}

async function initializationVariable(): Promise<void> {
    Context.data.agreed_additionally = true;
}

async function verificationApproval(): Promise<boolean> {
    if (Context.data.agreed_additionally == true || Context.data.is_agreement == true) {
        return true;
    } else {
        return false;
    }
}

async function createStatusObj(app: any, status: string): Promise<void> {
    const obj_status = {
        'app': {
            'namespace': app.namespace,
            'code': app.code,
            'id': app.id,
        },
        'status': status,
    }
    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function checkTypeStaffPersonalData(): Promise<void> {
    Context.data["__item"] = Context.data.staff_personal_data;
    if (!Context.data.staff_personal_data) {
        throw new Error("staff_personal_data if required");
    }

    if (!Context.data.staff) {
        throw new Error("staff is required");
    }
    const user_staff = await Context.data.staff.fetch();

    if (!user_staff.data.ext_user) {
        throw new Error("staff_user is required");
    }
    Context.data.user_staff = user_staff.data.ext_user;

    if (Context.data.type_employment_string == 'Внешнее совместительство') {
        Context.data.isExternalApp = true;
    }

    const personal_data = await Context.data.staff_personal_data.fetch();

    const types_personal_data = await Context.fields.type_employees_personal_data.app.search().where(f => f.__deletedAt.eq(null)).size(100).all();
    if (types_personal_data && personal_data.data.personal_data_type) {
        const current_type_personal_data = types_personal_data.find(map => map.data.code == personal_data.data.personal_data_type!.code);
        if (current_type_personal_data) {
            Context.data.is_application_personal_data = current_type_personal_data.data.application_personal_data;
            Context.data.is_order_personal_data = current_type_personal_data.data.order_personal_data;
            Context.data.is_additional_agreement_personal_data = current_type_personal_data.data.additional_agreement_personal_data;
            Context.data.is_child_personal_data = current_type_personal_data.data.child_personal_data;
        }
    }
}

async function checkChoice(): Promise<boolean> {
    if (Context.data.is_order_personal_data == false && Context.data.is_additional_agreement_personal_data == false) {
        //Context.data.text_error = 'Данный вид изменения персональных данных не предусматривает использование приказов и дополнительных соглашений (Подробнее в справочнике "Виды персональных данных")';
        Context.data.is_not_order_and_ds = true;
        return false;
    }
    return true;
}

async function processingTable(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();
        if (staff.data.employment_table) {
            Context.data.count_type_employment = staff.data.employment_table.length;
        }
    }

    Context.data.is_files = true;
}

async function processingTableForTaskHR(): Promise<void> {
    Context.data.info_additional_table = undefined;
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();
        if (staff.data.employment_table) {
            Context.data.count_type_employment = staff.data.employment_table.length;
        }
    }
}
async function getFile(): Promise<void> {

}
