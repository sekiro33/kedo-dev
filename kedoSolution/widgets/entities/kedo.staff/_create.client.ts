declare const document: any;
declare const window: any;
declare const console: any;

async function onInit(): Promise<void> {
    if (Context.data.snils) {
        ViewContext.data.supportive_snils = Context.data.snils;
        Context.data.snils = Context.data.snils;
    }
    if (Context.data.inn) {
        ViewContext.data.supportive_inn = Context.data.inn;
        Context.data.inn = Context.data.inn;
    }
    if (Context.data.passport_department_code) {
        ViewContext.data.supportive_pass_code = Context.data.passport_department_code;
        Context.data.passport_department_code = Context.data.passport_department_code;
    }

    const for_edit_form = await Application.search()
        .where(f =>
            f.__id.eq(Context.data.__id)
        )
        .first();
    if (for_edit_form) {
        Context.data.is_required = false;
    } else {
        Context.data.is_required = true;
    }

    let findNullCompact = window.setInterval(() => {
        let nullCompact = document.querySelectorAll(".null-compact elma-form-row");
        if (!nullCompact || Array.from(nullCompact).length < 2) {
            console.log("loading")
            return;
        };
        window.clearInterval(findNullCompact);
        console.log(nullCompact)
        nullCompact.forEach((item: any) => item.classList.remove("@compact"));
    }, 100);
    let user = await System.users.getCurrentUser();
    let now = new TDate();
    if (!Context.data.hr_user_set) {
        Context.data.staff_member = user;
        Context.data.hr_user_set = true;
        console.log("setting hr")
    } else {
        console.log("hr user set")
    }

    const docs = await Namespace.app.types_documents_for_employment.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const names = ['Паспорт. Страница с регистрацией', 'Паспорт. Страница с фото и данными', 'СНИЛС', 'ИНН'];

    //const myDocs = docs.filter(f => names.find(i => i == f.data.__name));
    const myDocs = docs.filter(f => {
        if (f.data.default) {
            return f;
        }
    })
    if (!Context.data.docs_table_full) {
        for (const doc of myDocs) {
            const row = Context.data.documents_for_employment!.insert();
            row.doc = doc
            row.required = doc.data.required!;
        }
        Context.data.docs_table_full = true;
        console.log(Context.data.documents_for_employment)
    }

    Context.fields.structural_subdivision.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
        appFields.is_closed.eq(false)
    ));
    Context.fields.position.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
        appFields.is_closed.eq(false)
    ));

    Context.fields.date_of_birth.data.setFilter(f => f.lt(now));
    Context.fields.date_of_issue.data.setFilter(f => f.lt(now));
    Context.data.documents_for_employment = Context.data.documents_for_employment;

    if (!Context.data.ext_user)
        ViewContext.data.viewreplay = true
    else
        ViewContext.data.viewreplay = false

    if (ViewContext.data.__formType && ViewContext.data.__formType.code == ViewContext.fields.__formType.variants.edit.code) {
        ViewContext.data.edit = false;
        ViewContext.data.view_pdn = true;
        ViewContext.data.view_skans = false;
        ViewContext.data.view_docs = false;
    } else {
        ViewContext.data.edit = true;
        await setPDN();
        await setDOCS()
    }

    console.log(user.data.groupIds);
    console.log(ViewContext.data.__formType);

    if (user.data.groupIds && user.data.groupIds.find(f => f.id == 'd6000da0-c9aa-55eb-9882-f118b432730b')
        && ViewContext.data.__formType && ViewContext.data.__formType.code == ViewContext.fields.__formType.variants.edit.code) {
        ViewContext.data.view_service = true;
    } else {
        ViewContext.data.view_service = false;
    }
    await viewUser();

    ViewContext.data.details_status = [];
    ViewContext.data.employment_table_errors = [];

    await change_notification_type();

    /** 
     * Генерация ID для занесения данных в кэш. 
     * Предотвращает коллизии при одновременном изменении строк в карточке сотрудника. 
    */
    ViewContext.data.cache_guid = uuidv4();

    if (Context.data.personal_data_employee == true) {
        ViewContext.data.view_pdn = false;
    }

    if (Context.data.organization) {
        const organization = await Context.data.organization.fetch();
        ViewContext.data.leave_choice_to_staff = organization.data.leave_choice_to_staff;
    };
}

async function checkPassport(): Promise<void> {
    const table = Context.data.documents_for_employment;
    if (!table || table.length < 1) {
        return;
    };
    const lines = await Promise.all(table!.map(async (line) => await line.doc.fetch()));
    if (!lines.find(line => line.data.__name.includes("Паспорт"))) {
        return;
    };
    let files = await Promise.all(table.map(async (line) => {
        if (!line.file_doc) {
            return;
        };
        return await line.file_doc.fetch();
    }));
    console.log(files)
    if (files.some(file => {
        if (!file) {
            return false;
        };
        return !file.data.__name.includes("jpeg") &&
            !file.data.__name.includes("jpg") &&
            !file.data.__name.includes("png") &&
            !file.data.__name.includes("pdf")
    })) {
        ViewContext.data.wrong_file_format = true;
    } else {
        ViewContext.data.wrong_file_format = false;
    };
};

async function setFIO(): Promise<void> {
    Context.data.full_name = {
        firstname: Context.data.name || '',
        lastname: Context.data.surname || '',
        middlename: Context.data.middlename || ''
    }
}

