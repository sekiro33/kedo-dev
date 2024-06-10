/* Client scripts module */

declare const document: any;

interface ILineDetail {
    docTypeName?: string,
    appCode?: string,
    appName?: string,
    printFormID: string,
    skipPrintForm: boolean,
}

async function selectElement(): Promise<void> {
    if (!Context.data.selected_element) {
        return;
    }

    /** Переменная Context.data.selected_element связана с виджетом "Структура решений".
     * При выборе приложения данное поле обновляется и туда записываются данные по выбранному приложенияю.
     */
    Context.data.app_name = Context.data.selected_element.name;
    Context.data.app_code = Context.data.selected_element.code;

    await closeModal();
}

async function openModal(): Promise<void> {
    Context.data.show_modal = true;
}

async function closeModal(): Promise<void> {
    if (!Context.data.app_code) Context.data.selected_element = undefined;
    Context.data.show_modal = false;
}

/** Функция для обмена данными с основной формой через кэш.
 * Вызывается при изменеии полей виджета.
 * cache_guid - уникальный идентификатор для кэша. Нужен для предотвращения коллизий.
 */
async function updateRow(): Promise<void> {
    const cache_guid = Context.data.cache_guid;

    const row_details: ILineDetail = {
        docTypeName: Context.data.doc_type_name,
        appCode: Context.data.app_code,
        appName: Context.data.app_name,
        printFormID: Context.data.print_form_id!,
        skipPrintForm : Context.data.skip_print_form ?? false,
    }

    await System.cache.setItem(`update_line_${cache_guid}`, JSON.stringify(row_details));

    const update_button = document.querySelector(".update-button-trigger");

    if (!update_button) {
        throw new Error("Не удалось обновить информацию в таблице.");
    }

    update_button.querySelector("button").click();
}

async function docTypeNameOnChange(): Promise<void> {
    await updateRow();
}

async function appCodeOnChange(): Promise<void> {
    await updateRow();
}

async function skipPrintFormOnChange(): Promise<void> {
    await updateRow();
}
