/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

/** Получить настройки КЭДО. */
async function getKedoSettings(): Promise<void> {
	const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

	const integration_1c = settings.find(f => f.data.code == 'integration_1c');
	Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;

	const app_employment = settings.find(f => f.data.code == 'app_employment');
	Context.data.app_employment = app_employment ? app_employment.data.status : true;

	const admission_order = settings.find(f => f.data.code == 'admission_order');
	Context.data.create_admission_order = admission_order ? admission_order.data.status : true;

	const app_labor = settings.find(f => f.data.code == 'information_about_labor_activity');
	Context.data.create_app_labor = app_labor ? app_labor.data.status : true;

	const castome_generation = settings.find(f => f.data.code == 'generation_labor_documents');
	Context.data.castome_generation = castome_generation ? castome_generation.data.status : false;

	const additional_documents = settings.find(f => f.data.code == 'additional_documents_for_employment');
	Context.data.additional_documents_for_employment = additional_documents ? additional_documents.data.status : false;

	const checking_generated_documents = settings.find(f => f.data.code == 'checking_generated_documents');
	Context.data.checking_generated_documents = checking_generated_documents ? checking_generated_documents.data.status : false;
}

/** Задать переменные для шаблонов. */
async function setTemplateParams(): Promise<void> {
	Context.data.current_date = new Datetime().format('DD.MM.YYYY');
	Context.data.counter = 0;

	if (!Context.data.staff) {
		throw new Error("Приложение сотрудника отсутствует. Context.data.staff is undefined");
	}

	const staff = await Context.data.staff.fetch();
	Context.data.is_employed = staff.data.is_employed;
	// Прорверяем: есть ли сотрудника согласшение об обработке ПД.
	const consent_processing_personal_data = await Context.fields.consent_processing_personal_data.app.search()
		.where((f, g) => g.and(
			f.__deletedAt.eq(null),
			f.staff.link(Context.data.staff!)
		)).first();

	Context.data.need_consent_processing_personal_data = (consent_processing_personal_data == undefined);

	// Возможно стоит вынести в основной процесс?
	// Заполняем поле "Адрес" у сотрудника.
	const region = staff.data.directory_of_regions ? `${(await staff.data.directory_of_regions.fetch()).data.__name},` : ``;
	const housing = staff.data.housing ? ` к.${staff.data.housing}` : ``;
	const apartment = staff.data.apartment ? ` кв.${staff.data.apartment}` : ``;

	staff.data.address = `${region} ${staff.data.city}, ${staff.data.street}, д.${staff.data.home}${housing}${apartment}`.trim();
	await staff.save();
}

/** Заполнить таблицу прочих документов. */
async function fillOtherDocsTable(): Promise<void> {
	if (!Context.data.files_other_docs || Context.data.files_other_docs.length == 0) {
		return;
	}

	for (const file of Context.data.files_other_docs) {
		const row = Context.data.other_docs!.insert();
		row.view_file = file;
		row.doc_file = file
	}
}

/** Удаление старых прочих документов для трудоустройства. */
async function deleteOldOtherDocs(): Promise<void> {
	const oldOtherDocs = await Namespace.app.additional_agreement_to_the_contract.search()
		.where((f, g) => g.and(
			f.__deletedAt.eq(null),
			f.staff.link(Context.data.staff!),
			f.__status.neq(Namespace.app.additional_agreement_to_the_contract.fields.__status.variants.removed),
			f.__status.neq(Namespace.app.additional_agreement_to_the_contract.fields.__status.variants.signed)
		))
		.size(10000)
		.all();

	if (oldOtherDocs && oldOtherDocs.length > 0) {
		await Promise.all(oldOtherDocs.map(f => f.delete()))
	}
}

/** Перевод номера трудового договора в строку */
async function setLaborContractNumber(): Promise<void> {
	if (!Context.data.labor_contract) {
		throw new Error("Отсутствует трудовой договор. Context.data.labor_contract is undefined");
	}

	if (Context.data.labor_contract_number) {
		return;
	}

	const labor_contract = await Context.data.labor_contract.fetch();

	if (labor_contract.data.__index) {
		Context.data.labor_contract_number = labor_contract.data.__index!.toString();
	} else {
		Context.data.labor_contract_number = "1";
	}
}