async function get_positions(): Promise<void> {
    if (Context.data.position) {
        const position = await Context.data.position.fetch();
        const subdivision = await position.data.subdivision!.fetch();
        const entity = await subdivision.data.organization!.fetch();
        Context.data.structural_subdivision = position.data.subdivision;
        Context.data.organization = entity;
        Context.data.entity = entity.data.entity;
    }
}

async function setPDN(): Promise<void> {
    if (Context.data.personal_data_employee === true) {
        ViewContext.data.view_pdn = false;
        ViewContext.data.view_skans = true;
        //ViewContext.data.view_docs = false;
        ViewContext.data.supportive_snils = Context.data.snils;
        ViewContext.data.supportive_inn = Context.data.inn;
        ViewContext.data.supportive_pass_code = Context.data.passport_department_code;
        Context.data.snils = undefined;
        Context.data.passport_department_code = undefined;
        Context.data.inn = undefined;

    } else {
        ViewContext.data.view_pdn = true;
        ViewContext.data.view_skans = false;
        //ViewContext.data.view_docs = true;
        Context.data.snils = ViewContext.data.supportive_snils;
        Context.data.passport_department_code = ViewContext.data.supportive_pass_code;
        Context.data.inn = ViewContext.data.supportive_inn;
        Context.data.scans_personal_docs = false
    }
    await get_positions()
}

async function setDOCS(): Promise<void> {
    if (Context.data.scans_personal_docs === true) {
        ViewContext.data.view_docs = false
    } else {
        ViewContext.data.view_docs = true
    }
}

async function checkFields(): Promise<void> {
    let unepRequired = !!Context.data.unep_issue_required;
    let employmentRequired = !!Context.data.is_employed;
    if (!unepRequired && employmentRequired) {
        Context.data.personal_data_employee = false;
    };
}

async function viewUser(): Promise<void> {
    if (Context.data.user_already_exists === true) {
        ViewContext.data.is_reading_email = true;
        if (Context.data.staff_access == true) {
            ViewContext.data.external = true;
            ViewContext.data.internal = false
        } else {
            ViewContext.data.external = false;
            ViewContext.data.internal = true
        }
        ViewContext.data.user = undefined;
        ViewContext.data.doubleuserphone = false;
        ViewContext.data.doubleuseremail = false;
        if (Context.data.ext_user) {
            ViewContext.data.check_user = Context.data.ext_user;
        }
        if (ViewContext.data.ext_user_app) {
            ViewContext.data.check_ext_user = ViewContext.data.ext_user_app;
        }
    } else {
        ViewContext.data.is_reading_email = false;
        ViewContext.data.external = false;
        ViewContext.data.internal = false;
        ViewContext.data.doublestaff = false;
        ViewContext.data.doubleuser = false;
        ViewContext.data.check_user = undefined;
        ViewContext.data.check_ext_user = undefined;
        //ViewContext.data.ext_user_app = undefined;
        //Context.data.ext_user = undefined;
        //очистка полей фио, телелефона и почты
        // Context.data.name = undefined;
        // Context.data.surname = undefined;
        // Context.data.middlename = undefined;
        // Context.data.full_name = undefined;
        // Context.data.email = undefined;
        // Context.data.phone = undefined;
    }

    await checkEmail();
    await checkPhone();
}

async function getUserData(): Promise<void> {
    if (Context.data.ext_user) {
        ViewContext.data.check_user = Context.data.ext_user;
        const user = await Context.data.ext_user.fetch();
        const doubleUser = await Application.search().where(f => f.ext_user.eq(Context.data.ext_user!)).first();
        if (doubleUser) {
            ViewContext.data.doubleuser = true;
        } else {
            ViewContext.data.doubleuser = false;
        }
        Context.data.name = user.data.fullname ? user.data.fullname.firstname : '';
        Context.data.surname = user.data.fullname ? user.data.fullname.lastname : '';
        Context.data.middlename = user.data.fullname ? user.data.fullname.middlename : '';
        Context.data.full_name = user.data.fullname;
        Context.data.email = user.data.email ? Context.fields.email.create(user.data.email) : undefined;
        Context.data.phone = user.data.workPhone
    }

    //актуализация групп
    refreshStaffGroups();
    await checkEmail();
    await checkPhone();
}

async function getExtUserData(): Promise<void> {
    if (ViewContext.data.ext_user_app) {
        ViewContext.data.check_ext_user = ViewContext.data.ext_user_app;
        const user = await ViewContext.data.ext_user_app.fetch();
        const doubleStaff = await Application.search().where(f => f.external_user.has(ViewContext.data.ext_user_app!)).first();
        if (doubleStaff) {
            ViewContext.data.doublestaff = true;
        } else {
            ViewContext.data.doublestaff = false;
        }
        Context.data.name = user.data.fullname ? user.data.fullname.firstname : '';
        Context.data.surname = user.data.fullname ? user.data.fullname.lastname : '';
        Context.data.middlename = user.data.fullname ? user.data.fullname.middlename : '';
        Context.data.full_name = user.data.fullname;
        Context.data.email = user.data.email ? Context.fields.email.create(user.data.email) : undefined;
        Context.data.phone = user.data.phone && user.data.phone.length > 0 ? Context.fields.phone.create(user.data.phone[0].tel) : undefined;
        if (!Context.data.external_user) {
            Context.data.external_user = [];
            Context.data.external_user = Context.data.external_user.concat(user);
        }
    }

    //актуализация групп
    refreshStaffGroups();
    await checkEmail();
    await checkPhone();
}

