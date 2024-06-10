//new logic

declare const console: any;
declare const document: any;
declare const window: any;

type taskItem = {
    id: string,
    user_id: string,
    task_name: string,
    user_name: string,
    avatar_link: string,
    due_date: string,
    state: string
};

type taskData = {
    url: string;
    __id: string;
    path: string;
    place: string;
    state: string;
    __item: TRefItem;
    __name: string;
    branch: string;
    dueDate: string;
    openRef: boolean;
    planEnd?: null;
    timerId: string;
    __logged: boolean;
    __target: string;
    priority: number;
    template: string;
    __context?: (null)[] | null;
    __percent: number;
    companies?: null;
    planStart?: null;
    performers?: (string)[] | null;
    reassignes?: (string)[] | null;
    __createdAt: string;
    __createdBy: string;
    __deletedAt?: null;
    __updatedAt: string;
    __updatedBy: string;
    description: string;
    __targetData?: null;
    allowReassign: boolean;
    originalPerformers?: (string)[] | null;
    externalParticipants?: null;
};

type searchRef = {[key: string]: {
    namespace: string,
    code: string,
    id: string
}};

const baseUrl = System.getBaseUrl();

const appToSearchFieldReference: Record<string, string> = {
    "employment_app": "__item",
    "electronic_interaction_agreement": "employment_app",
    "labor_contract": "employment_app",
    "admission_order": "employment_app",
    "information_about_labor_activity": "employment_app",
    "job_application": "employment_app",
    "additional_agreement_to_the_contract": "employment_app",
    "additional_agreement": "employment_app",
    "consent_processing_personal_data": "employment_app",
    "transfer_application": "__item",
    "order_for_transfer": "application_transfer",
    "transfer_approve": "transfer_application",
    "additional_transfer_agreement": "transfer_application",
    "execution_duties": "__item",
    "memo_execution_responsibilities": "execution_dutie",
    "order_execution_responsibilities": "execution_dutie",
    "execution_responsibilities_consent": "execution_dutie",
    "execution_responsibilities_additional_agreement": "execution_duties",
    "dismissal_app": "__item",
    "letter_of_resignation": "application_dismissal",
    "dismissal_order": "application_dismissal",
    "recall_dismissal": "application_dismissal",
    "category_assignment": "__item",
    "application_category_assignment": "category_assignment",
    "employees_personal_data": "__item",
    "passport_data_application": "staff_personal_data",
    "passport_data_change_order": "staff_personal_data",
    "child_personal_data_consent": "staff_personal_data",
    "medical_request": "__item",
    "medical_examination": "med_request",
    // "docs_lna": "__item",
    "orders_lna": "doc_lna",
    "vacations": "__item",
    "vacation_docs": "vacation",
    "vacation_orders": "vacation",
    "memo_recall_vacation": "vacation",
    "consent_recall_vacation": "vacation",
    "overtime_work": "__item",
    "overtime_requests": "overtime_work",
    "overtimeWorkOrders": "overtime_work",
    "overtimeWorkNotifications": "overtime_work",
    "overtimeWorkConsent": "overtime_work",
    "overtime_order": "overtime_work",//businesstrip_requests business_trip
    "businesstrip_requests": "__item",
    "trip_requests": "businesstrip_requests",
    "order_for_a_business_trip": "business_trip",
    "avansovyi_otchet": "businesstrip_requests",
    "service_assignments": "businesstrip_requests",
    "service_note_accountable_funds": "business_trip",
    "business_trip_consent": "business_trip",
    "business_trip_change_service_note": "business_trip"
};

