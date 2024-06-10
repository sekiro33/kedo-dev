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

enum CombinationType {
    /** Расширение зон обслуживания */
    EXPANSION_SERVICE_AREAS,
    /** Исполнение обязанностей сотрудника */
    PERFOMANCE_DUTIES,
    /** Совмщение должностей */
    PROFESSIONAL_DUTIES,
}

enum SurchargeType {
    FIXED_AMOUNT,
    COMBINATION_PERCENT,
    MAIN_POSITION_PERCENT,
}

interface CombinationDataRow {
    staff: IStaffData,
    surcharge_type: SurchargeType,
    sum: number,
}

interface IExecutionDutiesData {
    name: string,
    /** Отсутствующий сотрудник */
    absent_staff: IStaffData,
    /** Замещающий сотрудник */
    replacement_staff: IStaffData,
    start_date: string,
    end_date: string,
    /** Вид совмещения */
    combination_type: CombinationType,
    surcharge_type: SurchargeType,
    percent? : number,
    /** Комментарий */
    comment?: string,
}

/** Получение настроек КЭДО. */
async function getKedoSettings(): Promise<void> {
    const codes: string[] = [
        "use_alternative_integration",
    ];

    const settings = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.in(codes)
        ))
        .size(codes.length)
        .all();

    const alternative_integration = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.alternative_integration = alternative_integration ? alternative_integration.data.status : false;
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

function getSurchargeType(surcharge_code: string): SurchargeType {
    switch (surcharge_code) {
        case "fixed_amount": {
            return SurchargeType.FIXED_AMOUNT;
        }

        case "percen_combination": {
            return SurchargeType.COMBINATION_PERCENT;
        }

        case "percent_main_position": {
            return SurchargeType.MAIN_POSITION_PERCENT;
        }

        default: {
            throw new Error("Незивестный вид доплаты");
        }
    }
}

function getCombinationType(combination_code: string): CombinationType {
    switch (combination_code) {
        // Совмещение должностей
        case "combining_positions": {
            return CombinationType.PROFESSIONAL_DUTIES;
        }

        // Расширение зон обслуживания
        case "expansion_service_areas": {
            return CombinationType.EXPANSION_SERVICE_AREAS;
        }

        // Исполнение обязанностей сотрудника
        case "performance_employee_duties": {
            return CombinationType.PERFOMANCE_DUTIES;
        }

        default: {
            throw new Error("Незивестный вид совмещения");
        }
    }
}

async function prepare1cData(): Promise<void> {
    if (!Context.data.execution_duties) {
        throw new Error("Context.data.execution_duties is undefined");
    }

    const execution_duties = await Context.data.execution_duties.fetch();

    if (!execution_duties.data.start_day_line || !execution_duties.data.end_date_line) {
        throw new Error("Не указаны даты совмещения; start_day_line or end_date_line is undefined");
    }

    if (!execution_duties.data.staff_employment_placement) {
        throw new Error("Не указано место занятости отсутствующего сотрудника");
    }

    if (!execution_duties.data.type_combination) {
        throw new Error("Не указан тип совмещения");
    }

    const start_date = new Datetime(execution_duties.data.start_day_line!, 'DD.MM.YYYY');
    const end_date = new Datetime(execution_duties.data.end_date_line!, 'DD.MM.YYYY');

    const staff_employment_placement = await execution_duties.data.staff_employment_placement.fetch();
    const staff_data = await getStaffData(staff_employment_placement);

    const combination_type_app = await execution_duties.data.type_combination.fetch();
    const combination_type = getCombinationType(combination_type_app.data.code ?? "");


    const inf_about_acting = execution_duties.data.inf_about_acting;

    if (!inf_about_acting || inf_about_acting.length == 0) {
        throw new Error(`Таблица "Информация о совмещении" не заполнена`);
    }

    const inf_about_acting_data : CombinationDataRow[] = [];

    for (const row of inf_about_acting) {
        const staff_data = await getStaffData(await row.substitute_employment_placement!.fetch());

        inf_about_acting_data.push({
            staff : staff_data,
            surcharge_type : getSurchargeType(row.type_surcharge.code),
            sum : row.percent ?? 0,
        });
    }

    const execution_duties_data: IExecutionDutiesData = {
        name: execution_duties.data.__name,
        absent_staff : staff_data,
        replacement_staff : inf_about_acting_data[0].staff,
        surcharge_type : inf_about_acting_data[0].surcharge_type,
        percent : inf_about_acting_data[0].sum,
        combination_type : combination_type,
        start_date: start_date.format("YYYY-MM-DDT00:00:00"),
        end_date: end_date.format("YYYY-MM-DDT00:00:00"),
    };

    Context.data.combination_data = JSON.stringify(execution_duties_data);
}

