/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface IStatus {
    name: string,
    code: string,
}

const STATUSES: IStatus[] = [
    {
        name: "В процессе оформления",
        code: "pending",
    },
    {
        name: "В процессе",
        code: "in_progress",
    },
    {
        name: "На корректировке",
        code: "correction",
    },
    {
        name: "Отменено",
        code: "cancelled",
    },
    {
        name: "Оформлено",
        code: "issued",
    },
    {
        name: "Новая",
        code: "new",
    },
    {
        name: "На подписании",
        code: "signing",
    },
    {
        name: "На согласовании",
        code: "approval",
    },
    {
        name: "На доп. подписании",
        code: "additional_signing",
    },
    {
        name: "Отказ сотрудника",
        code: "staff_cancelled",
    },
    {
        name: "Подготовка приказа",
        code: "order_prepare",
    },
    {
        name: "Подписание сотрудником",
        code: "staff_order_signing",
    },
    {
        name: "Подписание работодателем",
        code: "chief_order_signing",
    },
    {
        name: "Приказ подписан",
        code: "order_signed",
    },
    {
        name: "Приказ на корректировке",
        code: "order_correction",
    },
    {
        name: "На принятии решения",
        code: "need_decision",
    },
    {
        name: "Подписан на бумаге",
        code: "paper_signed",
    },
    {
        name: "Оформление на бумаге",
        code: "paper_prepare",
    },
    {
        name: "Оформление переноса",
        code: "transfer",
    },
    {
        name: "Отзыв заявления",
        code: "withdrawal",
    },
    {
        name : "На подготовке",
        code : "on_prepare",
    },
    {
        name : "Согласовано / подписано",
        code : "agreed_signed",
    },
    {
        name : "Завершен(-а)",
        code : "completed",
    },
    {
        name : "Подписан",
        code : "signed",
    },
    {
        name : "Ознакомление с ЛНА",
        code : "familiarization_local_regulations",
    },
    {
        name : "На подписании заявления",
        code : "signing_application",
    },
    {
        name : "Оформление отмены",
        code : "making_cancellation",
    },
    {
        name : "На подписании согласия",
        code : "signing_consent",
    },
    {
        name: "Подписание документа сотрудником",
        code: "staff_doc_signing",
    },
    {
        name: "Подписание документа работодателем",
        code: "chief_doc_signing",
    },
    {
        name: "В работе",
        code: "at_work",
    },
    {
        name: "Выдача документа",
        code: "doc_issuance",
    },
    {
        name: "На ознакомлении",
        code: "at_look",
    },
    {
        name: "Выплата начислений",
        code: "payment_money",
    },
    {
        name: "Ожидание подтверждения",
        code: "waiting_confirm", 
    },
    {
        name: "Ознакомлен",
        code: "introduction", 
    },
    {
        name: "Требуется передать документ",
        code: "submit_document",
    },
    {
        name: "Ожидание начала",
        code: "waiting_start",
    },
    {
        name : "Подготовка отчета",
        code : "prepare_report",
    },
    {
        name: "Расчет отпускных",
        code: "vacation_pay_calculation",
    },
    {
        name : "Выплата отпускных",
        code : "vacation_pay_payment",
    },
];

async function fill_defaul_statuses(): Promise<void> {
    let promises: Promise<void>[] = [];

    const created_apps = await Context.fields.statuses.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    for (const status of STATUSES) {
        let app = created_apps.find(f => f.data.code == status.code);

        if (!app) {
            app = Context.fields.statuses.app.create();
        }

        app.data.name = status.name;
        app.data.code = status.code;

        promises.push(app.save());
    }

    await Promise.all(promises);
}