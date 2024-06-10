declare const console: any;
declare const document: any;

const fieldReferences = {
    baseVacations: {
        search_field_name: "staff_docs_new",
        start_date: "start_date",
        end_date: "end_date",
        duration: "duration",
        staff: "staff",
        status: "line_status"
    },
    additionalVacations: {
        search_field_name: "vacations_contract",
        start_date: "start",
        end_date: "end",
        duration: "amount_of_days",
        staff: "kedo_staff",
        status: "status"
    },
    baseBusinessTrips: {
        search_field_name: "staff_docs_new",
        start_date: "start_date",
        end_date: "end_date",
        duration: "duration",
        staff: "staff",
        status: "line_status"
    },
    additionalBusinessTrips: {
        search_field_name: "business_trips_contract",
        start_date: "start_date",
        end_date: "end_date",
        duration: "duration",
        staff: "kedo_staff",
        status: "status"
    }
};


let vacationFieldFilters: filterFields;
let businessTripsFieldFilters: filterFields;
let users: ApplicationItem<Application$kedo$staff$Data, any>[] = [];
let subdivisions: ApplicationItem<Application$kedo$structural_subdivision$Data, any>[] = [];
let userCategories: ApplicationItem<Application$kedo$employees_categories$Data, any>[] = [];
let vacationsListMain: ItemData[] = [];
let businessTripsMain: ItemData[] = [];
let overtimeWorkMain: ItemData[] = [];
let allAbsences: absense[] = [];
let vacationsSearch: any;
let businessTripsSearch: any;
let overworkSearch: any;
let vacationData: PersonVacations[] = [];
let takenRanges: DateRange[] = [];
let absenseUsers: ApplicationItem<Application$kedo$staff$Data, any>[] = [];
let dateRange: DateRange;
let absenseFromDateLimit = new TDate();
let absenseToDateLimit = new TDate();
const weekDayReferences = [
    "вс",
    "пн",
    "вт",
    "ср",
    "чт",
    "пт",
    "сб"
];
const MONTHS = ['', "янв", "фев", "марта", "апр", "мая", "июня", "июля", "авг", "сен", "окт", "ноя", "дек"];
const colorReferences = {
    business_trip: "#6BD67C",
    common: "#6BAAD8",
    restrict_cancel: "#FF7976",
    pregnancy: "#FFA900",
    child_care: "#FFA900",
    sick_leave: "#8F04A8"
};

interface DateRange {
    startDate: TDate,
    endDate: TDate
};

interface PersonVacations {
    id: string;
    name: string;
    vacations: absense[];
};

interface VacationParts {
    dashed: boolean;
    daysAmount: number;
};

type filterFields = {
    search_field_name: string,
    start_date: string,
    end_date: string,
    duration: string,
    staff: string,
};

type absense = {
    id: string,
    staff_id: string,
    days_amount: number,
    from_date: TDate,
    to_date: TDate,
    comment?: string,
    absence_type: string,
    absence_link: string,
    restrict_cancel: boolean,
    vacation_type: string,
    from_date_for_render: string,
    to_date_for_render: string,
    vacation_type_name: string
};

type colorKey = keyof typeof colorReferences;

function setFieldReference() {
    businessTripsFieldFilters = Context.data.business_trips_exists ? fieldReferences.additionalBusinessTrips : fieldReferences.baseBusinessTrips;
    vacationFieldFilters = Context.data.vacations_exists ? fieldReferences.additionalVacations : fieldReferences.baseVacations;
};

function addVacationType(event: any) {
    let vacationCode = event.target.dataset.variant;

    if (Context.data.vacation_types_ids.indexOf(vacationCode) == -1) {
        Context.data.vacation_types_ids.push(vacationCode);
    } else {
        let codeIndex = Context.data.vacation_types_ids.indexOf(vacationCode);
        Context.data.vacation_types_ids.splice(codeIndex, 1);
    };
};

async function handleVariantsDisplay(): Promise<void> {
    Context.data.show_vacation_variants = ["all", "vacations"].indexOf(Context.data.absence_type!.code) != -1;
};

async function getAndSetDateRange() {
    let now = new TDate();
    let fromDate = new TDate(now.year, now.month, 1);
    let toDate = fromDate.addDate(0, 1, -1);
    Context.data.from_date = fromDate;
    Context.data.to_date = toDate;
}

