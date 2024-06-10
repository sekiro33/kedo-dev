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
	structural_subdivision_id: string,
}

interface TransferData {
	staff: IStaffData,
	start_date: string,
	end_date?: string,
	reason: string,
	base: string,
	comment?: string,
	work_place?: string,
	remote_work?: boolean,
	position_id?: string,
	subdivison_id?: string,
	work_schedule_id?: string,
	temporary_transfer?: boolean,
}

async function action(): Promise<void> {
	if (!Context.data.transfer_staff_data) {
		throw new Error("Context.data.transfer_staff_data is undefined");
	}

	const current_date = new Datetime();
	const transfer: TransferData = JSON.parse(Context.data.transfer_staff_data);

	const body: any = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"Организация_Key": transfer.staff.organization_id,
		"Сотрудник_Key": transfer.staff.id_1c,
		"ФизическоеЛицо_Key": transfer.staff.individual_id_1c,
		"ДатаНачала": transfer.start_date,
		"ВидЗанятости": "ОсновноеМестоРаботы",
		"КоличествоСтавок": 1,
		"ВидДоговора": "ТрудовойДоговор",
		"КоэффициентИндексации": 1,
		"ДатаЗапрета": transfer.start_date,
		"НаименованиеДокумента": "Приказ",
		"ПричинаПеревода": transfer.reason,
		"ОснованиеПеревода": transfer.base,
		"ИзменитьСведенияОДоговореКонтракте": true,
		"Комментарий": transfer.comment,
	}

	if (transfer.work_place) {
		body["ИзменитьРабочееМесто"] = true;
		body["РабочееМесто_Key"] = transfer.work_place;
	}

	if (transfer.remote_work) {
		body["РаботаетДистанционно"] = transfer.remote_work;
		body["ИзменитьДистанционнуюРаботу"] = true;
	}

	if (transfer.position_id && transfer.subdivison_id) {
		body["Должность_Key"] = transfer.position_id;
		body["Подразделение_Key"] = transfer.subdivison_id;
		body["ИзменитьПодразделениеИДолжность"] = true;
	}

	if (transfer.work_schedule_id) {
		body["ГрафикРаботы_Key"] = transfer.work_schedule_id;
		body["ИзменитьГрафикРаботы"] = true;
	}

	if (transfer.end_date) {
		body["ДатаОкончания"] = transfer.end_date;
	}

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = `Кадровый перевод (${transfer.staff.name})`;
	integration_app.data.document_odata_name = "Document_КадровыйПеревод";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.personal_guid_1c = JSON.stringify([transfer.staff.individual_id_1c]);
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.additional_info = Context.data.additional_info;
	integration_app.data.base_1c_name = Context.data.connection_name;

	await integration_app.save();

	Context.data.integration_app = integration_app;
}