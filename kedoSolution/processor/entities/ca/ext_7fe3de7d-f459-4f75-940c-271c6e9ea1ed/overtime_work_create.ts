interface employees {
	id: string;
	individualId: string;
	date: string; //datetime.format('YYYY-MM-DD')
	hours: number;
}

const baseUrl = Namespace.params.data.url_1c_odata;
const login = Namespace.params.data.login;
const password = Namespace.params.data.password;
const myHeaders = {
	Authorization: `Basic ${btoa(login + ':' + password)}`,
};

async function action(): Promise<void> {
	const currentDate = new TDate();
	const employeeData = JSON.parse(Context.data.employee_data!)

	const individuals: any[] = [];
	const overtimeWorkTable: any[] = [];
	employeeData.forEach((item: any) => {
		overtimeWorkTable.push({
			"LineNumber": `${overtimeWorkTable.length + 1}`,
			"Сотрудник_Key": item.id,
			"Дата": `${item.date}T00:00:00`,
			"ОтработаноЧасов": item.hours,
			"СпособКомпенсацииПереработки": "ПовышеннаяОплата"
		})

		const isEmployeeExisting = individuals.find((individual: any) => individual["ФизическоеЛицо_Key"] === item.individualId)
		if (!isEmployeeExisting) {
			individuals.push({
				"LineNumber": `${individuals.length + 1}`,
				"ФизическоеЛицо_Key": item.individualId
			})
		}
	})


	const body = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"ПериодРегистрации": `${currentDate.format('YYYY-MM')}-01T00:00:00`,
		"Организация_Key": Context.data.org_id,
		"Причина": Context.data.reason || '',
		"СогласиеПолучено": true,
		"БухучетЗаданВСтрокахДокумента": false,
		"Сотрудники": overtimeWorkTable,
		"Комментарий" : Context.data.comment ?? "",
	}

	if (!Context.data.alternative_way) {
		const requestOptions: FetchRequest = {
			method: 'POST',
			headers: myHeaders,
		};
		requestOptions.body = JSON.stringify(body);
		Context.data.debug = 'fetch'
		const resUrl = `${baseUrl}/Document_РаботаСверхурочно?$format=json`;

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
	} else {
		const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c
		const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create()
		awaitingApp.data.__name = "Работа в нерабочее время"
		awaitingApp.data.document_odata_name = "Document_РаботаСверхурочно"
		awaitingApp.data.accounting_systems = accounting1c
		awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.individual_id_1c])
		awaitingApp.data.document_creation_data = JSON.stringify(body);
		awaitingApp.data.additional_info = Context.data.additional_info ?? "";
		awaitingApp.data.base_1c_name = Context.data.base_1c_name ?? undefined;
		await awaitingApp.save()

		Context.data.integration_app_id = awaitingApp.data.__id
	}
}