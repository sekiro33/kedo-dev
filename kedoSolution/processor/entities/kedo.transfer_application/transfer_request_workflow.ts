/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function prepareData(): Promise<void> {

    //Настройки кэдо, вынести в отдельный блок
    const custom_generate_transfer_application = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('custom_generate_transfer_application')
        ))
        .first();
    Context.data.custom_generate_transfer_application = custom_generate_transfer_application ? custom_generate_transfer_application.data.status : false;

    Context.data.proposed_terms = ""

    if (!Context.data.transfer_application) {
        throw new Error("Отсутствует заявка");
    }

    const transfer_application = await Context.data.transfer_application.fetch();

    Context.data.transfer_type = transfer_application.data.transfer_type;
    Context.data.date_start = transfer_application.data.date_start;

    //Изменение таблицы
    Context.data.transferred_staff = transfer_application.data.transfer_table![0].transfer_staff;

    //Context.data.table_lenght = transfer_application.data.transferred_staff_table!.length;

    Context.data.staff = transfer_application.data.staff;
    const staffs = transfer_application.data.transfer_table!.map(f => f.transfer_staff);
    const staffs_fetched = await Promise.all(staffs.map(f => f.fetch()));
    Context.data.transferred_staffs_users = staffs_fetched.map(f => f.data.ext_user!);

    //1751
    if (!transfer_application.data.staff && transfer_application.data.transfer_table!.length > 0) {
        transfer_application.data.staff = transfer_application.data.transfer_table![0].transfer_staff;
    }
    //1751

    if (transfer_application.data.transfer_table && transfer_application.data.transfer_table.length === 1) {
        if (transfer_application.data.transfer_table[0].transfer_staff.id === transfer_application.data.staff!.id) {
            Context.data.is_iniciator = true;
        } else {
            Context.data.is_iniciator = false;
        }
    }

    let app = transfer_application.data;
    Context.data.proposed_terms += app.date_start ? '- Дата перевода c : ' + app.date_start.format('DD.MM.YYYY') + '\n' : "";
    Context.data.proposed_terms += app.date_end ? '- Дата перевода по : ' + app.date_end.format('DD.MM.YYYY') + '\n' : "";
    Context.data.proposed_terms += app.new_position ? '- Должность: ' + (await app.new_position.fetch()).data.__name + '\n' : "";
    Context.data.proposed_terms += app.schedule_work_new ? '- График работы: ' + (await app.schedule_work_new.fetch()).data.__name + '\n' : "";
    Context.data.proposed_terms += app.workplace_new ? '- Рабочее место: ' + (await app.workplace_new.fetch()).data.__name + '\n' : "";
    Context.data.proposed_terms += app.type_employment_relationship ? '- Вид трудовых отношений: ' + (await app.type_employment_relationship.fetch()).data.__name + '\n' : "";
    Context.data.proposed_terms += app.remote_work ? '- Дистанционная работа: Да' : '- Дистанционная работа: Нет'

    //Context.data.transferred_staff_table = transfer_application.data.transferred_staff_table;

    for (let user of Context.data.transfer_table!) {
        user.current_terms = '';
        if (user.transfer_work_schedule) {
            user.current_terms += app.schedule_work_new ? '- График работы: ' + (await user.transfer_work_schedule.fetch()).data.__name + '\n' : "";
        }
        if (user.transfer_workplace) {
            user.current_terms += app.workplace_new ? '- Рабочее место: ' + (await user.transfer_work_schedule.fetch()).data.__name + '\n' : "";
        }
        // if (user.type_employment_relationship) {
        //     user.current_terms += app.type_employment_relationship ? '- Вид трудовых отношений: ' + user.type_employment_relationship + '\n' : "";
        // }

        const staff = await user.transfer_staff.fetch()
        if (staff.data.remote_work) {
            user.current_terms += '- Дистанционная работа: Да'
        } else {
            user.current_terms += '- Дистанционная работа: Нет'
        }
    }

    await get_kedo_settings()
}

