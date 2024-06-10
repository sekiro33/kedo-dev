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
	const codes = [
		// Использовать Личный кабинет (КЭДО 2.0)
		"use_my_profile"
	];

	const settings = await Namespace.params.fields.settings.app.search()
		.where((f, g) => g.and(
			f.__deletedAt.eq(null),
			f.code.in(codes)
		))
		.size(codes.length)
		.all();

	const use_my_profile = settings.find(f => f.data.code === "use_my_profile")?.data.status ?? false;
	
	const portal = use_my_profile == true ? "my_profile" : "_start_page";

	Context.data.portal_link = `${System.getBaseUrl()}/_portal/kedo_ext/${portal}`;
}