/* Client scripts module */
async function onInit(): Promise <void> {
    const type_documents = await Context.fields.additional_personal_documents.fields.document_type.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    for (let item of type_documents) {
        if (item.data.required == true && item.data.required_for_candidate == false) {
            const row = Context.data.additional_personal_documents!.insert();
            row.document_type = item;
        }
    }
    Context.data.additional_personal_documents = Context.data.additional_personal_documents

    await add_employment_row()
}

/** Создание новой строки в таблице занятости. */
async function add_employment_row(): Promise<void> {
    const id = calculate_line_number();

    const row = Context.data.employment_table!.insert();

    row.id = id;
    row.position = Context.data.position!;
    row.admission_date_organization = Context.data.possible_date_employment!;
    row.admission_date_position = Context.data.possible_date_employment!;

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

/** Событие, вызываемое при изменении таблицы занятости. */
async function employment_table_onchange(): Promise<void> {

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