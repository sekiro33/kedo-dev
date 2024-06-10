
declare const window: any;
declare const document: any;
declare const console: any;
declare const DOMParser: any;

type objData = {
    id: string,
    code: string,
    ns: string,
    name: string,
    status: string,
    status_code: string,
    business_type: string,
    render_zone: string,
    created_at: TDatetime,
    item_type: string,
    link: string,
    start_date?: string,
    end_date?: string,
    start_date_obj: TDate | TDatetime,
    end_date_obj: TDate | TDatetime,
    vacation_type?: string,
    vacation_code?: string,
    duration?: number,
    staffId: string,
    work_type?: string
};
type blockConstructor = {
    titleClass: string,
    titleContent: string,
    iconClass?: string,
    iconContent?: string,
    extraContentClass?: string,
    extraContent?: string,
    status?: string,
    link?: string
};

type staff = ApplicationItem<Application$kedo$staff$Data, any>;
type status = ApplicationItem<Application$kedo$statuses$Data, any>;

enum LoaderType {
    COMMON = "common",
    MAIN = "main",
    TASKS = "tasks",
    DOCUMENTS = "documents",
    SERVICES = "services",
    SERVICE_DESK = "service_desk",
    BUSINESS_TRIPS = "business_trips",
    VACATIONS = "vacations",
    PROFILE = "profile",
    DOCUMENTS_WIDGET = "personnel_documents_widget",
    ISSUES_WIDGET = "issues_widget",
    VACATION_WIDGET = "vacation_widget",
};
enum DocType {
    PERSONAL = "personal_data",
    ISSUE = "issue",
    VACATION = "vacation",
    BUSINESS_TRIP = "business_trip"
};
enum chunkType {
    PERSONAL = "personnelDocumentsChunks",
    LNA_DOCS = "lnaDocumentsChunks",
    PERSONAL_DOCS = "personalDocsChunks",
    BUSINESS_TRIPS = "businessTripsChunks",
    VACATIONS = "vacationsChunks",
    OUTGOING_TASKS = "outgoingTasksChunks",
    ACTUAL_TASKS = "actualTasksChunks",
    SUB_TASKS = "subordinateTasksChunks",
    ALL = "allTasksChunks",
    DOCS_TASKS = "docsTasksChunks",
    IN_PROGRESS = "inProgressTasksChunks",
    LNA = "lnaTasksChunks",
    NULL = "undefined"
};
const monthReference = {
    "1": "Января",
    "2": "Февраля",
    "3": "Марта",
    "4": "Апреля",
    "5": "Мая",
    "6": "Июня",
    "7": "Июля",
    "8": "Августа",
    "9": "Сентября",
    "10": "Октября",
    "11": "Ноября",
    "12": "Декабря"
};
const issueCodeToNameReference = {
    application_for_financial_assistance: "Заявка на материальную помощь",
    benefit_application: "Заявка на выплату пособия",
    certificate: "Справка",
    category_assignment: "Заявка на присвоениее категории",
    employees_personal_data: "Заявка на изменение ПДн",
    free_from: "Заявка в свободной форме",
    business_trips: "Командировка",
    businesstrip_requests: "Командировка",
    holidays: "Отпуск",
    vacations: "Отпуск",
    dismissal_app: "Увольнение",
    execution_duties: "Заявка на ИО",
    transfer_application: "Заявка на перевод",
    employment_app: "Трудоустройство",
    medical_request: "Медосмотр",
    cancel_applications: "Отмена документа"
};
const issuesWidgetCodes = [
    "employees_personal_data",
    "category_assignment",
    "application_for_financial_assistance",
    "benefit_application",
    "free_from",
    "certificate",
    "medical_request",
    "order_financial_assistance",
    "employment_app",
    "execution_duties",
    "application_for_the_transfer_of_salary_to_the_current_account"
];
const today = new TDate();
const current_url = window.location.href;
let personnel_event_manager: PersonnelEventManager;
let userDataManager: UserDataManager;
let serializer: Serializer;
let systemDataManager: SystemDataManager;

class PersonnelEventManager {
    constructor() {
        this.documentTemplate = undefined;
        this.parser = new DOMParser();
    };

    parser: typeof DOMParser;
    documentTemplate: any | undefined;