async function prepare_data_1c(): Promise<void> {
    if (Context.data.execution_duties) {
        const execution_duties = await Context.data.execution_duties.fetch();

        const start_date = new Datetime(execution_duties.data.start_day_line!, 'DD.MM.YYYY');
        const end_date = new Datetime(execution_duties.data.end_date_line!, 'DD.MM.YYYY');

        Context.data.start_date_1c = start_date.format('YYYY-MM-DD');
        Context.data.end_date_1c = end_date.format('YYYY-MM-DD');

        let substitute_staff = execution_duties.data.substitute;

        if (!substitute_staff) {
            const table = execution_duties.data.inf_about_acting;
            if (table && table.length > 0) {
                const row = table[0];

                substitute_staff = row.substitute;
                Context.data.type_surcharge = row.type_surcharge;
                Context.data.percent = row.percent;
            }
        }

        Context.data.substitute_staff = substitute_staff;
    }
}

async function get_integration_app(): Promise<void> {
    if (!Context.data.integration_app_id) {
        Context.data.error = 'Отсутствует идентификатор приложения интеграции. Context.data.integration_app_id is undefined';
        throw new Error(Context.data.error);
    }

    const integration_app = await Context.fields.integration_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(Context.data.integration_app_id!)
    )).first();

    if (!integration_app) {
        Context.data.error = `Не найдено приложение интеграции по заданому идентификатору: "${Context.data.integration_app_id}".`;
        throw new Error(Context.data.error);
    }

    Context.data.integration_app = integration_app;
}

async function check_print_forms_table_length(): Promise<boolean> {
    if (Context.data.print_forms_table && Context.data.print_forms_table.length > 0) {
        return true;
    }

    return false;
}

async function check_table_length(): Promise<boolean> {
    if (!Context.data.print_forms_table![Context.data.table_counter!]) {
        return false;
    }

    return true;
}

/** Получить печатные формы приказа и доп. соглашения из таблицы печатных форм. */
async function get_main_print_forms(): Promise<void> {
    const doc_types_1c = await Context.fields.document_type_1c.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const order_doc_type = doc_types_1c.filter(f => f.data.app_code == "order_execution_responsibilities");
    const additional_agreement_doc_type = doc_types_1c.filter(f => f.data.app_code == "execution_responsibilities_additional_agreement");

    if (!order_doc_type) {
        Context.data.error = `Вид документа, соответствующий приказу на ИО не найден.`
        throw new Error(Context.data.error);
    }

    if (!additional_agreement_doc_type) {
        Context.data.error = `Вид документа, соответствующий доп. соглашенюи на ИО не найден.`
        throw new Error(Context.data.error);
    }

    const print_forms_table = Context.data.print_forms_table!;

    for (let i = print_forms_table!.length - 1; i >= 0; i--) {
        const row = print_forms_table[i];

        if (order_doc_type.find(f => f.id == row.doc_type_1c.id)) {
            Context.data.order_file = row.print_form;
            print_forms_table.delete(i);
            continue;
        }

        if (additional_agreement_doc_type.find(f => f.id == row.doc_type_1c.id)) {
            Context.data.additional_file = row.print_form;
            print_forms_table.delete(i);
        }
    }

    if (!Context.data.order_file) {
        Context.data.error = `В полученных печатных формах не найден файл приказа.`
        throw new Error(Context.data.error);
    }

    if (!Context.data.additional_file) {
        Context.data.error = `В полученных печатных формах не найден файл доп. соглашения.`;
        throw new Error(Context.data.error);
    }
}

async function get_print_form(): Promise<void> {
    if (Context.data.print_forms_table![Context.data.table_counter!]) {
        const row = Context.data.print_forms_table![Context.data.table_counter!];
        Context.data.print_form = row.print_form;
        Context.data.document_type_1c = row.doc_type_1c;
        Context.data.overdue_date = new Datetime().add(new Duration(24, 'hours'));
    }
    Context.data.table_counter! += 1;
}

async function checkTypeCombination(): Promise<number> {
    const execution_duties = await Context.data.execution_duties!.fetch();
    const execution_duties_type = await execution_duties.data.type_combination!.fetch();

    if (execution_duties_type.data.code == 'performance_employee_duties') { //исполнение обязанностей
        return 1;
    }

    if (execution_duties_type.data.code == 'combining_positions') { //совмещение должностей
        return 2;
    }

    return 3; //расширение зон обслуживания
}
