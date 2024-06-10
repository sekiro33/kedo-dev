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

async function action(): Promise<void> {
	const currentDatetime = new Datetime();

	const body = {
		"Date": `${currentDatetime.format('YYYY-MM-DD')}T00:00:00`,
		"ПериодРегистрации": `${currentDatetime.format('YYYY-MM')}-01T00:00:00`,
		"Организация_Key": Context.data.organization_id_1c ?? '',
		"Сотрудник_Key": Context.data.staff_id_1c ?? '',
		"ФизическоеЛицо_Key": Context.data.staff_personal_id_1c ?? '',
		"УчитыватьМРОТПриОплатеПоСреднемуЗаработку" : true,
		"ДатаНачалаСобытия" : `${Context.data.start_date}T00:00:00`,
		"ДатаНачала": `${Context.data.start_date}T00:00:00`,
		"ДатаОкончания": `${Context.data.end_date}T00:00:00`,
		"Комментарий": Context.data.comment ?? '',
		"ВидВремени_Key": "776adff2-7a6b-11e2-9362-001b11b25590",
		"ВидРасчета_Key": "190d5ee1-24f6-11e3-93e6-001b11b25590",
	}

	const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c;
	const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create();

	awaitingApp.data.__name = "Донорство";
	awaitingApp.data.document_odata_name = "Document_ОплатаПоСреднемуЗаработку";
	awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.staff_personal_id_1c]);
	awaitingApp.data.accounting_systems = accounting1c;
	awaitingApp.data.document_creation_data = JSON.stringify(body);
	awaitingApp.data.base_1c_name = Context.data.connection_name ?? undefined,
	awaitingApp.data.additional_info = Context.data.additional_information ?? "",
	await awaitingApp.save();

	Context.data.integration_app_id = awaitingApp.data.__id
}