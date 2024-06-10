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

type Staff = ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>;
type Organization = ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>;

interface StaffData {
	"Сотрудник": Staff1CData,
	"ФизЛицо": IndividualData,
	"Документы": PassportData[],
}

interface Staff1CData {
	"Guid": string,
	"ГоловнаяОрганизация": string,
}

interface IndividualData {
	"Guid": string,
	"ДатаРождения": string,
	"Пол": string,
	"ИНН"?: string,
	"ФИО": string,
	"Фамилия": string,
	"Имя": string,
	"Отчество"?: string,
	"СтраховойНомерПФР"?: string,
	"КонтактнаяИнформация"?: ContactInfo[],
}

interface Document {
	"ВидДокумента": string,
}

interface ContactInfo {
	"Тип": "Адрес" | "Телефон" | "АдресЭлектроннойПочты",
	"Вид_Key": string,
	"Значение": string,
}

interface PassportData {
	"ВидДокумента": "ПаспортРФ",
	"Серия": string,
	"Номер": string,
	"ДатаВыдачи": string,
	"КемВыдан": string,
	"КодПодразделения": string,
	"ЯвляетсяДокументомУдостоверяющимЛичность": boolean,
}

async function action(): Promise<void> {
	if (!Context.data.staff) {
		throw new Error("Не указан сотрудник");
	}

	if (!Context.data.employment_placement) {
		throw new Error("Не указано место занятости сотрудника");
	}

	const current_date = new Datetime();

	const [staff, employment_placement] = await Promise.all([
		Context.data.staff.fetch(),
		Context.data.employment_placement.fetch(),
	]);

	const [position, organization, subdivision] = await Promise.all([
		employment_placement.data.position?.fetch(),
		employment_placement.data.organization?.fetch(),
		employment_placement.data.subdivision?.fetch(),
	]);

	if (!position) {
		throw new Error("По данному месту занятости не указана позиция ШР");
	}

	if (!organization) {
		throw new Error("По данному месту занятости не указана организация");
	}

	if (!subdivision) {
		throw new Error("По данному месту занятости не указано подразделение");
	}

	const id_1c = employment_placement.data.id_1c;
	const individual_id = staff.data.individual_id_1c;

	const staff_data = getStaffdata(staff, id_1c, individual_id, organization);

	const body = {
		"Date": current_date.format('YYYY-MM-DDT00:00:00'),
		"Организация_Key": organization.data.ref_key ?? "",
		"Подразделение_Key": subdivision.data.ref_key ?? "",
		"Должность_Key": position.data.ref_key ?? "",
		"Сотрудник_Key": staff_data["Сотрудник"].Guid,
		"ДатаПриема": staff.data.work_start?.format("YYYY-MM-DDT00:00:00") ?? "",
		"КоличествоСтавок": 1,
		"ВидЗанятости": "ОсновноеМестоРаботы",
		// "ГрафикРаботы_Key": "899b02dc-7a6b-11e2-9362-001b11b25590",
		"ВидТарифнойСтавки": "МесячнаяТарифнаяСтавка",
		"ВидДоговора": "ТрудовойДоговор",
		"СрочныйДоговор": false,
		"СезонныйДоговор": false,
		"ДанныеСотрудников": [staff_data]
	};

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = `Прием на работу (${staff.data.__name})`;
	integration_app.data.document_odata_name = "Document_ПриемНаРаботу";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.personal_guid_1c = JSON.stringify([staff_data["ФизЛицо"].Guid]);
	integration_app.data.additional_info = `${staff.data.__name} - ${staff.data.id_1c ? "Сотрудник существует" : "Новый"}`;
	integration_app.data.base_1c_name = Context.data.connection_name;

	await integration_app.save();

	Context.data.integration_app = integration_app;

}

function getStaffdata(staff: Staff, id1c: string | undefined, individualId: string | undefined, organization: Organization): StaffData {
	const staff_info: StaffData = {
		"Сотрудник": {
			"Guid": id1c ?? generateGUID(),
			"ГоловнаяОрганизация": organization.data.ref_key ?? "",
		},
		"ФизЛицо": {
			"Guid": individualId ?? generateGUID(),
			"ДатаРождения": staff.data.date_of_birth!.format("YYYY-MM-DDT00:00:00"),
			"Пол": staff.data.sex == true ? "Мужской" : "Женский",
			"ИНН": staff.data.inn ?? "",
			"ФИО": staff.data.__name,
			"Фамилия": staff.data.surname ?? "",
			"Имя": staff.data.name ?? "",
			"Отчество": staff.data.middlename ?? "",
			"СтраховойНомерПФР": staff.data.snils ?? "",
			"КонтактнаяИнформация": getContactsData(staff),
		},
		"Документы": [
			getPassportData(staff),
		],
	}

	return staff_info;
}

function getContactsData(staff: Staff): ContactInfo[] {
	const contacts: ContactInfo[] = [];

	if (staff.data.email) {
		contacts.push({
			"Тип": "АдресЭлектроннойПочты",
			"Вид_Key": "dceee501-d2e6-11e4-8fb4-14dae9b19c71",
			"Значение": staff.data.email.email,
		})
	}

	if (staff.data.phone) {
		contacts.push({
			"Тип": "Телефон",
			"Вид_Key": "82bc737b-0a3f-11e3-93c0-001b11b25590",
			"Значение": staff.data.phone.tel,
		})
	}

	if (staff.data.address) {
		contacts.push({
			"Тип": "Адрес",
			"Вид_Key": "5d56f793-8eda-4697-b26d-5afc3972f430",
			"Значение": staff.data.address,
		})
	}

	return contacts;
}

function getPassportData(staff: Staff): PassportData {
	return {
		"ВидДокумента": "ПаспортРФ",
		"Серия": staff.data.passport_series ?? "",
		"Номер": staff.data.passport_number ?? "",
		"ДатаВыдачи": staff.data.date_of_issue?.format("YYYY-MM-DDT00:00:00") ?? "",
		"КемВыдан": staff.data.issued_by ?? "",
		"КодПодразделения": staff.data.passport_department_code ?? "",
		"ЯвляетсяДокументомУдостоверяющимЛичность": true,
	}
}

function generateGUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}