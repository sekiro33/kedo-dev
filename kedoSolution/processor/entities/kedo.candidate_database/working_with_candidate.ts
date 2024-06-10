/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

         
async function getSettingsKEDO(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const select_person_responsible_employment = settings.find(f => f.data.code == 'select_person_responsible_employment');
    Context.data.select_person_responsible_employment = select_person_responsible_employment ? select_person_responsible_employment.data.status : true;
    if (Context.data.select_person_responsible_employment) {
        Context.data.responsible_reception = Context.data.__createdBy;
    }
    const security_check = settings.find(f => f.data.code == 'security_check');
    Context.data.security_check = security_check ? security_check.data.status : true;
    const document_recognition = settings.find(f => f.data.code == 'document_recognition');
    Context.data.document_recognition = document_recognition ? document_recognition.data.status : false;
    const opening_account_employer = settings.find(f => f.data.code == 'opening_account_employer');
    Context.data.opening_account_employer = opening_account_employer ? opening_account_employer.data.status : false;
    const date_reminder_employment_candidate = settings.find(f => f.data.code == 'date_reminder_employment_candidate');
    Context.data.date_reminder_responsible = date_reminder_employment_candidate ? (date_reminder_employment_candidate.data.quantity ? date_reminder_employment_candidate.data.quantity : 5) : 5;
    const deadline_filling_questionnaire_candidate = settings.find(f => f.data.code == 'deadline_filling_questionnaire_candidate');
    const day_deadline_filling_questionnaire_candidate = deadline_filling_questionnaire_candidate ? (deadline_filling_questionnaire_candidate.data.quantity ?  deadline_filling_questionnaire_candidate.data.quantity : 4) : 4;
    Context.data.deadline_filling_questionnaire_candidate = (new Datetime).add(new Duration(day_deadline_filling_questionnaire_candidate, 'days')); 
    const period_displaying_portal_candidate_after_completion_review = settings.find(f => f.data.code == 'period_displaying_portal_candidate_after_completion_review');
    Context.data.period_displaying_portal_candidate_after_completion_review = period_displaying_portal_candidate_after_completion_review ? (period_displaying_portal_candidate_after_completion_review.data.quantity ? period_displaying_portal_candidate_after_completion_review.data.quantity : 5) : 5;
    

}

async function getPeriodVerification(): Promise<void> {
    const setting = await Namespace.app.settings.search().where((f,g) => g.and(f.__deletedAt.eq(null), f.code.eq('period_verification_consideration_candidate'))).first();
    if (setting) {
        const period_verification_consideration_candidate = setting.data.quantity ? setting.data.quantity : 2;
        Context.data.period_verification_consideration_candidate = (new Datetime).add(new Duration(period_verification_consideration_candidate, 'days'));
    }
}

async function blocking_access(): Promise<void> {
    if (Context.data.external_staff) {
        Context.fields.external_staff.app.block(Context.data.external_staff);
    }
    if (Context.data.candidate) {
        await Context.data.candidate.block()
    }
}

async function linkForUser(): Promise<void> {
    try {
        const candidate = await Context.data.candidate_database!.fetch();
        const ext_user = Context.fields.external_staff.app.create();
        ext_user.data.__name = candidate.data.__name;
        ext_user.data.fullname = candidate.data.fullname;
        ext_user.data.phone = (ext_user.data.phone || []).concat(candidate.data.phone!);
        if (ext_user.data.phone && ext_user.data.phone.length > 0) {
            ext_user.data.phone.forEach(phone => phone.type = PhoneType.Work);
        };
        if (candidate.data.email) {
            ext_user.data.email = candidate.data.email!.email;
        }
        await ext_user.save();

        const portal = await System.portals.get('kedo_ext'); //вставить нужный портал
        await portal!.grantAccess(ext_user);
        const user = await portal!.addUser(ext_user);
        const link = await portal!.signupUrl(ext_user, { withSign: true, refresh: true });

        candidate.data.external_user = ext_user;
        candidate.data.candidate = user;
        await candidate.save();

        Context.data.external_staff = ext_user;
        Context.data.candidate = user;
        Context.data.link = link
        Context.data.alert = `Приглашаем вас на портал обмена кадровыми электронными документами.
        На портале вы сможете создавать и подписывать кадровые документы в электронном виде.
        Перейдите по ссылке и пройдите процедуру регистрации на портале.`
    } catch (err) {
        Context.data.error_string = `Ошибка создания внешнего пользователя: ${err.message}`;
        throw new Error("Ошибка создания внешнего пользователя: " + err.message)
    }
    
}



