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

async function action(): Promise<void> {
	const currentDate = new Datetime();

	const body: any = {
		"Date": `${currentDate.format('YYYY-MM-DD')}T00:00:00`,
		"Организация_Key": `${Context.data.organization_id}`,
		"ДатаНачала": `${Context.data.start_date}T00:00:00`,
		"ДатаОкончания": `${Context.data.end_date}T00:00:00`,
		"СовмещающийСотрудник_Key": `${Context.data.combining_staff_id_1c}`,
		"Комментарий": `${Context.data.comment ?? ""}`,
		"КоличествоСтавок": Context.data.bet_size ?? 0.25,
	}

	if (Context.data.combination_type) {
		switch (Context.data.combination_type.code) {
			case Context.fields.combination_type.variants.expansion_service_areas.code:
				body['ПричинаСовмещения'] = 'УвеличениеОбъемаРабот';
				break;

			case Context.fields.combination_type.variants.performance_duties.code:
				body['ПричинаСовмещения'] = 'ИсполнениеОбязанностей';
				body['ОтсутствующийСотрудник_Key'] = `${Context.data.absent_staff_id_1c ?? ""}`;
				break;

			case Context.fields.combination_type.variants.professional_duties.code:
				body['ПричинаСовмещения'] = 'СовмещениеПрофессийДолжностей';
				body['СовмещаемаяДолжность_Key'] = `${Context.data.combining_postiion ?? ""}`;
				break;
		}
	}

	if (Context.data.type_surcharge) {
		switch (Context.data.type_surcharge.code) {
			case Context.fields.type_surcharge.variants.fixed_amount.code:
				body['РазмерДоплаты'] = Context.data.percent ?? 0;
				break;

			case Context.fields.type_surcharge.variants.percen_combination.code:
				body['РассчитыватьДоплату'] = true;
				body['СпособРасчетаДоплаты'] = 'ПроцентФОТСовмещающего';
				body['ПроцентДоплаты'] = Context.data.percent ?? 0;
				break;

			case Context.fields.type_surcharge.variants.percent_main_position.code:
				body['РассчитыватьДоплату'] = true;
				body['СпособРасчетаДоплаты'] = 'ПроцентФОТ';
				body['ПроцентДоплаты'] = Context.data.percent ?? 0;
				break;
		}
	}

	const accounting1c = Namespace.params.fields.awaiting_docs_table_1c.app.fields.accounting_systems.variants.zup_1c;
	const awaitingApp = Namespace.params.fields.awaiting_docs_table_1c.app.create();

	awaitingApp.data.__name = "Исполнение обязанностей";
	awaitingApp.data.document_odata_name = "Document_Совмещение";
	awaitingApp.data.accounting_systems = accounting1c;
	awaitingApp.data.personal_guid_1c = JSON.stringify([Context.data.combining_staff_persoal_id_1c]);
	awaitingApp.data.document_creation_data = JSON.stringify(body);
	awaitingApp.data.additional_info = Context.data.additional_info ?? ""
	if(Context.data.connection_name) {
		awaitingApp.data.base_1c_name = Context.data.connection_name
	}
	await awaitingApp.save();

	Context.data.integration_app_id = awaitingApp.data.__id
}