async function checkPhone(): Promise<void> {
    if (Context.data.phone) {
        const staff_check = await Application.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.phone.eq(Context.data.phone!),
                f.__id.neq(Context.data.__id),
            ))
            .first();

        if (ViewContext.data.check_user) {
            const user_check = await System.users.search()
                .where((field, group) => group.and(
                    field.__deletedAt.eq(null),
                    field.__status.eq(UserStatus.Active),
                    group.or(
                        field.workPhone.eq(Context.data.phone!),
                        field.mobilePhone.eq(Context.data.phone!),
                    ),
                    field.__id.neq(ViewContext.data.check_user!.id),
                ))
                .first();
            if (user_check && staff_check) {
                ViewContext.data.doubleuserphone = true;
                ViewContext.data.user_error_phone = `Пользователь и сотрудник с таким номером телефона уже существует (${user_check.data.__name}). При необходимости вы можете повторно его трудоустроить.`;
                ViewContext.data.error_validation_phone = true;
                ViewContext.data.doublephone = false;
                ViewContext.data.staff_error_phone = '';
                ViewContext.data.error_validation_phone_staff = false;
                checkLabels();
                return;
            }
            if (user_check && !staff_check) {
                ViewContext.data.doubleuserphone = true;
                ViewContext.data.user_error_phone = `Пользователь с таким номером телефона существует (${user_check.data.__name}), но сотрудник ещё не создан. Вы можете создать нового сотрудника, используя этого пользователя, установив значение переменной "Пользователь существует" в значение "Да".`;
                ViewContext.data.error_validation_phone = true;
                ViewContext.data.doublephone = false;
                ViewContext.data.staff_error_phone = '';
                ViewContext.data.error_validation_phone_staff = false;
                checkLabels();
                return;
            }
        }

        if (ViewContext.data.check_ext_user) {
            const ext_user_data = await ViewContext.data.check_ext_user.fetch();
            const ext_user_check = await ViewContext.fields.check_ext_user.app.search()
                .where((field, group) => group.and(
                    field.__user_status.eq(ext_user_data.fields.__user_status.variants.active),
                    field.__deletedAt.eq(null),
                    group.or(
                        field.phone.has(Context.data.phone!),
                        field.phone.has(Context.data.phone!),
                    ),
                    field.__id.neq(ViewContext.data.check_ext_user!.id),
                ))
                .first();
                
            if (ext_user_check && staff_check) {
                ViewContext.data.doubleuserphone = true;
                ViewContext.data.user_error_phone = `Пользователь и сотрудник с таким номером телефона уже существует (${ext_user_check.data.__name}). При необходимости вы можете повторно его трудоустроить.`;
                ViewContext.data.error_validation_phone = true;
                ViewContext.data.doublephone = false;
                ViewContext.data.staff_error_phone = '';
                ViewContext.data.error_validation_phone_staff = false;
                checkLabels();
                return;
            }
            if (ext_user_check && !staff_check) {
                ViewContext.data.doubleuserphone = true;
                ViewContext.data.user_error_phone = `Пользователь с таким номером телефона существует (${ext_user_check.data.__name}), но сотрудник ещё не создан. Вы можете создать нового сотрудника, используя этого пользователя, установив значение переменной "Пользователь существует" в значение "Да".`;
                ViewContext.data.error_validation_phone = true;
                ViewContext.data.doublephone = false;
                ViewContext.data.staff_error_phone = '';
                ViewContext.data.error_validation_phone_staff = false;
                checkLabels();
                return;
            }
        }

        if ((!ViewContext.data.check_user && !ViewContext.data.check_ext_user)) {
            const user_check = await System.users.search()
                .where((field, group) => group.and(
                    field.__deletedAt.eq(null),
                    field.__status.eq(UserStatus.Active),
                    group.or(
                        field.workPhone.eq(Context.data.phone!),
                        field.mobilePhone.eq(Context.data.phone!),
                    ),
                ))
                .first();
            if (user_check && staff_check) {
                ViewContext.data.doubleuserphone = true;
                ViewContext.data.user_error_phone = `Пользователь и сотрудник с таким номером телефона уже существует (${user_check.data.__name}). При необходимости вы можете повторно его трудоустроить.`;
                ViewContext.data.error_validation_phone = true;
                ViewContext.data.doublephone = false;
                ViewContext.data.staff_error_phone = '';
                ViewContext.data.error_validation_phone_staff = false;
                checkLabels();
                return;
            }
            if (user_check && !staff_check) {
                ViewContext.data.doubleuserphone = true;
                ViewContext.data.user_error_phone = `Пользователь с таким номером телефона существует (${user_check.data.__name}), но сотрудник ещё не создан. Вы можете создать нового сотрудника, используя этого пользователя, установив значение переменной "Пользователь существует" в значение "Да".`;
                ViewContext.data.error_validation_phone = true;
                ViewContext.data.doublephone = false;
                ViewContext.data.staff_error_phone = '';
                ViewContext.data.error_validation_phone_staff = false;
                checkLabels();
                return;
            }
        }

        if (staff_check) {
            ViewContext.data.doublephone = true;
            ViewContext.data.staff_error_phone = `Сотрудник с таким номером телефона уже существует (${staff_check.data.__name}). При необходимости вы можете повторно его трудоустроить.`;
            ViewContext.data.error_validation_phone_staff = true;
            checkLabels();
            return;
        }
        ViewContext.data.user = undefined;
        ViewContext.data.doubleuserphone = false;
        ViewContext.data.user_error_phone = '';
        ViewContext.data.staff = undefined;
        ViewContext.data.doublephone = false;
        ViewContext.data.staff_error_phone = '';
        ViewContext.data.error_validation_phone_staff = false;
        ViewContext.data.error_validation_phone = false;
        checkLabels();
    }
}

