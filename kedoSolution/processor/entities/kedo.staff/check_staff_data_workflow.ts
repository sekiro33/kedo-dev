/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
type EmployeesCategory = ApplicationItem<Application$kedo$employees_categories$Data, Application$kedo$employees_categories$Params>;

/** Проверка категорий сотрудника. */
async function checkStaffCategory(): Promise<void> {
    const codes: string[] = [
        "employee_category"
    ];

    const settings = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.in(codes)
        ))
        .size(codes.length)
        .all();

    // Категория сотрудника по умолчанию.
    const employee_category = settings.find(f => f.data.code == "employee_category");

    /** Наверное ещё стоит рассмотреть кейс, когда настройка есть, а значения в ней нет. */
    if (!employee_category) {
        throw new Error("Не найдена категория по умолчанию. Выполните первичную настройку решения.");
    }

    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined");
    }

    const staff = await Context.data.staff.fetch();

    if (!staff.data.staff_categories || staff.data.staff_categories.length == 0) {
        const default_category = employee_category.data.feature;
        const ref_default_category = new RefItem<EmployeesCategory>("kedo", "employees_categories", default_category!.id);
        const item = await ref_default_category.fetch();

        // Таблица может быть пустой или undefined
        // Поэтому для подстраховки создаем новый экземпляр таблицы.
        staff.data.categories_table = staff.fields.categories_table.create();

        const row = staff.data.categories_table.insert();
        row.staff_categories = item;
        row.assignment_date = new TDate();
    }

    await staff.save();
}

async function setStaffFIO(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Не указан сотрудник. Context.data.staff is undefined");
    }

    const staff = await Context.data.staff.fetch();

    // Заполняем ФИО сотрудника.
    staff.data.full_name = {
        firstname: staff.data.name ?? '',
        lastname: staff.data.surname ?? '',
        middlename: staff.data.middlename ?? '',
    };

    await staff.save();
}

/** Проверка заполненность полей сотрудника. */
async function checkStaffFields(): Promise<boolean> {
    if (!Context.data.staff) {
        throw new Error("Не указан сотрудник. Context.data.staff is undefined");
    }

    const personal_data_employee = Context.data.personal_data_employee;

    const staff = await Context.data.staff.fetch();

    const main_fields =
        !staff.data.name ||
        !staff.data.surname ||
        !staff.data.full_name ||
        !staff.data.phone ||
        ((staff.data.notification?.code == "email" || staff.data.notification?.code == "email_and_sms") && !staff.data.email) ||
        !staff.data.employment_table ||
        staff.data.employment_table.length == 0;

    /** Если личные данные заполняет не сотрудник, то проверяем ещё и их. */
    const personal_data =
        !staff.data.inn ||
        !staff.data.snils ||
        !staff.data.passport_number ||
        !staff.data.passport_series ||
        !staff.data.date_of_issue ||
        !staff.data.issued_by ||
        !staff.data.passport_department_code ||
        !staff.data.home ||
        !staff.data.city ||
        !staff.data.street;

    if (main_fields || (personal_data_employee === false && personal_data)) {
        return false;
    }

    return true;
}

async function setAddress(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Не указан сотрудник. Context.data.staff is undefined");
    }

    const staff = await Context.data.staff.fetch();

    const region_app = await staff.data.directory_of_regions?.fetch();

    // Записываем адрес сотрудника.
    const region = region_app ? `${region_app.data.__name},` : ``;
    const housing = staff.data.housing ? ` к.${staff.data.housing}` : ``;
    const apartment = staff.data.apartment ? ` кв.${staff.data.apartment}` : ``;

    staff.data.address = `${region} г. ${staff.data.city}, ул. ${staff.data.street}, д.${staff.data.home}${housing}${apartment}`.trim();

    await staff.save();
}