async function get_kedo_settings(): Promise<void> {
    const settings = await Context.fields.kedo_settings.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const integration_1c = settings.find(f => f.data.code == 'integration_1c');
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;

    const use_alternative_system = settings.find(f => f.data.code == 'use_alternative_system');
    Context.data.use_alternative_system = use_alternative_system ? use_alternative_system.data.status : false;

    const custom_lna = settings.find(f => f.data.code == 'custom_lna');
    Context.data.custom_lna = custom_lna ? custom_lna.data.status : false;

    const med_exam_proccess = settings.find(f => f.data.code == 'med_exam_process');
    Context.data.on_med_exam_process = med_exam_proccess ? med_exam_proccess.data.status : false;
}

async function getBossApp(): Promise<void> {
    if (Context.data.director_user) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.director_user!)
            ))
            .first()
        Context.data.director = headApp
    }
}

async function checkMedExams(): Promise<void> {
    let promises: Promise<void>[] = [];
    Context.data.medical_requests = [];
    const transfer_application = await Context.data.transfer_application!.fetch();
    if (transfer_application.data.new_position) {
        const new_position = await transfer_application.data.new_position.fetch();
        if (new_position.data.harmful_production_factors && new_position.data.harmful_production_factors.length > 0) {
            for (const row of transfer_application.data.transfer_table!) {
                const medical_request = Context.fields.medical_requests.app.create();
                medical_request.data.staff = row.transfer_staff;
                medical_request.data.new_position = new_position;
                medical_request.data.transfer_date = transfer_application.data.date_start;
                medical_request.data.transfer_application = transfer_application;
                medical_request.data.sort_of_medical_examination = medical_request.fields.sort_of_medical_examination.variants.preliminary_examination;
                promises.push(medical_request.save());
                Context.data.medical_requests.push(medical_request);
            }
        }
        if (Context.data.medical_requests && Context.data.medical_requests.length > 0) {
            Context.data.required_med_exam = true;
        } else {
            Context.data.required_med_exam = false;
        }
        await Promise.all(promises);
    } else {
        Context.data.required_med_exam = false;
    }
}

async function getMedExamsResults(): Promise<void> {
    let fit = 0;
    let partially_fit = 0;
    let unfit = 0;
    const medical_requests = await Promise.all(Context.data.medical_requests!.map(f => f.fetch()));
    const med_exams_array = medical_requests.map(f => f.data.med_exam!).reduce((a, b) => a.concat(b));
    const med_exams_fetched = await Promise.all(med_exams_array.map(f => f.fetch()));
    let med_exam_lenght = med_exams_fetched.length;
    for (let med_exam of med_exams_fetched) {
        if (med_exam.data.satisfactory_results) {
            switch (med_exam.data.satisfactory_results.code) {
                case 'fit':
                    fit++;
                    break;
                case 'partially_fit':
                    partially_fit++;
                    break;
                case 'unfit':
                    unfit++;
                    break;
            }
        }
    }
    if (fit === med_exam_lenght) {
        Context.data.med_exams_results = Context.fields.med_exams_results.variants.passed;
    }
    if (partially_fit > 0) {
        Context.data.med_exams_results = Context.fields.med_exams_results.variants.part_passed;
    }
    if (unfit === med_exam_lenght) {
        Context.data.med_exams_results = Context.fields.med_exams_results.variants.failed;
    }
}

async function getAllStaffs(): Promise<void> {
    Context.data.staffs_all = [];
    Context.data.chiefs_users = [];
    Context.data.employment_placement = [];
    const transfer_application = await Context.data.transfer_application!.fetch();
    for (let row of transfer_application.data.transfer_table!) {
        Context.data.staffs_all.push(row.transfer_staff);
        Context.data.employment_placement.push(row.transfer_employment_place);
    }
    Context.data.counter = 0;
    Context.data.amount_staffs = Context.data.staffs_all.length - 1;
}

