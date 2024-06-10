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
	const payslipApp = Namespace.params.fields.payslip_app.app.create()

	const currentDate = new Datetime()
	payslipApp.data.__name = "Запрос от " + currentDate.format('DD.MM.YYYY');
	payslipApp.data.end_date = Context.data.end_date
	payslipApp.data.start_date = Context.data.start_date
	payslipApp.data.personal_id = Context.data.personal_id
	if (Context.data.connection_name) {
		payslipApp.data.base_1c_name = Context.data.connection_name
	}
	await payslipApp.save()

	Context.data.id_payslip_app = payslipApp.data.__id
}