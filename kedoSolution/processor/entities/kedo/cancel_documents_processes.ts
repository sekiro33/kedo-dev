//Инициализация переменных
async function initializationVariables(): Promise<void> {
    //Присванивание заявки в случае если процесс инициализирован из другого раздела
    if (!Context.data.app) {
        const item_app = Context.data["__item"];
        Context.data.app = item_app;
    }

    if (!Context.data.staff) {
        throw new Error("staff is undefined");
    }
    const staff = await Context.data.staff.fetch();
    if (staff) {
        Context.data.staff_user = staff.data.ext_user;
    }

    Context.data.process_initiator_user = Context.data.__createdBy;
    // Наименование отменяемых подписанных документов
    Context.data.agreement_name_cancel = "";
    Context.data.agreement_full_name_cancel = "";
    Context.data.order_name_cancel = "";
    Context.data.order_full_name_cancel = "";
    Context.data.full_doc_name = "";

    Context.data.other_documents = [];
    Context.data.other_documents_name = "";
    Context.data.step = 0;
}

async function get_kedo_settings(): Promise<void> {
    const settings = await Context.fields.settings_kedo.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const integration_1c = settings.find(f => f.data.code == 'integration_1c');
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;
}

//Получение настроек по отменяемой заявке
async function getSettingsCancelApplication(): Promise<void> {
    const settings = await Namespace.app.settings_cancel_documents.search().where((f, g) => g.and(
        f.event_code.eq(Context.data.app!.code),
        f.__deletedAt.eq(null),
    )).first();
    if (settings) {
        if (Context.data.process_initiator_user && Context.data.staff_user) {
            const user_staff = await Context.data.staff_user.fetch();
            const user_initiator = await Context.data.process_initiator_user.fetch();

            if (user_staff.data.__id == user_initiator.data.__id) {
                Context.data.staff_process_initiator = true;
                Context.data.settings_documents = settings.data.start_settings_staff;
            } else {
                Context.data.staff_process_initiator = false;
                Context.data.settings_documents = settings.data.start_settings_not_staff;
            }
        }
        if (settings.data.cancel_signatory === true) {
            Context.data.signatory_user = Context.data.__createdBy;
            const signatory_user = await Context.data.signatory_user.fetch();
            const signatory_staff = await Context.fields.signatory_app.app.search().where((f, g) => g.and(
                f.ext_user.eq(signatory_user),
                f.__deletedAt.eq(null),
            )).first();

            if(signatory_staff) {
                Context.data.signatory_app = signatory_staff;
            }
        } else {
            Context.data.signatory_user = Context.data.staff_user;
            Context.data.signatory_app = Context.data.staff;
        }
        Context.data.settings_cancel_documents = settings;
        Context.data.need_approval = settings.data.need_approval;

        //Заполнение кастомных шаблонов из приложения справочника
        if (settings.data.memo_file) {
            Context.data.memo_file = settings.data.memo_file;
        }
        if (settings.data.statement_file) {
            Context.data.statement_file = settings.data.statement_file;
        }
        if (settings.data.order_file) {
            Context.data.order_file = settings.data.order_file;
        }
        if (settings.data.additional_agreement_file) {
            Context.data.additional_agreement_file = settings.data.additional_agreement_file;
        }
    }
}


// async function fillStartDateEvent(): Promise<void> {
//     if (Context.data.app) {
//         const app = await Context.data.app.fetch();
//         if (app.data.start || app.data.start_date) {
//             if (app.data.start) {
//                 Context.data.event_start_date = app.data.start ?? new Datetime().add(new Duration(8, "hours"));
//             }
//             if (app.data.start_date) {
//                 Context.data.event_start_date = app.data.start_date ?? new Datetime().add(new Duration(8, "hours"));
//             }
//         } else {
//             Context.data.event_start_date = new Datetime().add(new Duration(8, "hours"));
//         }
//     }
// }

