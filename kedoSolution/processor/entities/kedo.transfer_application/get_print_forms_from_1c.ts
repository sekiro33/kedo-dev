/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_settings(): Promise<void> {
    const settings = await Context.fields.kedo_settings.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const alternative_integration = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.use_alternative_integration = alternative_integration ? alternative_integration.data.status : false;
}

async function get_integration_app(): Promise<void> {
    if (!Context.data.integration_app_id) {
        Context.data.error = `Отсутствует идентификатор приложения интеграции. Context.data.integration_app_id is undefined`;
        throw new Error(Context.data.error);
    }

    Context.data.integration_app = await Context.fields.integration_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(Context.data.integration_app_id!),
    )).first();

    if (!Context.data.integration_app) {
        Context.data.error = `Не удалось найти приложение интеграции по заданому идентификатору: ${Context.data.integration_app_id}`;
        throw new Error(Context.data.error);
    }
}

async function get_print_forms(): Promise<void> {
    if (Context.data.await_document) {
        const await_doc = await Context.data.await_document.fetch();

        if (!await_doc.data.print_forms_id) {
            Context.data.error = "Отсутствуют идентификаторы печатных форм";
            throw new Error(Context.data.error);
        }

        if (!await_doc.data.print_forms || await_doc.data.print_forms.length == 0) {
            Context.data.error = "Отсутствуют печатные формы";
            throw new Error(Context.data.error);
        }

        const print_forms = await_doc.data.print_forms;
        const print_forms_id: string[] = JSON.parse(await_doc.data.print_forms_id!);
        const print_froms_to_sign: FileItemRef[] = [];

        const document_types = await Context.fields.document_type.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null)
        )).size(10000).all();

        // Массив для хранения типов полученных печатных форм.
        const print_forms_types_id: string[] = [];

        if (print_forms && print_forms_id && print_forms.length == print_forms_id.length) {
            for (let i = 0; i < print_forms_id.length; i++) {
                const print_form_type = document_types.find(f => f.data.doc_type_id_1c === print_forms_id[i]);

                if (print_form_type && print_form_type.data.app_code == 'order_for_transfer') {
                    Context.data.transer_order_file = print_forms[i];
                    continue;
                }

                if (print_form_type && print_form_type.data.app_code == 'additional_transfer_agreement') {
                    Context.data.additional_transfer_agreement_file = print_forms[i];
                    continue;
                }

                if (print_form_type && print_form_type.data.app_code) {
                    print_forms_types_id.push(print_form_type.data.app_code);
                    print_froms_to_sign.push(print_forms[i]);
                } else {
                    print_forms_types_id.push('other_documents');
                    print_froms_to_sign.push(print_forms[i]);
                }
            }
        }

        Context.data.print_forms = print_froms_to_sign;
        Context.data.print_forms_id_json = JSON.stringify(print_forms_types_id);
    }
}

async function prepare_data_1c(): Promise<void> {
    if (Context.data.transfer_application) {
        const transfer_application = await Context.data.transfer_application.fetch();
        const row = transfer_application.data.transferred_staff_table![0];

        const staff = await row.staff.fetch();

        /*if (!staff.data.id_1c || !staff.data.individual_id_1c) {
            Context.data.error = 'У переводимого сотрудника отсутствует ID 1С.';
            throw new Error(Context.data.error);
        }*/

        const organization = await staff.data.organization!.fetch();

        Context.data.organization_id_1c = organization.data.ref_key;
        Context.data.move_date_string = transfer_application.data.date_start!.format('YYYY-MM-DD');
        Context.data.staff_id_1c = staff.data.id_1c;
        Context.data.staff_personal_id_1c = staff.data.individual_id_1c;

        if (transfer_application.data.new_position) {
            const new_position = await transfer_application.data.new_position.fetch();
            const subdivision = await new_position.data.subdivision!.fetch();
            Context.data.position_id_1c = new_position.data.ref_key;
            Context.data.subdivision_id_1c = subdivision.data.ref_key;
        }

        if (transfer_application.data.date_end) {
            Context.data.mode_date_end_string = transfer_application.data.date_end!.format('YYYY-MM-DD');
        }

        if (transfer_application.data.workplace_new) {
            const workplace_new = await transfer_application.data.workplace_new.fetch();
            Context.data.change_work_place = true;
        }

        if (transfer_application.data.remote_work) {
            Context.data.remote_work = true;
            Context.data.change_remote_work = true;
        }

        if (transfer_application.data.new_position) {
            Context.data.change_contract = true;
        }

        if (transfer_application.data.schedule_work_new) {
            const schedule_work_new = await transfer_application.data.schedule_work_new.fetch();
            Context.data.work_schedules_id_1c = schedule_work_new.data.id_1c;
        }
    }
}