async function getStaff(): Promise<void> {
    Context.data.staff_chief = Context.data.staffs_all![Context.data.counter!];
    Context.data.employment_place_single = Context.data.employment_placement![Context.data.counter!];
    Context.data.counter!++;
}

async function setChief(): Promise<void> {
    if (Context.data.chief_user) {
        Context.data.chiefs_users!.push(Context.data.chief_user);
    }
}

async function checkStaffsApprove(): Promise<void> {
    Context.data.correct_comment = '';
    const transfer_application = await Context.data.transfer_application!.fetch();
    const transfers_approve = await Promise.all(transfer_application.data.transfer_approve!.map(f => f.fetch()));
    Context.data.approve_signed = transfers_approve.every(f => f.data.approve_signed === true);
    const transfers_approve_canceled = transfers_approve.filter(f => f.data.approve_signed === false);
    if (transfers_approve_canceled && transfers_approve_canceled.length > 0) {
        const staff_canceled = transfers_approve_canceled.map(f => f.data.staff);
        const staff_canceled_fetch = await Promise.all(staff_canceled.map(f => f!.fetch()));
        Context.data.correct_comment += `Сотрудник(и) ${staff_canceled_fetch.map(f => f.data.__name).join()} отказались в подписании согласия на перевод`;
    }
}

async function getStaffAndCreateOrder(): Promise<void> {
    Context.data.staff_chief = Context.data.staffs_all![Context.data.counter!];
    Context.data.old_position = (await Context.data.staff_chief.fetch()).data.position;
    // const order = Context.fields.order.app.create();
    // order.data.staff = Context.data.staff_chief;
    // order.data.application_transfer = Context.data.transfer_application;
    // await order.save();
    // Context.data.order = order;
    Context.data.counter!++;
}

async function prepareDataOrder(): Promise<void> {
    Context.data.order_date = new TDate();
    Context.data.counter = 0;
    Context.data.year = Context.data.order_date.year;
    Context.data.transfer_order = [];
}

async function prepareOrders(): Promise<void> {
    const order = await Context.data.order!.fetch();
    order.data.__file = Context.data.transfer_order_file;
    await order.save();
    Context.data.transfer_order!.push(order);
}

async function getStaffForLNA(): Promise<void> {
    Context.data.staff_chief = Context.data.staffs_all![Context.data.counter!];
    Context.data.counter!++;
}

async function getDocsLNA(): Promise<void> {
    let array_lna_ids: string[] = [];
    const staff = await Context.data.staff_chief!.fetch();
    //const position = await staff.data.position!.fetch();
    const position = Context.data.transfer_application ? (await Context.data.transfer_application.fetch()).data.new_position : undefined;
    if (staff.data.list_sign_lna && staff.data.list_sign_lna.length > 0) {
        array_lna_ids = staff.data.list_sign_lna.map(item => item.id);
    }

    let documents_pull = await Context.fields.docs_lna.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.positions_review.has(position!),
            g.or(
                f.__status.eq(Context.fields.docs_lna.app.fields.__status.variants.approved),
                f.__status.eq(Context.fields.docs_lna.app.fields.__status.variants.current)
            )
        ))
        .size(10000)
        .all();
    documents_pull = documents_pull.filter((item) => {
        if (array_lna_ids.indexOf(item.data.__id) <= -1) {
            return item;
        }
    })

    if (documents_pull && documents_pull.length > 0) {
        Context.data.docs_lna = [];
        Context.data.docs_lna = Context.data.docs_lna.concat(documents_pull);
        Context.data.find_lna_documents = true;
    } else {
        Context.data.find_lna_documents = false;
    }
}

async function set_contract_filed(): Promise<void> {
    let transfer_application = await Context.data.transfer_application!.fetch();
    transfer_application.data.line_status = `${transfer_application.data.__status!.code};${transfer_application.data.__status!.name}`;
    await transfer_application.save();
}

