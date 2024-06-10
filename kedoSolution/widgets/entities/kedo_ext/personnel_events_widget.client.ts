declare const console: any;
declare const window: any;
declare const document: any;
declare const DOMParser: any;
declare const VanillaCalendar: any;
declare const filePath: any;

enum FilterType {
    START_DATE = "start_date",
    END_DATE = "end_date",
    STATUS_CODE = "status_code",
    NAME = "name"
};

enum LoaderType {
    COMMON = "common",
    MAIN = "main",
    TASKS = "tasks",
    DOCUMENTS = "documents",
    SERVICES = "services",
    BUSINESS_TRIPS = "business_trips",
    VACATIONS = "vacations",
    PROFILE = "profile",
    DOCUMENTS_WIDGET = "personnel_documents_widget",
    ISSUES_WIDGET = "issues_widget",
    VACATION_WIDGET = "vacation_widget",
};

enum TaskType {
    PERSONAL = "personal",
    OUTGOING = "outgoing"
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

enum FilterType {
    TASKS = "tasksFilter",
    DOCUMENTS = "documentsFilter",
    BUSINESS_TRIPS = "businessTripsFilter",
    VACATIONS = "vacationsFilter"
};

enum TaskFilterType {
    NAME = "taskName",
    CREATED_AT = "createdAt",
    DUE_DATE = "dueDate",
    STATUS = "statusCode",
    USER_ID = "userId"
};

enum NotifyType {
    ERROR,
    WARNING,
    SUCCESS,
}

type domKey = keyof typeof DomManager.prototype;
type pageKey = keyof typeof Paginator.prototype;

type userSettings = {
    notifications: string,
    provider: string,
    default_page: string
};

type serviceLinkConstructor = {
    name: string,
    ns: string,
    code: string,
    fieldToChange?: string,
    fieldValue?: any
};

type service = {
    name: string,
    code: string,
    link: string,
};

type componentObj = {
    cls: string,
    component: any;
};

type taskData = {
    id: string,
    created_by_id: string,
    name: string,
    author: string,
    created_at: string,
    created_at_obj: TDatetime,
    due_date: string,
    due_date_obj: TDatetime | undefined,
    doc_type: string,
    status: string,
    is_personal: boolean,
    state: string,
    task_type: TaskType
    doc_code?: string
};

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
    cityId?: string,
    cityName?: string,
    staffId: string,
    work_type?: string,
    type_employment?: string,
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

type newIssueConstructor = {
    name: string,
    code?: string,
    expandable: boolean,
    issue_type?: string,
    issues?: newIssueConstructor[]
    link?: string
};

type favoriteService = {
    name: string,
    services?: favoriteService[]
    code?: string,
};

type menuItem = {
    name: string,
    type: string,
    widget_name: string,
    svg?: string
};

type subordinateUserTasks = {
    userData: userTaskData,
    tasks: paginatorItem
};

type documentData = {
    docName: string,
    docId: string,

}

type userTaskData = {
    userName: string,
    userId: string,
    avatar: string,
    subdivision: string,
    tasksCount: number,
    status: string,
    statusCode: string,
};

type paginatorItem = {
    globalIndex: number,
    globalData: paginatorChunk[],
    elementType: string,
    rootToRender: any
};

type paginatorChunk = {
    index: number;
    data: dataUnion[];
};

type tasksFilter = {
    taskName?: string,
    createdAt?: TDatetime | string,
    dueDate?: TDatetime | string,
    statusCode?: string,
    userId?: string
};

type documentsFilter = {
    name?: string,
    createdAt?: TDatetime | string,
    statusCode?: string
};

type businessTripsFilter = {
    business_trip_name?: string,
    business_trips_start?: TDatetime | undefined,
    business_trips_end?: TDatetime | undefined,
    statusCode?: string,
    staffId?: string,
    cityId?: string
};

type vacationsFilter = {
    vacation_name?: string,
    vacations_start?: TDatetime | undefined,
    vacations_end?: TDatetime | undefined,
    typeId?: string,
    staffId?: string,
};

type category = {
    name: string,
    assignment_date: string,
    expiration_date: string
};

type notificationOption = {
    notify_type: NotifyType,
    duration: number
}

type dataUnion = objData | taskData;

type staff = ApplicationItem<Application$kedo$staff$Data, any>;
type organization = ApplicationItem<Application$kedo$organization$Data, any>;
type family = ApplicationItem<Application$kedo$family_composition_app$Data, any>;
type subdivision = ApplicationItem<Application$kedo$structural_subdivision$Data, any>;
type position = ApplicationItem<Application$kedo$position$Data, any>;
type vacation = ApplicationItem<Application$kedo$holidays$Data, any>;
type businessTrip = ApplicationItem<Application$kedo$business_trips$Data, any>;
type status = ApplicationItem<Application$kedo$statuses$Data, any>;

//константы и типы
const taskTypeReference = {
    "in_progress": "В процессе",
    "assignment": "На распределении",
    "cancel": "Отменена",
    "closed": "Закрыта"
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

const calendarObject = {
    options: {
        actions: {
            clickDay(event: any, self: any) {
                setDate(event)
            }
        },
        settings: {
            lang: "ru-RU"
        }
    },
    checkComponents() {
        return !!(
            document.querySelector(".documents-page_main-content_title_search-extend_item-value_calendar")
        )
    },
    setCalendars() {
        const waitForComponents = window.setInterval(() => {
            if (!this.checkComponents()) {
                console.log("waiting for calendar components")
                return;
            };
            window.clearInterval(waitForComponents);
            console.log("calendars found")
            const docsCalendar = new VanillaCalendar(".documents-page_main-content_title_search-extend_item-value_calendar", this.options);
            [
                docsCalendar,
            ].forEach(calendar => calendar.init());
        }, 100)
    }
}

function expandSearch() {

    let expandSearchContainer = document.querySelector(".documents-page_main-content_title_search-extend");
    let expandModal = document.querySelector(".dropdown-modal");

    expandSearchContainer.classList.toggle("expanded");
    expandModal.classList.toggle("hidden");
};

function clearFilters() {
    window.localStorage.removeItem("business_trips_filters");
    const allInputs = document.querySelectorAll(".business_trips-page_main-content_title_search-extend input");
    allInputs.forEach((input: any) => {
        input.value = "";
    });
};

function expandCalendar(target: any) {
    target.style.transform = target.style.transform
        ? ""
        : "rotateZ(180deg)"
    const calendar = target.parentElement.nextElementSibling;
    calendar.classList.toggle("hidden");
};

function checkAndSetDate(target: any) {
    if (!target.value || target.value.length < 1) {
        return;
    };
    const dateRegex = /^([120]{1}[0-9]{1}|3[01]{1,2}|0[1-9])\.(1[0-2]|0[1-9])\.\d{4}/;
    if (target.value.match(dateRegex)) {
        const filterType: FilterType = target.dataset.filter;
        setFilterField(filterType, target.value);
    };
};

function searchStatusExpand(target: any) {
    let expandContainer: any;
    if (!target.classList.contains("input-status-values_item")) {
        expandContainer = target.parentElement.nextElementSibling;
        if (expandContainer.classList.contains("expanded")) {
            target.style.transform = "rotateZ(0)"
        } else {
            target.style.transform = "rotateZ(180deg)"
        };
    } else {
        expandContainer = target.parentElement;
        const arrow = expandContainer.parentElement.querySelector(".common-content_title_search-extend_input-status-arrow");
        arrow.style.transform = 'rotateZ(0)';
    };

    expandContainer.classList.toggle("expanded");
};

function handleStatusChoice(target: any) {
    const statusInput = target.parentElement.previousElementSibling.querySelector("input");
    statusInput.value = target.textContent.trim();
    statusInput.dataset.statusCode = target.dataset.statusCode;
    searchStatusExpand(target);
}

/**
 * Класс, хранящий в себе все данные, относящиеся к текущему пользователю/сотруднику
 */
class UserDataManager {
    constructor() {
        this.vacations = [];
        this.businessTrips = [];
        this.issues = [];
        this.personnelDocuments = [];
        this.allDocsLoaded = false;
        this.lastDocsForRender = [];
        this.allUserDocs = [];
        this.businessTripsRefs = [];
    };

    user: CurrentUserItem;
    staff: staff;
    organization: organization | undefined;
    subdivision: subdivision | undefined;
    position: position | undefined;
    categories: category[];
    family: { name: string, relation: string }[];
    avatarLink: string | undefined;
    vacations: objData[]
    businessTrips: objData[];
    issues: objData[];
    personnelDocuments: objData[];
    lastDocsForRender: objData[];
    allUserDocs: objData[];
    allStaff: staff[];
    businessTripsRefs: { cityId: string, objId: string }[];
    allDocsLoaded: boolean;
};

/**
 * Класс, хранящий в себе глобальные объекты, прямо или косвенно связанные с пользователем/сотрудником, необходимые для отрисовки компонентов
 */
class SystemDataManager {
    statuses: status[];
    users: UserItem[];
    allEmploymentPlacements: ApplicationItem<Application$kedo$employment_directory$Data, any>[];
    allOrgs: ApplicationItem<Application$kedo$organization$Data, any>[];
    allStructuralSubdivisions: ApplicationItem<Application$kedo$structural_subdivision$Data, any>[];
    allStaff: staff[];
    allCities: { id: string, name: string }[];
    menuItems: menuItem[];
};

/**
 * Класс для хранения и парсинга информации о избранных сервисах пользователя и фильтров для объектов
 * @property baseUrl адрес площадки
 * @property tasksFilter объект типа tasksFilter
 * @property documentsFilter объект типа documentsFilter
 * @property businessTripsFilter объект типа businessTripsFilter
 * @property vacationsFilter объект типа vacationsFilter
 * @property servicesCount количество избранных сервисов пользователя
 * @property favoriteServices массиво объектов типа service
 */
class UserStorageManager {
    constructor() {
        this.baseUrl = System.getBaseUrl();
    };

    baseUrl: string;
    documentsFilter: documentsFilter | undefined;
    businessTripsFilter: businessTripsFilter | undefined;
    vacationsFilter: vacationsFilter | undefined;

    /**
     * Очищает фильтры страницы
     * @param filterType тип фильтра
     */
    clearFilters(filterType: FilterType) {

        let filterNodes: any

        filterNodes = document.querySelectorAll(".documents-filter");        

        console.log(` length ${filterNodes.length} `);
        console.log(filterNodes);

        filterNodes.forEach((node: any) => {
            node.value = "";
        });

        const search = document.querySelector(".title-search");
        if (search) {
            search.value = "";
        }

        this.documentsFilter = undefined;

        paginator.setPaginator(paginator.paginator, paginator.dataType);
    };

    serializeFilters(filterType: FilterType) {
        let filterValue: any;
        let filterNodes: any;
        let node: any;

        switch (filterType) {
            case FilterType.DOCUMENTS:
                filterNodes = document.querySelectorAll(".documents-filter");

                for (node of filterNodes) {
                    const key = node.dataset.filter;
                    const value = node.value;

                    if (!key || !value) {
                        continue;
                    };

                    switch (key) {
                        case "createdAt":
                            const [day, month, year] = (value as string).split(".");

                            if (![day, month, year].every(item => item) || year.length < 4) {
                                break;
                            };

                            filterValue = new Datetime(`${day}.${month}.${year}`, "DD.MM.YYYY");
                            break;
                        case "statusCode":
                            filterValue = node.dataset.statusCode;
                            break;
                        default:
                            filterValue = node.value;
                            break;
                    };

                    if (filterValue) {
                        if (!this.documentsFilter) {
                            this.documentsFilter = <documentsFilter>{};
                        };
                        this.documentsFilter[key as keyof documentsFilter] = filterValue;
                    } else if (!filterValue && this.documentsFilter && this.documentsFilter![key as keyof documentsFilter]) {
                        delete this.documentsFilter![key as keyof documentsFilter];
                    };
                };
            case FilterType.BUSINESS_TRIPS:
                filterNodes = document.querySelectorAll(".business_trips-filter");

                for (node of filterNodes) {
                    const key = node.dataset.filter;
                    const value = node.value;

                    if (!key || !value) {
                        continue;
                    };

                    switch (key) {
                        case "business_trips_start":
                        case "business_trips_end":
                            const [day, month, year] = (value as string).split(".");

                            if (![day, month, year].every(item => item) || year.length < 4) {
                                break;
                            };

                            filterValue = new Datetime(`${day}.${month}.${year}`, "DD.MM.YYYY");
                            break;
                        case "statusCode":
                            filterValue = node.dataset.statusCode;
                            break;
                        case "staffId":
                            filterValue = node.dataset.staffId;
                            break;
                        case "cityId":
                            filterValue = node.dataset.cityId;
                            break;
                        default:
                            filterValue = node.value;
                            break;
                    };

                    if (filterValue) {
                        if (!this.businessTripsFilter) {
                            this.businessTripsFilter = <businessTripsFilter>{};
                        };
                        this.businessTripsFilter[key as keyof businessTripsFilter] = filterValue;
                    } else if (!filterValue && this.businessTripsFilter && this.businessTripsFilter![key as keyof businessTripsFilter]) {
                        delete this.businessTripsFilter![key as keyof businessTripsFilter];
                    };
                };
            case FilterType.VACATIONS:
                filterNodes = document.querySelectorAll(".vacations-filter");

                for (node of filterNodes) {
                    const key = node.dataset.filter;
                    const value = node.value;

                    if (!key || !value) {
                        continue;
                    };

                    switch (key) {
                        case "vacations_start":
                            const [startDay, startMonth, startYear] = (value as string).split(".");

                            if (![startDay, startMonth, startYear].every(item => item) || startYear.length < 4) {
                                break;
                            };

                            const [startDayNum, startMonthNum, startYearNum] = [startDay, startMonth, startYear].map(Number)
                            filterValue = new TDate(startDayNum, startMonthNum, startYearNum);
                            break;
                        case "vacations_end":
                            const [day, month, year] = (value as string).split(".");

                            if (![day, month, year].every(item => item) || year.length < 4) {
                                break;
                            };

                            const [dayNum, monthNum, yearNum] = [day, month, year].map(Number)
                            filterValue = new TDate(yearNum, monthNum, dayNum);
                            break;
                        case "statusCode":
                            filterValue = node.dataset.statusCode;
                            break;
                        case "staffId":
                            filterValue = node.dataset.staffId;
                            break;
                        case "typeId":
                            filterValue = node.dataset.vacation_code;
                            break;
                        default:
                            filterValue = node.value;
                            break;
                    };

                    if (filterValue) {
                        if (!this.vacationsFilter) {
                            this.vacationsFilter = <vacationsFilter>{};
                        };
                        this.vacationsFilter[key as keyof vacationsFilter] = filterValue;
                    } else if (!filterValue && this.vacationsFilter && this.vacationsFilter![key as keyof vacationsFilter]) {
                        delete this.vacationsFilter![key as keyof vacationsFilter];
                    };
                };
        };
    };

    /**
     * Генерирует ссылку для сервиса
     */
    parseLink(service: serviceLinkConstructor): string {
        const linkObj = encodeURIComponent(`${service.fieldToChange ? `{${`"data":{"${service.fieldToChange}":[${JSON.stringify(service.fieldValue)}]}}`}` : ""}`).replace(/:/g, "%3A").replace(/,/g, "%2C");
        const fullUrl = `(p:item/${service.ns}/${service.code}${linkObj ? `;values=${linkObj}` : ""})`;
        return fullUrl;
    };
};

/**
 * Класс, который управляет логикой пагинации элементов на странице
*/
class Paginator {
    constructor() {
        this.subordinateTasksChunks = [];
    };

    elementsToRender: dataUnion;
    allTasksChunks: paginatorItem;
    actualTasksChunks: paginatorItem;
    outgoingTasksChunks: paginatorItem;
    lnaTasksChunks: paginatorItem;
    docsTasksChunks: paginatorItem;
    subordinateTasksChunks: subordinateUserTasks[];
    personnelDocumentsChunks: paginatorItem;
    lnaDocumentsChunks: paginatorItem;
    personalDocsChunks: paginatorItem;
    vacationsChunks: paginatorItem;
    businessTripsChunks: paginatorItem;
    tasksTableContent: any;
    tasksTable: any;
    mobileTasksTableContent: any;
    mobileTasksTable: any;
    emptyTasksTemplate: any;
    emptyDocumentsTemplate: any;
    emptyBusinessTripsTemplate: any;
    emptyVacationsTemplate: any;
    subordinateTasksTable: any;
    subordinateTasksTableContent: any;
    subordinateStructureName: any;
    subordinateStructureNameMobile: any;
    subordinateUserName: any;
    subordinateUserNameMobile: any;
    subordinatePath: any;
    subordinatePathMobile: any;
    subordinateTableMobile: any;
    personnelDocumentsTable: any;
    personnelDocumentsTableContent: any;
    businessTripsTable: any;
    businessTripsTableContent: any;
    vacationsTable: any;
    vacationsTableContent: any;
    paginator: any;
    dataType: chunkType;

    currentState: chunkType;

    /**
     * Метод, разделяющий массив на чанки для пагинации
     * @param arr массив с элементами для разделения
     * @param n количество элементов в чанке
     * @param rootToRender ссылка на DOM-элемент, в котором будут отрисовываться элементы
     * @param elementType тип элемента
     */
    private sliceToChunks(arr: any[], n: number, rootToRender: any, elementType?: string): paginatorItem {
        let index = 1;
        const chunks: paginatorChunk[] = []

        for (let i = 0; i < arr.length; i += n) {
            const chunk = arr.slice(i, i + n);
            const newChunkObj: paginatorChunk = {
                index: index++,
                data: chunk
            };
            chunks.push(newChunkObj);
        };

        return <paginatorItem>{ globalIndex: 0, globalData: chunks, elementType, rootToRender };
    };

    /**
     * Метод-проверка, что все DOM-элементы для класса подгружены
     */
    checkProps() {
        return this.tasksTable
            && this.tasksTableContent
            && this.mobileTasksTable
            && this.mobileTasksTableContent
            && this.emptyTasksTemplate
            && this.subordinateTasksTable
            && this.subordinateTasksTableContent
            && this.subordinateStructureName
            && this.subordinateUserName
            && this.subordinatePath
            && this.subordinatePathMobile
            && this.subordinateTableMobile
            && this.subordinateStructureNameMobile
            && this.subordinateUserNameMobile
            && this.personnelDocumentsTable
            && this.personnelDocumentsTableContent
            && this.emptyDocumentsTemplate
            && this.emptyBusinessTripsTemplate
            && this.businessTripsTable
            && this.businessTripsTableContent
            && this.vacationsTable
            && this.vacationsTableContent
            && this.emptyVacationsTemplate
    };

    /**
     * Метод для управления отображением пути к сотруднику в разделе Задачи -> Отдел
     * @param target DOM-элемент для отрисовки пути к сотруднику
     */
    handleSubordinatePath(target?: any) {
        if (target) {
            const user = this.subordinateTasksChunks.find(obj => obj.userData.userId === target.dataset.userId);

            if (user) {
                this.subordinateUserName.textContent = user.userData.userName;
                this.subordinateUserNameMobile.textContent = user.userData.userName;
                this.subordinateStructureName.textContent = user.userData.subdivision;
                this.subordinateStructureNameMobile.textContent = user.userData.subdivision;
            };
        };

        this.subordinatePath.classList.toggle("hidden");
        this.subordinatePathMobile.classList.toggle("hidden");
    };

    /**
     * Метод для возврата из раздела Задачи -> Отдел
     */
    handleReturn() {
        [
            this.subordinatePath,
            this.subordinatePathMobile,
            this.tasksTableContent,
            this.mobileTasksTable,
            this.subordinateTasksTableContent,
            this.paginator
        ].forEach((node: any) => node.classList.toggle("hidden"));
    };

    /**
     * Метод для управления отображением различных кнопок (добавление и удаление класса .active)
     * @param element DOM-элемент, на котором срабатывает событие
     * @param restElements DOM-элементы, для которых необходимо удалить класс
     */
    handlePageChange(element: any, restElements?: any) {
        if (restElements) {
            for (let element of restElements) {
                if (element.classList.contains("active")) {
                    element.classList.remove("active");
                };
            };
        };
        element.classList.toggle("active");
    };

    /**
     * Метод для применения фильтров к командировкам
     * @param item элемент типа paginatorItem
     */
    private filterBusinessTrips(item: paginatorItem) {
        if (!userStorageManager.businessTripsFilter) {
            return item;
        };

        let allBusinessTrips = <objData[]>[].concat.apply([], ...item.globalData.map(obj => obj.data));

        if (userStorageManager.businessTripsFilter.business_trip_name) {
            allBusinessTrips = allBusinessTrips.filter(doc => doc.name.toLowerCase().includes(userStorageManager.businessTripsFilter!.business_trip_name!.toLowerCase()));
        };

        if (userStorageManager.businessTripsFilter.business_trips_start) {
            allBusinessTrips = allBusinessTrips.filter(doc => doc.start_date_obj.after(userStorageManager.businessTripsFilter!.business_trips_start!));
        };

        if (userStorageManager.businessTripsFilter.business_trips_end) {
            allBusinessTrips = allBusinessTrips.filter(doc => doc.end_date_obj.after(userStorageManager.businessTripsFilter!.business_trips_end!));
        };

        if (userStorageManager.businessTripsFilter.statusCode) {
            allBusinessTrips = allBusinessTrips.filter(doc => doc.status_code === userStorageManager.businessTripsFilter!.statusCode);
        };

        if (userStorageManager.businessTripsFilter.cityId) {
            allBusinessTrips = allBusinessTrips.filter(doc => doc.cityId && doc.cityId === userStorageManager.businessTripsFilter!.cityId);
        };

        if (userStorageManager.businessTripsFilter.staffId) {
            allBusinessTrips = allBusinessTrips.filter(doc => doc.staffId && doc.staffId === userStorageManager.businessTripsFilter!.staffId);
        };

        const newItem = this.sliceToChunks(allBusinessTrips, 10, this.businessTripsTable, item.elementType);
        return newItem;
    };

    /**
     * Метод для применения фильтров к документам
     * @param item объект типа paginatorItem
     */
    private filterDocs(item: paginatorItem): paginatorItem {

        console.log(userStorageManager.documentsFilter);

        if (!userStorageManager.documentsFilter) {
            return item;
        };

        let allDocs = <objData[]>[].concat.apply([], ...item.globalData.map(obj => obj.data));

        if (userStorageManager.documentsFilter.name) {
            allDocs = allDocs.filter(doc => doc.name.toLowerCase().includes(userStorageManager.documentsFilter!.name!.toLowerCase()));
        };

        if (userStorageManager.documentsFilter.createdAt) {
            allDocs = allDocs.filter(doc => doc.created_at.after(userStorageManager.documentsFilter!.createdAt! as TDatetime));
        };

        if (userStorageManager.documentsFilter.statusCode) {
            allDocs = allDocs.filter(doc => doc.status_code === userStorageManager.documentsFilter!.statusCode);
        };

        const newItem = this.sliceToChunks(allDocs, 10, this.personnelDocumentsTable, item.elementType);

        console.log(newItem);

        return newItem;
    };

    /**
     * Метод для применения фильтров к отпускам
     * @param item объект типа paginatorItem
     */
    private filterVacations(item: paginatorItem): paginatorItem {
        if (!userStorageManager.vacationsFilter) {
            return item;
        };

        let allVacations = <objData[]>[].concat.apply([], ...item.globalData.map(obj => obj.data));

        if (userStorageManager.vacationsFilter.vacation_name) {
            allVacations = allVacations.filter(doc => doc.name.toLowerCase().includes(userStorageManager.vacationsFilter!.vacation_name!.toLowerCase()));
        };

        if (userStorageManager.vacationsFilter.vacations_start) {
            allVacations = allVacations.filter(doc => doc.start_date_obj.after(userStorageManager.vacationsFilter!.vacations_start!));
        };

        if (userStorageManager.vacationsFilter.vacations_end) {
            allVacations = allVacations.filter(doc => doc.end_date_obj.before(userStorageManager.vacationsFilter!.vacations_end!));
        };


        if (userStorageManager.vacationsFilter.staffId) {
            allVacations = allVacations.filter(doc => doc.staffId && doc.staffId === userStorageManager.vacationsFilter!.staffId);
        };

        if (userStorageManager.vacationsFilter.typeId) {
            allVacations = allVacations.filter(doc => doc.vacation_code && doc.vacation_code === userStorageManager.vacationsFilter!.typeId);
        };

        const newItem = this.sliceToChunks(allVacations, 10, this.vacationsTable, item.elementType);
        return newItem;
    };

    /**
     * Метод для управления видимостью заглушки с информацией о том, что объект для отрисовки пустой
     * @param paginator ссылка на DOM-элемент, в котором необходимо отобразить заглушку
     * @param dataType тип данных
     */
    handleEmptyPaginator(paginator: any, dataType: chunkType) {
        if (!paginator.classList.contains("hidden")) {
            paginator.classList.add("hidden");
        };
        switch (dataType) {
            case chunkType.ACTUAL_TASKS:
            case chunkType.ALL:
            case chunkType.IN_PROGRESS:
            case chunkType.DOCS_TASKS:
            case chunkType.LNA:
            case chunkType.OUTGOING_TASKS:
            case chunkType.SUB_TASKS:
                if (this.emptyTasksTemplate.classList.contains("hidden")) {
                    this.emptyTasksTemplate.classList.remove("hidden");
                };
                if (!this.tasksTableContent.classList.contains("hidden")) {
                    this.tasksTableContent.classList.toggle("hidden");
                };
                if (!this.mobileTasksTableContent.classList.contains("hidden")) {
                    this.mobileTasksTableContent.classList.toggle("hidden");
                };
                break;
            case chunkType.LNA_DOCS:
            case chunkType.PERSONAL:
            case chunkType.PERSONAL_DOCS:
                if (!this.personnelDocumentsTableContent.classList.contains("hidden")) {
                    this.personnelDocumentsTableContent.classList.toggle("hidden");
                };
                if (this.emptyDocumentsTemplate.classList.contains("hidden")) {
                    this.emptyDocumentsTemplate.classList.remove("hidden");
                };
                break;
            case chunkType.BUSINESS_TRIPS:
                if (!this.businessTripsTableContent.classList.contains("hidden")) {
                    this.businessTripsTableContent.classList.toggle("hidden");
                };
                if (this.emptyBusinessTripsTemplate.classList.contains("hidden")) {
                    this.emptyBusinessTripsTemplate.classList.remove("hidden");
                };
                break;
            case chunkType.VACATIONS:
                if (!this.vacationsTableContent.classList.contains("hidden")) {
                    this.vacationsTableContent.classList.toggle("hidden");
                };
                if (this.emptyVacationsTemplate.classList.contains("hidden")) {
                    this.emptyVacationsTemplate.classList.remove("hidden");
                };
                break;
        };
    };

    /**
    * Метод для навешивания логики на стрелки в пагинаторе 
    * @param prevButton стрелка влево
    * @param nextButton стрелка вправо
    * @param firstClassWord название элемента класса (чтобы динамически подставить в поиск по классу) (tasks и т.д.)
    * @param actualData нужно для обновления данных в таблице
    * @param dataType тип данных
    * @param itemIsTask элемент является заданием
    */
    initArrowButtons(prevButton: any, nextButton: any, firstClassWord: string, actualData: paginatorItem, dataType: chunkType, itemIsTask: boolean) {

        //ивент лисенеры на стрелки пагинатора стрелкам
        prevButton.addEventListener("click", () => {
            let pages = document.querySelectorAll(`.${firstClassWord}-page_main-content_paginator_item`);
            let activePage = document.querySelector(`.${firstClassWord}-page_main-content_paginator_item.active`);
            //ищем активную страницу
            if (activePage) {
                //получаем её индекс
                let activeIndex = Number(activePage.dataset["index"]);

                let outOfBounds = false;

                //если мы уже дошли до конца, то переходим на последнюю страницу
                if ((activeIndex - 1) < 0) {
                    outOfBounds = true;
                }
                //иначе убираем у страницы активность
                if (activePage.classList.contains("active")) {
                    activePage.classList.remove("active");
                }
                //ищем следующую страницу
                let newPage = document.querySelector(`div.${firstClassWord}-page_main-content_paginator div[data-index="${outOfBounds ? pages.length - 1 : activeIndex - 1}"]`);
                //делаем её активной
                if (!newPage.classList.contains("active")) {
                    newPage.classList.add("active");
                }
                //обновляем данные в таблице
                this.updatePaginator(actualData.globalData[Number(newPage.dataset["index"])].data, actualData.rootToRender, dataType, itemIsTask);
            }
        });

        //то же самое, только для стрелки вправо
        nextButton.addEventListener("click", () => {
            let pages = document.querySelectorAll(`.${firstClassWord}-page_main-content_paginator_item`);
            let activePage = document.querySelector(`.${firstClassWord}-page_main-content_paginator_item.active`);
            if (activePage) {
                let activeIndex = Number(activePage.dataset["index"]);
                let outOfBounds = false;
                if ((activeIndex + 1) > pages.length - 1) {
                    outOfBounds = true;
                }
                if (activePage.classList.contains("active")) {
                    activePage.classList.remove("active");
                }
                let newPage = document.querySelector(`div.${firstClassWord}-page_main-content_paginator div[data-index="${outOfBounds ? 0 : activeIndex + 1}"]`);
                if (!newPage.classList.contains("active")) {
                    newPage.classList.add("active");
                }
                this.updatePaginator(actualData.globalData[Number(newPage.dataset["index"])].data, actualData.rootToRender, dataType, itemIsTask);
            }
        });
    }

    /**
     * Метод для навешивания логики на троеточия в пагинаторе 
     * @param prevButton стрелка влево
     * @param nextButton стрелка вправо
     * @param firstClassWord название элемента класса (чтобы динамически подставить в поиск по классу) (tasks и т.д.)
     * @param actualData нужно для обновления данных в таблице
     * @param dataType тип данных
     * @param itemIsTask элемент является заданием
     */
    initDotsButtons(prevDots: any, nextDots: any, firstClassWord: string, actualData: paginatorItem, dataType: chunkType, itemIsTask: boolean) {

        //ивент лисенер на перемещение на 5 страниц влево
        prevDots.addEventListener("click", () => {
            let pages = document.querySelectorAll(`.${firstClassWord}-page_main-content_paginator_item`);
            let activePage = document.querySelector(`.${firstClassWord}-page_main-content_paginator_item.active`);
            if (activePage) {
                let activeIndex = Number(activePage.dataset["index"]);

                let outOfBounds = false;

                //чтобы не выйти за границы страниц, проверяем
                if ((activeIndex - 5) < 0) {
                    outOfBounds = true;
                }

                if (activePage.classList.contains("active")) {
                    activePage.classList.remove("active");
                }

                //ищем либо страницу по индексу -5 от текущей, либо первую (если вышли за границы)
                let newPage = document.querySelector(`div.${firstClassWord}-page_main-content_paginator div[data-index="${outOfBounds ? 0 : activeIndex - 5}"]`);
                if (!newPage.classList.contains("active")) {
                    newPage.classList.add("active");
                }
                this.updatePaginator(actualData.globalData[Number(newPage.dataset["index"])].data, actualData.rootToRender, dataType, itemIsTask);
            }
        });

        //то же самое, только для стрелки вправо
        nextDots.addEventListener("click", () => {
            let pages = document.querySelectorAll(`.${firstClassWord}-page_main-content_paginator_item`);
            let activePage = document.querySelector(`.${firstClassWord}-page_main-content_paginator_item.active`);
            if (activePage) {
                let activeIndex = Number(activePage.dataset["index"]);

                let outOfBounds = false;

                //чтобы не выйти за границы страниц, проверяем
                if ((activeIndex + 5) > pages.length - 1) {
                    outOfBounds = true;
                }

                if (activePage.classList.contains("active")) {
                    activePage.classList.remove("active");
                }

                //ищем либо страницу по индексу +5 от текущей, либо последнюю (если вышли за границы)
                let newPage = document.querySelector(`div.${firstClassWord}-page_main-content_paginator div[data-index="${outOfBounds ? pages.length - 1 : activeIndex + 5}"]`);
                if (!newPage.classList.contains("active")) {
                    newPage.classList.add("active");
                }
                this.updatePaginator(actualData.globalData[Number(newPage.dataset["index"])].data, actualData.rootToRender, dataType, itemIsTask);
            }
        });
    }

    /**
     * Метод для фильтрации и отрисовки элементов пагинатора
     * @param paginator ссылка на DOM-элемент, в котором происходит отрисовка
     * @param dataType тип данных
     * @param userId в случае указания будет происходить отрисовка задач определенного сотрудника из раздела Задачи -> Отдел
     */
    setPaginator(paginator: any, dataType: chunkType, userId?: string) {

        console.log(dataType);

        const itemIsTask = [chunkType.ACTUAL_TASKS, chunkType.ALL, chunkType.IN_PROGRESS, chunkType.DOCS_TASKS, chunkType.OUTGOING_TASKS, chunkType.NULL].indexOf(dataType) !== -1;
        const itemIsDocument = [chunkType.LNA_DOCS, chunkType.PERSONAL_DOCS, chunkType.PERSONAL].indexOf(dataType) !== -1;
        if (itemIsTask) {
            userStorageManager.serializeFilters(FilterType.TASKS);
        } else if (itemIsDocument) {
            userStorageManager.serializeFilters(FilterType.DOCUMENTS);
        } else if (dataType === chunkType.BUSINESS_TRIPS) {
            userStorageManager.serializeFilters(FilterType.BUSINESS_TRIPS);
        } else if (dataType === chunkType.VACATIONS) {
            userStorageManager.serializeFilters(FilterType.VACATIONS);
        };

        this.paginator = paginator;
        paginator.dataset.dataType = dataType;
        this.dataType = dataType;
        const paginatorClass = Array.from(paginator.classList)[0];
        const oldPages = paginator.querySelectorAll(`.${paginatorClass} .paginator-item`);
        //кнопка листания влево
        const prevButton = paginator.querySelector(".prev-button");
        //кнопка листания вправо
        const nextButton = paginator.querySelector(".next-button");
        const objToRender = <paginatorItem>this[dataType as pageKey] || undefined;

        if (!objToRender || !objToRender.globalData || objToRender.globalData.length < 1) {
            console.log("no paginator obj")
            this.handleEmptyPaginator(paginator, dataType);
            return;
        };

        let actualData = objToRender;

        switch (dataType) {
            case chunkType.PERSONAL:
                actualData = this.filterDocs(objToRender);
                break;
            case chunkType.PERSONAL_DOCS:
                actualData = this.filterDocs(objToRender);
                break;
            case chunkType.LNA_DOCS:
                actualData = this.filterDocs(objToRender);
                break;
            case chunkType.BUSINESS_TRIPS:
                actualData = this.filterBusinessTrips(objToRender);
                break;
            case chunkType.VACATIONS:
                actualData = this.filterVacations(objToRender);
                break;
        };

        if (!actualData || !actualData.globalData || actualData.globalData.length < 1) {
            this.handleEmptyPaginator(paginator, dataType);
            return;
        };

        const pagesCount = actualData.globalData.length;
        let i = 0;

        oldPages.forEach((page: any) => page.remove());

        let firstClassWord = this.getFirstClassWord(dataType, itemIsTask);

        //инициализируем ивент лисенеры для стрелок в пагинаторе
        this.initArrowButtons(prevButton, nextButton, firstClassWord, actualData, dataType, itemIsTask);

        //добавляем первую страницу
        const firstPage = domManager.createComponent("div", `${firstClassWord}-page_main-content_paginator_item paginator-item`);
        //записываем индекс
        firstPage.dataset["index"] = i++;
        //делаем первую страницу активной
        firstPage.classList.add("active");
        //заполняем текст
        firstPage.textContent = i;
        //добавляем ивент лисенер на смену страницы
        firstPage.addEventListener("click", () => {
            //меняем статус страницы на выбранную
            let pages = document.querySelectorAll(`.${firstClassWord}-page_main-content_paginator_item`);
            for (let page of pages) {
                if (page.classList.contains("active")) {
                    page.classList.remove("active");
                }
            }
            firstPage.dataset["active"] = true;
            firstPage.classList.add("active");
            //обновляем данные в таблице
            this.updatePaginator(actualData.globalData[0].data, actualData.rootToRender, dataType, itemIsTask);
        });
        //вставляем элемент в dom
        prevButton.after(firstPage);

        let prevElement = firstPage;

        //элемент точек для быстрого перехода по страницам (точки слева)
        const prevDots = domManager.createComponent("div", `${firstClassWord}-page_main-content_paginator_dots_prev paginator-item hidden`);
        prevDots.textContent = "...";
        firstPage.after(prevDots);
        prevElement = prevDots;

        //элемент точек для быстрого перехода по страницам (точки справа)
        const nextDots = domManager.createComponent("div", `${firstClassWord}-page_main-content_paginator_dots_next paginator-item hidden`);
        nextDots.textContent = "...";

        //инициализируем ивент лисенеры для стрелок в пагинаторе
        this.initDotsButtons(prevDots, nextDots, firstClassWord, actualData, dataType, itemIsTask);

        //создаём остальные страницы пагинатора
        for (i; i < pagesCount; i++) {
            const newPage = domManager.createComponent("div", `${firstClassWord}-page_main-content_paginator_item paginator-item`);
            newPage.dataset["index"] = i;
            newPage.textContent = i + 1;
            newPage.addEventListener("click", () => {
                //меняем статус страницы на выбранную
                let pages = document.querySelectorAll(`.${firstClassWord}-page_main-content_paginator_item`);
                for (let page of pages) {
                    if (page.classList.contains("active")) {
                        page.classList.remove("active");
                    }
                }
                newPage.classList.add("active");

                //обновляем данные в таблице
                this.updatePaginator(actualData.globalData[Number(newPage.dataset["index"])].data, actualData.rootToRender, dataType, itemIsTask);
            });
            prevElement.after(newPage);
            prevElement = newPage;
        };

        prevElement.before(nextDots);

        paginator.dataset.dataType = dataType;

        //скрываем пагинатор, если страница всего одна (для этого условие на количество страниц)
        if (pagesCount > 1) {
            if (paginator.classList.contains("hidden")) {
                paginator.classList.remove("hidden");
            };
        }

        //скрываем лишние страницы, если их больше 6 (показываем только первые 5 и последнюю)
        if (pagesCount > 6) {
            let allPages = document.querySelectorAll(`.${firstClassWord}-page_main-content_paginator_item`);
            let i = 0;
            for (let page of allPages) {
                i++;
                if (i > 5 && i !== pagesCount) {
                    if (!page.classList.contains("hidden")) {
                        page.classList.add("hidden");
                    }
                }
            }
            nextDots.classList.remove("hidden");
        }

        if (this.personnelDocumentsTableContent.classList.contains("hidden") && itemIsDocument) {
            this.personnelDocumentsTableContent.classList.remove("hidden");
        }

        if (!this.emptyDocumentsTemplate.classList.contains("hidden") && itemIsDocument) {
            this.emptyDocumentsTemplate.classList.add("hidden");
        };

        this.currentState = dataType;
        this.updatePaginator(actualData.globalData[0].data, actualData.rootToRender, dataType, itemIsTask);
    };

    /**
     * Метод для проверки состояния задачи при её открытии
     * @param taskId идентификатор задачи
     */
    async checkTask(taskId: string): Promise<boolean> {
        const currentTask = await System.processes._searchTasks().where(f => f.__id.eq(taskId)).first();

        return !currentTask || [ProcessTaskState.closed, ProcessTaskState.cancel].indexOf(currentTask.data.state!) !== -1;
    };

    /**
     * Метод для вывода имени класса объекта (чтобы искать данные по классу)
     * @param elementType тип объекта
     * @param itemIsTask объект является задачей
     */
    getFirstClassWord(elementType: chunkType, itemIsTask: boolean) {
        let firstClassWord = "";
        if (itemIsTask) {
            firstClassWord = "tasks";
        };

        if (!itemIsTask) {
            switch (elementType) {
                case chunkType.PERSONAL:
                case chunkType.PERSONAL_DOCS:
                case chunkType.LNA_DOCS:
                    firstClassWord = "documents";
                    break;
                case chunkType.BUSINESS_TRIPS:
                    firstClassWord = "business_trips";
                    break;
                case chunkType.VACATIONS:
                    firstClassWord = "vacations";
                    break;
            };
        };

        return firstClassWord;
    }

    /**
     * Метод для обновления вывода страниц пагинатора. Если страниц более 6, то выводим только первую, последнюю и по 2 слева и справа от активной
     * @param firstClassWord название общего класса css. Например tasks 
     */
    changePaginatorPages(firstClassWord: string) {
        //обновляем пагинатор. Если страниц более 6, то выводим только первую, последнюю и по 2 слева и справа от активной
        let paginatorPages = document.querySelectorAll(`.${firstClassWord}-page_main-content_paginator_item`);
        if (paginatorPages) {
            //активная страница
            let activePage = document.querySelector(`.${firstClassWord}-page_main-content_paginator_item.active`);
            //если страниц больше 6
            if (activePage && paginatorPages.length > 6) {
                //индекс активной страницы
                let activeIndex = Number(activePage.dataset["index"]);
                //массив допустимых к выводу индексов
                let acceptedIndexes: number[] = [
                    0,
                    paginatorPages.length - 1,
                    activeIndex,
                    activeIndex - 2 >= 0 ? activeIndex - 2 : activeIndex + 4,
                    activeIndex - 1 >= 0 ? activeIndex - 1 : activeIndex + 3,
                    activeIndex + 2 <= paginatorPages.length - 1 ? activeIndex + 2 : activeIndex - 4,
                    activeIndex + 1 <= paginatorPages.length - 1 ? activeIndex + 1 : activeIndex - 3,
                ];

                //скрываем или открываем страницы
                for (let page of paginatorPages) {
                    //@ts-ignore
                    if (acceptedIndexes.includes(Number(page.dataset["index"]))) {
                        if (page.classList.contains("hidden")) {
                            page.classList.remove("hidden");
                        }
                    } else {
                        if (!page.classList.contains("hidden")) {
                            page.classList.add("hidden");
                        }
                    }
                }

                //выбираем, показывать ли три точки
                if (paginatorPages.length > 6) {
                    let prevDots = document.querySelector(`.${firstClassWord}-page_main-content_paginator_dots_prev`);
                    let nextDots = document.querySelector(`.${firstClassWord}-page_main-content_paginator_dots_next`);

                    //если не видим вторую страницу, значит выводим три точки
                    //@ts-ignore
                    if (!acceptedIndexes.includes(1)) {
                        if (prevDots && prevDots.classList.contains("hidden")) {
                            prevDots.classList.remove("hidden");
                        }
                    } else {
                        if (prevDots && !prevDots.classList.contains("hidden")) {
                            prevDots.classList.add("hidden");
                        }
                    }

                    //если не видим предпоследнюю страницу, значит выводим три точки
                    //@ts-ignore
                    if (!acceptedIndexes.includes(paginatorPages.length - 2)) {
                        if (nextDots && nextDots.classList.contains("hidden")) {
                            nextDots.classList.remove("hidden");
                        }
                    } else {
                        if (nextDots && !nextDots.classList.contains("hidden")) {
                            nextDots.classList.add("hidden");
                        }
                    }
                }
            }
        }
    }

    /**
     * Метод для отрисовки объектов в пагинаторе
     * @param elementsToRender массив с элементами для отрисовки
     * @param rootToRender сслыка на DOM-элемент, в котором происходит отрисовка
     * @param elementType тип элементов
     * @param itemIsTask признак, что тип элементов - задачи (отличается логика отрисовки)
     */
    updatePaginator(elementsToRender: dataUnion[], rootToRender: any, elementType: chunkType, itemIsTask: boolean) {
        let templateToRender: any;
        console.log('update');
        rootToRender.innerHTML = "";

        let firstClassWord = this.getFirstClassWord(elementType, itemIsTask);

        //обновляем пагинатор. Если страниц более 6, то выводим только первую, последнюю и по 2 слева и справа от активной
        this.changePaginatorPages(firstClassWord);

        if (itemIsTask) {
            templateToRender = document.querySelector(".tasks-page_main-content_table-item_template");
            const mobileTemplateToRender = document.querySelector(".tasks-page_main-content_mobile_container-item_template");
            this.mobileTasksTableContent.innerHTML = "";

            for (let item of elementsToRender) {
                const newRow = this.getElementRow(<taskData>item, templateToRender, elementType, itemIsTask);
                const newMobileRow = this.getElementRow(<taskData>item, mobileTemplateToRender, elementType, itemIsTask, true);
                domManager.renderComponent(rootToRender, newRow);
                domManager.renderComponent(this.mobileTasksTableContent, newMobileRow);
                newRow.addEventListener("click", () => {
                    let i = 0

                    const handleTask = window.setInterval(async () => {
                        const taskClosed = await this.checkTask(item.id);

                        if (i >= 60) {
                            window.clearInterval(handleTask);
                        };

                        if (taskClosed) {
                            window.clearInterval(handleTask)
                            await getOrRefreshData(true, true);
                            this.setPaginator(this.paginator, elementType);
                            const tasksCounter = document.querySelector(".left-menu_item[data-menu-item='tasks'] .left-menu_item-counter");
                            const tasksCount = [].concat.apply([], [...this.actualTasksChunks.globalData].map(item => [...item.data])).length;
                            tasksCounter.textContent = tasksCount;
                        };

                        i++;
                    }, 1000)
                });
            };
        } else {
            switch (elementType) {
                case chunkType.PERSONAL:
                case chunkType.PERSONAL_DOCS:
                case chunkType.LNA_DOCS:
                    templateToRender = document.querySelector(".documents-page_main-content_table-item_template");
                    this.personnelDocumentsTable.innerHTML = "";
                    for (let item of elementsToRender) {
                        const newRow = this.getElementRow(item, templateToRender, elementType, itemIsTask);
                        domManager.renderComponent(rootToRender, newRow);
                    };
                    break;
                case chunkType.BUSINESS_TRIPS:
                    templateToRender = document.querySelector(".business_trips-page_main-content_table-item_template");
                    this.businessTripsTable.innerHTML = "";

                    for (let item of elementsToRender) {
                        const newRow = this.getElementRow(item, templateToRender, elementType, itemIsTask);
                        domManager.renderComponent(rootToRender, newRow);
                    };

                    break;
                case chunkType.VACATIONS:
                    templateToRender = document.querySelector(".vacations-page_main-content_table-item_template");
                    this.vacationsTable.innerHTML = "";

                    for (let item of elementsToRender) {
                        const newRow = this.getElementRow(item, templateToRender, elementType, itemIsTask);
                        domManager.renderComponent(rootToRender, newRow);
                    };
                    break;
            };
        };
    };

    /**
     * Создаёт и возвращает элемент в пагинаторе
     * @param item объект с данными
     * @param template шаблон DOM-элемента
     * @param itemType тип элемента
     * @param isTask признак, что элемент является задачей
     * @param isMobile признак, что отрисовка происходит для мобильной версии
     * @return DOM-элемент
     */
    getElementRow(item: dataUnion, template: any, itemType: chunkType, isTask = false, isMobile = false): any {
        let itemContent: any;
        let itemRow: any;
        let itemName: any;
        let itemStatus: any;
        let itemStart: any;
        let itemEnd: any;
        let itemTypeEmployment: any;

        if (isTask) {
            item = <taskData>item;
            const taskElementContent = template.content.cloneNode(true);
            const taskItemName = taskElementContent.querySelector(".tasks-name");
            const taskItemStatus = taskElementContent.querySelector(".tasks-page_main-content_table-item-section_status");
            const taskElementItem = taskElementContent.querySelector(".tasks-page_main-content_table-item") || taskElementContent.querySelector(".tasks-page_main-content_mobile_container-item");

            taskItemName.textContent = item.name;
            taskItemStatus.textContent = item.status;
            taskElementItem.href = `${userStorageManager.baseUrl}/_portal/kedo_ext/my_profile(p:task/${item.id})`;
            taskElementItem.dataset.taskType = item.task_type;

            if (isMobile) {
                return taskElementItem;
            } else {
                const taskItemAuthor = taskElementContent.querySelector(".task-author");
                const taskItemCreatedAt = taskElementContent.querySelector(".task-created");

                taskItemAuthor.textContent = item.author;
                taskItemCreatedAt.textContent = item.due_date;

                return taskElementItem;
            };
        } else {
            item = <objData>item;
            let [startDay, endDay, startMonth, endMonth, startYear, endYear]: any[] = [];
            switch (itemType) {
                case chunkType.PERSONAL:
                case chunkType.LNA_DOCS:
                case chunkType.PERSONAL_DOCS:
                    itemContent = template.content.cloneNode(true);
                    itemRow = itemContent.querySelector(".documents-page_main-content_table-item");
                    itemName = itemRow.querySelector(".document-name");
                    const itemCreated = itemRow.querySelector(".document-created");
                    itemStatus = itemRow.querySelector(".documents-page_main-content_table-item-section_status");

                    itemName.textContent = item.name;
                    try {
                        //@ts-ignore
                        itemCreated.textContent = `${item.created_at.day} ${monthReference[item.created_at.month.toString()].toLowerCase()}, ${item.created_at.year}г., ${item.created_at.hours}:${item.created_at.minutes.toString().length < 2 ? "0" + item.created_at.minutes.toString() : item.created_at.minutes.toString()} `
                    } catch (e) {
                        //@ts-ignore
                        itemCreated.textContent = `${item.created_at.day} ${monthReference[item.created_at.month.toString()]}, ${item.created_at.year}г., ${item.created_at.hours}:${item.created_at.minutes.toString().length < 2 ? "0" + item.created_at.minutes.toString() : item.created_at.minutes.toString()} `
                    }
                    itemStatus.textContent = item.status;

                    itemRow.href = item.link;
                    return itemRow;
                case chunkType.BUSINESS_TRIPS:
                    itemContent = template.content.cloneNode(true);
                    itemRow = itemContent.querySelector(".business_trips-page_main-content_table-item");
                    itemName = itemRow.querySelector(".business_trips-name");
                    itemStatus = itemRow.querySelector(".business_trips-page_main-content_table-item-section_status");
                    itemStart = itemRow.querySelector(".business_trips-start");
                    itemEnd = itemRow.querySelector(".business_trips-end");

                    itemName.textContent = item.name;
                    itemStatus.textContent = item.status;
                    [startDay, startMonth, startYear] = item.start_date ? item.start_date.split(".") : ["", "", ""];
                    [endDay, endMonth, endYear] = item.end_date ? item.end_date.split(".") : ["", "", ""];
                    try {
                        //@ts-ignore
                        itemStart.textContent = `${startDay} ${monthReference[startMonth.replace("0", "")].toLowerCase()}, ${startYear}г., ${(item.start_date_obj as TDatetime).hours}:${(item.start_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.start_date_obj as TDatetime).minutes.toString() : (item.start_date_obj as TDatetime).minutes.toString()} `
                        //@ts-ignore
                        itemEnd.textContent = `${endDay} ${monthReference[endMonth.replace("0", "")].toLowerCase()}, ${endYear}г., ${(item.end_date_obj as TDatetime).hours}:${(item.end_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.end_date_obj as TDatetime).minutes.toString() : (item.end_date_obj as TDatetime).minutes.toString()} `
                    } catch (e) {
                        //@ts-ignore
                        itemStart.textContent = `${startDay} ${monthReference[startMonth.replace("0", "")]}, ${startYear}г., ${(item.start_date_obj as TDatetime).hours}:${(item.start_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.start_date_obj as TDatetime).minutes.toString() : (item.start_date_obj as TDatetime).minutes.toString()} `
                        //@ts-ignore
                        itemEnd.textContent = `${endDay} ${monthReference[endMonth.replace("0", "")]}, ${endYear}г., ${(item.end_date_obj as TDatetime).hours}:${(item.end_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.end_date_obj as TDatetime).minutes.toString() : (item.end_date_obj as TDatetime).minutes.toString()} `
                    }
                    itemRow.href = item.link;
                    return itemRow;
                case chunkType.VACATIONS:
                    itemContent = template.content.cloneNode(true);
                    itemRow = itemContent.querySelector(".vacations-page_main-content_table-item");
                    itemName = itemRow.querySelector(".vacations-name");
                    itemStatus = itemRow.querySelector(".vacations-page_main-content_table-item-section_status");
                    itemStart = itemRow.querySelector(".vacations-start");
                    itemEnd = itemRow.querySelector(".vacations-end");
                    itemTypeEmployment = itemRow.querySelector(".vacations-type-employment");

                    itemName.textContent = item.name;
                    itemStatus.textContent = item.status;
                    itemTypeEmployment.textContent = item.type_employment;
                    [startDay, startMonth, startYear] = item.start_date ? item.start_date.split(".") : ["", "", ""];
                    [endDay, endMonth, endYear] = item.end_date ? item.end_date.split(".") : ["", "", ""];
                    //@ts-ignore
                    itemStart.textContent = `${startDay} ${monthReference[startMonth.replace("0", "")].toLowerCase()}, ${startYear}г., ${(item.start_date_obj as TDatetime).hours}:${(item.start_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.start_date_obj as TDatetime).minutes.toString() : (item.start_date_obj as TDatetime).minutes.toString()} `
                    //@ts-ignore
                    itemEnd.textContent = `${endDay} ${monthReference[endMonth.replace("0", "")].toLowerCase()}, ${endYear}г., ${(item.end_date_obj as TDatetime).hours}:${(item.end_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.end_date_obj as TDatetime).minutes.toString() : (item.end_date_obj as TDatetime).minutes.toString()} `

                    itemRow.href = item.link;
                    return itemRow;
            };
        }
    };

    /**
     * Временно не используется
     */
    updateChunks(elements: dataUnion[], pageChunkType: chunkType, userId?: string) {
        let propToUpdate: paginatorItem | undefined;

        if (pageChunkType === chunkType.SUB_TASKS) {
            propToUpdate = this.subordinateTasksChunks.find(obj => obj.userData.userId === userId)?.tasks;
        } else {
            //@ts-ignore
            propToUpdate = this[pageChunkType as pageKey];
        };

        let rootToRender: any;

        switch (pageChunkType) {
            case chunkType.ACTUAL_TASKS:
            case chunkType.ALL:
            case chunkType.IN_PROGRESS:
            case chunkType.DOCS_TASKS:
            case chunkType.LNA:
            case chunkType.OUTGOING_TASKS:
            case chunkType.SUB_TASKS:
                rootToRender = this.tasksTable;
                break;
            case chunkType.PERSONAL:
            case chunkType.LNA_DOCS:
            case chunkType.PERSONAL_DOCS:
                rootToRender = this.personnelDocumentsTable;
                break;
        };

        if (propToUpdate) {
            const oldItems = propToUpdate.globalData;
            propToUpdate = this.sliceToChunks([...oldItems, ...elements], 10, rootToRender, pageChunkType);
        };
    };

    /**
     * Метод для заполнения свойств экземепляра класса
     * @param elements массив с данными
     * @param pageChunkType тип данных
     * @param userData при передаче параметра данные заполняются в сотруднике отдела в разделе Задачи -> Отдел
     */
    setChunks(elements: dataUnion[], pageChunkType: chunkType, userData?: userTaskData) {
        if (userData) {
            const userTasks = this.subordinateTasksChunks.find(obj => obj.userData.userId === userData.userId);

            if (userTasks) {
                userTasks.tasks = this.sliceToChunks(elements, 10, this.tasksTable, pageChunkType);
            } else {
                const newUserObj: subordinateUserTasks = {
                    userData,
                    tasks: this.sliceToChunks(elements, 10, this.tasksTable, pageChunkType)
                };
                this.subordinateTasksChunks.push(newUserObj);
            };
        } else {
            let rootToRender: any;

            switch (pageChunkType) {
                case chunkType.ACTUAL_TASKS:
                case chunkType.ALL:
                case chunkType.IN_PROGRESS:
                case chunkType.DOCS_TASKS:
                case chunkType.LNA:
                case chunkType.OUTGOING_TASKS:
                case chunkType.SUB_TASKS:
                    rootToRender = this.tasksTable;
                    break;
                case chunkType.PERSONAL:
                case chunkType.PERSONAL_DOCS:
                case chunkType.LNA_DOCS:
                    rootToRender = this.personnelDocumentsTable;
                    break;
                case chunkType.BUSINESS_TRIPS:
                    rootToRender = this.businessTripsTable;
                    break;
                case chunkType.VACATIONS:
                    rootToRender = this.vacationsTable;
                    break;
            };
            //@ts-ignore
            this[pageChunkType as pageKey] = this.sliceToChunks(elements, 10, rootToRender, pageChunkType);
        };
    };
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

    /**
     * Приводит ФИО к строчному формату Фамилия И.О.
     * @param user пользователь
     */
    serializeName(user: UserItem): string {
        return user.data.fullname && user.data.fullname.lastname && user.data.fullname.middlename
            ? `${user.data.fullname.lastname} ${user.data.fullname.firstname[0]}. ${user.data.fullname.middlename[0]}.`
            : user.data.fullname && user.data.fullname.lastname ? `${user.data.fullname.lastname} ${user.data.fullname.firstname[0]}.` : user.data.__name;
    };

    /**
     * Преобразует объект к типу objData
     * @param item объект приложения, унаследованный от BaseItem
     */
    serializeObjData(item: any): objData {
        const linkCode = item.code === "holidays" ? "vacations"
            : item.code === "business_trips" ? "businesstrip_requests" : item.code;
        const linkNs = item.code === "holidays" ? "absences"
            : item.code === "business_trips" ? "business_trips" : item.namespace;
        const itemStatus = item.data.kedo_status ? this.systemDataManager.statuses.find(s => s.id === item.data.kedo_status.id) : undefined;
        const referenceCity = userDataManager.businessTripsRefs.find(city => city.objId === item.id);
        const dateArray = item.code === "overtime_work" ? item.data.start_date ? new Datetime(item.data.start_date).format("DD.MM.YYYY").split(".").map(Number) : item.data.date ? new Datetime(item.data.date).format("DD.MM.YYYY").split(".").map(Number) : undefined : undefined;
        const employmentPlacement = item.data.employment_placement || item.data.employment_place || item.data.employment_directory;

        return <objData>{
            id: item.id,
            name: item.data.__name,
            code: item.code === "business_trips" ? "businesstrip_requests" : item.code === "holidays" ? "vacations" : item.code,
            ns: item.code === "business_trips" ? item.code : item.code === "holidays" ? "absences" : item.namespace,
            status: itemStatus ? itemStatus.data.name : item.data.__status && item.data.__status.status ? item.data.__status.status.name : "Не определён",
            status_code: itemStatus ? itemStatus.data.code : item.data.__status && item.data.__status.status ? item.data.__status.status.code : "not implemented",
            business_type: issuesWidgetCodes.indexOf(item.code) === -1 ? "personnel_document" : "issue",
            item_type: item.code === "business_trips" ? DocType.BUSINESS_TRIP
                : item.code === "holidays" ? DocType.VACATION
                    : issuesWidgetCodes.indexOf(item.code) === -1 ? DocType.PERSONAL : DocType.ISSUE,
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
            cityId: referenceCity ? referenceCity.cityId : undefined,
            cityName: (referenceCity && systemDataManager.allCities) && systemDataManager.allCities.find(city => city.id === referenceCity.cityId) ? systemDataManager.allCities.find(city => city.id === referenceCity.cityId)!.name : undefined,
            staffId: item.data.kedo_staff ? item.data.kedo_staff.id : undefined,
            work_type: item.data.work_type || "",
            type_employment: employmentPlacement ? this.systemDataManager.allEmploymentPlacements.find(employment => employment.id === employmentPlacement.id)?.data.__name : undefined,
        };
    };
};

class DomManager {
    constructor(userManager: UserStorageManager) {
        this.userManager = userManager;
        this.documentTemplate = undefined;
        this.loader = undefined;
        this.uploadableComponents = [];
        this.parser = new DOMParser();
        this.domLoaded = false;
    };

    parser: typeof DOMParser;
    root: componentObj | undefined;
    loader: componentObj | undefined;
    userManager: UserStorageManager;
    paginator: Paginator;
    uploadableComponents: componentObj[];
    headerPortalButton: componentObj;
    documentTemplate: any | undefined;
    domLoaded: boolean;

    /**
   * Надстройка на метдом document.createElement
   *
   * @param tag тип компонента
   * @param cls класс компонента (можно передавать несколько, разделив пробелом)
   * @param id идентификатор компонента
   * @return созданный элемент
   */
    createComponent(tag: string, cls: string, id?: string): any {
        const newElement = document.createElement(tag);

        if (newElement.className.split(" ").length > 1) {
            newElement.classlist = cls.split(" ").map(c => {
                return `.${c} `;
            }).join(" ").trim();
        } else {
            newElement.className = cls;
        };

        if (id) {
            newElement.id = id;
        };

        return newElement;
    };

    /**
     * Добавляет класс active к элементу
     * @param element DOM-элемент
     */
    setActive(element: any) {
        element.classList.add("active");
    };

    /**
     * Метод для изменения элемента (используется как конструктор для блоков класса .widget-item)
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

    /**
     * Метод для рендера элемента в определенной области DOM
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

    renderDocumentSection(refresh = false) {

        this.paginator.personnelDocumentsTable = document.querySelector(".documents-page_main-content_table-content");
        this.paginator.personnelDocumentsTableContent = document.querySelector(".documents-page_main-content_table");
        this.paginator.emptyDocumentsTemplate = document.querySelector(".documents-page_main-content_table-empty");

        this.paginator.setChunks(userDataManager.allUserDocs, chunkType.PERSONAL);
        //this.paginator.setChunks(userDataManager.allUserDocs.filter(doc => doc.code == "docs_lna"), chunkType.LNA_DOCS);
        //this.paginator.setChunks(userDataManager.allUserDocs.filter(doc => doc.code !== "docs_lna"), chunkType.PERSONAL_DOCS);

        function expandMobileDocuments() {
            const mobileFooterDocumentsTypes = document.querySelector(".documents-page_main-content_mobile_footer")
            mobileFooterDocumentsTypes.classList.toggle("hidden");
        }

        const docsStatusContainer = document.querySelector(".documents-page_main-content_title_search-extend_input-status-values");
        const documentsSearchButton = document.querySelector(".documents-search");
        const documentsFilterClearButton = document.querySelector(".documents-reset");
        const documentsPaginator = document.querySelector(".documents-page_main-content_paginator");
        const docsFilterButtons = document.querySelectorAll(".documents-page_main-content_title-left .documents-page_main-content_title_tab");
        const docsFilterButtonsMobile = document.querySelectorAll(".documents-page_main-content_mobile_footer-item:not(.mobile-docs-expand)");
        const restElements = document.querySelectorAll(".documents-page_main-content_title_tab");
        const mobileExpandButton = document.querySelector(".document-page_main-content_title_text");
        const mobileCloseExpandButton = document.querySelector(".documents-page_main-content_mobile_footer-item");

        docsFilterButtons.forEach((node: any) => {
            node.addEventListener("click", () => {
                this.paginator.handlePageChange(node, restElements);
                this.paginator.setPaginator(documentsPaginator, node.dataset.dataType);
            });
        });
        docsFilterButtonsMobile.forEach((node: any) => {
            node.addEventListener("click", () => {
                this.paginator.setPaginator(documentsPaginator, node.dataset.dataType);
                expandMobileDocuments();
            });
        });

        refresh && refreshContainers([docsStatusContainer]) //statusContainer, statusContainerMobile 

        for (let status of systemDataManager.statuses) {
            const newStatusItem = this.createComponent("div", "input-status-values_item search-item");
            newStatusItem.dataset.statusCode = status.data.code;
            newStatusItem.textContent = status.data.name;

            newStatusItem.addEventListener("click", () => {
                handleStatusChoice(newStatusItem)
            });
            this.renderComponent(docsStatusContainer, newStatusItem);
        };

        if (!Context.data.event_listeners_set) {
            documentsSearchButton.addEventListener("click", () => {
                this.paginator.setPaginator(documentsPaginator, documentsPaginator.dataset.dataType);
                const closeFiltersButton = documentsSearchButton.closest(".common-content_title_search-extend").querySelector(".common-content_title_search-extend_title-img");
                closeFiltersButton.click();
            });

            documentsFilterClearButton.addEventListener("click", () => {
                userStorageManager.clearFilters(documentsFilterClearButton.dataset.reset);
                const closeFiltersButton = documentsFilterClearButton.closest(".common-content_title_search-extend").querySelector(".common-content_title_search-extend_title-img");
                closeFiltersButton.click();
            });

            [mobileExpandButton, mobileCloseExpandButton].forEach((button: any) => button.addEventListener("click", expandMobileDocuments));

            this.handleSearch("documents");
        };

        if (this.paginator.personnelDocumentsChunks && this.paginator.personnelDocumentsChunks.globalData.length > 0) {
            this.paginator.setPaginator(documentsPaginator, chunkType.PERSONAL);
        };

        //!refresh && this.handleLoader(LoaderType.DOCUMENTS);
    };

    handleSearch(firstClassWord: string) {

        let search = document.querySelector(`.${firstClassWord}-page_main-content_title_search-input`);
        let searchExtend = document.querySelector(`.${firstClassWord}-page_main-content_title_search-extend_input`);

        if (search && searchExtend) {
            search.addEventListener("keyup", () => {
                let mainSearch = document.querySelector(`.${firstClassWord}-page_main-content_title_search-input`);
                let searchExtend = document.querySelector(`.${firstClassWord}-page_main-content_title_search-extend_input`);
                searchExtend.value = mainSearch.value;
                const paginator = document.querySelector(`.${firstClassWord}-page_main-content_paginator`);
                this.paginator.setPaginator(paginator, paginator.dataset.dataType);

                if (searchExtend.value === "") {
                    let resetButton = document.querySelector(`.${firstClassWord}-reset`);
                    userStorageManager.clearFilters(resetButton.dataset.reset);
                }
            })
        }
    }

    /**
  * Включает/выключает анимацию загрузки страницы
  * @param loader тип загрузчика, выборка по атрибуту data-loader
  */
    handleLoader(loaderType: LoaderType) {
        const waitForLoader = window.setInterval(() => {
            const loader = document.querySelector(`.kedo-loader-wrapper[data-loader=${loaderType}]`);
            if (!loader) {
                return
            };
            window.clearInterval(waitForLoader)
            loader.classList.toggle("hidden");

        }, 100)
        // console.log(`${loaderType} loading end`)
    };
}

/**
 * Функция для сброса компонентов внутри контейнеров при обновлении данных страницы
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
 * @param refreshTasks признак того, что нужно только обновление задач
 */
async function getOrRefreshData(refresh = false, refreshTasks = false): Promise<void> {
    let userTasksObj: taskData[];

    async function setOrRefreshTasks(): Promise<void> {

        paginator.setChunks(userTasksObj.filter(task => task.task_type === TaskType.PERSONAL), chunkType.ALL);
        paginator.setChunks(userTasksObj.filter(task => task.task_type === TaskType.OUTGOING), chunkType.OUTGOING_TASKS);
        paginator.setChunks(userTasksObj.filter(task => task.is_personal && task.task_type === TaskType.PERSONAL), chunkType.DOCS_TASKS);
        paginator.setChunks(userTasksObj.filter(task => (task.state === "in_progress" || task.state === "assignment") && task.task_type === TaskType.PERSONAL), chunkType.ACTUAL_TASKS);

        if (refreshTasks) {
            const taskTypeButtons = document.querySelectorAll(".tasks-page_main-content_title-left .tasks-page_main-content_title_tab");
            let activeType = <any>Array.from(taskTypeButtons).find((button: any) => button.classList.contains("active"));

            if (activeType.dataset.dataType === "actualTasksChunks") {
                activeType = <any>Array.from(document.querySelectorAll(".tasks-page_main-content_task-types .task-list-type")).find((button: any) => button.classList.contains("active"));
            }
        };
    };

    domManager.paginator = paginator;

    const defaultFilter: FilterClosure<ItemData> = (f, g) => {
        return g.and(
            //@ts-ignore
            f.__deletedAt.eq(null),
            //@ts-ignore
            f.staff.link(userDataManager.staff)
        );
    };

    //!refresh && domManager.handleLoader(LoaderType.COMMON);

    const allVacations = await Context.fields.vacations_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.kedo_staff.link(userDataManager.staff)
    )).size(1000).all().then(res => res.map(item => serializer.serializeObjData(item))).then(res => res.sort((a, b) => {
        if (!a.start_date_obj && !b.start_date_obj) {
            return 0;
        }

        if (!a.start_date_obj) {
            return 1;
        }

        if (!b.start_date_obj) {
            return -1;
        }

        //@ts-ignore
        if (a.start_date_obj.before(b.start_date_obj)) {
            return -1;
        }
        //@ts-ignore
        if (a.start_date_obj.after(b.start_date_obj)) {
            return 1;
        };
        return 0;
    }));

    const allBusinessTripsObj = await Context.fields.business_trips_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.kedo_staff.link(userDataManager.staff)
    )).size(1000).all();

    const businessTripsRefs = await Promise.all(allBusinessTripsObj.map(obj => {
        return obj.data.__sourceRef ? obj.data.__sourceRef.fetch() : undefined;
    })).then(res => res.filter(obj => obj)).then(res => res.map(obj => {
        return {
            cityId: obj.data.destination_city ? obj.data.destination_city.id : undefined,
            objId: obj.id
        };
    }));

    userDataManager.businessTripsRefs = businessTripsRefs;

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

    const [allMedicalRequests, allTransferApplications, allExecutionDuties, allDismissalApp, allEmployments] = await Promise.all([
        Context.fields.medical_request_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
        Context.fields.transfer_application_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
        Context.fields.execution_duties_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
        Context.fields.dismissal_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
        Context.fields.employment_app.app.search().where(defaultFilter).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))),
    ])

    userDataManager.position = userDataManager.staff.data.position ? await userDataManager.staff.data.position.fetch() : undefined;

    const allIssues = await Promise.all([
        Context.fields.benefit_application_app.app.search().where(defaultFilter).size(1000).all(),
        Context.fields.order_financial_assistance_app.app.search().where(defaultFilter).size(1000).all(),
        Context.fields.certificate_app.app.search().where(defaultFilter).size(1000).all(),
        Context.fields.category_assignment_app.app.search().where(defaultFilter).size(1000).all(),
        Context.fields.employees_personal_data_app.app.search().where(defaultFilter).size(1000).all(),
        Context.fields.free_from_app.app.search().where(defaultFilter).size(1000).all(),
        Context.fields.application_for_the_transfer_of_salary_to_the_current_account_app.app.search().where(defaultFilter).size(1000).all(),
        Context.fields.setlement_sheet_app.app.search().where(defaultFilter).size(1000).all()
    ]);

    const allIssuesObj: objData[] = [].concat.apply([], allIssues).map((item: any) => serializer.serializeObjData(item)).sort((a: objData, b: objData) => {
        if (a.created_at.before(b.created_at)) {
            return -1;
        };
        if (a.created_at.after(b.created_at)) {
            return 1;
        };
        return 0;
    });

    //const personnelDocuments = [...allBusinessTrips, ...allVacations, ...allOvertimeWork, ...allDismissalApp, ...allExecutionDuties, ...allMedicalRequests, ...allTransferApplications, ...allEmployments].sort((a, b) => {
    const personnelDocuments = [...allBusinessTrips, ...allVacations, ...allDismissalApp, ...allExecutionDuties, ...allMedicalRequests, ...allTransferApplications, ...allEmployments].sort((a, b) => {
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

    userDataManager.personnelDocuments = personnelDocuments;
    //userDataManager.issues = allIssuesObj;
    userDataManager.lastDocsForRender = [...userDataManager.personnelDocuments.filter(item => item.start_date_obj && item.start_date_obj.after(today.asDatetime(new TTime())) && item.status_code !== "completed").slice(0, 4), ...userDataManager.issues.slice(0, 4)];
    userDataManager.vacations = allVacations;
    userDataManager.businessTrips = allBusinessTrips;


    // userDataManager.allUserDocs = [...allIssuesObj, ...personnelDocuments, ...userLna].sort((a: objData, b: objData) => {
    //     if (a.created_at.before(b.created_at)) {
    //         return 1;
    //     };
    //     if (a.created_at.after(b.created_at)) {
    //         return -1;
    //     };
    //     return 0;
    // });

    userDataManager.allUserDocs = [...allIssuesObj, ...personnelDocuments].sort((a: objData, b: objData) => {
        if (a.created_at.before(b.created_at)) {
            return 1;
        };
        if (a.created_at.after(b.created_at)) {
            return -1;
        };
        return 0;
    });
};

/**
 * Функция используется для отрисовки и обновления компонентов после того, как все данные загрузились (userDataManager.allDocsLoaded = true)
 * @param refresh признако того, что идёт обновление данных
 */
function renderOrRefreshComponents(refresh = false) {

    if (!Context.data.event_listeners_set) {
        window.setInterval(() => {
            getOrRefreshData(true).then(_ => {
                renderOrRefreshComponents(true);
            });
        }, 60000);
    };

    Context.data.event_listeners_set = true;
};

function setDate(event: any) {
    const [year, month, day] = [...event.target.dataset.calendarDay.split("-")];
    const dateString = `${day}.${month}.${year}`;
    const calendarInput = event.target.closest(".task-search-date").querySelector("input");
    const calendarArrow = event.target.closest(".task-search-date").querySelector(".documents-page_main-content_title_search-extend_input-date-arrow");
    const closestCalendar = event.target.closest(".vanilla-calendar");
    const filterType: FilterType = calendarInput.dataset.filter;

    calendarArrow.style.transform = "";
    calendarInput.value = dateString;
    closestCalendar.classList.toggle("hidden");

    setFilterField(filterType, dateString);
};

function setFilterField(filterType: FilterType, filterValue: string) {
    const filterObject = window.localStorage.getItem("documents_filters") ? JSON.parse(window.localStorage.getItem("documents_filters")) : {};
    filterObject[filterType] = filterValue;
    window.localStorage.setItem("documents_filters", JSON.stringify(filterObject));
};

/**
 * Функция используется для получения константных данных, после чего вызывается getOrRefreshData для получения данных, которые динамически меняются
 */
async function getAllData(): Promise<void> {

    const [currentUser, allStaff] = await Promise.all([System.users.getCurrentUser(), Context.fields.staff_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all()])
    const currentStaff = allStaff.find(staff => staff.data.ext_user && staff.data.ext_user.id === currentUser.id);

    systemDataManager.allStaff = allStaff;
    userDataManager.staff = currentStaff as staff;
    Context.data.staff_app = currentStaff;
    userDataManager.user = <CurrentUserItem>currentUser;

    const allStatuses = await Context.fields.statuses_app.app.search().where(f => f.__deletedAt.eq(null)).size(100).all();
    const allEmploymentDirectory = await Context.fields.staff_app.app.fields.employment_table.fields.employment_placement_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    systemDataManager.statuses = allStatuses;
    systemDataManager.allEmploymentPlacements = allEmploymentDirectory;
    serializer.setManagers(userDataManager, systemDataManager);

    await getOrRefreshData().then(_ => {
        userDataManager.allDocsLoaded = true;
    });
};

const userDataManager = new UserDataManager();
const systemDataManager = new SystemDataManager();
const userStorageManager = new UserStorageManager();
const serializer = new Serializer();
const paginator = new Paginator();
const today = new TDate();
const domManager = new DomManager(userStorageManager);

async function onInit() {
    await getAllData();
}

async function onLoad() {
    domManager.renderDocumentSection(false);
    calendarObject.setCalendars();
}