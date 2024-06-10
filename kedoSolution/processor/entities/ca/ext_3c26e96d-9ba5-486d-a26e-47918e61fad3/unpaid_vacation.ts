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

interface IUnpaidVacation {
	staff: IStaffData,
	vacation_type: string,
	start_date: string,
	end_date: string,
	duration: number,
	part_during: boolean,
	statement: string,
	comment?: string,
}

async function action(): Promise<void> {
	if (!Context.data.vacation_data) {
		throw new Error("Context.data.vacation_data is undefined");
	}

	const current_date = new Datetime();
	const vacation_data: IUnpaidVacation = JSON.parse(Context.data.vacation_data);

	let body: any = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"ПериодРегистрации": current_date.format("YYYY-MM-01T00:00:00"),
		"Организация_Key": vacation_data.staff.organization_id,
		"Сотрудник_Key": vacation_data.staff.id_1c,
		"ФизическоеЛицо_Key": vacation_data.staff.individual_id_1c,
		"ВидОтпуска_Key": vacation_data.vacation_type,
		"ДатаНачала": vacation_data.start_date,
		"ДатаОтсутствия": vacation_data.start_date,
		"ДатаОкончания": vacation_data.end_date,
		"ОтсутствиеВТечениеЧастиСмены": vacation_data.part_during,
		"Основание": vacation_data.statement,
		"Комментарий": vacation_data.comment,
		"ПорядокВыплаты": "Межрасчет",
	};

	// Если отсутствие в течение дня (т.е. несколько часов), то указываем количество часов отпуска.
	if (vacation_data.part_during == true) {
		body = {
			...body,
			"ЧасовОтпуска": vacation_data.duration,
		}
	}

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = `Отпуск без сохранения оплаты (${vacation_data.staff.name})`;
	integration_app.data.document_odata_name = "Document_ОтпускБезСохраненияОплаты";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.personal_guid_1c = JSON.stringify([vacation_data.staff.individual_id_1c]);
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.base_1c_name = Context.data.connection_name;
	integration_app.data.related_element = Context.data.app;

	await integration_app.save()

	Context.data.integration_app_id = integration_app.data.__id;
}