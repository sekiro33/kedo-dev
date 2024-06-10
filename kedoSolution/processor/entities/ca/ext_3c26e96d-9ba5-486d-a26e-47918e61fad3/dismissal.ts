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
}

interface IDismissalData {
	staff: IStaffData,
	dismissal_date: string,
	base: string,
	comment?: string,
}

async function action(): Promise<void> {
	if (!Context.data.dismissal_data) {
		throw new Error("Context.data.dismissal_data is undefined");
	}

	const dismissal_data : IDismissalData = JSON.parse(Context.data.dismissal_data);
	const current_date = new Datetime();

	/*const body = {
		"Date": currentDate.format(),
		"Организация_Key": Context.data.org_id,
		"ОсвобождатьСтавки": true,
		"ОтразитьВТрудовойКнижке": true,
		"ОснованиеПриостановления_Key": "5507bb7e-4fee-11ed-9b35-fa163e02923f",
		"ДатаСобытия": currentDate.format(),
		"Сотрудники": [
			{
				"LineNumber": "1",
				"Сотрудник_Key": Context.data.guid,
				"ДатаНачала": `${Context.data.start_date!.format('YYYY-MM-DD')}T00:00:00`,
				"ДатаОкончания": Context.data.end_date ? `${Context.data.end_date}T00:00:00` : "0001-01-01T00:00:00"
			}
		],
		"ФизическиеЛица": [
			{
				"LineNumber": "1",
				"ФизическоеЛицо_Key": Context.data.personal_id
			}
		]
	}*/

	const body = {
		"Date": current_date.format('YYYY-MM-DDT00:00:00'),
		"ПериодРегистрации": current_date.format('YYYY-MM-01T00:00'),
		"Организация_Key": dismissal_data.staff.organization_id,
		"ДатаУвольнения": dismissal_data.dismissal_date,
		"Сотрудник_Key": dismissal_data.staff.id_1c,
		"ФизическоеЛицо_Key": dismissal_data.staff.individual_id_1c,
		"ОснованиеУвольнения": dismissal_data.base,
		"Комментарий": dismissal_data.comment ?? "",
		"ПорядокВыплаты": "Межрасчет",
	}

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = `Увольнение (${dismissal_data.staff.name})`;
	integration_app.data.document_odata_name = "Document_Увольнение";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.personal_guid_1c = JSON.stringify([dismissal_data.staff.individual_id_1c])
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.base_1c_name = Context.data.connection_name;
	integration_app.data.related_element = Context.data.app;

	await integration_app.save();

	Context.data.integration_app_id = integration_app.data.__id;
}