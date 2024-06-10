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

interface IBloodDonation {
	staff: IStaffData,
	start_date: string,
	end_date: string,
	comment?: string,
}

async function action(): Promise<void> {
	if (!Context.data.vacation_data) {
		throw new Error(`Context.data.vacation_data is undefined`);
	}

	const current_date = new Datetime();
	const vacation_data: IBloodDonation = JSON.parse(Context.data.vacation_data);

	const body = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"ПериодРегистрации": current_date.format('YYYY-MM-01T00:00:00'),
		"Организация_Key": vacation_data.staff.organization_id,
		"Сотрудник_Key": vacation_data.staff.id_1c,
		"ФизическоеЛицо_Key": vacation_data.staff.individual_id_1c,
		"УчитыватьМРОТПриОплатеПоСреднемуЗаработку": true,
		"ДатаНачалаСобытия": vacation_data.start_date,
		"ДатаНачала": vacation_data.start_date,
		"ДатаОкончания": vacation_data.end_date,
		"Комментарий": vacation_data.comment,
		"ВидВремени_Key": "776adff2-7a6b-11e2-9362-001b11b25590",
		"ВидРасчета_Key": "190d5ee1-24f6-11e3-93e6-001b11b25590",
	}

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = `Донорство (${vacation_data.staff.name})`;
	integration_app.data.document_odata_name = "Document_ОплатаПоСреднемуЗаработку";
	integration_app.data.personal_guid_1c = JSON.stringify([vacation_data.staff.individual_id_1c]);
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.base_1c_name = Context.data.connection_name ?? undefined;
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.related_element = Context.data.app;

	await integration_app.save();

	Context.data.integration_app_id = integration_app.data.__id
}