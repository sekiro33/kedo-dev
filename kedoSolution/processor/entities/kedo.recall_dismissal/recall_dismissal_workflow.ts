/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function check_kedo_agreement(): Promise<boolean> {
    let staff = await Context.data.staff!.fetch();
    if (staff.data.kedo_agreement) {
        return true;
    } else {
        return false;
    }
}

async function check_condition(): Promise<boolean> {
    let app = await Context.data.letter_of_resignation!.fetch();
    let id = app!.data.__id;
    let process = await Context.fields.staff.app.processes.the_dismissal_process._searchInstances().where((proc, g) => g.and(proc.__id.eq(id))).first();
    if (process && ( process.data.__state == ProcessInstanceState.done || process.data.__state == ProcessInstanceState.error || process.data.__state == ProcessInstanceState.cancel)) {
        return false
    } else {
        return true;
    }
}

async function findAgregationApp(): Promise<void> {
    const aggregationApp = await Context.fields.aggregate_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.staff.link(Context.data.staff!)
    )).first();
    Context.data.aggregate_app = aggregationApp;
};

async function createStatusObj(app: any, status: string): Promise<void> {  
    const obj_status = {
        'app' : {
            'namespace' : app.namespace,
            'code'      : app.code,
            'id'        : app.id,
        },
        'status'    : status,
    }
    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function createStatusSigning(): Promise<void> {
    createStatusObj(Context.data.recall_dismissal, 'signing');
}
async function createStatusCancelled(): Promise<void> {
    createStatusObj(Context.data.recall_dismissal, 'cancelled');
}
async function createStatusPaperPrepare(): Promise<void> {
    createStatusObj(Context.data.recall_dismissal, 'paper_prepare');
}
async function createStatusAppMakingCancellation(): Promise<void> {
    createStatusObj(Context.data.aggregate_app, 'making_cancellation');
}
async function createStatusMakingCancellation(): Promise<void> {
    createStatusObj(Context.data.letter_of_resignation, 'making_cancellation');
}

async function setStatuses(): Promise<void> {
    if (Context.data.aggregate_app) {
        const app_status = await Context.data.aggregate_app.fetch();
        if (app_status.data.kedo_status) {
            const app_status_fetch = await app_status.data.kedo_status.fetch();
            //Context.data.code_app_status = app_status_fetch.data.code;
            // const obj_app_status = {
            //     name: app_status_fetch.data.name!,
            //     code: app_status_fetch.data.code!
            // }

            Context.fields.enum_status.data.variants.push({code: app_status_fetch.data.code!, name: app_status_fetch.data.name!});
            Context.data.enum_status = Context.fields.enum_status.data.variants.find(e => e.code == app_status_fetch.data.code) as never;
        }
    }

    if (Context.data.letter_of_resignation) {
        const app_status = await Context.data.letter_of_resignation.fetch();
        if (app_status.data.kedo_status) {
            const app_status_fetch = await app_status.data.kedo_status.fetch();
            //Context.data.code_status = app_status_fetch.data.code;
            // const obj_app_status = {
            //     name: app_status_fetch.data.name!,
            //     code: app_status_fetch.data.code!
            // }

            Context.fields.enum_status_application.data.variants.push({code: app_status_fetch.data.code!, name: app_status_fetch.data.name!});
            Context.data.enum_status_application = Context.fields.enum_status_application.data.variants.find(e => e.code == app_status_fetch.data.code) as never;
        }
    }
}

async function createStatusAppBack(): Promise<void> {
    if (Context.data.code_app_status) {
        createStatusObj(Context.data.aggregate_app, Context.data.code_app_status);
    }
}
async function createStatusBack(): Promise<void> {
    if (Context.data.code_status) {
        createStatusObj(Context.data.letter_of_resignation, Context.data.code_status);
    }
}

async function calcEscalationTime(): Promise<void> {
    if (!Context.data.aggregate_app) {
        throw new Error("Context.data.aggregate_app is undefined");
    }

    const dismissal_app = await Context.data.aggregate_app.fetch();

    if (!dismissal_app.data.date_of_dismissal) {
        throw new Error("Не указана дата увольнения.");
    }

    const dismissal_escalation_hr = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq("dismissal_escalation_hr")
        ))
        .first();

    const hours = dismissal_escalation_hr && dismissal_escalation_hr.data.quantity ? dismissal_escalation_hr.data.quantity : 4;
    
    const dismissal_date = dismissal_app.data.date_of_dismissal;

    // Получаем продолжительность рабочего дня.
    const settings = await System.productionSchedule.getGeneralSettings();
    const working_time = settings.daySchedule.workingTime;

    /*
        Вычисляем дату/время эскалации на отдел кадров.
        - дату округляем до полуночи
        - получаем дату завершения рабочего дня
        - вычитаем количество часов, заданных настройкой
    */
    const escalation_date = dismissal_date
        .asDatetime(new TTime(0, 0, 0, 0))
        .add(new Duration(working_time.to, "seconds"))
        .add(new Duration(-hours, "hours"))

    Context.data.escalation_time = escalation_date;
}
async function processingDateForSigning(): Promise<void> {
    if (!Context.data.aggregate_app) {
        throw new Error("Context.data.aggregate_app is undefined");
    }

    const dismissal_app = await Context.data.aggregate_app.fetch();
    Context.data.signing_date = dismissal_app.data.date_of_dismissal;
}
