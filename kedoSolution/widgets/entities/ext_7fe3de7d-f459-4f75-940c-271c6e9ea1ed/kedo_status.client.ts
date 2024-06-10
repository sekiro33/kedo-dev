/* Client scripts module */

async function onInit(): Promise<void> {
    getKedoStatus();

    if (!Context.data.app) {
        return;
    }

    const app = await Context.data.app.fetch();

    // Подписка на изменение элемента приложения.
    // При изменении элемента обновляем статус КЭДО.
    await System.events.subscribe().onAppItemUpdate(app, getKedoStatus).all();
}

async function getKedoStatus(): Promise<void> {
    if (!Context.data.kedo_status) {
        Context.data.status_data = undefined;
        return;
    }

    const status = await Context.data.kedo_status.fetch();
    const status_style = getStatusStyle(status.data.code ?? "");

    Context.data.status_data = {
        name: status.data.name,
        code: status.data.code,
        ...status_style,
    };
}

/** Временное решение по стилям для статусов */
interface IStatusStyle {
    text_color: string,
    background_color: string,
    border_color: string,
}

function getStatusStyle(status_code: string): IStatusStyle {
    const status_style: IStatusStyle = {
        background_color: "#F0F0F0",
        text_color: "#B0B7BD",
        border_color: "#B0B7BD",
    }

    switch (status_code) {
        case "new":
        case "signing_application":
        case "at_look":
        case "approval":
        case "additional_signing":
        case "need_decision":
        case "signing_consent":
        case "order_prepare":
        case "submit_document":
        case "paper_prepare":
        case "in_progress":
        case "pending":
        case "on_prepare":
        case "signing":
        case "prepare_report":
        case "waiting_confirm":
        case "payment_money":
        case "doc_issuance":
        case "vacation_pay_calculation":
        case "familiarization_local_regulations":
        case "vacation_pay_payment":
        case "staff_doc_signing":
        case "chief_doc_signing":
        case "chief_order_signing":
        case "staff_order_signing": {
            // Желтый статус.
            status_style.background_color = "#FFF1C6";
            status_style.text_color = "#BA8F06";
            status_style.border_color = "#BA8F06";
            break;
        }

        case "making_cancellation":
        case "transfer":
        case "waiting_start":
        case "correction":
        case "at_work":
        case "order_correction": {
            // Синий статус.
            status_style.background_color = "#EDF2FC";
            status_style.text_color = "#5581E4";
            status_style.border_color = "#5581E4";
            break;
        }

        case "withdrawal":
        case "cancelled":
        case "staff_cancelled": {
            // Красный статус.
            status_style.background_color = "#FCEAEA";
            status_style.text_color = "#F88688";
            status_style.border_color = "#F88688";
            break;
        }

        case "paper_signed":
        case "signed":
        case "order_signed":
        case "agreed_signed":
        case "introduction":
        case "completed":
        case "issued": {
            // Зеленый статус.
            status_style.background_color = "#EEF8EF";
            status_style.text_color = "#6BBF7B";
            status_style.border_color = "#6BBF7B";
            break;
        }

        default:
            break;
    }

    return status_style;
}