//TODO: add parallel loading while data loading
declare const console: any;
declare const window: any;
declare const document: any;
declare const DOMParser: any;
declare const VanillaCalendar: any;
declare const notify : any;
declare const FileReader: any;
declare const filePath: any;
declare const getNoun: any;
declare const svgToTypeReference: any;
declare const monthReference: any;
declare const issueCodeToNameReference: any;
declare const handleIssueExpand: any;
declare const handleStatusChoice: any;
declare const handleStaffChoice: any;
declare const handleAuthorChoice: any;
declare const handleCityChoice: any;
declare const handleGlobalTasks: any;
declare const handleDropdownModal: any;
declare const handleSubordinateSwitch: any;
declare const handleTasksTitle: any;
declare const handleIssueDropdownModal: any;
declare const closeServices: any;
declare const expandMobileTasks: any;
declare const expandMobileDocuments: any;
declare const setServiceLinks: any;
declare const setActive: any;
declare const localStorage: any;
declare const navigator: any;

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
    docName?: string,
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
    notify_type : NotifyType,
    duration : number
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

const calendarObject = {
    options: {
        actions: {
            clickDay(event: any, self: any) {
                this.setDate(event)
            }
        },
        settings: {
            lang: "ru-RU"
        }
    },
    setDate(event: any) {
        const [year, month, day] = [...event.target.dataset.calendarDay.split("-")]
        const calendarInput = event.target.closest(".task-search-date").querySelector("input");
        calendarInput.value = `${day}.${month}.${year}`;
        const closestCalendar = event.target.closest(".vanilla-calendar");
        closestCalendar.classList.toggle("hidden");
    },
    checkComponents() {
        return !!(
            document.querySelector(".mobile .created-at-calendar") &&
            document.querySelector(".created-at-calendar") &&
            document.querySelector(".mobile .valid-to-calendar") &&
            document.querySelector(".valid-to-calendar") &&
            document.querySelector(".documents-page_main-content_title_search-extend_item-value_calendar") &&
            document.querySelector(".business_trips_start-calendar") &&
            document.querySelector(".business_trips_end-calendar") &&
            document.querySelector(".vacations_start-calendar") &&
            document.querySelector(".vacations_end-calendar")
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
            const vacationsStartCalendar = new VanillaCalendar(".vacations_start-calendar", this.options)
            const vacationsEndCalendar = new VanillaCalendar(".vacations_end-calendar", this.options)
            const businessTripsStartCalendar = new VanillaCalendar(".business_trips_start-calendar", this.options)
            const businessTripsEndCalendar = new VanillaCalendar(".business_trips_end-calendar", this.options)
            const mobileCreatedAtClanedar = new VanillaCalendar(".mobile .created-at-calendar", this.options);
            const createdAtCalenedar = new VanillaCalendar(".created-at-calendar", this.options);
            const mobileValidToCalenedar = new VanillaCalendar(".mobile .valid-to-calendar", this.options);
            const validToClanedar = new VanillaCalendar(".valid-to-calendar", this.options);
            [
                createdAtCalenedar,
                mobileCreatedAtClanedar,
                validToClanedar,
                mobileValidToCalenedar,
                docsCalendar,
                businessTripsStartCalendar,
                businessTripsEndCalendar,
                vacationsStartCalendar,
                vacationsEndCalendar
            ].forEach(calendar => calendar.init());
        }, 100)
    }
}

/**
 * Класс для управления DOM-элементами
 * @property parser DOMParser, для парсинга html/xml
 * @property root главный контейнер страницы (.portal-container)
 * @property loader компонент загрузчика (.kedo-loader-wrapper)
 * @property userManager экземепляр класса UserStorageManager
 * @property paginator экземепляр класса Paginator
 * @property headerContainerComponent контейнер компонента заголовка (.header-container)
 * @property portalContentComponent внутренний контейнер страницы (.portal-content)
 * @property mainMenuContentContainerComponent контейнер с компонентом Главная (.main-page_main-content)
 * @property mainMenuContainerComponent контейнер с главными виджетами-разделами страницы (.main-page)
 * @property uploadableComponents массив в объектами типа componentObj
 * @property headerPortalButton кнопка в заголовке страницы (.portal_header-link)
 * @property templates HTML-код, который хранит в себе все элементы типа template
 * @property tasksPaginator DOM-элемент пагинатора со страницы Задачи
 * @property domLoaded признак того, что всё DOM-дерево подгружено
 * 
 */