    async renderWidget(refresh = false) {

        // Получение контейнера и шаблона событий
        const documentsContainer = document.querySelector('.main-page_personnel-events-widget').querySelector(".main-page_personnel-events-widget_container");
        this.documentTemplate = document.querySelector(".personnel-events-widget_item-template");

        refresh && refreshContainers([documentsContainer], "personnel-events-widget_item");

        // Получение контейнера с текстом про отсутсвия событий
        const emptyPersonnelDocumentsTemplate = document.querySelector(".main-page_personnel-events-widget_container_empty");
        // Получение актуальный событий
        const actualPersonnelDocuments = userDataManager.personnelDocuments.filter(item => item.start_date_obj && item.start_date_obj.after(today.asDatetime(new TTime())))

        // Если событий нет, то отображаем контейнер с текстом, если есть, то прячем
        if (!userDataManager.personnelDocuments || actualPersonnelDocuments.length < 1 || userDataManager.lastDocsForRender.length === 0) {
            emptyPersonnelDocumentsTemplate.classList.remove("hidden");
        }
        else if (!emptyPersonnelDocumentsTemplate.classList.contains("hidden")) {
            emptyPersonnelDocumentsTemplate.classList.add("hidden");
        };

        // Создание карточек событий
        userDataManager.lastDocsForRender.forEach(item => {
            const [startDay, startMonth] = item.start_date ? item.start_date.split(".") : ["", "", ""];
            const [endDay, endMonth] = item.end_date ? item.end_date.split(".") : ["", "", ""];
            const elementData: blockConstructor = {
                titleClass: "item-header",
                titleContent: item.code === "businesstrip_requests" || item.code === "vacations"
                    ? `${startDay} ${(<any>monthReference)[startMonth.replace("0", "")].toLowerCase()} - ${endDay} ${(<any>monthReference)[endMonth.replace("0", "")].toLowerCase()}`
                    : item.code === "overtime_work" || item.code === "dismissal_app" ? `${item.start_date_obj.day} ${(<any>monthReference)[item.start_date_obj.month.toString()].toLowerCase()}`
                        : `${item.created_at.day} ${(<any>monthReference)[item.created_at.month.toString()].toLowerCase()}`,
                iconClass: "item-icon-container",
                iconContent: (<any>svgToTypeReference)[item.item_type],
                extraContentClass: "item-shortand",
                extraContent: item.code === "overtime_work" ? item.work_type : item.vacation_type || (<any>issueCodeToNameReference)[item.code],
                status: item.status,
                link: item.link
            };

            const newIssueContent = this.documentTemplate.content.cloneNode(true);
            const newIssueElement = newIssueContent.querySelector(".personnel-events-widget_item");

            this.renderComponent(documentsContainer, newIssueElement, false, elementData);
        });

        // Скрываем лоадер, если это первая загрузка
        !refresh && this.handleLoader(LoaderType.DOCUMENTS_WIDGET);

        // Показываем новые карточки
        const all_new_bloks_hidden = documentsContainer.querySelectorAll('.personnel-events-widget_item.hidden');
        all_new_bloks_hidden.forEach((block: any) => block.classList.remove('hidden'));
    };

    /** Включает/выключает анимацию загрузки страницы
   * @param loader тип загрузчика, выборка по атрибуту data-loader
   */
    handleLoader(loaderType: LoaderType) {
        const loader = document.querySelector(`.kedo-loader-wrapper[data-loader=${loaderType}]`);
        if (loader) {
            loader.classList.toggle("hidden");
        }
        else {
            const waitForLoader = window.setInterval(() => {
                const loader = document.querySelector(`.kedo-loader-wrapper[data-loader=${loaderType}]`);
                if (!loader) {
                    return;
                };
                window.clearInterval(waitForLoader)
                loader.classList.toggle("hidden");

            }, 100);
        }

    };

    /** Метод для рендера элемента в определенной области DOM
     * @param domElement контейнер, в который нужно вставить элемент
     * @param elementToAppend элемент для вставки (может быть массивом с DOM-элементами)
     * @param prepend признак, что вставка элементов должна происходить перед всеми остальными в контейнере
     * @param elementData объект, который используется для отрисовки данных в методе this.processComponent
     * @param setActive признак, что элементу нужно присвоить класс .active
     * @param onclick функция без параметров, которую можно навесить на событиее click для вставляемого элемента
     */
    renderComponent(domElement: any, elementToAppend: any, prepend = false, elementData?: blockConstructor, setActive = false, onclick?: Function) {

        if (elementData) {
            this.processComponent(elementToAppend, elementData, setActive);
        };
        if (onclick) {
            elementToAppend.addEventListener("click", onclick);
        };
        if (prepend) {
            if (Array.isArray(elementToAppend)) {
                domElement.prepend(...elementToAppend);
                return;
            };
            domElement.prepend(elementToAppend);
        } else {
            if (Array.isArray(elementToAppend)) {
                domElement.append(...elementToAppend);
                return;
            };
            domElement.appendChild(elementToAppend);
        };
    };
    /** Метод для изменения элемента (используется как конструктор для блоков класса .widget-item)
     * @param element DOM-элемент
     * @param elementData объект с данными для вставки в элемент
     * @param setActive признак, что элементу нужно присвоить класс .active
     */
    processComponent(element: any, elementData: blockConstructor, setActive = false) {

        const title = element.querySelector(`.${elementData.titleClass}`);

        title.textContent = elementData.titleContent;
        if (elementData.iconClass) {

            const iconContainer = element.querySelector(`.${elementData.iconClass}`)
            const svg = this.parser.parseFromString(elementData.iconContent, "text/html").body.firstChild;

            iconContainer.append(svg);
        };
        if (elementData.extraContentClass) {

            const extraContentContainer = element.querySelector(`.${elementData.extraContentClass}`);
            extraContentContainer.textContent = elementData.extraContent;
        };
        if (elementData.status) {

            const statusContainer = element.querySelector(".status-name");
            statusContainer.textContent = elementData.status;
        };
        if (setActive) {
            this.setActive(element);
        };
        if (elementData.link) {
            element.href = elementData.link;
        };
    };

