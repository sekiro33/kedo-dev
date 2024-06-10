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


interface IScheduleVacationMove {
	staff: IStaffData,
	old_start_date: string,
	vacation_type : string,
	reason: string,
	comment?: string,
	move: {
		start_date: string,
		end_date: string,
		duration: number,
	}[],
}

async function action(): Promise<void> {
	if (!Context.data.move_data) {
		throw new Error("Context.data.move_date is undefined");
	}

	const current_date = new Datetime();
	const move_data: IScheduleVacationMove = JSON.parse(Context.data.move_data);

	const body = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"ПериодРегистрации" : current_date.format("YYYY-MM-01T00:00:00"),
		"Организация_Key": move_data.staff.organization_id,
		"Сотрудник_Key": move_data.staff.id_1c,
		"ФизическоеЛицо_Key": move_data.staff.individual_id_1c,
		"ВидОтпуска_Key": move_data.vacation_type,
		"ИсходнаяДатаНачала": move_data.old_start_date,
		"ПереносПоИнициативеСотрудника": true,
		"Комментарий": move_data.comment ?? "",
		"ПричинаПереноса": move_data.reason,
		"Переносы": move_data.move.map(f => {
			return {
				"ДатаНачала": f.start_date,
				"ДатаОкончания": f.end_date,
				"КоличествоДней": f.duration,
			}
		})
	};

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = `Перенос отпуска по графику отпусков (${move_data.staff.name})`;
	integration_app.data.document_odata_name = "Document_ПереносОтпуска";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.personal_guid_1c = JSON.stringify([move_data.staff.individual_id_1c]);
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.base_1c_name = Context.data.connection_name;
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.related_element = Context.data.app;

	await integration_app.save();

	Context.data.integration_app_id = integration_app.data.__id;
}