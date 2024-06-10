/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
Документация TS SDK доступна на сайте https://tssdk.elma365.com.

Сигнатуры функций

Для синхронного взаимодействия:
	async function action(): Promise<void>;

Для модели проверки результата:
	async function action(): Promise<void>;
	async function check(): Promise<boolean>;

Для модели обратного вызова:
	async function action(url: string): Promise<void>;
	async function callback(req: HTTPRequest): Promise<void>;

**/

interface IStaffData {
	name: string,
	id_1c: string,
	individual_id_1c: string,
	organization_id: string,
	position_id: string,
	structural_subdivision_id: string,
}

interface IWeekendHolidaysWork {
	work_table: {
		staff: IStaffData,
		date: string,
		duration: number,
		compensation: string,
	}[],
	organization_id: string,
	reason: string,
	comment?: string,
}

async function action(): Promise<void> {
	if (!Context.data.weekends_holidays_data) {
		throw new Error("Context.data.weekends_holidays_data is undefined");
	}

	const current_date = new Datetime();
	const weekend_holidays_work_data: IWeekendHolidaysWork = JSON.parse(Context.data.weekends_holidays_data);

	const body = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"ПериодРегистрации": current_date.format("YYYY-MM-01T00:00:00"),
		"Организация_Key": weekend_holidays_work_data.organization_id,
		"Причина": weekend_holidays_work_data.reason,
		"Сотрудники": weekend_holidays_work_data.work_table.map((r, index) => {
			return {
				"LineNumber" : index + 1,
				"Сотрудник_Key": r.staff.id_1c,
				"Дата": r.date,
				"ОтработаноЧасов": r.duration,
				"СпособКомпенсацииПереработки": r.compensation,
			}
		}),
		"ФизическиеЛица": weekend_holidays_work_data.work_table.map((r, index) => {
			return {
				"LineNumber" : index + 1,
				"ФизическоеЛицо_Key": r.staff.individual_id_1c,
			}
		}),
		"СогласиеТребуется": true,
		"ВремяВЧасах": true,
		"ВремяУчтено": true,
		"СогласиеПолучено": true,
		"Комментарий": weekend_holidays_work_data.comment ?? "",
	};

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = `Работа в выходные и праздничные дни`;
	integration_app.data.document_odata_name = "Document_РаботаВВыходныеИПраздничныеДни";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.personal_guid_1c = JSON.stringify(weekend_holidays_work_data.work_table.map(f => f.staff.individual_id_1c));
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.base_1c_name = Context.data.connection_name;
	integration_app.data.related_element = Context.data.app;

	await integration_app.save();

	Context.data.integration_app_id = integration_app.data.__id;
}