async function checkEmail(): Promise<void> {
    if (Context.data.email) {
        const staff_check = await Application.search()
            .where((field, group) => group.and(
                field.__deletedAt.eq(null),
                field.email.eq(Context.data.email!.email),
                field.__id.neq(Context.data.__id),
            ))
            .first();

        if (ViewContext.data.check_user) {
            const user_check = await System.users.search()
                .where((field, group) => group.and(
                    field.__status.eq(UserStatus.Active),
                    field.__deletedAt.eq(null),
                    field.email.eq(Context.data.email!.email),
                    field.__id.neq(ViewContext.data.check_user!.id),
                ))
                .first();
            if (user_check && staff_check) {
                ViewContext.data.doubleuseremail = true;
                ViewContext.data.user_error_email = `Пользователь и сотрудник с таким email уже существует (${user_check.data.__name}). При необходимости вы можете повторно его трудоустроить.`;
                ViewContext.data.error_validation_email = true;
                ViewContext.data.doubleemail = false;
                ViewContext.data.staff_error_email = '';
                ViewContext.data.error_validation_email_staff = false;
                checkLabels();
                return;
            }
            if (user_check && !staff_check) {
                ViewContext.data.doubleuseremail = true;
                ViewContext.data.user_error_email = `Пользователь с таким email существует (${user_check.data.__name}), но сотрудник ещё не создан. Вы можете создать нового сотрудника, используя этого пользователя, установив значение переменной "Пользователь существует" в значение "Да".`;
                ViewContext.data.error_validation_email = true;
                ViewContext.data.doubleemail = false;
                ViewContext.data.staff_error_email = '';
                ViewContext.data.error_validation_email_staff = false;
                checkLabels();
                return;
            }
        }

        if (ViewContext.data.check_ext_user) {
            const ext_user_data = await ViewContext.data.check_ext_user.fetch();
            const ext_user_check = await ViewContext.fields.check_ext_user.app.search()
                .where((field, group) => group.and(
                    field.__user_status.eq(ext_user_data.fields.__user_status.variants.active),
                    field.__deletedAt.eq(null),
                    field.email.eq(Context.data.email!.email),
                    field.__id.neq(ViewContext.data.check_ext_user!.id)
                ))
                .first();
            
            if (ext_user_check && staff_check) {
                ViewContext.data.doubleuseremail = true;
                ViewContext.data.user_error_email = `Пользователь и сотрудник с таким email уже существует (${ext_user_check.data.__name}). При необходимости вы можете повторно его трудоустроить.`;
                ViewContext.data.error_validation_email = true;
                ViewContext.data.doubleemail = false;
                ViewContext.data.staff_error_email = '';
                ViewContext.data.error_validation_email_staff = false;
                checkLabels();
                return;
            }
            if (ext_user_check && !staff_check) {
                ViewContext.data.doubleuseremail = true;
                ViewContext.data.user_error_email = `Пользователь с таким email существует (${ext_user_check.data.__name}), но сотрудник ещё не создан. Вы можете создать нового сотрудника, используя этого пользователя, установив значение переменной "Пользователь существует" в значение "Да".`;
                ViewContext.data.error_validation_email = true;
                ViewContext.data.doubleemail = false;
                ViewContext.data.staff_error_email = '';
                ViewContext.data.error_validation_email_staff = false;
                checkLabels();
                return;
            }
        }

        if ((!ViewContext.data.check_user && !ViewContext.data.check_ext_user)) {
            const user_check = await System.users.search()
                .where((field, group) => group.and(
                    field.__status.eq(UserStatus.Active),
                    field.__deletedAt.eq(null),
                    field.email.eq(Context.data.email!.email),
                ))
                .first();

            
            if (user_check && staff_check) {
                ViewContext.data.doubleuseremail = true;
                ViewContext.data.user_error_email = `Пользователь и сотрудник с таким email уже существует (${user_check.data.__name}). При необходимости вы можете повторно его трудоустроить.`;
                ViewContext.data.error_validation_email = true;
                ViewContext.data.doubleemail = false;
                ViewContext.data.staff_error_email = '';
                ViewContext.data.error_validation_email_staff = false;
                checkLabels();
                return;
            }
            if (user_check && !staff_check) {
                ViewContext.data.doubleuseremail = true;
                ViewContext.data.user_error_email = `Пользователь с таким email существует (${user_check.data.__name}), но сотрудник ещё не создан. Вы можете создать нового сотрудника, используя этого пользователя, установив значение переменной "Пользователь существует" в значение "Да".`;
                ViewContext.data.error_validation_email = true;
                ViewContext.data.doubleemail = false;
                ViewContext.data.staff_error_email = '';
                ViewContext.data.error_validation_email_staff = false;
                checkLabels();
                return;
            }
        }

        if (staff_check) {
            ViewContext.data.doubleemail = true;
            ViewContext.data.staff_error_email = `Сотрудник с таким email уже существует (${staff_check.data.__name}). При необходимости вы можете повторно его трудоустроить.`;
            ViewContext.data.error_validation_email_staff = true;
            checkLabels();
            return;
        }

        ViewContext.data.user_email = undefined;
        ViewContext.data.doubleuseremail = false;
        ViewContext.data.user_error_email = '';
        ViewContext.data.staff_email = undefined;
        ViewContext.data.doubleemail = false;
        ViewContext.data.staff_error_email = '';
        ViewContext.data.error_validation_email = false;
        ViewContext.data.error_validation_email_staff = false;
        checkLabels();
    }
}

