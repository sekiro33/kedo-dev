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

interface IStaffData {
	name: string,
	id_1c: string,
	individual_id_1c: string,
	organization_id: string,
	position_id: string,
}

enum CombinationType {
	/** Расширение зон обслуживания */
	EXPANSION_SERVICE_AREAS,
	/** Исполнение обязанностей сотрудника */
	PERFOMANCE_DUTIES,
	/** Совмщение должностей */
	PROFESSIONAL_DUTIES,
}

enum SurchargeType {
	FIXED_AMOUNT,
	COMBINATION_PERCENT,
	MAIN_POSITION_PERCENT,
}

interface IExecutionDutiesData {
	name: string,
	/** Отсутствующий сотрудник */
	absent_staff: IStaffData,
	/** Замещающий сотрудник */
	replacement_staff: IStaffData,
	start_date: string,
	end_date: string,
	/** Вид совмещения */
	combination_type: CombinationType,
	surcharge_type: SurchargeType,
	percent?: number,
	/** Комментарий */
	comment?: string,
}

/** Коэффициент для расчета ставки
 * Рассчитывается исходя из соотношения:
 * 30% - 1/4
 * 15% - 1/8
*/
const coefficient = 0.25 / 30;

/** Округление числа до нужного количества знаков после запятой. */
function round(value: number, precision: number) {
	var multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
}

async function action(): Promise<void> {
	if (!Context.data.execution_duties_data) {
		throw new Error("Context.data.execution_duties_data is undefined");
	}

	const exectuion_duties_data: IExecutionDutiesData = JSON.parse(Context.data.execution_duties_data);

	const current_date = new Datetime();

	const body: any = {
		"Date": current_date.format("YYYY-MM-DDT00:00:00"),
		"ПериодРегистрации": current_date.format("YYYY-MM-01T00:00:00"),
		"ДатаНачала": exectuion_duties_data.start_date,
		"ДатаОкончания": exectuion_duties_data.end_date,
		"СовмещающийСотрудник_Key": exectuion_duties_data.replacement_staff.id_1c,
		"Организация_Key": exectuion_duties_data.absent_staff.organization_id,
		"Комментарий": exectuion_duties_data.comment ?? "",

		"РазмерДоплатыУтвержден": true,
	}

	// Тип совмещения
	switch (exectuion_duties_data.combination_type) {
		// Расширение зон обслуживания
		case CombinationType.EXPANSION_SERVICE_AREAS: {
			body["ПричинаСовмещения"] = "УвеличениеОбъемаРабот";
			body["КоличествоСтавок"] = 0.125;

			if (exectuion_duties_data.surcharge_type == SurchargeType.MAIN_POSITION_PERCENT || exectuion_duties_data.surcharge_type == SurchargeType.COMBINATION_PERCENT) {
				body["РассчитыватьДоплату"] = true;
				body["СпособРасчетаДоплаты"] = "ПроцентФОТСовмещающего";
				body["ПроцентДоплаты"] = exectuion_duties_data.percent;
			}

			if (exectuion_duties_data.surcharge_type == SurchargeType.FIXED_AMOUNT) {
				body["РассчитыватьДоплату"] = false;
				body["РазмерДоплаты"] = exectuion_duties_data.percent;
			}

			break;
		}

		// Исполнение обязанностей
		case CombinationType.PERFOMANCE_DUTIES: {
			body["ПричинаСовмещения"] = "ИсполнениеОбязанностей";
			body["ОтсутствующийСотрудник_Key"] = exectuion_duties_data.absent_staff.id_1c;

			if (exectuion_duties_data.surcharge_type == SurchargeType.MAIN_POSITION_PERCENT || exectuion_duties_data.surcharge_type == SurchargeType.COMBINATION_PERCENT) {
				body["РассчитыватьДоплату"] = true;
				body["СпособРасчетаДоплаты"] = "ПроцентФОТСовмещающего";
				body["ПроцентДоплаты"] = exectuion_duties_data.percent;
			}

			if (exectuion_duties_data.surcharge_type == SurchargeType.FIXED_AMOUNT) {
				body["РассчитыватьДоплату"] = false;
				body["РазмерДоплаты"] = exectuion_duties_data.percent;
			}

			break;
		}

		// Совмещение должностей
		case CombinationType.PROFESSIONAL_DUTIES: {
			body["ПричинаСовмещения"] = "СовмещениеПрофессийДолжностей";
			body["СовмещаемаяДолжность_Key"] = exectuion_duties_data.absent_staff.position_id;
			body["КоличествоСтавок"] = 0.125;

			if (exectuion_duties_data.surcharge_type == SurchargeType.COMBINATION_PERCENT) {
				body["РассчитыватьДоплату"] = true;
				body["СпособРасчетаДоплаты"] = "ПроцентФОТ";
				body["ПроцентДоплаты"] = exectuion_duties_data.percent;
				body["КоличествоСтавок"] = round(coefficient * (exectuion_duties_data.percent ?? 0), 2);
			}

			if (exectuion_duties_data.surcharge_type == SurchargeType.MAIN_POSITION_PERCENT) {
				body["РассчитыватьДоплату"] = true;
				body["СпособРасчетаДоплаты"] = "ПроцентФОТСовмещающего";
				body["ПроцентДоплаты"] = exectuion_duties_data.percent;
				body["КоличествоСтавок"] = round(coefficient * (exectuion_duties_data.percent ?? 0), 2);
			}

			if (exectuion_duties_data.surcharge_type == SurchargeType.FIXED_AMOUNT) {
				body["РассчитыватьДоплату"] = false;
				body["РазмерДоплаты"] = exectuion_duties_data.percent;
			}

			break;
		}

		default: {
			throw new Error(`Неизвестный тип замещения: ${exectuion_duties_data.combination_type}`);
		}
	}

	const accounting1c = Namespace.params.fields.integration_app.app.fields.accounting_systems.variants.zup_1c;
	const integration_app = Namespace.params.fields.integration_app.app.create();

	integration_app.data.__name = `Исполнение обязанностей (${exectuion_duties_data.name})`;
	integration_app.data.document_odata_name = "Document_Совмещение";
	integration_app.data.accounting_systems = accounting1c;
	integration_app.data.personal_guid_1c = JSON.stringify([]);
	integration_app.data.document_creation_data = JSON.stringify(body);
	integration_app.data.additional_info = Context.data.additional_info ?? "";
	integration_app.data.base_1c_name = Context.data.connection_name ?? "";
	integration_app.data.related_element = Context.data.app;

	await integration_app.save();

	Context.data.integration_app_id = integration_app.data.__id;
}