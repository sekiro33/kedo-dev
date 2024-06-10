/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type IntegrationApp = ApplicationItem<Application$kedo$awaiting_documents_table_1c$Data, Application$kedo$awaiting_documents_table_1c$Params>;
type EmploymentPlacement = ApplicationItem<Application$kedo$employment_directory$Data, Application$kedo$employment_directory$Params>;
type Staff = ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>;
type DocType1C = ApplicationItem<Application$kedo$document_types$Data, Application$kedo$document_types$Params>;

const CHUNK_SIZE = 50;

async function add_error(app: IntegrationApp, error_text: string): Promise<void> {
    const errors_table = Context.data.errors_table ?? Context.fields.errors_table.create();

    const error_row = errors_table.insert();

    error_row.integration_app = app;
    error_row.error = error_text;

    Context.data.errors_table = errors_table;
}

async function prepare_data(): Promise<void> {
    const row = Context.data.print_forms_table![Context.data.table_counter!];

    Context.data.overdue_date = new Datetime().addDate(0, 0, 1);
    Context.data.print_form = row.print_form;
    Context.data.staff = row.staff;
    Context.data.employment_placement = row.employment_placement;
    Context.data.type_document_1c = row.type_document_1c;
}

async function check_table_counter(): Promise<number> {
    if (Context.data.counter! >= 99) {
        return 0;
    }

    if (Context.data.table_counter! < Context.data.print_forms_table!.length) {
        return 1;
    }

    return -1;
}

async function change_integration_app_status(): Promise<void> {
    const row = Context.data.print_forms_table![Context.data.table_counter!];
    const integration_app = await row.integration_app.fetch();
    integration_app.data.processed_elma = true;
    await integration_app.save();
}

async function getIntegrationAppsPack(): Promise<void> {
    const from = Context.data.from ?? 0;
    const size = Context.data.size ?? 100;

    const integration_apps = await Context.fields.awaiting_documents_table_1c.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.processed_elma.eq(false),
            f.document_creation_data.eq(null),
        ))
        .from(from)
        .size(size)
        .all();

    Context.data.integration_apps = integration_apps.length > 0 ? integration_apps : undefined;
    Context.data.from = from + size;
}

interface IStaffData {
    staff?: Staff,
    employment_placement?: EmploymentPlacement,
    id_1c?: string,
    individual_id_1c?: string,
}

async function getStaffData(integration_apps: IntegrationApp[]): Promise<IStaffData[]> {
    const staff_data: IStaffData[] = [];

    let staff_id_1c: string[] = [];

    integration_apps
        .filter(f => f.data.id_1c != undefined && f.data.id_1c != null)
        .map(f => f.data.id_1c!)
        .forEach(f => {
            let ids: string[] = JSON.parse(f);
            ids = ids.filter(id => id != null && id != undefined && id.trim() != "");
            staff_id_1c = [...staff_id_1c, ...ids];
        });

    const employment_placements = await Namespace.app.employment_directory.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.id_1c.in(staff_id_1c),
            f.__status.eq(Namespace.app.employment_directory.fields.__status.variants.actual)
        ))
        .size(staff_id_1c.length)
        .all();

    const staff_ids = employment_placements
        .filter(f => f.data.staff != undefined)
        .map(f => f.data.staff!.id)

    const staffs = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(staff_ids),
            f.__status.eq(Context.fields.staff.app.fields.__status.variants.signed_documents)
        ))
        .size(staff_ids.length)
        .all();

    for (const staff of staffs) {
        const employment_placement = employment_placements.find(f => f.data.staff?.id == staff.id);

        staff_data.push({
            staff: staff,
            employment_placement: employment_placement,
            id_1c: employment_placement?.data.id_1c,
            individual_id_1c: staff.data.individual_id_1c,
        });
    }

    return staff_data;
}