class DomManager {
    constructor(userManager: UserStorageManager) {
        this.userManager = userManager;
        this.headerContainerComponent = undefined;
        this.mainMenuContainerComponent = undefined;
        this.mainMenuContentContainerComponent = undefined;
        this.portalContentComponent = undefined;
        this.userInfoTemplateContent = undefined;
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
    headerContainerComponent: componentObj | undefined;
    portalContentComponent: componentObj | undefined;
    mainMenuContentContainerComponent: componentObj | undefined;
    mainMenuContainerComponent: componentObj | undefined;
    userInfoTemplateContent: any | undefined
    uploadableComponents: componentObj[];
    headerPortalButton: componentObj;
    documentTemplate: any | undefined;
    templates: any;
    tasksPaginator: any;
    domLoaded: boolean;

    async renderMainSection(refresh = false) {
        let closestVacation: objData | undefined;
        

        async function runProcess() {
            const runProcessResponse = await fetch(`${userStorageManager.baseUrl}/pub/v1/bpm/template/absences.vacations/reschedule_vacation/run`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${Context.data.token!}`
                },
                body: JSON.stringify({
                    context: {
                        kedo_staff: [
                            userDataManager.staff.id
                        ],
                        vacations: [
                            closestVacation?.id,
                        ],
                        __createdBy: userDataManager.user.id,
                        __item: {
                            namespace: closestVacation?.ns,
                            code: closestVacation?.code,
                            id: closestVacation?.id,
                        },
                    }
                })
            });

            if (!runProcessResponse.ok) {
                console.log(await runProcessResponse.text());
                error("Не удалось запустить процесс переноса отпуска. Попробуйте повторить попытку позже");
            } else {
                console.log(await runProcessResponse.json());
                success(`Процесс переноса отпуска ${closestVacation?.name} запущен.`);
            }
        };

        if (!Context.data.event_listeners_set) {
            const changeUserDataButton = document.querySelector(".kedo__my-profle_header-title-button");
            const logoutButton = this.userInfoTemplateContent!.querySelector(".logout");
            changeUserDataButton.href = `${window.location.href}(p:item/kedo/employees_personal_data)`;
            logoutButton.addEventListener("click", async () => {
                await userDataManager.user.logout();
            });
        };

        const issuesContainer = this.uploadableComponents.find(element => element.cls.includes("main-page_issues-widget"))!.component.querySelector(".main-page_issues-widget_container");
        const issueItemTemplate = document.querySelector(".issues-widget_item-template");
        const documentsContainer = this.uploadableComponents.find(element => element.cls.includes("main-page_personnel-events-widget"))!.component.querySelector(".main-page_personnel-events-widget_container");
        this.documentTemplate = document.querySelector(".personnel-events-widget_item-template");

        refresh && refreshContainers([documentsContainer], "personnel-events-widget_item");
        refresh && refreshContainers([issuesContainer]);

        const emptyPersonnelDocumentsTemplate = document.querySelector(".main-page_personnel-events-widget_container_empty");
        const actualPersonnelDocuments = userDataManager.personnelDocuments.filter(item => item.start_date_obj && item.start_date_obj.after(today.asDatetime(new TTime())))

        if (!userDataManager.personnelDocuments || actualPersonnelDocuments.length < 1) {
            emptyPersonnelDocumentsTemplate.classList.remove("hidden");
        } else if (!emptyPersonnelDocumentsTemplate.classList.contains("hidden")) {
            emptyPersonnelDocumentsTemplate.classList.add("hidden");
        };

        const emptyIssuesTemplate = document.querySelector(".main-page_issues-widget_container_empty");

        if (!userDataManager.issues || userDataManager.issues.length < 1) {
            emptyIssuesTemplate.classList.remove("hidden");
        } else if (!emptyIssuesTemplate.classList.contains("hidden")) {
            emptyIssuesTemplate.classList.add("hidden");
        };

        userDataManager.lastDocsForRender.forEach(item => {
            const itemIsIssue = item.business_type === "personnel_document" ? false : true;
            const [startDay, startMonth, startYear] = item.start_date ? item.start_date.split(".") : ["", "", ""];
            const [endDay, endMonth, endYear] = item.end_date ? item.end_date.split(".") : ["", "", ""];
            let elementData: blockConstructor;
            try {
                elementData = {
                    titleClass: "item-header",
                    titleContent: item.code === "businesstrip_requests" || item.code === "vacations"
                        ? `${startDay} ${monthReference[startMonth.replace("0", "")].toLowerCase()} - ${endDay} ${monthReference[endMonth.replace("0", "")].toLowerCase()}`
                        : item.code === "overtime_work" || item.code === "dismissal_app" ? `${item.start_date_obj.day} ${monthReference[item.start_date_obj.month.toString()].toLowerCase()}`
                            : `${item.created_at.day} ${monthReference[item.created_at.month.toString()].toLowerCase()}`,
                    iconClass: "item-icon-container",
                    iconContent: svgToTypeReference[item.item_type],
                    extraContentClass: "item-shortand",
                    extraContent: item.code === "overtime_work" ? item.work_type : item.vacation_type || issueCodeToNameReference[item.code],
                    status: item.status,
                    link: item.link
                };
            } catch (e) {
                elementData = {
                    titleClass: "item-header",
                    titleContent: item.code === "businesstrip_requests" || item.code === "vacations"
                        ? `${startDay} ${monthReference[startMonth.replace("0", "")]} - ${endDay} ${monthReference[endMonth.replace("0", "")]}`
                        : item.code === "overtime_work" || item.code === "dismissal_app" ? `${item.start_date_obj.day} ${monthReference[item.start_date_obj.month.toString()]}`
                            : `${item.created_at.day} ${monthReference[item.created_at.month.toString()]}`,
                    iconClass: "item-icon-container",
                    iconContent: svgToTypeReference[item.item_type],
                    extraContentClass: "item-shortand",
                    extraContent: item.code === "overtime_work" ? item.work_type : item.vacation_type || issueCodeToNameReference[item.code],
                    status: item.status,
                    link: item.link
                };
            }
            const newIssueContent = itemIsIssue ? issueItemTemplate.content.cloneNode(true) : this.documentTemplate.content.cloneNode(true);
            const newIssueElement = itemIsIssue ? newIssueContent.querySelector(".issues-widget_item") : newIssueContent.querySelector(".personnel-events-widget_item");
            this.renderComponent(itemIsIssue ? issuesContainer : documentsContainer, newIssueElement, false, elementData);
        });

        !refresh && this.handleLoader(LoaderType.DOCUMENTS_WIDGET);
        !refresh && this.handleLoader(LoaderType.ISSUES_WIDGET);

        const vacationContainer = this.uploadableComponents.find(element => element.cls === "main-page_vacation-widget");
        const planAmountElement = vacationContainer!.component.querySelector(".info-row_plan-amount_value");
        this.changeElement(planAmountElement, `${userDataManager.staff.data.remaining_vacation_days || 0} ${getNoun(userDataManager.staff.data.remaining_vacation_days || 0, "день", "дня", "дней")}`, true);

        closestVacation = userDataManager.vacations.find(vac => vac.start_date_obj && vac.start_date_obj.after(today.asDatetime(new TTime())));

        if (closestVacation) {
            // const reschedule_process = await System.processes._searchInstances().where((f, g) => g.and(
            //         f.__deletedAt.eq(null),
            //         f.__id.neq(Context.id),
            //         g.or(
            //             f.__state.like(ProcessInstanceState.exec),
            //             f.__state.like(ProcessInstanceState.wait)
            //         ),
            //         (f as any).__item.eq(Context.data.vacations)
            //     ))
            //     .first();
            const [startDay, startMonth, startYear] = closestVacation.start_date!.split(".");
            const closestVacationElement = vacationContainer!.component.querySelector(".info-row_label-text-start");
            const vacationRescheduleElement = vacationContainer!.component.querySelector(".info-row_closest-link");
            const vacationDurationElement = vacationContainer!.component.querySelector(".info-row_closest_value");
            this.changeElement(vacationDurationElement, `${closestVacation.duration ?? 1} ${getNoun(closestVacation.duration ?? 1, "день", "дня", "дней")}`);
            try {
                this.changeElement(closestVacationElement, `C ${startDay.replace("0", "")} ${monthReference[startMonth.replace("0", "")].toLowerCase()}`, true);
            } catch {
                this.changeElement(closestVacationElement, `C ${startDay.replace("0", "")} ${monthReference[startMonth.replace("0", "")]}`, true);
            }

            if (vacationRescheduleElement.classList.contains("hidden")) {
                this.handleHiddenElement(vacationRescheduleElement)
            };

            !refresh && vacationRescheduleElement.addEventListener("click", runProcess);

            if (closestVacationElement.classList.contains("hidden")) {
                this.handleHiddenElement(closestVacationElement)
            };
        } else {
            const vacationDurationElement = vacationContainer!.component.querySelector(".info-row_closest");
            const emptyVacationElement = vacationContainer!.component.querySelector(".empty-vacation");
            if (!vacationDurationElement.classList.contains("hidden") && emptyVacationElement.classList.contains("hidden")) {
                [vacationDurationElement, emptyVacationElement].forEach(elem => this.handleHiddenElement(elem));
            };
        };

        !refresh && this.handleLoader(LoaderType.VACATION_WIDGET);

        const userInfoName = this.userInfoTemplateContent.querySelector(".left-menu_user-info_data-name");
        const userInfoPosition = this.userInfoTemplateContent.querySelector(".left-menu_user-info_data-position_info");
        const leftMenu = this.uploadableComponents.find(elem => elem.cls === "main-page_left-menu")!.component;

        !refresh && this.renderComponent(leftMenu, this.userInfoTemplateContent);

        userInfoName.textContent = userDataManager.staff.data.full_name ? `${userDataManager.staff.data.full_name.lastname} ${userDataManager.staff.data.full_name.firstname}` : userDataManager.staff.data.__name;
        userInfoPosition.textContent = userDataManager.position ? userDataManager.position.data.__name : "Не определена";

        // !refresh && this.handleLoader(LoaderType.COMMON);
    };

    formatAddress(address: string) {
        //если нам не предоставили адрес или в адресе нет переносов (значит он внесён вручную), тогда выходим
        if (!address) {
            return undefined;
        }

        if (!address.includes("\n")) {
            return address;
        }

        //разбиваем строку адреса на элементы (с разделителем переход на следующую строку)
        let addressArray = address.split("\n");
        let addressLine = "";
        //выполняем манипуляции
        addressArray.forEach((item: string) => { if (item !== "") addressLine += item.replace(",", "").trim() + ", " });
        //убираем последнюю запятую
        addressLine = addressLine.slice(0, addressLine.length - 4);
        addressLine = addressLine.replace(", , ", ", ");

        return addressLine;
    }

    renderProfileSection(refresh = false) {
        function handleSettingsModal(checkSettings = false) {
            settingsModal.classList.toggle("hidden");

            if (checkSettings) {
                const userSignType = userDataManager.staff.data.docs_signing_type?.code ?? undefined;
                console.log(userSignType);
                const signVariants = Array.from(document.querySelectorAll("#sign_type input"));
                const checkedSignVariant: any = signVariants.find((input: any) => input.value === userSignType || input.value === "kontur" || input.value === "sign_me");
                checkedSignVariant!.checked = true;
            };
        };

        const settingsModal = document.querySelector(".settings_modal-container");
        const emailValue = document.querySelector(".work-content-item.email .work-content-item_info-value");
        const phoneValue = document.querySelector(".work-content-item.phone .work-content-item_info-value");
        const organizationValue = document.querySelector(".work-content-item.organization .work-content-item_info-value");
        const subdivisionValue = document.querySelector(".work-content-item.subdivision .work-content-item_info-value");
        const snilsNode = document.querySelector(".snils");
        const tinNode = document.querySelector(".inn");
        const userPositionNode = document.querySelector(".user-position");
        const familyInfoContainer = document.querySelector(".kedo__my-profle_docs-family-info_content");
        const categoryInfoContainer = document.querySelector(".kedo__my-profle_docs-category-info_content");
        const passportInfoContainers = Array.from(document.querySelectorAll(".passport-info-item_value")) as any[];
        const userAvatarContainer = document.querySelector(".kedo__my-profle_header-user-avatar");
        const userAvatarContainerMobile = document.querySelector(".main-page_mobile-footer_expand-menu_header-avatar-img");
        const userAvatarLeftMenu = document.querySelector(".left-menu_user-info_img");
        const settingsButton = document.querySelector(".left-menu_user-info_popup-item.settings");
        const mobileSettingsButton = document.querySelector(".main-page_mobile-footer_expand-menu_header-settings");

        if (userDataManager.avatarLink) {
            userAvatarLeftMenu.src = userDataManager.avatarLink;
            userAvatarContainer.src = userDataManager.avatarLink;
            userAvatarContainerMobile.src = userDataManager.avatarLink;
        };

        passportInfoContainers.find(node => node.id == "passport-name").innerText = userDataManager.staff.data.__name;
        passportInfoContainers.find(node => node.id == "passport-gender").innerText = userDataManager.staff.data.sex ? "Мужской" : "Женский";
        passportInfoContainers.find(node => node.id == "passport-birthday").innerText = userDataManager.staff.data.date_of_birth ? userDataManager.staff.data.date_of_birth.format("DD.MM.YY") : "Не указана";
        passportInfoContainers.find(node => node.id == "passport-birthplace").innerText = this.formatAddress(userDataManager.staff.data.address as string) || "Не указан";
        passportInfoContainers.find(node => node.id == "passport-number").innerText = `${userDataManager.staff.data.passport_series} ${userDataManager.staff.data.passport_number}`;
        passportInfoContainers.find(node => node.id == "passport-issue-date").innerText = userDataManager.staff.data.date_of_issue ? userDataManager.staff.data.date_of_issue.format("DD.MM.YY") : "Не указана";
        passportInfoContainers.find(node => node.id == "passport-subdivision").innerText = userDataManager.staff.data.passport_department_code;
        passportInfoContainers.find(node => node.id == "passport-issue-department").innerText = userDataManager.staff.data.issued_by;

        userPositionNode.textContent = userDataManager.position ? userDataManager.position.data.__name : "Должность не указана";

        emailValue.textContent = userDataManager.staff.data.email ? userDataManager.staff.data.email.email : "Не указан";
        phoneValue.textContent = userDataManager.staff.data.phone ? userDataManager.staff.data.phone.tel : "Не указан";

        snilsNode.textContent = userDataManager.staff.data.snils || "Не указан";
        tinNode.textContent = userDataManager.staff.data.inn || "Не указан";
        organizationValue.textContent = userDataManager.organization ? userDataManager.organization.data.__name : "Не указана";
        subdivisionValue.textContent = userDataManager.subdivision ? userDataManager.subdivision.data.__name : "Не указано";

        refresh && refreshContainers([categoryInfoContainer], "misc-info-item-category");
        refresh && refreshContainers([familyInfoContainer], "family-info-item");

        if (userDataManager.family && userDataManager.family.length > 0) {
            const familyItemTemplate = this.templates.querySelector(".family-info-item_template");

            for (let item of userDataManager.family) {
                const familyItemContent = familyItemTemplate.content.cloneNode(true);
                const familyItem = familyItemContent.querySelector(".family-info-item");
                const familyItemLabel = familyItem.querySelector(".family-info-item_label");
                const familyItemValue = familyItem.querySelector(".family-info-item_value");

                familyItemLabel.textContent = item.relation
                familyItemValue.textContent = item.name;

                familyInfoContainer.append(familyItem);
            };
        } else {
            const emptyFamilyTemplate = document.querySelector(".kedo__my-profle_docs-family-info_content_empty");
            if (emptyFamilyTemplate.classList.contains("hidden")) {
                emptyFamilyTemplate.classList.toggle("hidden");
            };
        };

        if (userDataManager.categories && userDataManager.categories.length > 0) {
            const categoryItemTemplate = this.templates.querySelector(".misc-info-item-category_template");

            for (let item of userDataManager.categories) {
                const categoryItemContent = categoryItemTemplate.content.cloneNode(true);
                const categoryItem = categoryItemContent.querySelector(".misc-info-item-category");
                const categoryItemValue = categoryItem.querySelector(".misc-info-category_value");

                categoryItemValue.innerHTML = `${item.name} <br>Действует до: ${item.expiration_date}`;

                categoryInfoContainer.append(categoryItem);
            };
        } else {
            const defaultCategoryTemplate = document.querySelector(".misc-info-item-category.default-category");
            if (defaultCategoryTemplate.classList.contains("hidden")) {
                defaultCategoryTemplate.classList.toggle("hidden");
            };
        };

        if (userDataManager.staff.data.notification && !refresh) {
            const notificationsRadio = document.querySelectorAll(".notification-item input");
            const notificationToSelect = <any>Array.from(notificationsRadio).find((node: any) => userDataManager.staff.data.notification!.code === node.value);

            if (notificationToSelect) {
                notificationToSelect.click();
            };

            notificationsRadio.forEach((node: any) => node.addEventListener("change", async () => {
                const notificationValue = userDataManager.staff.fields.notification.data.variants.find(variant => variant.code === node.value);
                if (notificationValue) {
                    userDataManager.staff.data.notification = { name: notificationValue.name, code: <any>notificationValue.code };
                    await userDataManager.staff.save();
                };
            }));
        };

        const avatarSvgButton = document.querySelector(".avatar-container_svg");
        const avatarInput = document.querySelector(".avatar-file-input")

        !refresh && avatarSvgButton.addEventListener("click", () => {
            avatarInput.click();
        });

        !refresh && avatarInput.addEventListener("change", () => {
            const reader = new FileReader();
            const file = avatarInput.files[0];
            reader.readAsDataURL(file);
            reader.onload = async function () {
                const [imgBase64, imgDataUrl] = [reader.result.split(",")[1], reader.result];
                Context.data.avatar_base64 = imgBase64;
                [userAvatarContainer, userAvatarLeftMenu, userAvatarContainerMobile].forEach((img: any) => {
                    img.src = imgDataUrl;
                });

                await Server.rpc.setUserAvatar();
            };
            reader.onerror = function (error: any) {
                console.log('error: ', error);
            };
        });

        const userNameContainer = document.querySelector(".user-name")
        const userNameContainerMobile = document.querySelector(".main-page_mobile-footer_expand-menu_header-text");

        [userNameContainer, userNameContainerMobile].forEach((node: any) => {
            node.textContent = userDataManager.staff.data.__name;
        });


        //todo возможно удалить вместе с типом
        const userSettings: userSettings = window.localStorage.getItem("portal_settings");

        if (!refresh) {
            const signTypeVariantsContainer = document.querySelector("#sign_type");
            const closeSettingsButton = document.querySelector(".settings_modal-title_close");
            const signTypeVariants = signTypeVariantsContainer.querySelector(".settings_modal-main-item_variants");
            const organization = userDataManager.organization ? systemDataManager.allOrgs.find(org => org.id === userDataManager.staff.data.organization!.id) : undefined;
            const saveButton = document.querySelector(".settings_modal-button.confirm");
            const cancelButton = document.querySelector(".settings_modal-button.cancel");

            if (organization && !organization.data.leave_choice_to_staff || !organization!.data.sign_provider || organization!.data.sign_provider.length < 1) {
                signTypeVariantsContainer.remove();
            } else {
                organization!.data.sign_provider.forEach(provider => {
                    const radioVariantTemplate = document.querySelector(".choice_radio-container-template").content.cloneNode(true).querySelector(".choice_radio-container");
                    const input = radioVariantTemplate.querySelector("input");
                    const label = radioVariantTemplate.querySelector("label");

                    input.id = provider.code;
                    input.value = provider.code;
                    input.name = "unep_choice";

                    label.textContent = provider.name;
                    label.htmlFor = provider.code;

                    signTypeVariants.append(radioVariantTemplate);
                });

                const makeChoiceRadioVariant = document.querySelector(".choice_radio-container-template").content.cloneNode(true).querySelector(".choice_radio-container");
                const input = makeChoiceRadioVariant.querySelector("input");
                const label = makeChoiceRadioVariant.querySelector("label");

                input.id = "make_choice";
                input.value = "make_choice";
                input.name = "unep_choice";

                label.textContent = "Дать выбор";
                label.htmlFor = "make_choice";

                signTypeVariants.append(makeChoiceRadioVariant);
            };

            saveButton.addEventListener("click", async () => {
                const checkedProvider: any = Array.from(signTypeVariants.querySelectorAll(".choice_radio-container input")).find((input: any) => {
                    return input.checked;
                });
                
                if (!checkedProvider) {
                    return;
                };

                if (checkedProvider.value === "goskey") {
                    userDataManager.staff!.data.docs_signing_type = userDataManager.staff!.fields.docs_signing_type.variants.goskey;
                } else if (checkedProvider.value === "make_choice") {
                    userDataManager.staff!.data.docs_signing_type = userDataManager.staff!.fields.docs_signing_type.variants.make_choice;
                } else {
                    userDataManager.staff!.data.docs_signing_type = userDataManager.staff!.fields.docs_signing_type.variants.inner_sign;
                };

                await userDataManager.staff!.save();
                handleSettingsModal();
            });

            [settingsButton, mobileSettingsButton].forEach((button: any) => button.addEventListener("click", () => {
                handleSettingsModal(true);
            }));

            [closeSettingsButton, cancelButton].forEach((button: any) => button.addEventListener("click", () => {
                handleSettingsModal();
            }));
        };


        !refresh && this.handleLoader(LoaderType.PROFILE);
    };

    renderBusinessTripsSection(refresh = false) {
        const businessTripsContainer = document.querySelector(".business_trips-page_main-content-widget_container");
        const businessTripsStatusContainer = document.querySelector(".business_trips-page_main-content_title_search-extend_input-status-values");
        const businessTripsStaffContainer = document.querySelector(".business_trips-page_main-content_title_search-extend_input-staff-values");
        const businessTripsSearchButton = document.querySelector(".business_trips-search");
        const businessTripsFilterClear = document.querySelector(".business_trips-reset");
        const businessTripsPaginator = document.querySelector(".business_trips-page_main-content_paginator");

        refresh && refreshContainers([businessTripsContainer], "personnel-events-widget_item");
        refresh && refreshContainers([businessTripsStatusContainer]);
        refresh && refreshContainers([businessTripsStaffContainer]);
        userDataManager.businessTrips.slice(0, 3).forEach(item => {
            const [startDay, startMonth, startYear] = item.start_date ? item.start_date.split(".") : ["", "", ""];
            const [endDay, endMonth, endYear] = item.end_date ? item.end_date.split(".") : ["", "", ""];
            let elementData: blockConstructor;
            try {
                elementData = {
                    titleClass: "item-header",
                    titleContent: `${startDay} ${monthReference[startMonth.replace("0", "")].toLowerCase()} - ${endDay} ${monthReference[endMonth.replace("0", "")].toLowerCase()}`,
                    iconClass: "item-icon-container",
                    iconContent: svgToTypeReference[item.item_type],
                    extraContentClass: "item-shortand",
                    extraContent: issueCodeToNameReference["business_trips"],
                    status: item.status,
                    link: item.link
                };
            } catch (e) {
                elementData = {
                    titleClass: "item-header",
                    titleContent: `${startDay} ${monthReference[startMonth.replace("0", "")]} - ${endDay} ${monthReference[endMonth.replace("0", "")]}`,
                    iconClass: "item-icon-container",
                    iconContent: svgToTypeReference[item.item_type],
                    extraContentClass: "item-shortand",
                    extraContent: issueCodeToNameReference["business_trips"],
                    status: item.status,
                    link: item.link
                };
            }
            const newIssueContent = this.documentTemplate.content.cloneNode(true);
            const newIssueElement = newIssueContent.querySelector(".personnel-events-widget_item");
            this.renderComponent(businessTripsContainer, newIssueElement, false, elementData);
        });

        for (let status of systemDataManager.statuses) {
            const newStatusItem = this.createComponent("div", "input-status-values_item search-item");
            newStatusItem.dataset.statusCode = status.data.code;
            newStatusItem.textContent = status.data.name;
            newStatusItem.addEventListener("click", () => {
                handleStatusChoice(newStatusItem)
            });
            this.renderComponent(businessTripsStatusContainer, newStatusItem);
        };

        for (let staff of systemDataManager.allStaff) {
            const newStaffItem = this.createComponent("div", "input-status-values_item search-item");

            newStaffItem.dataset.staffId = staff.id;
            newStaffItem.textContent = staff.data.__name;
            newStaffItem.addEventListener("click", () => {
                handleStaffChoice(newStaffItem)
            });

            this.renderComponent(businessTripsStaffContainer, newStaffItem);
        };

        if (Context.data.cities_json) {
            const businessTripsCitiesContainer = document.querySelector(".business_trips-page_main-content_title_search-extend_input-city-values");
            const allCities: { id: string, name: string }[] = JSON.parse(Context.data.cities_json);

            refresh && refreshContainers([businessTripsCitiesContainer]);

            for (let city of allCities) {
                const newCityItem = this.createComponent("div", "input-status-values_item search-item");
                newCityItem.dataset.cityId = city.id;
                newCityItem.textContent = city.name;
                newCityItem.addEventListener("click", () => {
                    handleCityChoice(newCityItem)
                });

                this.renderComponent(businessTripsCitiesContainer, newCityItem);
            };
        } else {
            const citiesFilter = document.querySelector(".business_trips-page_main-content_title_search-extend_input-city").closest(".common-content_title_search-extend_item");
            if (citiesFilter && !citiesFilter.classList.contains("hidden")) {
                citiesFilter.classList.add("hidden");
            };
        };

        if (!Context.data.event_listeners_set) {
            businessTripsSearchButton.addEventListener("click", () => {
                this.paginator.setPaginator(businessTripsPaginator, chunkType.BUSINESS_TRIPS);
                const closeFiltersButton = businessTripsSearchButton.closest(".common-content_title_search-extend").querySelector(".common-content_title_search-extend_title-img");
                closeFiltersButton.click();
            });

            businessTripsFilterClear.addEventListener("click", () => {
                userStorageManager.clearFilters(businessTripsFilterClear.dataset.reset);
                const closeFiltersButton = businessTripsFilterClear.closest(".common-content_title_search-extend").querySelector(".common-content_title_search-extend_title-img");
                closeFiltersButton.click();
            });

            //ивент лисенер на обычный поиск
            this.handleSearch("business_trips");
        }

        if (this.paginator.businessTripsChunks && this.paginator.businessTripsChunks.globalData.length > 0) {
            this.paginator.setPaginator(businessTripsPaginator, chunkType.BUSINESS_TRIPS);
        };

        !refresh && this.handleLoader(LoaderType.BUSINESS_TRIPS);
    };

    renderVacationsSection(refresh = false) {
        const vacationsContainer = document.querySelector(".vacations-page_main-content-widget_container");
        const vacationsStaffContainer = document.querySelector(".vacations-page_main-content_title_search-extend_input-staff-values");
        const vacationsPaginator = document.querySelector(".vacations-page_main-content_paginator");
        const vacationsSearchButton = document.querySelector(".vacations-search");
        const vacationsFilterClearButton = document.querySelector(".vacations-reset")
        refresh && refreshContainers([vacationsStaffContainer]);

        for (let staff of systemDataManager.allStaff) {
            const newStaffItem = this.createComponent("div", "input-status-values_item search-item");

            newStaffItem.dataset.staffId = staff.id;
            newStaffItem.textContent = staff.data.__name;
            newStaffItem.addEventListener("click", () => {
                handleStaffChoice(newStaffItem)
            });

            this.renderComponent(vacationsStaffContainer, newStaffItem);
        };

        refresh && refreshContainers([vacationsContainer], "personnel-events-widget_item");
        userDataManager.vacations.filter(f => f.status_code !== "completed").slice(0, 3).forEach(item => {
            const [startDay, startMonth, startYear] = item.start_date ? item.start_date.split(".") : ["", "", ""];
            const [endDay, endMonth, endYear] = item.end_date ? item.end_date.split(".") : ["", "", ""];
            let elementData: blockConstructor;
            try {
                elementData = {
                    titleClass: "item-header",
                    titleContent: `${startDay} ${monthReference[startMonth.replace("0", "")].toLowerCase()} - ${endDay} ${monthReference[endMonth.replace("0", "")].toLowerCase()}`,
                    iconClass: "item-icon-container",
                    iconContent: svgToTypeReference[item.item_type],
                    extraContentClass: "item-shortand",
                    extraContent: issueCodeToNameReference["holidays"],
                    status: item.status,
                    link: item.link
                };
            } catch (e) {
                elementData = {
                    titleClass: "item-header",
                    titleContent: `${startDay} ${monthReference[startMonth.replace("0", "")]} - ${endDay} ${monthReference[endMonth.replace("0", "")]}`,
                    iconClass: "item-icon-container",
                    iconContent: svgToTypeReference[item.item_type],
                    extraContentClass: "item-shortand",
                    extraContent: issueCodeToNameReference["holidays"],
                    status: item.status,
                    link: item.link
                };
            }
            const newIssueContent = this.documentTemplate.content.cloneNode(true);
            const newIssueElement = newIssueContent.querySelector(".personnel-events-widget_item");
            this.renderComponent(vacationsContainer, newIssueElement, false, elementData);
        });

        if (!Context.data.event_listeners_set) {
            vacationsSearchButton.addEventListener("click", () => {
                this.paginator.setPaginator(vacationsPaginator, chunkType.VACATIONS);
                const closeFiltersButton = vacationsSearchButton.closest(".common-content_title_search-extend").querySelector(".common-content_title_search-extend_title-img");
                closeFiltersButton.click();
            });

            vacationsFilterClearButton.addEventListener("click", () => {
                userStorageManager.clearFilters(vacationsFilterClearButton.dataset.reset);
                const closeFiltersButton = vacationsFilterClearButton.closest(".common-content_title_search-extend").querySelector(".common-content_title_search-extend_title-img");
                closeFiltersButton.click();
            });

            //ивент лисенер на обычный поиск
            this.handleSearch("vacations");

            const vacationRestLink = document.querySelector(".vacations-page_main-content_title-button");

            vacationRestLink.href = `${window.location.href}(p:item/kedo/staff/${userDataManager.staff.id})`;
            vacationRestLink.addEventListener("click", () => {
                const waitForMenuItem = window.setInterval(() => {
                    const vacationRestTabContent = document.querySelector(".vacation-rest");

                    if (!vacationRestTabContent) {
                        return;
                    };

                    const tabLabel = vacationRestTabContent.getAttribute("aria-labelledby");

                    window.setTimeout(() => {
                        const vacationsRestTab = document.querySelector(`#${tabLabel}`);

                        if (!vacationsRestTab) {
                            return;
                        };

                        window.clearInterval(waitForMenuItem);
                        vacationsRestTab.click();
                    }, 1000)

                }, 300);
            });
        };

        if (this.paginator.vacationsChunks && this.paginator.vacationsChunks.globalData.length > 0) {
            this.paginator.setPaginator(vacationsPaginator, chunkType.VACATIONS);
        };

        !refresh && this.handleLoader(LoaderType.VACATIONS);
    };

    renderDocumentSection(refresh = false) {
        const docsStatusContainer = document.querySelector(".documents-page_main-content_title_search-extend_input-status-values");
        const documentsSearchButton = document.querySelector(".documents-search");
        const documentsFilterClearButton = document.querySelector(".documents-reset");
        const documentsPaginator = document.querySelector(".documents-page_main-content_paginator");
        const docsFilterButtons = document.querySelectorAll(".documents-page_main-content_title-left .documents-page_main-content_title_tab");
        const docsFilterButtonsMobile = document.querySelectorAll(".documents-page_main-content_mobile_footer-item:not(.mobile-docs-expand)");
        const restElements = document.querySelectorAll(".documents-page_main-content_title_tab");

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

            this.handleSearch("documents");
        };

        if (this.paginator.personnelDocumentsChunks && this.paginator.personnelDocumentsChunks.globalData.length > 0) {
            this.paginator.setPaginator(documentsPaginator, chunkType.PERSONAL);
        };

        !refresh && this.handleLoader(LoaderType.DOCUMENTS);
    };

    renderTasksSection(refresh = false) {
        const authorsContainer = document.querySelector(".tasks-page_main-content_title_search-extend_input-author-values");
        const authorsContainerMobile = document.querySelector(".tasks-page_main-content_title_search-extend.mobile .tasks-page_main-content_title_search-extend_input-author-values");

        refresh && refreshContainers([authorsContainer]);

        for (let user of systemDataManager.users) {
            const newAuthorItem = this.createComponent("div", "input-author-values_item search-item");
            const newAuthorItemMobile = this.createComponent("div", "input-author-values_item search-item");
            newAuthorItem.textContent = user.data.__name;
            newAuthorItem.dataset.userId = user.id;
            newAuthorItem.addEventListener("click", () => {
                handleAuthorChoice(newAuthorItem)
            });

            this.renderComponent(authorsContainer, newAuthorItem);
            this.renderComponent(authorsContainerMobile, newAuthorItemMobile);
        };

        const taskSearchButton = document.querySelector(".tasks-search");
        const taskSearchButtonMobile = document.querySelector(".tasks-page_main-content_mobile-header .tasks-search");
        const tasksFilterClearButton = document.querySelector(".tasks-reset");
        const tasksFilterClearButtonMobile = document.querySelector(".tasks-page_main-content_mobile-header .tasks-reset");
        const tasksPaginator = document.querySelector(".tasks-page_main-content_paginator");

        this.tasksPaginator = tasksPaginator;

        if (!Context.data.event_listeners_set) {
            [taskSearchButton, taskSearchButtonMobile].forEach((node: any) => node.addEventListener("click", () => {
                this.paginator.setPaginator(tasksPaginator, tasksPaginator.dataset.dataType);
                const tasksHeader = node.closest(".tasks-page_main-content_mobile-header_search") || node.closest(".tasks-page_main-content_title_search-extend_title");
                const closeFiltersButton = tasksHeader.querySelector(".tasks-page_main-content_title_search-extend_title-img") || tasksHeader.querySelector(".tasks-page_main-content_mobile-header_search-extend")
                closeFiltersButton.click();
            }));

            [tasksFilterClearButton, tasksFilterClearButtonMobile].forEach((node: any) => node.addEventListener("click", () => {
                userStorageManager.clearFilters(node.dataset.reset);
                const tasksHeader = node.closest(".tasks-page_main-content_mobile-header_search") || node.closest(".tasks-page_main-content_title_search-extend_title");
                const closeFiltersButton = tasksHeader.querySelector(".tasks-page_main-content_title_search-extend_title-img") || tasksHeader.querySelector(".tasks-page_main-content_mobile-header_search-extend");
                closeFiltersButton.click();
            }));

            //ивент лисенер на обычный поиск
            this.handleSearch("tasks");

            // let extendedSearch = document.querySelector(".common-content_title_search-extend");
            // extendedSearch.addEventListener("click", () => {
            //     const calendar = document.querySelectorAll(".vanilla-calendar_default");
            //     calendar.forEach((item: any) => {
            //         if (!item.classList.contains("hidden")) {
            //             item.classList.toggle("hidden");
            //         }
            //     }
            // });
        }

        if (this.paginator.actualTasksChunks && this.paginator.actualTasksChunks.globalData.length > 0) {
            this.paginator.setPaginator(tasksPaginator, chunkType.ACTUAL_TASKS);
        };

        !refresh && this.handleLoader(LoaderType.TASKS)

        if (!Context.data.event_listeners_set) {
            const tasksFilterButtons = document.querySelectorAll(".tasks-page_main-content_title_tab:not(.tasks-search):not(.tasks-reset)");
            const mobileFilterButtons = document.querySelectorAll(".tasks-page_main-content_mobile_footer-item:not(.mobile-tasks-expand)");
            const restListElements = document.querySelectorAll(".task-list-type");
            const restGlobalElements = document.querySelectorAll(".tasks-page_main-content_title_tab:not(.task-list-type)");

            tasksFilterButtons.forEach((button: any) => {
                button.addEventListener("click", () => {
                    if (button.classList.contains("subordinate-switch")) {
                        handleGlobalTasks(button);
                        handleSubordinateSwitch();
                        this.paginator.handlePageChange(button, restGlobalElements);
                        return;
                    };
                    if (button.classList.contains("task-list-type")) {
                        this.paginator.handlePageChange(button, restListElements);
                    } else {
                        handleGlobalTasks(button);
                        if (!this.paginator.subordinatePath.classList.contains("hidden")) {
                            this.paginator.handleSubordinatePath();
                        };
                        this.paginator.handlePageChange(button, restGlobalElements);
                    };
                    this.paginator.setPaginator(tasksPaginator, button.dataset.dataType);
                });
            });

            mobileFilterButtons.forEach((button: any) => {
                button.addEventListener("click", () => {
                    if (button.classList.contains("subordinate-switch")) {
                        handleSubordinateSwitch();
                        this.paginator.handlePageChange(button);
                        expandMobileTasks();
                        handleTasksTitle(button);
                        return;
                    } else {
                        if (!this.paginator.subordinatePath.classList.contains("hidden")) {
                            this.paginator.handleSubordinatePath();
                        };
                        this.paginator.handlePageChange(button);
                    };
                    expandMobileTasks();
                    this.paginator.setPaginator(tasksPaginator, button.dataset.dataType);
                });
            });
        };

        if (this.paginator.subordinateTasksChunks.length > 0) {
            renderSubordinateTasks();
        };

        this.setCounter();
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

    setCounter() {
        const tasksCounter = document.querySelector(".left-menu_item[data-menu-item='tasks'] .left-menu_item-counter");
        const tasksCount = [].concat.apply([], [...paginator.actualTasksChunks.globalData].map(item => [...item.data])).length;
        tasksCounter.textContent = tasksCount;
    };

    /**
   * Проверяет роль пользователя, для внутреннего открывает компоненты с классом .chief-component
   */
    handleUserAccess() {
        const portalLink = this.headerPortalButton.component.querySelector(".portal_header-link");
        const chiefComponents = document.querySelectorAll(".chief-component");

        if (userDataManager.isInnerUser) {
            chiefComponents.forEach((item: any) => item.classList.remove("hidden"));
        } else if (portalLink) {
            portalLink.classList.add("hidden");
        };
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
                console.log(searchExtend.value);

                if (searchExtend.value === "") {
                    let resetButton = document.querySelector(`.${firstClassWord}-reset`);
                    userStorageManager.clearFilters(resetButton.dataset.reset);    
                }
            })
        }
    }

    /**
   * Присваивает DOM-элементы в экземпляр класса
   *
   * @param components строка или массив типа Element, в случае передачи строки и при наличии параметра propName - присваивает в экземепляр класса переданный элемент, в случае передачи массива типа Element - пушит в this.uploadableComponents
   * @param propName название свойства экземпляра класса
   */
    setComponent(components: any, propName?: string): void {
        if (typeof (components) == "string" && propName) {
            const newComponent = document.querySelector(propName);
            this[components as domKey] = {
                cls: newComponent.className,
                component: newComponent
            };
            return;
        };

        if (Array.isArray(components)) {
            this.uploadableComponents.push(...components.map(component => {
                return {
                    cls: component.className,
                    component
                }
            }));
            return;
        };
        this.uploadableComponents.push({ cls: components.className, component: components });
    };

    /**
   * Используется для загрузки вёрстки из сторонних файлов (в данный момент - только template-компонентов)
   *
   * @param componentName название файла, без расширения .html
   * @param template признак, что метод используется для загрузки template-компонентов (в случае с ними немного отличается логика)
   */
    async getComponent(componentName: string, template = false): Promise<any> {
        if (template) {
            return this.parser.parseFromString(await fetch(`${filePath}/components/${componentName}.html`).then(res => res.text()), "text/html").head;
        };
        // return this.parser.parseFromString(await fetch(`${filePath}/components/${fileName}.html`).then(res => res.text()), "text/html").body.firstChild;
        return document.querySelector(`.${componentName}`);
    };

    /**
   * Первичная инициализация страницы: ожидание загрузки DOM-дерева, навешивание триггеров на статичные элементы

   */
    async initPage() {
        const waitForComponents = window.setInterval(async () => {
            const headerContent = document.querySelector(".portal_header");
            const leftMenuContent = document.querySelector(".main-page_left-menu");
            const leftMenuWrapperContent = document.querySelector(".main-page_left-menu-wrapper");
            const mainVacationContent = document.querySelector(".main-page_vacation-widget");
            const servicesWidgetContent = document.querySelector(".main-page_services-widget");
            const personnelEventsContent = document.querySelector(".main-page_personnel-events-widget");
            const issuesWidgetContent = document.querySelector(".main-page_issues-widget");
            const mobileFooterContent = document.querySelector(".main-page_mobile-footer");
            const tasksContent = document.querySelector(".tasks-page_main-content");
            const tasksHeaderContent = document.querySelector(".tasks-page_main-content_mobile-header");
            const documentsContent = document.querySelector(".documents-page_main-content");
            const servicesContent = document.querySelector(".services-page_main-content");
            const businessTripsContent = document.querySelector(".business_trips-page_main-content");
            const vacationsContent = document.querySelector(".vacations-page_main-content");
            const myProfileContent = document.querySelector(".my-profile-page_main-content");
            const templates = await this.getComponent("templates", true);

            if (
                ![
                    headerContent,
                    leftMenuContent,
                    leftMenuWrapperContent,
                    mainVacationContent,
                    servicesWidgetContent,
                    personnelEventsContent,
                    issuesWidgetContent,
                    mobileFooterContent,
                    tasksContent,
                    tasksHeaderContent,
                    documentsContent,
                    servicesContent,
                    businessTripsContent,
                    vacationsContent,
                    myProfileContent,
                    templates
                ].every(item => item)
            ) {
                return;
            };

            window.clearInterval(waitForComponents)

            this.setComponent([
                leftMenuContent,
                leftMenuWrapperContent,
                mainVacationContent,
                servicesWidgetContent,
                personnelEventsContent,
                issuesWidgetContent,
                mobileFooterContent,
                tasksContent,
                tasksHeaderContent,
                documentsContent,
                servicesContent,
                businessTripsContent,
                vacationsContent,
                myProfileContent,
            ]);

            const userInfoTemplateContent = templates.querySelector(".left-menu_user-info_template").content.cloneNode(true);
            this.userInfoTemplateContent = userInfoTemplateContent.querySelector(".left-menu_user-info")

            // this.renderComponent(this.headerContainerComponent!.component, headerContent);
            // this.renderComponent(this.portalContentComponent!.component, leftMenuContent, true);
            // this.renderComponent(this.mainMenuContentContainerComponent!.component, [mainVacationContent, servicesWidgetContent, personnelEventsContent, issuesWidgetContent]);
            // this.renderComponent(this.mainMenuContainerComponent!.component, tasksContent);
            // this.renderComponent(this.mainMenuContainerComponent!.component, tasksHeaderContent);
            // this.renderComponent(this.mainMenuContainerComponent!.component, documentsContent);
            // this.renderComponent(this.mainMenuContainerComponent!.component, servicesContent);
            // this.renderComponent(this.mainMenuContainerComponent!.component, businessTripsContent);
            // this.renderComponent(this.mainMenuContainerComponent!.component, vacationsContent);
            // this.renderComponent(this.mainMenuContainerComponent!.component, myProfileContent);
            // this.renderComponent(this.mainMenuContainerComponent!.component, mobileFooterContent);
            this.renderComponent(this.root!.component, templates);

            this.setComponent("headerPortalButton", ".portal_header-switch");

            this.templates = templates;

            const leftMenuItemTemplate = this.templates.querySelector(".left-menu_item-template");
            defaultMenuItems.forEach(item => {
                const newItemContent = leftMenuItemTemplate.content.cloneNode(true);
                const newItem = newItemContent.querySelector(".left-menu_item");
                const newItemIcon = newItem.querySelector(".left-menu_item-icon");
                const newItemLabel = newItem.querySelector(".left-menu_item-label_text");
                newItem.dataset.menuItem = item.widget_name;
                newItem.addEventListener("click", () => {
                    setActive(newItem, true)
                });

                if (item.widget_name === "main") {
                    newItem.classList.add("active");
                    const mobileMain = document.querySelector(".main-page_mobile-footer_buttons-container_button[data-menu-item='main']");

                    if (mobileMain) {
                        mobileMain.classList.toggle("active");
                    };
                };

                this.changeElement(newItemIcon, svgToTypeReference[item.type], false, "left-menu_icon-svg");
                this.changeElement(newItemLabel, item.name, true);
                leftMenuWrapperContent.append(newItem);
            });

            const allPersonnelDocsButton = document.querySelector(".main-page_personnel-events-widget_container_expand-link");
            const allIssuesDocsButton = document.querySelector(".main-page_issues-widget_container_expand-link");
            const allIssuesButton = document.querySelector(".main-page_services-widget_container_expand-link");
            const personnelEventsMenuItem = document.querySelector("[data-menu-item='documents']");
            const personnelEventsMenuItemMobile = document.querySelector(".main-page_mobile-footer_buttons-container_button[data-menu-item='documents']");
            const allServicesMenuItem = document.querySelector("[data-menu-item='services']");
            const allServicesMenuItemMobile = document.querySelector(".main-page_mobile-footer_buttons-container_button[data-menu-item='services']");

            [allIssuesDocsButton, allPersonnelDocsButton].forEach((button: any) => {
                button.addEventListener("click", () => {
                    window.screen.width >= 450 ? personnelEventsMenuItem.click() : personnelEventsMenuItemMobile.click();
                });
            });

            allIssuesButton.addEventListener("click", () => {
                window.screen.width >= 450 ? allServicesMenuItem.click() : allServicesMenuItemMobile.click();
            });

            const newVacationMainButton = document.querySelector(".info-row_plan-link");
            const newVacationPageButton = document.querySelector(".vacations-page_main-content_add-item");
            const newBusinessTripButton = document.querySelector(".business_trips-page_main-content_add-item");

            [newVacationMainButton, newVacationPageButton].forEach((node: any) => {
                node.href = `${window.location.href}(p:item/absences/vacations)`;
            });

            newBusinessTripButton.href = `${window.location.href}(p:item/business_trips/businesstrip_requests)`;

            this.renderServices();
            this.handleUserAccess();

            this.domLoaded = true;
        }, 300)
    };

    /**
   * Отрисовка избранных сервисов
   *
   * @param refresh признак, что необходимо обновление контейнера при обновлении страницы
   */
    renderFavorites(refresh = false) {
        const servicesWidgetContent = this.uploadableComponents.find(item => item.cls === "main-page_services-widget")!.component;
        const servicesContainer = servicesWidgetContent.querySelector(".main-page_services-widget_container");
        const favoriteServicesContainer = document.querySelector(".services-page_main-content_favorites_choice");
        refresh && refreshContainers([favoriteServicesContainer, servicesContainer])

        const serviceTemplate = this.templates.querySelector(".services-widget_item-template");
        const favoriteServiceTemplate = this.templates.querySelector(".favorite_services-widget_item-template");
        const services = this.userManager.getServices();

        services.forEach(service => {
            if (service.code) {
                const fixedLink = document.querySelector(`.fixed-vacations .${service.code}-vacation`);
                const fixedFavoriteLink = favoriteServiceTemplate.content.cloneNode(true);
                const favoriteServiceName = fixedFavoriteLink.querySelector(".services-widget_item-label");
                const fixedFavoriteItem = fixedFavoriteLink.querySelector(".services-widget_item")
                fixedFavoriteItem.dataset["service_code"] = service.code;
                favoriteServiceName.textContent = service.name;

                const deleteServiceButton = fixedFavoriteLink.querySelector(".favorite-services-widget_item_delete");
                deleteServiceButton.addEventListener("click", () => {
                    userStorageManager.deleteService(fixedFavoriteItem)
                });

                if (fixedLink) {
                    this.renderComponent(servicesContainer, fixedLink);
                    this.renderComponent(favoriteServicesContainer, fixedFavoriteLink);
                    return;
                };
            };

            const newService = serviceTemplate.content.cloneNode(true);
            const newFavoriteService = favoriteServiceTemplate.content.cloneNode(true);
            const serviceNameNode = newService.querySelector(".services-widget_item-label");
            const favoriteServiceNameNode = newFavoriteService.querySelector(".services-widget_item-label");
            const serviceContainer = newService.querySelector(".services-widget_item");
            const deleteServiceButton = newFavoriteService.querySelector(".favorite-services-widget_item_delete");
            const favoriteServiceContainer = newFavoriteService.querySelector(".services-widget_item");
            serviceContainer.dataset["service_code"] = service.code;
            favoriteServiceContainer.dataset["service_code"] = service.code;
            serviceNameNode.textContent = service.name;
            favoriteServiceNameNode.textContent = service.name;
            // serviceContainer.href = `${window.location.href}${service.link}`;
            serviceContainer.href = service.link;

            deleteServiceButton.addEventListener("click", () => {
                userStorageManager.deleteService(favoriteServiceContainer)
            });

            this.renderComponent(servicesContainer, serviceContainer);
            this.renderComponent(favoriteServicesContainer, favoriteServiceContainer);
        });

        if (userStorageManager.servicesCount > 5) {
            const saveServicesButton = document.querySelector(".services-save-button");
            saveServicesButton.classList.toggle("blocked");
        };
    };

    /**
   * Отрисовка заявок
   */
    renderServices() {
        this.renderFavorites()
        Context.data.all_setvices_set = true;
        const newIssuesContainer = this.headerContainerComponent!.component.querySelector(".portal_new-issue_container");
        const issueItemTemplate = this.templates.querySelector(".new-issue_container_item-template");
        const issueListItemTemplate = this.templates.querySelector(".new-issue_container_item-list-template");
        const mobileIssueContainerTemplate = this.templates.querySelector(".mobile-menu_new-issue_container-section_template");
        const mobileIssueItemTemplate = this.templates.querySelector(".mobile-menu_new-issue_container-item_template");
        const mobileServicesContainer = document.querySelector(".main-page_mobile-footer_services");
        const favoriteServicesChoiceContainer = document.querySelector(".services-page_main-content_choices-content");
        const favoriteServiceColumnTemplate = document.querySelector(".favorite-services_choice_column_template");
        const favoriteServiceItemTemplate = document.querySelector(".favorite-services_choice_column-item_template");
        const allServicesContainer = document.querySelector(".services-page_main-content_all-services");

        defaultIssues.forEach(issue => {
            const newIssueItemContent = issueItemTemplate.content.cloneNode(true);
            const mobileIssueContainerContent = mobileIssueContainerTemplate.content.cloneNode(true);
            const mobileIssueContainerItem = mobileIssueContainerContent.querySelector(".mobile-menu_new-issue_container-section");
            const mobileIssueContainerItemLabel = mobileIssueContainerItem.querySelector(".mobile-menu_new-issue_container-section_label");
            const newIssueItem = newIssueItemContent.querySelector(".new-issue_container_item");
            const newIssueLabel = newIssueItem.querySelector(".new-issue_container_item_label-text");
            const newColumnLabelContent = favoriteServiceColumnTemplate.content.cloneNode(true);
            const newAllServicesColumnContent = favoriteServiceColumnTemplate.content.cloneNode(true);
            const newAllServicesColumnItem = newAllServicesColumnContent.querySelector(".favorite-services_choice_column");
            const newAllServicesColumnLabel = newAllServicesColumnItem.querySelector("h4");
            const newColumnLabelItem = newColumnLabelContent.querySelector(".favorite-services_choice_column");
            const newColumnLabel = newColumnLabelItem.querySelector("h4");

            newColumnLabel.textContent = issue.name;
            newAllServicesColumnLabel.textContent = issue.name;

            [mobileIssueContainerItemLabel, newIssueLabel].forEach(item => this.changeElement(item, issue.name, true));

            if (issue.expandable && issue.issues) {
                newIssueItem.classList.add("expandable");
                newIssueItem.addEventListener("mouseenter", () => {
                    handleIssueExpand(newIssueItem);
                });
                newIssueItem.addEventListener("mouseleave", () => {
                    handleIssueExpand(newIssueItem);
                });
                const issueListItemContainer = this.createComponent("div", "portal-new-issue_container_item-issues");
                issueListItemContainer.classList.add("hidden");

                issue.issues.forEach(listIssue => {
                    if (listIssue.code && issue.issue_type === "vacation") {
                        const fixedIssue = document.querySelector(`.fixed-vacations .${listIssue.code}-issue`);
                        const mobileIssue = document.querySelector(`.fixed-vacations .${listIssue.code}-footer-issue`);
                        const fixedAllServicesItem = document.querySelector(`.fixed-vacations .${listIssue.code}-issue-all`);
                        const favoriteIssueContent = favoriteServiceItemTemplate.content.cloneNode(true);
                        const favoriteIssueItem = favoriteIssueContent.querySelector(".favorite-services_choice_column-item");
                        const favoriteIssueLabel = favoriteIssueContent.querySelector(".favorite-services_choice_column-item_label");

                        favoriteIssueItem.dataset["service_code"] = listIssue.code;
                        favoriteIssueLabel.textContent = listIssue.name;
                        this.renderComponent(newColumnLabelItem, favoriteIssueContent);

                        if (fixedIssue) {
                            this.renderComponent(mobileIssueContainerItem, mobileIssue);
                            this.renderComponent(newAllServicesColumnItem, fixedAllServicesItem);
                            this.renderComponent(issueListItemContainer, fixedIssue);
                            return;
                        };
                    };

                    const allServicesIssueContent = issueListItemTemplate.content.cloneNode(true);
                    const allServicesIssueItem = allServicesIssueContent.querySelector(".new-issue_container_item-list");
                    const allServicesIssueItemLabel = allServicesIssueContent.querySelector(".new-issue_container_item_list-label-text");
                    const allServicesIssueItemIconContainer = allServicesIssueItem.querySelector(".new-issue_container_item_list-icon");
                    const favoriteIssueContent = favoriteServiceItemTemplate.content.cloneNode(true);
                    const favoriteIssueLabel = favoriteIssueContent.querySelector(".favorite-services_choice_column-item_label");
                    const favoriteIssueItem = favoriteIssueContent.querySelector(".favorite-services_choice_column-item");
                    const newIssueListItemContent = issueListItemTemplate.content.cloneNode(true);
                    const mobileIssueItemContent = mobileIssueItemTemplate.content.cloneNode(true);
                    const mobileIssueItem = mobileIssueItemContent.querySelector(".mobile-menu_new-issue_container-item");
                    const mobileIssueLabel = mobileIssueItemContent.querySelector(".mobile-menu_new-issue_container-item_label");
                    const mobileIssueIcon = mobileIssueItemContent.querySelector(".mobile-menu_new-issue_container-item_icon");
                    const newIssueListItem = newIssueListItemContent.querySelector(".new-issue_container_item-list");
                    const newIssueListItemLabel = newIssueListItemContent.querySelector(".new-issue_container_item_list-label-text");
                    const newIssueListItemIconContainer = newIssueListItemContent.querySelector(".new-issue_container_item_list-icon");


                    favoriteIssueLabel.textContent = listIssue.name;
                    newIssueListItem.href = listIssue.link;
                    newIssueListItem.dataset["service_code"] = listIssue.code;
                    allServicesIssueItem.href = listIssue.link;
                    allServicesIssueItem.dataset["service_code"] = listIssue.code;
                    favoriteIssueItem.dataset["service_code"] = listIssue.code;
                    mobileIssueItem.href = listIssue.link;

                    if (issue.issue_type !== "vacation") {
                        newIssueListItemIconContainer.classList.add("path-svg");
                        mobileIssueIcon.classList.add("path-svg");
                    };
                    [newIssueListItemIconContainer, mobileIssueIcon, allServicesIssueItemIconContainer].forEach(item => this.changeElement(item, svgToTypeReference[issue.issue_type!]));
                    [newIssueListItemLabel, mobileIssueLabel, allServicesIssueItemLabel].forEach(item => this.changeElement(item, listIssue.name, true));
                    this.renderComponent(newColumnLabelItem, favoriteIssueContent);
                    this.renderComponent(issueListItemContainer, newIssueListItem);
                    this.renderComponent(newAllServicesColumnItem, allServicesIssueItem);
                    this.renderComponent(mobileIssueContainerItem, mobileIssueItem);
                });
                this.renderComponent(newIssueItem, issueListItemContainer);
                this.renderComponent(mobileServicesContainer, mobileIssueContainerItem);
                this.renderComponent(allServicesContainer, newAllServicesColumnItem);
            } else {
                mobileIssueContainerItem.href = issue.link;
                newIssueItem.href = issue.link;
            };

            this.renderComponent(favoriteServicesChoiceContainer, newColumnLabelItem);
            this.renderComponent(newIssuesContainer, newIssueItem);
        });

        const saveServicesButton = document.querySelector(".services-save-button");
        userStorageManager.setTempServices();

        if (userStorageManager.servicesCount > 5) {
            saveServicesButton.classList.toggle("blocked");
        };
        saveServicesButton.addEventListener("click", () => {
            userStorageManager.addServices();
            closeServices();
        });

        this.handleLoader(LoaderType.SERVICES)
    }

    /**
   * Метод для ожидания загрузки основных элементов в DOM-дерево
   */
    async waitForComponents() {
        return new Promise<void>((resolve, reject) => {
            const waitForDom = window.setInterval(() => {
                this.setComponent("headerContainerComponent", ".header-container")
                this.setComponent("mainMenuContentContainerComponent", ".main-page_main-content");
                this.setComponent("mainMenuContainerComponent", ".main-page");
                this.setComponent("portalContentComponent", ".portal-content");
                this.setComponent("root", ".portal-container");
                this.setComponent("loader", ".kedo-loader-wrapper");

                if (
                    [
                        this.portalContentComponent,
                        this.headerContainerComponent,
                        this.mainMenuContainerComponent,
                        this.mainMenuContentContainerComponent,
                        this.root,
                        this.loader
                    ].every(item => item)
                ) {
                    window.clearInterval(waitForDom);
                    resolve(this.initPage());
                };
            }, 200);
        });
    };

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

    /**
     * Метод для изменения DOM-элемента
     * @param element элемент для изменения
     * @param content контент для вставки в редактируемый элемент (DOM-элемент или строка в случае textContent = true)
     * @param textContent признак, что вставляемый контент имеет строчный тип
     * @param className присваивает класс для корневого элемента element
     */
    changeElement(element: any, content: any, textContent = false, className?: string) {
        textContent ? element.textContent = content : element.innerHTML = content;

        if (className) {
            element.firstChild.classList ? element.firstChild.classList.add(className) : element.className = className
        };
    };

    /**
     * Метод для добавления/удаления класса .hidden для элемента
     * @param element DOM-элемент
     */
    handleHiddenElement(element: any) {
        element.classList.toggle("hidden");
    };

    /**
     * Метод для редиректа
     * @param location новый адрес
     */
    setLocation(location: string) {
        window.location = location;
    };
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
        if (!window.localStorage.getItem("favorite_services")) {
            this.setDefaultServices(true);
        };
        this.favoriteServices = JSON.parse(window.localStorage.getItem("favorite_services")).services;;
        this.servicesCount = this.favoriteServices.length;
        this.baseUrl = System.getBaseUrl();
    };

    baseUrl: string;
    tasksFilter: tasksFilter | undefined;
    documentsFilter: documentsFilter | undefined;
    businessTripsFilter: businessTripsFilter | undefined;
    vacationsFilter: vacationsFilter | undefined;
    servicesCount: number;
    favoriteServices: service[];

    getServices() {
        return this.favoriteServices
    };

    /**
     * Управляет визуальным отображением галочек с выбранными сервисами
     */
    setTempServices() {
        const tempServices = document.querySelectorAll(".services-page_main-content_choices-content .favorite-services_choice_column-item");
        tempServices.forEach((node: any) => {
            if (this.favoriteServices.find(service => service.code === node.dataset["service_code"])) {
                const checkbox = node.querySelector(".favorite-services_choice_column-item_checkbox");
                checkbox.classList.add("selected");
            };
        });
    };

    /**
     * Метод для получения всех уведомлений из ленты пользователя (временно не используется)
     */
    async getNotifications(): Promise<void> {
        const notifications = await fetch(`${window.location.origin}/api/feed/messages/feed/get?limit=10000&offset=0`, {
            method: "POST",
            body: JSON.stringify({
                "ignoreChannels": [],
                "condition": ""
            })
        });
        if (notifications.ok) {
            console.log(await notifications.json());
        };
    };

    /**
     * Парсит DOM, находит выбранные избранные сервисы, и записывает в браузерное хранилище
     */
    addServices() {
        const favoriteServicesContainer = document.querySelector(".services-page_main-content_choices-content");
        const newServices = favoriteServicesContainer.querySelectorAll(".favorite-services_choice_column-item:has(.selected)");
        const favoriteServices: service[] = Array.from(newServices).map((node: any) => {
            const serviceCode = node.dataset["service_code"];
            let referenceService: newIssueConstructor = <newIssueConstructor>{};

            for (let service of defaultIssues) {
                if (!service.issues) {
                    continue;
                };
                const innerService = service.issues.find(s => s.code === serviceCode);

                if (innerService) {
                    referenceService = innerService;
                };
            };

            return <service>{
                name: referenceService.name,
                code: referenceService.code,
                link: referenceService.link
            }
        }).filter(item => item.code);

        this.favoriteServices.push(...favoriteServices.filter(service => this.favoriteServices.map(s => s.code).indexOf(service.code) == -1));
        this.servicesCount = this.favoriteServices.length;
        window.localStorage.setItem("favorite_services", JSON.stringify({
            count: this.servicesCount,
            services: this.favoriteServices
        }));
        domManager.renderFavorites(true);
    };

    /**
     * Удаляет сервисы со страницы
     */
    deleteService(service: any) {
        const favoriteServices = JSON.parse(window.localStorage.getItem("favorite_services"));
        const mainFavoriteServices = document.querySelectorAll(`.main-page_services-widget_container .services-widget_item`);

        for (let node of mainFavoriteServices) {
            if (node.dataset["service_code"] === service.dataset["service_code"]) {
                node.remove()
            };
        };

        favoriteServices.count--;
        favoriteServices.services = favoriteServices.services.filter((item: service) => item.code !== service.dataset["service_code"]);
        window.localStorage.setItem("favorite_services", JSON.stringify(favoriteServices));
        this.favoriteServices = favoriteServices.services;
        const tempServicesCount = Number(window.localStorage.getItem("temp_services_count")) || 0;

        if (tempServicesCount + favoriteServices.count < 5) {
            const saveServicesButton = document.querySelector(".services-save-button");
            saveServicesButton.classList.remove("blocked");
        };
        service.remove();
    };

    /**
     * Очищает фильтры страницы
     * @param filterType тип фильтра
     */
    clearFilters(filterType: FilterType) {
        this[filterType] = undefined;
        let filterNodes: any

        switch (filterType) {
            case FilterType.TASKS:
                filterNodes = window.screen.width >= 450 ? document.querySelectorAll(".task-filter") : document.querySelectorAll(".task-filter-mobile");
                break;
            case FilterType.DOCUMENTS:
                filterNodes = document.querySelectorAll(".documents-filter");
                break;
            case FilterType.BUSINESS_TRIPS:
                filterNodes = document.querySelectorAll(".business_trips-filter");
            case FilterType.VACATIONS:
                filterNodes = document.querySelectorAll(".vacations-filter");
                break;
        };

        filterNodes.forEach((node: any) => {
            node.value = "";
        });
        paginator.setPaginator(paginator.paginator, paginator.dataType);
    };

    serializeFilters(filterType: FilterType) {
        let filterValue: any;
        let filterNodes: any;
        let node: any;

        switch (filterType) {
            case FilterType.TASKS:
                filterNodes = window.screen.width >= 450 ? document.querySelectorAll(".task-filter") : document.querySelectorAll(".task-filter-mobile");

                for (node of Array.from(filterNodes)) {
                    const key = node.dataset.filter;
                    const value = node.value;
                    if (!key || !value) {
                        continue;
                    };
                    switch (key) {
                        case TaskFilterType.DUE_DATE:
                        case TaskFilterType.CREATED_AT:
                            const [day, month, year] = (value as string).split(".");
                            if (![day, month, year].every(item => item) || year.length < 4) {
                                break;
                            };
                            filterValue = new Datetime(`${day}.${month}.${year}`, "DD.MM.YYYY");
                            break;
                        case TaskFilterType.USER_ID:
                            filterValue = node.dataset.userId;
                            break;
                        case TaskFilterType.STATUS:
                            filterValue = node.dataset.statusCode;
                            break;
                        default:
                            filterValue = value;
                            break;
                    };
                    if (filterValue) {
                        if (!this.tasksFilter) {
                            this.tasksFilter = <tasksFilter>{};
                        };
                        this.tasksFilter[key as keyof tasksFilter] = filterValue;
                    } else if (!filterValue && this.tasksFilter && this.tasksFilter![key as keyof tasksFilter]) {
                        delete this.tasksFilter![key as keyof tasksFilter];
                    };
                };
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

    setDefaultServices(setStorageValue = false) {
        const services: service[] = defaultServices.map(service => {
            return {
                name: service.name,
                link: this.parseLink(service),
                code: service.fieldValue ? service.fieldValue.code : service.code
            };
        });
        const favoriteServices = {
            count: 5,
            services
        }
        if (setStorageValue) {
            window.localStorage.setItem("favorite_services", JSON.stringify(favoriteServices));
        };
    };
};

/**
 * Класс, хранящий в себе все данные, относящиеся к текущему пользователю/сотруднику
 * @property user объект типа UserItem, текущий пользователь
 * @property staff объект типа staff (приложение Сотрудники), текущий сотрудник
 * @property organization объект типа organization (приложение Организации), организация сотрудника
 * @property subdivisions объект типа subdivision (приложение Подразделения), подразделение сотрудника
 * @property position объект типа position (приложение Позиции ШР), должность сотрудника
 * @property categories массив объектов типа category, содержит в себе категории сотрудника
 * @property family массив с объектами-информацией о семье сотрудника
 * @property avatarLink ссылка на аватар пользователя
 * @property vacations отпуска в формате objData
 * @property businessTrips командировки в формате objData
 * @property issues заявки в формате objData
 * @property personnelDocuments личные документы в формате objData
 * @property lastDocsForRender последние документы для отрисовки на портале, в формате objData
 * @property tasks массив с задачами пользователя в формате taskData
 * @property systemTasks массив с задачами пользователя в формате ProcessTaskItem
 * @property allUserDocs все документы сотрудника в формате objData
 * @property allStaff массив с объектами типа staff (приложение Сотрудники), все сотрудники
 * @property businessTripsRefs массив с объектами, отношение городов к командировкам
 * @property allDocsLoaded признак того, что все данные загружены
 * @property isInnerUser признак того, что пользователь является внутренним
 * @property isChief признак того, что сотрудник является руководителем подразделения
 */
class UserDataManager {
    constructor() {
        this.vacations = [];
        this.businessTrips = [];
        this.issues = [];
        this.personnelDocuments = [];
        this.allDocsLoaded = false;
        this.lastDocsForRender = [];
        this.tasks = [];
        this.systemTasks = [];
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
    tasks: taskData[];
    systemTasks: ProcessTaskItem[];
    allUserDocs: objData[];
    allStaff: staff[];
    businessTripsRefs: { cityId: string, objId: string }[];
    allDocsLoaded: boolean;
    isInnerUser: boolean;
    isChief: boolean;
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

    async getMenuItems(): Promise<void> {
        const menuItems = await Namespace.storage.getItem("portal_sections");
        let menuItemsJson: menuItem[];

        if (!menuItems) {
            await Namespace.storage.setItem("portal_sections", JSON.stringify(defaultMenuItems));
            this.menuItems = defaultMenuItems;
            return;
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
     * Преобразует задачу к типу taskData
     * @param task объект ProcessTaskItem
     */
    serializeTask(task: ProcessTaskItem): taskData {
        const referenceDoc = task.data.__item ? this.userDataManager.allUserDocs.find(doc => doc.id === task.data.__item.id) : undefined;
        const taskType = task.data.__createdBy.id === this.userDataManager.user.id && task.data.performers && task.data.performers.map(p => p.id).indexOf(this.userDataManager.user.id) == -1 ? TaskType.OUTGOING : TaskType.PERSONAL;
        const author = this.systemDataManager.users.find(user => user.id === task.data.__createdBy.id)!;
        const authorName = author ? this.serializeName(author) : "Не определен";
        let docType = "";

        if (referenceDoc) {
            switch (true) {
                case referenceDoc.name.toLowerCase().includes("заявление"):
                    docType = "Заявление";
                    break;
                case referenceDoc.name.toLowerCase().includes("согласие"):
                    docType = "Согласие";
                    break;
                case referenceDoc.name.toLowerCase().includes("распоряжение"):
                    docType = "Распоряжение";
                    break;
                case referenceDoc.name.toLowerCase().includes("приказ"):
                    docType = "Приказ";
                    break;
                case referenceDoc.name.toLowerCase().includes("уведомлени"):
                    docType = "Уведомление";
                    break;
                case referenceDoc.name.toLowerCase().includes("справк"):
                    docType = "Справка";
                    break;
                case referenceDoc.name.toLowerCase().includes("график"):
                    docType = "График отпусков";
                    break;
            }
        }

        let newTaskObj: taskData;
        try {
            newTaskObj = {
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
                doc_type: docType,
                is_personal: referenceDoc ? true : false,
                status: task.data.state ? taskTypeReference[task.data.state] : "Не определён",
                task_type: taskType,
                state: task.data.state ? task.data.state.toString() : "",
                created_by_id: author ? author.data.__id : "",
                doc_code: referenceDoc ? referenceDoc.code : undefined
            };
        } catch (e) {
            newTaskObj = {
                id: task.id,
                name: task.data.__name,
                author: authorName,
                created_at_obj: task.data.__createdAt,
                due_date_obj: task.data.dueDate,
                created_at: `
                ${task.data.__createdAt.day} ${monthReference[task.data.__createdAt.month.toString()]}, ${task.data.__createdAt.year}г., ${task.data.__createdAt.hours}:${task.data.__createdAt.minutes.toString().length < 2 ? "0" + task.data.__createdAt.minutes.toString() : task.data.__createdAt.minutes.toString()} 
            `,
                due_date: task.data.dueDate ? `
                ${task.data.dueDate.day} ${monthReference[task.data.__createdAt.month.toString()]}, ${task.data.__createdAt.year}г., ${task.data.__createdAt.hours}:${task.data.__createdAt.minutes.toString().length < 2 ? "0" + task.data.__createdAt.minutes.toString() : task.data.__createdAt.minutes.toString()} 
            ` : "не определено",
                doc_type: docType,
                is_personal: referenceDoc ? true : false,
                status: task.data.state ? taskTypeReference[task.data.state] : "Не определён",
                task_type: taskType,
                state: task.data.state ? task.data.state.toString() : "",
                created_by_id: author ? author.data.__id : "",
                doc_code: referenceDoc ? referenceDoc.code : undefined
            };
        }

        return newTaskObj;
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
            start_date: item.code === "business_trips" ? item.data.start_date_string : item.code === "holidays" ? item.data.start_string || item.data.rest_day_first && item.data.rest_day_first.format("DD.MM.YYYY") : item.code === "overtime_work" && item.data.start_date_string ? item.data.start_date_string.split(",").length > 1 ? item.data.start_date_string.split(",")[0] : item.data.start_date_string : item.data.date_start ? item.data.date_start.format("DD.MM.YYYY") : undefined,
            end_date: item.code === "business_trips" ? item.data.end_date_string : item.code === "holidays" ? item.data.end_string || item.data.rest_day_second && item.data.rest_day_second.format("DD.MM.YYYY") || item.data.rest_day_first?.format("DD.MM.YYYY") : item.data.date_end ? item.data.date_end.format("DD.MM.YYYY") : item.data.date_start ? item.data.date_start.format("DD.MM.YYYY") : undefined,
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



/**
 * Класс, который управляет логикой пагинации элементов на странице
 * elementsToRender: dataUnion;
    @property allTasksChunks объект типа paginatorItem, хранит в себе все задачи пользователя
    @property actualTasksChunks объект типа paginatorItem, хранит в себе текущие задачи пользователя
    @property outgoingTasksChunks объект типа paginatorItem, хранит в себе исходящие задачи пользователя
    @property lnaTasksChunks объект типа paginatorItem, хранит в себе все задачи пользователя по ЛНА
    @property docsTasksChunks объект типа paginatorItem, временно не используется
    @property subordinateTasksChunks массив объектов типа subordinateUserTasks, хранит в себе все задачи сотрудников отдела;
    @property personnelDocumentsChunks объект типа paginatorItem, хранит в себе все личные документы
    @property lnaDocumentsChunks объект типа paginatorItem, хранит в себе все документы ЛНА
    @property personalDocsChunks объект типа paginatorItem, временно не используется
    @property vacationsChunk: объект типа paginatorItem, хранит в себе все отпуска;
    @property businessTripsChunks объект типа paginatorItem, хранит в себе все командировки
    @property tasksTableContent DOM-элемент (.tasks-page_main-content_table)
    @property tasksTable DOM-элемент (.tasks-page_main-content_table-content)
    @property mobileTasksTableContent DOM-элемент (.tasks-page_main-content_mobile_container)
    @property mobileTasksTable DOM-элемент (.tasks-page_main-content_mobile)
    @property emptyTasksTemplate DOM-элемент (.tasks-page_main-content_mobile)
    @property emptyDocumentsTemplate DOM-элемент (.tasks-page_main-content_mobile) 
    @property emptyBusinessTripsTemplate DOM-элемент (.business_trips-page_main-content_table-empty)
    @property emptyVacationsTemplate DOM-элемент (.vacations-page_main-content_table-empty)
    @property subordinateTasksTable DOM-элемент (.tasks-page_main-content_table_subordinate);
    @property subordinateTasksTableContent DOM-элемент (.tasks-page_main-content_table-content_subordinate)
    @property subordinateStructureName DOM-элемент (.subordinate-path_sub)
    @property subordinateStructureNameMobile DOM-элемент (.subordinate-path_sub_mobile)
    @property subordinateUserName DOM-элемент (.subordinate-path_user)
    @property subordinateUserNameMobile DOM-элемент (.subordinate-path_user_mobile)
    @property subordinatePath DOM-элемент (.tasks-page_main-content_title-left_subordinate-path)
    @property subordinatePathMobile DOM-элемент (.tasks-page_main-content_title-left_subordinate-path_mobile)
    @property subordinateTableMobile DOM-элемент (.tasks-page_main-content_table_subordinate_mobile)
    @property personnelDocumentsTabl DOM-элемент (.documents-page_main-content_table-content)
    @property personnelDocumentsTableContent DOM-элемент (.documents-page_main-content_table)
    @property businessTripsTable DOM-элемент (.business_trips-page_main-content_table-content)
    @property businessTripsTableContent DOM-элемент (.business_trips-page_main-content_table)
    @property vacationsTable DOM-элемент (.vacations-page_main-content_table-content)
    @property vacationsTableContent DOM-элемент (.vacations-page_main-content_table)
    @property paginator DOM-элемент (текущий пагинатор, в котором отрисовываются элементы)
    @property dataType текущий тип пагинатора
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
        if (!userStorageManager.documentsFilter) {
            return item;
        };

        let allDocs = <objData[]>[].concat.apply([], ...item.globalData.map(obj => obj.data));

        if (userStorageManager.documentsFilter.docName) {
            allDocs = allDocs.filter(doc => doc.name.toLowerCase().includes(userStorageManager.documentsFilter!.docName!.toLowerCase()));
        };

        if (userStorageManager.documentsFilter.createdAt) {
            allDocs = allDocs.filter(doc => doc.created_at.after(userStorageManager.documentsFilter!.createdAt! as TDatetime));
        };

        if (userStorageManager.documentsFilter.statusCode) {
            allDocs = allDocs.filter(doc => doc.status_code === userStorageManager.documentsFilter!.statusCode);
        };

        const newItem = this.sliceToChunks(allDocs, 10, this.personnelDocumentsTable, item.elementType);
        return newItem;
    };

    /**
     * Метод для применения фильтров к задачам
     * @param item объект типа paginatorItem
     */
    private filterTasks(item: paginatorItem): paginatorItem {
        if (!userStorageManager.tasksFilter) {
            return item;
        };

        let allTasks = <taskData[]>[].concat.apply([], ...item.globalData.map(obj => obj.data));

        if (userStorageManager.tasksFilter.userId) {
            allTasks = allTasks.filter(task => task.created_by_id === userStorageManager.tasksFilter!.userId);
        };

        if (userStorageManager.tasksFilter.createdAt) {
            allTasks = allTasks.filter(task => task.created_at_obj.before((userStorageManager.tasksFilter!.createdAt as TDatetime)!));
        };

        if (userStorageManager.tasksFilter.dueDate) {
            allTasks = allTasks.filter(task => task.due_date_obj && task.due_date_obj.before((userStorageManager.tasksFilter!.dueDate as TDatetime)!));
        };

        if (userStorageManager.tasksFilter.taskName) {
            allTasks = allTasks.filter(task => task.name.toLowerCase().includes(userStorageManager.tasksFilter!.taskName!.toLowerCase()));
        };

        const newItem = this.sliceToChunks(allTasks, 10, this.tasksTable, item.elementType);
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
        const objToRender = userId ? this.subordinateTasksChunks.find(obj => obj.userData.userId === userId)?.tasks : <paginatorItem>this[dataType as pageKey] || undefined;

        if (!objToRender || !objToRender.globalData || objToRender.globalData.length < 1) {
            console.log("no paginator obj")
            this.handleEmptyPaginator(paginator, dataType);
            return;
        };

        let actualData = objToRender;

        if (userStorageManager.tasksFilter && itemIsTask) {
            actualData = this.filterTasks(objToRender);
        } else {
            switch (dataType) {
                case chunkType.PERSONAL:
                case chunkType.PERSONAL_DOCS:
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
        };

        if (!actualData || !actualData.globalData || actualData.globalData.length < 1) {
            this.handleEmptyPaginator(paginator, dataType);
            return;
        };

        if (!this.subordinateTasksTableContent.classList.contains("hidden")) {
            this.subordinateTasksTableContent.classList.add("hidden");
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

        if (this.tasksTableContent.classList.contains("hidden") && itemIsTask) {
            this.tasksTableContent.classList.remove("hidden");
            this.mobileTasksTableContent.classList.remove("hidden");
        };

        if (this.personnelDocumentsTableContent.classList.contains("hidden") && itemIsDocument) {
            this.personnelDocumentsTableContent.classList.remove("hidden");
        }

        if (this.businessTripsTableContent.classList.contains("hidden") && dataType === chunkType.BUSINESS_TRIPS) {
            this.businessTripsTableContent.classList.remove("hidden");
        }

        if (!this.emptyTasksTemplate.classList.contains("hidden") && itemIsTask) {
            this.emptyTasksTemplate.classList.add("hidden");
        };

        if (!this.emptyDocumentsTemplate.classList.contains("hidden") && itemIsDocument) {
            this.emptyDocumentsTemplate.classList.add("hidden");
        };

        if (!this.emptyVacationsTemplate.classList.contains("hidden") && dataType === chunkType.VACATIONS) {
            this.emptyVacationsTemplate.classList.add("hidden");
        };

        if (this.vacationsTableContent.classList.contains("hidden") && dataType === chunkType.VACATIONS) {
            this.vacationsTableContent.classList.remove("hidden");
        };

        if (!this.emptyBusinessTripsTemplate.classList.contains("hidden") && dataType === chunkType.BUSINESS_TRIPS) {
            this.emptyBusinessTripsTemplate.classList.add("hidden");
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
            templateToRender = domManager.templates.querySelector(".tasks-page_main-content_table-item_template");
            const mobileTemplateToRender = domManager.templates.querySelector(".tasks-page_main-content_mobile_container-item_template");
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
                    const systemTask = userDataManager.systemTasks.find(t => t.id === item.id);
                });
            };
        } else {
            switch (elementType) {
                case chunkType.PERSONAL:
                case chunkType.PERSONAL_DOCS:
                case chunkType.LNA_DOCS:
                    templateToRender = domManager.templates.querySelector(".documents-page_main-content_table-item_template");
                    this.personnelDocumentsTable.innerHTML = "";
                    for (let item of elementsToRender) {
                        const newRow = this.getElementRow(item, templateToRender, elementType, itemIsTask);
                        domManager.renderComponent(rootToRender, newRow);
                    };
                    break;
                case chunkType.BUSINESS_TRIPS:
                    templateToRender = domManager.templates.querySelector(".business_trips-page_main-content_table-item_template");
                    this.businessTripsTable.innerHTML = "";

                    for (let item of elementsToRender) {
                        const newRow = this.getElementRow(item, templateToRender, elementType, itemIsTask);
                        domManager.renderComponent(rootToRender, newRow);
                    };

                    break;
                case chunkType.VACATIONS:
                    templateToRender = domManager.templates.querySelector(".vacations-page_main-content_table-item_template");
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
                        itemCreated.textContent = `${item.created_at.day} ${monthReference[item.created_at.month.toString()].toLowerCase()}, ${item.created_at.year}г., ${item.created_at.hours}:${item.created_at.minutes.toString().length < 2 ? "0" + item.created_at.minutes.toString() : item.created_at.minutes.toString()} `
                    } catch (e) {
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
                        itemStart.textContent = `${startDay} ${monthReference[startMonth.replace("0", "")].toLowerCase()}, ${startYear}г., ${(item.start_date_obj as TDatetime).hours}:${(item.start_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.start_date_obj as TDatetime).minutes.toString() : (item.start_date_obj as TDatetime).minutes.toString()} `
                        itemEnd.textContent = `${endDay} ${monthReference[endMonth.replace("0", "")].toLowerCase()}, ${endYear}г., ${(item.end_date_obj as TDatetime).hours}:${(item.end_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.end_date_obj as TDatetime).minutes.toString() : (item.end_date_obj as TDatetime).minutes.toString()} `
                    } catch (e) {
                        itemStart.textContent = `${startDay} ${monthReference[startMonth.replace("0", "")]}, ${startYear}г., ${(item.start_date_obj as TDatetime).hours}:${(item.start_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.start_date_obj as TDatetime).minutes.toString() : (item.start_date_obj as TDatetime).minutes.toString()} `
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
                    itemStart.textContent = `${startDay} ${monthReference[startMonth.replace("0", "")].toLowerCase()}, ${startYear}г., ${(item.start_date_obj as TDatetime).hours}:${(item.start_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.start_date_obj as TDatetime).minutes.toString() : (item.start_date_obj as TDatetime).minutes.toString()} `
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

    /**
     * Временно не используется
     */
    getChunk(chunkType: chunkType, index: number, userId?: string): paginatorChunk {
        if (userId) {
            const userTasks = this.subordinateTasksChunks.find(item => item.userData.userId === userId);

            if (userTasks) {
                return userTasks.tasks.globalData[index];
            };
        };
        //@ts-ignore
        return this[chunkType as pageKey].globalData[index];
    };
};

//константы и типы
const taskTypeReference = {
    "in_progress": "В процессе",
    "assignment": "На распределении",
    "cancel": "Отменена",
    "closed": "Закрыта"
};

const defaultMenuItems: menuItem[] = [
    {
        name: "Главная",
        type: "main",
        widget_name: "main"
    },
    {
        name: "Задачи",
        type: "task",
        widget_name: "tasks"
    },
    {
        name: "Сервисы",
        type: "service",
        widget_name: "services"
    },
    {
        name: "Отпуска",
        type: "vacation",
        widget_name: "vacations"
    },
    {
        name: "Командировки",
        type: "business_trip",
        widget_name: "business_trips"
    },
    {
        name: "График отсутствий",
        type: "schedule",
        widget_name: "schedule"
    },
    {
        name: "Кадровые события",
        type: "other",
        widget_name: "documents"
    },
    {
        name: "Мой профиль",
        type: "profile",
        widget_name: "my-profile"
    },
    // {
    //     name: "Help center",
    //     type: "help",
    //     widget_name: ""
    // },
];

const defaultIssues: newIssueConstructor[] = [
    {
        name: "Отпуск/отсутствие",
        expandable: true,
        issue_type: "vacation",
        issues: [
            // {
            //     name: "Узнать остаток отпусков",
            //     expandable: false,
            //     link: "#"
            // },
            {
                name: "Ежегодный оплачиваемый отпуск",
                code: "basic",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations;values=%7B"data":%7B"type_vacation":%5B%7B"code":"basic","name":"Ежегодный%20оплачиваемый%20отпуск"%7D%5D%7D%7D)`
            },
            {
                name: "Отпуск без сохранения ЗП",
                code: "unpaid",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations;values=%7B"data":%7B"type_vacation":%5B%7B"code":"unpaid","name":"Отпуск%20без%20сохранения%20заработной%20платы"%7D%5D%7D%7D)`
            },
            {
                name: "Дополнительный отдых",
                code: "additional",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations;values=%7B"data":%7B"type_vacation":%5B%7B"code":"additional","name":"Дополнительный%20отдых"%7D%5D%7D%7D)`
            },
            {
                name: "Оплачиваемый учебный отпуск",
                code: "study",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations;values=%7B"data":%7B"type_vacation":%5B%7B"code":"study","name":"Оплачиваемый%20учебный%20отпуск"%7D%5D%7D%7D)`
            },
            {
                name: "Больничный",
                code: "sick_leave",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations;values=%7B"data":%7B"type_vacation":%5B%7B"code":"sick_leave","name":"Больничный"%7D%5D%7D%7D)`
            },
            {
                name: "По беременности и родам",
                code: "pregnancy",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations;values=%7B"data":%7B"type_vacation":%5B%7B"code":"pregnancy","name":"По%20беременности%20и%20родам"%7D%5D%7D%7D)`
            },
            {
                name: "По уходу за ребенком",
                code: "child_care",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations;values=%7B"data":%7B"type_vacation":%5B%7B"code":"child_care","name":"По%20уходу%20за%20ребенком"%7D%5D%7D%7D)`
            },
            {
                name: "Исполнение гос. и общ. обязанностей",
                code: "duty",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations;values=%7B"data":%7B"type_vacation":%5B%7B"code":"duty","name":"Исполнение%20гос.%20и%20общ.%20обязанностей"%7D%5D%7D%7D)`
            },
            // {
            //     name: "Перенести отпуск",
            //     expandable: false
            // }
        ]
    },
    {
        name: "Перевод/увольнение",
        issue_type: "issue",
        expandable: true,
        issues: [
            {
                name: "Заявка на перевод",
                code: "transfer_application",
                expandable: false,
                link: `${window.location.href}(p:item/kedo/transfer_application)`
            },
            {
                name: "Заявка на увольнение",
                expandable: false,
                code: "dismissal_app",
                link: `${window.location.href}(p:item/kedo/dismissal_app)`
            },
        ]
    },
    {
        name: "Совмещение",
        issue_type: "issue",
        expandable: true,
        issues: [
            {
                name: "Заявка на совмещение",
                code: "execution_duties",
                expandable: false,
                link: `${window.location.href}(p:item/kedo/execution_duties)`
            },
            // {
            //     name: "Служебная записка на совмещение",
            //     expandable: false,
            //     code: "memo_execution_responsibilities",
            //     link: `${window.location.href}(p:item/kedo/memo_execution_responsibilities)`
            // },
            // {
            //     name: "Согласие на совмещение",
            //     expandable: false,
            //     code: "execution_responsibilities_consent",
            //     link: `${window.location.href}(p:item/kedo/execution_responsibilities_consent)`
            // },
            // {
            //     name: "Приказы на совмещение",
            //     expandable: false,
            //     code: "order_execution_responsibilities",
            //     link: `${window.location.href}(p:item/kedo/order_execution_responsibilities)`
            // },
            // {
            //     name: "Доп. соглашение на совмещение",
            //     expandable: false,
            //     code: "execution_responsibilities_additional_agreement",
            //     link: `${window.location.href}(p:item/kedo/execution_responsibilities_additional_agreement)`
            // },
        ]
    },
    {
        name: "Заявления на выплату",
        issue_type: "finance",
        expandable: true,
        issues: [
            {
                name: "Изменение расчетного счета",
                expandable: false,
                code: "application_for_the_transfer_of_salary_to_the_current_account",
                link: `${window.location.href}(p:item/personnel_documents/application_for_the_transfer_of_salary_to_the_current_account)`
            },
            {
                name: "Мат. помощь",
                expandable: false,
                code: "application_for_financial_assistance",
                link: `${window.location.href}(p:item/personnel_documents/application_for_financial_assistance)`
            },
            {
                name: "Пособие",
                expandable: false,
                code: "benefit_application",
                link: `${window.location.href}(p:item/personnel_documents/benefit_application)`
            },
        ]
    },
    {
        name: "Прочие заявления",
        issue_type: "personal_data",
        expandable: true,
        issues: [
            {
                name: "Изменить личные данные",
                expandable: false,
                code: "employees_personal_data",
                link: `${window.location.href}(p:run/kedo.employees_personal_data/processing_application_personal_data;values=%7B%7D;silentRun=true)`
            },
            {
                name: "Присвоить льготную категорию",
                expandable: false,
                code: "category_assignment",
                link: `${window.location.href}(p:item/kedo/category_assignment)`
            },
            {
                name: "В свободной форме",
                expandable: false,
                code: "free_from",
                link: `${window.location.href}(p:item/personnel_documents/free_from)`
            },
            {
                name: "Справка",
                expandable: false,
                code: "certificate",
                link: `${window.location.href}(p:item/personnel_documents/certificate)`
            },
            {
                name: "Командировка",
                expandable: false,
                code: "businesstrip_requests",
                link: `${window.location.href}(p:item/business_trips/businesstrip_requests)`
            },
            {
                name: "Вызвать на работу в нерабочее время",
                expandable: false,
                code: "overtime_work",
                link: `${window.location.href}(p:item/time_tracking/overtime_work)`
            },
        ]
    },
];

const defaultServices: serviceLinkConstructor[] = [
    {
        name: "Отпуск без сохранения ЗП",
        ns: "absences",
        code: "vacations",
        fieldToChange: "type_vacation",
        fieldValue: {
            code: "unpaid",
            name: "Отпуск без сохранения заработной платы"
        }
    },
    {
        name: "Запросить справку",
        ns: "personnel_documents",
        code: "certificate"
    },
    {
        name: "Уведомить о больничном",
        ns: "absences",
        code: "vacations",
        fieldToChange: "type_vacation",
        fieldValue: {
            code: "sick_leave",
            name: "Больничный"
        }
    },
    {
        name: "Оформить командировку",
        ns: "business_trips",
        code: "businesstrip_requests",
    },
    {
        name: "Отпуск оплачиваемый",
        ns: "absences",
        code: "vacations",
        fieldToChange: "type_vacation",
        fieldValue: {
            code: "basic",
            name: "Ежегодный оплачиваемый отпуск"
        }
    }
];

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

const userStorageManager = new UserStorageManager();
const domManager = new DomManager(userStorageManager);
const userDataManager = new UserDataManager();
const systemDataManager = new SystemDataManager();
const serializer = new Serializer();
const paginator = new Paginator();
const today = new TDate();
let duration = 0;

function clearTimer() {
    duration = new Date().getTime();
};


function logTime() {
    console.log(`Portal initialized in ${(new Date().getTime() - duration) / 1000} seconds.`);
};

/**
 * При инизиализации страницы присваиваются главные объекты в экземпляр класса userDataManager - сотрудник и пользователь, асинхронно вызываются getAllData и метод waitForComponents у domManager, после того, как свойство allDocsLoaded объекта userDataManager становится в true - происходит отрисовка с помощью функции renderOrRefreshComponents
 */
let mainSectionStart: number;

async function onLoad(): Promise<void> {
    console.log("loading start..");
    const keyOption = await Context.fields.settings_app.app.search().where(f => f.code.eq("api_key")).first();

    if (keyOption) {
        console.log("token found");
        Context.data.token = keyOption.data.value;
    };

    calendarObject.setCalendars();

    const start = Date.now();
    mainSectionStart = Date.now();
    clearTimer();
    window.localStorage.setItem("temp_services_count", 0);
    const [currentUser, allStaff] = await Promise.all([System.users.getCurrentUser(), Context.fields.staff_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all()])
    const currentStaff = allStaff.find(staff => staff.data.ext_user && staff.data.ext_user.id === currentUser.id);
    if (!currentStaff) {
        const waitForContainer = window.setInterval(() => {
            const unemployedContainer = document.querySelector("#empty-staff");

            if (!unemployedContainer) {
                console.log("no unemployed container")
                return;
            };

            window.clearInterval(waitForContainer);
            unemployedContainer.classList.remove("hidden");
        }, 100);
        return;
    };
    userDataManager.staff = currentStaff;
    Context.data.staff_app = currentStaff;
    userDataManager.user = <CurrentUserItem>currentUser;

    userDataManager.isInnerUser = currentStaff && !currentStaff.data.staff_access || false;
    systemDataManager.allStaff = allStaff;
    Context.data.staff_app = currentStaff;

    const waitForPath = window.setInterval(() => {
        if (!filePath || !svgToTypeReference || !monthReference) {
            console.log("variables loading..")
            return;
        };
        window.clearInterval(waitForPath);
        const end = Date.now();
        console.log(`Time from onLoad start to getAllData: ${end - start} ms`);
        getAllData();
        domManager.waitForComponents().then(_ => {
            const waitForDocs = window.setInterval(() => {
                if (!userDataManager.allDocsLoaded || !domManager.domLoaded) {
                    console.log("wait for loading")
                    return;
                };
                console.log("data loaded")
                window.clearInterval(waitForDocs);
                renderOrRefreshComponents();
                logTime();
                console.log("loading end")
            }, 200);
        });
    }, 300);
};

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
 * Функция используется для отрисовки и обновления компонентов после того, как все данные загрузились (userDataManager.allDocsLoaded = true)
 * @param refresh признако того, что идёт обновление данных
 */
function renderOrRefreshComponents(refresh = false) {
    const statusContainer = document.querySelector(".tasks-page_main-content_title_search-extend_input-status-values");
    const statusContainerMobile = document.querySelector(".tasks-page_main-content_title_search-extend.mobile .tasks-page_main-content_title_search-extend_input-status-values");

    if (!Context.data.event_listeners_set) {
        window.setInterval(() => {
            getOrRefreshData(true).then(_ => {
                renderOrRefreshComponents(true);
                console.log("refresh")
            });
        }, 60000);
    };

    Context.data.event_listeners_set = true;
};

/**
 * Функция для отрисовки списка подчиненных сотрудников с задачами
 * @param refresh признак, что нужно предварительно очистить список
 */
function renderSubordinateTasks(refresh = false) {
    const subordinateUserRowTemplate = domManager.templates.querySelector(".tasks-page_main-content_table-item_subordinate_template");
    const subordinateUserRowMobileTemplate = domManager.templates.querySelector(".tasks-page_main-content_mobile_container-item_subordinate_template");
    const subordinateUsersTable = domManager.paginator.subordinateTasksTable;
    const subordinateUsersMobileTable = domManager.paginator.subordinateTableMobile;

    refresh && refreshContainers([subordinateUsersTable, subordinateUsersMobileTable]);

    for (let obj of domManager.paginator.subordinateTasksChunks) {
        const userData = obj.userData;
        const subordinateUserRowContent = subordinateUserRowTemplate.content.cloneNode(true);
        const subordinateUserRowMobileContent = subordinateUserRowMobileTemplate.content.cloneNode(true);
        const subordinateUserRow = subordinateUserRowContent.querySelector(".tasks-page_main-content_table-item");
        const subordinateUserRowMobile = subordinateUserRowMobileContent.querySelector(".tasks-page_main-content_mobile_container-item_subordinate");
        const subordinateUserRowName = subordinateUserRow.querySelector(".task-staff_name");
        const subordinateUserRowNameMobile = subordinateUserRowMobile.querySelector(".tasks-page_main-content_mobile_container-item_subordinate_info-common_name");
        const subordinateUserRowAvatar = subordinateUserRow.querySelector(".staff-avatar");
        const subordinateUserRowAvatarMobile = subordinateUserRowMobile.querySelector(".mobile_container-item_subordinate_img-avatar");
        const subordinateUserRowCount = subordinateUserRow.querySelector(".task-count");
        const subordinateUserRowCountMobile = subordinateUserRowMobile.querySelector(".tasks-page_main-content_mobile_container-item_subordinate-status_count");
        const subordinateUserRowSubdivision = subordinateUserRow.querySelector(".task-subdivision");
        const subordinateUserRowSubdivisionMobile = subordinateUserRowMobile.querySelector(".tasks-page_main-content_mobile_container-item_subordinate_info-common_sub");
        const subordinateUserRowStatus = subordinateUserRow.querySelector(".tasks-page_main-content_table-item-section_status");
        const subordinateUserRowStatusMobile = subordinateUserRowMobile.querySelector(".tasks-page_main-content_mobile_container-item_subordinate-status_value");

        const tasksCount = [...obj.tasks.globalData].reduce((acc, val) => {
            return acc + val.data.length;
        }, 0);

        subordinateUserRowName.textContent = userData.userName;
        subordinateUserRowAvatar.src = userData.avatar;
        subordinateUserRowSubdivision.textContent = userData.subdivision;
        subordinateUserRowStatus.textContent = "Работаю";
        subordinateUserRowCount.textContent = tasksCount;

        subordinateUserRowNameMobile.textContent = userData.userName;
        subordinateUserRowAvatarMobile.src = userData.avatar;
        subordinateUserRowSubdivisionMobile.textContent = userData.subdivision;
        subordinateUserRowStatusMobile.textContent = "Работаю";
        subordinateUserRowCountMobile.textContent = `всего задач: ${tasksCount}`;

        subordinateUserRow.dataset.userId = userData.userId;
        subordinateUserRowMobile.dataset.userId = userData.userId;

        [subordinateUserRow, subordinateUserRowMobile].forEach(node => node.addEventListener("click", () => {
            domManager.paginator.handleSubordinatePath(node);
            domManager.paginator.setPaginator(domManager.tasksPaginator, chunkType.NULL, userData.userId);
        }));

        domManager.renderComponent(subordinateUsersTable, subordinateUserRow);
        domManager.renderComponent(subordinateUsersMobileTable, subordinateUserRowMobile);
    };
}

/**
 * Функция используется для получения константных данных, после чего вызывается getOrRefreshData для получения данных, которые динамически меняются
 */
async function getAllData(): Promise<void> {

    const allUsers = await System.users.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allStatuses = await Context.fields.statuses_app.app.search().where(f => f.__deletedAt.eq(null)).size(100).all();
    const allEmploymentDirectory = await Context.fields.staff_app.app.fields.employment_table.fields.employment_placement_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    systemDataManager.statuses = allStatuses;
    systemDataManager.users = allUsers;
    systemDataManager.allEmploymentPlacements = allEmploymentDirectory;
    serializer.setManagers(userDataManager, systemDataManager);

    const allOrgs = await Context.fields.staff_app.app.fields.organization.app.search().where(f => f.__deletedAt.eq(null)).size(1000).all();
    const allStructuralSubdivisions = await Context.fields.staff_app.app.fields.structural_subdivision.app.search().where(f => f.__deletedAt.eq(null)).size(1000).all();

    systemDataManager.allOrgs = allOrgs
    systemDataManager.allStructuralSubdivisions = allStructuralSubdivisions;

    const start = Date.now();
    await getOrRefreshData().then(_ => {
        userDataManager.allDocsLoaded = true;
    });
    const end = Date.now();
    console.log(`getOrRefreshData time: ${end - start} ms`);
};

/**
 * Функция используется для получения всех динамических данных, связанных с пользователем (документы, задачи)
 * @param refresh признак того, что идет обновление данных
 * @param refreshTasks признак того, что нужно только обновление задач
 */
async function getOrRefreshData(refresh = false, refreshTasks = false): Promise<void> {
    let userTasks: ProcessTaskItem[];
    let userTasksObj: taskData[];
    let subordinateTasks: Map<string, { userData: userTaskData, tasks: ProcessTaskItem[] }> | undefined;

    async function setOrRefreshTasks(): Promise<void> {
        userTasks = await System.processes._searchTasks().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            g.or(
                f.performers.has(userDataManager.user),
                f.__createdBy.eq(userDataManager.user)
            )
        )).size(10000).sort("__createdAt").all();
        userTasksObj = userTasks.map(task => serializer.serializeTask(task));
        userDataManager.tasks = userTasksObj;
        userDataManager.systemTasks = userTasks;

        subordinateTasks = await getSubordinateTasks();

        if (subordinateTasks) {
            refresh && refreshContainers([paginator.subordinateTasksTable]);
            for (let id of subordinateTasks.keys()) {
                const currentItem = subordinateTasks.get(id);
                const serializedTasks = currentItem!.tasks.map(task => serializer.serializeTask(task));
                paginator.setChunks(serializedTasks, chunkType.SUB_TASKS, currentItem!.userData)
            };
        };
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

            domManager.paginator.setPaginator(domManager.tasksPaginator, activeType!.dataset.dataType);

            if (activeType!.dataset.dataType === "subordinateTasks") {
                renderSubordinateTasks(true);
            };

            domManager.setCounter();
        };

    };

    domManager.paginator = paginator;

    function setPaginatorChunks(refresh = false) {
        paginator.setChunks(userTasksObj.filter(task => task.task_type === TaskType.PERSONAL), chunkType.ALL);
        paginator.setChunks(userTasksObj.filter(task => task.task_type === TaskType.OUTGOING), chunkType.OUTGOING_TASKS);
        paginator.setChunks(userTasksObj.filter(task => task.is_personal && task.task_type === TaskType.PERSONAL), chunkType.DOCS_TASKS);
        paginator.setChunks(userTasksObj.filter(task => (task.state === "in_progress" || task.state === "assignment") && task.task_type === TaskType.PERSONAL), chunkType.ACTUAL_TASKS);
        paginator.setChunks(allBusinessTrips, chunkType.BUSINESS_TRIPS);
        paginator.setChunks(allVacations, chunkType.VACATIONS);
        paginator.setChunks(userDataManager.allUserDocs, chunkType.PERSONAL);
        paginator.setChunks(userDataManager.allUserDocs.filter(doc => doc.code == "docs_lna"), chunkType.LNA_DOCS);
        paginator.setChunks(userDataManager.allUserDocs.filter(doc => doc.code !== "docs_lna"), chunkType.PERSONAL_DOCS);
        domManager.renderTasksSection(refresh)
        domManager.renderBusinessTripsSection(refresh);
        domManager.renderVacationsSection(refresh);
        domManager.renderDocumentSection(refresh);
    };

    if (refreshTasks) {
        await setOrRefreshTasks();
        return;
    };

    const defaultFilter: FilterClosure<ItemData> = (f, g) => {
        return g.and(
            //@ts-ignore
            f.__deletedAt.eq(null),
            //@ts-ignore
            f.staff.link(userDataManager.staff)
        );
    };

    !refresh && domManager.handleLoader(LoaderType.COMMON);

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

    await Server.rpc.getOvertimeWork();

    let allOvertimeWork: any[] = [];

    if (Context.data.overtime_work_json) {
        allOvertimeWork = JSON.parse(Context.data.overtime_work_json).map((item: any) => serializer.serializeObjData(item));
    };

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

    userDataManager.personnelDocuments = personnelDocuments;
    userDataManager.issues = allIssuesObj;
    userDataManager.lastDocsForRender = [...userDataManager.personnelDocuments.filter(item => item.start_date_obj && item.start_date_obj.after(today.asDatetime(new TTime())) && item.status_code !== "completed").slice(0, 4), ...userDataManager.issues.slice(0, 4)];
    userDataManager.vacations = allVacations;
    userDataManager.businessTrips = allBusinessTrips;

    domManager.renderMainSection(refresh);

    if (!refresh) {
        const mainSectionEnd = Date.now();
        console.log(`Time from onLoad to renderMainSection: ${mainSectionEnd - mainSectionStart} ms`);
    };
    const userLna = await Context.fields.lna_app.app.search().where((f, g) => {
        let operands: Filter[] = [];
        operands.push(f.__deletedAt.eq(null));
        if (userDataManager.staff.data.position) {
            operands.push(f.positions_review.has(userDataManager.staff.data.position));
        } else {
            operands.push(f.wWho_acquainted.eq({ name: "Все пользователи организации", code: "all" }));
            operands.push(f.organization.link(userDataManager.staff.data.organization!))
        };
        return g.and(...operands);
    }).size(1000).all().then(data => data.map(item => serializer.serializeObjData(item))).then(data => data.sort((a: objData, b: objData) => {
        if (a.created_at.before(b.created_at)) {
            return -1;
        };
        if (a.created_at.after(b.created_at)) {
            return 1;
        };
        return 0;
    }));
    userDataManager.allUserDocs = [...allIssuesObj, ...personnelDocuments, ...userLna].sort((a: objData, b: objData) => {
        if (a.created_at.before(b.created_at)) {
            return 1;
        };
        if (a.created_at.after(b.created_at)) {
            return -1;
        };
        return 0;
    });

    await setOrRefreshTasks();
    if (!paginator.checkProps()) {
        const waitForTable = window.setInterval(() => {
            paginator.tasksTable = document.querySelector(".tasks-page_main-content_table-content");
            paginator.emptyTasksTemplate = document.querySelector(".tasks-page_main-content_table-empty");
            paginator.tasksTableContent = document.querySelector(".tasks-page_main-content_table");
            paginator.mobileTasksTable = document.querySelector(".tasks-page_main-content_mobile");
            paginator.mobileTasksTableContent = document.querySelector(".tasks-page_main-content_mobile_container");
            paginator.subordinateTasksTable = document.querySelector(".tasks-page_main-content_table_subordinate");
            paginator.subordinateTasksTableContent = document.querySelector(".tasks-page_main-content_table-content_subordinate");
            paginator.subordinatePath = document.querySelector(".tasks-page_main-content_title-left_subordinate-path");
            paginator.subordinateStructureName = document.querySelector(".subordinate-path_sub");
            paginator.subordinateUserName = document.querySelector(".subordinate-path_user");
            paginator.subordinateTableMobile = document.querySelector(".tasks-page_main-content_table_subordinate_mobile");
            paginator.subordinateStructureNameMobile = document.querySelector(".subordinate-path_sub_mobile");
            paginator.subordinateUserNameMobile = document.querySelector(".subordinate-path_user_mobile");
            paginator.subordinatePathMobile = document.querySelector(".tasks-page_main-content_title-left_subordinate-path_mobile");
            paginator.personnelDocumentsTable = document.querySelector(".documents-page_main-content_table-content");
            paginator.personnelDocumentsTableContent = document.querySelector(".documents-page_main-content_table");
            paginator.emptyDocumentsTemplate = document.querySelector(".documents-page_main-content_table-empty");
            paginator.businessTripsTable = document.querySelector(".business_trips-page_main-content_table-content");
            paginator.emptyBusinessTripsTemplate = document.querySelector(".business_trips-page_main-content_table-empty");
            paginator.businessTripsTableContent = document.querySelector(".business_trips-page_main-content_table");
            paginator.vacationsTable = document.querySelector(".vacations-page_main-content_table-content");
            paginator.vacationsTableContent = document.querySelector(".vacations-page_main-content_table");
            paginator.emptyVacationsTemplate = document.querySelector(".vacations-page_main-content_table-empty");

            if (!paginator.checkProps()) {
                return;
            };

            window.clearInterval(waitForTable);
            !refresh && [paginator.subordinateStructureName, paginator.subordinateStructureNameMobile].forEach((node: any) => {
                node.addEventListener("click", () => {
                    paginator.handleReturn();
                });
            });

            // if (subordinateTasks) {
            //     for (let id of subordinateTasks.keys()) {
            //         const currentItem = subordinateTasks.get(id);
            //         const serializedTasks = currentItem!.tasks.map(task => serializer.serializeTask(task));
            //         paginator.setChunks(serializedTasks, chunkType.SUB_TASKS, currentItem!.userData)
            //     };
            // };
            setPaginatorChunks(refresh);
        }, 200);
    } else {
        setPaginatorChunks(refresh);
    };

    userDataManager.organization = userDataManager.staff.data.organization ? systemDataManager.allOrgs.find(org => org.id === userDataManager.staff.data.organization!.id) : undefined;
    userDataManager.subdivision = userDataManager.staff.data.structural_subdivision ? systemDataManager.allStructuralSubdivisions.find(org => org.id === userDataManager.staff.data.structural_subdivision!.id) : undefined;
    userDataManager.avatarLink = userDataManager.user.data.avatar ? await userDataManager.user.data.avatar.getDownloadUrl() : undefined;

    userDataManager.categories = userDataManager.staff.data.categories_table ? await Promise.all(userDataManager.staff.data.categories_table.map(async row => {
        return {
            name: await row.staff_categories.fetch().then(item => item.data.__name),
            expiration_date: row.expiration_date ? row.expiration_date.format("DD.MM.YYYY") : "Без срока",
            assignment_date: row.assignment_date ? row.assignment_date.format("DD.MM.YYYY") : "Без срока"
        };
    })) : [];

    await Server.rpc.getCities();

    if (Context.data.cities_json) {
        systemDataManager.allCities = JSON.parse(Context.data.cities_json);
    };

    const userFamily = await Context.fields.family_composition_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.staff.link(userDataManager.staff)
    )).size(100).all().then(data => data.map(item => {
        return {
            name: item.data.full_name ? `${item.data.full_name.lastname} ${item.data.full_name.firstname} ${item.data.full_name.middlename || ""}` : "",
            relation: item.data.relation_degree ? item.data.relation_degree.name : "Не указан"
        };
    }));

    userDataManager.family = userFamily;

    domManager.renderProfileSection(refresh);
    // await userStorageManager.getNotifications();
};

