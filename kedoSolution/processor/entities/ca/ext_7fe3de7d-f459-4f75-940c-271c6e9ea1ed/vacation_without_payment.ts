interface IVacationWithoutPay {
	vacation_type: string,
	organization_id: string,
	staff_id: string,
	individual_id: string,
	start_date: string,
	end_date: string,
	part_during: boolean,
	duration: number,
	statement: string,
	comment?: string,
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
	if (!Context.data.vacation_data) {
		throw new Error(`Context.data.vacation_data is undefined`);
	}

	const current_date = new Datetime();
	const vacation_data: IVacationWithoutPay = JSON.parse(Context.data.vacation_data);

	const body = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"ПериодРегистрации": current_date.format("YYYY-MM-01T00:00:00"),
		"Организация_Key": vacation_data.organization_id,
		"Сотрудник_Key": vacation_data.staff_id,
		"ФизическоеЛицо_Key": vacation_data.individual_id,
		"ВидОтпуска_Key": vacation_data.vacation_type,
		"ДатаНачала": vacation_data.start_date,
		"ДатаОтсутствия": vacation_data.start_date,
		"ДатаОкончания": vacation_data.end_date,
		"ОтсутствиеВТечениеЧастиСмены": vacation_data.part_during,
		"ЧасовОтпуска": vacation_data.duration,
		"Основание": vacation_data.statement,
		"Комментарий": vacation_data.comment,
		"ПорядокВыплаты": "Межрасчет",
	}

	const correction_body = {
		"isCorrection": Context.data.vacation_move ? Context.data.vacation_move : false,
		"Ref_Key": Context.data.id_document_1c ? Context.data.id_document_1c : "",
	}

	if (Context.data.alternative_way == true) {
		const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c;
		const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create();

		awaitingApp.data.__name = `Отпуск без сохранения оплаты ${Context.data.staff_full_name ? `(${Context.data.staff_full_name})` : ""}`;
		awaitingApp.data.document_odata_name = "Document_ОтпускБезСохраненияОплаты";
		awaitingApp.data.accounting_systems = accounting1c;
		awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.individual_id_1c]);
		awaitingApp.data.document_creation_data = JSON.stringify(Context.data.vacation_move && Context.data.vacation_move == true ? correction_body : body);
		awaitingApp.data.additional_info = Context.data.additional_info ?? "";
		awaitingApp.data.base_1c_name = Context.data.connection_name;
		
		await awaitingApp.save()

		Context.data.integration_app_id = awaitingApp.data.__id;
	} else {
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
		const resUrl = `${baseUrl}/Document_ОтпускБезСохраненияОплаты?$format=json`;

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
}