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

interface IStaffData {
	name: string,
	id_1c: string,
	individual_id_1c: string,
	organization_id: string,
	position_id: string,
}

interface IBaseVacation {
	staff: IStaffData,
	start_date?: string,
	end_date?: string,
	duration? : number,
	provide_basic: boolean,
	provide_additional: boolean,
	additional_vacations: IAdditionalVacation[],
	statement?: string,
	planned_pay_date : string,
	comment?: string,
}

interface IAdditionalVacation {
	vacation_type: string,
	start_date: string,
	end_date: string,
	duration: number,
	statement: string,
}

async function action(): Promise<void> {
	if (!Context.data.vacation_data) {
		throw new Error("Context.data.vacation_data is undefined");
	}

	const current_date = new Datetime();
	const vacation_data: IBaseVacation = JSON.parse(Context.data.vacation_data);

	let body: any = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"ПериодРегистрации": current_date.format("YYYY-MM-01T00:00:00"),
		"Организация_Key": vacation_data.staff.organization_id,
		"ФизическоеЛицо_Key": vacation_data.staff.individual_id_1c,
		"Сотрудник_Key": vacation_data.staff.id_1c,
		"ПланируемаяДатаВыплаты" : vacation_data.planned_pay_date,
		"РассчитатьЗарплату": true,
		"АвтозаполнениеПериодовОплаты": true,
		"ПорядокВыплаты": "Межрасчет",
	};

	if (vacation_data.provide_basic == true) {
		body = {
			...body,
			"ПредоставитьОсновнойОтпуск": true,
			"ДатаНачалаОсновногоОтпуска": vacation_data.start_date,
			"ДатаНачалаПериодаОтсутствия": vacation_data.start_date,
			"ДатаОкончанияПериодаОтсутствия": vacation_data.end_date,
			"ДатаОкончанияОсновногоОтпуска": vacation_data.end_date,
			"КоличествоДнейОсновногоОтпуска": vacation_data.duration,
			"Основание": vacation_data.statement,
		};
	}

	if (vacation_data.provide_additional == true) {
		body = {
			...body,
			"ПредоставитьДополнительныйОтпуск": true,
			"ДополнительныеОтпуска": vacation_data.additional_vacations
				.map(v => {
					return {
						"ВидОтпуска_Key": v.vacation_type,
						"КоличествоДней": v.duration,
						"ДатаНачала": v.start_date,
						"ДатаОкончания": v.end_date,
						"Основание": v.statement,
					}
				}),
		};
	}

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	let integration_app: ApplicationItem<Application$kedo$awaiting_documents_table_1c$Data, Application$kedo$awaiting_documents_table_1c$Params> | undefined;

	// Если перенос отпуск и есть ID документа в 1С
	if (Context.data.vacation_transfer == true && Context.data.document_1c_id) {
		integration_app = await Namespace.params.fields.integration_app.app.search()
			.where((f, g) => g.and(
				f.__deletedAt.eq(null),
				f.doc_id_1c.eq(Context.data.document_1c_id!)
			))
			.first();

		if (!integration_app) {
			throw new Error(`Не удалось найти приложение интеграции по заданному ID документа 1С: ${Context.data.document_1c_id}`);
		}

		const ready_status = Namespace.params.fields.integration_app.app.fields.__status.variants.ready;

		integration_app.data.document_creation_data = JSON.stringify(body);
		integration_app.data.isCorrection = true;
		integration_app.data.status_1c = undefined;
		integration_app.data.additional_info = Context.data.additional_info ?? "";
		integration_app.data.base_1c_name = Context.data.connection_name ?? undefined;
		integration_app.data.related_element = Context.data.app;

		await integration_app.setStatus(ready_status);
	} else {
		integration_app = Namespace.params.fields.integration_app.app.create();

		integration_app.data.__name = `Отпуск (${vacation_data.staff.name})`;
		integration_app.data.document_odata_name = "Document_Отпуск";
		integration_app.data.accounting_systems = accounting1c;
		integration_app.data.personal_guid_1c = JSON.stringify([vacation_data.staff.individual_id_1c]);
		integration_app.data.document_creation_data = JSON.stringify(body)
		integration_app.data.additional_info = Context.data.additional_info ?? "";
		integration_app.data.base_1c_name = Context.data.connection_name;
		integration_app.data.related_element = Context.data.app;
	}

	await integration_app.save();
	Context.data.integration_app_id = integration_app.data.__id;
}