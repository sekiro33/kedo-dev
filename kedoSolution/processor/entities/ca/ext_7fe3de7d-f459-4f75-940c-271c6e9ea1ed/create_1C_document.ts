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

const documentNames = {
	wo_payment: '',
	sick_leave: 'БольничныйЛист',
	vacation: 'Отпуск'
}

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
	if (error !== null) {
		Context.data.error = error.message
	}

	const requestOptions: FetchRequest = {
		method: 'POST',
		headers: myHeaders,
	};
	const documentName = Context.data.doc_name;

	const resUrl = `${baseUrl}/Document_${documentName}(guid'${Context.data.id_dokumenta}')/Post?PostingModeOperational=false&$format=json`;

	try {
		const response = await fetch(`${encodeURI(resUrl)}`, requestOptions)
		if(response.status === 500) {
			Context.data.error = JSON.stringify(await response.json())
		}
	} catch (err){
		Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `
		throw new Error(err)
	}
}