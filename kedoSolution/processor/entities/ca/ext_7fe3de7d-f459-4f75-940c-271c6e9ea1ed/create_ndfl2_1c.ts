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

let baseUrl: string;
let login: string
let password: string
let myHeaders: any

function getConnectionInfo(): Error | null {
	const connectionsArray = Namespace.params.data.list_of_connected_platforms ? JSON.parse(Namespace.params.data.list_of_connected_platforms) : undefined;
	if (!connectionsArray) {
		return new Error(`Не найдено записей подключения`)
	}
	

	const currentConnection = connectionsArray.length > 1 ? connectionsArray.find((item: any) => {
		return item.name === Context.data.connection_name
	}) : connectionsArray[0]
	if(!currentConnection) {
		return new Error(`Не найдено подключение c именем ${Context.data.connection_name}`)
	}

	baseUrl = currentConnection.url;
	login = currentConnection.login
	password = currentConnection.password
	myHeaders = {
		Authorization: `Basic ${btoa(login + ':' + password)}`,
	};
	return null
}

async function action(): Promise<void>{
	const currentDate = new TDate();
	
	const body: any = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"Организация_Key": Context.data.org_id,
		"Сотрудник_Key": Context.data.personal_id,
		"НалоговыйПериод": Context.data.period,
		"СпособФормирования": "ВРазрезеКодовОКАТО",
	}

	const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c
	const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create()
	awaitingApp.data.__name = "Справка НДФЛ"
	awaitingApp.data.document_odata_name = "Document_СправкаНДФЛ"
	awaitingApp.data.accounting_systems = accounting1c
	awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.personal_id])
	awaitingApp.data.document_creation_data = JSON.stringify(body);
	awaitingApp.data.additional_info = Context.data.additional_info ?? "";
	awaitingApp.data.base_1c_name = Context.data.connection_name;
	await awaitingApp.save()

	Context.data.integration_app_id = awaitingApp.data.__id
	
}