    /** Добавляет класс active к элементу
     * @param element DOM-элемент
     */
    setActive(element: any) {
        element.classList.add("active");
    };
}

/**
 * Класс, хранящий в себе все данные, относящиеся к текущему пользователю/сотруднику
 * @property user объект типа UserItem, текущий пользователь
 * @property staff объект типа staff (приложение Сотрудники), текущий сотрудник
 * @property personnelDocuments личные документы в формате objData
 * @property lastDocsForRender последние документы для отрисовки на портале, в формате objData
 * @property isInnerUser признак того, что пользователь является внутренним
 */
class UserDataManager {
    constructor() {
        this.personnelDocuments = [];
        this.lastDocsForRender = [];
    };

    user: CurrentUserItem;
    staff: staff;
    personnelDocuments: objData[];
    lastDocsForRender: objData[];
    isInnerUser: boolean;
};

/**
 * Класс, методы которого используются для сериализации данных
 * @property userDataManager экземпляр класса UserDataManager
 * @property systemDataManager экземпляр класса SystemDataManager
 */
class Serializer {

    userDataManager: UserDataManager;
    systemDataManager: SystemDataManager;

    setManagers(dataManager: UserDataManager, systemDataManager: SystemDataManager) {
        this.userDataManager = dataManager;
        this.systemDataManager = systemDataManager;
    };

