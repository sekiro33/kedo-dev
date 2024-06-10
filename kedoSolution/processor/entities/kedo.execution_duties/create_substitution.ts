/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_signatories_approvals(): Promise<void> {
	let app = await Context.data.execution_duties!.fetch();
	//Context.data.signatory = (await app.data.signatory!.fetch()).data.ext_user;
	const users = await Promise.all(app.data.inf_about_acting!.map(f => f.substitute.fetch()));
	Context.data.substitute_staffs = users;
	Context.data.substitutes = users.map(f => f.data.ext_user!);
	if (app.data.approval && app.data.approval.length > 0) {
		const approvals = await Promise.all(app.data.approval!.map(f => f.fetch()));
		Context.data.consonants = approvals.map(f => f.data.ext_user!);
	}
	Context.data.counter = 0;
	app.data.total_number = app.data.inf_about_acting!.length;
	app.data.count_signatories = 0;
	await app.save();
	const setting = await Namespace.app.settings.search()
		.where((f, g) => g.and(
			f.__deletedAt.eq(null),
			f.code.eq('director_signing')
		))
		.first();
	if (setting) {
		Context.data.director_signing = setting.data.status;
	}

	if (app.data.type_combination) {
		const type = await app.data.type_combination!.fetch();
		if (type.data.code == 'performance_employee_duties') {
			Context.data.string_with_type_in_memo = 'возложить временное исполнение обязанностей'
		}
		if (type.data.code == 'combining_positions') {
			Context.data.string_with_type_in_memo = 'поручить выполнение обязанностей в порядке совмещения должностей'
		}
		if (type.data.code == 'expansion_service_areas') {
			Context.data.string_with_type_in_memo = 'поручить выполнение обязанностей в порядке расширения зон обслуживания'
		}
	}

}

async function createReplacement(): Promise<void> {
	if (!Context.data.execution_duties) {
		throw new Error("Context.data.execution_duties is undefined");
	}

	const execution_duties = await Context.data.execution_duties.fetch();

	const replacement_staff = await execution_duties.data.substitute!.fetch()
	const absent = await execution_duties.data.staff!.fetch();
	const newReplacement = System.replacements.create();

	newReplacement.data.type = newReplacement.fields.type.variants.reassign;
	newReplacement.data.absent = absent.data.ext_user;
	newReplacement.data.replacement = replacement_staff.data.ext_user;
	newReplacement.data.begin = Context.data.start_date;
	newReplacement.data.end = Context.data.end_date;

	await newReplacement.save();

	execution_duties.data.replacement_id = newReplacement.id;
	await execution_duties.save()

	//Context.data.alert_replaced = `Ваши задачи будут временно переназначены на ${replacement_staff.data.__name} с ${app.data.start_day_line} по ${app.data.end_date_line!}`;
	//Context.data.alert_replacement = `Вас назначили как временно замещающего для сотрудника ${absent.data.__name} с ${app.data.start_day_line!} по ${app.data.end_date_line!}`

	Context.data.alert_body = `Вас назначили как временно замещающего для сотрудника ${absent.data.__name} с ${execution_duties.data.start_day_line!} по ${execution_duties.data.end_date_line!}`;

}

async function comment_get(): Promise<void> {
	const item = await Context.data.memo_execution!.fetch();
	const approvalLists = await item!.docflow().getApprovalLists();
	Context.data.comment = '';
	//TODO сделать проверку на размер массива, он может быть пустым
	let list = approvalLists[0];
	let respondets = list.respondents;
	for (let respondent of respondets) {
		if (respondent.status == "rejected") {
			Context.data.reject_comment = respondent.comment;
			break;
		}
	}
}

async function findHeadOrganization(): Promise<void> {
	const execution_duties = await Context.data.execution_duties!.fetch();
	const organization = await execution_duties.data.organization!.fetch();
	const position_head = await organization.data.position_head!.fetch();
	//TODO сделать проверку на размер массива, он может быть пустым
	Context.data.director = position_head.data.staff![0];

}

async function createDopDocs(): Promise<boolean> {
	if (!Context.data.inf_about_acting || Context.data.inf_about_acting.length == 0) {
		return false;
	}

	const table_length = Context.data.inf_about_acting.length;

	if (Context.data.counter! < table_length) {
		const row = Context.data.inf_about_acting[Context.data.counter!];
		Context.data.sub_staff = row.substitute;
		Context.data.alternate_employment_placement = row.substitute_employment_placement;
		Context.data.counter!++;
		return true;
	} else {
		return false;
	}

	// if (!Context.data.substitute_staffs)
	//   return false
	// const countFiles = Context.data.substitute_staffs.length;
	// if (Context.data.counter! < countFiles) {
	//   Context.data.sub_staff = Context.data.substitute_staffs[Context.data.counter!];
	//   Context.data.counter!++;
	//   return true
	// } else {
	//   return false
	// }
}