async function getOptions(): Promise<void> {
    const kedoOptions = Context.fields.kedo_options.app;
    const vacationsIncluded = await kedoOptions.search().where(f => f.code.eq("podklyuchen_razdel_otpuskov")).first().then(item => item!.data.status);
    const businessTripsIncluded = await kedoOptions.search().where(f => f.code.eq("travel_section_added")).first().then(item => item!.data.status);
    Context.data.vacations_exists = vacationsIncluded;
    Context.data.business_trips_exists = businessTripsIncluded;
};

async function onInit(): Promise<void> {
    Context.data.vacation_types_ids = [];
    await getOptions();
    setFieldReference();
    await getAndSetDateRange();
    [subdivisions, userCategories] = await Promise.all([
        await Context.fields.subdivision.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all(),
        await Namespace.app.employees_categories.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    ]);
};

async function getAbsences(): Promise<void> {
    clearCalendar();
    let dismissedUsersIds: string[];
    users = await Context.fields.staff.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    if (Context.data.staff_types && Context.data.staff_types.code == "in_work") {
        dismissedUsersIds = users.filter(user => user.data.__status!.code == "dismissed").map(user => user.id);
        users = users.filter(user => user.data.__status!.code != "dismissed");
    };
    allAbsences = [];
    let fromDate = Context.data.from_date!;
    let toDate = Context.data.to_date!;
    const vacationSearchExists = ["all", "vacations"].indexOf(Context.data.absence_type!.code) != -1;
    const businesstripSearchExists = ["all", "business_trips"].indexOf(Context.data.absence_type!.code) != -1;
    const overtimeWorkExists = Context.data.show_overwork;

    if (overtimeWorkExists) {
        overworkSearch = Context.fields.staff_docs_new.app.search().size(10000).where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.line_status.neq(null),
            f.start_date.neq(null),
            f.duration.neq(null),
            f.staff.neq(null),
            f.__name.like("сверхуроч")
        ));
    };

    if (vacationSearchExists) {
        //@ts-ignore
        vacationsSearch = Context.fields[vacationFieldFilters.search_field_name].app.search().size(10000).where((f: any, g: any) => g.and(
            f.__deletedAt.eq(null),
            f[vacationFieldFilters.start_date].neq(null),
            f[vacationFieldFilters.end_date].neq(null),
            // f[vacationFieldFilters.status].neq(null),
            f[vacationFieldFilters.staff].neq(null)
        ));
    };

    if (businesstripSearchExists) {
        //@ts-ignore
        businessTripsSearch = Context.fields[businessTripsFieldFilters.search_field_name].app.search().size(10000).where((f: any, g: any) => g.and(
            f.__deletedAt.eq(null),
            f[businessTripsFieldFilters.start_date].neq(null),
            f[businessTripsFieldFilters.end_date].neq(null),
            // f[businessTripsFieldFilters.status].neq(null),
            f[businessTripsFieldFilters.staff].neq(null)
        ));
    };

    if (!Context.data.vacations_exists) {
        vacationsSearch.where((f: any, g: any) => g.and(
            f.__name.like("отпуск"),
            f.__name.like("приказ")
        ));
    };

    if (!Context.data.business_trips_exists) {
        businessTripsSearch.where((f: any, g: any) => g.and(
            f.__name.like("командировку"),
            f.__name.like("приказ")
        ))
    };

    if (Context.data.from_date) {
        if (vacationSearchExists) {
            vacationsSearch.where((f: any, g: any) => g.and(
                f[vacationFieldFilters.end_date].gte(fromDate)
            ));
        };
        if (businesstripSearchExists) {
            businessTripsSearch.where((f: any, g: any) => g.and(
                f[businessTripsFieldFilters.end_date].gte(fromDate.asDatetime(new TTime))
            ));
        };
        if (overtimeWorkExists) {
            overworkSearch.where((f: any) => f.start_date.gte(Context.data.from_date));
        };
    };
    if (Context.data.to_date) {
        if (overtimeWorkExists) {
            overworkSearch.where((f: any) => f.start_date.lte(Context.data.to_date));
        };
        if (vacationSearchExists) {
            vacationsSearch.where((f: any, g: any) => g.and(
                f[vacationFieldFilters.start_date].lte(toDate)
            ));
        };
        if (businessTripsSearch) {
            businessTripsSearch.where((f: any, g: any) => g.and(
                f[businessTripsFieldFilters.start_date].lte(toDate.asDatetime(new TTime)),
            ));
        };
    };
    if (vacationSearchExists) {
        vacationsListMain = await vacationsSearch.all();
    };
    if (businesstripSearchExists) {
        businessTripsMain = await businessTripsSearch.all();
    };
    if (overtimeWorkExists) {
        overtimeWorkMain = await overworkSearch.all();
    };

    if (Context.data.vacation_types_ids && Context.data.vacation_types_ids.length > 0 && vacationSearchExists) {
        if (Context.data.vacations_exists) {
            vacationsListMain = vacationsListMain.filter(vacation => Context.data.vacation_types_ids.indexOf(vacation.data.type_of?.code) != -1);
        } else {
            vacationsListMain = vacationsListMain.filter(vacation => Context.data.vacation_types_ids.indexOf(vacation.data.__sourceRef.code) != -1);
        };
    };

    if (vacationSearchExists) {
        vacationsListMain = vacationsListMain.filter(vacation => !vacation.data[vacationFieldFilters.start_date].after(vacation.data[vacationFieldFilters.end_date]));
    };
    if (businesstripSearchExists) {
        businessTripsMain = businessTripsMain.filter(trip => !trip.data[businessTripsFieldFilters.start_date].after(trip.data[businessTripsFieldFilters.end_date]));
    };

    if (!!Context.data.staff && Context.data.staff?.length > 0) {
        let staffUsers = await Promise.all([...Context.data.staff!.map(async user => await user.fetch())]).then(users => users.map(u => u.id))

        if (overtimeWorkExists) {
            overtimeWorkMain = overtimeWorkMain.filter((work) => {
                if (!work.data.staff) {
                    return;
                };
                return staffUsers.indexOf(work.data.staff.id) != -1;
            });
        };
        if (vacationSearchExists) {
            vacationsListMain = vacationsListMain.filter((vacation) => {
                if (!vacation.data[vacationFieldFilters.staff]) {
                    return false;
                };
                return staffUsers.indexOf(vacation.data[vacationFieldFilters.staff].id) != -1
            });
        };
        if (businesstripSearchExists) {
            businessTripsMain = businessTripsMain.filter((trip) => {
                if (!trip.data[businessTripsFieldFilters.staff]) {
                    return false;
                };
                return staffUsers.indexOf(trip.data[businessTripsFieldFilters.staff].id) != -1;
            });
        };
    };
    if (!!Context.data.organization) {
        let organizationId = Context.data.organization!.id;
        if (overtimeWorkExists) {
            overtimeWorkMain = overtimeWorkMain.filter(work => {
                let staffUser = users.find(user => user.id == work.data.staff?.id);
                if (!staffUser) {
                    return;
                };
                return staffUser.data.organization?.id == organizationId;
            });
        }
        if (vacationSearchExists) {
            vacationsListMain = vacationsListMain.filter((v) => {
                let staffUser = users.find(user => user.id == v.data[vacationFieldFilters.staff].id);

                if (!staffUser) {
                    return false;
                };

                return staffUser.data.organization!.id == organizationId;
            });
        };
        if (businesstripSearchExists) {
            businessTripsMain = businessTripsMain.filter((trip) => {
                let travelingUser = users.find(user => user.id == trip.data[businessTripsFieldFilters.staff].id);

                if (!travelingUser) {
                    return false;
                };

                return travelingUser.data.organization?.id == organizationId
            });
        };
    };

    if (!!Context.data.subdivision) {
        let subdivisionId = Context.data.subdivision!.id;
        if (overtimeWorkExists) {
            overtimeWorkMain = overtimeWorkMain.filter((work) => {
                let staffUser = users.find(user => user.id == work.data.staff?.id);
                if (!staffUser) {
                    return;
                };
                return staffUser.data.structural_subdivision?.id == subdivisionId;
            });
        }
        if (vacationSearchExists) {
            vacationsListMain = vacationsListMain.filter((vacation) => {
                let user = users.find(u => u.id == vacation.data[vacationFieldFilters.staff].id);

                if (!user) {
                    return false;
                };

                return user.data.structural_subdivision?.id == subdivisionId;
            });
        };
        if (businesstripSearchExists) {
            businessTripsMain = businessTripsMain.filter((trip) => {
                let travellingUser = users.find(u => u.id == trip.data[businessTripsFieldFilters.staff].id);

                if (!travellingUser) {
                    return false;
                };

                return travellingUser.data.structural_subdivision?.id == subdivisionId;
            });
        };
    };
    if (Context.data.staff_types && Context.data.staff_types.code == "in_work") {
        if (vacationSearchExists) {
            vacationsListMain = vacationsListMain.filter(vacation => dismissedUsersIds.indexOf(vacation.data[vacationFieldFilters.staff].id) == -1);
        };
        if (businesstripSearchExists) {
            businessTripsMain = businessTripsMain.filter(trip => dismissedUsersIds.indexOf(trip.data[businessTripsFieldFilters.staff].id) == -1);
        };
        if (overtimeWorkExists) {
            overtimeWorkMain = overtimeWorkMain.filter(work => dismissedUsersIds.indexOf(work.data.staff.id) == -1);
        };
    };

    if (vacationSearchExists) {
        vacationsListMain.forEach(vacation => serializeData(vacation));
    };
    if (businesstripSearchExists) {
        businessTripsMain.forEach(trip => serializeData(trip));
    };

    if (vacationsListMain.length < 1 && businessTripsMain.length < 1) {
        Context.data.absences_empty = true;
        return;
    };
    console.log(allAbsences)
    await renderGantt();
};