/** Перевод номера приказа в строку */
async function setAdmissionOrderNumber(): Promise<void> {
	if (!Context.data.admission_order) {
		throw new Error("Отсутствует приказ о приеме. Context.data.admission_order is undefined");
	}

	if (Context.data.admission_order_number) {
		return;
	}

	const admission_order = await Context.data.admission_order.fetch();

	if (admission_order.data.__index) {
		Context.data.admission_order_number = admission_order.data.__index.toString();
	} else {
		Context.data.admission_order_number = "1";
	}
}

async function checkAdditionalAgreementTable(): Promise<boolean> {
	if (Context.data.additional_contract_table![Context.data.counter!]) {
		return true;
	}
	
	return false;
}

/** Получить файл ДС. */
async function getAdditionalAgreementFile(): Promise<void> {
	const file = await Context.data.additional_contract_table![Context.data.counter!].file.fetch();
	Context.data.file_name = file.data.__name.replace(/\.[^.$]+$/, '');
	Context.data.document_file = file;
}

async function check_other_docs_table(): Promise<boolean> {
	if (Context.data.other_docs![Context.data.counter!]) {
		return true;
	}

	return false;
}

/** Получить файл прочих документов. */
async function getOtherDocFile(): Promise<void> {
	const row = Context.data.other_docs![Context.data.counter!];
	const file = await row.doc_file.fetch();
	Context.data.file_name = file.data.__name.replace(/\.[^.$]+$/, '');
	Context.data.document_file = file;
	Context.data.other_docs_employment_type = row.doc_type;
}

/** Увеличение счетчика. */
async function incCounter(): Promise<void> {
	Context.data.counter! += 1;
}

/** Сброс счетчика. */
async function resetCounter(): Promise<void> {
	Context.data.counter = 0;
}

/** Получить ответственного. */
async function getResponsible(): Promise<void> {
	if (!Context.data.staff_member) {
		return;
	}

	const staff_member = await Context.data.staff_member.fetch();
	const full_name = staff_member.data.fullname;

	if (full_name && full_name.middlename) {
		Context.data.responsible_fullname = `${full_name.lastname} ${full_name.firstname[0]}. ${full_name.middlename[0]}.`
	} else if (full_name) {
		Context.data.responsible_fullname = `${full_name.lastname} ${full_name.firstname[0]}.`
	}
}

/** Сменить статус документов. */
async function setStatus(): Promise<void> {
	if (!Context.data.staff) {
		throw new Error("Отсутствует карточка сотрудника. Context.data.staff is undefined");
	}

	const staff = await Context.data.staff.fetch();

	if (!staff.data.documents_employment || staff.data.documents_employment.length == 0) {
		return;
	}

	const employment_documents = await Promise.all(staff.data.documents_employment.map(doc => doc.fetch()));

	const promises : Promise<void>[] = [];

	for (const doc of employment_documents) {
		if (!doc.data.__sourceRef) {
			continue;
		}

		const source = await doc.data.__sourceRef.fetch();
		const statuses = source.fields.__status.all;
		const status = statuses.find((i: { code: string; }) => i.code == "new");

		if (!status) {
			continue;
		}

		await source.setStatus(status);
		source.line_status = `${status.code};${status.name}`;		
		promises.push(source.save());
	}

	await Promise.all(promises);
}

async function addAdditionalAgreementToEmploymentApp(): Promise<void> {
    const employmentApp = await Context.data.aggregation_app!.fetch();

	if (!employmentApp.data.dopolnitelnoe_soglashenie || employmentApp.data.dopolnitelnoe_soglashenie.length) {
		employmentApp.data.dopolnitelnoe_soglashenie = [];
	};
	employmentApp.data.dopolnitelnoe_soglashenie.push(Context.data.additional_agreement!);
	await employmentApp.save();
}

async function addOtherDocumentToEmploymentApp(): Promise<void> {
    const employmentApp = await Context.data.aggregation_app!.fetch();

	if (!employmentApp.data.other_documents || employmentApp.data.other_documents.length) {
		employmentApp.data.other_documents = [];
	};
	employmentApp.data.other_documents.push(Context.data.other_docs_employment!);
	await employmentApp.save();
}

async function checkAggregateApp(): Promise<boolean> {
    if (!Context.data.aggregation_app) {
		return false;
	};
	return true;
}

async function generateAppName(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
	const name = staff.data.__name;
	const appName = `Документы трудоустройства (${name})`;
	Context.data.app_name = appName;
}

async function setIdProcess(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();
        if (staff && staff.data.id_process_recruitment && staff.data.id_process_recruitment.length > 0) {
            staff.data.id_process_recruitment += ',' + Context.data.__id
        } else {
            staff!.data.id_process_recruitment = Context.data.__id
        }
		await staff.save();
    }
}