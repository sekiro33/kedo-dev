/* Client scripts module */

let modal: ModalError;

class ModalError {
    error_stack: string[];

    wrapper_style: string;

    constructor() {
        this.error_stack = [];
        this.wrapper_style = `display: flex; flex-direction: column; padding-top: 10px`;
    }

    add_text_error(text: string) {
        this.error_stack.push(`<li>${text}</li>`);
    }

    add_link_error(text: string, ref: RefItem) {
        const link = `(p:item/${ref.namespace}/${ref.code}/${ref.id})`;
        this.error_stack.push(`<li><a href=${link}>${text}</a></li>`);
    }

    show_errors() {
        if (this.error_stack.length > 0) {
            this.error_stack = [...new Set(this.error_stack)]

            ViewContext.data.show_error = true;
            const errors = this.error_stack.join('');
            ViewContext.data.error_text = `<div style="${this.wrapper_style}"><ul>${errors}</ul></div>`
        }
    }

    hide_errors() {
        ViewContext.data.show_error = false;
        this.error_stack = [];
        ViewContext.data.error_text = undefined;
    }
}

async function onInit(): Promise<void> {
    ViewContext.data.modal = new ModalError();
    await set_fields();
    await check();
}

// Заполнение полей на форме.
async function set_fields(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();

        // ФИО.
        ViewContext.data.name = staff.data.name;
        ViewContext.data.surname = staff.data.surname;
        ViewContext.data.middlename = staff.data.middlename;

        // Основные данные.
        ViewContext.data.date_of_birth = staff.data.date_of_birth;
        if (staff.data.directory_of_regions) {
            ViewContext.data.address = `${staff.data.directory_of_regions}, ${staff.data.city}, ${staff.data.street}, ${staff.data.home}`;
        } else {
            ViewContext.data.address = `${staff.data.city}, ${staff.data.street}, ${staff.data.home}`;
        }
        ViewContext.data.position = staff.data.position;
        ViewContext.data.organization = staff.data.organization;
        ViewContext.data.structural_subdivision = staff.data.structural_subdivision;
        ViewContext.data.type_employment = staff.data.employment_type;
        ViewContext.data.phone = staff.data.phone;
        ViewContext.data.work_start = staff.data.work_start;
        ViewContext.data.admission_date_organization = staff.data.admission_date_position;
        ViewContext.data.email = staff.data.email;

        // Паспортные данные.
        ViewContext.data.passport_number = staff.data.passport_number;
        ViewContext.data.passport_series = staff.data.passport_series;
        ViewContext.data.passport_department_code = staff.data.passport_department_code;
        ViewContext.data.issued_by = staff.data.issued_by;
        ViewContext.data.date_of_issue = staff.data.date_of_issue;

        // ИНН, СНИЛС.
        ViewContext.data.inn = staff.data.inn;
        ViewContext.data.snils = staff.data.snils;

        ViewContext.data.personal_data_employee = staff.data.personal_data_employee;
        ViewContext.data.personal_data_required = !staff.data.personal_data_employee;
    }
}

async function change_position(): Promise<void> {
    if (ViewContext.data.position) {
        const position = await ViewContext.data.position.fetch();
        ViewContext.data.organization = position.data.organization;
        ViewContext.data.structural_subdivision = position.data.subdivision;
        await check();
    }
}

async function check(): Promise<void> {
    modal = ViewContext.data.modal;
    modal.hide_errors();

    await check_staff();
    await checkPhone();
    await checkEmail();

    modal.show_errors();
}

async function check_staff(): Promise<void> {
    if (!ViewContext.data.name) {
        modal.add_text_error('У сотрудника не указано имя');
    }

    if (!ViewContext.data.surname) {
        modal.add_text_error('У сотрудника не указана фамилия');
    }

    if (!ViewContext.data.position) {
        modal.add_text_error('У сотрудника отсутствует позиция ШР');
    }

    if (ViewContext.data.position && !ViewContext.data.structural_subdivision) {
        modal.add_text_error('У выбранной позиции ШР отсутствует подразделение.');
    }

    if (ViewContext.data.position && !ViewContext.data.organization) {
        modal.add_text_error('У выбранной позиции ШР отсутствует организация.')
    }

    if (!ViewContext.data.structural_subdivision) {
        modal.add_text_error('У сотрудника не указано подразделение');
    }

    if (!ViewContext.data.organization) {
        modal.add_text_error('У сотрудника не указана организация');
    }

    if (!ViewContext.data.work_start) {
        modal.add_text_error('У сотрудника не указана дата приёма на позицию');
    }

    if (!ViewContext.data.admission_date_organization) {
        modal.add_text_error('У сотрудника не указана дата приёма в организацию');
    }

    if (!ViewContext.data.type_employment) {
        modal.add_text_error('Не выбран вид занятости');
    }

    if (ViewContext.data.personal_data_required == true) {
        if (!ViewContext.data.inn) {
            modal.add_text_error('У сотрудника не указан ИНН');
        }

        if (!ViewContext.data.snils) {
            modal.add_text_error('У сотрудника не указан СНИЛС');
        }

        if (!ViewContext.data.passport_number) {
            modal.add_text_error('У сотрудника не указан номер паспорта');
        }

        if (!ViewContext.data.passport_series) {
            modal.add_text_error('У сотрудника не указана серия паспорта');
        }

        if (!ViewContext.data.date_of_issue) {
            modal.add_text_error('У сотрудника не указана дата выдачи паспорта');
        }

        if (!ViewContext.data.issued_by) {
            modal.add_text_error('У сотрудника не указано кем выдан паспорт');
        }

        if (!ViewContext.data.passport_department_code) {
            modal.add_text_error('У сотрудника не указан код подразделения');
        }

        if (!ViewContext.data.address) {
            modal.add_text_error('У сотрудника не указан адрес');
        }
    }
}

