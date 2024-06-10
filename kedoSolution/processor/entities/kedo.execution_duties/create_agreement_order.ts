/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function getLaborNumber(): Promise<void> {

    let app = await Context.data.execution_duties!.fetch();
    if (app) {
        Context.data.start_date_string = app.data.start_date!.format('DD.MM.YYYY');
        Context.data.end_date_string = app.data.end_date!.format('DD.MM.YYYY');

        if (app.data.type_combination) {
            const app_code = await app.data.type_combination.fetch();

            Context.data.type_code = app_code.data.code;
        }
    }

    if (app.data.inf_about_acting && app.data.inf_about_acting.length > 0) {
        let row = app.data.inf_about_acting!.find(f => f.substitute.id === Context.data.substitute_staff!.id);
        Context.data.procent = row?.percent;
        Context.data.type_surcharge_code = row?.type_surcharge.code.toString();
    }
    let staff = await Context.data.execution_staff!.fetch();
    let doc = await Context.fields.labor_contract.app.search().where(f => f.staff.link(staff)).first();
    if (doc) {
        Context.data.labor_contract = doc;
        Context.data.contract_date = doc.data.__createdAt.getDate();
    }
}

// Получаем настройки КЭДО.
async function checkSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    // Альтернативная интеграция с 1С.
    const integration_1c = settings.find(f => f.data.code == 'integration_1c');
    Context.data.use_alternative_integration = integration_1c ? integration_1c.data.status : false;

    const head_signing_notification = await Context.fields.kedo_settings.app.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.code.eq('head_signing_notification')
    ))
    .first();
  Context.data.head_signing_notification = head_signing_notification ? head_signing_notification.data.status : false;
}

async function check_kedo_agreement(): Promise<boolean> {
    let staff = await Context.data.substitute_staff!.fetch();
    if (staff.data.kedo_agreement === true) {
        const order = await Context.data.order_execution_responsibilities!.fetch();
        order.data.view_sign = true;
        await order.save();
        const agreement = await Context.data.execution_duties_additional_agreement!.fetch();
        agreement.data.view_sign = true;
        await agreement.save()
        
        return true;
    }
    else {
        return false;
    }
}

async function additional_set_line_status(): Promise<void> {
    const app = await Context.data.execution_duties_additional_agreement!.fetch();
    app.data.line_status = `${app.data.__status!.code};${app.data.__status!.name}`;
    await app.save()
}

async function order_set_line_status(): Promise<void> {
    const app = await Context.data.order_execution_responsibilities!.fetch();
    app.data.line_status = `${app.data.__status!.code};${app.data.__status!.name}`;
    await app.save()
}

async function createStatusObj(app: any, status: string): Promise<void> {
    const obj_status = {
        'app': {
            'namespace': app.namespace,
            'code': app.code,
            'id': app.id,
        },
        'status': status,
    }
    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function createAdditionalStatusObj(app: any, status: string): Promise<void> {
    const obj_status = {
        'app': {
            'namespace': app.namespace,
            'code': app.code,
            'id': app.id,
        },
        'status': status,
    }
    Context.data.kedo_status_additional_agreement = JSON.stringify(obj_status);
}


//заявка
async function createStatusAppChiefDocSigning(): Promise<void> {
    createStatusObj(Context.data.execution_duties, 'chief_doc_signing');
}
async function createStatusAppPaperPrepare(): Promise<void> {
    createStatusObj(Context.data.execution_duties, 'paper_prepare');
}
async function createStatusAppStaffDocSigning(): Promise<void> {
    createStatusObj(Context.data.execution_duties, 'staff_doc_signing');
}
async function createStatusAppPaperSigned(): Promise<void> {
    createStatusObj(Context.data.execution_duties, 'paper_signed');
}
async function createStatusAppOrderSigned(): Promise<void> {
    createStatusObj(Context.data.execution_duties, 'order_signed');
}
async function createStatusAppOrderPrepare(): Promise<void> {
    createStatusObj(Context.data.execution_duties, 'order_prepare');
}

// дополнительно по сценарию доп. соглашения
async function createStatusAppAdditionalChiefDocSigning(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties, 'chief_doc_signing');
}
async function createStatusAppAdditionalPaperPrepare(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties, 'paper_prepare');
}
async function createStatusAppAdditionalStaffDocSigning(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties, 'staff_doc_signing');
}
async function createStatusAppAdditionalPaperSigned(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties, 'paper_signed');
}
async function createStatusAppAdditionalOrderSigned(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties, 'order_signed');
}


// приказ
async function createStatusChiefOrderSigning(): Promise<void> {
    createStatusObj(Context.data.order_execution_responsibilities, 'chief_order_signing');
}
async function createStatusPaperPrepare(): Promise<void> {
    createStatusObj(Context.data.order_execution_responsibilities, 'paper_prepare');
}
async function createStatusStaffOrderSigning(): Promise<void> {
    createStatusObj(Context.data.order_execution_responsibilities, 'staff_order_signing');
}
async function createStatusPaperSigned(): Promise<void> {
    createStatusObj(Context.data.order_execution_responsibilities, 'paper_signed');
}
async function createStatusSigned(): Promise<void> {
    createStatusObj(Context.data.order_execution_responsibilities, 'signed');
}


