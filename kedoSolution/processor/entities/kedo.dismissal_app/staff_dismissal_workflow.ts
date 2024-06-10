/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getKedoSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(1000).all();

    // Участие бухгалтерии в процессе
    const accounting_in_processes = settings.find(f => f.data.code == 'accounting_in_processes');
    Context.data.accounting_in_processes = accounting_in_processes ? accounting_in_processes.data.status : false;
}

async function setLineStatus(): Promise<void> {
    const dismissal_app = await Context.data.dismissal_app!.fetch()
    dismissal_app.data.line_status = `${dismissal_app.data.__status!.code};${dismissal_app.data.__status!.name}`
    await dismissal_app.save();
}

/** Генерация текста уведомления для руководителя. */
async function createAlert(): Promise<void> {
    if (!Context.data.dismissal_app) {
        throw new Error("Context.data.dismissal_app is undefined");
    }

    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined");
    }

    const [dismissal_app, staff] = await Promise.all([
        Context.data.dismissal_app.fetch(),
        Context.data.staff.fetch()
    ]);

    const dismissal_date = dismissal_app.data.date_of_dismissal;

    Context.data.alert_body = `Сотрудник ${staff.data.__name} увольняется ${dismissal_date?.format("DD.MM.YYYY")}. Причина: ${dismissal_app.data.reason_for_leaving}`;
}

async function checkStaffEmployment(): Promise<boolean> {
    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined");
    }

    const staff = await Context.data.staff.fetch();

    /** Если у сотрудника таблица занятости пуста, то идем по ветке блокировки.*/
    if (!staff.data.employment_table || staff.data.employment_table.length == 0) {
        return true;
    }

    return false;
}

async function updateStaffEmploymentTable(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined");
    }

    if (!Context.data.employment_placement) {
        throw new Error("Context.data.employment_placement is undefined");
    }

    const staff = await Context.data.staff.fetch();
    const employment_placement = await Context.data.employment_placement.fetch();

    const employment_table = staff.data.employment_table!;
    const emplyoment_index = employment_table.findIndex(f => f.employment_placement_app?.id == employment_placement.id);

    if (emplyoment_index == -1) {
        throw new Error("Не удалось найти место занятости в таблице занятости сотрудника");
    }

    employment_table.delete(emplyoment_index);
    employment_placement.data.date_by = Context.data.dismissal_date ?? new TDate();

    await Promise.all([
        staff.save(),
        employment_placement.save(),
    ]);
}