async function fillContext(): Promise<void> {
    await initializationVariables();
    await getSettingsCancelApplication();
    //await fillStartDateEvent();

    if (Context.data.app) {
        const app = await Context.data.app.fetch();
        app.data.is_cancellation_process = true;
        await app.save();
        if (app.data.tickets_bought) {
            Context.data.tickets_bought = app.data.tickets_bought;
        }
        if (app.data.payment_made_vacation) {
            Context.data.payment_made_vacation = app.data.payment_made_vacation;
        }
        Context.data.app_name = app.data.__name;
        Context.data.name_cancel_app = `Отмена документов: ${app.data.__name}`;

        //Массив с приложениями документов
        const arr_apps = [
            app.data.dopolnitelnoe_soglashenie,
            app.data.other_documents,
            app.data.consent_processing_personal_data,
            app.data.job_application,
            app.data.labor_contract,
            app.data.admission_order,
            app.data.application_for_the_provision_of_information_about_labor_activity,
            app.data.electronic_agreement,
            app.data.execution_responsibilities_consent,
            app.data.execution_responsibilities_note,
            app.data.execution_responsibilities_order,
            app.data.execution_responsibilities_additional_agreement,
            app.data.additional_transfer_agreement,
            app.data.transfer_approve,
            app.data.linked_order,
            app.data.letter_of_resignation,
            app.data.dismissal_order,
            app.data.recall_dismissal,
            app.data.application_category_assignment,
            app.data.child_personal_data_consent,
            app.data.passport_data_application,
            app.data.passport_data_change_order,
            app.data.orders,
            app.data.statements,
            app.data.overtime_work,
            app.data.vacation_schedule,
            app.data.overtime_requests,
            app.data.overtimeWorkOrders,
            app.data.overtimeWorkNotifications,
            app.data.overtimeWorkConsent,
            app.data.overtime_order,
            app.data.statement,
            app.data.order,
            app.data.finance_report_app,
            app.data.service_assignments,
            app.data.additional_agreements
        ]

        //Обработка документов и проверка на подпись
        for (const arr_app of arr_apps) {
            if (arr_app && arr_app.length > 0) {
                for (const arr_item of arr_app) {
                    const fetch_app = await arr_item.fetch();
                    Context.data.other_documents!.push(arr_item)
                    Context.data.other_documents_name += fetch_app.data.__name + '\n';
                    if (fetch_app.data.kedo_status) {
                        const fetch_app_status = await fetch_app.data.kedo_status.fetch();
                        if (fetch_app_status && (fetch_app_status.data.code == "signed" || fetch_app_status.data.code == "staff_order_signing" || fetch_app_status.data.code == "paper_signed")) {
                            if (arr_item.code == 'dopolnitelnoe_soglashenie' || arr_item.code == 'additional_transfer_agreement' ||
                                arr_item.code == 'execution_responsibilities_additional_agreement') {
                                Context.data.application_agreement_signed = true;
                                Context.data.agreement_name_cancel += fetch_app.data.__name + '\n';
                                Context.data.agreement_full_name_cancel += `"${fetch_app.data.__name}"${fetch_app.data.order_number ? ` №${fetch_app.data.order_number}` : ''}${fetch_app.data.order_date ? ` от ${fetch_app.data.order_date.format('DD.MM.YYYY')}` : ''};\n`;
                            } else {
                                Context.data.application_order_signed = true;
                                Context.data.order_name_cancel += fetch_app.data.__name + '\n';
                                Context.data.order_full_name_cancel += `"${fetch_app.data.__name}"${fetch_app.data.order_number ? ` №${fetch_app.data.order_number}` : ''}${fetch_app.data.order_date ? ` от ${fetch_app.data.order_date.format('DD.MM.YYYY')}` : ''};\n`;
                            }
                            //Context.data.full_doc_name += `"${fetch_app.data.__name}"${fetch_app.data.order_number ? ` №${fetch_app.data.order_number}` : ''}${fetch_app.data.order_date ? ` от ${fetch_app.data.order_date}` : ''};\n`;
                        }
                    }
                }
            } else if (arr_app && !Array.isArray(arr_app)) {
                const fetch_app = await arr_app.fetch();
                Context.data.other_documents!.push(arr_app);
                Context.data.other_documents_name += fetch_app.data.__name + '\n';
                if (fetch_app.data.kedo_status) {
                    const fetch_app_status = await fetch_app.data.kedo_status.fetch();
                    if (fetch_app_status && (fetch_app_status.data.code == "signed" || fetch_app_status.data.code == "staff_order_signing" || fetch_app_status.data.code == "paper_signed")) {
                        if (arr_app.code == 'dopolnitelnoe_soglashenie' || arr_app.code == 'additional_transfer_agreement' ||
                            arr_app.code == 'execution_responsibilities_additional_agreement') {
                            Context.data.application_agreement_signed = true;
                            Context.data.agreement_name_cancel += fetch_app.data.__name + '\n';
                            Context.data.agreement_full_name_cancel += `"${fetch_app.data.__name}"${fetch_app.data.order_number ? ` №${fetch_app.data.order_number}` : ''}${fetch_app.data.order_date ? ` от ${fetch_app.data.order_date}` : ''};\n`;
                        } else {
                            Context.data.application_order_signed = true;
                            Context.data.order_name_cancel += fetch_app.data.__name + '\n';
                            Context.data.order_full_name_cancel += `"${fetch_app.data.__name}"${fetch_app.data.order_number ? ` №${fetch_app.data.order_number}` : ''}${fetch_app.data.order_date ? ` от ${fetch_app.data.order_date}` : ''};\n`;
                        }
                        //Context.data.full_doc_name += `"${fetch_app.data.__name}"${fetch_app.data.order_number ? ` №${fetch_app.data.order_number}` : ''}${fetch_app.data.order_date ? ` от ${fetch_app.data.order_date}` : ''};\n`;
                    }
                }
            }
        }
    }
}