    /** Преобразует объект к типу objData
     * @param item объект приложения, унаследованный от BaseItem
     */
    serializeObjData(item: any): objData {

        const linkCode = item.code === "holidays" ? "vacations" : item.code === "business_trips" ? "businesstrip_requests" : item.code;
        const linkNs = item.code === "holidays" ? "absences" : item.code === "business_trips" ? "business_trips" : item.namespace;
        const itemStatus = item.data.kedo_status ? this.systemDataManager.statuses.find(s => s.id === item.data.kedo_status.id) : undefined;
        const dateArray = item.code === "overtime_work" ? item.data.start_date ? new Datetime(item.data.start_date).format("DD.MM.YYYY").split(".").map(Number) : item.data.date ? new Datetime(item.data.date).format("DD.MM.YYYY").split(".").map(Number) : undefined : undefined;

        return <objData>{
            id: item.id,
            name: item.data.__name,
            code: item.code === "business_trips" ? "businesstrip_requests" : item.code === "holidays" ? "vacations" : item.code,
            ns: item.code === "business_trips" ? item.code : item.code === "holidays" ? "absences" : item.namespace,
            status: itemStatus ? itemStatus.data.name : item.data.__status && item.data.__status.status ? item.data.__status.status.name : "Не определён",
            status_code: itemStatus ? itemStatus.data.code : item.data.__status && item.data.__status.status ? item.data.__status.status.code : "not implemented",
            business_type: issuesWidgetCodes.indexOf(item.code) === -1 ? "personnel_document" : "issue",
            item_type: item.code === "business_trips" ? DocType.BUSINESS_TRIP : item.code === "holidays" ? DocType.VACATION : issuesWidgetCodes.indexOf(item.code) === -1 ? DocType.PERSONAL : DocType.ISSUE,
            render_zone: issuesWidgetCodes.indexOf(item.code) === -1 ? "main-page_personnel-events-widget_container" : "main-page_issues-widget_container",
            created_at: item.code === "overtime_work" ? new Datetime(item.data.__createdAt) : item.data.__createdAt,
            link: `${window.location.href}(p:item/${linkNs}/${linkCode}/${item.id})`,
            start_date: item.code === "business_trips" ? item.data.start_date_string : item.code === "holidays" ? item.data.start_string || item.data.rest_day_first && item.data.rest_day_first.format("DD.MM.YYYY") : item.code === "overtime_work" && item.data.start_date_string ? item.data.start_date_string.split(",").length > 1 ? item.data.start_date_string.split(",")[0] : item.data.start_date_string : item.data.date_start ? item.data.date_start.format("DD.MM.YYYY") : item.data.__createdAt.format ? item.data.__createdAt.format("DD.MM.YYYY") : undefined,
            end_date: item.code === "business_trips" ? item.data.end_date_string : item.code === "holidays" ? item.data.end_string || item.data.rest_day_second && item.data.rest_day_second.format("DD.MM.YYYY") || item.data.rest_day_first && item.data.rest_day_first.format("DD.MM.YYYY") : item.data.date_end ? item.data.date_end.format("DD.MM.YYYY") : item.data.date_start ? item.data.date_start.format("DD.MM.YYYY") : item.data.__createdAt.format ? item.data.__createdAt.format("DD.MM.YYYY") : undefined,
            start_date_obj: item.code === "business_trips" ? item.data.start_date : item.code === "holidays" ? item.data.start ?? item.data.rest_day_first : item.code === "overtime_work" && dateArray ? new TDate(dateArray[2], dateArray[1], dateArray[0]) : item.code === "dismissal_app" ? item.data.date_of_dismissal : item.data.date_start ?? item.data.__createdAt,
            end_date_obj: item.code === "business_trips" ? item.data.end_date : item.code === "holidays" ? item.data.end ?? item.data.rest_day_second ?? item.data.rest_day_first : item.data.date_end ?? item.data.date_end ?? item.data.__createdAt,
            vacation_type: item.code === "holidays" && item.data.type_of ? item.data.type_of.name : undefined,
            vacation_code: item.code === "holidays" && item.data.type_of ? item.data.type_of.code : undefined,
            duration: item.code === "holidays" ? item.data.amount_of_days : item.code === "business_trips" ? item.data.duration : undefined,
            staffId: item.data.kedo_staff ? item.data.kedo_staff.id : undefined,
            work_type: item.data.work_type || ""
        };
    };
};

/** Класс, хранящий в себе глобальные объекты, прямо или косвенно связанные с пользователем/сотрудником, необходимые для отрисовки компонентов */
class SystemDataManager {
    statuses: status[];
};

async function onLoad(): Promise<void> {

    // Создание экземпляров классов
    userDataManager = new UserDataManager();
    personnel_event_manager = new PersonnelEventManager();
    systemDataManager = new SystemDataManager();
    serializer = new Serializer();

    const [currentUser, allStaff, keyOption] = await Promise.all([
        System.users.getCurrentUser(),
        Context.fields.staff_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all(),
        Context.fields.settings_app.app.search().where(f => f.code.eq("api_key")).first(),
        getAllData()
    ]);

    if (keyOption) {
        console.log("PersonnelEventWidget: token found");
        Context.data.token = keyOption.data.value;
    };

    const currentStaff = allStaff.find(staff => staff.data.ext_user && staff.data.ext_user.id === currentUser.id);
    // if (!currentStaff) {
    //     const waitForContainer = window.setInterval(() => {

    //         const unemployedContainer = document.querySelector("#empty-staff");

    //         if (!unemployedContainer) {
    //             console.log("PersonnelEventWidget: no unemployed container")
    //             return;
    //         };

    //         window.clearInterval(waitForContainer);
    //         unemployedContainer.classList.remove("hidden");
    //     }, 100);
    //     return;
    // };
    userDataManager.staff = currentStaff!;
    Context.data.staff_app = currentStaff;
    userDataManager.user = <CurrentUserItem>currentUser;
    userDataManager.isInnerUser = currentStaff && !currentStaff.data.staff_access || false;

    // Запуск отображение данных
    getOrRefreshData();

    // Если был таймер, очищаем его
    if (document.personnelEventInterval) {
        console.log("PersonnelEventWidget: interval clear");
        window.clearInterval(document.personnelEventInterval);
    }
    // Создаем таймер
    document.personnelEventInterval = window.setInterval(() => {
        // Если ссылка отличается, то очищаем таймер
        if (window.location.href.indexOf(current_url) === -1) {
            console.log("PersonnelEventWidget: refresh, interval clear");
            window.clearInterval(document.personnelEventInterval);
            return;
        }
        getOrRefreshData(true).then(_ => {
            console.log("PersonnelEventWidget: refresh");
        });
    }, 60000);
}

