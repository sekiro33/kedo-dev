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
	const payslip = Namespace.params.fields.payslip_requests.app.create();

	const current_date = new Datetime();

	payslip.data.__name = `Запрос на РЛ от ${current_date.format("DD.MM.YYY HH:mm")}`;
	payslip.data.start_date = Context.data.start_date;
	payslip.data.end_date = Context.data.end_date;
	payslip.data.personal_id = Context.data.personal_id;
	payslip.data.base_1c_name = Context.data.connection_name;

	await payslip.save();

	Context.data.payslip_request_id = payslip.id;
}