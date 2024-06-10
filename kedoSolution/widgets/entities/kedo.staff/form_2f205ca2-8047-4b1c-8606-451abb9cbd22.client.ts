/* Client scripts module */

declare const window: any;
declare const document: any;
declare const console: any;

const BUTTON_NAME = `Доотправить документы`;

const INFOBLOCK_TEXT_INTEGRATION = `
        <div style="padding: 10px">
            <p>Проверьте полученные документы. При необходимости вы можете их заменить или добавить новые.</p>
            <p>Если вы хотите доотправить документы из учетной системы: отправьте печатные формы из учетной системы и выполните действие <b>Доотправить документы</b>.</p>
            <p>Вы можете настроить список полей документов, которые необходимо прикрепить. Для этого перейдите в <a href="${System.getBaseUrl()}/kedo/settings" target="_blank">Меню настроек КЭДО</a> и поменяйте статус необходимых параметров.</p>
        </div>`

const INFOBLOCK_TEXT_ATTACH = `
        <div style="padding: 10px">
            <p>Приложите необходимые для трудоустройства документы.</p>
            <p>Вы можете настроить список полей документов, которые необходимо прикрепить. Для этого перейдите в <a href="${System.getBaseUrl()}/kedo/settings" target="_blank">Меню настроек КЭДО</a> и поменяйте статус необходимых параметров.</p>
        </div>`

async function onInit(): Promise<void> {
    await getKedoSettings();

    // Если идем по ветке ручного прикладывания файлов - скрываем кнпоку повтортного получения печатных форм из 1С.
    if (Context.data.attach_file == true) {
        hideIntegrationButton();
        ViewContext.data.text_infoblock = INFOBLOCK_TEXT_ATTACH;
    } else {
        ViewContext.data.text_infoblock = INFOBLOCK_TEXT_INTEGRATION;
    }
}

function toggleSelection(): void {
    document.querySelector(".modal__main").click();
}

function hideIntegrationButton(): void {
    const modal = document.querySelector('.modal__main');

    if (!modal) {
        window.setTimeout(hideIntegrationButton, 500);
        return;
    }

    const buttons = modal.querySelectorAll('button');

    for (const button of buttons) {
        // При смене названия перехода нужно будет поменять сравниваемое значение
        if (button.textContent && button.textContent.trim() == BUTTON_NAME) {
            // Скрыть родительский div у кнопки.
            // Если не скрывать, то остается лишнее пространство между кнопками.
            button.parentElement.style.display = "none";
            button.style.display = "none";
            return;
        }
    }

    window.setTimeout(hideIntegrationButton, 500);
}

async function getKedoSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const information_about_labor_activity = settings.find(f => f.data.code == "information_about_labor_activity");
    Context.data.information_about_labor_activity_required = information_about_labor_activity ? information_about_labor_activity.data.status : false;

    const admission_order = settings.find(f => f.data.code == "admission_order");
    Context.data.admission_order_required = admission_order ? admission_order.data.status : false;

    const app_employment = settings.find(f => f.data.code == "app_employment");
    Context.data.job_application_required = app_employment ? app_employment.data.status : false;

    // Значение "Требуется согласие на обработку ПДн?" 
    const staff = await Context.data.staff?.fetch();
    Context.data.consent_processing_personal_data_required = (staff && staff.data.consent_processing_pdn) ? staff.data.consent_processing_pdn : false;
}


async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();

    const checkFileLoading = document.querySelector('.file-loading');

    if (checkFileLoading) {
        result.addMessage('Дождитесь окончания загрузки файла(-ов)')
        return result;
    }

    if (ViewContext.data.isTrueTypeDocument == false) {
        result.addMessage('Приложены документы с неккоректными форматами')
        return result;
    }

    return result;
}

