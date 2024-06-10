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
		return new Error(`Не найдено записей подключения`);
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

interface IScheduleDocument {
	"Date": string,
	"Организация_Key": string,
	"ДатаСобытия": string,
	"Сотрудники": IScheduleLine[],
	"Комментарий"?: string,
}

interface IVacationElement {
	staffId: string,
	staffPersonalId: string,
	startDate: string,
	endDate: string,
	duration: number,
	vacationType: string,
	comment? : string,
}

interface IScheduleLine {
	"Сотрудник_Key": string,
	"ФизическоеЛицо_Key": string,
	"ВидОтпуска_Key": string,
	"ДатаНачала": string,
	"ДатаОкончания": string,
	"КоличествоДней": number,
	"Примечание": string,
}

async function action(): Promise<void> {
	if (!Context.data.vacation_data) {
		throw new Error("Context.data.vacation_data is undefined");
	}

	const current_date = new Datetime();

	const vacation_data : IVacationElement[] = JSON.parse(Context.data.vacation_data);

	/*
		Основной отпуск:
		bdd723d2-a9fe-4a8b-8c37-d8fe02245ea1
	*/

	const schedule_table: IScheduleLine[] = vacation_data.map((line) => {
		return {
			"Сотрудник_Key": line.staffId,
			"ФизическоеЛицо_Key": line.staffPersonalId,
			"ВидОтпуска_Key": line.vacationType,
			"ДатаНачала": `${line.startDate}T00:00:00`,
			"ДатаОкончания": `${line.endDate}T00:00:00`,
			"КоличествоДней": line.duration,
			"Примечание": line.comment ?? "",
		}
	})

	const body: IScheduleDocument = {
		Date: current_date.format("YYYY-MM-DDT00:00:00"),
		"Организация_Key": Context.data.organization_id ?? "",
		"ДатаСобытия": current_date.format("YYYY-MM-DDT00:00:00"),
		"Сотрудники": schedule_table,
		"Комментарий": Context.data.comment ?? "",
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

		const resUrl = `${baseUrl}/Document_ГрафикОтпусков?$format=json`;

		try {
			const response = await fetch(`${encodeURI(resUrl)}`, requestOptions)
			if (!response.ok) {
				Context.data.error += ` staff data res.status error; resUrl - ${resUrl} `;
				//throw new Error(`Response: ${JSON.stringify(response)}, Headers: ${JSON.stringify(myHeaders)}, Body: ${JSON.stringify(body)}`);
				throw new Error(`res error ${resUrl}`);
			}

			Context.data.response = JSON.stringify(await response.json());
		} catch (err) {
			Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `;
			throw new Error(err);
		}
	} else {
		const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c
		const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create()
		awaitingApp.data.__name = "График отпусков"
		awaitingApp.data.document_odata_name = "Document_ГрафикОтпусков"
		awaitingApp.data.accounting_systems = accounting1c
		awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.individual_id_1c])
		awaitingApp.data.document_creation_data = JSON.stringify(body)
		awaitingApp.data.additional_info = Context.data.additional_info ?? "";
		awaitingApp.data.base_1c_name = Context.data.connection_name;
		await awaitingApp.save()

		Context.data.integration_app_id = awaitingApp.data.__id
	}
}