async function check_kedo_agreement(): Promise<boolean> {
	if (Context.data.execution_duties) {
		let app = await Context.data.execution_duties.fetch();
		if (app.data.initiator) {
			let staff = await app.data.initiator.fetch();
			if (staff.data.kedo_agreement == true) {
				return true;
			}
			else {
				return false;
			}
		} else {
			return false;
		}
	}
	else {
		return false;
	}
}

async function check_create_result(): Promise<boolean> {
	if (Context.data.execution_duties) {
		let app = await Context.data.execution_duties.fetch();
		if (app.data.create_result) {
			if (app.data.create_result.code == app.fields.create_result.variants.cancel.code) {
				return true;
			} else {
				return false;
			}
		} else {
			return false
		}
	} else {
		return false;
	}
}

async function getSettings(): Promise<void> {
	//Интеграция с учетной системой
	const integration_1c = await Context.fields.settings_kedo.app.search()
		.size(10000)
		.where((f, g) => g.and(
			f.__deletedAt.eq(null),
			f.code.eq('integration_1c')
		))
		.first();
	Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;
	//Использовать 1С как мастер систему
	const alternative_integration = await Context.fields.settings_kedo.app.search()
		.where((f, g) => g.and(
			f.__deletedAt.eq(null),
			f.code.eq('use_alternative_integration')
		))
		.first();
	Context.data.use_alternative_integration = alternative_integration ? alternative_integration.data.status : false;
	//Использовать альтернативную учетную систему
	const alternative_system = await Context.fields.settings_kedo.app.search()
		.where((f, g) => g.and(
			f.__deletedAt.eq(null),
			f.code.eq('use_alternative_system')
		))
		.first();
	Context.data.use_alternative_system = alternative_system ? alternative_system.data.status : false;
	const custom_generate_execution_duties = await Context.fields.settings_kedo.app.search()
		.where((f, g) => g.and(
			f.__deletedAt.eq(null),
			f.code.eq('custom_generate_execution_duties')
		))
		.first();
	Context.data.custom_generate_execution_duties = custom_generate_execution_duties ? custom_generate_execution_duties.data.status : false;
}

async function createStatusObj(app: any, status: string): Promise<void> {
	const obj_status = {
		'app': {
			'namespace': app.namespace,
			'code': app.code,
			'id': app.id,
		},
		'status': status,
	}
	Context.data.kedo_status = JSON.stringify(obj_status);
}

async function createStatusAppSigningApplication(): Promise<void> {
	createStatusObj(Context.data.execution_duties, 'signing_application');
}
async function createStatusSigning(): Promise<void> {
	createStatusObj(Context.data.memo_execution, 'signing');
}
async function createStatusAppPaperPrepare(): Promise<void> {
	createStatusObj(Context.data.execution_duties, 'paper_prepare');
}
async function createStatusPaperPrepare(): Promise<void> {
	createStatusObj(Context.data.memo_execution, 'paper_prepare');
}
async function createStatusAppApproval(): Promise<void> {
	createStatusObj(Context.data.execution_duties, 'approval');
}
async function createStatusApproval(): Promise<void> {
	createStatusObj(Context.data.memo_execution, 'approval');
}
async function createStatusAgreedSigned(): Promise<void> {
	createStatusObj(Context.data.memo_execution, 'agreed_signed');
}
async function createStatusAppSigningConsent(): Promise<void> {
	createStatusObj(Context.data.execution_duties, 'signing_consent');
}
async function createStatusAppCompleted(): Promise<void> {
	createStatusObj(Context.data.execution_duties, 'completed');
}
async function createStatusAppCorrection(): Promise<void> {
	createStatusObj(Context.data.execution_duties, 'correction');
}
async function createStatusCorrection(): Promise<void> {
	createStatusObj(Context.data.memo_execution, 'correction');
}
async function createStatusAppCancelled(): Promise<void> {
	createStatusObj(Context.data.execution_duties, 'cancelled');
}
async function createStatusCancelled(): Promise<void> {
	createStatusObj(Context.data.memo_execution, 'cancelled');
}
async function createStatusAppAdditionalSigning(): Promise<void> {
	createStatusObj(Context.data.execution_duties, 'additional_signing');
}

