declare const console: any, document: any, window: any, $: any, VanillaCalendar: any;

enum FilterType {
    START_DATE = "start_date",
    END_DATE = "end_date",
    STAFF_ID = "staff_id",
    NAME = "name"
};

enum LoaderType {
    BUSINESS_TRIPS_CONTAINER = "business_trips_table_container",
    BUSINESS_TRIPS_WIDGET = "business_trips_widget"
};

type objData = {
    name: string,
    status: string,
    link: string,
    start_date?: string,
    end_date?: string,
    start_date_obj: TDate | TDatetime,
    end_date_obj: TDate | TDatetime,
    staffId: string | undefined,
};

type businessTripFilter = {
    name?: string,
    start_date?: string,
    end_date?: string,
    staff_id?: string
};

class SystemDataManager {
    statuses: ApplicationItem<Application$kedo$statuses$Data, any>[];
    allEmploymentPlacements: ApplicationItem<Application$kedo$employment_directory$Data, any>[];
    allStaff: ApplicationItem<Application$kedo$staff$Data, any>[];
    allBusinessTrips: ApplicationItem<Application$kedo$business_trips$Data, any>[];
    currentStaff: ApplicationItem<Application$kedo$staff$Data, any> | undefined; 
};

class DomManager {
    allStatuses: ApplicationItem<Application$kedo$statuses$Data, any>[];
    allBusinessTrips: ApplicationItem<Application$kedo$business_trips$Data, any>[];
    baseUrl = window.location.href;
    businessTripNodeTemplate: any;
    businessTripContainer: any;
    emptyTemplate: any;
    templateToRender: any;
    paginatorNode: any;

    renderStaff() {
        const businessTripsStaffContainer = document.querySelector(".business_trips-page_main-content_title_search-extend_input-staff-values");

        systemDataManager.allStaff.forEach(staff => {
            const newStaffRow = document.createElement("div");
            newStaffRow.className = "input-status-values_item";
            newStaffRow.dataset["staff_id"] = staff.id;
            newStaffRow.textContent = staff.data.__name;
            newStaffRow.addEventListener("click", () => {
                handleStaffChoice(newStaffRow)
            });
            businessTripsStaffContainer.append(newStaffRow);
        });
    };

    serializeObjData() {
        dataSource = [];
        systemDataManager.allBusinessTrips.forEach(item => {
            const itemStatus = item.data.kedo_status ? systemDataManager.statuses.find(s => s.id === item.data.kedo_status?.id) : undefined;
            const employmentPlacement = item.data.employment_placement || item.data.employment_place || item.data.employment_directory;

            const data: objData = {
                name: item.data.__name,
                status: itemStatus ? itemStatus.data.name : item.data.__status && item.data.__status.status ? item.data.__status.status.name : "Не определён",
                link: `${window.location.href}(p:item/business_trips/businesstrip_requests/${item.id})`,
                start_date: item.data.start_date_string || undefined,
                end_date: item.data.end_date_string || undefined,
                start_date_obj: item.data.start_date || item.data.__createdAt,
                end_date_obj: item.data.end_date || item.data.__createdAt,
                staffId: item.data.kedo_staff ? item.data.kedo_staff.id : undefined,
            };

            dataSource.push(data);
        });
    };

    setActive(element: any) {
        element.classList.add("active");
    };

    handleLoader(loaderType: LoaderType) {
        document.querySelector(`[data-loader=${loaderType}]`).classList.toggle("hidden");
    };

    renderComponent(domElement: any, elementToAppend: any) {
        if (Array.isArray(elementToAppend)) {
            domElement.append(...elementToAppend);
            return;
        };
        domElement.appendChild(elementToAppend);
    };

