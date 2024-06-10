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
	if (!Context.data.app) {
		return
		//throw new Error("Context.data.app is undefined");
	}

	if (!Context.data.status) {
		throw new Error("Context.data.status is undefined");
	}

	const app = await Context.data.app.fetch();
	const status_code = Context.data.status.code;

	// const status = await Context.fields.kedo_status.app.search()
	// 	.where((f, g) => g.and(
	// 		f.__deletedAt.eq(null),
	// 		f.code.eq(status_code)
	// 	))
	// 	.first();

	// const status = await Namespace.params.fields.kedo_status.app.search()
	const status = await Context.fields.kedo_status.app.search()
		.where((f, g) => g.and(
			f.__deletedAt.eq(null),
			f.code.eq(status_code)
		))
		.first();

	app.data.kedo_status = status;
	await app.save();
}