function checkLabels() {
    const button_save = document.querySelectorAll('.btn-primary');
    for (let button of button_save) {
        if (button.innerText.includes('Выслать приглашение')) {
            if (ViewContext.data.error_validation_email === true || ViewContext.data.error_validation_email_staff === true || ViewContext.data.error_validation_phone === true || ViewContext.data.error_validation_phone_staff === true) {
                button.disabled = true;
            } else {
                button.disabled = false;
            }
        }
    }
}

async function checkDouble(): Promise<void> {
    if (Context.data.inn && Context.data.snils) {
        const double = await Application.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.neq(Context.data.__id),
                g.or(
                    f.inn.eq(Context.data.inn!),
                    f.snils.eq(Context.data.snils!)
                )
            ))
            .first()
        if (double) {
            ViewContext.data.doubleinnsnils = true;
            ViewContext.data.staff_inn = double;
            if (window.saveButton)
                window.saveButton.disabled = true;
        } else {
            ViewContext.data.doubleinnsnils = false;
            ViewContext.data.staff_inn = undefined;
            if (window.saveButton)
                window.saveButton.disabled = false;
        }
    } else {
        ViewContext.data.doubleinnsnils = false;
        ViewContext.data.staff_inn = undefined;
        if (window.saveButton)
            window.saveButton.disabled = false;
    }

    if (Context.data.snils) {
        ViewContext.data.supportive_snils = Context.data.snils;
        let split_str = Context.data.snils.match(/(\d{1,3})/g);
        if (split_str && split_str[0].length == 3 && (split_str[1])) {
            Context.data.snils = split_str[0] + '-' + split_str[1];
        }
        if (split_str && split_str[1].length == 3 && (split_str[2])) {
            Context.data.snils += '-' + split_str[2];
        }

        if (split_str && split_str[2].length == 3 && (split_str[3])) {
            Context.data.snils += ' ' + split_str![3];
        }
    }

    if (Context.data.inn) {
        ViewContext.data.supportive_inn = Context.data.inn;
        let split_str = Context.data.inn.match(/(\d{1,12})/g);
        if (split_str && split_str[0].length == 12 && (split_str[1])) {
            Context.data.inn = split_str[0];
        }
    }

    validateInn(Context.data.inn!);
    validateSnils(Context.data.snils!);
}

async function validate(): Promise<ValidationResult> {
    let result = new ValidationResult();

    result.title = 'Ошибка!';

    const validate_table = valide_employment_table();

    if (!validate_table && Context.data.employment_table!.length > 0) {
        result.addMessage('Обнаружены ошибки в таблице занятости сотрудника. Проверьте таблицу и исправьте ошибки.');
        result.addContextError('employment_table', '')
    }
    if (!validate_table && Context.data.employment_table!.length == 0) {
        result.addMessage('Заполните "Сведения занятости" основным местом работы через "+Строка занятости"');
        result.addContextError('employment_table', '')
    }
    if (ViewContext.data.doubleemail) {
        result.addContextError("email", "Сотрудник с таким адресом электронной почты уже существует");
    }
    if (ViewContext.data.doubleuserphone) {
        result.addContextError("phone", "Пользователь с таким номером телефона уже существует");
    }
    if (ViewContext.data.doubleuseremail) {
        result.addContextError("email", "Пользователь с таким адресом электронной почты уже существует");
    }
    if (ViewContext.data.doubleinnsnils) {
        result.addContextError("inn", "Пользователь с таким ИНН/СНИЛС уже существует");
    }
    /*if (ViewContext.data.show_sms_provider_error) {
        result.addContextError('phone', 'Модуль SMS-провайдера выключен. Отправка SMS невозможна. Включите модуль.')
    }*/
    // if (Context.data.scans_personal_docs) {
    //     if (Context.data.documents_for_employment && Context.data.documents_for_employment.length == 0) {
    //         result.addContextError('documents_for_employment', 'Требуется заполнить таблицу документов для трудоустройства')
    //     }
    // }


    return result;
}

// #region Работа с таблицей занятости.

interface ErrorsLine {
    id: number,
    error_text: string,
}

interface LineDetail {
    id: number,
    position?: string,
    organizatoin?: string,
    subdivision?: string,
    type_employment?: string,
    work_place?: string,
    work_schedules?: string,
    employment_relationship_type?: string,
    remote_work?: boolean,
    rate?: number,
    date_by?: string,
    admission_date_position?: string,
    admission_date_organization?: string,
    id_1c?: string,
}

