


async function documents_status_change(status_code: string): Promise<void> {

    let staff = await Context.data.staff!.fetch();
    let documents = staff.data.documents_employment;
    let mapped_documents = documents!.map(async f => {
        let doc = await f.fetch();
        let source_doc = doc.data.__sourceRef;
        let fetched_source = await source_doc!.fetch();
        let statuses = fetched_source.fields.__status.all;
        let status = statuses.find((i: { code: string; }) => i.code == status_code);
        await fetched_source.setStatus(status);
        await fetched_source.save();
    })
    await Promise.all(mapped_documents);
}


async function action(code: string, doc: RefItem): Promise<any> {
    let app = await doc.fetch();
    let statuses = app.fields.__status.all;
    let status = statuses.find((i: { code: string; }) => i.code == code);
    await app.setStatus(status);
    await app.save();
}



async function docs_rejected(): Promise<void> {
    // Куршин Р. - изменять статусы всех документов трудоустройства не требуется 13.07.23 526 тикет
    //  await documents_status_change('removed');
}

async function order_create(): Promise<void> {
    let order = Context.fields.resignation_letter.app.fields.linked_order.app.create();
    let full_name = (await Context.data.responsible!.fetch()).data.fullname;
    order.data.responsible_string = full_name!.lastname + ' ' + full_name!.firstname.slice(1, 0) + '.' + full_name!.middlename ? full_name!.middlename.slice(1, 0) + '.' : '';
    await order.save();
    Context.data.dismissal_order = order;
    let statement = await Context.data.resignation_letter!.fetch();
    statement.data.linked_order = order;
    await statement.save();
}

async function labor_contract_get(): Promise<void> {
    Context.data.labor_contract = await Context.fields.labor_contract.app.search().where((f, g) => g.and(f.staff.link(Context.data.staff!), f.__deletedAt.eq(null))).first();
}

async function staff_get(): Promise<void> {
    let ext_user: UserItem | undefined
    let user = await Context.data.__createdBy.fetch();
    let group = await System.userGroups.search().where(f => f.__id.eq('f25906e4-41c3-5a89-8ec2-06648dd1f614')).first();
    if (group)
        ext_user = (await group!.users(0, group!.users.length)).find(f => f == user);
    else {
        await get_int_user();
        return;
    }
    if (ext_user)
        await get_ext_user(ext_user);
    else
        await get_int_user();
}


async function get_ext_user(ext_user: UserItem): Promise<void> {
    Context.data.staff_user = ext_user;
    let statement = await Context.data.resignation_letter!.fetch();
    Context.data.staff = statement.data.staff;
}


async function get_int_user(): Promise<void> {
    let statement = await Context.data.resignation_letter!.fetch();
    Context.data.staff = statement.data.staff;
    let staff = await statement.data.staff!.fetch();
    Context.data.staff_user = staff.data.ext_user;
}

async function comment_get(): Promise<void> {
    const item = await Context.data.resignation_letter!.fetch();
    const approvalLists = await item.docflow().getApprovalLists();
    let list = approvalLists[approvalLists.length - 1];
    let respondets = list.respondents;
    for (let respondent of respondets) {
        if (respondent.status == "rejected") {
            Context.data.comment = respondent.comment;
            Context.data.responsible = await System.users.search().where(f => f.__id.eq(respondent.id)).first();
            break;
        }
    }
}

async function alert_create(): Promise<void> {
    let date_format = await Context.data.resignation_letter!.fetch();
    let date_str = `${date_format.data.date_of_dismissal!.day}.${date_format.data.date_of_dismissal!.month}.${date_format.data.date_of_dismissal!.year}`

    Context.data.alert_body = `Сотрудник ${(await Context.data.staff!.fetch()).data.__name} увольняется ${date_str}. Причина: ${(await Context.data.resignation_letter!.fetch()).data.reason_for_leaving}`;
    Context.data.alert_title = `Оповещение`;
}

