/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_kedo_settings(): Promise<void> {
    const settings = await Context.fields.kedo_settings.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const remind_frequency = settings.find(f => f.data.code == 'remind_frequency');
    Context.data.remind_frequency = remind_frequency && remind_frequency.data.quantity ? remind_frequency.data.quantity : 4;

    const notify_deadline_chief = settings.find(f => f.data.code == 'notify_deadline_chief');
    Context.data.notify_deadline_chief = notify_deadline_chief && notify_deadline_chief.data.quantity ? notify_deadline_chief.data.quantity : 12;

    const notify_deadline_hr_dep = settings.find(f => f.data.code == 'notify_deadline_hr_dep');
    Context.data.notify_deadline_hr_dep = notify_deadline_hr_dep && notify_deadline_hr_dep.data.quantity ? notify_deadline_hr_dep.data.quantity : 8;
}

async function get_current_time(): Promise<void> {
    Context.data.current_datetime = new Datetime();
}

async function set_timer(): Promise<void> {
    if (!Context.data.remind_frequency || Context.data.remind_frequency == 0) {
        Context.data.remind_frequency = 4;
    }

    const current_datetime = new Datetime();
    Context.data.remind_datetime = await System.productionSchedule.calcDate(current_datetime, new Duration(Context.data.remind_frequency!, 'hours'));
}

async function check_overdue(): Promise<boolean> {
    const currentTime = new Datetime();
    const limit = Context.data.execution_time!;
    const remind_frequency = Context.data.remind_frequency!;

    if (limit.sub(currentTime).hours > remind_frequency) {
        return true;
    }

    return false;
}

async function check_document(): Promise<boolean> {
    const task_id = Context.data.task_id!;

    const task = await System.processes._searchTasks().where((f, g) => g.and(
        f.__id.eq(task_id!)
    )).first();

    if (task && task.data.state != 'in_progress') {
        return true;
    }

    return false;
}

async function generate_alert_body(): Promise<void> {
    const limit = Context.data.execution_time!.format('DD.MM.YYYY HH:mm');

    Context.data.alert_body_email = `Вам поступил документ на подписание. Срок выполнения ${limit}. Перейдите на портал КЭДО.`;
    Context.data.alert_body_sms = `Вам поступил документ на подписание. Срок выполнения ${limit}. Перейдите на портал КЭДО. (ссылка)`;
}

async function generate_alert_staff(): Promise<void> {
    const limit = Context.data.execution_time!.format('DD.MM.YYYY HH:mm');

    Context.data.alert_body_email = `Внимание! У вас есть не подписанный документ. Срок подписания ${limit}.`;
    Context.data.alert_body_sms = `Внимание! У вас есть не подписанный документ. Срок подписания ${limit}.`;
}

async function generate_alert_chief(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    const limit = Context.data.execution_time!.format('DD.MM.YYYY HH:mm');

    Context.data.alert_body_email = `Внимание! У ${staff.data.__name} есть не подписанный документ. Срок подписания ${limit}. Проконтролируйте подписание.`;
    Context.data.alert_body_sms = `Внимание! У ${staff.data.__name} есть не подписанный документ. Срок подписания ${limit}. Проконтролируйте подписание.`;
}

function log(text: string): void {
    if (!Context.data.debug) {
        Context.data.debug = '';
    }

    Context.data.debug += `${text}\n`;
}

async function get_task_id(): Promise<void> {
    // Получаем экземпляр текущего процесса.
    const current_process = await System.processes._searchInstances().where(f => f.__id.eq(Context.id)).first();

    // Получаем родительский процесс, из которого был запущен текущий процесс.
    const parent_process = await System.processes._searchInstances().where(f => f.__id.eq(current_process!.data.__parentId!)).first();

    if (!parent_process) {
        Context.data.error = `Не удалось найти экземпляр родительского процесса. ID текущего процесса: ${current_process!.id}`;
        throw new Error(Context.data.error);
    }

    const parent_process_template = await parent_process.getTemplate();
    const proccess_data = parent_process_template.namespace.split('.');

    /** Формирование строки - шаблон родительского процесса. */
    const templateNsAndCode = `${proccess_data.join('.')}:${parent_process_template.code}`;

    /** Получаем все задачи шаблона родительского процесса и сортируем их по убыванию. */
    const tasks = await System.processes._searchTasks()
        .where((f, g) => g.and(
            g.or(
                f.state.like('in_progress'),
                f.state.like('assignment')
            ),
            f.templateNsAndCode.eq(templateNsAndCode)
        ))
        .sort("__createdAt", false)
        .size(1000)
        .all();

    /** Получение задач родительского процесса. */
    let parent_process_tasks = tasks.filter(f => f.data.instance && f.data.instance.__id == parent_process?.id);

    if (parent_process_tasks.length == 0) {
        Context.data.error = `Не найдена задача, которую нужно отслеживать. ID текущего процесса: ${Context.id}; ID родительского процесса: ${parent_process.id};`;
        throw new Error(Context.data.error);
    }

    // Первая задача род. процесса - задача, которую нам нужно контролировать.
    const need_task = parent_process_tasks[0];

    if (need_task && !need_task.data.dueDate) {
        Context.data.error = `Для задачи ${need_task.data.__name} не установлено время выполнения.`
        throw new Error(Context.data.error);
    }

    // Записываем в контекст ID задачи и время выполнения.
    Context.data.task_id = need_task.id;
    Context.data.execution_time = need_task.data.dueDate;

    Context.data.parent_process_link = `${System.getBaseUrl()}/admin/monitor/${parent_process.data.__templateId}(p:history/${parent_process.id})`;
    Context.data.task_link = `${System.getBaseUrl()}/admin/monitor/${parent_process.data.__templateId}(p:task/${need_task.id})`;
}

async function calc_time_chief(): Promise<void> {
    const notify_deadline_chief = Context.data.notify_deadline_chief;
    const limit = Context.data.execution_time;

    const planned_datetime = limit!.add(new Duration(-notify_deadline_chief!, 'hours'));

    if (planned_datetime.before(new Datetime())) {
        Context.data.notify_chief_datetime = new Datetime().add(new Duration(1, 'hours'));
    } else {
        Context.data.notify_chief_datetime = planned_datetime;
    }
}

async function calc_time_hr(): Promise<void> {
    const notify_deadline_hr = Context.data.notify_deadline_hr_dep;
    const limit = Context.data.execution_time;

    const planned_datetime = limit!.add(new Duration(-notify_deadline_hr!, 'hours'));

    if (planned_datetime.before(new Datetime())) {
        Context.data.notify_hr_datetime = new Datetime().add(new Duration(1, 'hours'));
    } else {
        Context.data.notify_hr_datetime = planned_datetime;
    }
}

async function timer_10(): Promise<void> {
    let currentTime = new Datetime();
    let needTime = new Datetime().add(new Duration(20, 'seconds'));

    while (!currentTime.after(needTime)) {
        currentTime = new Datetime();
    }
}

async function designInPaper(): Promise<void> {
    if (Context.data.task_id) {
        const task = await System.processes._searchTasks().where(f => f.__id.eq(Context.data.task_id!)).first();
        if (task) {
            try {
                await task.changeDueDate(new Datetime(),'В бумагу')
            } catch {}
        }
    }
}