/**
 * Функция, которая ищет и сериализует задачи для сотрудников отдела
 */
async function getSubordinateTasks(): Promise<Map<string, { userData: userTaskData, tasks: ProcessTaskItem[] }> | undefined> {
    const subordinateUsers = await getSubordinateUsers();

    if (subordinateUsers) {
        const tasksMap: Map<string, { userData: userTaskData, tasks: ProcessTaskItem[] }> = new Map();
        const taskPromises: Promise<any>[] = [];

        for (let user of subordinateUsers) {
            const subordinateUsersTasksSearch = System.processes._searchTasks().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.performers.has(user)
            )).size(1000);
            taskPromises.push(subordinateUsersTasksSearch.all());
        };

        const subordinateUsersTasks: ProcessTaskItem[] = [].concat.apply([], await Promise.all(taskPromises));

        for (let task of subordinateUsersTasks) {
            if (task.data.performers) {
                for (let user of task.data.performers) {
                    const taskUser = subordinateUsers.find(u => u.id === user.id);
                    if (taskUser) {
                        const userTaskObj = tasksMap.get(taskUser.id);

                        if (userTaskObj) {
                            userTaskObj.tasks.push(task);
                            userTaskObj.userData.tasksCount++;
                        } else {
                            const staff = systemDataManager.allStaff.find(s => s.data.ext_user && s.data.ext_user.id === taskUser.id);
                            const subdivision = staff && staff.data.structural_subdivision
                                ? systemDataManager.allStructuralSubdivisions.find(s => s.id === staff.data.structural_subdivision!.id)
                                : undefined;
                            const avatar = taskUser.data.avatar ? taskUser.data.avatar.id : "";
                            const newUserTasksObj: userTaskData = {
                                userId: taskUser.id,
                                userName: serializer.serializeName(taskUser),
                                tasksCount: 1,
                                subdivision: subdivision ? subdivision.data.__name : "Не определён",
                                status: "Тест статус",
                                statusCode: "test_status",
                                avatar
                            };
                            tasksMap.set(taskUser.id, { userData: newUserTasksObj, tasks: [task] });
                        };
                    };
                };
            };
        };

        const userAvatarsReference = await Promise.all(subordinateUsers.map(async user => {
            return {
                userId: user.id,
                link: user.data.avatar ? await user.data.avatar.getDownloadUrl() : ""
            };
        }));

        userAvatarsReference.forEach(obj => {
            const referenceUser = tasksMap.get(obj.userId);

            if (referenceUser) {
                referenceUser.userData.avatar = obj.link;
            };
        });

        return tasksMap;
    };
}