async function set_file_name_filed(): Promise<void> {
    let transfer_application = await Context.data.transfer_application!.fetch();
    transfer_application.data.line_file_name = (await transfer_application.data.__file!.fetch()).data.__name;
    await transfer_application.save();
}

async function setNewPosition(): Promise<void> {
    const transfer_application = await Context.data.transfer_application!.fetch();
    //const staffs = transfer_application.data.transfer_table!.map(f => f.transfer_staff);

    if (transfer_application.data.transfer_table) {
        let promises: Promise<void>[] = [];

        if (transfer_application.data.new_position && transfer_application.data.transfer_type && transfer_application.data.transfer_type.code == "transfer_another_position") {
            const new_position = await transfer_application.data.new_position.fetch();
            for (let row of transfer_application.data.transfer_table) {
                const staff = await row.transfer_staff.fetch();
                const update_employment_place = await row.transfer_employment_place.fetch();

                if (staff.data.employment_table) {
                    const employment_table_row = staff.data.employment_table.find(f => f.employment_placement_app.id === row.transfer_employment_place.id);

                    if (employment_table_row) {
                        employment_table_row.position = transfer_application.data.new_position;
                        if (new_position.data.subdivision) {
                            employment_table_row.subdivision = new_position.data.subdivision;
                        }
                        if (new_position.data.organization) {
                            employment_table_row.organization = new_position.data.organization
                        }
                        if (transfer_application.data.schedule_work_new) {
                            employment_table_row.work_schedules = transfer_application.data.schedule_work_new;
                        }
                        promises.push(staff.save());
                    }

                    if (row.transfer_employment_place) {
                        update_employment_place.data.position = transfer_application.data.new_position;
                        if (new_position.data.subdivision) {
                            update_employment_place.data.subdivision = new_position.data.subdivision;
                        }
                        if (new_position.data.organization) {
                            update_employment_place.data.organization = new_position.data.organization
                        }
                        //await update_employment_place.save();
                        promises.push(update_employment_place.save());
                    }
                }

                if (promises.length > 20) {
                    await Promise.all(promises);
                    promises = [];
                }
            }
        }

        if (transfer_application.data.transfer_type && transfer_application.data.transfer_type.code == "work_condition_change") {
            for (let row of transfer_application.data.transfer_table) {
                const staff = await row.transfer_staff.fetch();

                if (staff.data.employment_table) {
                    const employment_table_row = staff.data.employment_table.find(f => f.employment_placement_app.id === row.transfer_employment_place.id);
                    if (employment_table_row) {
                        if (transfer_application.data.schedule_work_new) {
                            employment_table_row.work_schedules = transfer_application.data.schedule_work_new;
                        }
                        if (transfer_application.data.remote_work != undefined) {
                            employment_table_row.remote_work = transfer_application.data.remote_work;
                        }
                        promises.push(staff.save());
                    }
                }

                if (promises.length > 20) {
                    await Promise.all(promises);
                    promises = [];
                }
            }
        }

        if (transfer_application.data.schedule_work_new && transfer_application.data.transfer_type && transfer_application.data.transfer_type.code == "change_of_schedule") {
            for (let row of transfer_application.data.transfer_table) {
                const staff = await row.transfer_staff.fetch();

                if (staff.data.employment_table) {
                    const employment_table_row = staff.data.employment_table.find(f => f.employment_placement_app.id === row.transfer_employment_place.id);
                    if (employment_table_row) {
                        employment_table_row.work_schedules = transfer_application.data.schedule_work_new;
                    }
                    promises.push(staff.save());
                }

                if (promises.length > 20) {
                    await Promise.all(promises);
                    promises = [];
                }
            }
        }

        await Promise.all(promises);
    }
    // let staff_ids = staffs.map(item => item.id);

    // let employment_directory_array = await Context.fields.employment_directory.app.search().where((f, g) => g.and(
    //     f.__deletedAt.eq(null),
    //     f.__status.eq(Context.fields.employment_directory.app.fields.__status.variants.actual),
    // )).size(10000).all();

    // employment_directory_array = employment_directory_array.filter(item => item.data.staff && staff_ids.indexOf(item.data.staff.id) > -1)
    // let promises: Promise<void>[] = [];


    // const staffs_fetched = await Promise.all(staffs.map(f => f.fetch()));
    // for (const staff of staffs_fetched) {
    //     if (transfer_application.data.new_position && transfer_application.data.transfer_type && transfer_application.data.transfer_type.code == "transfer_another_position") {
    //         staff.data.position = transfer_application.data.new_position;
    //         const new_position = await transfer_application.data.new_position.fetch();
    //         staff.data.structural_subdivision = new_position.data.subdivision;
    //         staff.data.organization = new_position.data.organization;
    //         let row = transfer_application.data.transfer_table!.find(item => item.transfer_staff.id == staff.id)
    //         let elem = employment_directory_array.find(item => item.data.staff && item.data.staff.id == staff.id && item.data.type_employment && row && item.data.type_employment.code == row.transfer_employment_place.code)
    //         let row_employment_table = staff.data.employment_table!.find(item => row && item.type_employment.code == row.transfer_employment_place.code);
    //         if (row_employment_table) {
    //             row_employment_table.position = transfer_application.data.new_position;
    //             row_employment_table.subdivision = new_position.data.subdivision!
    //             row_employment_table.organization = new_position.data.organization!
    //         }
    //         if (elem) {
    //             elem.data.position = transfer_application.data.new_position;
    //             elem.data.subdivision = new_position.data.subdivision;
    //             elem.data.organization = new_position.data.organization;
    //             await elem.save()
    //         }
    //     }
    //     if (transfer_application.data.transfer_type && transfer_application.data.transfer_type.code == "change_of_schedule") {
    //         let elem = employment_directory_array.find(item => item.data.staff && item.data.staff.id == staff.id && item.data.type_employment && row && item.data.type_employment.code == row.transfer_employment_place.code)
    //     }

    //     if (transfer_application.data.employment_type) {
    //         staff.data.employment_type = transfer_application.data.employment_type;
    //     }

    //     const employment_table = staff.data.employment_table!.find(f => f.employment_placement_app.id ==)
    //     staff.data.type_employment_relationship = transfer_application.data.type_employment_relationship;
    //     staff.data.work_place = transfer_application.data.work_place;
    //     staff.data.rate = transfer_application.data.rate_new;
    //     staff.data.work_schedules = transfer_application.data.schedule_work_new;
    //     promises.push(staff.save());
    // }
    // await Promise.all(promises);
}

