/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface IAppContext {
    __id: string,
    employment_place: string[],
    kedo_staff?: string[],
    staff?: string[],
}

interface IResponse {
    success: boolean,
    error?: string,
    app_context?: IAppContext[],
    total?: number,
}

interface ISolution {
    name: string,
    code: string,
}

interface IApp {
    namespace: string,
    code: string,
    staff_code: string,
    employment_code: string,
}

const CHUNK_SIZE = 100;
const VACATION_SOLUTION = "otpuska";
const BUSINESS_TRIP_SOLUTION = "komandirovki";

const namespaces = {
    "absences": {
        name: "absences",
        apps: [
            {
                code: "vacations",
                staff_code: "kedo_staff",
                employment_code: "employment_place",
            }
        ]
    },
    "kedo": {
        name: "kedo",
        apps: [
            {
                code: "execution_duties",
                staff_code: "staff",
                employment_code: "staff_employment_placement",
            },
        ],
    },
    "time_tracking": {
        name: "time_tracking",
        apps: [
            {
                code: "overtime_work",
                staff_code: "kedo_staff",
                employment_code: "employment_place",
            }
        ]
    },
    "personnel_documents": {
        name: "personnel_documents",
        apps: [
            {
                code: "application_for_leave_without_pay",
                staff_code: "staff",
                employment_code: "employment_placement",
            },
            {
                code: "paid_leave",
                staff_code: "staff",
                employment_code: "employment_place",
            },
            {
                code: 'memo_business_trip',
                staff_code: "staff",
                employment_code: "employment_placement",
            },
            {
                code: "application_for_financial_assistance",
                staff_code: "staff",
                employment_code: "employment_placement",
            },
            {
                code: "benefit_application",
                staff_code: "staff",
                employment_code: "employment_placement",
            },
            {
                code: "application_for_the_transfer_of_salary_to_the_current_account",
                staff_code: "staff",
                employment_code: "employment_placement",
            },
            {
                code: "free_from",
                staff_code: "staff",
                employment_code: "employment_placement",
            },
            {
                code: "certificate",
                staff_code: "staff",
                employment_code: "employment_place",
            }
        ]
    },
    "business_trips": {
        name: "business_trips",
        apps: [
            {
                code: "businesstrip_requests",
                staff_code: "kedo_staff",
                employment_code: "employment_placement",
            }
        ]
    }
}

class ElmaApp {
    private namespace: string;
    private code: string;

    constructor(namespace: string, code: string) {
        this.code = code;
        this.namespace = namespace;
    }

    /** Формирование URL API запроса на получение списка элементов приложения.*/
    private getListURL(): string {
        return `${System.getBaseUrl()}/pub/v1/app/${this.namespace}/${this.code}/list`;
    }

    /** Формирование URL API запроса на обновление элемента приложения.
     * @param id идентификатор приложения
     */
    private getUpdateElementURL(element_id: string): string {
        return `${System.getBaseUrl()}/pub/v1/app/${this.namespace}/${this.code}/${element_id}/update`;
    }

    /** Запрос на обновление контекста приложения.*/
    async updateEmploymentPlacement(element_id: string, context: any): Promise<void> {
        const token = Context.data.token;

        try {
            const request = await fetch(this.getUpdateElementURL(element_id), {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(context)
            });
        } catch (error) {
            throw new Error(error)
        }
    }

