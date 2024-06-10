declare const console: any, document: any, window: any, $: any, VanillaCalendar: any;

enum TaskType {
    ALL = "all",
    ACTIVE = "active",
    OUTGOING = "outgoing"
};

enum TaskButtonType {
    MAIN = "main",
    SUB = "sub"
};

enum LoaderType {
    TASKS_CONTAINER = "tasks_container",
    TASKS_TABLE = "tasks_table"
};

enum FilterType  {
    DUE_DATE = "due_date",
    CREATED_AT = "created_at",
    AUTHOR = "author",
    NAME = "name"
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
    status: string,
    state: string
};

type tasksFilters = {
    name: string | undefined,
    due_date: string | undefined,
    created_at: string | undefined,
    author: string | undefined
};

let dataSource: Record<TaskType, taskData[]> = {
    active: [],
    outgoing: [],
    all: []
};


class DomManager {
    tasksLoader: any;
    taskNodeTemplate: any;
    tasksTable: any;
    tasksPaginator: any;
    emptyTableTemplate: any;

    handleLoader(loaderType: LoaderType) {
        document.querySelector(`[data-loader=${loaderType}]`).classList.toggle("hidden");
    };

    handleEmptyTable() {
        const currentTasks = dataSource[<TaskType>window.localStorage.getItem("task_type")]
        if (!currentTasks || currentTasks.length < 1) {
            this.tasksTable.classList.add("hidden");
            this.tasksPaginator.classList.add("hidden");
            this.emptyTableTemplate.classList.remove("hidden");
        } else {
            this.tasksTable.classList.remove("hidden");
            this.tasksPaginator.classList.remove("hidden");
            this.emptyTableTemplate.classList.add("hidden");
        };
    };

    renderStaff() {
        const authorsContainer = document.querySelector(".tasks-page_main-content_title_search-extend_input-author-values");
        systemDataManager.allStaff.forEach(staff => {
            const staffUser = systemDataManager.allUsers.find(user => staff.data.ext_user && user.id === staff.data.ext_user.id);

            if (!staffUser) {
                return;
            };

            const newStaffRow = document.createElement("div");
            newStaffRow.className = "search-item";
            newStaffRow.classList.add("input-author-values_item");
            newStaffRow.textContent = staff.data.__name;
            newStaffRow.dataset["user_id"] = staffUser.id;
            newStaffRow.addEventListener("click", () => {
                handleAuthorChoice(newStaffRow);
            })
            authorsContainer.append(newStaffRow);
        });
    };

    async handleTaskClose(taskId: string, handlerName: string) {
        const task = await System.processes._searchTasks().where(f => f.__id.eq(taskId)).first();
        if (task && task.data.state == ProcessTaskState.closed) {
            getData(window.localStorage.getItem("task_type"));
            window.clearInterval(handlerName)
        };
    };

    getItemRow(item: taskData) {
        item = <taskData>item;
        const taskElementContent = this.taskNodeTemplate.content.cloneNode(true);
        const taskItemName = taskElementContent.querySelector(".tasks-name");
        const taskItemStatus = taskElementContent.querySelector(".tasks-page_main-content_table-item-section_status");
        const taskElementItem = taskElementContent.querySelector(".tasks-page_main-content_table-item") || taskElementContent.querySelector(".tasks-page_main-content_mobile_container-item");

        taskItemName.textContent = item.name;
        taskItemStatus.textContent = item.status;
        taskElementItem.href = `${systemDataManager.baseUrl}/_portal/kedo_ext/main_page(p:task/${item.id})`;
        taskElementItem.dataset["task_id"] = item.id;

        const taskItemAuthor = taskElementContent.querySelector(".task-author");
        const taskItemCreatedAt = taskElementContent.querySelector(".task-created");

        taskItemAuthor.textContent = item.author;
        taskItemCreatedAt.textContent = item.due_date;

        return taskElementItem;
    };

    getPaginatorTemplate(data: taskData[]) {
        const mockContainer = document.createElement("div");

        data.forEach(item => {
            const newRow = this.getItemRow(item);
            mockContainer.append(newRow);
        });
        return mockContainer.innerHTML;
    };

