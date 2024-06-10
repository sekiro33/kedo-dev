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

async function log(text: string): Promise<void> {
	const response = fetch(`https://sivbciaps6tzy.elma365.ru/pub/v1/app/testovyi/logirovanie_dlya_modulya/create`, {
		method: 'POST',
		headers: {
			Authorization: 'Bearer 4417c175-29f2-4366-b0cf-246ef39f8423',
		},
		body: JSON.stringify({
			"context": {
				"__name": "log",
				"debug": `${text}`,
			},
		})
	});
}

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

	const body: any = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"Организация_Key": Context.data.org_id,
		"Сотрудник_Key": Context.data.id_employee,
		"ФизическоеЛицо_Key": Context.data.id_personal,
		"ДатаНачала": `${Context.data.move_date}T00:00:00`,
		"ВидЗанятости": "ОсновноеМестоРаботы",
		"КоличествоСтавок": 1,
		"ВидДоговора": "ТрудовойДоговор",
		"КоэффициентИндексации": 1,
		"ДатаЗапрета": `${Context.data.move_date}T00:00:00`,
		"НаименованиеДокумента": "Приказ",
		"ПричинаПеревода": Context.data.move_reason ?? "",
		"ОснованиеПеревода": Context.data.move_osn ?? "",
		"ИзменитьСведенияОДоговореКонтракте": !!Context.data.change_contract,
		"Комментарий": Context.data.comment ?? ""
	}

	if (!!Context.data.change_work_place) {
		body["ИзменитьРабочееМесто"] = true
		body["РабочееМесто_Key"] = Context.data.new_workplace_id
	}

	if (!!Context.data.change_remote_work) {
		body["РаботаетДистанционно"] = Context.data.remote_work
		body["ИзменитьДистанционнуюРаботу"] = true
	}

	if (Context.data.id_pos && Context.data.is_subdiv) {
		body["Должность_Key"] = Context.data.id_pos;
		body["Подразделение_Key"] = Context.data.is_subdiv;
		body["ИзменитьПодразделениеИДолжность"] = true;
	}

	if (Context.data.id_work_schedule) {
		body["ГрафикРаботы_Key"] = Context.data.id_work_schedule;
		body["ИзменитьГрафикРаботы"] = true
	}

	if (Context.data.end_date) {
		body["ДатаОкончания"] = Context.data.end_date
	}

	log(Context.data.alternative_way ? Context.data.alternative_way == true ? 'true' : 'false' : 'undefined');

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
		const resUrl = `${baseUrl}/Document_КадровыйПеревод?$format=json`;

		try {
			const response = await fetch(`${encodeURI(resUrl)}`, requestOptions)
			if (!response.ok) {
				const responseText = await response.text()
				Context.data.error += ` staff data res.status error; resUrl - ${resUrl} `
				throw new Error(`status ${response.status} res error ${resUrl}, err text ${responseText}`);
			}

			Context.data.response = JSON.stringify(await response.json());
		} catch (err) {
			Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `
			throw new Error(err.message)
		}
	} else {
		const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c
		const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create()
		awaitingApp.data.__name = "Кадровый перевод"
		awaitingApp.data.document_odata_name = "Document_КадровыйПеревод"
		awaitingApp.data.accounting_systems = accounting1c
		awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.id_personal])
		awaitingApp.data.document_creation_data = JSON.stringify(body)
		awaitingApp.data.additional_info = Context.data.additional_info ?? "";
		awaitingApp.data.base_1c_name = Context.data.connection_name ?? undefined;
		await awaitingApp.save()

		Context.data.integration_app_id = awaitingApp.data.__id
	}
}