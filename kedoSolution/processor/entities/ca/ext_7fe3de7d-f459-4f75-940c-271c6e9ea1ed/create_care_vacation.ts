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

const baseUrl = Namespace.params.data.url_1c_odata;
const login = Namespace.params.data.login;
const password = Namespace.params.data.password;
const myHeaders = {
    Authorization: `Basic ${btoa(login + ':' + password)}`,
};

async function action(): Promise<void>{
	const requestOptions: FetchRequest = {
		method: 'POST',
		headers: myHeaders,
	};
	const currentDate = new TDate();
	let planned_payment_date = ''

	if(!Context.data.planned_payment_date) {
		const startDate = new Datetime(Context.data.start_date!);
		planned_payment_date = startDate.addDate(0, 0, -3).format('YYYY-MM-DD');
	} else {
		planned_payment_date = Context.data.planned_payment_date
	}

	const body = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"ВыплачиватьПособиеДоТрехЛет": false,
		"ПериодРегистрации": `${currentDate.format('YYYY-MM')}-01T00:00:00`,
		"ПланируемаяДатаВыплаты": `${planned_payment_date}T00:00:00`,
		"ДатаЗапрета": `${Context.data.start_date}T00:00:00`,
		"ДатаНачала": `${Context.data.start_date}T00:00:00`,
		"ДатаОкончания": `${Context.data.end_date}T00:00:00`,
		"НеНачислятьЗарплатуИНеВыплачиватьАвансВоВремяОтпуска": !!Context.data.pay_during_vacation,
		"Организация_Key": Context.data.org_id,
		"ОсновнойСотрудник_Key": Context.data.guid,
		"ПорядокВыплаты": "Межрасчет",
		"РайонныйКоэффициентРФнаНачалоСобытия": 1,
		"РассчитатьЗарплату": false,

		"РасчетПоПравилам2010Года": false,
		"Сотрудник_Key": Context.data.guid,
		"ФиксПериодРасчетаСреднегоЗаработка": false
	}

	

	requestOptions.body = JSON.stringify(body);


	Context.data.debug = 'fetch'
	const resUrl = `${baseUrl}/Document_ОтпускПоУходуЗаРебенком?$format=json`;

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
}