async function responsible_set(): Promise<void> {

    if (!Context.data.staff) {
        throw new Error('Не указан сотрудник.');
    }

    if (!Context.data.resignation_letter) {
        throw new Error('Отсутствует заявление на увольнение');
    }

    const staff = await Context.data.staff.fetch();

    if (staff.data.kedo_agreement) {
        Context.data.alert_body = `Ваше заявление на увольнение согласовано.<br> Подпишите его электронной подписью на портале КЭДО.`
    } else {
        Context.data.alert_body = `Ваше заявление на увольнение согласовано.<br> Идет оформление приказа.`
    }

    const resignation_letter = await Context.data.resignation_letter.fetch();

    const approvalLists = await resignation_letter.docflow().getApprovalLists();
    if (approvalLists.length == 0) {
        throw new Error("Не найдены листы согласования");
    }
    let approvalList = approvalLists[0];
    let respondets = approvalList.respondents;

    let responsible: UserItem | undefined = undefined;

    for (let respondent of respondets) {
        if (respondent && respondent.id && respondent.status == "approved") {
            responsible = await System.users.search().where(f => f.__id.eq(respondent.id)).first();
            break;
        }
    }

    if (responsible) {
        Context.data.responsible = responsible;
        resignation_letter.data.responsible_user = responsible;
        resignation_letter.data.responsible = `${responsible.data.fullname?.lastname} ${responsible.data.fullname?.firstname.slice(0, 1)}. ${responsible.data.fullname?.middlename.slice(0, 1)}.`;
        await resignation_letter.save();
    }
}

async function set_contract_field(): Promise<void> {
    let statement = await Context.data.resignation_letter!.fetch();
    statement.data.line_status = statement.data.__status!.code + ';' + statement.data.__status!.name;
    await statement.save();
}


async function set_filed_order(): Promise<void> {
    let decree = await Context.data.dismissal_order!.fetch();
    decree.data.line_status = decree.data.__status!.code + ';' + decree.data.__status!.name;
    await decree.save();
}



async function set_field_file_name(): Promise<void> {
    let decree = await Context.data.dismissal_order!.fetch();
    decree.data.line_file_name = (await Context.data.document_file!.fetch()).data.__name;
    await decree.save();
}

async function prepareData(): Promise<void> {

    Context.data.current_date = new TDate();
    await labor_contract_get();
}

async function get_kedo_settings(): Promise<void> {
    if (Context.data.resignation_letter) {
        let app = await Context.data.resignation_letter.fetch();
        app.data.id_process = Context.data.__id;
        await app.save();
    }
    const custom_generate_resignation_letter = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('custom_generate_resignation_letter')
        ))
        .first();
    Context.data.custom_generate_resignation_letter = custom_generate_resignation_letter ? custom_generate_resignation_letter.data.status : false;
    const integration_1c = await Context.fields.kedo_settings.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq('integration_1c'),
    )).first();

    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;

    //Использовать альтернативную учетную систему
    const alternative_system = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('use_alternative_system')
        ))
        .first();
    Context.data.use_alternative_system = alternative_system ? alternative_system.data.status : false;

    const accounting_in_processes = await Context.fields.kedo_settings.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq('accounting_in_processes'),
    )).first();
    Context.data.accounting_in_processes = accounting_in_processes ? accounting_in_processes.data.status : false;
}

async function check_kedo_agreement(): Promise<boolean> {
    let staff = await Context.data.staff!.fetch();
    if (staff.data.kedo_agreement) {
        return true;
    }
    else {
        return false;
    }
}

async function checkAggregationApp(): Promise<boolean> {
    const aggregationApp = await Context.fields.aggregate_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.staff.link(Context.data.staff!)
    )).first();

    if (aggregationApp) {
        Context.data.aggregate_app = aggregationApp;
        return true;
    };
    return false;
}