/** Генерация GUID */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

/** Валидация таблицы занятости. */
function valide_employment_table(): boolean {
    Context.data.employment_table = Context.data.employment_table;
    const employment_table = Context.data.employment_table!;

    // Если таблица занятости не заполнена - false.
    if (employment_table.length == 0) {
        return false;
    }

    // Если в строках таблицы занятости есть ошибки - false.
    if (ViewContext.data.employment_table_errors && ViewContext.data.employment_table_errors.length > 0) {
        return false;
    }

    return true;
}

/** Создание новой строки в таблице занятости. */
async function add_employment_row(): Promise<void> {
    const id = calculate_line_number();

    const row = Context.data.employment_table!.insert();

    row.id = id;

    Context.data.employment_table = Context.data.employment_table;
}

/** Получение ID строки для таблицы занятости. */
function calculate_line_number(): number {
    /**
     * Если в таблице есть строки, то берем ID последней строки и прибавляем 1.
     * Иначе возвращаем 0.
     */
    const ids = Context.data.employment_table!.map(f => f.id);

    if (ids.length == 0) {
        return 0;
    }

    return ids[ids.length - 1] + 1;
}

/** Проверка таблицы занятости и формирование списка ошибок по строкам. */
function check_errors(): void {
    const employment_table = Context.data.employment_table!;

    const errors: ErrorsLine[] = [];

    for (const row of employment_table) {
        if (row.position) {
            if (employment_table.filter(f => f.position?.id == row.position.id).length > 1) {
                errors.push({
                    id: row.id,
                    error_text: 'Данная позиция уже указана у сотрудника',
                })
            }

            if (!row.organization) {
                errors.push({
                    id: row.id,
                    error_text: 'У выбранной позиции не указана организация'
                })
            }

            if (!row.subdivision) {
                errors.push({
                    id: row.id,
                    error_text: 'У выбранной позиции не указано подразделение',
                })
            }

            if (!row.type_employment) {
                errors.push({
                    id: row.id,
                    error_text: 'Не выбран вид занятости'
                })
            }

            if (row.type_employment && row.type_employment.code == 'main_workplace' && employment_table.filter(f => f.type_employment?.code == 'main_workplace').length > 1) {
                errors.push({
                    id: row.id,
                    error_text: 'Указано несколько строк с местом основной работы',
                })
            }

            if (!row.admission_date_position) {
                errors.push({
                    id: row.id,
                    error_text: 'Не указана дата приёма на позицию',
                })
            }

            if (!row.admission_date_organization) {
                errors.push({
                    id: row.id,
                    error_text: 'Не указана дата приёма в организацию'
                })
            }
            if (row.admission_date_organization.after(row.admission_date_position)) {
                errors.push({
                    id: row.id,
                    error_text: 'Дата приема на позицию раньше даты приема в организацию'
                })
            }
        } else {
            errors.push({
                id: row.id,
                error_text: 'Не указана позиция ШР'
            })
        }
    }

    ViewContext.data.employment_table_errors = errors;
}

/** Событие, вызываемое при изменении таблицы занятости. */
async function employment_table_onchange(): Promise<void> {
    check_errors();

    const employment_table = Context.data.employment_table;

    /**
     * В случае, если есть строка в которой указана основная позиция, 
     * то заполняем поля в карточке сотрудника,
     * иначе очищаем все поля.
     */

    if (employment_table && employment_table.length > 0) {
        const main_position = employment_table.find(f => f.type_employment?.code == 'main_workplace');

        if (main_position && main_position.position) {
            Context.data.position = main_position.position;
            Context.data.organization = main_position.organization;
            Context.data.structural_subdivision = main_position.subdivision;
            Context.data.work_start = main_position.admission_date_organization;
            Context.data.admission_date_position = main_position.admission_date_position;
            Context.data.employment_type = main_position.type_employment;
        } else {
            Context.data.position = undefined;
            Context.data.organization = undefined;
            Context.data.structural_subdivision = undefined;
            Context.data.work_start = undefined;
            Context.data.admission_date_position = undefined;
            Context.data.employment_type = undefined
        }
    } else {
        Context.data.position = undefined;
        Context.data.organization = undefined;
        Context.data.structural_subdivision = undefined;
        Context.data.work_start = undefined;
        Context.data.admission_date_position = undefined;
        Context.data.employment_type = undefined;
    }
}

