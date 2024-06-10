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

interface IFinancialAssistanceData {
	staff : IStaffData,
	creationAt : string,
	money: number,
	comment? : string,
}

async function get_kedo_settings(): Promise<void> {
    const settings = await Context.fields.kedo_settings.app.search().where(f => f.__deletedAt.eq(null)).size(1000).all();

    const use_alternative_integration = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.alternative_integration = use_alternative_integration ? use_alternative_integration.data.status : false;
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

async function prepare_data_1c(): Promise<void> {
    if (!Context.data.financial_assistance_application) {
        throw new Error("Отсутвует заявление на мат. помощь. Context.data.financial_assistance_application is undefined");
    }

    if (!Context.data.staff_kedo) {
        throw new Error("Не указан сотрудник. Context.data.staff_kedo is undefined");
    }

    const financial_assistance_application = await Context.data.financial_assistance_application.fetch();

    if (!financial_assistance_application.data.employment_placement) {
        throw new Error("Не указано место занятости сотрудника. financial_assistance_application.data.employment_placement is undefined");
    }

    const employment_placement = await financial_assistance_application.data.employment_placement.fetch();

    const staff_data = await getStaffData(employment_placement);

    if (!financial_assistance_application.data.type_of_financial_assistance) {
        throw new Error("Не указан вид материальной помощи; financial_assistance_application.data.type_of_financial_assistnace is undefined");
    }

    const type_of_financial_assistance = await financial_assistance_application.data.type_of_financial_assistance.fetch();

    const data_obj: IFinancialAssistanceData = {
        staff : staff_data,
        creationAt: financial_assistance_application.data.__createdAt.format("YYYY-MM-DDT00:00:00"),
        money: Context.data.money?.asFloat() ?? 0,
        comment: `Вид мат. помощи: ${type_of_financial_assistance.data.__name}; ${financial_assistance_application.data.reason ? `Комментарий сотрудника: ${financial_assistance_application.data.reason}` : ""}`,
    }

    Context.data.additional_info = type_of_financial_assistance.data.__name;

    Context.data.document_data = JSON.stringify(data_obj);
}

async function get_integration_app(): Promise<void> {
    if (!Context.data.integration_app_id) {
        Context.data.error = `Отсутствует идентификатор приложения интеграции. Context.data.integration_app_id is undefined`;
        throw new Error();
    }

    Context.data.integration_app = await Context.fields.integration_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(Context.data.integration_app_id!)
    )).first();

    if (!Context.data.integration_app) {
        Context.data.error = `По заданому идентификатору не найдено приложение интеграции: ${Context.data.integration_app_id}`;
    }
}

async function get_order_file(): Promise<void> {
    const print_forms_table = Context.data.print_forms_table!;

    const order_doc_type = await Context.fields.doc_type_1c.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.app_code.eq('order_financial_assistance')
    )).size(100).all();

    if (!order_doc_type) {
        Context.data.error = `Не удалось найти вид печатной, соответствующий печатной форме приказа.`
        throw new Error(Context.data.error);
    }

    for (let i = 0; i < print_forms_table.length; i++) {
        const row = print_forms_table[i];

        if (order_doc_type.find(f => f.id == row.doc_type_1c.id)) {
            Context.data.order_file = row.print_form;
            print_forms_table.delete(i);
            break;
        }
    }

    if (!Context.data.order_file) {
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
    Context.data.doc_type_1c = row.doc_type_1c;
    Context.data.overdue_date = new Datetime().add(new Duration(24, "hours"));

    Context.data.table_counter! += 1;
}

async function check_table_length(): Promise<boolean> {
    if (!Context.data.print_forms_table![Context.data.table_counter!]) {
        return false;
    }

    return true;
}
