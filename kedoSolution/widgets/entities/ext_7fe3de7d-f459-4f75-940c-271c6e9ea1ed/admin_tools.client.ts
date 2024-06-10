/* Client scripts module */

declare const document: any;

interface IProcessData {
    name: string,
    href: string,
    parent?: IProcessData,
    createdAt?: string,
    updatedAt?: string,
    state?: ProcessInstanceState,
    state_line?: string,
}

async function toolButtonOnClick(): Promise<void> {
    if (!Context.data.kedo_token) {
        const token = await Context.fields.kedo_settings.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.code.eq("api_key")
            ))
            .first();

        if (!token || !token.data.value) {
            error(`Параметр api_key не заполнен в настройках КЭДО.`);
            throw new Error("Параметр api_key не заполнен в настройках КЭДО.");
        }

        Context.data.kedo_token = token.data.value;
    }

    Context.data.show_modal = true;

    loadData();
}

async function copyToClipboard(field_code: string): Promise<void> {
    if (!field_code || field_code.trim() === "") return;

    if ((Context.fields[field_code] as any).type !== "STRING") {
        return;
    }

    const value = Context.data[field_code];

    // Create a "hidden" input
    var aux = document.createElement("input");

    // Assign it the value of the specified element
    aux.setAttribute("value", value);

    // Append it to the body
    document.body.appendChild(aux);

    // Highlight its content
    aux.select();

    // Copy the highlighted text
    document.execCommand("copy");

    // Remove it from the body
    document.body.removeChild(aux);
}

async function loadData(): Promise<void> {
    Context.data.element_id = Context.data.item?.id;

    const item = Context.data.item;

    if (item?.namespace == "system" && item?.code == "tasks") {
        Context.data.is_task = true;
    } else {
        Context.data.is_app = true;
    }

    await Promise.all([
        getAppContext(),
        getRelatedProcess(),
    ])
}

