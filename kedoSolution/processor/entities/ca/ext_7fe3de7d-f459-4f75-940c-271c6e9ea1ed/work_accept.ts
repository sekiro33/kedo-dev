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

let baseUrl: string;
let login: string
let password: string
let myHeaders: any

/*
Виды документов "ВидДокумента"
ВодительскоеУдостоверение
ВоенныйБилет
ВоенныйБилетОфицераЗапаса
ДипломатическийПаспорт
ЗагранпаспортРФ
ЗагранпаспортСССР
ПаспортРФ
ПаспортСССР
ПаспортМинморфлота
ПаспортМоряка
СвидетельствоОРождении
УдостоверениеОфицера
*/

interface IStaffInfo {
	"Сотрудник": IStaff,
	"ФизЛицо": IIndividual,
	"Документы": IPassport[],
}

interface IIndividual {
	"Guid": string,
	"ДатаРождения": string,
	"Пол": string,
	"ИНН"?: string,
	"ФИО": string,
	"Фамилия": string,
	"Имя": string,
	"Отчество"?: string,
	"СтраховойНомерПФР"?: string,
	"КонтактнаяИнформация"?: IContactInfo[],
}

interface IDocument {
	"ВидДокумента" : string,
}

interface IPassport {
	"ВидДокумента" : "ПаспортРФ",
	"Серия": string,
	"Номер": string,
	"ДатаВыдачи": string,
	"КемВыдан": string,
	"КодПодразделения": string,
	"ЯвляетсяДокументомУдостоверяющимЛичность": boolean,
}

interface IContactInfo {
	"Тип": "Адрес" | "Телефон" | "АдресЭлектроннойПочты",
	"Вид_Key" : string,
	"Значение": string,
}

interface IStaff {
	"Guid": string,
	"ГоловнаяОрганизация": string,
}

type Staff = ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>;
type Organization = ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>;

function getConnectionInfo(): Error | null {
	const connectionsArray = Namespace.params.data.list_of_connected_platforms ? JSON.parse(Namespace.params.data.list_of_connected_platforms) : undefined;
	if (!connectionsArray) {
		return new Error(`Не найдено записей подключения`)
	}


	const currentConnection = connectionsArray.length > 1 ? connectionsArray.find((item: any) => {
		return item.name === Context.data.connection_name
	}) : connectionsArray[0]
	if (!currentConnection) {
		return new Error(`Не найдено подключение c именем ${Context.data.connection_name}`)
	}

	baseUrl = currentConnection.url;
	login = currentConnection.login
	password = currentConnection.password
	myHeaders = {
		Authorization: `Basic ${btoa(login + ':' + password)}`,
	};
	return null
}

async function get_staff_info(staff: Staff, id1c: string, individualId: string, organization: Organization): Promise<IStaffInfo> {
	const staff_info: IStaffInfo = {
		"Сотрудник": {
			"Guid": id1c,
			"ГоловнаяОрганизация": organization.data.ref_key ?? "",
		},
		"ФизЛицо": {
			"Guid": individualId,
			"ДатаРождения": staff.data.date_of_birth!.format("YYYY-MM-DDT00:00:00"),
			"Пол": staff.data.sex == true ? "Мужской" : "Женский",
			"ИНН": staff.data.inn ?? "",
			"ФИО": staff.data.__name,
			"Фамилия": staff.data.surname ?? "",
			"Имя": staff.data.name ?? "",
			"Отчество": staff.data.middlename ?? "",
			"СтраховойНомерПФР": staff.data.snils ?? "",
			"КонтактнаяИнформация": get_contact_info(staff),
		},
		"Документы": [
			get_passport(staff),
		]
	}

	return staff_info;
}

function get_passport(staff: Staff): IPassport {
	return {
		"ВидДокумента" : "ПаспортРФ",
		"Серия": staff.data.passport_series!,
		"Номер": staff.data.passport_number!,
		"ДатаВыдачи": staff.data.date_of_issue!.format("YYYY-MM-DDT00:00:00"),
		"КемВыдан": staff.data.issued_by!,
		"КодПодразделения": staff.data.passport_department_code!,
		"ЯвляетсяДокументомУдостоверяющимЛичность": true,
	}
}