async function setTableAdditionDocuments(): Promise<void> {
    //Ищем виды документов, где флаг "Необходим для трудоустройства по умолчанию" = true, а "Необходим для анкеты кандидата по умолчанию" = false;
    const type_docs = await Context.fields.table_personal_documents.fields.document_type.app.search().where((f,g) => g.and (
        f.__deletedAt.eq(null),
        f.default.eq(true),
        f.required_for_candidate.eq(false)
    )).size(10000).all();

    
    //Записываем такие документы в таблицу
    for (let item of type_docs) {
        const row = Context.data.additional_personal_documents!.insert();
        row.document_type = item;
    }
    Context.data.additional_personal_documents = Context.data.additional_personal_documents;
}

async function getDeadlineSigningJobOffer(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    const deadline_signing_job_offer = settings.find(f => f.data.code == 'deadline_signing_job_offer');
    const day_deadline_signing_job_offer = deadline_signing_job_offer ? (deadline_signing_job_offer.data.quantity ?  deadline_signing_job_offer.data.quantity : 4) : 4;
    Context.data.deadline_signing_job_offer = (new Datetime).add(new Duration(day_deadline_signing_job_offer, 'days'));

    Context.data.comment_candidate = '';
}

async function setDeadlineFormationDocuments(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    const deadline_formation_documents_candidate = settings.find(f => f.data.code == 'deadline_formation_documents_candidate');
    const day_deadline_formation_documents_candidate = deadline_formation_documents_candidate ? (deadline_formation_documents_candidate.data.quantity ?  deadline_formation_documents_candidate.data.quantity : 3) : 3;
    Context.data.deadline_formation_documents_candidate = (new Datetime).add(new Duration(day_deadline_formation_documents_candidate, 'days'));
}

async function setDeadlineVerificationSecurityService(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    const period_verification_security_service = settings.find(f => f.data.code == 'security_check');
    const day_period_verification_security_service = period_verification_security_service ? (period_verification_security_service.data.quantity ?  period_verification_security_service.data.quantity : 4) : 4;
    Context.data.period_verification_security_service = (new Datetime).add(new Duration(day_period_verification_security_service, 'days'));
}

async function setDeadlineFinalDecision(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    const deadline_making_final_decision_candidate = settings.find(f => f.data.code == 'deadline_making_final_decision_candidate');
    const day_deadline_making_final_decision_candidate = deadline_making_final_decision_candidate ? (deadline_making_final_decision_candidate.data.quantity ?  deadline_making_final_decision_candidate.data.quantity : 5) : 5;
    Context.data.deadline_making_final_decision_candidate = (new Datetime).add(new Duration(day_deadline_making_final_decision_candidate, 'days'));
}

async function prepareData(): Promise<void> {
    let fio = (await Context.data.candidate_database!.fetch()).data.full_name
    if (fio) {
        Context.data.firstname = fio.firstname
        Context.data.lastname = fio.lastname
        Context.data.middlename = fio.middlename
    }
    
}

async function setIdProcess(): Promise<void> {
    if (Context.data.reconsideration) {
        const candidate = await Context.data.candidate_database!.fetch();
        const old_process = await System.processes._searchInstances().where(f => f.__id.eq(candidate.data.id_process!)).first();
        if (old_process) {
            try {
                old_process.interrupt('Процесс неактуален')
            } catch {}
        }
    }
    const candidate = await Context.data.candidate_database!.fetch();
    candidate.data.id_process = Context.data.__id;
    await candidate.save()
}