// async function setStatusApproval(): Promise<void> {
//   if (!Context.data.execution_duties) {
//     throw new Error("Context.data.execution_duties is undefined");
//   }

//   const obj_status = {
//     app: {
//       namespace: Context.data.execution_duties.namespace,
//       code: Context.data.execution_duties.code,
//       id: Context.data.execution_duties.id,
//     },
//     status: "approval",
//   };

//   Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function setStatusCancelled(): Promise<void> {
//   if (!Context.data.execution_duties) {
//     throw new Error("Context.data.execution_duties is undefined");
//   }

//   const obj_status = {
//     app: {
//       namespace: Context.data.execution_duties.namespace,
//       code: Context.data.execution_duties.code,
//       id: Context.data.execution_duties.id,
//     },
//     status: "cancelled",
//   };

//   Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function setStatusCorrection(): Promise<void> {
//   if (!Context.data.execution_duties) {
//     throw new Error("Context.data.execution_duties is undefined");
//   }

//   const obj_status = {
//     app: {
//       namespace: Context.data.execution_duties.namespace,
//       code: Context.data.execution_duties.code,
//       id: Context.data.execution_duties.id,
//     },
//     status: "correction",
//   };

//   Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function setStatusIssued(): Promise<void> {
//   if (!Context.data.execution_duties) {
//     throw new Error("Context.data.execution_duties is undefined");
//   }

//   const obj_status = {
//     app: {
//       namespace: Context.data.execution_duties.namespace,
//       code: Context.data.execution_duties.code,
//       id: Context.data.execution_duties.id,
//     },
//     status: "issued",
//   };

//   Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function setStatusDocPrepare(): Promise<void> {
//   if (!Context.data.execution_duties) {
//     throw new Error("Context.data.execution_duties is undefined");
//   }

//   const obj_status = {
//     app: {
//       namespace: Context.data.execution_duties.namespace,
//       code: Context.data.execution_duties.code,
//       id: Context.data.execution_duties.id,
//     },
//     status: "order_prepare",
//   };

//   Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function setServiceNoteSignedStatus(): Promise<void> {
//   if (!Context.data.memo_execution) {
//     throw new Error("Context.data.memo_execution is undefined");
//   }

//   const obj_status = {
//     app: {
//       namespace: Context.data.memo_execution.namespace,
//       code: Context.data.memo_execution.code,
//       id: Context.data.memo_execution.id,
//     },
//     status: "signed",
//   };

//   Context.data.kedo_status = JSON.stringify(obj_status);
// }

//Смотрим не было ли отказов
async function checkCombinationSuccess(): Promise<boolean> {
	const app = await Context.data.execution_duties!.fetch();
	if (app.data.combination_carried_out) {
		return true
	} else {
		return false
	}
}

//Проверяем необходимость создания СЗ для данного типа совмещения
async function checkNeedMemo(): Promise<boolean> {
	const app = await Context.data.execution_duties!.fetch();
	if (app.data.type_combination) {
		const type_combination = await app.data.type_combination.fetch();
		if (type_combination.data.need_memo == false) {
			return false
		}
	}
	return true
}

//Смотрим кто не подписал документы и берем только их
async function getNoSignedStaff(): Promise<void> {
	const app = await Context.data.execution_duties!.fetch();
	if (app.data.inf_about_acting) {
		const filtred_table = app.data.inf_about_acting.filter(f => f.doc_signed !== true)
		Context.data.substitute_staffs = filtred_table.map(f => f.substitute)
		Context.data.counter = Context.data.substitute_staffs.length;
	}
}

//Получаем замещающего и его документы
async function getDocumentsSubstitute(): Promise<void> {
	Context.data.documents = [];
	const app = await Context.data.execution_duties!.fetch();
	if (Context.data.substitute_staffs && Context.data.counter) {
		Context.data.sub_staff = Context.data.substitute_staffs[Context.data.counter - 1]
		if (app.data.inf_about_acting) {
			const row = app.data.inf_about_acting.find(f => f.substitute.id == Context.data.sub_staff!.id);
			if (row) {
				Context.data.documents.push(row.order);
				Context.data.documents.push(row.additional_agreement)
				Context.data.documents = Context.data.documents;
			}

		}
	}
	Context.data.counter! -= 1;
}
