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

interface AdditionalVacation {
	type_vacation_key: string;
	amount_of_days: number;
	start_date: string; // TDate.format("YYYY-MM-DD")
	end_date: string; // TDate.format("YYYY-MM-DD")
	reason: string;
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
	if(!currentConnection) {
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

async function action(): Promise<void>{
	const currentDate = new TDate();
	const addVacationArr: any[] = [];
	const isAddVacation = Context.data.additional_vacations && Context.data.additional_vacations.length > 0;
	const body: any = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
	}

	if (isAddVacation) {
		const vacationsData = JSON.parse(Context.data.additional_vacations!);

		vacationsData.forEach((i: any) => {
			addVacationArr.push({
				"LineNumber": `${addVacationArr.length + 1}`,
				"ВидОтпуска_Key": i.type_vacation_key,
				"КоличествоДней": i.amount_of_days,
				"ДатаНачала": `${i.start_date}`,
				"ДатаОкончания": `${i.end_date}`,
				"Основание": i.base
			});
		})			
		body["ДополнительныеОтпуска"] = addVacationArr
		body["ПредоставитьДополнительныйОтпуск"] = true
	}	

	if (Context.data.start_date_1c) {
		body["ДатаНачалаОсновногоОтпуска"] = `${Context.data.start_date_1c}T00:00:00`
		body["ДатаНачалаПериодаОтсутствия"] = `${Context.data.start_date_1c}T00:00:00`
	}


	if (Context.data.end_date_1c) {
		body["ДатаОкончанияОсновногоОтпуска"] = `${Context.data.end_date_1c}T00:00:00`
		body["ДатаОкончанияПериодаОтсутствия"] = `${Context.data.end_date_1c}T00:00:00`
	} 

	if (Context.data.days_amount) {
		body["КоличествоДнейОсновногоОтпуска"] = Context.data.days_amount
	}

	if(Context.data.reason) {
		body["Основание"] = Context.data.reason
	}

	if (!Context.data.alternativnaya_integraciya) {
		const error = getConnectionInfo()
		if (error != null) {
			Context.data.error = error.message
			return
		}
		return;
		const requestOptions: FetchRequest = {
			method: 'POST',
			headers: myHeaders,
		};


		

		requestOptions.body = JSON.stringify(body);

		const resUrl = `${baseUrl}/Document_Отпуск?$format=json`;

		try {
			const response = await fetch(`${encodeURI(resUrl)}`, requestOptions)
			if (!response.ok) {
				Context.data.error += ` staff data res.status error; resUrl - ${resUrl} `
				throw new Error(`res error ${resUrl}`);
			}

			Context.data.response = JSON.stringify(await response.json());
		} catch (err){
			Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `
			throw new Error(err)
		}
	} else {
		const awaitingApp = await Namespace.params.fields.awaiting_docs_table_1c.app.search()
			.where((f,g) => g.and(
				f.__deletedAt.eq(null),
				f.__id.eq(Context.data.integration_app_id!)
			)).first();
		//const awaitingApp = foundApps.find(item => item.data.__id === Context.data.integration_app_id);

		if (!awaitingApp) {
			Context.data.error = `Couldn't find an element of awaiting_docs_table_1c app with id ${Context.data.integration_app_id}`
			return;
		}
		const readyStatus = Namespace.params.fields.awaiting_docs_table_1c.app.fields.__status.variants.ready
		
		awaitingApp.data.document_creation_data = JSON.stringify(body);
		awaitingApp.data.isCorrection = true;
		awaitingApp.data.status_1c = '';
		awaitingApp.data.additional_info = Context.data.additional_info ?? "";
		awaitingApp.data.base_1c_name = Context.data.connection_name ?? undefined;
		await awaitingApp.save();
		await awaitingApp.setStatus(readyStatus);

		Context.data.integration_app_id = awaitingApp.data.__id;
	}
}