/**
 * Функция, которая ищет сотрудников отдела
 */
async function getSubordinateUsers(): Promise<UserItem[] | undefined> {
    if (!userDataManager.staff.data.position) {
        return;
    };

    const staffPosition = await userDataManager.staff.fields.position.app.search().where(f => f.__id.eq(userDataManager.staff.data.position!.id)).first();

    if (!staffPosition) {
        return;
    };

    const subordinateSubs = systemDataManager.allStructuralSubdivisions.filter(sub => sub.data.position && sub.data.position.id === staffPosition.id);

    if (subordinateSubs && subordinateSubs.length > 0) {
        userDataManager.isChief = true;
        const allSubPositionsIds: string[] = [].concat.apply([], subordinateSubs.map(sub => {
            if (sub.data.positions && sub.data.positions.length > 0) {
                return sub.data.positions.map(pos => pos.id);
            };
        })).filter((item: any) => item);
        const allSubordinateStaff = systemDataManager.allStaff.filter(staff => staff.data.ext_user && staff.data.position && allSubPositionsIds.indexOf(staff.data.position.id) !== -1);
        const allSubordinateUsers = systemDataManager.users.filter(user => allSubordinateStaff.map(s => s.data.ext_user!.id).indexOf(user.id) !== -1);
        return allSubordinateUsers.length > 0 ? allSubordinateUsers : undefined;
    };
};

