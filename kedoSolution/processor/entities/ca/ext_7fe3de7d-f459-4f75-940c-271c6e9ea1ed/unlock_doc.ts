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
	if (Context.data.is_alternative) {
		if (Context.data.staff) {
			const refItem = new RefItem<ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>>('kedo', 'staff', Context.data.staff!.id);
			const staff = await refItem.fetch();

			const docs = await Namespace.params.fields.awaiting_docs_table_1c.app.search().where((f, g) => g.and(
				f.__deletedAt.eq(null),
				f.__status.eq(Namespace.params.fields.awaiting_docs_table_1c.app.fields.__status.variants.received),
			)).size(10000).all();

			const staff_docs = docs.filter(doc => {
				if (doc.data.personal_guid_1c) {
					const staff_id_1c: string[] = JSON.parse(doc.data.personal_guid_1c);
					if (staff_id_1c[0] == staff.data.id_1c || staff_id_1c[0] == staff.data.individual_id_1c) {
						return true;
					}
				}
				return false;
			})

			staff_docs.forEach(doc => doc.data.status_1c = Context.data.polnoe_imya_statusa);
			await Promise.all(staff_docs.map(doc => doc.save()));

		} else {
			const app = await Namespace.params.fields.awaiting_docs_table_1c.app.search().where((f, g) => g.and(
				f.__deletedAt.eq(null),
				f.doc_id_1c.eq(Context.data.doc_id!)
			)).first();

			if (!!app) {
				app.data.status_1c = Context.data.polnoe_imya_statusa;
				await app.save()
			} else {
				Context.data.error = `Couldnt find the awaiting doc app with 1c id of ${Context.data.doc_id}`
			}
		}

		return;
	}

	/*if (!!Context.data.is_alternative) {
		const docFromTable = await Namespace.params.fields.awaiting_docs_table_1c.app.search()
			.where((f, g) => g.and(
				f.__deletedAt.eq(null),
				f.doc_id_1c.eq(Context.data.doc_id!)
			)).first()
		if (!docFromTable) {
			return
		}
		docFromTable.data.status_1c = Context.data.polnoe_imya_statusa
		//docFromTable.data.status_1c_category = Context.data.doc_status;

		switch (Context.data.polnoe_imya_statusa) {
			case docFromTable.fields.status_1c_category.variants.agrement.code:
				docFromTable.data.status_1c = docFromTable.fields.status_1c_category.variants.agrement.name;
				break;
			case docFromTable.fields.status_1c_category.variants.ready.code:
				docFromTable.data.status_1c = docFromTable.fields.status_1c_category.variants.ready.name;
				break;
			case docFromTable.fields.status_1c_category.variants.signing.code:
				docFromTable.data.status_1c = docFromTable.fields.status_1c_category.variants.signing.name;
				break;
			case docFromTable.fields.status_1c_category.variants.signed.code:
				docFromTable.data.status_1c = docFromTable.fields.status_1c_category.variants.signed.name;
				break;
			case docFromTable.fields.status_1c_category.variants.rejected.code:
				docFromTable.data.status_1c = docFromTable.fields.status_1c_category.variants.rejected.name;
				break;
		}

		docFromTable.save()
		return;
	}*/

	const error = getConnectionInfo()
	if (error != null) {
		Context.data.error = error.message
		return
	}
	const statusApp = await Namespace.params.fields.statuses_app.app.search().where((f, g) => g.and(
		f.__deletedAt.eq(null),
		f.full_name.eq(Context.data.polnoe_imya_statusa!)
	)).first();

	if (!!statusApp) {
		const guid = statusApp!.data.guid;
		const url = "InformationRegister_EM_ПечатныеФормыДокументов?$format=json&$skip=999999&$inlinecount=allpages";
		await makeRequest('GET', url);
		const response = JSON.parse(Context.data.response!);
		const count = parseInt(response["odata.count"]);
		Context.data.debug = count + ' '
		let iter = 0
		const batch = 50
		while (iter * batch < count) {
			const docURL = `InformationRegister_EM_ПечатныеФормыДокументов?$format=json&$top=${batch}&$skip=${batch * iter}`
			await makeRequest('GET', docURL);
			const response = JSON.parse(Context.data.response!);
			const foundDoc = response.value.find((item: any) => {
				return item["Документ"] === Context.data.doc_id;
			});
			Context.data.debug += `iter ${iter} `
			if (!!foundDoc) {
				Context.data.debug += 'found '
				const changeURL = `${foundDoc["СтатусДокумента@navigationLinkUrl"].split('/')[0]}?$format=json`
				const body = Context.data.delete_printing_file ? {
					"СтатусДокумента_Key": statusApp.data.guid,
					"ХранилищеПечатнойФормы": ""
				} : {
					"СтатусДокумента_Key": statusApp.data.guid
				}

				const stringBody = JSON.stringify(body)

				await makeRequest('PATCH', changeURL, stringBody)
				break;
			}
			iter++
		}
	}
}

async function makeRequest(method: string, url: string, body?: string) {
	const requestOptions: FetchRequest = {
		method: method,
		headers: myHeaders,
	};

	if (!!body) {
		requestOptions.body = body;
	}

	const resUrl = baseUrl + '/' + url;

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