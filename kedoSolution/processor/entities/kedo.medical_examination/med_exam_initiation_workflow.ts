/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getEndingMedExams(): Promise<void> {
    const start = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('med_start_days')
        ))
        .first();
    const end = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('med_interval_days')
        ))
        .first();
    Context.data.start_days = start && start.data.quantity ? start.data.quantity : 30;
    const end_days = end && end.data.quantity ? end.data.quantity : 14;
    Context.data.end_days = Context.data.start_days + end_days;
    const current_date = new TDate();
    // Context.data.start_days = 0;
    // Context.data.end_days = 5;
    const med_exams = await Context.fields.medical_examination.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__status.eq(Context.fields.medical_examination.app.fields.__status.variants.passed),
            f.extended.eq(null),
            f.valid_up_to.gte(current_date.addDate(0, 0, Context.data.start_days!)),
            f.valid_up_to.lte(current_date.addDate(0, 0, Context.data.end_days!))
        ))
        .size(10000)
        .all();
    Context.data.debug = med_exams.length.toString();
    if (med_exams && med_exams.length > 0) {
        let staffs_array: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[] = [];
        let promises: Promise<void>[] = [];
        Context.data.medical_requests = [];
        for (const med_exam of med_exams) {
            if (med_exam.data.staff) {
                staffs_array.push(med_exam.data.staff)
            }
        }
        staffs_array = staffs_array.filter((f, i, s) =>
            i === s.findIndex(t => t.id === f.id)
        )
        let staffs_result = await Promise.all(staffs_array.map(x => x.fetch()));
        for (let i = 0; i <= staffs_result.length - 1; i++) {
            const staff = staffs_result[i];
            const my_med_exams = med_exams.filter(f => f.data.staff && f.data.staff.id === staff.id);
            const medical_request = Context.fields.medical_requests.app.create();
            medical_request.data.sort_of_medical_examination = medical_request.fields.sort_of_medical_examination.variants.periodic_examination;
            medical_request.data.staff = staffs_array[i];
            medical_request.data.categories_table = staff.data.categories_table;
            medical_request.data.old_postion = staff.data.position;
            medical_request.data.harmful_factors = my_med_exams.map(f => f.data.harmful_factors!).reduce((a, b) => a.concat(b));
            for (let med_exam of my_med_exams) {
                const row = medical_request.data.structure!.insert();
                row.med_type = med_exam.data.type_of_medical_examination!;
                row.med_organization = med_exam.data.medical_organization!;
            }
            promises.push(medical_request.save());
            Context.data.medical_requests.push(medical_request);
        }
        await Promise.all(promises);
        promises = [];
        for (const med_exam of med_exams) {
            med_exam.data.extended = 'true';
            promises.push(med_exam.save())
        }
        await Promise.all(promises);
    }
}