/**
 * Вывод сообщения на экран (всплывающее информационное окно)
 * @message текст сообщения
 * @notify_type тип информационного сообщения
 * @duration продолжительность отображения сообщения
 */
function alert(message: string, notify_type : NotifyType, duration: number): void {
    let notify_type_line = "default";

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
        message: message,
        color: notify_type_line,
        timeout: duration,
    });
}

/**
 * Вывод инф. окна (ошибка).
 */
function error(message: string): void {
    alert(message, NotifyType.ERROR, 5000);
}

/**
 * Вывод инф. окна (успешный результат).
 */
function success(message: string): void {
    alert(message, NotifyType.SUCCESS, 3000);
}

/**
 * Функции из файла dom-functions.js
 */

// const dateRegex = /^([120]{1}[0-9]{1}|3[01]{1,2}|0[1-9])\.(1[0-2]|0[1-9])\.\d{4}/

// function setActive(target: any, isMenuItem = false, mobileView = false) {
//     dataAttributeCheck: 
//         if (isMenuItem) {
//             if (!target.dataset.menuItem) {
//                 break dataAttributeCheck;
//             };
//             let relativeItemExists = false;
//             let restMenuItems: any;

//             if (mobileView) {
//                 restMenuItems = Array.from(document.querySelectorAll(".main-page_mobile-footer_buttons-container_button")).filter((item: any) => item.dataset.menuItem && !item.dataset.menuItem.includes(target.dataset.menuItem));
//                 restMenuItems.push(...Array.from(document.querySelectorAll(".left-menu_item.mobile")));
//                 console.log(target)
//                 if (target.classList.contains("left-menu_item") && target.classList.contains("mobile")) {
//                     const otherButton = document.querySelector(".other-item");
//                     otherButton.click();
//                 }
//             } else {
//                 restMenuItems = Array.from(document.querySelectorAll(".left-menu_item")).filter((item: any) => item.dataset.menuItem && !item.dataset.menuItem.includes(target.dataset.menuItem));
//             }
//             restMenuItems.forEach((item: any) => {
//                 if (item.classList.contains("active")) {
//                     item.classList.remove("active")
//                 };
//             });

