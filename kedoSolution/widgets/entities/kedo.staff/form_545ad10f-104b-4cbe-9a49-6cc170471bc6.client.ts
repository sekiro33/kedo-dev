/* Client scripts module */

declare const console: any;
declare const document: any;

async function onInit(): Promise<void> {
    // Проверка - требуется ли заявление на трудоустройство?
    // Если заявление уже создано и подписано, прикреплять не нужно.
    const job_application = !!Context.data.job_application;
    ViewContext.data.job_application_required = !job_application && Context.data.app_employment;
    ViewContext.data.istruetypedocument = true;
}

async function additional_agreement_table_onchange(): Promise<void> {
    await chechTypeDocument()
    const additional_agreement_table = Context.data.additional_contract_table!;

    for (let i = additional_agreement_table.length - 1; i >= 0; i--) {
        const row = additional_agreement_table[i];

        if (row.file && !row.view_file) {
            const file = await row.file.fetch();
            const new_file = await Context.fields.additional_contract_table.fields.file.createFromLink(file.data.__name, await file.getDownloadUrl());
            row.view_file = new_file;
        }

        if (!row.file && row.view_file) {
            row.view_file = undefined!;
        }
    }

    if (JSON.stringify((Context.data.additional_contract_table as any).json()) !== ViewContext.data.additional_agreement_table_string) {
        ViewContext.data.additional_agreement_table_string = JSON.stringify((Context.data.additional_contract_table as any).json());
        Context.data.additional_contract_table = Context.data.additional_contract_table;
    }
    
}

async function other_documents_table_onchange(): Promise<void> {
    await chechTypeDocument()
    const other_documents_tabel = Context.data.other_docs!;

    for (let i = other_documents_tabel.length - 1; i >= 0; i--) {
        const row = other_documents_tabel[i];

        if (row.doc_file && !row.view_file) {
            const file = await row.doc_file.fetch();
            const new_file = await Context.fields.other_docs.fields.doc_file.createFromLink(file.data.__name, await file.getDownloadUrl());
            row.view_file = new_file;
        }

        if (!row.doc_file && row.view_file) {
            row.view_file = undefined!;
        }
    }

    if (JSON.stringify((Context.data.other_docs as any).json()) !== ViewContext.data.other_docs_table_string) {
        ViewContext.data.other_docs_table_string = JSON.stringify((Context.data.other_docs as any).json());
        Context.data.other_docs = Context.data.other_docs;
    }
    
}

function get_file_extension(filename: string) {
    const ext = /^.+\.([^.]+)$/.exec(filename);
    return ext == null ? "" : ext[1];
}

async function labor_contract_onchange(): Promise<void> {
    if (Context.data.file_labor_contract) {
        const file = await Context.data.file_labor_contract.fetch();
        const ext = get_file_extension(file.data.__name);

        if (ext == "" || ext == 'pdf') {
            Context.data.file_labor_contract = undefined;
        }
    }
    await chechTypeDocument()
}

async function admission_order_onchange(): Promise<void> {
    if (Context.data.file_admission_order) {
        const file = await Context.data.file_admission_order.fetch();
        const ext = get_file_extension(file.data.__name);

        if (ext == "" || ext == 'pdf') {
            Context.data.file_admission_order = undefined;
        }
    }
    await chechTypeDocument()
}

async function job_application_onchange(): Promise<void> {
    if (Context.data.file_job_application) {
        const file = await Context.data.file_job_application.fetch();
        const ext = get_file_extension(file.data.__name);

        if (ext == "" || ext == 'pdf') {
            Context.data.file_job_application = undefined;
        }
    }
    await chechTypeDocument()
}

async function information_about_labor_activity_onchange(): Promise<void> {
    if (Context.data.file_information_about_labor_activity) {
        const file = await Context.data.file_information_about_labor_activity.fetch();
        const ext = get_file_extension(file.data.__name);

        if (ext == "" || ext == 'pdf') {
            Context.data.file_information_about_labor_activity = undefined;
        }
    }
    await chechTypeDocument()
}

