/* Client scripts module */

declare const document: any;
declare const window: any;
declare const console: any;

interface IModule {
    __createdAt: TDatetime,
    __createdBy: string,
    __deletedAt: TDatetime,
    __id: string,
    __updatedAt: TDatetime,
    __updatedBy: string,
    author: string,
    code: string,
    description: string,
    enabled: boolean,
    help: string,
    language: string,
    name: string,
    namespace: string,
    summary: string,
    website: string,
    url?: string,
}

async function onInit(): Promise<void> {
    ViewContext.data.task_id = ViewContext.data.__itemRef.id;
    await getModules();
}

// Каждые 3 секунды запускаем скрипт получения состояния модулей, чтобы на форме отображалась актуальная информация.
async function getModules(): Promise<void> {
    //#region 
    /**
     * Проверка, открыта ли задача в данный момент.
     * Если задача закрыта, то останавливаем выполнение запросов на получение состояния модулей.
     * Получаем адресную строку у текущей вкладки и проверяем наличие ID задачи. 
     */
    const location = window.location.href;

    if (!location.includes(ViewContext.data.task_id)) {
        return;
    }
    //#end

    await Server.rpc.getModules();

    const modules: IModule[] = ViewContext.data.modules ?? [];
    modules.forEach(f => f.url = `${System.getBaseUrl()}/admin/extensions/ext_${f.__id}`);

    window.setTimeout(getModules, 3000);
}

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();

    const modules: IModule[] = ViewContext.data.modules ?? [];

    if (modules.some(m => m.enabled == false)) {
        result.addMessage("Имеются выключенные модули. Проверьте модули и включите их.");
    }

    return result;
}