/** Функция используется для получения константных данных, после чего вызывается getOrRefreshData для получения данных, которые динамически меняются */
async function getAllData(): Promise<void> {

    const [allStatuses] = await Promise.all([
        Context.fields.statuses_app.app.search().where(f => f.__deletedAt.eq(null)).size(100).all()
    ]);

    systemDataManager.statuses = allStatuses;
    serializer.setManagers(userDataManager, systemDataManager);
};

/** Функция для сброса компонентов внутри контейнеров при обновлении данных страницы
 * @param containers массив с DOM-элементами
 * @param classToDelete при указании класса - удаляет элементы с подходящим классом внутри контейнера
 */
function refreshContainers(containers: any[], classToDelete?: string): void {
    if (classToDelete) {
        Array.from(containers).forEach((container: any) => {
            const nodesToDelete = container.querySelectorAll(`.${classToDelete}`);
            nodesToDelete.forEach((node: any) => {
                node.remove();
            });
        });

        return;
    };

    containers.forEach((container: any) => {
        container.innerHTML = "";
    });
};

/**
 * Функция используется для получения всех динамических данных, связанных с пользователем (документы, задачи)
 * @param refresh признак того, что идет обновление данных
 */
async function getOrRefreshData(refresh = false): Promise<void> {

    // Фильтр для поиска элементов
    const defaultFilter: FilterClosure<ItemData> = (f, g) => {
        return g.and(
            //@ts-ignore
            f.__deletedAt.eq(null),
            //@ts-ignore
            f.staff.link(userDataManager.staff)
        );
    };

    // Получение всех событий
    const [allMedicalRequests, allTransferApplications, allExecutionDuties, allDismissalApp, allEmployments, allVacationsObj, allBusinessTripsObj] = await Promise.all([
        Context.fields.medical_request_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
        Context.fields.transfer_application_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
        Context.fields.execution_duties_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
        Context.fields.dismissal_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
        Context.fields.employment_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
        Context.fields.vacations_app.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.kedo_staff.link(userDataManager.staff)
        )).size(1000).all().then(res => res.map(item => serializer.serializeObjData(item))),
        Context.fields.business_trips_app.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.kedo_staff.link(userDataManager.staff)
        )).size(1000).all(),
        Server.rpc.getOvertimeWork()
    ]);

    // Сортировка отпусков
    const allVacations = allVacationsObj.sort((a, b) => {
        if (!a.start_date_obj || !b.start_date_obj) {
            return 0;
        };
        //@ts-ignore
        if (a.start_date_obj.before(b.start_date_obj)) {
            return -1;
        }
        //@ts-ignore
        if (a.start_date_obj.after(b.start_date_obj)) {
            return 1;
        };
        return 0;
    });

    // Сортировка командировок
    const allBusinessTrips = allBusinessTripsObj.map(item => serializer.serializeObjData(item)).sort((a, b) => {
        //@ts-ignore
        if (a.start_date_obj.before(b.start_date_obj)) {
            return -1;
        };
        //@ts-ignore
        if (a.start_date_obj.after(b.start_date_obj)) {
            return 1;
        };
        return 0;
    });

    // Получение работ в выходные дни
    let allOvertimeWork: any[] = [];

    if (Context.data.overtime_work_json) {
        allOvertimeWork = JSON.parse(Context.data.overtime_work_json).map((item: any) => serializer.serializeObjData(item));
    };

    // Формируем список всех отсортированых по дате событий
    const personnelDocuments = [...allBusinessTrips, ...allVacations, ...allOvertimeWork, ...allDismissalApp, ...allExecutionDuties, ...allMedicalRequests, ...allTransferApplications, ...allEmployments].sort((a, b) => {
        let startObjA: TDatetime;
        let startObjB: TDatetime;

        if (!a.start_date_obj || !b.start_date_obj) {
            return 0;
        };
        if (a.code === "holidays" || a.code === "overtime_work" || a.code === "dismissal_app") {
            //@ts-ignore
            startObjA = a.start_date_obj.asDatetime(new TTime());
        } else {
            //@ts-ignore
            startObjA = a.start_date_obj;
        };

        if (b.code === "holidays" || b.code === "overtime_work" || b.code === "dismissal_app") {
            //@ts-ignore
            startObjB = b.start_date_obj.asDatetime(new TTime());
        } else {
            //@ts-ignore
            startObjB = b.start_date_obj
        };


        if (startObjA.before(startObjB)) {
            return -1;
        };
        if (startObjA.after(startObjB)) {
            return 1;
        };
        return 0;
    });

    // Записываем все документы
    userDataManager.personnelDocuments = personnelDocuments;
    // Получаем из сортированых событий первые 4 от текущей даты
    userDataManager.lastDocsForRender = [
        ...userDataManager.personnelDocuments.filter(item =>
            item.status_code !== "cancelled" && item.status_code !== "staff_cancelled" && item.status_code !== "completed"
            && item.start_date_obj && item.start_date_obj.after(today.asDatetime(new TTime()))).slice(0, 4)];

    // Отрисовываем виджет
    personnel_event_manager.renderWidget(refresh);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////// Самые большие значения ///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const svgToTypeReference = {
    docs: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.33301 2.4999C3.33301 2.03966 3.7061 1.66656 4.16634 1.66656H12.4997L16.6663 5.83323V17.4999C16.6663 17.9601 16.2933 18.3332 15.833 18.3332H4.16634C3.7061 18.3332 3.33301 17.9601 3.33301 17.4999V2.4999Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M6.66699 8.33356H13.3337" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.66699 11.6666H13.3337" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>    
    `,
    profile: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.0003 8.33323C11.8413 8.33323 13.3337 6.84085 13.3337 4.9999C13.3337 3.15895 11.8413 1.66656 10.0003 1.66656C8.15938 1.66656 6.66699 3.15895 6.66699 4.9999C6.66699 6.84085 8.15938 8.33323 10.0003 8.33323Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17.5 18.3334C17.5 14.1913 14.1421 10.8334 10 10.8334C5.85787 10.8334 2.5 14.1913 2.5 18.3334" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `,
    help: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_2707_357)">
    <path d="M10 18.75C12.4162 18.75 14.6037 17.7706 16.1872 16.1872C17.7706 14.6037 18.75 12.4162 18.75 10C18.75 7.58378 17.7706 5.39627 16.1872 3.81281C14.6037 2.22938 12.4162 1.25 10 1.25C7.58378 1.25 5.39627 2.22938 3.81281 3.81281C2.22938 5.39627 1.25 7.58378 1.25 10C1.25 12.4162 2.22938 14.6037 3.81281 16.1872C5.39627 17.7706 7.58378 18.75 10 18.75Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M10 12.0235V10.2735C11.4497 10.2735 12.625 9.09824 12.625 7.6485C12.625 6.19875 11.4497 5.0235 10 5.0235C8.55026 5.0235 7.375 6.19875 7.375 7.6485" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.99902 15.961C10.6031 15.961 11.0928 15.4714 11.0928 14.8673C11.0928 14.2632 10.6031 13.7735 9.99902 13.7735C9.39497 13.7735 8.90527 14.2632 8.90527 14.8673C8.90527 15.4714 9.39497 15.961 9.99902 15.961Z" fill="black"/>
    </g>
    <defs>
    <clipPath id="clip0_2707_357">
    <rect width="20" height="20" fill="white"/>
    </clipPath>
    </defs>
    </svg>
    
    `,
    task: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.50033 3.33325H4.58366C4.35353 3.33325 4.16699 3.5198 4.16699 3.74992V17.9166C4.16699 18.1467 4.35353 18.3333 4.58366 18.3333H16.2503C16.4805 18.3333 16.667 18.1467 16.667 17.9166V3.74992C16.667 3.5198 16.4805 3.33325 16.2503 3.33325H13.3337" stroke="black" stroke-width="1.5"/>
    <path d="M7.5 5.41667V3.33333H9.14604C9.15742 3.33333 9.16667 3.3241 9.16667 3.31271V2.5C9.16667 1.80965 9.72629 1.25 10.4167 1.25C11.107 1.25 11.6667 1.80965 11.6667 2.5V3.31271C11.6667 3.3241 11.6759 3.33333 11.6873 3.33333H13.3333V5.41667C13.3333 5.64679 13.1468 5.83333 12.9167 5.83333H7.91667C7.68654 5.83333 7.5 5.64679 7.5 5.41667Z" stroke="black" stroke-width="1.5"/>
    <path d="M7.5 10H13.75" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 13.75H13.75" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `,
    main: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.75 7.5V17.5H16.25V7.5L10 2.5L3.75 7.5Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.91699 12.0833V17.4999H12.0837V12.0833H7.91699Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M3.75 17.5H16.25" stroke="black" stroke-linecap="round"/>
    </svg>
    `,
    schedule: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.125 1.25H1.875C0.839453 1.25 0 2.08945 0 3.125V16.875C0 17.9105 0.839453 18.75 1.875 18.75H18.125C19.1605 18.75 20 17.9105 20 16.875V3.125C20 2.08945 19.1605 1.25 18.125 1.25ZM6.25 17.5H1.875C1.5298 17.5 1.25 17.2202 1.25 16.875V13.75H6.25V17.5ZM6.25 12.5H1.25V8.75H6.25V12.5ZM6.25 7.5H1.25V3.75H6.25V7.5ZM12.5 17.5H7.5V13.75H12.5V17.5ZM12.5 12.5H7.5V8.75H12.5V12.5ZM12.5 7.5H7.5V3.75H12.5V7.5ZM18.75 13.75V16.875C18.75 17.2202 18.4702 17.5 18.125 17.5H13.75V13.75H18.75ZM18.75 12.5H13.75V8.75H18.75V12.5ZM18.75 7.5H13.75V3.75H18.75V7.5Z" fill="black"/>
    </svg>    
    `,
    business_trip: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_2710_613)">
    <mask id="mask0_2710_613" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
    <path d="M20 0H0V20H20V0Z" fill="white"/>
    </mask>
    <g mask="url(#mask0_2710_613)">
    <path d="M2.08203 17.0783H17.9154" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3.55003 13.0267L1.62793 9.69758C2.03222 9.46416 4.03276 10.1621 4.77749 10.5442L8.81999 9.0972L5.36362 3.11061L7.07803 3.00771L12.6616 8.19995L16.0993 7.11178C17.6217 6.67628 18.1018 7.50787 18.1977 7.67399C18.7738 8.67183 17.6097 9.34387 17.4434 9.43987C16.1131 10.208 3.55003 13.0267 3.55003 13.0267Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    </g>
    <defs>
    <clipPath id="clip0_2710_613">
    <rect width="20" height="20" fill="white"/>
    </clipPath>
    </defs>
    </svg>
    `,
    vacation: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.9997 10.8334V5.83339C14.9997 5.37314 14.6266 5.00006 14.1663 5.00006H4.16634C3.7061 5.00006 3.33301 5.37314 3.33301 5.83339V15.8334C3.33301 16.2936 3.7061 16.6667 4.16634 16.6667H11.2497" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.66699 5.00006V16.6667" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.667 5.00006V12.0834" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.667 4.9999V2.4999C11.667 2.03966 11.2939 1.66656 10.8337 1.66656H7.50033C7.04008 1.66656 6.66699 2.03966 6.66699 2.4999V4.9999" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.583 18.3336C16.6541 18.3336 18.333 16.6546 18.333 14.5836C18.333 12.5125 16.6541 10.8336 14.583 10.8336C12.5119 10.8336 10.833 12.5125 10.833 14.5836C10.833 16.6546 12.5119 18.3336 14.583 18.3336Z" stroke="black" stroke-width="1.5"/>
    <path d="M14.167 13.3336V15.0002H15.8337" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.41699 16.6666V18.3332" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
    </svg>    
    `,
    finance: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.66699 5.4165H18.3337V15.4165H1.66699V5.4165Z" stroke="#5082E6" stroke-width="1.5" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.66699 8.74984C3.50794 8.74984 5.00033 7.25746 5.00033 5.4165H1.66699V8.74984Z" stroke="#5082E6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.66699 12.0835C3.50794 12.0835 5.00033 13.5759 5.00033 15.4168H1.66699V12.0835Z" stroke="#5082E6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3333 12.0835V15.4168H15C15 13.5759 16.4924 12.0835 18.3333 12.0835Z" stroke="#5082E6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3333 8.74984C16.4924 8.74984 15 7.25746 15 5.4165H18.3333V8.74984Z" stroke="#5082E6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.0003 12.9165C11.1509 12.9165 12.0837 11.7972 12.0837 10.4165C12.0837 9.0358 11.1509 7.9165 10.0003 7.9165C8.84974 7.9165 7.91699 9.0358 7.91699 10.4165C7.91699 11.7972 8.84974 12.9165 10.0003 12.9165Z" stroke="#5082E6" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
    `,
    other: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.8335 1.6665H4.16683C3.70659 1.6665 3.3335 2.0396 3.3335 2.49984V17.4998C3.3335 17.9601 3.70659 18.3332 4.16683 18.3332H15.8335C16.2937 18.3332 16.6668 17.9601 16.6668 17.4998V2.49984C16.6668 2.0396 16.2937 1.6665 15.8335 1.6665Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.0835 11.25H12.9168" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.0835 8.75H12.9168" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.0835 5.83301H12.9168" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.0835 14.1665H10.0002" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `,
    personal_data: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5003 3.3335H2.50033C2.04009 3.3335 1.66699 3.70659 1.66699 4.16683V15.8335C1.66699 16.2937 2.04009 16.6668 2.50033 16.6668H17.5003C17.9606 16.6668 18.3337 16.2937 18.3337 15.8335V4.16683C18.3337 3.70659 17.9606 3.3335 17.5003 3.3335Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M7.08366 10.4168C8.00412 10.4168 8.75033 9.67062 8.75033 8.75016C8.75033 7.8297 8.00412 7.0835 7.08366 7.0835C6.1632 7.0835 5.41699 7.8297 5.41699 8.75016C5.41699 9.67062 6.1632 10.4168 7.08366 10.4168Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M9.5835 12.9165C9.5835 11.5358 8.4642 10.4165 7.0835 10.4165C5.70279 10.4165 4.5835 11.5358 4.5835 12.9165" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.667 8.3335H15.0003" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.5 11.6665H15" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `,
    overtime: `<svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_2358_14813)">
    <path d="M10.2083 8.4375H6.125C5.96458 8.4375 5.83333 8.56406 5.83333 8.71875V9.28125C5.83333 9.43594 5.96458 9.5625 6.125 9.5625H10.2083C10.3687 9.5625 10.5 9.43594 10.5 9.28125V8.71875C10.5 8.56406 10.3687 8.4375 10.2083 8.4375ZM10.2083 11.8125H6.125C5.96458 11.8125 5.83333 11.9391 5.83333 12.0938V12.6562C5.83333 12.8109 5.96458 12.9375 6.125 12.9375H10.2083C10.3687 12.9375 10.5 12.8109 10.5 12.6562V12.0938C10.5 11.9391 10.3687 11.8125 10.2083 11.8125ZM4.08333 8.15625C3.59844 8.15625 3.20833 8.53242 3.20833 9C3.20833 9.46758 3.59844 9.84375 4.08333 9.84375C4.56823 9.84375 4.95833 9.46758 4.95833 9C4.95833 8.53242 4.56823 8.15625 4.08333 8.15625ZM4.08333 11.5312C3.59844 11.5312 3.20833 11.9074 3.20833 12.375C3.20833 12.8426 3.59844 13.2188 4.08333 13.2188C4.56823 13.2188 4.95833 12.8426 4.95833 12.375C4.95833 11.9074 4.56823 11.5312 4.08333 11.5312ZM12.25 2.25H9.33333C9.33333 1.00898 8.28698 0 7 0C5.71302 0 4.66667 1.00898 4.66667 2.25H1.75C0.783854 2.25 0 3.00586 0 3.9375V16.3125C0 17.2441 0.783854 18 1.75 18H12.25C13.2161 18 14 17.2441 14 16.3125V3.9375C14 3.00586 13.2161 2.25 12.25 2.25ZM7 1.6875C7.32083 1.6875 7.58333 1.94062 7.58333 2.25C7.58333 2.55938 7.32083 2.8125 7 2.8125C6.67917 2.8125 6.41667 2.55938 6.41667 2.25C6.41667 1.94062 6.67917 1.6875 7 1.6875ZM12.25 16.0312C12.25 16.1859 12.1187 16.3125 11.9583 16.3125H2.04167C1.88125 16.3125 1.75 16.1859 1.75 16.0312V4.21875C1.75 4.06406 1.88125 3.9375 2.04167 3.9375H3.5V5.0625C3.5 5.37187 3.7625 5.625 4.08333 5.625H9.91667C10.2375 5.625 10.5 5.37187 10.5 5.0625V3.9375H11.9583C12.1187 3.9375 12.25 4.06406 12.25 4.21875V16.0312Z" fill="white"/>
    </g>
    <defs>
    <clipPath id="clip0_2358_14813">
    <rect width="14" height="18" fill="white"/>
    </clipPath>
    </defs>
    </svg>
    `,
    service: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.4167 3.33356H4.58333C4.1231 3.33356 3.75 3.70665 3.75 4.16689V17.5002C3.75 17.9605 4.1231 18.3336 4.58333 18.3336H15.4167C15.8769 18.3336 16.25 17.9605 16.25 17.5002V4.16689C16.25 3.70665 15.8769 3.33356 15.4167 3.33356Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M7.5 1.66656V4.16656" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.5 1.66656V4.16656" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.66699 7.91656H13.3337" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.66699 11.2501H11.667" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.66699 14.5836H10.0003" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>    
    `,
    issue: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.25 1.6665H4.58333C4.1231 1.6665 3.75 2.0396 3.75 2.49984V17.4998C3.75 17.9601 4.1231 18.3332 4.58333 18.3332H16.25C16.7102 18.3332 17.0833 17.9601 17.0833 17.4998V2.49984C17.0833 2.0396 16.7102 1.6665 16.25 1.6665Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.08301 12.5H12.9163" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.08301 15H9.99967" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.9163 5H7.08301V9.16667H12.9163V5Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
};