/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function line_status_set(): Promise<void> {
    let doc = await Context.data.dismissal_order!.fetch();
    doc.data.line_status = `${doc.data.__status!.code};${doc.data.__status!.name}`
    await doc.save();
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

async function createStatusCanceled(): Promise<void> {
    createStatusObj(Context.data.dismissal_order, 'cancelled');
}

/** Расчет времени эскалации задачи. */
async function calcEscalationTime(): Promise<void> {
    if (!Context.data.dismissal_app) {
        throw new Error("Context.data.dismissal_app is undefined");
    }

    const dismissal_app = await Context.data.dismissal_app.fetch();

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