/** Получение контекста приложения. */
async function getAppContext(): Promise<void> {
    if (!Context.data.item) {
        return;
    }

    let app_data = {};

    try {
        const response = await fetch(`${System.getBaseUrl()}/pub/v1/app/${Context.data.item.namespace}/${Context.data.item.code}/${Context.data.item.id}/get`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${Context.data.kedo_token}`
            }
        });

        app_data = await response.json();
    } catch (error) {
        error(`Во время выполнения запроса на получение контекста произошла ошибка: ${JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack
        })}`);

        throw new Error(JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack
        }));
    }

    Context.data.app_context_json = JSON.stringify(app_data, null, 4);
}

function getState(process_state: ProcessInstanceState | undefined): string {
    switch (process_state) {
        case ProcessInstanceState.cancel: {
            return "Прерван";
        }

        case ProcessInstanceState.error: {
            return "Ошибка";
        }

        case ProcessInstanceState.done: {
            return "Завершен";
        }

        case ProcessInstanceState.exec: {
            return "Выполняется";
        }

        case ProcessInstanceState.wait: {
            return "Ожидание";
        }

        default: {
            return "";
        }
    }
}

async function getRelatedProcess(): Promise<void> {
    if (!Context.data.item || Context.data.is_app == false) {
        return;
    }

    const process = await System.processes._searchInstances()
        .where((f, g) => g.and(
            (f.__item as any).eq(Context.data.item!)
        ))
        .size(1000)
        .all();

    const parent_process_ids = process
        .filter(p => p.data.__parentId != undefined)
        .map(p => p.data.__parentId!);

    const parent_process = await System.processes._searchInstances()
        .where(f => f.__id.in(parent_process_ids))
        .size(parent_process_ids.length)
        .all();

    const process_data: IProcessData[] = process
        .map(p => {
            const parent = parent_process.find(f => f.data.__id == p.data.__parentId);

            return {
                name: p.data.__name,
                href: `${System.getBaseUrl()}/admin/monitor/${p.data.__templateId}(p:history/${p.data.__id})`,
                createdAt: p.data.__createdAt.format("DD.MM.YYYY HH:mm:ss"),
                updatedAt: p.data.__updatedAt.format("DD.MM.YYYY HH:mm:ss"),
                state_line: getState(p.data.__state),
                state: p.data.__state,
                parent: parent ? {
                    name: parent.data.__name,
                    href: `${System.getBaseUrl()}/admin/monitor/${parent.data.__templateId}(p:history/${parent.data.__id})`,
                } : undefined,
            }
        });

    Context.data.process_list = process_data;
}

async function needRender(): Promise<boolean> {
    const user = await System.users.getCurrentUser();

    // Проверка наличия пользователя в группах "Администраторы" или "Супервизор"
    const sys_groups = (user.data.groupIds ?? []).filter(f => f?.id == "d6000da0-c9aa-55eb-9882-f118b432730b" || f?.id == "331e62d2-072e-58ac-9581-74abcc67f050");

    if (sys_groups.length > 0) {
        return true;
    }

    return false;
}

async function formatBody(): Promise<void> {
    if (!Context.data.body) return;

    try {
        const obj = Context.data.body ? JSON.parse(Context.data.body) : {};
        Context.data.body = JSON.stringify(obj, undefined, 4);
    } catch (error) {
        error(JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack,
        }));
        
        throw new Error(JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack,
        }))
    }
}

async function clearBody(): Promise<void> {
    Context.data.body = undefined;
}

declare const console: any;

async function refreshBody(): Promise<void> {
    const app = await Context.data.item!.fetch();

    const context = {};

    const fields = Object.keys(app.fields).filter(f => !f.includes("__"));

    for (const field of fields) {
        console.log(field, app.fields[field].__describe());
        addProperty(context, app.fields[field].__describe());
    }

    Context.data.body = JSON.stringify(context, undefined, 4);
}

function addProperty(object: any, property: any): void {
    let defaultValue: any = null;

    switch (property.type) {
        case DynamicFieldType.Category: {
            defaultValue = [{ code: "code", name: "name" }];
            break;
        }

        case DynamicFieldType.Application: {
            defaultValue = ["00000000-0000-0000-0000-000000000000"];
            break;
        }

        case DynamicFieldType.Boolean: {
            defaultValue = true;
            break;
        }

        case DynamicFieldType.RefItem: {
            defaultValue = {
                id: "",
                code: "",
                namespace: "",
            };
            break;
        }

        case DynamicFieldType.User: {
            defaultValue = ["00000000-0000-0000-0000-000000000000"];
            break;
        }

        case DynamicFieldType.String: {
            defaultValue = "example";
            break;
        }

        case DynamicFieldType.Money: {
            defaultValue = {
                "cents": 36500,
                "currency": "RUB"
            };
            break;
        }

        case DynamicFieldType.Float: {
            defaultValue = 365;
            break;
        }

        case DynamicFieldType.File: {
            defaultValue = [];
            break;
        }

        case DynamicFieldType.Datetime: {
            defaultValue = new Datetime().format();
            break;
        }

        case DynamicFieldType.Enum: {
            defaultValue = [
                {
                    "code": "code",
                    "name": "name"
                }
            ];
            break;
        }

        case DynamicFieldType.Table: {
            defaultValue = null;
            break;
        }

        default: {
            defaultValue = null;
            break;
        }
    }

    Object.defineProperty(object, property.code, {
        value: defaultValue,
        writable: true,
        enumerable: true,
        configurable: true,
    });
}

async function openPropertyModal(): Promise<void> {
    const app = await Context.data.item!.fetch();
    const fields = Object.keys(app.fields).filter(f => !f.includes("__"));

    const field_names: { name: string, code: string }[] = []

    for (let code of fields) {
        const name = (app.fields[code] as any).name as string | undefined;
        if (name) field_names.push({ name, code })
    }

    console.log(field_names);

    Context.fields.context_fields.data.variants = [];
    Context.fields.context_fields.data.variants = field_names;
    Context.data.context_fields = [];

    Context.data.show_add_context_fields_modal = true;
}

async function addNewProperty(): Promise<void> {
    const app = await Context.data.item!.fetch();
    const selected_properties = Context.data.context_fields!;
    const body = Context.data.body ? JSON.parse(Context.data.body).context : {};

    for (const field of selected_properties) {
        if (!Object.getOwnPropertyDescriptor(body, field.code)) {
            addProperty(body, app.fields[field.code].__describe());
        }
    }

    Context.data.body = JSON.stringify({ context: body }, undefined, 4);
    Context.data.show_add_context_fields_modal = false;
}

async function updateContext(): Promise<void> {
    if (!Context.data.item) {
        error("Context.data.item is undefined");
        throw new Error("Context.data.item is undefined");
    }

    if (!Context.data.body) {
        error("Отсутствует тело запроса");
        throw new Error("Отсутствует тело запроса");
    }

    try {
        const response = await fetch(`${System.getBaseUrl()}/pub/v1/app/${Context.data.item.namespace}/${Context.data.item.code}/${Context.data.item.id}/update`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Context.data.kedo_token}`
            },
            body: Context.data.body,
        });

        if (!response || !response.ok) {
            error(`Во время выполнения запроса произошла ошибка: ${JSON.stringify(response)}`);
            throw new Error(`Во время выполнения запроса произошла ошибка: ${JSON.stringify(response)}`);
        }

        const result = await response.json();
        Context.data.response = JSON.stringify(result, undefined, 4);
    } catch (error) {
        error(`Во время выполнения запроса произошла ошибка: ${JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack,
        })}`)
    }
}

async function reassignmentTask(): Promise<void> {
    if (!Context.data.staff) return;

    const staff = await Context.data.staff.fetch();

    if (!staff.data.ext_user) {
        error("У сотрудника не указан пользователь");
        return;
    }

    const task = await System.processes._searchTasks().where(f => f.__id.eq(Context.data.element_id!)).first();

    if (!task) {
        error("Задача не найдена");
        return;
    }

    if (task.data.state == ProcessTaskState.closed || task.data.state == ProcessTaskState.cancel) {
        error("Задача уже выполнена");
        return;
    }

    try {
        await task.reassign(staff.data.ext_user);
        success(`Задача успешно переназначена на ${staff.data.__name}`);
    } catch (error) {
        error(`При переназначении задачи произошла ошибка: ${JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack,
        })}`);
    }

    Context.data.staff = undefined;
}

enum NotifyType {
    ERROR,
    WARNING,
    SUCCESS,
}

declare const notify: any;

function error(text: string): void {
    alert(text, NotifyType.ERROR, 5000);
}

function success(text: string): void {
    alert(text, NotifyType.SUCCESS, 3000);
}

function alert(text: string, notify_type: NotifyType, duration: number): void {
    let notify_type_line = "success";

    switch (notify_type) {
        case NotifyType.ERROR: {
            notify_type_line = "danger";
            break;
        }

        case NotifyType.SUCCESS: {
            notify_type_line = "success";
            break;
        }

        default: {
            notify_type_line = "default";
            break;
        }
    }

    notify({
        message: text,
        color: notify_type_line,
        timeout: duration,
    });
}
