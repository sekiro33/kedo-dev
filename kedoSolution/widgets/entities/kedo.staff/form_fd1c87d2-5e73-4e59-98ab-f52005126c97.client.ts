/* Client scripts module */

declare const document: any;
declare const window: any;

const INFOBLOCK_TEXT_INTEGRATION = `
        <div style="padding: 10px">
            <p>Проверьте полученные документы. При необходимости вы можете их заменить или добавить новые.</p>
            <p>Если вы хотите доотправить документы из учетной системы: отправьте печатные формы из учетной системы и выполните действие <b>Повторно получить печатные формы</b>.</p>
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
        ViewContext.data.infoblock_text = INFOBLOCK_TEXT_ATTACH;
    } else {
        ViewContext.data.infoblock_text = INFOBLOCK_TEXT_INTEGRATION;
    }
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
        if (button.textContent && button.textContent.trim() == "Повторно получить печатные формы") {
            button.style.display = "none"
        }
    }
}

async function getKedoSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const information_about_labor_activity = settings.find(f => f.data.code == "information_about_labor_activity");
    Context.data.information_about_labor_activity_required = information_about_labor_activity ? information_about_labor_activity.data.status : false;

    const admission_order = settings.find(f => f.data.code == "admission_order");
    Context.data.admission_order_required = admission_order ? admission_order.data.status : false;

    const app_employment = settings.find(f => f.data.code == "app_employment");
    Context.data.job_application_required = app_employment ? app_employment.data.status : false;

    Context.data.consent_processing_personal_data_required = true;
}
