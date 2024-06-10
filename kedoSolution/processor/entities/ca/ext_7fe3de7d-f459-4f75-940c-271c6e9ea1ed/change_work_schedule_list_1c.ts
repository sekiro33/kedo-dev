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

interface StaffList {
	id_1c: string,
	individual_id_1c: string,
}

async function action(): Promise<void> {
	const currentDate = new Datetime();

	const body: any = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"Организация_Key": Context.data.organization_id_1c ?? "",
		"ГрафикРаботы_Key": Context.data.work_schedule_id_1c ?? "",
		"ДатаИзменения": `${Context.data.start_date_1c}T00:00:00`,
		"ДатаОкончания": Context.data.end_date_1c ? `${Context.data.end_date_1c}T00:00:00` : "",
		"Комментарий": Context.data.comment ?? "",
	}

	const staffList: StaffList[] = JSON.parse(Context.data.staff_list_1c_json!);

	body["Сотрудники"] = staffList.map((staff, index) => {
		return {
			"LineNumber": index + 1,
			"Сотрудник_Key": staff.id_1c,
		}
	});

	body["ФизическиеЛица"] = staffList.map((staff, index) => {
		return {
			"LineNumber": index + 1,
			"Сотрудник_Key": staff.individual_id_1c,
		}
	});

	const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c;
	const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create();

	awaitingApp.data.__name = "Изменение графика работы списком";
	awaitingApp.data.document_odata_name = "Document_ИзменениеГрафикаРаботыСписком";
	awaitingApp.data.personal_guid_1c = JSON.stringify([null]);
	awaitingApp.data.accounting_systems = accounting1c;
	awaitingApp.data.document_creation_data = JSON.stringify(body);
	awaitingApp.data.additional_info = Context.data.additional_info ?? "";
	awaitingApp.data.base_1c_name = Context.data.connection_name ?? undefined;
	await awaitingApp.save();

	Context.data.integration_app_id = awaitingApp.data.__id

}