async function serializeData(absence: any) {
    let absenseObj: absense;
    let id: string = "";
    let staff_id: string = "";
    let days_amount: number = 0;
    let from_date: TDate;
    let to_date: TDate;
    let absence_type: string = "";
    let absence_link: string = "";
    let absenseIsBusinessTrip = ["business_trips", "memo_business_trip"].indexOf(absence.code) != -1;
    let serializeFieldsReference = absenseIsBusinessTrip ? businessTripsFieldFilters : vacationFieldFilters;
    let userIdMock = "123456"
    let restrict_cancel: boolean = false;
    let vacation_type: string = "";
    let user = users.find(u => u.id == absence.data[serializeFieldsReference.staff].id);
    let userCategoryIds = user!.data.staff_categories?.map(category => category.id) || [];
    let fetchedCategories = userCategories.filter(category => userCategoryIds.indexOf(category.id) != -1);
    let vacation_type_name: string = "";
    let fromDateString: string = "";
    let toDateString: string = "";

    if (fetchedCategories.some(category => !category.data.possibility_recall_from_vacation)) {
        restrict_cancel = true;
    };

    id = absence.id;
    staff_id = user?.id || userIdMock;
    days_amount = absence.data[serializeFieldsReference.duration];

    if (absenseIsBusinessTrip) {
        let tripFromDate = absence.data[serializeFieldsReference.start_date];
        let tripToDate = absence.data[serializeFieldsReference.end_date];
        from_date = tripFromDate
        to_date = tripToDate
        if (Context.data.business_trips_exists) {
            fromDateString = absence.data.start_date_string;
            toDateString = absence.data.end_date_string;
        }
    } else {
        let vacationFromDate = absence.data[serializeFieldsReference.start_date];
        let vacationToDate = absence.data[serializeFieldsReference.end_date];
        from_date = vacationFromDate
        to_date = vacationToDate
        if (Context.data.vacations_exists) {
            fromDateString = absence.data.start_string;
            toDateString = absence.data.end_string;
        }
    };

    absence_type = absenseIsBusinessTrip ? "business_trips" : "vacations";

    if (absence.data.__sourceRef) {
        const sourceRef = absence.data.__sourceRef;
        absence_link = `./(p:item/${sourceRef.namespace}/${sourceRef.code}/${sourceRef.id})`;
    } else {
        absence_link = `./(p:item/${absence.namespace}/${absence.code}/${id})`;
    }
    
    restrict_cancel = false;
    vacation_type = absence.data.type_of?.code || undefined;

    if (absence.data.type_of) {
        vacation_type_name = absence.data.type_of.name;
    } else if (!absenseIsBusinessTrip) {
        vacation_type_name = absence.data.__sourceRef.code == "leave_without_pay" ? "Отпуск без сохранения заработной платы" : "Ежегодный отпуск"
    } else {
        vacation_type_name = "Командировка"
        vacation_type = "business_trip"
    };


    absenseObj = {
        id,
        staff_id,
        days_amount,
        from_date,
        to_date,
        absence_type,
        absence_link,
        restrict_cancel,
        vacation_type,
        to_date_for_render: toDateString,
        from_date_for_render: fromDateString,
        vacation_type_name
    };

    allAbsences.push(absenseObj)
};