//Прерывание процессов
async function processesInterrupt(): Promise<void> {
    if (Context.data.staff_user && Context.data.director_user) {
        const activeProcessTemplate = await System.processes._searchInstances()
            .where((f, g) => g.and(
                g.or(
                    f.__state.like(ProcessInstanceState.exec),
                    f.__state.like(ProcessInstanceState.error),
                    f.__state.like(ProcessInstanceState.wait)
                ),
                g.or(
                    f.__createdBy.eq(Context.data.staff_user!),
                    f.__createdBy.eq(Context.data.director_user!)
                ),
                (f as any)['__item'].eq(Context.data.app),
                f.__id.neq(Context.data.__id)
            )).size(100).all();

        const interrupProcess = activeProcessTemplate.map(process => process.interrupt(`${process.data.__name} был прерван по причине отмены документа(-ов)`))
        await Promise.all(interrupProcess);
    }
}

//Универсальный статус для отменяемых документов
async function changeStatusOtherDocuments(): Promise<void> {
    if (Context.data.other_documents && Context.data.other_documents.length > 0) {
        Context.data.other_document = Context.data.other_documents[Context.data.step!];
        Context.data.step! += 1;

        if (Context.data.step == (Context.data.other_documents.length)) {
            Context.data.end_processing_documents = true;
        }
    } else {
        Context.data.end_processing_documents = true;
    }
}

async function updateApp(): Promise<void> {
    if (Context.data.app) {
        const app = await Context.data.app.fetch();
        app.data.is_cancellation_process = false;

        await app.save();
    }
}

async function updateContextResigning(): Promise<void> {
    Context.data.again_send = true;
    Context.data.signing_error = undefined;
}

async function updateContextDecide(): Promise<void> {
    Context.data.signing_error = 'Не подписаны документы в бумаге.';
}

async function updateContextSigningPaper(): Promise<void> {
    Context.data.signing_error = undefined;
}

async function updateContextSigning(): Promise<void> {
    Context.data.signing_error = 'Не подписаны документы.';
}

async function checkSignedParam(): Promise<boolean> {
    if ((Context.data.order_is_signed === false && Context.data.application_order_signed === true) || (Context.data.agreement_is_signed === false && Context.data.application_agreement_signed === true)) {
        return true;
    }
    return false;
}