    /** Получение списка элементов приложения. */
    async getElements(filter?: any): Promise<IResponse | undefined> {
        const token = Context.data.token;

        try {
            const request = await fetch(this.getListURL(), {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(filter ?? {})
            });

            const response = await request.json();

            if (response && response.success && response.success == true) {
                return <IResponse>{
                    success: response.success,
                    error: response.error,
                    app_context: response.result.result,
                    total: response.result.total,
                };
            } else {
                throw new Error(JSON.stringify(response ?? request));
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    async getTotalElementsCount(filter?: any): Promise<number> {
        const response = await this.getElements(filter);

        if (!response || response.success == false || !response.total) return 0;

        return response.total;
    }

}

/** 
 * Тело для запроса получения списка элементов приложения.
 * Идет фильтрация по незаполненности поля "Заявка по месту занятости"
 * Используется пагинация.
 */
const filter = (from: number, size: number, employment_field_name: string) => {
    return {
        "active": true,
        "from" : from,
        "size" : size,
        "filter": {
            "or": [
                {
                    "eq": [
                        {
                            "field": employment_field_name
                        },
                        null
                    ]
                },
                {
                    "link": [
                        {
                            "field": employment_field_name
                        },
                        {
                            "list": []
                        }
                    ]
                }
            ]
        }
    }
}

/** Получение токена из настроек КЭДО. */
async function getApiToken(): Promise<void> {
    const api_key = await Namespace.app.settings.search()
        .where(f => f.code.eq("api_key"))
        .first();

    if (!api_key || !api_key.data.value) {
        Context.data.error = `Не найден параметр api_key или параметр не заполнен.`;
        throw new Error(Context.data.error);
    }

    Context.data.token = api_key.data.value;
}

/** Получить список активных решений. */
async function getSolutions(): Promise<ISolution[]> {
    let solutions: ISolution[] = [];

    /** Выполняем запрос на получение списка всех решений. */
    try {
        const request = await fetch(`${System.getBaseUrl()}/pub/v1/scheme/solutions`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Context.data.token}`
            }
        });

        if (!request.ok) {
            throw new Error(JSON.stringify(request));
        }

        const response = await request.json();
        solutions = response.result.result as ISolution[];
    } catch (error) {
        Context.data.error = JSON.stringify(error);
        throw new Error(error);
    } finally {
        return solutions;
    }
}

/** Сформировать список приложений. */
async function getKedoApps(): Promise<void> {
    const solutions = await getSolutions();

    if (!solutions || solutions.length == 0) {
        Context.data.error = `Не удалось получить список решений`;
        throw new Error(Context.data.error);
    }

    const apps: IApp[] = [];

    const kedo_apps = namespaces.kedo.apps;

    apps.push(...kedo_apps.map(f => {
        return <IApp>{
            namespace: namespaces.kedo.name,
            code: f.code,
            staff_code: f.staff_code,
            employment_code : f.employment_code,
        }
    }));

    const personnel_documents_apps = namespaces.personnel_documents.apps;

    apps.push(...personnel_documents_apps.map(f => {
        return <IApp>{
            namespace: namespaces.personnel_documents.name,
            code: f.code,
            staff_code: f.staff_code,
            employment_code : f.employment_code,
        }
    }));

    if (solutions.find(f => f.code == BUSINESS_TRIP_SOLUTION)) {
        Context.data.business_trip_enabled = true;

        const business_trip_apps = namespaces.business_trips.apps;

        apps.push(...business_trip_apps.map(f => {
            return <IApp>{
                namespace: namespaces.business_trips.name,
                code: f.code,
                staff_code: f.staff_code,
                employment_code : f.employment_code,
            }
        }));
    }

    if (solutions.find(f => f.code == VACATION_SOLUTION)) {
        Context.data.absences_enabled = true;

        const absences_apps = namespaces.absences.apps;

        apps.push(...absences_apps.map(f => {
            return <IApp>{
                namespace: namespaces.absences.name,
                code: f.code,
                staff_code: f.staff_code,
                employment_code : f.employment_code,
            }
        }));

        const time_tracking = namespaces.time_tracking.apps;

        apps.push(...time_tracking.map(f => {
            return <IApp>{
                namespace: namespaces.time_tracking.name,
                code: f.code,
                staff_code: f.staff_code,
                employment_code : f.employment_code,
            }
        }));
    }

    Context.data.app_list = JSON.stringify(apps);
}

async function checkAppList(): Promise<boolean> {
    const app_list: IApp[] = Context.data.app_list ? JSON.parse(Context.data.app_list) : [];

    if (app_list.length == 0) {
        return false;
    }

    return true;
}

async function getApp(): Promise<void> {
    const app_list: IApp[] = Context.data.app_list ? JSON.parse(Context.data.app_list) : [];

    if (app_list.length == 0) {
        throw new Error("app_list is empty");
    }

    Context.data.app_data = JSON.stringify(app_list.pop());
    Context.data.app_list = JSON.stringify(app_list);
}

async function update_employments(): Promise<void> {
    // Выполняем первый запрос для получения
    // количества элементов приложения, которые подходят под заданные фильтром условия.
    // Из этого запроса на интересует только поле total.
    const app_data: IApp = Context.data.app_data ? JSON.parse(Context.data.app_data) : undefined;

    if (!app_data) {
        throw new Error("app_data is undefined");
    }

    const app = new ElmaApp(app_data.namespace, app_data.code);
    const total_count = await app.getTotalElementsCount(filter(0, 1, app_data.employment_code));

    // Получаем все записи из справочника по местам занятости.
    const employment_directory = await Namespace.app.employment_directory.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__status.eq(Namespace.app.employment_directory.fields.__status.variants.actual)
        ))
        .size(10000)
        .all();

    // Пакетно выполняем запросы на получение и обновление элементов приложения.
    for (let i = 0; i < total_count; i += CHUNK_SIZE) {
        const elements = await app.getElements(filter(i, i + CHUNK_SIZE, app_data.employment_code));

        if (!elements || !elements.app_context) return;

        let promises: Promise<void>[] = [];

        for (let el of elements.app_context) {
            //  Используя staff_code вытягиваем из полученного приложения поле с сотрудником
            if (!(el as any)[app_data.staff_code] || !(el as any)[app_data.staff_code][0]) {
                continue;
            }

            const staff_id: string = (el as any)[app_data.staff_code][0];

            // Получение записи из справочника занятости
            const staff_employment = employment_directory.filter(f => f.data.staff?.id == staff_id);

            if (!staff_employment || staff_employment.length == 0) {
                continue;
            }

            const employment = staff_employment.find(f => f.data.type_employment?.code == "main_workplace") ?? staff_employment[0];

            // Тело для запроса изменения контекста элемента приложения.
            // В некоторых приложениях используются разные коды полей, поэтому учитываем два варианта наименования.
            const element_context = {
                context: {}
            };

            (element_context.context as any)[`${app_data.employment_code}`] = [employment.id];


            promises.push(app.updateEmploymentPlacement(el.__id, element_context));

            if (promises.length > 10) {
                await Promise.all(promises).then(() => {
                    Context.data.element_count = (Context.data.element_count ?? 0) + promises.length;
                });
                promises = [];
            }
        }

        await Promise.all(promises).then(() => {
            Context.data.element_count = (Context.data.element_count ?? 0) + promises.length;
        });;
    }
}