async function create_await_docs(): Promise<void> {
    Context.data.wait_docs = [];
    if (Context.data.staffs_all && Context.data.staffs_all.length > 0) {
        for (const staff of Context.data.staffs_all) {
            const staff_app = await staff.fetch();
            const transfer_application = await Context.data.transfer_application!.fetch();
            const organiaztion = await transfer_application.data.organization!.fetch();
            const current_position = await staff_app.data.position!.fetch();
            //const transfer_approve = await transfer_application.data.transfer_approve![i].fetch();

            const body: any = {
                "Date": `${new TDate().format('YYYY-MM-DD')}T00:00:00`,
                "Организация_Key": organiaztion.data.ref_key,
                "Сотрудник_Key": staff_app.data.id_1c,
                "ФизическоеЛицо_Key": staff_app.data.individual_id_1c,
                "ДатаНачала": `${transfer_application.data.date_start!.format('YYYY-MM-DD')}T00:00:00`,
                "ВидЗанятости": "ОсновноеМестоРаботы",
                "КоличествоСтавок": 1,
                "ВидДоговора": "ТрудовойДоговор",
                "КоэффициентИндексации": 1,
                "ДатаЗапрета": `${transfer_application.data.date_start!.format('YYYY-MM-DD')}T00:00:00`,
                "НаименованиеДокумента": "Приказ",
                "ПричинаПеревода": `${transfer_application.data.transfer_reason ? transfer_application.data.transfer_reason : ''}`,
                "ОснованиеПеревода": `Личное заявление сотрудника`,
                "ИзменитьСведенияОДоговореКонтракте": true,
                "Комментарий": `${transfer_application.data.comment}`
            }

            body["ИзменитьРабочееМесто"] = false;
            if (transfer_application.data.workplace_new) {
                const workplace_new = await transfer_application.data.workplace_new.fetch();
                body["ИзменитьРабочееМесто"] = true
                //body["РабочееМесто_Key"] = 
            }

            body["ИзменитьДистанционнуюРаботу"] = false;
            if (transfer_application.data.remote_work) {
                body["РаботаетДистанционно"] = true;
                body["ИзменитьДистанционнуюРаботу"] = true;
            }

            body["ИзменитьПодразделениеИДолжность"] = false;
            if (transfer_application.data.new_position) {
                const position = await transfer_application.data.new_position!.fetch();
                if (position.data.__id != current_position.data.__id) {
                    const subdivision = await position.data.subdivision!.fetch();
                    body["Должность_Key"] = position.data.ref_key;
                    body["Подразделение_Key"] = subdivision.data.ref_key;
                    body["ИзменитьПодразделениеИДолжность"] = true;
                }
            }

            body["ИзменитьГрафикРаботы"] = true;
            if (transfer_application.data.schedule_work_new) {
                const schedule_work_new = await transfer_application.data.schedule_work_new!.fetch();
                body["ГрафикРаботы_Key"] = schedule_work_new.data.id_1c;
                body["ИзменитьГрафикРаботы"] = true;
            }

            if (transfer_application.data.date_end) {
                body["ДатаОкончания"] = `${transfer_application.data.date_end!.format('YYYY-MM-DD')}T00:00:00`
            }

            const accounting1c = Context.fields.wait_docs.app.fields.accounting_systems.variants.zup_1c
            const awaitingApp = Context.fields.wait_docs.app.create();
            awaitingApp.data.__name = "Кадровый перевод"
            awaitingApp.data.document_odata_name = "Document_КадровыйПеревод"
            awaitingApp.data.accounting_systems = accounting1c
            awaitingApp.data.personal_guid_1c = JSON.stringify([staff_app.data.individual_id_1c]);
            awaitingApp.data.document_creation_data = JSON.stringify(body)
            await awaitingApp.save()

            Context.data.wait_docs.push(awaitingApp);
        }
    }
}

