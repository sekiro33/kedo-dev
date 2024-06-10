interface IElmaApp {
    name: string,
    code: string,
    namespace: string,
    statuses?: IAppStatus[],
}

interface IAppStatus {
    id: number,
    name: string,
    code: string,
    groupId: string,
}

interface IElement {
    __id: string,
    namespace: string,
    code: string,
    __status: {
        order: number,
        status: number,
    },
    status_code?: string,
}

const namespaceCode = [
    "kedo",
    "kedo_ext",
    "personnel_documents",
    "absences",
    "time_tracking",
    "absences_ext",
    "business_trips",
    "business_trips_ext"
];

const filterElements = (from: number, size: number) => {
    return {
        "active": true,
        "filter": {
            "eq": [
                {
                    "field": "kedo_status"
                },
                null
            ]
        },
        "from": from,
        "size": size
    }
}

const filterStatuses = (from: number, size: number) => {
    return {
        "active": true,
        "from": from,
        "size": size,
    }
}

async function getToken(): Promise<void> {
    const token = await Context.fields.settings_app.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq("api_key")
        ))
        .first();

    if (!token || !token.data.value) {
        throw new Error("Отсутствует токен");
    }

    const domen = System.getBaseUrl();
    Context.data.domen = domen;
    Context.data.api_key = token.data.value;
}

async function getAppElements(namespace: string, code: string, from: number, size: number): Promise<IElement[]> {
    const request = await fetch(`${Context.data.domen}/pub/v1/app/${namespace}/${code}/list`, {
        method: "POST",
        body: JSON.stringify(filterElements(from, size)),
        headers: {
            Authorization: `Bearer ${Context.data.api_key}`
        }
    });
    //Если поймали ошибку "too many request", то по эскалации уходим в ожидание таймера
    if (request.status == 429) {
        throw new Error('Нет доступных запросов')
    }
    if (!request.ok) {
        return [];
    }

    const data = await request.json();
    return data.result.result;
}

async function getTotalElementsCount(namespace: string, code: string): Promise<number> {
    const request = await fetch(`${Context.data.domen}/pub/v1/app/${namespace}/${code}/list`, {
        method: "POST",
        body: JSON.stringify(filterElements(0, 1)),
        headers: {
            Authorization: `Bearer ${Context.data.api_key}`
        }
    });
    //Если поймали ошибку "too many request", то по эскалации уходим в ожидание таймера
    if (request.status == 429) {
        throw new Error('Нет доступных запросов')
    }
    if (!request.ok) {
        return 0;
    }

    const data = await request.json();
    return data.result.total;
}

