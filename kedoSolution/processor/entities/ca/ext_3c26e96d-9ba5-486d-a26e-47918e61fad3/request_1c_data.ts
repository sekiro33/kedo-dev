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

interface ConnectionData {
	name: string,
	url: string,
	password: string,
	login: string,
}

function getConnectionList(): ConnectionData[] {
	const connection_list = Namespace.params.data.connection_list_1c;
	const connections: ConnectionData[] = connection_list ? JSON.parse(connection_list) : [];

	return connections;
}

function getConnection(connection_name: string | undefined): ConnectionData {
	if (!connection_name) {
		throw new Error("Отсутствует название подключения");
	}

	const connection_list = getConnectionList();

	if (!connection_list || connection_list.length == 0) {
		throw new Error("Не найдены записи подключений")
	}

	const connection = connection_list.find(f => f.name === connection_name);

	if (!connection) {
		throw new Error(`Подключение "${connection_name}" не найдено`);
	}

	return connection;
}

async function action(): Promise<void> {
	const connection = getConnection(Context.data.connection_name);

	const request_options: FetchRequest = {
		method: Context.data.method ? Context.data.method : "GET",
		headers: {
			Authorization: `Basic ${btoa(`${connection.login}:${connection.password}`)}`,
		},
		body: Context.data.request_body,
	};

	const url = `${connection.url}/${Context.data.request_params}`;

	try {
		const response = await fetch(`${encodeURI(url)}`, request_options);

		if (!response.ok) {
			throw new Error(JSON.stringify(response));
		}

		const result = await response.json();

		Context.data.response_1c_json = JSON.stringify(result);
	} catch (error) {
		Context.data.error = JSON.stringify({
			name: error.name,
			message: error.message,
			stack: error.stack,
		});

		throw new Error(error);
	}
}