//             const relativePageItems = document.querySelectorAll(`.page-widget[data-menu-item="${target.dataset.menuItem}"]`);

//             if (relativePageItems && relativePageItems.length > 0) {
//                 relativeItemExists = true;
//                 relativePageItems.forEach((item: any) => item.classList.remove("hidden"));
//             };
            
//             if (relativeItemExists) {
//                 const restPageItems = Array.from(document.querySelectorAll(".page-widget")).filter((item: any) => !item.dataset.menuItem.includes(target.dataset.menuItem));
//                 restPageItems.forEach((item: any) => item.classList.add("hidden")); 
//             };

//             if (window.screen.width <= 450) {
//                 const header = document.querySelector(".header-container");
//                 const pageContainer = document.querySelector(".main-page");
                
//                 if ([
//                     "tasks",
//                     "documents",
//                     "vacatons",
//                     "business_trips",
//                     "services",
//                     "vacations"
//                 ].indexOf(target.dataset.menuItem) !== -1) {
//                     if (!header.classList.contains("hidden")) {
//                         header.classList.toggle("hidden");
//                         pageContainer.classList.toggle("mobile");
//                     }
//                 } else {
//                     if (header.classList.contains("hidden")) {
//                         header.classList.remove("hidden");
//                     };

//                     if (pageContainer.classList.contains("mobile")) {
//                         pageContainer.classList.remove("mobile");
//                     }
//                 };
//             }
//         };
//     target.classList.toggle("active");
// };