async function receivingStatuses(): Promise<void> {
    const CHUNK_SIZE = 20;
    let elma_apps: IElmaApp[] = JSON.parse(Context.data.apps_json!);  
    
    for (let i = Context.data.iteration!; i < elma_apps.length; i += CHUNK_SIZE) {
        
        const chunk = elma_apps.slice(i, i + CHUNK_SIZE);

        await Promise.all(
            chunk.map(async (app: IElmaApp) => {
                const res = await fetch(`${System.getBaseUrl()}/pub/v1/app/${app.namespace}/${app.code}/settings/status`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${Context.data.api_key}`
                    }
                })
                //Если поймали ошибку "too many request", то по эскалации уходим в ожидание таймера
                if (res.status == 429) {
                    throw new Error('Нет доступных запросов')
                }
                if (res.ok) {
                    const data = await res.json();
                    app.statuses = data.statusItems;
                    Context.data.iteration! += CHUNK_SIZE;
                    Context.data.apps_json = JSON.stringify(elma_apps);
                }
            })
        );
    }
    Context.data.iteration = 0;

}

async function updateApp(namespace: string, code: string, id: string, kedo_status_id: string): Promise<void> {
    const res = await fetch(`${Context.data.domen}/pub/v1/app/${namespace}/${code}/${id}/update`, {
        method: "POST",
        body: JSON.stringify({
            "context": {
                "kedo_status": [kedo_status_id]
            }
        }),
        headers: {
            Authorization: `Bearer ${Context.data.api_key}`
        }
    })
    //Если поймали ошибку "too many request", то по эскалации уходим в ожидание таймера
    if (res.status == 429) {
        throw new Error('Нет доступных запросов')
    }
}
async function mirgationStatuses(): Promise<void> {
    const CHUNK_SIZE = 20;
    let elements: IElement[] = JSON.parse(Context.data.elements_json!);

    const statuses = await Namespace.app.statuses.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .size(1000)
        .all();


    for (let i = Context.data.iteration!; i < elements.length; i += CHUNK_SIZE) {
        const chunk = elements.slice(i, i + CHUNK_SIZE);

        await Promise.all(chunk.map(app => {
            let kedo_status = statuses.find(f => f.data.code == app.status_code);

            if (kedo_status && app.code == "trip_requests" && app.status_code == "signed") {
                kedo_status = statuses.find(f => f.data.code == "agreed_signed");
            }
            
            if (!kedo_status) {
                //на подписании заявления
                if (app.status_code == "application_prepare" || app.status_code == "signing_sz" ||
                    app.status_code == "signing_consent" || app.status_code == "signing_consent" ||
                    app.status_code == "in_preparation") {
                    kedo_status = statuses.find(f => f.data.code == "signing_application");
                }

                //на согласовании
                if (app.status_code == "agrement" || app.status_code == "approving" ||
                    app.status_code == "under_consideration" || app.status_code == "not_agreed" ||
                    app.status_code == "on_approval") {
                    kedo_status = statuses.find(f => f.data.code == "approval");
                }

                //на корректировке
                if (app.status_code == "correct" || app.status_code == "application_correction" ||
                    app.status_code == "order_correction" || app.status_code == "editing") {
                    kedo_status = statuses.find(f => f.data.code == "correction");
                }

                //на подписании
                if (app.status_code == "staff_signing" || app.status_code == "sign_in_process" ||
                    app.status_code == "sign_by_hr" || app.status_code == "sign_by_employer" ||
                    app.status_code == "sign_by_employee") {
                    kedo_status = statuses.find(f => f.data.code == "signing");
                }

                //Согласовано/подписано
                if (app.status_code == "agreed" || app.status_code == "") {
                    kedo_status = statuses.find(f => f.data.code == "agreed_signed");
                }

                //Подготовка приказа
                if (app.status_code == "documents_preparation" || app.status_code == "") {
                    kedo_status = statuses.find(f => f.data.code == "order_prepare");
                }

                //оформлено
                if (app.status_code == "ok" || app.status_code == "assigned" || app.status_code == "done" ||
                    app.status_code == "giving") {
                    kedo_status = statuses.find(f => f.data.code == "issued");
                }

                //отменено
                if (app.status_code == "cancel" || app.status_code == "removed" || app.status_code == "rejected" ||
                    app.status_code == "refusal" || app.status_code == "denied") {
                    kedo_status = statuses.find(f => f.data.code == "cancelled");
                }

                //Оформление на бумаге
                if (app.status_code == "design_in_paper") {
                    kedo_status = statuses.find(f => f.data.code == "paper_prepare");
                }

                //Подписано на бумаге
                if (app.status_code == "signed_in_paper") {
                    kedo_status = statuses.find(f => f.data.code == "paper_signed");
                }

                //Отзыв заявления
                if (app.status_code == "recall") {
                    kedo_status = statuses.find(f => f.data.code == "withdrawal");
                }

                //В процессе
                if (app.status_code == "ongoing") {
                    kedo_status = statuses.find(f => f.data.code == "in_progress");
                }

                //Завершена
                if (app.status_code == "end" || app.status_code == "finished") {
                    kedo_status = statuses.find(f => f.data.code == "completed");
                }

                //Ожидание начала
                if (app.status_code == "waiting_to_pass") {
                    kedo_status = statuses.find(f => f.data.code == "waiting_start");
                }

                //В процессе оформления
                if (app.status_code == "transfer") {
                    kedo_status = statuses.find(f => f.data.code == "pending");
                }

                //Подписание документа сотрудником
                if (app.status_code == "signing_employee" || app.status_code == "familiarization") {
                    kedo_status = statuses.find(f => f.data.code == "staff_doc_signing");
                }

                //Подписание документа работодателем
                if (app.status_code == "signing_chief") {
                    kedo_status = statuses.find(f => f.data.code == "chief_doc_signing");
                }

                //На ознакомлении
                if (app.status_code == "acquaintance") {
                    kedo_status = statuses.find(f => f.data.code == "at_look");
                }

                //Ознакомлен
                if (app.status_code == "introduction") {
                    kedo_status = statuses.find(f => f.data.code == "acquainted");
                }
            }
            if (!kedo_status) {
                return;
            }

            return updateApp(app.namespace, app.code, app.__id, kedo_status.id);
        }))
        Context.data.iteration! += CHUNK_SIZE;
    }
}

async function receivingApps(): Promise<void> {
    let elma_apps: IElmaApp[] = [];
    
    await Promise.all(
        namespaceCode.map(async (namespace) => {
            const res = await fetch(`${System.getBaseUrl()}/pub/v1/scheme/namespaces/${namespace}/apps`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${Context.data.api_key}`
                }
            })
            if (res.ok) {
                const data = await res.json();
                data.result.result.map((app: IElmaApp) => elma_apps.push(app))
                Context.data.apps_json = JSON.stringify(elma_apps);
            }
        })
    );

}

async function searchElements(): Promise<void> {
    const CHUNK_SIZE = 20;
    let elements: IElement[] = [];
    if (Context.data.elements_json && Context.data.elements_json.length > 0) {
        elements = JSON.parse(Context.data.elements_json)
    }
    const elma_apps: IElmaApp[] = JSON.parse(Context.data.apps_json!);

    for (let index = Context.data.iteration!; index < elma_apps.length; index++) {
        const app = elma_apps[index];
        if (!app.statuses || app.statuses.length == 0) continue;

        const total_elements_count = await getTotalElementsCount(app.namespace, app.code);
        if (total_elements_count <= 0) {
            continue;
        }

        let promises: Promise<void>[] = [];
        for (let i = 0; i < total_elements_count; i += CHUNK_SIZE) {
            promises.push(
                getAppElements(app.namespace, app.code, i, i + CHUNK_SIZE)
                    .then(data => {
                        const statuses = app.statuses!;

                        const updated_elements = data.map((elem: IElement) => {
                            const status = statuses.find(s => s.id == elem.__status?.status);

                            elem.code = app.code;
                            elem.namespace = app.namespace;

                            if (!status) {
                                return elem;
                            }
                            elem.status_code = status.code;
                            return elem;
                        })

                        elements.push(...updated_elements);
                    })
            )
            if (promises.length > 5) {
                await Promise.all(promises);
            }
        }
        await Promise.all(promises);
        Context.data.elements_json = JSON.stringify(elements);
        Context.data.iteration! += 1;
    }

    Context.data.iteration = 0;
}