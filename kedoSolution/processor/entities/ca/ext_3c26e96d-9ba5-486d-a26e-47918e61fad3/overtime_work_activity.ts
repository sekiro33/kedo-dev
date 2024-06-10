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

interface IOvertimeWork {
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
	if (!Context.data.overtime_work_data) {
		throw new Error("Context.data.overtime_work_data is undefined");
	}

	const current_date = new Datetime();
	const overtime_work_data: IOvertimeWork = JSON.parse(Context.data.overtime_work_data);

	const body = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"ПериодРегистрации": current_date.format("YYYY-MM-01T00:00:00"),
		"Организация_Key": overtime_work_data.organization_id,
		"Причина": overtime_work_data.reason,
		"Сотрудники": overtime_work_data.work_table.map(r => {
			return {
				"Сотрудник_Key": r.staff.id_1c,
				"Дата": r.date,
				"ОтработаноЧасов": r.duration,
				"СпособКомпенсацииПереработки": r.compensation,
			}
		}),
		"ФизическиеЛица" : overtime_work_data.work_table.map(r => {
			return {
				"ФизическоеЛицо_Key" : r.staff.individual_id_1c,
			}
		}),
		"СогласиеПолучено": true,
		"БухучетЗаданВСтрокахДокумента": false,
		"Комментарий": overtime_work_data.comment ?? "",
	};

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = "Работа в нерабочее время";
	integration_app.data.document_odata_name = "Document_РаботаСверхурочно";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.personal_guid_1c = JSON.stringify(overtime_work_data.work_table.map(f => f.staff.individual_id_1c));
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.base_1c_name = Context.data.connection_name ?? undefined;
	integration_app.data.related_element = Context.data.app;
	
	await integration_app.save();

	Context.data.integration_app_id = integration_app.data.__id;
}