    renderPaginator(taskType: TaskType) {
        if (!Context.data.first_render) {
            $('.tasks-page_main-content_paginator').pagination("destroy");
        };

        const getPaginatorTemplate = this.getPaginatorTemplate.bind(domManager);
        const handleTaskClose = this.handleTaskClose.bind(domManager)
        const source = dataSource[taskType];

        $('.tasks-page_main-content_paginator').pagination({
            dataSource: source,
            callback: function(data: taskData[], pagination: any) {
                const html = getPaginatorTemplate(data);
                $('.tasks-page_main-content_table-content').html(html);
                const allTasksRows = document.querySelectorAll(".tasks-page_main-content_table-content .tasks-page_main-content_table-item");
                allTasksRows.forEach((row: any) => {
                    row.addEventListener("click", () => {
                        const handlerName = `task-${row.dataset["task_id"]}-handler`;
                        if (window[handlerName]) {
                            return;
                        };
                        window[handlerName] = true;
                        const taskInterval = window.setInterval(() => {
                            handleTaskClose(row.dataset["task_id"], taskInterval);
                        }, 1000);
                    });
                })
            },
            ulClassName: "content_paginator",
            prevClassName: "paginator-item",
            nextClassName: "paginator-item",
            pageClassName: "paginator-item",
            pageRange: 1,
            hideLastOnEllipsisShow: true,
            hideFirstOnEllipsisShow: true,
        });
        domManager.handleEmptyTable();
    }
};

class SystemDataManager {
    allUsers: UserItem[];
    allStaff: ApplicationItem<Application$kedo$staff$Data, any>[];
    tasks: ProcessTaskItem[];
    baseUrl = System.getBaseUrl();
    currentUser: CurrentUserItem;
};