// function handleFavoritesExpand(target: any) {
//     if (target.textContent === "Свернуть") {
//         target.textContent = `Все (${localStorage.getItem("services_count")})`
//     } else {
//         target.textContent = "Свернуть";
//     }
    
//     target.parentElement.previousElementSibling.classList.toggle("expand")
// };

// function handleNewIssueContainer(target: any) {
//     const issueContainer = document.querySelector(".portal_new-issue_container")
//     issueContainer.classList.toggle("hidden");
// };

// function handleIssueExpand(target: any) {
//     const issueList = target.querySelector(".portal-new-issue_container_item-issues");
//     issueList.classList.toggle("hidden");
// };

// function handleMobileFooter(target: any) {
//     target.classList.toggle("active");
//     const mobileFooter = document.querySelector(".main-page_mobile-footer_expand-menu");
//     mobileFooter.classList.toggle("hidden");
// };

// function handleMobileServices() {
//     const mobileHeader = document.querySelector(".main-page_mobile-footer_services_header");
//     const mobileServices = document.querySelector(".main-page_mobile-footer_services");
//     mobileHeader.classList.toggle("hidden")
//     mobileServices.classList.toggle("hidden")
// };

// function getNoun(number: number, one: string, two: string, five: string) {
//     let n = Math.abs(number);
//     n %= 100;
//     if (n >= 5 && n <= 20) {
//       return five;
//     };
//     n %= 10;
//     if (n === 1) {
//       return one;
//     };
//     if (n >= 2 && n <= 4) {
//       return two;
//     };
//     return five;
// };

