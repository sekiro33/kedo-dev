/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_notification_process_id(): Promise<void> {
    const process = await System.processes._searchInstances().where(f => f.__id.eq(Context.id)).first();

    if (!process) {
        throw new Error('Не найден текущий экзепляр процесса. process is undefined');
    }

    if (!process.data.__parentId) {
        throw new Error('Не найден экзепляр процесса напоминания. process.data.__parentId is undefined');
    }

    const parent_process = await System.processes._searchInstances().where(f => f.__id.eq(process.data.__parentId!)).first();

    if (!parent_process) {
        throw new Error('Не найден экзепляр процесса напоминания. parent_process is undefined');
    }

    Context.data.notification_process_link = `${System.getBaseUrl()}/admin/monitor/${parent_process.data.__templateId}(p:history/${parent_process.id})`;
    Context.data.notify_process_id = process.data.__parentId;
}


async function check_task(): Promise<number> {
    if (!Context.data.task_id) {
        return -1;
    }

    const task = await System.processes._searchTasks().where(f => f.__id.eq(Context.data.task_id!)).first();

    if (!task) {
        return -1;
    }

    // Задача выполнена.
    if (task.data.state != 'in_progress') {
        return 0;
    }

    // Задача ещё выполняется.
    return 1;
}

async function interrupt_process(): Promise<void> {
    const proccess = await System.processes._searchInstances().where(f => f.__id.eq(Context.data.notify_process_id!)).first();

    try {
        await proccess!.interrupt(Context.data.interrupt_reason ?? "unknown reason");
    } catch (e) {
        Context.data.__comment = JSON.stringify(e);
    }
}