const dateRegex = /^([120]{1}[0-9]{1}|3[01]{1,2}|0[1-9])\.(1[0-2]|0[1-9])\.\d{4}/;
const monthReference: Record<string, string> = {
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

const taskTypeReference = {
    "in_progress": "В процессе",
    "assignment": "На распределении",
    "cancel": "Отменена",
    "closed": "Закрыта"
};

function setDate(event: any) {
    const [year, month, day] = [...event.target.dataset.calendarDay.split("-")];
    const dateString = `${day}.${month}.${year}`;
    const calendarInput = event.target.closest(".task-search-date").querySelector("input");
    const calendarArrow = event.target.closest(".task-search-date").querySelector(".tasks-page_main-content_title_search-extend_input-date-arrow");
    const closestCalendar = event.target.closest(".vanilla-calendar");
    const filterType: FilterType = calendarInput.dataset.filter;

    calendarArrow.style.transform = "";
    calendarInput.value = dateString;
    closestCalendar.classList.toggle("hidden");

    setFilterField(filterType, dateString);
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
    setCalendars() {
        const taskCreatedCalendar = new VanillaCalendar(".tasks-page_main-content_title_search-extend_item-value_calendar.created-at-calendar", this.options);
        const taskDueDate = new VanillaCalendar(".tasks-page_main-content_title_search-extend_item-value_calendar.valid-to-calendar", this.options);
        [taskCreatedCalendar, taskDueDate].forEach(calendar => calendar.init());
    }
};

const domManager = new DomManager()
const systemDataManager = new SystemDataManager()
const tasksFilterClosure: ApplicationFilterClosure<ProcessTaskData> = (f, g) => {
    const filters: Filter[] = [f.__deletedAt.eq(null), g.or(f.performers.has(systemDataManager.currentUser), f.__createdBy.eq(systemDataManager.currentUser))];
    const tasksFilters: tasksFilters = window.localStorage.tasks_filters ? JSON.parse(window.localStorage.getItem("tasks_filters")) : {};

    if (Object.keys(tasksFilters).length > 0) {
        if (tasksFilters.name) {
            filters.push(f.__name.like(tasksFilters.name))
        };
        if (tasksFilters.due_date) {
            const [day, month, year] = tasksFilters.due_date.split(".").map(Number);
            const dueDate = new TDate(year, month, day).asDatetime(new TTime());
            filters.push(f.dueDate.lte(dueDate));
        };
        if (tasksFilters.created_at) {
            const [day, month, year] = tasksFilters.created_at.split(".").map(Number);
            const createdAt = new TDate(year, month, day).asDatetime(new TTime());
            filters.push(f.__createdAt.gte(createdAt));
        };
        if (tasksFilters.author) {
            const user = systemDataManager.allUsers.find(u => u.id === tasksFilters.author);
            filters.push(f.__createdBy.eq(user!));
        };
    };

    return g.and(...filters);
};

function serializeName(user: UserItem): string {
    return user.data.fullname && user.data.fullname.lastname && user.data.fullname.middlename
        ? `${user.data.fullname.lastname} ${user.data.fullname.firstname[0]}. ${user.data.fullname.middlename[0]}.`
        : user.data.fullname && user.data.fullname.lastname ? `${user.data.fullname.lastname} ${user.data.fullname.firstname[0]}.` : user.data.__name;
};

function serializeTask(task: ProcessTaskItem) {
    const author = systemDataManager.allUsers.find(user => user.id === task.data.__createdBy.id)!;
    const authorName = author ? serializeName(author) : "Система";

    const newTaskObj = {
        id: task.id,
        name: task.data.__name,
        author: authorName,
        created_at_obj: task.data.__createdAt,
        due_date_obj: task.data.dueDate,
        created_at: `
        ${task.data.__createdAt.day} ${monthReference[task.data.__createdAt.month.toString()].toLowerCase()}, ${task.data.__createdAt.year}г., ${task.data.__createdAt.hours}:${task.data.__createdAt.minutes.toString().length < 2 ? "0" + task.data.__createdAt.minutes.toString() : task.data.__createdAt.minutes.toString()} 
    `,
        due_date: task.data.dueDate ? `
        ${task.data.dueDate.day} ${monthReference[task.data.__createdAt.month.toString()].toLowerCase()}, ${task.data.__createdAt.year}г., ${task.data.__createdAt.hours}:${task.data.__createdAt.minutes.toString().length < 2 ? "0" + task.data.__createdAt.minutes.toString() : task.data.__createdAt.minutes.toString()} 
    ` : "не определено",
        status: task.data.state ? taskTypeReference[task.data.state] : "Не определён",
        state: task.data.state ? task.data.state.toString() : "",
        created_by_id: author ? author.data.__id : ""
    };
    
    switch (true) {
        case author && author.id === systemDataManager.currentUser.id:
            dataSource.outgoing.push(newTaskObj);
            task.data.performers && task.data.performers.map(p => p.id).indexOf(systemDataManager.currentUser.id) !== -1 && task.data.state && task.data.state == ProcessTaskState.inProgress && dataSource.active.push(newTaskObj) && dataSource.all.push(newTaskObj);
            break;
        case task.data.state && (task.data.state == ProcessTaskState.inProgress || task.data.state == ProcessTaskState.assignment):
            dataSource.active.push(newTaskObj);
            dataSource.all.push(newTaskObj);
            break;
        default:
            dataSource.all.push(newTaskObj);
            break;
    };
};

function handleAuthorChoice(target: any) {
    const authorInput = target.parentElement.parentElement.querySelector("input");
    const userId = target.dataset["user_id"]
    authorInput.value = target.textContent.trim();
    authorInput.dataset["user_id"] = userId;
    expandAuthorContainer(target);
    setFilterField(FilterType.AUTHOR, userId);
};

function clearFilters() {
    window.localStorage.removeItem("tasks_filters");
    const allInputs = document.querySelectorAll(".tasks-page_main-content_title_search-extend input");
    allInputs.forEach((input: any) => {
        input.value = "";
    });
    getData(window.localStorage.getItem("task_type"));
};

function expandAuthorContainer(target: any, fromSearchButton = false) {
    let authorValuesContainer: any;
    if (fromSearchButton) {
        authorValuesContainer = target.parentElement.querySelector(".search-choice-items");
    } else {
        authorValuesContainer = target.parentElement;
    }
    authorValuesContainer.classList.toggle("expanded");
};

function handleAuthorSearch(target: any) {
    const authorValues = target.parentElement.querySelector(".search-choice-items");
    if (!authorValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
        authorValues.classList.toggle("expanded");
    };
    const authorItems = authorValues.querySelectorAll(".input-author-values_item");

    authorItems.forEach((item: any) => {
        if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
            item.classList.toggle("hidden");
        } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
            item.classList.toggle("hidden")
        };
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

    if (target.value.match(dateRegex)) {
        const filterType: FilterType = target.dataset.filter;
        setFilterField(filterType, target.value);
    };
};

function setFilterField(filterType: FilterType, filterValue: string) {
    if (filterType === FilterType.NAME) {
        const mainInput = document.querySelector(".tasks-page_main-content_title_search .tasks-page_main-content_title_search-input");
        mainInput.value = filterValue;
    };
    const filterObject = window.localStorage.getItem("tasks_filters") ? JSON.parse(window.localStorage.getItem("tasks_filters")) : {};
    filterObject[filterType] = filterValue;
    window.localStorage.setItem("tasks_filters", JSON.stringify(filterObject));
};

async function expandSearch(target: any) {
    let expandSearchContainer: any;
    let expandModal = document.querySelector(".tasks-page_main-content .dropdown-modal");

    if (Array.from(target.classList).some((cls: any) => cls.includes("common-content_title_search-extend_title-img"))) {
        expandSearchContainer = target.parentElement.parentElement
    } else if (target.classList.contains("tasks-search")) {
        expandSearchContainer = target.closest(".tasks-page_main-content_title_search-extend");
        getData(window.localStorage.getItem("task_type"));
    } else {
        expandSearchContainer = target.nextElementSibling
    };

    expandSearchContainer.classList.toggle("expanded");
    expandModal.classList.toggle("hidden");
};

function handleIssueDropdownModal(target: any) {
    const dropdown = document.querySelector(".tasks-page_main-content_title_search-extend");
    let modal: any;

    if (target.classList.contains("dropdown-modal")) {
        modal = target;
    } else {
        modal = document.querySelector(".dropdown-modal");
    };
    dropdown.classList.toggle("expanded");
    modal.classList.toggle("hidden");
};

function handleTasksType(target: any) {
    const taskType: TaskType = target.dataset['task_type'] || window.localStorage.getItem("task_type");
    const taskButtonType: TaskButtonType = target.dataset['button_type'];
    const buttonClassQuery = taskButtonType === TaskButtonType.MAIN ? ".tasks-page_main-content_title-left .tasks-page_main-content_title_tab" :".tasks-page_main-content_task-types .tasks-page_main-content_title_tab"
    const taskTypesContainer = document.querySelector(".tasks-page_main-content_task-types");
    window.localStorage.setItem("task_type", taskType);

    const restButtons = document.querySelectorAll(`${buttonClassQuery}:not([data-task_type=${taskType}])`);
    target.classList.add("active");
    restButtons.forEach((button: any) => button.classList.remove("active"));

    taskButtonType === TaskButtonType.MAIN && taskType === TaskType.OUTGOING ? taskTypesContainer.classList.add("hidden") : taskButtonType === TaskButtonType.MAIN ? taskTypesContainer.classList.remove("hidden") : "";

    domManager.renderPaginator(taskType);
};

async function handleMainSearch(event: any) {
    if (event.type === "keypress") {
        getData(window.localStorage.getItem("task_type"))
        return;
    };
    
    setFilterField(FilterType.NAME, event.target.value);
    const nameInput = document.querySelector(".tasks-page_main-content_title_search-extend_input[data-filter=name]");
    nameInput.value = event.target.value;
};

async function onLoad(): Promise<void> {
    domManager.tasksLoader = document.querySelector("[data-loader=tasks_widget]");
    domManager.taskNodeTemplate = document.querySelector(".tasks-page_main-content_table-item_template");
    domManager.tasksTable = document.querySelector(".tasks-page_main-content_table");
    domManager.tasksPaginator = document.querySelector(".tasks-page_main-content_paginator");
    domManager.emptyTableTemplate = document.querySelector(".tasks-page_main-content_table-empty");
    const mainInput = document.querySelector(".tasks-page_main-content_title_search .tasks-page_main-content_title_search-input");
    mainInput.addEventListener("input", (e: any) => {
        handleMainSearch(e);
    });
    mainInput.addEventListener("keypress", (e: any) => {
        if ((e.keyCode === 13 || e.keyCode === 76)) {
            handleMainSearch(e);
        };
    });

    if (!window.tasksRefreshInterval && Context.data.refresh_data) {
        window.tasksRefreshInterval = window.setInterval(() => {
            getData(window.localStorage.getItem("task_type"));
            console.log("tasks refresh");
        }, 60000)
    };
};

async function onInit(): Promise<void> {
    init()//.then(_ => domManager.handleLoader(LoaderType.TASKS_CONTAINER));
};

async function init(): Promise<void> {
    window.localStorage.setItem("task_type", TaskType.ACTIVE);
    window.localStorage.removeItem("tasks_filters");
    systemDataManager.currentUser = await System.users.getCurrentUser();
    const allUsersCount = await System.users.search().where(f => f.__deletedAt.eq(null)).count();
    const allStaffCount = await Context.fields.staff_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.neq(null)
    )).count();
    systemDataManager.allUsers = await System.users.search().where(f => f.__deletedAt.eq(null)).size(allUsersCount).all();
    systemDataManager.allStaff = await Context.fields.staff_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.neq(null)
    )).size(allStaffCount).all();
    calendarObject.setCalendars();
    domManager.renderStaff();
    await getData(TaskType.ACTIVE);
};

async function getData(taskType: TaskType): Promise<void> {
    domManager.handleLoader(LoaderType.TASKS_TABLE)
    taskType = taskType || window.localStorage.getItem("task_type");
    dataSource.active = [];
    dataSource.all = [];
    dataSource.outgoing = [];
    const allTasksCount = await System.processes._searchTasks().where(tasksFilterClosure).count();
    const allTasks = await System.processes._searchTasks().where(tasksFilterClosure).sort("__createdAt").size(allTasksCount).all();
    systemDataManager.tasks = allTasks;
    allTasks.forEach(task => serializeTask(task));
    domManager.renderPaginator(taskType);
    domManager.handleLoader(LoaderType.TASKS_TABLE);
};