async function checkSettingsKEDO(): Promise<void> {
    const setting = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('director_signing')
        ))
        .first();
    if (setting) {
        Context.data.director_signing = setting.data.status;
    }
}

async function fillContext(): Promise<void> {
    if (Context.data.transfer_application) {
        const app = await Context.data.transfer_application.fetch();
        if (app.data.transfer_table) {
            Context.data.table_lenght = app.data.transfer_table.length;
            for (let row_table_app of app.data.transfer_table) {
                const row_table_context = Context.data.transfer_table!.insert();
                row_table_context.transfer_staff = row_table_app.transfer_staff;
                row_table_context.transfer_employment_place = row_table_app.transfer_employment_place;
                row_table_context.transfer_work_schedule = row_table_app.transfer_work_schedule;
                row_table_context.transfer_workplace = row_table_app.transfer_workplace;
            }

            Context.data.transfer_table = Context.data.transfer_table;
        }
    }
}

async function processingData(): Promise<void> {
    if (Context.data.transfer_table && Context.data.transfer_table.length > 0) {
        for (let row of Context.data.transfer_table) {
            const row_helper_table = Context.data.table_staff!.insert();
            row_helper_table.staffs = row.transfer_staff;
            row_helper_table.employment_directory = row.transfer_employment_place;
        }
        Context.data.table_staff = Context.data.table_staff;
    }
}