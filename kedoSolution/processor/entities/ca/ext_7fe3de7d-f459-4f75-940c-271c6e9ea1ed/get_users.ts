/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса
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
	let error: string = '';

	const refItem = new RefItem<ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>>('kedo', 'organization', Context.data.organization!.id);
	const organiaztion = await refItem.fetch();
	const staffs = await Namespace.params.fields.employee_app.app.search()
		.where((f, g) => g.and(
			f.__deletedAt.eq(null)
		))
		.size(10000)
		.all();
	// получаем сотрудников Отдела кадров
	if (organiaztion.data.hr_department && organiaztion.data.hr_department.length > 0) {
		for (const item of organiaztion.data.hr_department) {
			const staff = staffs.find(f => f.id == item.id);
			if (staff && staff.data.__status && staff.data.__status.code == staff.fields.__status.variants.signed_documents.code) {
				Context.data.hr_dep = (Context.data.hr_dep || []).concat(staff.data.ext_user!)
			}
		}
		if (!Context.data.hr_dep || Context.data.hr_dep.length == 0)
			error = error + `Нет трудоустроенных сотруднииков в свойстве "Отдел кадров" организации ${organiaztion.data.__name}` + ' || '
	} else {
		error = error + `Не заполнено свойство "Отдел кадров" в организации ${organiaztion.data.__name}` + ' || '
	}
	// получаем сотрудников Бухгалтерии
	if (organiaztion.data.accounting && organiaztion.data.accounting.length > 0) {
		for (const item of organiaztion.data.accounting) {
			const staff = staffs.find(f => f.id == item.id);
			if (staff && staff.data.__status && staff.data.__status.code == staff.fields.__status.variants.signed_documents.code) {
				Context.data.accounting = (Context.data.accounting || []).concat(staff.data.ext_user!)
			}
		}
		if (!Context.data.accounting || Context.data.accounting.length == 0)
			error = error + `Нет трудоустроенных сотруднииков в свойстве "Бухгалтерия" организации ${organiaztion.data.__name}` + ' || '
	} else {
		error = error + `Не заполнено свойство "Бухгалтерия" в организации ${organiaztion.data.__name}` + ' || '
	}
	// получаем Подписантов
	if (organiaztion.data.signatories && organiaztion.data.signatories.length > 0) {
		for (const item of organiaztion.data.signatories) {
			const staff = staffs.find(f => f.id == item.id);
			if (staff && staff.data.__status && staff.data.__status.code == staff.fields.__status.variants.signed_documents.code) {
				Context.data.signatories = (Context.data.signatories || []).concat(staff.data.ext_user!)
			}
		}
		if (!Context.data.signatories || Context.data.signatories.length == 0)
			error = error + `Нет трудоустроенных сотруднииков в свойстве "Подписанты" организации ${organiaztion.data.__name}` + ' || '
	} else {
		error = error + `Не заполнено свойство "Подписанты" в организации ${organiaztion.data.__name}` + ' || '
	}
	// получаем Офис менеджеров
	if (organiaztion.data.office_managers && organiaztion.data.office_managers.length > 0) {
		for (const item of organiaztion.data.office_managers) {
			const staff = staffs.find(f => f.id == item.id);
			if (staff && staff.data.__status && staff.data.__status.code == staff.fields.__status.variants.signed_documents.code) {
				Context.data.office_managers = (Context.data.office_managers || []).concat(staff.data.ext_user!)
			}
		}
		if (!Context.data.office_managers || Context.data.office_managers.length == 0)
			error = error + `Нет трудоустроенных сотруднииков в свойстве "Офис менеджеры" организации ${organiaztion.data.__name}` + ' || '
	} else {
		error = error + `Не заполнено свойство "Офис менеджеры" в организации ${organiaztion.data.__name}` + ' || '
	}
	// получаем Ответственных за финансы
	if (organiaztion.data.matching_finance && organiaztion.data.matching_finance.length > 0) {
		for (const item of organiaztion.data.matching_finance) {
			const staff = staffs.find(f => f.id == item.id);
			if (staff && staff.data.__status && staff.data.__status.code == staff.fields.__status.variants.signed_documents.code) {
				Context.data.matching_finance = (Context.data.matching_finance || []).concat(staff.data.ext_user!)
			}
		}
		if (!Context.data.matching_finance || Context.data.matching_finance.length == 0)
			error = error + `Нет трудоустроенных сотруднииков в свойстве "Ответственные за финансы" организации ${organiaztion.data.__name}` + ' || '
	} else {
		error = error + `Не заполнено свойство "Ответственные за финансы" в организации ${organiaztion.data.__name}` + ' || '
	}
	// получаем сотрудников Руководителя компании
	if (organiaztion.data.position_head) {
		const position_head = await organiaztion.data.position_head.fetch();

		const head_staffs_app = [
			...(position_head.data.staff ?? []),
			...(position_head.data.staff_internal_combination ?? []),
			...(position_head.data.staff_external_combination ?? []),
		];

		const head_staffs_ids = head_staffs_app.map(s => s.id);

		if (head_staffs_ids.length > 0) {
			const head_staffs = await organiaztion.fields.position_head.app.fields.staff.app.search()
				.where((f, g) => g.and(
					f.__deletedAt.eq(null),
					f.__id.in(head_staffs_ids)
				))
				.size(head_staffs_ids.length)
				.all();

			for (const item of head_staffs) {
				const staff = head_staffs.find(f => f.id == item.id);
				if (staff && staff.data.__status && staff.data.__status.code == staff.fields.__status.variants.signed_documents.code) {
					Context.data.boss = staff.data.ext_user;
					break;
				}
			}
		} else {
			error = error + `Нет сотруднииков, назначенных на должность в свойстве "Руководитель организации" организации ${organiaztion.data.__name}` + ' || '
		}

		if (!Context.data.boss)
			error = error + `Нет трудоустроенных сотруднииков в свойстве "Руководитель организации" организации ${organiaztion.data.__name}` + ' || '
	} else {
		error = error + `Не заполнено свойство "Руководитель организации" в организации ${organiaztion.data.__name}` + ' || '
	}

	Context.data.error = error
}