    getItemRow(item: objData) {
        const itemContent = domManager.templateToRender.content.cloneNode(true);
        const itemRow = itemContent.querySelector(".business_trips-page_main-content_table-item");
        const itemName = itemRow.querySelector(".business_trips-name");
        const itemStatus = itemRow.querySelector(".business_trips-page_main-content_table-item-section_status");
        const itemStart = itemRow.querySelector(".business_trips-start");
        const itemEnd = itemRow.querySelector(".business_trips-end");
        const [startDay, startMonth, startYear] = item.start_date ? item.start_date.split(".") : ["", "", ""];
        const [endDay, endMonth, endYear] = item.end_date ? item.end_date.split(".") : ["", "", ""];

        itemName.textContent = item.name;
        itemStatus.textContent = item.status;
        itemStart.textContent = `${startDay} ${monthReference[startMonth.replace("0", "")].toLowerCase()}, ${startYear}г., ${(item.start_date_obj as TDatetime).hours}:${(item.start_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.start_date_obj as TDatetime).minutes.toString() : (item.start_date_obj as TDatetime).minutes.toString()} `
        itemEnd.textContent = `${endDay} ${monthReference[endMonth.replace("0", "")].toLowerCase()}, ${endYear}г., ${(item.end_date_obj as TDatetime).hours}:${(item.end_date_obj as TDatetime).minutes.toString().length < 2 ? "0" + (item.end_date_obj as TDatetime).minutes.toString() : (item.end_date_obj as TDatetime).minutes.toString()} `


        itemRow.href = item.link;
        return itemRow;
    };

    getPaginatorTemplate(data: objData[]) {
        const mockContainer = document.createElement("div");

        data.forEach(item => {
            const newRow = this.getItemRow(item);
            mockContainer.append(newRow);
        });

        return mockContainer.innerHTML;
    };

    renderPaginator() {
        if (!Context.data.first_render) {
            $('.business_trips-page_main-content_paginator').pagination("destroy");
        };

        const getPaginatorTemplate = this.getPaginatorTemplate.bind(domManager)

        $('.business_trips-page_main-content_paginator').pagination({
            dataSource,
            callback: function(data: objData[], pagination: any) {
                const html = getPaginatorTemplate(data);
                $('.business_trips-page_main-content_table-content').html(html);
            },
            ulClassName: "content_paginator",
            prevClassName: "paginator-item",
            nextClassName: "paginator-item",
            pageClassName: "paginator-item",
            pageRange: 1,
            hideLastOnEllipsisShow: true,
            hideFirstOnEllipsisShow: true,
        });
    };
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
            document.querySelector(".business_trips_start-calendar") &&
            document.querySelector(".business_trips_end-calendar")
        )
    },
    setCalendars() {
        const businessTripsStartCalendar = new VanillaCalendar(".business_trips_start-calendar", this.options);
        const businessTripsEndCalendar = new VanillaCalendar(".business_trips_end-calendar", this.options);
        [businessTripsStartCalendar, businessTripsEndCalendar].forEach(calendar => calendar.init());
    }
};

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

const domManager = new DomManager();
const systemDataManager = new SystemDataManager();
const dateRegex = /^([120]{1}[0-9]{1}|3[01]{1,2}|0[1-9])\.(1[0-2]|0[1-9])\.\d{4}/;
const businessTripsFilterClosure: ApplicationFilterClosure<Application$kedo$business_trips$Data> = (f, g) => {
    const filters: Filter[] = [f.__deletedAt.eq(null)];
    const businessTripsFilters: businessTripFilter = window.localStorage.business_trips_filters ? JSON.parse(window.localStorage.getItem("business_trips_filters")) : {};

    if (Object.keys(businessTripsFilters).length > 0) {
        if (businessTripsFilters.name) {
            filters.push(f.__name.like(businessTripsFilters.name))
        };
        if (businessTripsFilters.start_date) {
            //const [day, month, year] = businessTripsFilters.start_date.split(".").map(Number);
            const startDate = new Datetime(businessTripsFilters.start_date, "'DD.MM.YYYY'");
            filters.push(f.start_date.gte(startDate));
        };
        if (businessTripsFilters.end_date) {
            //const [day, month, year] = businessTripsFilters.end_date.split(".").map(Number);
            const endDate = new Datetime(businessTripsFilters.end_date, "'DD.MM.YYYY'");
            filters.push(f.start_date.gte(endDate));
        };
        if (businessTripsFilters.staff_id) {
            const staffRef = <TRefItem>{
                namespace: "kedo",
                code: "staff",
                id: businessTripsFilters.staff_id
            };
            filters.push(f.kedo_staff.link(staffRef))
        } else {
            filters.push(f.kedo_staff.link(systemDataManager.currentStaff!))
        }
    } else {
        filters.push(f.kedo_staff.link(systemDataManager.currentStaff!))
    };

    return g.and(...filters);
};