// DOM render
async function renderGantt(): Promise<void> {
    vacationData = [];
    takenRanges = [];

    for (let absense of allAbsences) {
        const personsVacation = vacationData.find(item => item.id === absense.staff_id);
        const personWasAdded = !!personsVacation;

        if (personWasAdded) {
            personsVacation!.vacations.push(absense)
            continue;
        };

        const user = users.find(u => u.id == absense.staff_id)!;
        const name = user.data.__name;

        const newPerson: PersonVacations = {
            id: absense.staff_id,
            name: name,
            vacations: [absense]
        };
        vacationData.push(newPerson)
    };
    await renderPage();
};

async function renderPage() {
    await renderUsers();
    await renderCalendar();
    renderVacations();
};

function addStaffAtWork(staff: ApplicationItem<Application$kedo$staff$Data, any>[]) {
    const root = document.querySelector(".calendar-schedule__left-menu-container");
    const template = document.querySelector(".left-menu__template");

    for (let user of staff) {
        const element = template.content.cloneNode(true);
        const text = element.querySelector(".left-menu__item-text");
        text.innerText = user.data.__name;
        const wrapper = element.querySelector(".left-menu__item");
        wrapper.dataset.id = user.data.__id

        const card = element.querySelector(".user-card");
        card.dataset.key = user.data.__id

        const cardName = card.querySelector(".user-card__name");
        cardName.innerText = user.data.__name;


        if (user.data.email) {
            const cardEmail = card.querySelector(".user-card__email");
            cardEmail.innerText = user.data.email?.email;
            cardEmail.href = `mailto: ${user.data.email?.email}`
        }

        if (user.data.phone) {
            const cardPhone = card.querySelector(".user-card__phone");
            cardPhone.innerText = user.data.phone?.tel;
        }

        const userImageText = element.querySelector(".user-card__image-text");
        let userNameArray = user.data.__name.split(" ")
        userImageText.innerText = userNameArray.length > 1 ? userNameArray[0][0] + userNameArray[1][0] : userNameArray[0];

        const userTextElement = element.querySelector(".left-menu__item");

        userTextElement.addEventListener("click", async (e: any) => {
            e.stopPropagation();
            const activeCard = document.querySelector(".user-card--active");
            if (!!activeCard) {
                activeCard.classList.remove("user-card--active")
            }

            if (activeCard?.dataset.key === user.data.__id) return;

            const userCard = document.querySelector(`[data-key='${user.data.__id}']`);
            userCard.classList.toggle("user-card--active");

        });

        card.addEventListener("click", (e: any) => {
            e.stopPropagation();
        });

        root.append(element);
    }
}