async function prepareMedicalRequest(): Promise<void> {
    const medical_request = Context.fields.medical_request.app.create();
    medical_request.data.candidate = Context.data.candidate_database;
    medical_request.data.starting_from_working_with_candidate = true;
    medical_request.data.sort_of_medical_examination = medical_request.fields.sort_of_medical_examination.variants.special_examination;
    medical_request.data.new_position = Context.data.planned_position;
    await medical_request.save();
}

async function runRecognition(): Promise<void> {
    await getFiles();
    
    const passport_url = Context.data.passport ? (await Context.data.passport!.getDownloadUrl()) : '';
    const passport_name = Context.data.passport ? (await Context.data.passport!.fetch()).data.__name : '';
    const snils_url = Context.data.snils_file ? (await Context.data.snils_file!.getDownloadUrl()) : '';
    const snils_name = Context.data.snils_file ? (await Context.data.snils_file!.fetch()).data.__name : '';
    const inn_url = Context.data.inn_file ? (await Context.data.inn_file!.getDownloadUrl()) : '';
    const inn_name = Context.data.inn_file ? (await Context.data.inn_file!.fetch()).data.__name : '';
    const candidate_id = Context.data.candidate!.id
    const host = System.getBaseUrl()
    const apiKey = await Namespace.app.settings.search().where(f => f.code.eq("api_key")).first().then(resp => resp!.data.value);
    

    try {
        const run_process = await fetch(`${host}/pub/v1/bpm/template/document_recognition/recognition_candidate_documents/run`, {
            
            headers: {
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                'context' : {
                    "id_candidate": candidate_id,
                    "passport_url": passport_url,
                    "passport_name": passport_name,
                    "snils_url": snils_url,
                    "snils_name": snils_name,
                    "inn_url": inn_url,
                    "inn_name": inn_name,
                }
                
            }),
            method: "POST",
            
        });
        Context.data.response = run_process.statusText;
    } catch (e) {
        throw new Error(`error at run_process: ${e.message}`);
    } 

    
}

async function setTimerReminder(): Promise<void> {
    if (Context.data.date_reminder_responsible) {
        Context.data.reminder_timer_responsible = Context.data.possible_date_employment!.asDatetime(new TTime).add(new Duration(-Context.data.date_reminder_responsible,'days'));
    }
    const date_start = Context.data.possible_date_employment!.format('DD.MM.YYYY')
    Context.data.alert_body = `Напоминаем Вам о дате трудоустройства в компанию ${Context.data.name_entity}. Ваш первый рабочий день ${date_start}. Вы можете пройти на портал, чтобы ознакомиться с подробной информацией.`
}

async function getFiles(): Promise<void> {
    const passport_type = await Context.fields.table_personal_documents.fields.document_type.app.search().where(f => f.__name.eq('Паспорт. Страница с фото и данными')).first();
    const snils_type = await Context.fields.table_personal_documents.fields.document_type.app.search().where(f => f.__name.eq('СНИЛС')).first();
    const inn_type = await Context.fields.table_personal_documents.fields.document_type.app.search().where(f => f.__name.eq('ИНН')).first();
    if (Context.data.table_personal_documents) {
        for (let document of Context.data.table_personal_documents!) {
            if (passport_type && document.document_type.id == passport_type.id) {
                Context.data.passport = document.file_document;
            }
            if (snils_type && document.document_type.id == snils_type.id) {
                Context.data.snils_file = document.file_document;
            }
            if (inn_type && document.document_type.id == inn_type.id) {
                Context.data.inn_file = document.file_document;
            }
        }
    }
}



