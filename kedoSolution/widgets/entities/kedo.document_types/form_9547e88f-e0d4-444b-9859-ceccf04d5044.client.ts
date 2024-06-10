/* Client scripts module */

declare const document: any;
declare const window: any;
declare const console: any;

let selectNodeButton: any;

interface ITable {
    printFormURL?: string,
    fileName?: string,
    printFormID?: string,
    printFormName?: string,
    documentCode?: string,
}

async function onInit(): Promise<void> {
    await fill_table();

    if (ViewContext.data.table && ViewContext.data.table.length == 0) {
        ViewContext.data.show_infoblock = true;
        return;
    }

    searchButtons();
}

function searchButtons(): void {
    const buttons = document.querySelector(".custom-buttons");

    if (!buttons) {
        window.setTimeout(searchButtons, 500);
        return;
    }

    selectNodeButton = buttons.querySelector(".custom_select_node").querySelector("button");
}

function set_document_type(td: any): void {
    ViewContext.data.row_index = td.parentNode.parentNode.rowIndex;

    const td_app = [...document.querySelectorAll('.document-code')].find(f => f.parentNode.rowIndex == ViewContext.data.row_index!);

    ViewContext.data.selected_element = undefined;

    if (td_app.getAttribute("code")) {
        ViewContext.data.selected_element = {
            name: td_app.innerHTML,
            code: td_app.getAttribute("code"),
            namespace: td_app.getAttribute("namespace"),
        }
    }

    selectNodeButton?.click();

    ViewContext.data.show_modal = true;
}

async function close_modal(): Promise<void> {
    ViewContext.data.selected_element = undefined;
    ViewContext.data.show_modal = false;
}

async function set_choice(): Promise<void> {
    ViewContext.data.show_error = false;

    if (!ViewContext.data.selected_element) {
        ViewContext.data.show_error = true;
    }

    const td = [...document.querySelectorAll('.document-code')].find(f => f.parentNode.rowIndex == ViewContext.data.row_index!);
    td.innerHTML = ViewContext.data.selected_element.name;
    td.setAttribute('code', ViewContext.data.selected_element.code);
    td.setAttribute('namespace', ViewContext.data.selected_element.namespace);

    ViewContext.data.show_modal = false;
}

async function fill_table(): Promise<void> {
    const table = Context.data.unknown_print_forms_table!;

    const customTable: ITable[] = [];

    const doc_types = await Context.fields.document_types.app.search().where(f => f.__deletedAt.eq(null)).size(1000).all();

    for (const row of table) {
        const doc_type_1c = doc_types.find(f => f.data.doc_type_id_1c == row.print_form_id);

        if (doc_type_1c) {
            continue;
        }

        const file = await row.print_form.fetch();

        const customRow: ITable = {
            printFormURL: `./(p:preview/${file.id}/readonly)`,
            fileName: file.data.__name,
            printFormID: row.print_form_id,
            printFormName: "",
            documentCode: "",
        }

        customTable.push(customRow);
    }

    ViewContext.data.table = customTable;
}

function validate_table(): boolean {
    const table_data: ITable[] = ViewContext.data.table;

    if (table_data.length == 0) {
        return true;
    }

    const rows = [...document.querySelector('.doc-types-table').querySelector('tbody').querySelectorAll('tr')];

    for (let i = 0; i < table_data.length; i++) {
        const row = rows[i];
        const code = row.querySelector('.document-code').getAttribute('code');
        const name = row.querySelector('.document-name').querySelector('input').value;

        table_data[i].documentCode = code;
        table_data[i].printFormName = name;
    }

    for (const row of table_data) {
        if (!row.documentCode || !row.printFormName) {
            return false;
        }
    }

    const table = Context.data.unknown_print_forms_table!;

    for (let i = 0; i < table_data.length; i++) {
        const row = table.find(f => f.print_form_id == table_data[i].printFormID)!;

        row.app_code = table_data[i].documentCode!;
        row.doc_type_name = table_data[i].printFormName!;
    }

    Context.data.unknown_print_forms_table = Context.data.unknown_print_forms_table;

    return true;
}

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();

    if (!validate_table()) {
        result.addMessage('Заполните все доступные поля в таблице: введите названия вида документа и выберите его тип.');
    }

    return result;
}