// function expandSearch(target: any, mobileView = false) {
//     let expandSearchContainer: any;
//     let expandModal = document.querySelector(".dropdown-modal");

//     if (Array.from(target.classList).some((cls: any) => cls.includes("common-content_title_search-extend_title-img"))) {
//         expandSearchContainer = target.parentElement.parentElement
//     } else {
//         expandSearchContainer = target.nextElementSibling
//     };

//     expandSearchContainer.classList.toggle("expanded");
//     expandModal.classList.toggle("hidden");
// };

// function searchStatusExpand(target: any) {
//     let expandContainer: any;
//     if (!target.classList.contains("input-status-values_item")) {
//         expandContainer = target.parentElement.nextElementSibling;
//         if (expandContainer.classList.contains("expanded")) {
//             target.style.transform = "rotateZ(0)"
//         } else {
//             target.style.transform = "rotateZ(180deg)"
//         };
//     } else {
//         expandContainer = target.parentElement;
//         const arrow = expandContainer.parentElement.querySelector(".common-content_title_search-extend_input-status-arrow");
//         arrow.style.transform = 'rotateZ(0)';
//     };
    
//     expandContainer.classList.toggle("expanded");
// };


// function handleStatusSearch(target: any) {
//     const statusValues = target.parentElement.nextElementSibling;
//     if (!statusValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
//         statusValues.classList.toggle("expanded");
//     };
//     const statusItems = statusValues.querySelectorAll(".input-status-values_item");

//     statusItems.forEach((item: any) => {
//         if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
//             item.classList.toggle("hidden");
//         } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
//             item.classList.toggle("hidden")
//         }
//     });
// };

// function handleAuthorSearch(target: any) {
//     const authorValues = target.parentElement.querySelector(".search-choice-items");
//     if (!authorValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
//         authorValues.classList.toggle("expanded");
//     };
//     const authorItems = authorValues.querySelectorAll(".input-author-values_item");

//     authorItems.forEach((item: any) => {
//         if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
//             item.classList.toggle("hidden");
//         } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
//             item.classList.toggle("hidden")
//         };
//     });
// };

// function handleCitySearch(target: any) {
//     const cityValues = target.parentElement.nextElementSibling;
//     if (!cityValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
//         cityValues.classList.toggle("expanded");
//     };
//     const cityItems = cityValues.querySelectorAll(".search-item");

//     cityItems.forEach((item: any) => {
//         if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
//             item.classList.toggle("hidden");
//         } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
//             item.classList.toggle("hidden")
//         };
//     });
// };

// function handleStaffSearch(target: any) {
//     const staffValues = target.parentElement.nextElementSibling;
//     if (!staffValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
//         staffValues.classList.toggle("expanded");
//     };
//     const staffItems = staffValues.querySelectorAll(".search-item");

//     staffItems.forEach((item: any) => {
//         if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
//             item.classList.toggle("hidden");
//         } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
//             item.classList.toggle("hidden")
//         };
//     });
// };

// function handleVacationTypeSearch(target: any) {
//     const typeValues = target.parentElement.nextElementSibling;
//     if (!typeValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
//         typeValues.classList.toggle("expanded");
//     };
//     const typeItems = typeValues.querySelectorAll(".search-item");

//     typeItems.forEach((item: any) => {
//         if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
//             item.classList.toggle("hidden");
//         } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
//             item.classList.toggle("hidden")
//         };
//     });
// };

// function handleStatusChoice(target: any) {
//     const statusInput = target.parentElement.previousElementSibling.querySelector("input");
//     statusInput.value = target.textContent.trim();
//     statusInput.dataset.statusCode = target.dataset.statusCode;
//     searchStatusExpand(target);
// }

// function handleStaffChoice(target: any) {
//     const staffInput = target.parentElement.previousElementSibling.querySelector("input");
//     staffInput.value = target.textContent.trim();
//     staffInput.dataset.staffId = target.dataset.staffId;
//     searchStatusExpand(target);
// }

// function handleCityChoice(target: any) {
//     const cityInput = target.parentElement.previousElementSibling.querySelector("input");
//     cityInput.value = target.textContent.trim();
//     cityInput.dataset.cityId = target.dataset.cityId;
//     searchStatusExpand(target);
// }

// function handlevacationChoice(target: any) {
//     const typeInput = target.parentElement.previousElementSibling.querySelector("input");
//     typeInput.value = target.textContent.trim();
//     typeInput.dataset["vacation_code"] = target.dataset["vacation_code"];
//     searchStatusExpand(target);
// }

// function handleAuthorChoice(target: any) {
//     const authorInput = target.parentElement.parentElement.querySelector("input")
//     authorInput.value = target.textContent.trim();
//     authorInput.dataset.userId = target.dataset.userId;
//     expandAuthorContainer(target);
// }

// function expandAuthorContainer(target: any, fromSearchButton = false) {
//     let authorValuesContainer: any;
//     if (fromSearchButton) {
//         authorValuesContainer = target.parentElement.querySelector(".search-choice-items");
//     } else {
//         authorValuesContainer = target.parentElement;
//     }
//     authorValuesContainer.classList.toggle("expanded");
// }

// function checkAndSetDate(target: any) {
//     if (!target.value || target.value.length < 1) {
//         return;
//     };
//     const createdAtField = target.classList.contains(".created-at-input");

//     if (target.value.match(dateRegex)) {
//         const searchFilterData = window.sessionStorage.searchSettings
//             ? JSON.parse(window.sessionStorage.getItem("searchSettings"))
//             : {
                
//             };
//         searchFilterData.createdAt = createdAtField
//             ? target.value
//             : ""

//         searchFilterData.validTo = createdAtField
//             ? ""
//             : target.value
        
//         window.sessionStorage.setItem("searchSettings", JSON.stringify(searchFilterData));    
//     };
// };

// function expandCalendar(target: any) {
//     target.style.transform = target.style.transform 
//     ? ""
//     : "rotateZ(180deg)"
//     const calendar = target.parentElement.nextElementSibling;
//     calendar.classList.toggle("hidden");
// }

// function handleGlobalTasks(target: any) {
//     const subordinateTable = document.querySelector(".tasks-page_main-content_table-content_subordinate");
//     const subordinateTableMobile = document.querySelector(".tasks-page_main-content_table_subordinate_mobile");

//     if (!subordinateTable.classList.contains) {
//         subordinateTable.classList.toggle("hidden");
//     };

//     if (!subordinateTableMobile.classList.contains) {
//         subordinateTable.classList.toggle("hidden");
//     };

//     const tasksListItems = document.querySelector(".tasks-page_main-content_task-types");

//     if (target.dataset.dataType && target.dataset.dataType === "outgoingTasksChunks" || target.dataset.dataType === "subordinateTasks") {
//         tasksListItems.classList.add("hidden");
//     } else if (tasksListItems.classList.contains("hidden")) {
//         tasksListItems.classList.remove("hidden");
//     };
// };

// function handleSubordinateSwitch() {
//     const mainTable = document.querySelector(".tasks-page_main-content_table");
//     const mainTableMobile = document.querySelector(".tasks-page_main-content_mobile_container");
//     const subordinateTable = document.querySelector(".tasks-page_main-content_table-content_subordinate");
//     const subordinateTableMobile = document.querySelector(".tasks-page_main-content_table_subordinate_mobile");
//     const paginator = document.querySelector(".tasks-page_main-content_paginator");
//     [subordinateTableMobile, mainTable, paginator, subordinateTable, mainTableMobile].forEach(node => node.classList.toggle("hidden"));
// };

// function expandMobileTasks() {
//     const mobileFooterTasksTypes = document.querySelector(".tasks-page_main-content_mobile_footer");
//     mobileFooterTasksTypes.classList.toggle("hidden");
// };

// function expandMobileDocuments() {
//     const mobileFooterDocumentsTypes = document.querySelector(".documents-page_main-content_mobile_footer")
//     mobileFooterDocumentsTypes.classList.toggle("hidden");
// }

// function handleTasksTitle(target: any) {
//     const tasksTitle = document.querySelector(".tasks-page_main-content_mobile_title");
//     tasksTitle.textContent = target.textContent;
// };

// function handleServiceSelect(target: any) {
//     target.classList.toggle("selected");
//     target.selected = !target.selected;
    
//     const favoriteServicesCount = localStorage.getItem("favorite_services")
//         ? JSON.parse(localStorage.getItem("favorite_services")).count
//         : 0
    
//     let tempServicesCount = Number(localStorage.getItem("temp_services_count")) || 0;

//     if (target.classList.contains("selected")) {
//         tempServicesCount++;
//     } else {
//         tempServicesCount--;
//     };
    
//     localStorage.setItem("temp_services_count", tempServicesCount);

//     const saveButton = document.querySelector(".services-save-button");

//     if (favoriteServicesCount + tempServicesCount > 5) {
//         saveButton.classList.add("blocked");
//     } else if (saveButton.classList.contains("blocked")) {
//         saveButton.classList.remove("blocked");
//     };
// };

// function closeServices() {
//     const servicesModal = document.querySelector(".services-page_main-content_modal");
//     servicesModal.classList.toggle("hidden");
// };

// function handleServicesSearch(target: any) {
//     const value = target.value;
//     const issues = document.querySelectorAll(".new-issue_container_item-list");
//     const columns = document.querySelectorAll(".favorite-services_choice_column");

//     issues.forEach((issue: any) => {
//         const issueLabel = issue.querySelector("p");
//         if (!value && issue.classList.contains("hidden")) {
//             issue.classList.remove("hidden");
//             return;
//         };
//         if (!issueLabel.textContent.toLowerCase().includes(value.toLowerCase()) && !issue.classList.contains("hidden")) {
//             issue.classList.add("hidden")
//         } else if (issueLabel.textContent.toLowerCase().includes(value.toLowerCase()) && issue.classList.contains("hidden")) {
//             issue.classList.remove("hidden");
//         };
//     });
    
//     columns.forEach((column: any) => {
//         const columnIssues = column.querySelectorAll(".new-issue_container_item-list");

//         if (Array.from(columnIssues).every((item: any) => item.classList.contains("hidden"))) {
//             column.classList.add("hidden")
//         } else if (!Array.from(columnIssues).every((item: any) => item.classList.contains("hidden")) && column.classList.contains("hidden")) {
//             column.classList.remove("hidden");
//         };
//     });
// };

// function setMiscItems(target: any) {
//     const choice = target.dataset["choice"]
//     const otherButton = choice === "family" ? document.querySelector("[data-choice='category']") : document.querySelector("[data-choice='family']");
//     const itemToShow = document.querySelector(`#${choice}`);
//     const otherItem = choice === "family" ? document.querySelector("#category") : document.querySelector("#family")
//     itemToShow.classList.toggle("hidden");
//     otherItem.classList.toggle("hidden");
//     [target, otherButton].forEach((item: any) => item.classList.toggle("pressed"));
// }

// function copyPassportData(copyAllData = false) {
//     const allPassportNodes = document.querySelectorAll(".passport-info-item");
//     let copyString = "";

//     allPassportNodes.forEach((node: any) => {
//         const nodeTitle = node.querySelector(".passport-info-item_label").textContent.trim();
//         const nodeValue = node.querySelector(".passport-info-item_value").textContent.trim();

//         copyString += `${nodeTitle}: ${nodeValue} `;
//     });

//     navigator.clipboard.writeText(copyString.trim());

//     if (copyAllData) {
//         return copyString.trim();
//     };
// };

// function copyMiscData(target: any) {
//     const miscValue = target.parentElement.nextElementSibling.textContent;
    
//     navigator.clipboard.writeText(miscValue);
// };

// function copyAll() {
//     let copyString = copyPassportData(true);
//     const miscValues = document.querySelectorAll(".kedo__my-profle_docs-other-info_item");

//     miscValues.forEach((node: any) => {
//         const nodeLabel = node.querySelector(".other-info_text");
//         const nodeValue = node.querySelector(".kedo__my-profle_docs-other-info_item-content");
        
//         copyString += `${nodeLabel.textContent.trim()}: ${nodeValue.textContent.trim()} `;
//     });
    
//     if (copyString)
//         navigator.clipboard.writeText(copyString.trim());
// };

// function handleUserInfoPopup() {
//     const userInfoPopup = document.querySelector(".left-menu_user-info_popup");
//     const popoverModal = document.querySelector(".popover-modal");
//     [popoverModal, userInfoPopup].forEach(node => node.classList.toggle("hidden"));
// };

// function handleAppContainer(target: any) {
//     if (!target.classList.contains("qr-modal") && !target.classList.contains("elma-app")) {
//         return;
//     };
//     const appContainer = document.querySelector(".qr-modal");
//     appContainer.classList.toggle("hidden");
// };

// function handleIssueDropdownModal(target: any) {
//     const dropdown = document.querySelector(".portal_new-issue_container");
//     let modal: any;

//     if (target.classList.contains("dropdown-modal")) {
//         modal = target;
//     } else {
//         modal = document.querySelector(".dropdown-modal");
//     };

//     const searchDropdowns = document.querySelectorAll(".common-content_title_search-extend.expanded");
//     if (searchDropdowns && searchDropdowns.length > 0) {
//         searchDropdowns.forEach((node: any) => {
//             if (node.classList.contains("expanded")) {
//                 node.classList.remove("expanded");
//             };
//         });
//         modal.classList.toggle("hidden")
//         return;
//     };
//     [dropdown, modal].forEach(node => node.classList.toggle("hidden"));
// }
