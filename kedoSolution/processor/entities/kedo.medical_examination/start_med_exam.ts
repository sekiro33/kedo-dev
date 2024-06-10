/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function defineEndMedExams(): Promise<void> {
    let med_exam_array: TApplication<Application$kedo$Types_medical_examinations$Data, Application$kedo$Types_medical_examinations$Params, Application$kedo$Types_medical_examinations$Processes>[] = [];
    let position: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>;
    const med_exam = await Context.data.medical_examination!.fetch();
    const medical_request = await med_exam.data.med_request!.fetch();
    const staff = await med_exam.data.staff!.fetch();
    if (medical_request.data.new_position) {
        position = await medical_request.data.new_position.fetch()
    } else {
        position = await  medical_request.data.old_postion!.fetch()
    }
    if (position.data.harmful_production_factors && position.data.harmful_production_factors.length > 0) {
        const factors = await Promise.all(position.data.harmful_production_factors.map(x => x.fetch()));
        for (let factor of factors) {
            med_exam_array = med_exam_array.concat(factor.data.necessary_preliminary_examinations!);
        }
        med_exam_array = med_exam_array.filter((f, i, s) => i === s.findIndex(t => t.id === f.id));
    }
    const activ_med_exams = await Namespace.app.medical_examination.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__status.neq(Namespace.app.medical_examination.fields.__status.variants.passed),
            f.staff.link(staff)
        ))
        .size(10000)
        .all();
    if (activ_med_exams && activ_med_exams.length > 0) 
        med_exam_array = med_exam_array.filter((f) => activ_med_exams.find(j => j.id === f.id));
    if (med_exam_array.length > 0)
        medical_request.setStatus(medical_request.fields.__status.variants.end)
}

async function searchUser(): Promise<void> {
    const medical_examination = await Context.data.medical_examination!.fetch();
    if (medical_examination.data.staff) {
        Context.data.staff_user = (await medical_examination.data.staff.fetch()).data.ext_user;
    }
    if (medical_examination.data.candidate) {
        Context.data.staff_user = (await medical_examination.data.candidate.fetch()).data.candidate;
    }
}

async function setAlert(): Promise<void> {
    const entity = (await Context.data.medical_examination!.fetch()).data.organization;
    const entity_name = entity ? (await entity.fetch()).data.__name : '';
    const date = Context.data.due_date ? Context.data.due_date.format('DD.MM.YYYY') : '';
    Context.data.alert = `Вам необходимо пройти медицинский осмотр для трудоустройства в компанию ${entity_name} до ${date}. Пожалуйста, пройдите на портал, чтобы посмотреть информацию и подтвердить прохождение медосмотра.`
}

async function setAlertReminder(): Promise<void> {
    const entity = (await Context.data.medical_examination!.fetch()).data.organization;
    const entity_name = entity ? (await entity.fetch()).data.__name : '';
    const date = Context.data.due_date ? Context.data.due_date.format('DD.MM.YYYY') : '';
    Context.data.alert = `Напоминаем о необходимости пройти медицинский осмотр для трудоустройства в компанию ${entity_name} до ${date}. Пожалуйста, пройдите на портал, чтобы посмотреть информацию и подтвердить прохождение медосмотра.`
}
