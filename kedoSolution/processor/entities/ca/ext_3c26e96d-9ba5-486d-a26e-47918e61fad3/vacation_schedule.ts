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

interface IScheduleDocument {
	"Date": string,
	"Организация_Key": string,
	"ДатаСобытия": string,
	"Сотрудники": IScheduleLine[],
	"Комментарий"?: string,
}

interface IVacationElement {
	staffId: string,
	staffPersonalId: string,
	startDate: string,
	endDate: string,
	duration: number,
	vacationType: string,
	comment?: string,
}

interface IScheduleLine {
	"Сотрудник_Key": string,
	"ФизическоеЛицо_Key": string,
	"ВидОтпуска_Key": string,
	"ДатаНачала": string,
	"ДатаОкончания": string,
	"КоличествоДней": number,
	"Примечание": string,
}

async function action(): Promise<void> {
	if (!Context.data.vacation_schedule_data) {
		throw new Error("Context.data.vacation_schedule_data is undefined");
	}

	const vacation_data: IVacationElement[] = JSON.parse(Context.data.vacation_data);

	const current_date = new Datetime();

	const schedule_table: IScheduleLine[] = vacation_data.map((line) => {
		return {
			"Сотрудник_Key": line.staffId,
			"ФизическоеЛицо_Key": line.staffPersonalId,
			"ВидОтпуска_Key": line.vacationType,
			"ДатаНачала": `${line.startDate}T00:00:00`,
			"ДатаОкончания": `${line.endDate}T00:00:00`,
			"КоличествоДней": line.duration,
			"Примечание": line.comment ?? "",
		}
	});

	const body: IScheduleDocument = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"Организация_Key": Context.data.organization_id ?? "",
		"ДатаСобытия": current_date.format("YYYY-MM-DDT00:00:00"),
		"Сотрудники": schedule_table,
		"Комментарий": Context.data.comment ?? "",
	};

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = "График отпусков";
	integration_app.data.document_odata_name = "Document_ГрафикОтпусков";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.base_1c_name = Context.data.connection_name;

	await integration_app.save();

	Context.data.integration_app_id = integration_app.data.__id;
}