async function renderUsers() {
    const root = document.querySelector(".calendar-schedule__left-menu-container");
    const template = document.querySelector(".left-menu__template");

    for (let absense of vacationData) {
        const user = users.find(item => item.id === absense.id);

        if (!user) {
            continue;
        };

        const element = template.content.cloneNode(true);
        const text = element.querySelector(".left-menu__item-text");
        const wrapper = element.querySelector(".left-menu__item");
        const card = element.querySelector(".user-card");
        const cardName = card.querySelector(".user-card__name");

        text.innerText = absense.name;
        wrapper.dataset.id = absense.id
        card.dataset.key = absense.id

        cardName.innerText = absense.name;

        if (user.data.email) {
            const cardEmail = card.querySelector(".user-card__email");
            cardEmail.innerText = user.data.email?.email;
            cardEmail.href = `mailto: ${user.data.email?.email}`
        }

        if (user.data.phone) {
            const cardPhone = card.querySelector(".user-card__phone");
            cardPhone.innerText = user.data.phone?.tel;
        }

        const userImageText = element.querySelector(".user-card__image-text");
        let userNameArray = user.data.__name.split(" ")
        userImageText.innerText = userNameArray[0][0] + userNameArray[1][0];

        const userTextElement = element.querySelector(".left-menu__item");

        userTextElement.addEventListener("click", async (e: any) => {
            e.stopPropagation();
            const activeCard = document.querySelector(".user-card--active");
            if (!!activeCard) {
                activeCard.classList.remove("user-card--active")
            }

            if (activeCard?.dataset.key === user.data.__id) return;

            const userCard = document.querySelector(`[data-key='${user.data.__id}']`);
            userCard.classList.toggle("user-card--active");

        });

        card.addEventListener("click", (e: any) => {
            e.stopPropagation();
        });
        root.appendChild(element);
    };

    if (Context.data.staff_types && Context.data.staff_types.code !== "missing") {
        const staffAtWork = users.filter(user => vacationData.map(data => data.id).indexOf(user.id) == -1);
        addStaffAtWork(staffAtWork)
    };
};

