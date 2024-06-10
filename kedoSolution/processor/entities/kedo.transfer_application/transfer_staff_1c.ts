/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type StaffEmployment = ApplicationItem<Application$kedo$employment_directory$Data, Application$kedo$employment_directory$Params>;

interface IStaffData {
    name: string,
    id_1c: string,
    individual_id_1c: string,
    organization_id: string,
    position_id: string,
    structural_subdivision_id: string,
}

interface TransferData {
    staff: IStaffData,
    start_date: string,
    end_date?: string,
    reason: string,
    base: string,
    comment?: string,
    work_place?: string,
    remote_work?: boolean,
    position_id?: string,
    subdivison_id?: string,
    work_schedule_id?: string,
    temporary_transfer?: boolean,
}

/** Получить настройки КЭДО */
async function getKedoSettings(): Promise<void> {
    
}

/** Получить данные о сотруднике. */
async function getStaffData(employment: StaffEmployment): Promise<IStaffData> {
    if (!employment.data.staff) {
        throw new Error("employment_place.data.staff is undefined");
    }

    const staff = await employment.data.staff.fetch();

    if (!employment.data.organization) {
        throw new Error("employment.data.organization is undefined");
    }

    if (!employment.data.position) {
        throw new Error("employment.data.position is undefined");
    }

    if (!employment.data.subdivision) {
        throw new Error("employment.data.structural_subdivision is undefined");
    }

    const [position, organization, structural_subdivision] = await Promise.all([
        employment.data.position.fetch(),
        employment.data.organization.fetch(),
        employment.data.subdivision.fetch(),
    ]);

    const staff_data: IStaffData = {
        name: staff.data.__name,
        id_1c: employment.data.id_1c ?? "",
        individual_id_1c: staff.data.individual_id_1c ?? "",
        position_id: position.data.ref_key ?? "",
        organization_id: organization.data.ref_key ?? "",
        structural_subdivision_id: structural_subdivision.data.ref_key ?? "",
    }

    return staff_data;
}

async function setTransferData(): Promise<void> {
    if (!Context.data.transfer_application) {
        throw new Error("Отсутствует заявка на перевод");
    }

    if (!Context.data.transfer_type) {
        throw new Error("Вид перевода не указан");
    }

    const transfer_application = await Context.data.transfer_application.fetch();
    const transfer_table = transfer_application.data.transfer_table;
    const transfer_type = Context.data.transfer_type;

    if (!transfer_table || transfer_table.length == 0) {
        throw new Error("Таблица переводимых сотрудников в заявке не заполнена");
    }

    const row_index = Context.data.transfer_table_counter ?? 0;

    const transfer_row = transfer_table[row_index];

    if (transfer_row.transfer_employment_place) {
        throw new Error(`Место занятости переводимого сотрудника не заполнено (${row_index + 1} строка таблицы)`);
    }

    const staff_data = await getStaffData(transfer_row.transfer_employment_place);

    if (!transfer_application.data.date_start) {
        throw new Error("Не указана дата начала перевода");
    }

    // Дата перевода с
    const start_date = transfer_application.data.date_start;
    // Дата перевода по
    const end_date = transfer_application.data.date_end;
    // Причина перевода
    const transfer_reason = transfer_application.data.transfer_reason ?? "";
    // Комментарий
    const comment = transfer_application.data.comment ?? "";

    // Куда переводим
    // Позиция ШР, Организация, График работы
    const [position, organization, subdivision, work_schedule] = await Promise.all(
        [
            transfer_application.data.new_position?.fetch(),
            transfer_application.data.structural_subdivision?.fetch(),
            transfer_application.data.organization?.fetch(),
            transfer_application.data.schedule_work_new?.fetch(),
        ]
    );

    const transfer_data: TransferData = {
        staff: staff_data,
        start_date: start_date.format("YYYY-MM-DDT00:00:00"),
        end_date: end_date?.format("YYYY-MM-DDT00:00:00"),
        reason: transfer_reason,
        comment: comment,
        base: "Личное заявление сотрудника",
    };

    switch (transfer_type.code) {
        case "transfer_another_position": {
            if (!position) {
                throw new Error("Не указана позиция для перевода");
            }

            if (!subdivision) {
                throw new Error("У указаной позиции для перевода отсутсвует подразделение");
            }

            if (!organization) {
                throw new Error("У указаной позции для перевода не указана организация");
            }

            if (!transfer_application.data.temporary_transfer) {
                throw new Error("Не указн тип перевода (Временный или нет)");
            }

            transfer_data.position_id = position.data.ref_key;
            transfer_data.work_schedule_id = work_schedule?.data.id_1c;
            transfer_data.subdivison_id = subdivision?.data.ref_key;
            transfer_data.work_schedule_id = work_schedule?.data.id_1c;
            transfer_data.temporary_transfer = transfer_application.data.temporary_transfer;

            break;
        }

        case "work_condition_change": {
            if (!work_schedule) {
                throw new Error("Не указан новый график работы");
            }

            transfer_data.work_schedule_id = work_schedule?.data.id_1c;
            transfer_data.remote_work = transfer_application.data.remote_work;

            break;
        }

        case "change_of_schedule": {
            if (!work_schedule) {
                throw new Error("Не указан новый график работы");
            }

            transfer_data.work_schedule_id = work_schedule.data.id_1c;

            break;
        }

        default: {
            throw new Error("Неизвестный вид перевода");
        }
    }

    Context.data.transfer_data_json = JSON.stringify(transfer_data);
}

async function addIntegrationApp(): Promise<void> {
    const integration_apps = Context.data.integration_apps ?? [];

    if (!Context.data.integration_app) {
        throw new Error("Приложение интеграции отсуствует");
    }

    integration_apps.push(Context.data.integration_app);

    Context.data.integration_apps = integration_apps;
    // Очищаем поле перед следующей итерацией
    Context.data.integration_app = undefined;
}
