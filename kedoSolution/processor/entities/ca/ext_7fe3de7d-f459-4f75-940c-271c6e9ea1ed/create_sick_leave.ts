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
	if (!currentConnection) {
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

async function action(): Promise<void> {
	const currentDate = new TDate();

	const body = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"Сотрудник_Key": Context.data.id_employee,
		"ФизическоеЛицо_Key": Context.data.individual_id_1c,
		"Организация_Key": Context.data.org_id,
		"ДатаНачала": `${Context.data.start_date!}T00:00:00`,
		"ДатаОкончания": `${Context.data.end_date!}T00:00:00`,
		"КодПричиныНетрудоспособности": "05",
		"НазначитьПособие": true,
		"РассчитатьЗарплату": true,
		"ПериодРегистрации": `${currentDate.format('YYYY-MM')}-01T00:00:00`,
		"ПорядокВыплаты": "Межрасчет",
		"Комментарий": Context.data.vacation_statment || "Личное заявление сотрудника",
	}

	if (!Context.data.alternative_way) {
		const error = getConnectionInfo()
		if (error != null) {
			Context.data.error = error.message
			return
		}
		const requestOptions: FetchRequest = {
			method: 'POST',
			headers: myHeaders,
		};

		requestOptions.body = JSON.stringify(body);

		const resUrl = `${baseUrl}/Document_БольничныйЛист?$format=json`;

		try {
			const response = await fetch(`${encodeURI(resUrl)}`, requestOptions)
			if (!response.ok) {
				Context.data.error += ` staff data res.status error; resUrl - ${resUrl} `
				throw new Error(`res error ${resUrl}`);
			}

			Context.data.response = JSON.stringify(await response.json());
		} catch (err) {
			Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `
			throw new Error(err)
		}
	} else {
		const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c
		const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create()
		awaitingApp.data.__name = "Больничный по беременности и родам"
		awaitingApp.data.document_odata_name = "Document_БольничныйЛист"
		awaitingApp.data.accounting_systems = accounting1c
		awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.individual_id_1c])
		awaitingApp.data.document_creation_data = JSON.stringify(body)
		awaitingApp.data.additional_info = Context.data.additional_info ?? "";
		awaitingApp.data.base_1c_name = Context.data.connection_name;
		await awaitingApp.save()

		Context.data.integration_app_id = awaitingApp.data.__id;
	}
}