function get_contact_info(staff: Staff): IContactInfo[] {
	const contacts: IContactInfo[] = [];

	if (staff.data.email) {
		contacts.push({
			"Тип": "АдресЭлектроннойПочты",
			"Вид_Key" : "dceee501-d2e6-11e4-8fb4-14dae9b19c71",
			"Значение": staff.data.email.email,
		})
	}

	if (staff.data.phone) {
		contacts.push({
			"Тип": "Телефон",
			"Вид_Key" : "82bc737b-0a3f-11e3-93c0-001b11b25590",
			"Значение": staff.data.phone.tel,
		})
	}

	if (staff.data.address) {
		contacts.push({
			"Тип": "Адрес",
			"Вид_Key" : "5d56f793-8eda-4697-b26d-5afc3972f430",
			"Значение": staff.data.address,
		})
	}

	return contacts;
}

async function action(): Promise<void> {
	const currentDate = new TDate();
	const staff = await Context.data.staff!.fetch();

	const [organization, subdivision, position] = await Promise.all([
		staff.data.organization!.fetch(),
		staff.data.structural_subdivision!.fetch(),
		staff.data.position!.fetch(),
	]);

	const id1C = staff.data.id_1c ?? generateGUID();
	const individualID = staff.data.individual_id_1c ?? generateGUID();

	Context.data.id_1c = id1C;
	Context.data.individual_id_1c = individualID;

	const body = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"Организация_Key": organization.data.ref_key ?? "",
		"Подразделение_Key": subdivision.data.ref_key ?? "",
		"Должность_Key": position.data.ref_key ?? "",
		"Сотрудник_Key": id1C,
		"ДатаПриема": staff.data.work_start!.format("YYYY-MM-DDT00:00:00"),
		"КоличествоСтавок": 1,
		"ВидЗанятости": "ОсновноеМестоРаботы",
		"ГрафикРаботы_Key": "899b02dc-7a6b-11e2-9362-001b11b25590",
		"ВидТарифнойСтавки": "МесячнаяТарифнаяСтавка",
		"ВидДоговора": "ТрудовойДоговор",
		"СрочныйДоговор": false,
		"СезонныйДоговор": false,
		"ДанныеСотрудников": [
			await get_staff_info(staff, id1C, individualID, organization),
		]
	}

	if (Context.data.alternative_integration) {
		const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c;
		const integration_app = Namespace.params.fields.awaiting_docs_table_1c.app.create();

		integration_app.data.__name = `Прием на работу (${staff.data.__name})`;
		integration_app.data.document_odata_name = "Document_ПриемНаРаботу";
		integration_app.data.accounting_systems = accounting1c;
		integration_app.data.document_creation_data = JSON.stringify(body);
		integration_app.data.personal_guid_1c = JSON.stringify([individualID]);
		integration_app.data.additional_info = `${staff.data.__name} - ${staff.data.id_1c ? "Сотрудник существует" : "Новый"}`;
		integration_app.data.base_1c_name = Context.data.connection_name;

		await integration_app.save()

		Context.data.integration_app_id = integration_app.data.__id
	} else {
		const error = getConnectionInfo()
		if (error != null) {
			Context.data.error = error.message
			return
		}

		const createURL = `${baseUrl}/Document_ПриемНаРаботу?$format=json`;
		const stringBody = JSON.stringify(body)
		await makeRequest('POST', createURL, stringBody);
	}

	/*
	const resUrl = `${baseUrl}/Catalog_Должности(guid'${Context.data.pos_id}')?$format=json`;
	await makeRequest('GET', resUrl)
	
	const currentDate = new TDate();
	const posResponse = JSON.parse(Context.data.response!)
	const workFunction = posResponse["ТрудоваяФункция_Key"]*/
}

function generateGUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

async function makeRequest(method: string, url: string, body?: string) {
	const requestOptions: FetchRequest = {
		method: method,
		headers: myHeaders,
	};

	if (!!body) {
		requestOptions.body = body;
	}

	const resUrl = url;

	try {
		const response = await fetch(`${encodeURI(resUrl)}`, requestOptions)
		if (!response.ok) {
			Context.data.error += ` staff data res.status error; resUrl - ${resUrl} `
			throw new Error(`res error ${resUrl}`);
		}

		Context.data.response = JSON.stringify(await response.json());
	} catch (err) {
		Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `
		throw new Error(err)
	}
}