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

interface IBusinessTripData {
	staff: IStaffData,
	start_date: string,
	end_date: string,
	payment_date: string,
	city: string,
	destination_organization: string,
	mission_trip: string,
	statement: string,
	expense_of_funds : string
}

async function action(): Promise<void> {
	if (!Context.data.business_trip_data) {
		throw new Error("Context.data.business_trip_data is undefined");
	}

	const current_date = new Datetime();
	const business_trip_data: IBusinessTripData = JSON.parse(Context.data.business_trip_data);

	let body: any = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"ПериодРегистрации": current_date.format("YYYY-MM-01T00:00:00"),
		"Организация_Key": business_trip_data.staff.organization_id,
		"Сотрудник_Key": business_trip_data.staff.id_1c,
		"ФизическоеЛицо_Key": business_trip_data.staff.individual_id_1c,
		"ДатаНачала": business_trip_data.start_date,
		"ДатаНачалаСобытия": business_trip_data.end_date,
		"ДатаОкончания": business_trip_data.end_date,
		"ПланируемаяДатаВыплаты": business_trip_data.payment_date,
		"МестоНазначения": business_trip_data.city,
		"ОрганизацияНазначения": business_trip_data.destination_organization,
		"Цель": business_trip_data.mission_trip,
		"Основание": business_trip_data.statement,
		"КомандировкаЗаСчетСредств": business_trip_data.expense_of_funds,
		"ОсвобождатьСтавку": false,
		"ДокументРассчитан": false,
		"ПорядокВыплаты": "Межрасчет",
	};

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = `Командировка (${business_trip_data.staff.name})`;
	integration_app.data.document_odata_name = "Document_Командировка";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.personal_guid_1c = JSON.stringify([business_trip_data.staff.individual_id_1c]);
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.base_1c_name = Context.data.connection_name;
	integration_app.data.related_element = Context.data.app;
	
	await integration_app.save();

	Context.data.integration_app_id = integration_app.data.__id
}