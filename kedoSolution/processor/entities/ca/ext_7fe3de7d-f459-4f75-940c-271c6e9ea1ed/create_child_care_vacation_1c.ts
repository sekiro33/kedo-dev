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
	let planned_payment_date = ''

	if (!Context.data.planned_payment_date) {
		const startDate = new Datetime(Context.data.start_date!, 'YYYY-MM-DD');
		planned_payment_date = startDate.addDate(0, 0, -3).format('YYYY-MM-DD');
	} else {
		planned_payment_date = Context.data.planned_payment_date!;
	}

	const body = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"ВыплачиватьПособиеДоТрехЛет": false,
		"ПериодРегистрации": `${currentDate.format('YYYY-MM')}-01T00:00:00`,
		"ПланируемаяДатаВыплаты": `${planned_payment_date}T00:00:00`,
		"ДатаЗапрета": `${Context.data.start_date}T00:00:00`,
		"ДатаНачала": `${Context.data.start_date}T00:00:00`,
		"ДатаОкончания": `${Context.data.end_date}T00:00:00`,
		"НеНачислятьЗарплатуИНеВыплачиватьАвансВоВремяОтпуска": !!Context.data.pay_during_vacation,
		"Организация_Key": Context.data.org_id,
		"ОсновнойСотрудник_Key": Context.data.guid,
		"ПорядокВыплаты": "Межрасчет",
		"РайонныйКоэффициентРФнаНачалоСобытия": 1,
		"РассчитатьЗарплату": false,
		"РасчетПоПравилам2010Года": false,
		"Сотрудник_Key": Context.data.guid,
		"ФиксПериодРасчетаСреднегоЗаработка": false,
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

		Context.data.debug = 'fetch'
		const resUrl = `${baseUrl}/Document_ОтпускПоУходуЗаРебенком?$format=json`;

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
		awaitingApp.data.__name = `Отпуск по уходу за ребенком ${Context.data.staff_full_name ? `(${Context.data.staff_full_name})` : ""}`;
		awaitingApp.data.document_odata_name = "Document_ОтпускПоУходуЗаРебенком"
		awaitingApp.data.accounting_systems = accounting1c
		awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.personal_id])
		awaitingApp.data.document_creation_data = JSON.stringify(body)
		awaitingApp.data.additional_info = Context.data.additional_info ?? "";
		awaitingApp.data.base_1c_name = Context.data.connection_name;
		await awaitingApp.save()

		Context.data.integration_app_id = awaitingApp.data.__id
	}
}