/* Client scripts module */

async function onInit(): Promise<void> {
    await set_fields();

    if (Context.data.error) {
        ViewContext.data.show_error = true;
    }
}

async function set_fields(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();

        ViewContext.data.phone = [];
        ViewContext.data.email = [];

        ViewContext.data.fio = staff.data.__name;
        ViewContext.data.phone = ViewContext.data.phone.concat(staff.data.phone!)
        ViewContext.data.email = ViewContext.data.email.concat(staff.data.email!);

        ViewContext.data.passport_number = staff.data.passport_number;
        ViewContext.data.passport_series = staff.data.passport_series;
        ViewContext.data.passport_code = staff.data.passport_department_code;
        ViewContext.data.issued_at = staff.data.date_of_issue;
        ViewContext.data.issued_by = staff.data.issued_by;

        ViewContext.data.inn = staff.data.inn;
        ViewContext.data.snils = staff.data.snils;

        ViewContext.data.home_number = staff.data.home;
        ViewContext.data.street = staff.data.street;
        ViewContext.data.city = staff.data.city;
        ViewContext.data.region = staff.data.region;
        ViewContext.data.apartment = staff.data.apartment;

        ViewContext.data.position = staff.data.position;
        ViewContext.data.subdivision = staff.data.structural_subdivision;
        ViewContext.data.organization = staff.data.organization;
    }
}