//доп. соглашение
async function createStatusChiefAdditionalOrderSigning(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties_additional_agreement, 'chief_order_signing');
}
async function createStatusAdditionalPaperPrepare(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties_additional_agreement, 'paper_prepare');
}
async function createStatusStaffAdditionalOrderSigning(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties_additional_agreement, 'staff_order_signing');
}
async function createStatusAdditionalPaperSigned(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties_additional_agreement, 'paper_signed');
}
async function createStatusAdditionalSigned(): Promise<void> {
    createAdditionalStatusObj(Context.data.execution_duties_additional_agreement, 'signed');
}

async function getSigners(): Promise<void> {
    const kedo_settings = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('head_signing_notification')
        ))
        .first();
    Context.data.head_signing_notification = kedo_settings ? kedo_settings.data.status : false;

    const execution_duties = await Context.data.execution_duties!.fetch();
    const staff = await execution_duties.data.initiator?.fetch();
    const organization_staff = await staff?.data.organization?.fetch();
    Context.data.signers_app = organization_staff?.data.signatories;
}


// async function setStatusOrderSigning(): Promise<void> {
//     if (!Context.data.order_execution_responsibilities) {
//         throw new Error("Context.data.order_execution_responsibilities is undefined");
//     }

//     const obj_status = {
//         app: {
//             namespace: Context.data.order_execution_responsibilities.namespace,
//             code: Context.data.order_execution_responsibilities.code,
//             id: Context.data.order_execution_responsibilities.id,
//         },
//         status: "signing",
//     };

//     Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function setStatusAdditionalAgreementSigning(): Promise<void> {
//     if (!Context.data.execution_duties_additional_agreement) {
//         throw new Error("Context.data.execution_duties_additional_agreement is undefined");
//     }

//     const obj_status = {
//         app: {
//             namespace: Context.data.execution_duties_additional_agreement.namespace,
//             code: Context.data.execution_duties_additional_agreement.code,
//             id: Context.data.execution_duties_additional_agreement.id,
//         },
//         status: "signing",
//     };

//     Context.data.kedo_status_additional_agreement = JSON.stringify(obj_status);
// }

// async function setStatusOrderSigned(): Promise<void> {
//     if (!Context.data.order_execution_responsibilities) {
//         throw new Error("Context.data.order_execution_responsibilities is undefined");
//     }

//     const obj_status = {
//         app: {
//             namespace: Context.data.order_execution_responsibilities.namespace,
//             code: Context.data.order_execution_responsibilities.code,
//             id: Context.data.order_execution_responsibilities.id,
//         },
//         status: "signed",
//     };

//     Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function setStatusAdditionalAgreementSigned(): Promise<void> {
//     if (!Context.data.execution_duties_additional_agreement) {
//         throw new Error("Context.data.execution_duties_additional_agreement is undefined");
//     }

//     const obj_status = {
//         app: {
//             namespace: Context.data.execution_duties_additional_agreement.namespace,
//             code: Context.data.execution_duties_additional_agreement.code,
//             id: Context.data.execution_duties_additional_agreement.id,
//         },
//         status: "signed",
//     };

//     Context.data.kedo_status_additional_agreement = JSON.stringify(obj_status);
// }

//Проверяем не было ли отказа от подписания, если нет, то складываем документы для подписания в одну переменную 
async function checkReject(): Promise<boolean> {
    const app = await Context.data.execution_duties!.fetch();
    if (!app.data.order_signed || !app.data.agreement_signed) {
        app.data.combination_carried_out = false;
        await app.save()
        return true
    } else {
        Context.data.documents = [];
        Context.data.documents.push(Context.data.order_execution_responsibilities!);
        Context.data.documents.push(Context.data.execution_duties_additional_agreement!);
        Context.data.documents = Context.data.documents;
        return false
    }
}

//В таблице с информацией о замещающих ставим отметку о подписании
async function setMarkSigned(): Promise<void> {
    const app = await Context.data.execution_duties!.fetch();
    if (app.data.inf_about_acting && Context.data.substitute_staff) {
        const row = app.data.inf_about_acting.find(row => row.substitute.id == Context.data.substitute_staff!.id);
        if (row) {
            row.doc_signed = true;
            await app.save()
        }
    }
}

//Записываем документы в таблицу с информацией о замещающих
async function setDocuments(): Promise<void> {
    const app = await Context.data.execution_duties!.fetch();
    if (app.data.inf_about_acting && Context.data.substitute_staff) {
        const row = app.data.inf_about_acting.find(row => row.substitute.id == Context.data.substitute_staff!.id);
        if (row) {
            row.order = Context.data.order_execution_responsibilities!;
            row.additional_agreement = Context.data.execution_duties_additional_agreement!;
            await app.save()
        }
    }
}