let dataSource: objData[] = [];

function handleIssueDropdownModal(target: any) {
    console.log(`modal`);
    const dropdown = document.querySelector(".bt.common-content_title_search-extend");
    let modal: any;

    if (target.classList.contains("dropdown-modal")) {
        modal = target;
    } else {
        modal = document.querySelector(".bt.dropdown-modal");
    };
    dropdown.classList.toggle("expanded");
    modal.classList.toggle("hidden");
};

function clearFilters() {
    window.localStorage.removeItem("business_trips_filters");
    const allInputs = document.querySelectorAll(".business_trips-page_main-content_title_search-extend input");
    allInputs.forEach((input: any) => {
        input.value = "";
    });
};

function setFilterField(filterType: FilterType, filterValue: string) {
    const filterObject = window.localStorage.getItem("business_trips_filters") ? JSON.parse(window.localStorage.getItem("business_trips_filters")) : {};
    filterObject[filterType] = filterValue;
    window.localStorage.setItem("business_trips_filters", JSON.stringify(filterObject));
};

async function handleMainSearch(event: any) {
    if (event.type === "keypress") {
        domManager.handleLoader(LoaderType.BUSINESS_TRIPS_CONTAINER);
        await getBusinessTrips();
        domManager.serializeObjData();
        domManager.renderPaginator();
        domManager.handleLoader(LoaderType.BUSINESS_TRIPS_CONTAINER);
        tableIsEmpty();
        return;
    };
    
    setFilterField(FilterType.NAME, event.target.value);
    const nameInput = document.querySelector(".business_trips-page_main-content_title_search-extend_input[data-filter=name]");
    nameInput.value = event.target.value;
};

function setDate(event: any) {
    const [year, month, day] = [...event.target.dataset.calendarDay.split("-")];
    const dateString = `${day}.${month}.${year}`;
    const calendarInput = event.target.closest(".task-search-date").querySelector("input");
    const calendarArrow = event.target.closest(".task-search-date").querySelector(".business_trips-page_main-content_title_search-extend_input-date-arrow");
    const closestCalendar = event.target.closest(".vanilla-calendar");
    const filterType: FilterType = calendarInput.dataset.filter;

    calendarArrow.style.transform = "";
    calendarInput.value = dateString;
    closestCalendar.classList.toggle("hidden");

    setFilterField(filterType, dateString);
};

async function expandSearch(target: any) {
    let expandSearchContainer: any;
    let expandModal = document.querySelector(".dropdown-modal");

    if (Array.from(target.classList).some((cls: any) => cls.includes("common-content_title_search-extend_title-img"))) {
        expandSearchContainer = target.parentElement.parentElement
    } else if (target.classList.contains("business_trips-search")) {
        domManager.handleLoader(LoaderType.BUSINESS_TRIPS_CONTAINER);
        await getBusinessTrips();
        domManager.serializeObjData();
        domManager.renderPaginator();
        expandSearchContainer = target.closest(".business_trips-page_main-content_title_search-extend");
        tableIsEmpty();
        domManager.handleLoader(LoaderType.BUSINESS_TRIPS_CONTAINER);
    } else {
        expandSearchContainer = target.nextElementSibling
    };

    expandSearchContainer.classList.toggle("expanded");
    expandModal.classList.toggle("hidden");
    console.log(expandModal.classList);
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

function handleStaffSearch(target: any) {
    const staffValues = target.parentElement.nextElementSibling;
    if (!staffValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
        staffValues.classList.toggle("expanded");
    };
    const staffItems = staffValues.querySelectorAll(".search-item");

    staffItems.forEach((item: any) => {
        if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
            item.classList.toggle("hidden");
        } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
            item.classList.toggle("hidden")
        };
    });
};

