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

interface IFinancialAssistanceData {
	creationAt : string,
	organizationId : string,
	subdivisionId : string,
	staffId : string,
	individualId: string
	money: number,
	comment? : string,
}

async function action(): Promise<void> {
	if (!Context.data.document_data) {
		throw new Error("Данные для создания документа не указаны. Context.data.document_data is undefined");
	}

	const financial_assistance_data : IFinancialAssistanceData = JSON.parse(Context.data.document_data);

	const currentDate = new Datetime();

	const body: any = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"ПериодРегистрации" : `${currentDate.format('YYYY-MM')}-01T00:00:00`,
		"Организация_Key": financial_assistance_data.organizationId,
		"ДатаНачала": financial_assistance_data.creationAt,
		"ДатаОкончания": financial_assistance_data.creationAt,
		"ОснованиеВыплаты": "Заявление сотрудника",
		"Комментарий": financial_assistance_data.comment ?? "",
		"ПорядокВыплаты":"Межрасчет",
		"Начисления": [
			{
				"LineNumber": "1",
				"Сотрудник_Key": financial_assistance_data.staffId,
				"Подразделение_Key": financial_assistance_data.subdivisionId,
				"ДатаНачала": financial_assistance_data.creationAt,
				"ДатаОкончания": financial_assistance_data.creationAt,
				"Результат" : financial_assistance_data.money,
			}
		],
	}

	const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c
	const integration_app = Namespace.params.fields.awaiting_docs_table_1c.app.create()

	integration_app.data.__name = "Материальная помощь"
	integration_app.data.document_odata_name = "Document_МатериальнаяПомощь"
	integration_app.data.accounting_systems = accounting1c
	integration_app.data.personal_guid_1c = JSON.stringify([financial_assistance_data.individualId])
	integration_app.data.document_creation_data = JSON.stringify(body)
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.base_1c_name = Context.data.connection_name ?? undefined;
	await integration_app.save()

	Context.data.integration_app_id = integration_app.data.__id
}