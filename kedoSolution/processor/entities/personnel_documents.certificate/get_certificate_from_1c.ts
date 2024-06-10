/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type StaffEmployment = ApplicationItem<Application$kedo$employment_directory$Data, any>;

interface IStaffData {
    name: string,
    id_1c: string,
    individual_id_1c: string,
    organization_id: string,
    position_id: string,
    structural_subdivision_id: string,
}

interface ICertificate2NDFL {
	staff : IStaffData,
	period : number,
}

/** Получение настроек КЭДО. */
async function get_kedo_settings(): Promise<void> {
    const settings = await Context.fields.kedo_settings.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
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

//Подготовка данных для 1С
async function prepareData1C(): Promise<void> {
    if (!Context.data.certificate) {
        throw new Error("Context.data.certificate is undefined");
    }

    const certificate = await Context.data.certificate.fetch();
    
    if (!certificate.data.employment_place) {
        throw new Error("Не указано место занятости сотрудника");
    }

    const employment_place = await certificate.data.employment_place.fetch();
    const staff_data = await getStaffData(employment_place);

    const certifiacte_object : ICertificate2NDFL = {
        staff : staff_data,
        period : certificate.data.date_from?.year ?? new TDate().year,
    };

    Context.data.additional_info = certificate.data.requester_comment;
    Context.data.certificate_data_json = JSON.stringify(certifiacte_object);
}


/** Поиск приложения интеграции */
async function getIntegrationApp(): Promise<void> {
    if (!Context.data.integration_app_id) {
        Context.data.error = `Отсутствует идентификатор приложения интеграции. Context.data.integration_app_id is undefined`;
        throw new Error(Context.data.error);
    }

    const integration_app = await Context.fields.integration_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(Context.data.integration_app_id!)
    )).first();

    if (!integration_app) {
        Context.data.error = `Не удалось найти приложение интеграции по заданному идентификатору. ID: ${Context.data.integration_app_id}`;
        throw new Error(Context.data.error);
    }

    Context.data.integration_app = integration_app;
}


//Получение печатных форм
async function getCertificatePrintForm(): Promise<void> {
    
    const print_forms = Context.data.print_forms_table!;
    const doc_types_1c = await Context.fields.print_forms_table.fields.doc_type_1c.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    for (const row of print_forms) {
        const doc_type = doc_types_1c.find(f => f.id == row.doc_type_1c.id);

        if (!doc_type) {
            continue;
        }

        if (Context.fields[`${doc_type.data.app_code}_print_form`]) {
            Context.data[`${doc_type.data.app_code}_print_form`] = row.print_form;
        }
    }

    if (!Context.data.certificate_print_form) {
        Context.data.error = `В полученных печатных формах отсутствует печатная форма справки.`;
        throw new Error(Context.data.error);
    }
}

//Проверка печатных форм
async function checkPrintFormsTable(): Promise<boolean> {
    if (!Context.data.print_forms_table || Context.data.print_forms_table.length == 0) {
        return false;
    }

    return true;
}