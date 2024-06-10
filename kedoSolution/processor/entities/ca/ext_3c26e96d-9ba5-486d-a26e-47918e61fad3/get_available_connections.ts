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

async function action(): Promise<void> {
	const connection_list : ConnectionData[] = Namespace.params.data.connection_list_1c ? JSON.parse(Namespace.params.data.connection_list_1c) : [];
	Context.data.connection_list = JSON.stringify(connection_list);
	Context.data.connection_list_exist = connection_list && connection_list.length > 0;
}