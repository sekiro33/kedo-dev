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

interface IDayOff {
	Date: string,
	"ПериодРегистрации": string,
	"Организация_Key": string,
	"Подразделение_Key": string,
	"Сотрудник_Key": string,
	"ФизическоеЛицо_Key": string,
	"ДатаНачала": string,
	"ДатаОкончания": string,
	"Комментарий"?: string,
	"Основание"?: string,
	"ОтсутствиеВТечениеЧастиСмены": boolean,
	"ДатаОтсутствия"? : string,
	"КоличествоЧасовОтгула"?: number,
	"КоличествоДнейОтгула"? : number,
	"РасходДнейОтгула" : number,
	"РасходЧасовОтгула" : number,
}

async function action(): Promise<void> {
	const currentDate = new TDate();

	const body: IDayOff = {
		Date: currentDate.format('YYYY-MM-DDT00:00:00'),
		"ПериодРегистрации": currentDate.format('YYYY-MM-01T00:00:00'),
		"Организация_Key": Context.data.organization_id ?? "",
		"Подразделение_Key": Context.data.subdivision_id ?? "",
		"Сотрудник_Key": Context.data.staff_id ?? "",
		"ФизическоеЛицо_Key": Context.data.staff_individual_id ?? "",
		"ДатаНачала": Context.data.start_date ?? "",
		"ДатаОкончания": Context.data.end_date ?? "",
		"ОтсутствиеВТечениеЧастиСмены": false,
		"Комментарий": Context.data.comment ?? "",
		"Основание": Context.data.statement ?? "",
		"РасходДнейОтгула" : 0,
		"РасходЧасовОтгула" : 0,
	}

	const start_date = new Datetime(Context.data.start_date!, "YYYY-MM-DDTHH:mm:ss");
	const end_date = new Datetime(Context.data.end_date!, "YYYY-MM-DDTHH:mm:ss");

	const duration = end_date.sub(start_date);

	if (duration.hours <= 8) {
		body["ОтсутствиеВТечениеЧастиСмены"] = true;
		body["КоличествоЧасовОтгула"] = Math.round(duration.hours);
		body["РасходЧасовОтгула"] = Math.round(duration.hours);
		body["ДатаОтсутствия"] = Context.data.start_date ?? "";
	} else {
		body["ДатаНачала"] = Context.data.start_date ?? "";
		body["ДатаОкончания"]  = Context.data.end_date ?? "";
		body["РасходДнейОтгула"] = Math.round(duration.days);
		body["КоличествоДнейОтгула"] = Math.round(duration.days);
	}

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

		const resUrl = `${baseUrl}/Document_Отгул?$format=json`;

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
		awaitingApp.data.__name = `Отгул в счет ранее отработанного времени`;
		awaitingApp.data.document_odata_name = "Document_Отгул"
		awaitingApp.data.accounting_systems = accounting1c
		awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.staff_individual_id])
		awaitingApp.data.document_creation_data = JSON.stringify(body)
		awaitingApp.data.base_1c_name = Context.data.connection_name;
		awaitingApp.data.additional_info = Context.data.additional_info ?? "";
		await awaitingApp.save();

		Context.data.integration_app_id = awaitingApp.data.__id
	}
}