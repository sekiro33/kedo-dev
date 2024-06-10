/* Client scripts module */

declare const console : any;

const employment_status = Context.fields.employment_placement.app.fields.__status;

async function onInit(): Promise<void> {
    await staffOnChange();
}

async function staffOnChange(): Promise<void> {
    /**
     * Если поле "Место занятости" является обязательным - то выводим ошибку про сотрудника, и скрываем поле "Место занятости".
     * Если не обязательно - то просто ничего не выводим.
     */
    if (!Context.data.staff) {
        Context.data.employment_placement_visible = false;
        Context.data.error_visible = Context.data.employment_placement_required;
        return;
    }

    await getEmploymentPlacement();
}

async function getEmploymentPlacement(): Promise<void> {
    Context.data.employment_placement_visible = true;
    Context.data.error_visible = false;

    Context.fields.employment_placement.data.setFilter((f, c, g) => g.and(
        f.__deletedAt.eq(null),
        f.__status.eq(employment_status.variants.actual),
        f.staff.link(Context.data.staff!)
    ));

    const staff_employment = await Context.fields.employment_placement.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__status.eq(employment_status.variants.actual),
            f.staff.link(Context.data.staff!),
        ))
        .size(100)
        .all();

    if (staff_employment.length == 0) {
        Context.data.employment_placement = undefined;
        return;
    }

    /** Задаем по умолчанию основное место работы сотрудника.
     * Иначе первое попвашееся место работы.
     */
    const main_workplace = staff_employment.find(f => f.data.type_employment?.code == "main_workplace");
    Context.data.employment_placement = main_workplace ?? (staff_employment.length > 0 ? staff_employment[0] : undefined);
}