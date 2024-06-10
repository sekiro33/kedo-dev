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
	Context.data.iteration_number = 0
	const error = getConnectionInfo();
	if (error !== null) {
		Context.data.error = error.message
	}

	writeToDocApp();
}

async function check(): Promise<boolean> {
	const error = getConnectionInfo();
	if (error !== null) {
		Context.data.error = error.message
	}
	Context.data.request_parameters = 'InformationRegister_EM_ДокументыСотрудников?$format=json'
	if (!baseUrl || !login) {
		return true
	}
	await makeRequest('GET', 'InformationRegister_EM_ДокументыСотрудников?$format=json');
	if (!!Context.data.response_1c_json) {
		const response = JSON.parse(Context.data.response_1c_json!);
		const documents = response.value.filter((item: any) => {
			return item["Документ"] === Context.data.document_id;
		})

		if (!!documents) {
			await getFiles();
			return true
		}
		Context.data.iteration_number = Context.data.iteration_number ? Context.data.iteration_number + 1 : 1

		if(Context.data.iteration_number > 10) {
			Context.data.error = `Could not find requested document in 10 iterations`;
			throw new Error(`Could not find requested document in 10 iterations`);
			return true
		}
	}


	return false
};

async function getFiles(): Promise<void> {
	Context.data.request_parameters = `InformationRegister_EM_ПечатныеФормыДокументов?$format=json`;
	await makeRequest('GET', `InformationRegister_EM_ПечатныеФормыДокументов?$format=json`);
	await parseFiles();

}

async function changeStatus(docData: any): Promise<void> {
	const statusApp = await Namespace.params.fields.statuses_app.app.search().where(f => f.__name.eq('На подписании')).first();
	if (!!statusApp) {
		const changeURL = `${docData["СтатусДокумента@navigationLinkUrl"].split('/')[0]}?$format=json`
		const body:any = {
			"СтатусДокумента_Key": statusApp.data.guid,
		}

		const stringBody = JSON.stringify(body)
		await makeRequest('PATCH', changeURL, stringBody)
	}
}

async function writeToDocApp(): Promise<void> {
//    const serverApp = await Namespace.params.fields.additional_app.app.search().first();
//    if (!!serverApp) {
//       const knownDocuments = serverApp.data.massiv_izvestnykh_dokumentov ? JSON.parse(serverApp.data.massiv_izvestnykh_dokumentov) : [];
//       knownDocuments.push(Context.data.document_id);
//       serverApp.data.massiv_izvestnykh_dokumentov = JSON.stringify(knownDocuments);
//       await serverApp.save();
//    }
} 

async function parseFiles(): Promise<void> {
    const response = JSON.parse(Context.data.response_1c_json!);
    const documents = response.value.filter((item: any) => {
        return item["Документ"] === Context.data.document_id;
    })

    if (!!documents){
        const allFiles: FileItem[] = []
        for(let document of documents) {
			const fileJSON = JSON.parse(document["ХранилищеПечатнойФормы"]);
			const fileExtension = fileJSON.type;
			const fileString = fileJSON.data.replace(/\\r\\n/g, '')
			const fileArrayBuffer = await getArrayBufferFromBase64(fileString);
            const newFile = await Context.fields.files.create(`${document["ПечатнаяФорма"]}.${fileExtension.toLowerCase()}`, fileArrayBuffer);
			await changeStatus(document)
            allFiles.push(newFile)
        }
        Context.data.found_files = allFiles
    }
}

async function getArrayBufferFromBase64(base64: string):Promise<ArrayBuffer> {
    var binary_string = atob(base64);
    var len = binary_string.length; 
    var bytes = new Uint8Array(len); 
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i); 
    } 
    return bytes.buffer; 
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

		Context.data.response_1c_json = JSON.stringify(await response.json());
	} catch (err){
		Context.data.error += ` try/catch error ${err}; resUrl - ${resUrl} `
		throw new Error(err)
	}
}