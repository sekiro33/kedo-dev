

async function getAllMedExam(): Promise<void> {
    let med_exam_array: TApplication<Application$kedo$Types_medical_examinations$Data, Application$kedo$Types_medical_examinations$Params, Application$kedo$Types_medical_examinations$Processes>[] = [];
    let position: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>;
    const medical_request = await Context.data.medical_request!.fetch();
    const staff = await medical_request.data.staff!.fetch();
    medical_request.data.old_postion = staff.data.position;
    medical_request.data.categories_table = staff.data.categories_table;
    if (medical_request.data.new_position) {
        position = await medical_request.data.new_position.fetch()
    } else {
        position = await medical_request.data.old_postion!.fetch()
    }
    if (position.data.harmful_production_factors && position.data.harmful_production_factors.length > 0) {
        Context.data.need_med_exam = true;
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
        med_exam_array = med_exam_array.filter((f) => !activ_med_exams.find(j => j.id === f.id));
    if (med_exam_array && med_exam_array.length > 0) {
        const med_exams = await Promise.all(med_exam_array.map(f => f.fetch()));
        for (const med_exam of med_exams) {
            const row_structure = medical_request.data.structure!.insert();
            row_structure.med_type = med_exam;
        }
    }
    medical_request.data.harmful_factors = position.data.harmful_production_factors;
    await medical_request.save();
}

async function createMedExamCards(): Promise<void> {
    Context.data.med_exam = [];
    let promises: Promise<void>[] = [];
    const medical_request = await Context.data.medical_request!.fetch();
    if (medical_request.data.structure && medical_request.data.structure.length > 0) {
        for (let row of medical_request.data.structure) {
            const med_exam = Context.fields.med_exam.app.create();
            med_exam.data.med_request = medical_request;
            med_exam.data.staff = medical_request.data.staff;
            med_exam.data.candidate = medical_request.data.candidate;
            if (medical_request.data.old_postion) {
                med_exam.data.position = medical_request.data.old_postion;
            } else {
                med_exam.data.position = medical_request.data.new_position;
            }
            med_exam.data.harmful_factors = medical_request.data.harmful_factors;
            med_exam.data.categories_table = medical_request.data.categories_table;
            med_exam.data.type_of_medical_examination = row.med_type;
            med_exam.data.due_date = row.due_date;
            med_exam.data.medical_organization = row.med_organization;
            med_exam.data.med_organization = Context.data.organization;
            promises.push(med_exam.save());
            Context.data.med_exam.push(med_exam);
        }
        await Promise.all(promises);
    }
}

async function setStatusCancelled(): Promise<void> {
    if (!Context.data.medical_request) {
        throw new Error("Context.data.medical_request is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.medical_request.namespace,
            code: Context.data.medical_request.code,
            id: Context.data.medical_request.id,
        },
        status: "cancelled",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusPending(): Promise<void> {
    if (!Context.data.medical_request) {
        throw new Error("Context.data.medical_request is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.medical_request.namespace,
            code: Context.data.medical_request.code,
            id: Context.data.medical_request.id,
        },
        status: "pending",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusIssued(): Promise<void> {
    if (!Context.data.medical_request) {
        throw new Error("Context.data.medical_request is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.medical_request.namespace,
            code: Context.data.medical_request.code,
            id: Context.data.medical_request.id,
        },
        status: "issued",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusApproval(): Promise<void> {
    if (!Context.data.medical_request) {
        throw new Error("Context.data.medical_request is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.medical_request.namespace,
            code: Context.data.medical_request.code,
            id: Context.data.medical_request.id,
        },
        status: "approval",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

//Получаем организацию
async function getOrganization(): Promise<void> {
    const medical_request = await Context.data.medical_request!.fetch();
    
    //Если есть сотрудник
    if (medical_request.data.staff) {
        const staff = await medical_request.data.staff.fetch();
        if (staff.data.organization) {
            Context.data.organization = staff.data.organization;
        }
    }

    //Если есть кандидат
    if (medical_request.data.candidate) {
        const candidate = await medical_request.data.candidate.fetch();
        if (candidate.data.planned_position) {
            const position = await candidate.data.planned_position.fetch();
            if (position.data.organization) {
                Context.data.organization = position.data.organization
            }
        }
    }
}