const renderCalendar = async () => {
    dateRange = { startDate: Context.data.from_date!, endDate: Context.data.to_date! };
    const weekTemplate = document.querySelector(".template-calendar-week");
    const root = document.querySelector(".calendar-schedule__calendar-wrapper");

    while (dateRange.startDate.before(dateRange.endDate)) {
        //render week
        const element = weekTemplate.content.cloneNode(true);
        let dayElements = element.querySelectorAll(".calendar__day-number");
        let weekDaysElements = element.querySelectorAll(".calendar__week-day p");
        let weekStart = dateRange.startDate;

        for (let i = 0; i <= 6; i++) {
            let weekDate = new Date(weekStart.format());
            let weekDay = weekDate.getDay();
            let weekDayName = weekDayReferences[weekDay];
            weekDaysElements[i].innerText = weekDayName;
            weekStart = weekStart.addDate(0, 0, 1)
        }

        let dayNumber = dateRange.startDate.day;

        let i = 0;

        for (i; i <= 6; i++) {
            let dayText = dayElements[i].querySelector("p");
            dayText.innerText = dayNumber;
            dayNumber = dateRange.startDate.addDate(0, 0, i + 1).day;
        };

        const weekText = element.querySelector(".calendar__week-header-text");
        let innerTextWeek = '';
        const startWeekText = dateRange.startDate.day;
        const endWeekText = dateRange.startDate.addDate(0, 0, 6).day;

        if (endWeekText < startWeekText) {
            innerTextWeek = `${startWeekText} ${MONTHS[dateRange.startDate.month]} - ${endWeekText} ${MONTHS[dateRange.startDate.addDate(0, 0, 6).month]}`
        } else {
            innerTextWeek = `${dateRange.startDate.day}-${dateRange.startDate.day + i} ${MONTHS[dateRange.startDate.month]}`
        };

        weekText.innerText = innerTextWeek
        const containers: any[] = Array.from(element.querySelector(".calendar__days-wrapper").children);
        for (let f = 0; f < i + 1; f++) {
            if (f >= 7) {
                continue;
            }
            const elementContainer = containers[f].querySelector('.calendar__column-day-container');

            for (let j = 0; j < vacationData.length; j++) {
                const cell = document.createElement("div");
                cell.classList.add("day-cell");
                cell.dataset.userid = vacationData[j].id;
                cell.dataset.day = dateRange.startDate.addDate(0, 0, f).format("DD.MM.YYYY")
                elementContainer.append(cell)
            }
            containers[f].append(elementContainer)

            //weekends
            let weekDay = containers[f].querySelector(".calendar__week-day p").innerText;
            if (weekDay == "пт" || weekDay == "сб") {
                containers[f].classList.add('calendar__day--weekend')
            }
        }

        let weekWrapper = element.querySelector(".calendar__days-wrapper");
        root.append(element);
        let minWidth = Math.floor(18 * i);
        weekWrapper.style.minWidth = `${minWidth}px`;

        const cell = document.createElement("div")
        cell.classList.add("day-cell")

        dateRange.startDate = dateRange.startDate.addDate(0, 0, 7);
    };

    absenseFromDateLimit = Context.data.from_date!;
    let lastWeekWrapper = <any>Array.from(document.querySelectorAll(".calendar__days-wrapper")).slice(-1)[0];
    let lastDayWrapper = <any>Array.from(lastWeekWrapper.querySelectorAll(".calendar__day")).slice(-1)[0];
    let lastDayDate = lastDayWrapper.querySelector(".calendar__column-day-container .day-cell").dataset.day;
    let dateArray = lastDayDate.split(".");
    let [day, month, year] = [dateArray[0], dateArray[1], dateArray[2]];
    absenseToDateLimit = new TDate(year, month, day);
    setMinMaxDates();
};

function setTooltipOffset(tooltip: any) {
    let offsetX = Math.ceil(tooltip.previousSibling.offsetWidth / 2) + Math.ceil(tooltip.offsetWidth / 2);
    tooltip.style.transform = `translateX(${offsetX}px)`;
};

