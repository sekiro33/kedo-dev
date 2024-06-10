/* Client scripts module */

interface ILineDetail {
    docTypeName?: string,
    appCode?: string,
    appName?: string,
    printFormID: string,
    skipPrintForm: boolean,
}

async function onInit(): Promise<void> {

    /**
     * Формируем GUID для корректного обмена данными с виджетом через кэш.
     * Нужен чтобы не было коллизий при одновременном обмене на разных задачах.
     */
    ViewContext.data.cache_guid = uuidv4();
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

/** Функция привязанная к скрытой кнопке (update_button (hidden)) на форме задачи.
 * Из виджета мы вызываем событие нажатия по кнопке на форме текущей задачи.
 */
async function updateTable(): Promise<void> {
    const cache = await System.cache.getItem(`update_line_${ViewContext.data.cache_guid}`);

    /**
     * Получаем данные из виджета через кэш и заполняем таблицу.
     * В качестве ключа для поиска используем ID печатной формы (уникален для каждой строки в рамках таблицы).
     */
    if (cache) {
        const line_detail: ILineDetail = JSON.parse(cache);

        const row = Context.data.unknown_doc_types?.find(f => f.print_form_id == line_detail.printFormID);

        if (!row) {
            return;
        }

        if (line_detail.appCode) row.app_code = line_detail.appCode;
        if (line_detail.docTypeName) row.doc_type_name = line_detail.docTypeName;
        if (line_detail.appName) row.app_name = line_detail.appName;
        if (line_detail.skipPrintForm) row.skip_print_form = line_detail.skipPrintForm;
    }
}

async function validation(): Promise<ValidationResult> {
    const result: ValidationResult = new ValidationResult();

    /**
     * Вызываем обновление таблицы на форме только в момент нажития на кнопку перехода.
     * Нужно чтобы избавиться от постоянных подергиваний таблицы во время редактирования её полей.
     */
    Context.data.unknown_doc_types = Context.data.unknown_doc_types;
    const table = Context.data.unknown_doc_types;
    const active_rows = table?.filter(f => f.skip_print_form == false);

    if (active_rows?.some(f => !f.app_code)) {
        result.addMessage("Для каждой печатной формы должен быть выбран документ ELMA");
    }

    if (active_rows?.some(f => !f.doc_type_name)) {
        result.addMessage("Для каждой печатной формы необходимо указать название");
    }

    return result;
}