async function consent_processing_personal_data_onchange(): Promise<void> {
    if (Context.data.consent_processing_personal_data_file) {
        const file = await Context.data.consent_processing_personal_data_file.fetch();
        const ext = get_file_extension(file.data.__name);

        if (ext == "" || ext == 'pdf') {
            Context.data.consent_processing_personal_data_file = undefined;
        }
    }
    await chechTypeDocument()
}

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();
    const checkFileLoading = document.querySelector('.file-loading');
    if (checkFileLoading) {
        result.addMessage('Дождитесь окончания загрузки файла(-ов)')
        return result;
    }
    if (ViewContext.data.istruetypedocument == false) {
        result.addMessage('Приложены документы с неккоректными форматами')
        return result;
    }
    return result;
}



async function chechTypeDocument(): Promise<void> {
    if (Context.data.file_labor_contract) {
        const fileName = await Context.data.file_labor_contract.fetch();
        if (fileName.data.__name.includes('.docx') || fileName.data.__name.includes('.DOCX') || fileName.data.__name.includes('.xlsx') || fileName.data.__name.includes('.XLSX')) {
            ViewContext.data.istruetypedocument = true;
        } else {
            ViewContext.data.istruetypedocument = false;
            return
        }
    }
    if (Context.data.file_admission_order) {
        const fileName = await Context.data.file_admission_order.fetch();
        if (fileName.data.__name.includes('.docx') || fileName.data.__name.includes('.DOCX') || fileName.data.__name.includes('.xlsx') || fileName.data.__name.includes('.XLSX')) {
            ViewContext.data.istruetypedocument = true;
        } else {
            ViewContext.data.istruetypedocument = false;
            return
        }
    }
    if (Context.data.file_information_about_labor_activity) {
        const fileName = await Context.data.file_information_about_labor_activity.fetch();
        if (fileName.data.__name.includes('.docx') || fileName.data.__name.includes('.DOCX') || fileName.data.__name.includes('.xlsx') || fileName.data.__name.includes('.XLSX')) {
            ViewContext.data.istruetypedocument = true;
        } else {
            ViewContext.data.istruetypedocument = false;
            return
        }
    }
    if (Context.data.file_job_application) {
        const fileName = await Context.data.file_job_application.fetch();
        if (fileName.data.__name.includes('.docx') || fileName.data.__name.includes('.DOCX') || fileName.data.__name.includes('.xlsx') || fileName.data.__name.includes('.XLSX')) {
            ViewContext.data.istruetypedocument = true;
        } else {
            ViewContext.data.istruetypedocument = false;
            return
        }
    }
    if (Context.data.consent_processing_personal_data_file) {
        const fileName = await Context.data.consent_processing_personal_data_file.fetch();
        if (fileName.data.__name.includes('.docx') || fileName.data.__name.includes('.DOCX') || fileName.data.__name.includes('.xlsx') || fileName.data.__name.includes('.XLSX')) {
            ViewContext.data.istruetypedocument = true;
        } else {
            ViewContext.data.istruetypedocument = false;
            return
        }
    }
    await chechTypeDocumentTable()
    console.log(ViewContext.data.istruetypedocument)
}

async function chechTypeDocumentTable(): Promise<void> {
    if (Context.data.other_docs) {
        for (let row of Context.data.other_docs) {
            const fileTableFileName = await row.doc_file.fetch();
            if (fileTableFileName.data.__name.includes('.docx') || fileTableFileName.data.__name.includes('.DOCX') || fileTableFileName.data.__name.includes('.xlsx') || fileTableFileName.data.__name.includes('.XLSX')) {
                ViewContext.data.istruetypedocument = true;
            } else {
                ViewContext.data.istruetypedocument = false;
                return
            }
        }
    }

    if (Context.data.additional_contract_table) {
        for (let row of Context.data.additional_contract_table) {
            const fileTableFileName = await row.file.fetch();
            if (fileTableFileName.data.__name.includes('.docx') || fileTableFileName.data.__name.includes('.DOCX') || fileTableFileName.data.__name.includes('.xlsx') || fileTableFileName.data.__name.includes('.XLSX')) {
                ViewContext.data.istruetypedocument = true;
            } else {
                ViewContext.data.istruetypedocument = false;
                return
            }
        }
    }
}