async function checkPhone(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    const phone = ViewContext.data.phone;

    if (phone && phone.tel.length >= 10) {
        const double = await Application.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.phone.eq(phone!),
                f.__id.neq(staff.data.__id)
            ))
            .first()

        if (double) {
            //ViewContext.data.staff = double;
            const ref = new RefItem(double.namespace, double.code, double.id);
            modal.add_link_error('Сотрудник с таким номером телефона уже существует', ref)
        }
    } else {
        modal.add_text_error('У сотрудника не указан номер телефона');
    }
}

async function checkEmail(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    const email = ViewContext.data.email;

    if (email && email.email.length >= 6) {
        const double = await Application.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.email.eq(email!.email),
                f.__id.neq(staff.data.__id)
            ))
            .first()

        if (double) {
            const ref = new RefItem(double.namespace, double.code, double.id);
            modal.add_link_error('Сотрудник с таким email-адресом уже существует', ref)
        }

        if (Context.data.user_already_exists == false) {
            const doubleUser = await System.users.search()
                .where((f, g) => g.and(
                    f.__status.eq(UserStatus.Active),
                    f.email.eq(email!.email)
                ))
                .first()
            if (doubleUser) {
                const ref = new RefItem(doubleUser.namespace, doubleUser.code, doubleUser.id);
                modal.add_link_error('Пользователь с таким email-адресом уже существует', ref)
            }
        }
    } else {
        modal.add_text_error('У сотрудника не указана электронная почта');
    }
}

async function update_fields(): Promise<void> {
    const staff = await Context.data.staff!.fetch();

    // ФИО.
    staff.data.name = ViewContext.data.name;
    staff.data.surname = ViewContext.data.surname;
    staff.data.middlename = ViewContext.data.middlename;

    // Основные данные.
    staff.data.date_of_birth = ViewContext.data.date_of_birth;
    staff.data.address = ViewContext.data.address;
    staff.data.position = ViewContext.data.position;
    staff.data.organization = ViewContext.data.organization;
    staff.data.structural_subdivision = ViewContext.data.structural_subdivision;
    staff.data.phone = ViewContext.data.phone;
    staff.data.email = ViewContext.data.email;
    staff.data.work_start = ViewContext.data.work_start;
    staff.data.employment_type = ViewContext.data.type_employment;

    let employment_row = staff.data.employment_table!.find(f => f.type_employment.code == 'main_workplace');

    if (!employment_row) {
        employment_row = staff.data.employment_table!.insert();
    }

    employment_row.position = ViewContext.data.position!;
    employment_row.organization = ViewContext.data.organization!;
    employment_row.subdivision = ViewContext.data.structural_subdivision!;
    employment_row.admission_date_position = ViewContext.data.work_start!;
    employment_row.type_employment = ViewContext.data.type_employment!;
    employment_row.admission_date_organization = ViewContext.data.admission_date_organization!;

    if (ViewContext.data.personal_data_required == true) {
        // Паспортные данные.
        staff.data.passport_number = ViewContext.data.passport_number;
        staff.data.passport_series = ViewContext.data.passport_series;
        staff.data.passport_department_code = ViewContext.data.passport_department_code;
        staff.data.issued_by = ViewContext.data.issued_by;
        staff.data.date_of_issue = ViewContext.data.date_of_issue;

        // ИНН, СНИЛС.
        staff.data.inn = ViewContext.data.inn;
        staff.data.snils = ViewContext.data.snils;
    }

    await staff.save();
}

declare const console: any;

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();

    const modal: ModalError = ViewContext.data.modal;

    if (modal && modal.error_stack.length > 0) {
        result.addMessage('На форме присутствуют ошибки. Исправьте их.');
    } else {
        await update_fields();
    }

    return result;
}
