declare const console: any, document: any, window: any, $: any, VanillaCalendar: any;

enum FilterType {
    START_DATE = "start_date",
    END_DATE = "end_date",
    STAFF_ID = "staff_id",
    NAME = "name"
};

enum LoaderType {
    VACATIONS_CONTAINER = "vacations_table_container",
    VACATIONS_WIDGET = "vacations_widget"
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
    type_employment?: string,
};

type vacationsFilter = {
    name?: string,
    start_date?: string,
    end_date?: string,
    staff_id?: string
};

class SystemDataManager {
    statuses: ApplicationItem<Application$kedo$statuses$Data, any>[] = [];
    allEmploymentPlacements: ApplicationItem<Application$kedo$employment_directory$Data, any>[] = [];
    allStaff: ApplicationItem<Application$kedo$staff$Data, any>[] = [];
    allVacations: ApplicationItem<Application$kedo$holidays$Data, any>[] = [];
    currentStaff: ApplicationItem<Application$kedo$staff$Data, any> | undefined; 
    baseUrl = window.location.href;
};

class DomManager {
    allStatuses: ApplicationItem<Application$kedo$statuses$Data, any>[];
    allVacations: ApplicationItem<Application$kedo$holidays$Data, any>[];
    vacationNodeTemplate: any;
    vacationContainer: any;
    emptyTemplate: any;
    templateToRender: any;
    paginatorNode: any;

    renderStaff() {
        const vacationsStaffContainer = document.querySelector(".vacations-page_main-content_title_search-extend_input-staff-values");

        systemDataManager.allStaff.forEach(staff => {
            const newStaffRow = document.createElement("div");
            newStaffRow.className = "input-status-values_item";
            newStaffRow.dataset["staff_id"] = staff.id;
            newStaffRow.textContent = staff.data.__name;
            newStaffRow.addEventListener("click", () => {
                handleStaffChoice(newStaffRow)
            });
            vacationsStaffContainer.append(newStaffRow);
        });
    };