const renderVacations = () => {
    const allRanges: DateRange[] = []
    const root = document.querySelector(".calendar-schedule__calendar-wrapper");
    const leftBorder = root.getBoundingClientRect().x;
    const rightBorder = root.getBoundingClientRect().width + root.getBoundingClientRect().x

    for (let personVacations of vacationData) {
        for (let vacation of personVacations.vacations) {
            allRanges.push({ startDate: vacation.from_date, endDate: vacation.to_date })
        };
    };

    let counterHelper = 0

    for (let personVacations of vacationData) {
        let userNameArr = personVacations.name.split(" ");
        let userName = userNameArr.length > 2 ? `${userNameArr[0]} ${userNameArr[1][0]}. ${userNameArr[2][0]}.` : `${userNameArr[0]} ${userNameArr[1][0]}.`

        for (let vacation of personVacations.vacations) {

            let vacationFromDate = vacation.from_date_for_render;
            let vacationToDate = vacation.to_date_for_render;
            let correspondingCell = document.querySelector(`[data-day='${vacation.from_date.format("DD.MM.YYYY")}'][data-userid='${personVacations.id}']`)
            // correspondingCell.style.zIndex = i + 1;

            const newElement = document.createElement('a');
            let tooltipBackgroundColor = "";

            const vacationRenderParts: VacationParts[] = getRenderParts(allRanges, { startDate: vacation.from_date, endDate: vacation.to_date }, counterHelper)
            console.log(vacationRenderParts)

            for (let k = 0; k < vacationRenderParts.length; k++) {
                const barPartElement = document.createElement("div");
                barPartElement.classList.add('vacation-bar__part');
                let borderColor = vacation.restrict_cancel ? colorReferences["restrict_cancel" as colorKey] : colorReferences[vacation.vacation_type as colorKey] || colorReferences.common;
                tooltipBackgroundColor = borderColor;
                barPartElement.style.border = `2px solid ${borderColor}`;

                if (k === 0) {
                    barPartElement.classList.add('vacation-bar__part--start');
                }

                if (k === vacationRenderParts.length - 1) {
                    barPartElement.classList.add('vacation-bar__part--end');
                }

                if (vacationRenderParts[k].dashed) {
                    barPartElement.classList.add("dashed");
                    barPartElement.style.background = `repeating-linear-gradient(45deg, ${borderColor} 0, ${borderColor} 2px, rgb(107 170 216 / 0%) 3px, rgb(107 170 216 / 0%) 5px)`

                    if (k !== 0) {
                        barPartElement.style.borderLeft = `0`
                    };
                };

                //barPartElement.style.width = k === vacationRenderParts.length - 1 ? `${vacationRenderParts[k].daysAmount * 19.1}px` : `${vacationRenderParts[k].daysAmount * 18.8}px`;
                barPartElement.style.width = `${vacationRenderParts[k].daysAmount * 18.2}px`;
                newElement.append(barPartElement)
            };

            newElement.classList.add('vacation-bar');
            // newElement.style.width = `${vacation.daysAmount * 19}px`;
            // if (vacationData[i].vacations[j].correction) {
            //     newElement.classList.add('vacation-bar--correction')
            // }

            //tooltip
            const tooltip = document.createElement('div');
            tooltip.classList.add('vacation-bar__tooltip');
            tooltip.style.backgroundColor = tooltipBackgroundColor;
            tooltip.innerHTML = `${userName}<br>${vacation.vacation_type_name}<br>${vacationFromDate} - ${vacationToDate}`;

            newElement.href = vacation.absence_link

            takenRanges.push({ startDate: vacation.from_date, endDate: vacation.to_date })

            newElement.addEventListener("mousemove", (e: any) => {
                let tooltip = newElement.nextElementSibling;
                let rect = e.target.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let tooltipWidth = tooltip.getBoundingClientRect().width;
                let toolTipOffset = x - tooltipWidth;
                let oldLeftValue = tooltip.style.left;

                if (tooltip.getBoundingClientRect().x < leftBorder) {
                    toolTipOffset += leftBorder - tooltip.getBoundingClientRect().x;
                } else if (tooltip.getBoundingClientRect().x + tooltipWidth > rightBorder) {
                    let tooltipRightBorder = tooltip.getBoundingClientRect().x + tooltipWidth;
                    toolTipOffset += rightBorder - tooltipRightBorder
                };

                tooltip.style.left = `${toolTipOffset}px`;
                if (tooltip.getBoundingClientRect().x < leftBorder) {
                    tooltip.style.left = oldLeftValue;
                } else if (tooltip.getBoundingClientRect().x + tooltipWidth > rightBorder) {
                    tooltip.style.left = oldLeftValue;
                };
            });

            correspondingCell.append(newElement)
            correspondingCell.append(tooltip)

            // setTooltipOffset(tooltip)
            counterHelper++
        };
    };
    if (!!overtimeWorkMain && overtimeWorkMain.length > 0) {
        setTimeTrackingDots();
    };
};