async function addFiringData(): Promise<void> {

    Context.data.debug += ' before if ';

    if (Context.data.staff) {
        Context.data.debug += ' in if ';
        const staff = await Context.data.staff.fetch();

        Context.data.debug += ` employment_table ${!!staff.data.employment_table} `;
        Context.data.debug += ` firing_date ${!!Context.data.date_of_dismissal} `;

        if (staff.data.employment_table && Context.data.date_of_dismissal) {
            Context.data.debug += ' in second if ';
            try {
                for (let row of staff.data.employment_table) {
                    row.date_by = Context.data.date_of_dismissal;
                }
                await staff.save();
            } catch (e) {
                Context.data.debug += String(e);
            }
        }
    }
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


async function createStatusFiringSigned(): Promise<void> {
    createStatusObj(Context.data.resignation_letter, 'agreed_signed');
}

async function createStatusFiringSigning(): Promise<void> {
    createStatusObj(Context.data.resignation_letter, 'signing');
}

async function createStatusApproval(): Promise<void> {
    createStatusObj(Context.data.resignation_letter, 'approval');
}

async function createStatusFiringCanceled(): Promise<void> {
    createStatusObj(Context.data.resignation_letter, 'cancelled');
}

async function createStatusFiringCorrection(): Promise<void> {
    createStatusObj(Context.data.resignation_letter, 'correction');
}

async function createStatusFiringPaperPrepare(): Promise<void> {
    createStatusObj(Context.data.resignation_letter, 'paper_prepare');
}

async function createStatusDismissalPaperPrepare(): Promise<void> {
    createStatusObj(Context.data.dismissal_order, 'paper_prepare');
}

async function createStatusDismissalPaperSigned(): Promise<void> {
    createStatusObj(Context.data.dismissal_order, 'paper_signed');
}

async function createStatusDismissalNew(): Promise<void> {
    createStatusObj(Context.data.dismissal_order, 'new');
}
async function createStatuDismissalsNeedDecision(): Promise<void> {
    createStatusObj(Context.data.dismissal_order, 'need_decision');
}

async function createStatusAppSigning(): Promise<void> {
    createStatusObj(Context.data.aggregate_app, 'signing_application');
}

async function createStatusAppApproval(): Promise<void> {
    createStatusObj(Context.data.aggregate_app, 'approval');
}

async function createStatusAppPaperPrepare(): Promise<void> {
    createStatusObj(Context.data.aggregate_app, 'paper_prepare');
}

async function createStatusAppPaperSigned(): Promise<void> {
    createStatusObj(Context.data.aggregate_app, 'paper_signed');
}

async function createStatusAppNeedDecision(): Promise<void> {
    createStatusObj(Context.data.aggregate_app, 'need_decision');
}

async function createStatusAppCorrection(): Promise<void> {
    createStatusObj(Context.data.aggregate_app, 'correction');
}

async function createStatusAppOrderPrepare(): Promise<void> {
    createStatusObj(Context.data.aggregate_app, 'order_prepare');
}

async function calcEscalationTime(): Promise<void> {
    const dismissal_escalation_hr = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq("dismissal_escalation_hr")
        ))
        .first();

    const hours = dismissal_escalation_hr && dismissal_escalation_hr.data.quantity ? dismissal_escalation_hr.data.quantity : 4;
    const dismissal_date = Context.data.date_of_dismissal!;

    // Получаем продолжительность рабочего дня.
    const settings = await System.productionSchedule.getGeneralSettings();
    const working_time = settings.daySchedule.workingTime;

    /*
        Вычисляем дату/время эскалации на отдел кадров.
        - дату округляем до полуночи
        - получаем дату завершения рабочего дня
        - вычитаем количество часов, заданных настройкой
    */
    const escalation_date = dismissal_date
        .asDatetime(new TTime(0, 0, 0, 0))
        .add(new Duration(working_time.to, "seconds"))
        .add(new Duration(-hours, "hours"))

    Context.data.escalation_time = escalation_date;
}

async function formatDataForPosition(): Promise<void> {
    if (Context.data.staff && Context.data.firing_position_ref) {
        let staffApp = await Context.data.staff.fetch();
        if (staffApp && staffApp.data.employment_table) {
            let row = staffApp.data.employment_table.find(item => item.id_1c === Context.data.firing_position_ref);
            if (row) {
                Context.data.employment_directory = row.employment_placement_app;    
            }    
        }
    }
}