const appToSubAppsReference: {[key: string]: string[]} = {
    "employment_app": [
        "employment_app",
        "electronic_interaction_agreement",
        "labor_contract",
        "admission_order",
        "information_about_labor_activity",
        "job_application",
        "additional_agreement_to_the_contract",
        "additional_agreement",
        "consent_processing_personal_data"
    ],
    "transfer_application": [
        "transfer_application",
        "order_for_transfer",
        "transfer_approve",
        "additional_transfer_agreement"
    ],
    "execution_duties": [
        "execution_duties",
        "memo_execution_responsibilities",
        "order_execution_responsibilities",
        "execution_responsibilities_consent",
        "execution_responsibilities_additional_agreement"
    ],
    "dismissal_app": [
        "dismissal_app",
        "letter_of_resignation",
        "dismissal_order",
        "recall_dismissal"
    ],
    "category_assignment": [
        "category_assignment",
        "application_category_assignment"
    ],
    "employees_personal_data": [
        "employees_personal_data",
        "passport_data_application",
        "passport_data_change_order",
        "child_personal_data_consent"
    ],
    "medical_request": [
        "medical_request",
        "medical_examination"
    ],
    "docs_lna": [
        "docs_lna",
        "orders_lna"
    ],
    "vacations": [
        "vacations",
        "vacation_docs",
        "vacation_orders",
        "memo_recall_vacation",
        "consent_recall_vacation",
        "offer_vacation_schedule",
        "notification_vacation_schedule"
    ],
    "overtime_work": [
        "overtime_work",
        "overtime_requests",
        "overtimeWorkOrders",
        "overtimeWorkNotifications",
        "overtimeWorkConsent",
        "overtime_order"
    ],
    "businesstrip_requests": [
        "businesstrip_requests",
        "trip_requests",
        "order_for_a_business_trip",
        "avansovyi_otchet",
        "service_assignments",
        "service_note_accountable_funds",
        "business_trip_consent",
        "business_trip_change_service_note"
    ]
};

const additionalNamespaces: {[key: string]: string} = {
    "vacations": "absences_ext",
    "businesstrip_requests": "business_trips_ext_settings"
};

let tasksContainer: any;
let users: UserItem[];
let serializedTasks: taskItem[] = [];

async function onInit(): Promise<void> {
    users = await System.users.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const token = await Context.fields.settings.app.search().where(f => f.code.eq("api_key")).first().then(res => res!.data.value);
    Context.data.api_key = token;
    const waitForContainer = window.setInterval(() => {
        tasksContainer = document.querySelector(".linked-tasks_container");

        if (!tasksContainer) {
            return;
        };

        window.clearInterval(waitForContainer);
        getNamespaceProcesses().then(_ => renderTasks(serializedTasks))
    }, 200);
};