async function getTermRequestDocument(): Promise<void> {
    const setting = await Namespace.app.settings.search().where((f,g) => g.and(f.__deletedAt.eq(null), f.code.eq('deadline_requesting_additional_information_employment'))).first();
    if (setting) {
        const deadline_requesting_additional_information_employment = setting.data.quantity ? setting.data.quantity : 2;
        Context.data.deadline_requesting_additional_information_employment = await System.productionSchedule.calcDate(Context.data.possible_date_employment!.asDatetime(new TTime(0,0,0,0)), new Duration(-deadline_requesting_additional_information_employment, 'days'));
    }
}

async function getTermProvidingAdditionalDocuments(): Promise<void> {
    const setting = await Namespace.app.settings.search().where((f,g) => g.and(f.__deletedAt.eq(null), f.code.eq('deadline_providing_additional_information_employment_and_verifying'))).first();
    if (setting) {
        const deadline_providing_additional_information_employment_and_verifying = setting.data.quantity ? setting.data.quantity : 1;
        Context.data.deadline_providing_additional_information_employment_and_verifying = await System.productionSchedule.calcDate(new Datetime, new Duration(deadline_providing_additional_information_employment_and_verifying, 'days'));
    }
}

async function setAlertInvite(): Promise<void> {
    const setting = await Namespace.app.settings.search().where((f,g) => g.and(f.__deletedAt.eq(null), f.code.eq('deadline_filling_questionnaire_candidate'))).first();
    if (setting) {
        const deadline_filling_questionnaire_candidate = setting.data.quantity ? setting.data.quantity : 2;
        Context.data.alert_body = `Приглашаем вас на портал для заполнения анкеты кандидата и дальнейшего трудоустройства в ${Context.data.name_entity}. Перейдите по ссылке и пройдите процедуру регистрации на портале. Вам необходимо заполнить анкету кандидата в течение ${deadline_filling_questionnaire_candidate} дней.`
    }
}

async function setAlertOffer(): Promise<void> {
    Context.data.alert_body = `Поздравляем! Вы получили предложение о работе от компании ${Context.data.name_entity}. Пожалуйста, пройдите на портал, чтобы посмотреть информацию и подтвердить выход на работу.`
}

async function setAlertOfferReminder(): Promise<void> {
    Context.data.alert_body = `Напоминаем Вам о необходимости ознакомиться с предложением о работе от компании ${Context.data.name_entity}. Пожалуйста, пройдите на портал, чтобы посмотреть информацию и подтвердить выход на работу.`
}

async function setAlertFillingFormReminder(): Promise<void> {
    Context.data.alert_body = `Напоминаем, что Вам необходимо заполнить анкету кандидата для трудоустройства в компанию ${Context.data.name_entity}. Пройдите на портал для заполнения анкеты. В случае сложностей, пожалуйста, свяжитесь с представителем компании. `
}

async function checkFillingForm(): Promise<number> {
    const candidate = await Context.data.candidate_database!.fetch();
    if (candidate.data.__status!.code == candidate.fields.__status.variants.questionnaire_completed.code) {
        return 1
    }
    const now = new Datetime
    if (Context.data.deadline_filling_questionnaire_candidate && now.after(Context.data.deadline_filling_questionnaire_candidate)) {
        return 2
    }
    return 3
}

async function checkSigningJobOffer(): Promise<number> {
    const candidate = await Context.data.candidate_database!.fetch();
    const now = new Datetime;
    if (candidate.data.__status!.code == candidate.fields.__status.variants.job_offer_signed.code) {    //Предложение о работе подписано
        return 1
    }
    if (candidate.data.__status!.code == candidate.fields.__status.variants.clarifying_job_offer.code) {    //Требуются уточнения о предложении о работе
        return 2
    }
    if ((Context.data.deadline_signing_job_offer && now.after(Context.data.deadline_signing_job_offer)) || candidate.data.__status!.code == candidate.fields.__status.variants.security_rejection.code) {   //Подписание предложения о работе отклонено или просрочено
        return 3
    }
    return 4
}