async function concatTables(): Promise<void> {
    const print_forms_table = Context.data.print_forms_table ?? Context.fields.print_forms_table.create();

    // Берем промежуточную таблицу с печатными формами.
    const buffer_table = Context.data.buffer_print_forms_table;

    if (!buffer_table || buffer_table.length == 0) {
        return;
    }

    // В промежуточной таблице, в каждой строке указана печатная форма и приложение интеграции, к которой эта печатная форма относится.
    // Выбираем из таблицы все идентификаторы приложений интеграции и оставляем только уникальные.
    const integration_app_ids = [...new Set(buffer_table
        .filter(f => f.integration_app != undefined)
        .map(f => f.integration_app.id)
    )];

    const integration_apps = await Context.fields.integration_apps.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(integration_app_ids)
        ))
        .size(integration_app_ids.length)
        .all();

    const staffs = await getStaffData(integration_apps);

    // Из таблицы получаем все строки связанные с текущим обрабатываемым приложением интеграции
    // и заполняем резульитрующую таблицу.
    for (const integration_app of integration_apps) {
        if (!integration_app.data.id_1c) {
            add_error(integration_app, `Отсутствуют идентификаторы сотрудников. App field "id_1c" is undefined`);
            continue;
        }

        // Идентификаторы сотрудников хранятся в виде массива строк JSON
        // Поэтому парсим строку, получаем массив и фильтруем записи
        let staff_guid_1c: string[] = JSON.parse(integration_app.data.id_1c);
        staff_guid_1c = staff_guid_1c.filter(f => f != null && f != undefined);

        if (staff_guid_1c.length == 0) {
            add_error(integration_app, 'Отсутствуют идентификаторы сотрудников. App field "id_1c" is empty');
            continue;
        }

        const staff_data = staffs.find(f => f.id_1c == staff_guid_1c[0]);

        if (!staff_data || !staff_data.staff || !staff_data.employment_placement) {
            add_error(integration_app, 'Не найден сотрудник с данным идентификатором 1С или он не трудоустроен');
            continue;
        }

        if (!staff_data.employment_placement.data.organization || staff_data.employment_placement.data.organization.id != Context.data.organization!.id) {
            add_error(integration_app, `По данному месту занятости (${staff_data.employment_placement.id}) не указана организация или не совпадает с организацией инициатора`);
            continue;
        }

        const doc_types = await Context.fields.type_document_1c.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
            ))
            .size(1000)
            .all();

        const print_forms = buffer_table
            .filter(f => f.integration_app?.id == integration_app.id)
            .map(f => {
                return {
                    print_form: f.print_form,
                    doc_type_1c: f.doc_type_1c
                }
            });

        if (!print_forms || print_forms.length == 0) {
            add_error(integration_app, 'Отсутствуют печатные формы. App field "print_forms_table" is undefined or empty');
            continue;
        }

        for (const row of print_forms) {
            const doc_type = doc_types.find(f => f.data.doc_type_id_1c == row.doc_type_1c?.id);

            const resultTableRow = print_forms_table.insert();
            resultTableRow.print_form = row.print_form;
            resultTableRow.staff = staff_data.staff;
            resultTableRow.employment_placement = staff_data.employment_placement;
            resultTableRow.integration_app = integration_app;

            if (!doc_type) {
                resultTableRow.type_document_1c = doc_types.find(f => f.data.app_code == 'other_documents')!;
            } else {
                resultTableRow.type_document_1c = doc_type;
            }
        }
    }

    Context.data.print_forms_table = print_forms_table;
}

async function checkPrintFormsTable(): Promise<boolean> {
    return Context.data.print_forms_table && Context.data.print_forms_table.length > 0 ? true : false;
}

async function reset_counter(): Promise<void> {
    Context.data.counter = 0;
}

async function increment_counter(): Promise<void> {
    Context.data.counter! += 1;
}

async function increment_table_counter(): Promise<void> {
    Context.data.table_counter! += 1;
}