function handleStaffChoice(target: any) {
    const staffInput = target.parentElement.previousElementSibling.querySelector("input");
    staffInput.value = target.textContent.trim();
    staffInput.dataset.staff_id = target.dataset.staff_id;
    searchStatusExpand(target);
    setFilterField(FilterType.STAFF_ID, target.dataset.staff_id);
};

function tableIsEmpty(): Boolean | void {
    if (systemDataManager.allBusinessTrips.length < 1) {
        domManager.emptyTemplate.classList.remove("hidden");
        domManager.businessTripContainer.classList.add("hidden");
        domManager.paginatorNode.classList.add("hidden");
        return true;
    } else if (systemDataManager.allBusinessTrips.length) {
        domManager.emptyTemplate.classList.add("hidden")
        domManager.businessTripContainer.classList.remove("hidden");
        domManager.paginatorNode.classList.remove("hidden");
        return false;
    };
};

async function onInit(): Promise<void> {
    const waitForPaginator = window.setInterval(() => {
        if (!$.pagination) {
            return;
        };
        window.clearInterval(waitForPaginator);
        const mainInput = document.querySelector(".business_trips-page_main-content_title_search-input");
        domManager.templateToRender = document.querySelector(".business_trips-page_main-content_table-item_template");
        domManager.paginatorNode = document.querySelector(".business_trips-page_main-content_paginator");
        domManager.businessTripContainer = document.querySelector(".business_trips-page_main-content_table");
        domManager.emptyTemplate = document.querySelector(".business_trips-page_main-content_table-empty");
        mainInput.addEventListener("input", (e: any) => {
            handleMainSearch(e);
        });
        mainInput.addEventListener("keypress", (e: any) => {
            if ((e.keyCode === 13 || e.keyCode === 76)) {
                handleMainSearch(e);
            };
        });
        init().then(_ => {
            Context.data.first_render = false;
            //domManager.handleLoader(LoaderType.BUSINESS_TRIPS_WIDGET);
        });
    }, 300)
};

async function init(): Promise<void> {
    window.localStorage.removeItem("business_trips_filters");
    const currentUser = await System.users.getCurrentUser();
    const currentStaff = await Context.fields.staff_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(currentUser)
    )).first();

    if (!currentStaff) {
        return;
    };

    systemDataManager.currentStaff = currentStaff;
    
    await getData();

    domManager.renderStaff();
    calendarObject.setCalendars();
};

async function getBusinessTrips(): Promise<void> {
    const businessTripsCount = await Context.fields.all_business_trips.app.search().where(businessTripsFilterClosure).count();
    systemDataManager.allBusinessTrips = await Context.fields.all_business_trips.app.search().where(businessTripsFilterClosure).size(businessTripsCount).all();
};

async function getData(): Promise<void> {
    await getBusinessTrips();

    if (tableIsEmpty()) {
        return;
    };

    const [staffCount, employmentPlacementsCount, statusesCount] = await Promise.all([
        Context.fields.staff_app.app.search().where(f => f.__deletedAt.eq(null)).count(),
        Context.fields.staff_app.app.fields.employment_table.fields.employment_placement_app.app.search().where(f => f.__deletedAt.eq(null)).count(),
        Context.fields.all_statuses.app.search().where(f => f.__deletedAt.eq(null)).count()
    ]);
    [
        systemDataManager.allStaff,
        systemDataManager.allEmploymentPlacements,
        systemDataManager.statuses
    ] = await Promise.all([
        Context.fields.staff_app.app.search().where(f => f.__deletedAt.eq(null)).size(staffCount).all(),
        Context.fields.staff_app.app.fields.employment_table.fields.employment_placement_app.app.search().where(f => f.__deletedAt.eq(null)).size(employmentPlacementsCount).all(),
        Context.fields.all_statuses.app.search().where(f => f.__deletedAt.eq(null)).size(statusesCount).all()
    ]);
    domManager.serializeObjData();
    domManager.renderPaginator();
};