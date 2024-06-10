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
	const error = getConnectionInfo()
	if (error != null) {
		Context.data.error = error.message
		return
	}
	const requestOptions: FetchRequest = {
		method: 'GET',
		headers: myHeaders,
	};

	const resUrl = `${baseUrl}/Document_ГрафикОтпусков?$format=json`;

	try {
		const response = await fetch(`${encodeURI(resUrl)}`, requestOptions)
		if (!response.ok) {
			const responseText = await response.text()
			Context.data.error += ` staff data res.status error; resUrl - ${resUrl} `
			throw new Error(`status ${response.status} res error ${resUrl}, err text ${responseText}`)
		}
		const parsedResponse = await response.json()
		const vacationsArray = parsedResponse.value
		const lastElement = vacationsArray[vacationsArray.length - 1]
		Context.data.response = JSON.stringify(vacationsArray);
		Context.data.last_vacation_schedule = lastElement

	} catch (err){
		Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `
		throw new Error(err.message)
	}

	
}