async function check_mass_transfer(): Promise<boolean> {
    if (Context.data.transfer_application) {
        const transfer_application = await Context.data.transfer_application.fetch();
        return transfer_application.data.transferred_staff_table!.length > 1 ? true : false;
    }
    return false;
}

interface StaffList {
    id_1c: string,
    individual_id_1c: string,
}

async function prepare_data_1c_mass_transfer(): Promise<void> {
    if (Context.data.transfer_application) {
        const transfer_application = await Context.data.transfer_application.fetch();
        const staff_table = transfer_application.data.transferred_staff_table!;

        if (staff_table.length > 0) {
            const staff = await staff_table[0].staff.fetch();
            const work_schedules = await transfer_application.data.schedule_work_new!.fetch();
            const organization = await staff.data.organization!.fetch();

            Context.data.organization_id_1c = organization.data.ref_key;
            Context.data.work_schedules_id_1c = work_schedules.data.id_1c;
        }

        Context.data.move_date_string = transfer_application.data.date_start!.format('YYYY-MM-DD');

        if (transfer_application.data.date_end) {
            Context.data.mode_date_end_string = transfer_application.data.date_end!.format('YYYY-MM-DD');
        }

        const staff_list: StaffList[] = [];

        for (const row of staff_table) {
            const staff = await row.staff.fetch();
            staff_list.push({
                id_1c: staff.data.id_1c!,
                individual_id_1c: staff.data.individual_id_1c!,
            });
        }

        Context.data.staff_list_1c_json = JSON.stringify(staff_list);
    }
}

async function get_main_print_forms(): Promise<void> {
    const print_forms_table = Context.data.print_forms_table!;

    const doc_types_1c = await Context.fields.document_type.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const order_doc_type = doc_types_1c.filter(f => f.data.app_code == "order_for_transfer");
    const additional_agreement_doc_type = doc_types_1c.filter(f => f.data.app_code == "additional_transfer_agreement");

    if (!order_doc_type) {
        Context.data.error = `Не удалось найти вид печатной формы, соответствующий печатной форме приказа.`
        throw new Error(Context.data.error);
    }

    if (!additional_agreement_doc_type) {
        Context.data.error = `Не удалось найти вид печатной формы, соответствующий печатной форме ДС.`;
        throw new Error(Context.data.error);
    }

    for (let i = print_forms_table!.length - 1; i >= 0; i--) {
        const row = print_forms_table[i];

        if (order_doc_type.find(f => f.id == row.doc_type_1c.id)) {
            Context.data.transer_order_file = row.print_form;
            print_forms_table.delete(i);
            continue;
        }

        if (additional_agreement_doc_type.find(f => f.id == row.doc_type_1c.id)) {
            Context.data.additional_transfer_agreement_file = row.print_form;
            print_forms_table.delete(i);
        }
    }

    if (!Context.data.transer_order_file) {
        Context.data.error = `Среди полученных печатных форм не удалось найти печатную форму приказа`;
        throw new Error(Context.data.error);
    }
}

async function check_print_forms_table(): Promise<boolean> {
    if (Context.data.print_forms_table && Context.data.print_forms_table.length == 0) {
        return false;
    }

    return true;
}

async function get_print_form(): Promise<void> {
    if (!Context.data.print_forms_table![Context.data.table_counter!]) {
        throw new Error(`Не найдена строка в таблице. Context.data.table_counter = ${Context.data.table_counter}`);
    }

    const row = Context.data.print_forms_table![Context.data.table_counter!];
    Context.data.print_form = row.print_form;
    Context.data.document_type = row.doc_type_1c;
    Context.data.overdue_date = new Datetime().add(new Duration(24, "hours"));

    Context.data.table_counter! += 1;
}

async function check_table_length(): Promise<boolean> {
    if (!Context.data.print_forms_table![Context.data.table_counter!]) {
        return false;
    }

    return true;
}

