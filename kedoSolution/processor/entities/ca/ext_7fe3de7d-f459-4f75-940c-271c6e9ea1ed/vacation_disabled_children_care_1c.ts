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

interface Days {
	LineNumber : number,
	"Дата" : string,
}

async function action(): Promise<void> {
	const date = new Datetime();

	const body = {
		"Date": `${date.format('YYYY-MM-DD')}T00:00:00`,
		"ПериодРегистрации": `${date.format('YYYY-MM')}-01T00:00:00`,
		"Организация_Key": Context.data.organization_id_1c ?? "",
		"Сотрудник_Key": Context.data.staff_id_1c ?? "",
		"ФизическоеЛицо_Key": Context.data.staff_personal_id_1c ?? "",
		"ДатаНачала": `${Context.data.start_date}T00:00:00`,
		"ДатаОкончания": `${Context.data.end_date}T00:00:00`,
		"Комментарий": Context.data.comment ?? "",
		"СведенияОВторомРодителе": Context.data.second_parent_info ?? "",
		"ПорядокВыплаты": "Аванс",
		"ДниУхода" : [],
	}

	const days : Days[]  = [];
	const start_date = new Datetime(Context.data.start_date!, "YYYY-MM-DD");
	const duration = Context.data.duration!;

	for (let i = 0; i < duration; i++) {
		const date = start_date.addDate(0,0,i);
		days.push({
			LineNumber: i + 1,
			"Дата" : date.format('YYYY-MM-DD'),
		});
	}

	body['ДниУхода'] = days as any;

	const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c;
	const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create();

	awaitingApp.data.__name = "Оплата дней ухода за детьми-инвалидами";
	awaitingApp.data.document_odata_name = "Document_ОплатаДнейУходаЗаДетьмиИнвалидами";
	awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.staff_personal_id_1c]);
	awaitingApp.data.accounting_systems = accounting1c;
	awaitingApp.data.document_creation_data = JSON.stringify(body);
	awaitingApp.data.additional_info = Context.data.additional_info ?? "";
	awaitingApp.data.base_1c_name = Context.data.connection_name ?? undefined;
	await awaitingApp.save();

	Context.data.integration_app_id = awaitingApp.data.__id
}