async function chechTypeDocument(): Promise<void> {
    if (Context.data.labor_contract_file) {
        const fileName = await Context.data.labor_contract_file.fetch();
        if (fileName.data.__name.endsWith('.pdf') || fileName.data.__name.endsWith('.PDF') || fileName.data.__name.endsWith('.docx') || fileName.data.__name.endsWith('.DOCX') || fileName.data.__name.endsWith('.xlsx') || fileName.data.__name.endsWith('.XLSX')) {
            ViewContext.data.isTrueTypeDocument = true;
        } else {
            ViewContext.data.isTrueTypeDocument = false;
            return
        }
    }
    if (Context.data.admission_order_file) {
        const fileName = await Context.data.admission_order_file.fetch();
        if (fileName.data.__name.endsWith('.pdf') || fileName.data.__name.endsWith('.PDF') || fileName.data.__name.endsWith('.docx') || fileName.data.__name.endsWith('.DOCX') || fileName.data.__name.endsWith('.xlsx') || fileName.data.__name.endsWith('.XLSX')) {
            ViewContext.data.isTrueTypeDocument = true;
        } else {
            ViewContext.data.isTrueTypeDocument = false;
            return
        }
    }
    if (Context.data.information_about_labor_activity_file) {
        const fileName = await Context.data.information_about_labor_activity_file.fetch();
        if (fileName.data.__name.endsWith('.pdf') || fileName.data.__name.endsWith('.PDF') || fileName.data.__name.endsWith('.docx') || fileName.data.__name.endsWith('.DOCX') || fileName.data.__name.endsWith('.xlsx') || fileName.data.__name.endsWith('.XLSX')) {
            ViewContext.data.isTrueTypeDocument = true;
        } else {
            ViewContext.data.isTrueTypeDocument = false;
            return
        }
    }
    if (Context.data.job_application_file) {
        const fileName = await Context.data.job_application_file.fetch();
        if (fileName.data.__name.endsWith('.pdf') || fileName.data.__name.endsWith('.PDF') || fileName.data.__name.endsWith('.docx') || fileName.data.__name.endsWith('.DOCX') || fileName.data.__name.endsWith('.xlsx') || fileName.data.__name.endsWith('.XLSX')) {
            ViewContext.data.isTrueTypeDocument = true;
        } else {
            ViewContext.data.isTrueTypeDocument = false;
            return
        }
    }
    if (Context.data.consent_processing_personal_data_file) {
        const fileName = await Context.data.consent_processing_personal_data_file.fetch();
        if (fileName.data.__name.endsWith('.pdf') || fileName.data.__name.endsWith('.PDF') || fileName.data.__name.endsWith('.docx') || fileName.data.__name.endsWith('.DOCX') || fileName.data.__name.endsWith('.xlsx') || fileName.data.__name.endsWith('.XLSX')) {
            ViewContext.data.isTrueTypeDocument = true;
        } else {
            ViewContext.data.isTrueTypeDocument = false;
            return
        }
    }
    await chechTypeDocumentTable();
}

async function chechTypeDocumentTable(): Promise<void> {
    if (Context.data.additional_agreement_table && Context.data.additional_agreement_table.length > 0) {
        for (let row of Context.data.additional_agreement_table) {
            const fileTableFileName = await row.file.fetch();
            if (fileTableFileName.data.__name.endsWith('.pdf') || fileTableFileName.data.__name.endsWith('.PDF') || fileTableFileName.data.__name.endsWith('.docx') || fileTableFileName.data.__name.endsWith('.DOCX') || fileTableFileName.data.__name.endsWith('.xlsx') || fileTableFileName.data.__name.endsWith('.XLSX')) {
                ViewContext.data.isTrueTypeDocument = true;
            } else {
                ViewContext.data.isTrueTypeDocument = false;
                return
            }
        }
    } 

    if (Context.data.additional_agreement_to_the_contract_table && Context.data.additional_agreement_to_the_contract_table.length > 0) {
        for (let row of Context.data.additional_agreement_to_the_contract_table) {
            const fileTableFileName = await row.file.fetch();
            if (fileTableFileName.data.__name.endsWith('.pdf') || fileTableFileName.data.__name.endsWith('.PDF') || fileTableFileName.data.__name.endsWith('.docx') || fileTableFileName.data.__name.endsWith('.DOCX') || fileTableFileName.data.__name.endsWith('.xlsx') || fileTableFileName.data.__name.endsWith('.XLSX')) {
                ViewContext.data.isTrueTypeDocument = true;
            } else {
                ViewContext.data.isTrueTypeDocument = false;
                return
            }
        }
    } 
}