    serializeObjData() {
        dataSource = [];
        systemDataManager.allVacations.forEach(item => {
            const itemStatus = item.data.kedo_status ? systemDataManager.statuses.find(s => s.id === item.data.kedo_status?.id) : undefined;
            const employmentPlacement = item.data.employment_placement || item.data.employment_place || item.data.employment_directory;

            const data: objData = {
                name: item.data.__name,
                status: itemStatus ? itemStatus.data.name : item.data.__status && item.data.__status.status ? item.data.__status.status.name : "Не определён",
                link: `${window.location.href}(p:item/absences/vacations/${item.id})`,
                start_date: item.data.start_string || undefined,
                end_date: item.data.end_string || undefined,
                start_date_obj: item.data.start || item.data.rest_day_first || item.data.rest_day_second || item.data.__createdAt,
                end_date_obj: item.data.end || item.data.rest_day_first || item.data.rest_day_second || item.data.__createdAt,
                staffId: item.data.kedo_staff ? item.data.kedo_staff.id : undefined,
                type_employment: employmentPlacement ? systemDataManager.allEmploymentPlacements.find(employment => employment.id === employmentPlacement.id)?.data.__name : undefined
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
        const itemRow = itemContent.querySelector(".vacations-page_main-content_table-item");
        const itemName = itemRow.querySelector(".vacations-name");
        const itemStatus = itemRow.querySelector(".vacations-page_main-content_table-item-section_status");
        const itemStart = itemRow.querySelector(".vacations-start");
        const itemEnd = itemRow.querySelector(".vacations-end");
        const itemTypeEmployment = itemRow.querySelector(".vacations-type-employment");
        const [startDay, startMonth, startYear] = item.start_date ? item.start_date.split(".") : ["", "", ""];
        const [endDay, endMonth, endYear] = item.end_date ? item.end_date.split(".") : ["", "", ""];

        itemName.textContent = item.name;
        itemStatus.textContent = item.status;
        itemTypeEmployment.textContent = item.type_employment;
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
            $('.vacations-page_main-content_paginator').pagination("destroy");
        };

        const getPaginatorTemplate = this.getPaginatorTemplate.bind(domManager)

        $('.vacations-page_main-content_paginator').pagination({
            dataSource,
            callback: function(data: objData[], pagination: any) {
                const html = getPaginatorTemplate(data);
                $('.vacations-page_main-content_table-content').html(html);
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
    setCalendars() {
        const vacationsStartCalendar = new VanillaCalendar(".vacations_start-calendar", this.options);
        const vacationsEndCalendar = new VanillaCalendar(".vacations_end-calendar", this.options);
        [vacationsStartCalendar, vacationsEndCalendar].forEach(calendar => calendar.init());
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
const vacationsFilterClosure: ApplicationFilterClosure<Application$kedo$holidays$Data> = (f, g) => {
    const filters: Filter[] = [f.__deletedAt.eq(null)];
    const vacationsFilters: vacationsFilter = window.localStorage.vacations_filters ? JSON.parse(window.localStorage.getItem("vacations_filters")) : {};

    if (Object.keys(vacationsFilters).length > 0) {
        if (vacationsFilters.name) {
            filters.push(f.__name.like(vacationsFilters.name))
        };
        if (vacationsFilters.start_date) {
            const [day, month, year] = vacationsFilters.start_date.split(".").map(Number);
            const startDate = new TDate(year, month, day);
            filters.push(f.start.gte(startDate));
        };
        if (vacationsFilters.end_date) {
            const [day, month, year] = vacationsFilters.end_date.split(".").map(Number);
            const endDate = new TDate(year, month, day);
            filters.push(f.start.gte(endDate));
        };
        if (vacationsFilters.staff_id) {
            const staffRef = <TRefItem>{
                namespace: "kedo",
                code: "staff",
                id: vacationsFilters.staff_id
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

function clearFilters() {
    window.localStorage.removeItem("vacations_filters");
    const allInputs = document.querySelectorAll(".vacations-page_main-content_title_search-extend input");
    allInputs.forEach((input: any) => {
        input.value = "";
    });
};

function setFilterField(filterType: FilterType, filterValue: string) {
    const filterObject = window.localStorage.getItem("vacations_filters") ? JSON.parse(window.localStorage.getItem("vacations_filters")) : {};
    filterObject[filterType] = filterValue;
    window.localStorage.setItem("vacations_filters", JSON.stringify(filterObject));
};

async function handleMainSearch(event: any) {
    if (event.type === "keypress") {
        domManager.handleLoader(LoaderType.VACATIONS_CONTAINER);
        await getVacations();
        domManager.serializeObjData();
        domManager.renderPaginator();
        domManager.handleLoader(LoaderType.VACATIONS_CONTAINER);
        tableIsEmpty();
        return;
    };
    
    setFilterField(FilterType.NAME, event.target.value);
    const nameInput = document.querySelector(".vacations-page_main-content_title_search-extend_input[data-filter=name]");
    nameInput.value = event.target.value;
};

function setDate(event: any) {
    const [year, month, day] = [...event.target.dataset.calendarDay.split("-")];
    const dateString = `${day}.${month}.${year}`;
    const calendarInput = event.target.closest(".task-search-date").querySelector("input");
    const calendarArrow = event.target.closest(".task-search-date").querySelector(".vacations-page_main-content_title_search-extend_input-date-arrow");
    const closestCalendar = event.target.closest(".vanilla-calendar");
    const filterType: FilterType = calendarInput.dataset.filter;

    calendarArrow.style.transform = "";
    calendarInput.value = dateString;
    closestCalendar.classList.toggle("hidden");

    setFilterField(filterType, dateString);
};

async function expandSearch(target: any) {
    let expandSearchContainer: any;
    let expandModal = document.querySelector(".vacations-page-vacations_table .dropdown-modal");

    if (Array.from(target.classList).some((cls: any) => cls.includes("common-content_title_search-extend_title-img"))) {
        expandSearchContainer = target.parentElement.parentElement
    } else if (target.classList.contains("vacations-search")) {
        domManager.handleLoader(LoaderType.VACATIONS_CONTAINER);
        await getVacations();
        domManager.serializeObjData();
        domManager.renderPaginator();
        expandSearchContainer = target.closest(".vacations-page_main-content_title_search-extend");
        tableIsEmpty();
        domManager.handleLoader(LoaderType.VACATIONS_CONTAINER);
    } else {
        expandSearchContainer = target.nextElementSibling
    };

    expandSearchContainer.classList.toggle("expanded");
    console.log(expandModal)
    expandModal.classList.toggle("hidden");
};

function handleIssueDropdownModal(target: any) {
    const dropdown = document.querySelector(".vacations-page-vacations_table .common-content_title_search-extend");
    let modal: any;

    if (target.classList.contains("dropdown-modal")) {
        modal = target;
    } else {
        modal = document.querySelector(".vacations-page-vacations_table .dropdown-modal");
    };
    dropdown.classList.toggle("expanded");
    modal.classList.toggle("hidden");
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
    if (systemDataManager.allVacations.length < 1) {
        console.log("no vacations")
        domManager.emptyTemplate.classList.remove("hidden");
        domManager.vacationContainer.classList.add("hidden");
        domManager.paginatorNode.classList.add("hidden");
        return true;
    } else if (systemDataManager.allVacations.length) {
        console.log("vacations exists")
        domManager.emptyTemplate.classList.add("hidden")
        domManager.vacationContainer.classList.remove("hidden");
        domManager.paginatorNode.classList.remove("hidden");
        return false;
    };
};

async function onLoad(): Promise<void> {
    const waitForPaginator = window.setInterval(() => {
        if (!$.pagination) {
            return;
        };
        window.clearInterval(waitForPaginator);
        const mainInput = document.querySelector(".vacations-page_main-content_title_search-input");
        domManager.templateToRender = document.querySelector(".vacations-page_main-content_table-item_template");
        domManager.paginatorNode = document.querySelector(".vacations-page_main-content_paginator");
        domManager.vacationContainer = document.querySelector(".vacations-page_main-content_table");
        domManager.emptyTemplate = document.querySelector(".vacations-page_main-content_table-empty");
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
            domManager.handleLoader(LoaderType.VACATIONS_WIDGET);
        });
        const addItemButton = document.querySelector(".vacations-page_main-content_add-item");
        addItemButton.href = `${systemDataManager.baseUrl}(p:item/absences/vacations)`
    }, 300)
};

async function init(): Promise<void> {
    window.localStorage.removeItem("vacations_filters");
    const currentUser = await System.users.getCurrentUser();
    const currentStaff = await Context.fields.staff_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(currentUser)
    )).first();

    if (!currentStaff) {
        console.log("no staff")
        return;
    };

    systemDataManager.currentStaff = currentStaff

    await getData();

    domManager.renderStaff();
    calendarObject.setCalendars();

    if (!window.vacationsRefreshInterval && Context.data.refresh_data) {
        window.vacationsRefreshInterval = window.setInterval(() => {
            getData();
            console.log("vacations refresh");
        }, 60000)
    };
};

async function getVacations(): Promise<void> {
    const vacationsCount = await Context.fields.all_vacations.app.search().where(vacationsFilterClosure).count();
    systemDataManager.allVacations = await Context.fields.all_vacations.app.search().where(vacationsFilterClosure).size(vacationsCount).sort("start").all();
};

async function getData(): Promise<void> {
    await getVacations();

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
    console.log(systemDataManager.allStaff)
    domManager.serializeObjData();
    domManager.renderPaginator();
};