async function setTimeTrackingDots() {
    let dayCells = document.querySelectorAll(".day-cell");

    for (let cell of dayCells) {
        let cellDay = cell.getAttribute("data-day");
        let cellUserId = cell.getAttribute("data-userid");

        let trackingDot = overtimeWorkMain.find((item) => {
            return item.data.staff.id == cellUserId && item.data.start_date.format("DD.MM.YYYY") == cellDay;
        });

        if (!!trackingDot) {
            const tooltip = document.createElement('div')
            let user = users.find(u => u.id == trackingDot!.data.staff.id)
            let newDot = document.createElement("div");
            let hours = trackingDot.data.duration;
            let hoursSpelling: string = "";

            switch (true) {
                case (hours < 2):
                    hoursSpelling = "час";
                    break;
                case (hours > 1 && hours < 5):
                    hoursSpelling = "часа";
                    break;
                case (hours > 4 && hours < 21):
                    hoursSpelling = "часов";
                    break;
                case (hours.toString().split("")[0] == "1"):
                    hoursSpelling = "часа";
                    break;
                default:
                    hoursSpelling = "часов"
            };

            tooltip.classList.add('vacation-bar__tooltip');
            tooltip.style.backgroundColor = "#5eafd8";
            tooltip.innerHTML = `${user!.data.__name}<br>${trackingDot.data.__name}<br>${trackingDot.data.start_date.format("DD.MM.YY")} (${hours} ${hoursSpelling})`
            newDot.className = "time-tracking-dot";
            cell.appendChild(newDot);
            cell.appendChild(tooltip);
            setTooltipOffset(tooltip)
        };
    };
};

function clearCalendar() {
    let leftMenuRoot = document.querySelector(".calendar-schedule__left-menu-container");
    let calendarRoot = document.querySelector(".calendar-schedule__calendar-wrapper");

    leftMenuRoot.innerHTML = "";
    calendarRoot.innerHTML = "";
};

function setMinMaxDates() {
    vacationData.forEach((data) => {
        data.vacations.forEach((vacation) => {
            if (vacation.from_date.before(absenseFromDateLimit.asDatetime(new TTime))) {
                vacation.from_date = absenseFromDateLimit;
            };
            if (vacation.to_date.after(absenseToDateLimit.asDatetime(new TTime))) {
                vacation.to_date = absenseToDateLimit;
            };
        });
    });
};

function getRenderParts(ranges: DateRange[], itemRange: DateRange, skipIndex?: number): VacationParts[] {
    const parts: VacationParts[] = [];
    const isStartDateCrossed = !!ranges.find((item, index) => {
        if (index !== skipIndex) {
            if (
                itemRange.startDate.format("DD.MM.YY") === item.startDate.format("DD.MM.YY")
                || itemRange.endDate.format("DD.MM.YY") === item.endDate.format("DD.MM.YY")
                || itemRange.endDate.format("DD.MM.YY") === item.startDate.format("DD.MM.YY")
                || itemRange.startDate.format("DD.MM.YY") === item.endDate.format("DD.MM.YY")
                || (itemRange.endDate.before(item.endDate) && itemRange.endDate.after(item.startDate))
                || (itemRange.startDate.after(item.startDate) && itemRange.startDate.before(item.endDate))
            ) {
                return true
            }
        }

        return false;
    })
    parts.push({
        daysAmount: 1,
        dashed: isStartDateCrossed
    })
    let currentIndex = 0;
    itemRange.startDate = itemRange.startDate.addDate(0, 0, 1);

    while (!itemRange.startDate.after(itemRange.endDate)) {
        const isCurrentDayCrossed = !!ranges.find((item, index) => {
            if (index !== skipIndex) {
                if (
                    itemRange.startDate.equal(item.startDate)
                    || itemRange.endDate.equal(item.endDate)
                    || itemRange.endDate.equal(item.startDate)
                    || itemRange.startDate.equal(item.endDate)
                    || (itemRange.endDate.before(item.endDate) && itemRange.endDate.after(item.startDate))
                    || (itemRange.startDate.after(item.startDate) && itemRange.startDate.before(item.endDate))
                ) {
                    return true
                }
            }

            return false;
        });

        const currentItem = parts[currentIndex];
        if (currentItem.dashed !== isCurrentDayCrossed) {
            currentIndex++
            parts.push({
                daysAmount: 1,
                dashed: isCurrentDayCrossed
            })
        } else {
            parts[currentIndex].daysAmount++;
        }

        itemRange.startDate = itemRange.startDate.addDate(0, 0, 1);
    }

    return parts;
};