async function getNamespaceProcesses(): Promise<void> {
    const token = Context.data.api_key;
    const appCode = Context.data.item_ref!.code;
    const appNs = Context.data.item_ref!.namespace;
    const subAppsCodes = appToSubAppsReference[appCode];
    
    if (!subAppsCodes) {
        console.log("wrong app")
        return;
    };

    const appProcessesSchemasCodes: string[] = [].concat.apply([], await Promise.all(subAppsCodes.map(code => {
        return fetch(`${baseUrl}/pub/v1/scheme/namespaces/${appNs}/apps/${code}/processes`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res => res.json()).then(resJson => resJson.result.result.map((proc: any) => proc.code))
    })));

    if (["businesstrip_requests", "vacations"].indexOf(appCode) !== -1) {
        appProcessesSchemasCodes.push("agreement_workflow");
    };

    const templatesIds = await fetch(`${baseUrl}/api/worker/query/system/bp_templates/search`, {
        method: "PUT",
        body: JSON.stringify({
            offset: 0,
            limit: 100,
            order: [],
            filter: {
                and: [
                    {
                        in :[
                            {field: "code" },
                            {list: appProcessesSchemasCodes}
                        ]
                    }
                ]
            }
        })
    });

    const templatesJson = await templatesIds.json().then(res => res.items.map((item: any) => {
        console.log(item)
        const appCode = item.namespace.split(".")[1];
        return {
            id: item.__id,
            code: item.code
        };
    }));

    const refItemsList = <{id: string, code: string, namespace: string}[]>[].concat.apply([], await Promise.all(subAppsCodes.map(code => {
        const fieldRef = appToSearchFieldReference[code];

        if (!fieldRef) {
            return;
        };

        let body: string | FormData | ArrayBuffer | undefined = undefined;

        if (fieldRef === "__item") {
            body = JSON.stringify({
                active: true,
                filter: {
                    tf: {
                        "__id": Context.data.item_ref!.id
                    }
                }
            })
        } else {
            body = JSON.stringify({
                active: true,
                "filter": {
                    "link": [
                        {"field": fieldRef},
                        {"list": [Context.data.item_ref!.id]}
                    ]
                }
            })
        }

        return fetch(`${baseUrl}/pub/v1/app/${appNs}/${code}/list`, {
            method: "POST",
            body,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res => res.json()).then(resJson => {
            if (resJson.error) {
                console.log(resJson.error);
                return;
            };

            // let itemRef: searchRef = {};
            // itemRef[fieldRef] = {
            //     "id": Context.data.item_ref!.id,
            //     "code": code,
            //     "namespace": appNs
            // };

            // return resJson.result.result.map((item: any) => item.__id);

            return resJson.result.result.map((item: any) => {
                return {
                    "id": item.__id,
                    "code": code,
                    "namespace": appNs
                };
            });
        });
    }))).filter((item: any) => item);

    console.log("refItems: ", refItemsList)

    //@ts-ignore
    // console.log("search tasks by __item: ", await System.processes._searchTasks().where(f => f.__item.in(refItemsList)).size(10000).all())

    const processesList = [].concat.apply([], await Promise.all(templatesJson.map((item: any) => {
        // const fieldRef = appToSearchFieldReference[item.code];

        // if (!fieldRef) {
        //     return;
        // };

        return fetch(`${baseUrl}/pub/v1/bpm/instance/bytemplateid/${item.id}/list`, {
            method: "POST",
            body: JSON.stringify({
                active: true,
                "filter": {
                    "in": [
                        {"field": "__item"},
                        {"list": refItemsList}
                    ]
                }
            }),
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res => res.json()).then(resJson => {
            if (resJson.error) {
                console.log(resJson.error);
                return;
            };
            return [...resJson.result.result]
        });
    }))).filter((item: any) => item);

    console.log("search processes by api: ", processesList)

    const linkedTasks = [].concat.apply([], processesList.map((process: any) => process.__tasks).filter((tasks: any) => {
        return Object.keys(tasks).length > 0
    }).map((tasks: any) => Object.keys(tasks).map(key => tasks[key]))).sort((a: taskData, b: taskData) => {
        const aDateObj = new Datetime(a.__createdAt);
        const bDateObj = new Datetime(b.__createdAt);

        if (aDateObj.before(bDateObj)) {
            return 1;
        };

        if (aDateObj.after(bDateObj)) {
            return -1;
        };

        return 0;
    });

    console.log(linkedTasks)

    serializedTasks = [].concat.apply([], await Promise.all(linkedTasks.map(serializeTask))).filter((task: taskItem) => task);
};

async function serializeTask(taskData: taskData): Promise<taskItem[] | any> {
    const performers = taskData.performers;

    if (!performers || performers.length < 1 || taskData.state === "cancel") {
        console.log("no performers or task cancelled");
        return;
    };

    const taskName = taskData.__name;
    const dueDate = `Сделать до: ${taskData.dueDate ? new Datetime(taskData.dueDate).format("DD.MM.YYYY HH:MM:SS") : "без срока"}`;
    const taskItems = await Promise.all(performers.map(async id => {
        const user = users.find(user => user.id === id);

        if (user) {
            return <taskItem>{
                id: taskData.__id,
                name: taskName,
                user_name: user.data.__name,
                due_date: dueDate,
                task_name: taskName,
                avatar_link: user.data.avatar ? await user.data.avatar.getDownloadUrl() : "",
                user_id: user.id,
                state: taskData.state
            }
        };
    })).then(res => res.filter(task => task));

    return taskItems;
};

function renderTasks(tasks: taskItem[]) {
    const taskNodeTemplate = document.querySelector(".linked-task_item_template");

    for (let task of tasks) {
        const taskElementContent = taskNodeTemplate.content.cloneNode(true);
        const taskImg = taskElementContent.querySelector(".linked-task_item-img");
        const taskNameElement = taskElementContent.querySelector(".linked-task_item-info_task-name");
        const userNameElement = taskElementContent.querySelector(".linked-task_item-user-name");
        const taskDuedateElement = taskElementContent.querySelector(".linked-task_item-info_duedate");
        const taskElement = taskElementContent.querySelector(".linked-task_item");

        task.state === "closed" && taskElement.classList.add("closed");


        taskImg.src = task.avatar_link;
        taskNameElement.textContent = task.task_name;
        userNameElement.textContent = task.user_name;
        taskDuedateElement.textContent = task.due_date;
        taskNameElement.href = `${window.location.href.replace(/\(.*/, "")}(p:task/${task.id})`;
        userNameElement.href = `${window.location.href.replace(/\(.*/, "")}(p:user/${task.user_id})`;
        taskNameElement.target = "_blank";
        userNameElement.target = "_blank";

        tasksContainer.append(taskElementContent)
    };
};