/** Событие, которое вызывает при изменении строки занятости в динамическом списке. */
async function update_line(): Promise<void> {
    /**
     * Обмен данными между виджетом и основной формой происходит через кэш.
     * При изменении данных в виджете, происходит триггер клика по кнопке на форме создания карточки сотрудника.
     * В кэше по ключу "update_line_$guid$" хранится информация по строке. На основе этой информации заполняем таблицу занятости.
     */

    const cache = await System.cache.getItem(`update_line_${ViewContext.data.cache_guid}`);

    if (cache) {
        const line_details: LineDetail = JSON.parse(cache);
        const line = Context.data.employment_table!.find(f => f.id == line_details.id)!;

        const [position, organization, subdivision, work_schedules, employment_relationship_type, work_place] = await Promise.all([
            Context.fields.position.app.search().where(f => f.__id.eq(line_details.position!)).first(),
            Context.fields.organization.app.search().where(f => f.__id.eq(line_details.organizatoin!)).first(),
            Context.fields.structural_subdivision.app.search().where(f => f.__id.eq(line_details.subdivision!)).first(),
            Context.fields.work_schedules.app.search().where(f => f.__id.eq(line_details.work_schedules!)).first(),
            Context.fields.type_employment_relationship.app.search().where(f => f.__id.eq(line_details.employment_relationship_type!)).first(),
            Context.fields.work_place.app.search().where(f => f.__id.eq(line_details.work_place!)).first()
        ]);

        if (position) line.position = position;
        if (organization) line.organization = organization;
        if (subdivision) line.subdivision = subdivision;
        if (work_schedules) line.work_schedules = work_schedules;
        if (employment_relationship_type) line.employment_relationship_type = employment_relationship_type;
        if (work_place) line.work_place = work_place;
        if (line_details.date_by) { line.date_by = new Datetime(line_details.date_by).getDate(); } else { (line as any).date_by = undefined; }
        if (line_details.admission_date_organization) line.admission_date_organization = new Datetime(line_details.admission_date_organization).getDate();
        if (line_details.admission_date_position) line.admission_date_position = new Datetime(line_details.admission_date_position).getDate();
        if (line_details.remote_work) line.remote_work = line_details.remote_work;
        if (line_details.rate) line.rate = line_details.rate;
        if (line_details.id_1c) line.id_1c = line_details.id_1c;
        if (line_details.type_employment) line.type_employment = (Context.fields.employment_table.fields.type_employment.variants as any)[line_details.type_employment];

        await employment_table_onchange();
    }
}

/** Событие, вызываемое при удалении строки из динамического списка. */
async function delete_line(): Promise<void> {
    /**
     * Обмен данными между виджетом и основной формой происходит через кэш.
     * При нажатии на кнопку удаления в виджете, происходит триггер клика по кнопке на форме создания карточки сотрудника.
     * В кэше по ключу "delete_line_$guid$" хранится информация по строке, которую необходимо удалить.
     */

    const cache = await System.cache.getItem(`delete_line_${ViewContext.data.cache_guid}`);

    if (cache) {
        const line_details: LineDetail = JSON.parse(cache);
        const line_index = Context.data.employment_table!.findIndex(f => f.id == line_details.id);

        if (line_index != -1) {
            const details_status_index = ViewContext.data.details_status.findIndex((f: any) => f.id == line_details.id);
            ViewContext.data.details_status.splice(details_status_index, 1)
            ViewContext.data.employment_table_errors = ViewContext.data.employment_table_errors.map((f: any) => f.id != line_details.id);
            Context.data.employment_table!.delete(line_index);
            Context.data.employment_table = Context.data.employment_table;
        }
    }
}

//#endregion Работа с таблицей занятости.

async function change_notification_type(): Promise<void> {
    const notification_type = Context.fields.notification.variants;

    ViewContext.data.email_required = false;
    ViewContext.data.show_sms_provider_error = false;
    ViewContext.data.show_phone_auth_error = false;

    switch (Context.data.notification?.code) {
        case notification_type.email.code:
            ViewContext.data.email_required = true;
            break;

        case notification_type.email_and_sms.code:
            ViewContext.data.email_required = true;
            await sms_type();
            break;

        case notification_type.sms.code:
            await sms_type();
            break;

        default:
            break;
    }
}

async function sms_type(): Promise<void> {
    const sms_provider_enabled = await check_sms_provider();
    ViewContext.data.show_sms_provider_error = !sms_provider_enabled;

    if (Context.data.notification?.code == "sms") {
        const phone_auth_enabled = await check_phone_auth();
        ViewContext.data.show_phone_auth_error = !phone_auth_enabled;
    }
}

// Проверка на включенные модули SMS-провайдеров.
async function check_sms_provider(): Promise<boolean> {
    // Получаем список включенных модулей, которые находятся в группе модулей SMS.
    const response = await fetch(`${System.getBaseUrl()}/api/integrations/enabled?group=sms`, {
        method: 'GET',
    });

    if (response.ok) {
        const providers = await response.json();
        // Если список пустой - включенных модулей нет.
        return providers.length > 0;
    }

    return false;
}

// Проверка на включенность авторизации по номеру телефона.
async function check_phone_auth(): Promise<boolean> {
    // Получаем настройки для авторизации по номеру телефона.
    const response = await fetch(`${System.getBaseUrl()}/api/settings/global/extendedAuth`, {
        method: 'GET',
    });

    if (response.ok) {
        const extendedAuth = await response.json();
        return extendedAuth.authByPhone;
    }

    return false;
}

