interface EmployeeWeekendsWork {
	id: string;
	individualId: string;
	dates: string[]; //datetime.format('YYYY-MM-DD')[]
	compensationType: string; // Отгул / ПовышеннаяОплата
	hours : number;
}

enum CompensationType {
	IncreasedPay = "Отгул",
	CompensatoryHoliday = "ПовышеннаяОплата"
}

let baseUrl: string;
let login: string
let password: string
let myHeaders: any

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

async function action(): Promise<void> {

	const currentDate = new TDate();
	const employeeData = JSON.parse(Context.data.employee_data!);

	const dates: string[] = [];
	employeeData.forEach((item: any) => {
		item.dates.forEach((date: string) => {
			//@ts-ignore
			if (!dates.includes(date)) {
				dates.push(date)
			}
		})
	})

	const individuals: any[] = [];
	const workTable: any[] = [];
	const individualIds: string[] = []
	employeeData.forEach((item: any, index: number) => {
		dates.forEach((date: string) => {
			workTable.push({
				"LineNumber": `${workTable.length + 1}`,
				"Сотрудник_Key": item.id,
				"Дата": `${date}T00:00:00`,
				"СпособКомпенсацииПереработки": item.compensationType ?? "ПовышеннаяОплата",
				"ОтработаноЧасов": item.hours,
				"НеРаботал": !item.dates.includes(date)
			})
		})

		const isEmployeeExisting = individuals.find((individual: any) => individual["ФизическоеЛицо_Key"] === item.individualId)
		if (!isEmployeeExisting) {
			individualIds.push(item.individualId)
			individuals.push({
				"LineNumber": `${individuals.length + 1}`,
				"ФизическоеЛицо_Key": item.individualId
			})
		}
	})

	const startDate = dates.sort()[0]

	const body = {
		"СогласиеТребуется": true,
		"ВремяВЧасах": true,
		"ВремяУчтено": true,
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"ПериодРегистрации": `${Context.data.registration_month}-01T00:00:00`,
		"Организация_Key": Context.data.org_id,
		"Причина": Context.data.reason || '',
		"ДатаНачалаСобытия": `${startDate}T00:00:00`,
		"СогласиеПолучено": true,
		"Сотрудники": workTable,
		"Комментарий" : Context.data.comment ?? ""
	}
	
	Context.data.post_body = JSON.stringify(body)

	if (!Context.data.alternative_way) {
		const error = getConnectionInfo()
		if (error != null) {
			Context.data.error = error.message
			return
		}
		const requestOptions: FetchRequest = {
			method: 'POST',
			headers: myHeaders,
		};

		requestOptions.body = JSON.stringify(body);


		Context.data.debug = 'fetch'
		const resUrl = `${baseUrl}/Document_РаботаВВыходныеИПраздничныеДни?$format=json`;

		try {
			const response = await fetch(`${encodeURI(resUrl)}`, requestOptions)
			if (!response.ok) {
				Context.data.error += ` staff data res.status error; resUrl - ${resUrl} `
				throw new Error(`res error ${resUrl}`);
			}

			Context.data.response = JSON.stringify(await response.json());
		} catch (err) {
			Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `
			throw new Error(err.message)
		}
	} else {
		const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c
		const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create()
		awaitingApp.data.__name = "Работа в выходные и праздничные дни"
		awaitingApp.data.document_odata_name = "Document_РаботаВВыходныеИПраздничныеДни"
		awaitingApp.data.accounting_systems = accounting1c
		awaitingApp.data.personal_guid_1c = JSON.stringify(individualIds)
		awaitingApp.data.document_creation_data = JSON.stringify(body);
		awaitingApp.data.additional_info = Context.data.additional_info ?? "";
		awaitingApp.data.base_1c_name = Context.data.connection_name;
		await awaitingApp.save()

		Context.data.integration_app_id = awaitingApp.data.__id
	}
}