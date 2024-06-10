/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function timer_10(): Promise<void> {
    let currentTime = new Datetime();
    let needTime = new Datetime().add(new Duration(10, 'seconds'));

    while (!currentTime.after(needTime)) {
        currentTime = new Datetime();
    }
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

async function interrupt(): Promise<void> {
    const candidate = await Context.data.candidate_database!.fetch();
    if (candidate.data.id_process) {
        const status = Context.fields.candidate_database.app.fields.__status.variants.refused
        await candidate!.setStatus(status)
        
        const process = await System.processes._searchInstances().where(f => f.__id.eq(candidate.data.id_process!)).first();
        await process!.interrupt('Работа с кандидатом прервана инициатором');
    }
    
}