function validateInn(inn: string) {
    if (Context.data.personal_data_employee == false) {
        if (!inn || inn.length < 12) {
            console.log("inn is not full")
            ViewContext.data.wrong_inn_format = false;
            return;
        };
        let result = false;
        const checkDigit = function (inn: string, coefficients: number[]) {
            let n = 0;
            for (let i in coefficients) {
                n += coefficients[i] * parseInt(inn[i]);
            }
            return n % 11 % 10;
        };
        switch (inn.length) {
            case 10:
                let n10 = checkDigit(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
                if (n10 === parseInt(inn[9])) {
                    result = true;
                }
                break;
            case 12:
                let n11 = checkDigit(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
                let n12 = checkDigit(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
                if ((n11 === parseInt(inn[10])) && (n12 === parseInt(inn[11]))) {
                    result = true;
                }
                break;
        }
        if (!result) {
            ViewContext.data.wrong_inn_format = true;
            return;
        }
        ViewContext.data.wrong_inn_format = false;
    }
};

function validateSnils(snils: string) {
    if (Context.data.personal_data_employee == false) {
        if (!snils || snils.length < 14) {
            ViewContext.data.wrong_snils_format = false;
            console.log("snils not full")
            return;
        };
        snils = snils.replace(/[\s-]/g, "");
        console.log(snils)
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(snils[i]) * (9 - i);
        }
        let checkDigit = 0;
        if (sum < 100) {
            checkDigit = sum;
        } else if (sum > 101) {
            checkDigit = sum % 101;
            if (checkDigit === 100) {
                checkDigit = 0;
            }
        }
        if (checkDigit === parseInt(snils.slice(-2))) {
            ViewContext.data.wrong_snils_format = false;
            return;
        };
        ViewContext.data.wrong_snils_format = true;
    }
};

async function log_table(): Promise<void> {
    console.log(Context.data.employment_table);
}

async function recalc_ids(): Promise<void> {
    let i = 0;

    for (const row of Context.data.employment_table!) {
        row.id = i;
        i++;
    }

    Context.data.employment_table = Context.data.employment_table;
}

async function no_middle_name_onchange(): Promise<void> {
    if (Context.data.no_middle_name) {
        if (Context.data.no_middle_name == true) {
            Context.data.middlename = undefined;
        }
        // Обязательность поля "Отчество"
    }
}
async function recalc_ids_all(): Promise<void> {
    console.log('Запуск перерасчета идентификаторов строк таблицы занятости');

    const staffs = await Namespace.app.staff.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    console.log(`Количество сотрудников: ${staffs.length}`);

    let promises: Promise<void>[] = [];

    for (const staff of staffs) {
        console.log(staff.data.__name);

        if (staff.data.employment_table && staff.data.employment_table.length > 0) {
            let i = 0;

            for (const row of Context.data.employment_table!) {
                row.id = i; i++;
            }

            console.log('Перерасчет таблицы закончен');

            promises.push(staff.save());

            if (promises.length > 80) {
                await Promise.all(promises);
                promises = [];
            }
        } else {
            console.log('Таблица занятости не заполнена');
        }
    }

    console.log('Перерасчет идентификаторов строк таблицы занятости закончен');
}

async function refreshStaffGroups(): Promise<void> {
    if (!Context.data.ext_user && !Context.data.organization) {
        return;
    };
    const user = await Context.data.ext_user!.fetch();
    const org = await Context.data.organization!.fetch();
    if (!org.data.access_settings_organization) {
        return;
    };
    const accessSettings = await org.data.access_settings_organization!.fetch();
    if ((!accessSettings.data.inner_org_users || accessSettings.data.inner_org_users.length < 1) || (!accessSettings.data.external_org_users || accessSettings.data.external_org_users.length < 1)) {
        return;
    };
    let groupToAddUser: UserGroupItem | undefined;
    let groupToDeleteUser: UserGroupItem | undefined;
    if (Context.data.staff_access == false) {
        groupToAddUser = await System.userGroups.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(accessSettings.data.inner_org_users![0].code)
        )).first();
        groupToDeleteUser = await System.userGroups.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(accessSettings.data.external_org_users![0].code)
        )).first();
    } else {
        groupToAddUser = await System.userGroups.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(accessSettings.data.external_org_users![0].code)
        )).first();
        groupToDeleteUser = await System.userGroups.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(accessSettings.data.inner_org_users![0].code)
        )).first();
    };
    if (groupToAddUser) {
        await groupToAddUser.addItem(user);
        await groupToAddUser.save();
        console.log(`user added to group ${groupToAddUser.data.__name}`)
    };
    if (!groupToDeleteUser || !groupToDeleteUser.data.subOrgunitIds || groupToDeleteUser.data.subOrgunitIds.length < 1) {
        return;
    };
    groupToDeleteUser.data.subOrgunitIds = groupToDeleteUser.data.subOrgunitIds.filter(id => user.id !== id);
    await groupToDeleteUser.save();
    console.log(`user deleted from group ${groupToDeleteUser.data.__name}`)
};

async function changePassDepCode(): Promise<void> {
    if (Context.data.passport_department_code) {
        ViewContext.data.supportive_pass_code = Context.data.passport_department_code;
        let split_str = Context.data.passport_department_code.match(/(\d{1,3})/g);
        if (split_str && split_str[0].length == 3 && (split_str[1])) {
            Context.data.passport_department_code = split_str[0] + '-' + split_str[1];
        }
    }
}

async function checkNumber(): Promise<void> {
    if (Context.data.passport_number) {
        let split_str = Context.data.passport_number.match(/(\d{1,6})/g);
        if (split_str && split_str[0].length == 6 && (split_str[1])) {
            Context.data.passport_number = split_str[0];
        }
    }
}

async function checkSeries(): Promise<void> {
    if (Context.data.passport_series) {
        let split_str = Context.data.passport_series.match(/(\d{1,4})/g);
        if (split_str && split_str[0].length == 4 && (split_str[1])) {
            Context.data.passport_series = split_str[0];
        }
    }
}
