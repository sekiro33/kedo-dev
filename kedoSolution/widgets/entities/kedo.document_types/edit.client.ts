/* Client scripts module */

declare const notify: any;

interface ISelectedElement {
    namespace: string,
    code: string,
    name?: string,
}

function error(message: string): void {
    notify({
        message: message,
        color: "danger",
        timeout: 5000,
    });
}

async function onInit(): Promise<void> {
    if (Context.data.app_namespace && Context.data.app_code) {
        const selected_element: ISelectedElement = {
            namespace: Context.data.app_namespace,
            code: Context.data.app_code,
        };

        ViewContext.data.selected_element = selected_element;
    }
}

async function selectElement(): Promise<void> {
    if (!ViewContext.data.selected_element) {
        error("Документ не выбран")
        return;
    }

    /** Переменная ViewContext.data.selected_element связана с виджетом "Структура решений".
     * При выборе приложения данное поле обновляется и туда записываются данные по выбранному приложенияю.
     */
    const selected_element: ISelectedElement = ViewContext.data.selected_element;

    ViewContext.data.app_name = selected_element.name;
    Context.data.app_code = selected_element.code;
    Context.data.app_namespace = selected_element.namespace;

    await closeModal();
}

async function openModal(): Promise<void> {
    ViewContext.data.show_modal_window = true;
}

async function closeModal(): Promise<void> {
    if (!Context.data.app_code) ViewContext.data.selected_element = undefined;
    ViewContext.data.show_modal_window = false;
}

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();

    if (!Context.data.app_code && !Context.data.app_namespace) {
        result.addMessage("Укажите соответствующее виду документа приложение ELMA365");
    }

    return result;
}
