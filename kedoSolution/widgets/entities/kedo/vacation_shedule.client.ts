/* Client scripts module */
declare const console: any, document: any, window: any;

interface DateRange {
    startDate: TDatetime,
    endDate: TDatetime
}

interface Vacation {
    id: string;
    daysAmount: number;
    // vacationType?: TApplication<Application$absences$vacation_types$Data, any, Application$absences$vacation_types$Processes>;
    startDate: TDatetime;
    endDate: TDatetime;
    correction: boolean;
    comment: string;
}

interface PersonVacations {
    id: string;
    name: string;
    chiefId?: string;
    isOnCorrection: boolean;
    vacations: Vacation[];
}

interface VacationParts {
    dashed: boolean;
    daysAmount: number;
}

const MONTHS = ['', "янв", "фев", "марта", "апр", "мая", "июня", "июля", "авг", "сен", "окт", "ноя", "дек"];

const vacationData: PersonVacations[] = [];
const takenRanges: DateRange[] = [];
let users: any[] = [];


async function init() {
    const appIdsArr: string[] = Context.data.vacation_list
        ? await Context.data.vacation_list!.fetch().then(test => test.map((item: RefItem) => item.id))
        : []

    const vacationsArr = await Namespace.app.holidays.search().where(q => q.__id.in(appIdsArr)).size(appIdsArr.length).all()

    //find iser ids
    const userIds: Set<string> = new Set()
    for (let i = 0; i < vacationsArr.length; i++) {
        // console.log(vacationsArr[i])
        userIds.add(vacationsArr[i].data.staff!.id);
    }
    const userIdsArr: string[] = [...userIds];
    //get users
    users = await Namespace.app.staff.search().where(q => q.__id.in(userIdsArr)).size(userIdsArr.length).all();
    const promiseArr: any[] = [];
    for (let item of users) {
        promiseArr.push(item.data.__sourceRef.fetch())
    }
    users = await Promise.all(promiseArr)

    for (let i = 0; i < vacationsArr.length; i++) {
        const personsVacation = vacationData.find(item => item.id === vacationsArr[i].data.staff?.id);
        const personWasAdded = !!personsVacation;
        if (!vacationsArr[i].data.days_amount) {
            continue;
        }
        const isOnCorrection = !!(vacationsArr[i].data.__status?.code === 'correction')
        if (personWasAdded) {

            const newVacation: Vacation = {
                id: vacationsArr[i].data.__id,
                daysAmount: vacationsArr[i].data.days_amount ?? 0,
                // vacationType: vacationsArr[i].data.vacation_type,
                startDate: vacationsArr[i].data.start!.asDatetime(new TTime),
                endDate: vacationsArr[i].data.end!.asDatetime(new TTime),
                correction: isOnCorrection,
                comment: vacationsArr[i].data.staff_comment ? vacationsArr[i].data.staff_comment! : ""
            }

            if (!personsVacation?.isOnCorrection) {
                personsVacation!.isOnCorrection = isOnCorrection;
            }

            personsVacation!.vacations.push(newVacation)
            continue;
        }
        const newVacation: Vacation = {
            id: vacationsArr[i].data.__id,
            daysAmount: vacationsArr[i].data.days_amount ?? 0,
            // vacationType: vacationsArr[i].data.vacation_type,
            startDate: vacationsArr[i].data.start!.asDatetime(new TTime),
            endDate: vacationsArr[i].data.end!.asDatetime(new TTime),
            correction: isOnCorrection,
            comment: vacationsArr[i].data.staff_comment ? vacationsArr[i].data.staff_comment! : ""
        }

        const user = users.find(item => item.id === vacationsArr[i].data.staff!.id)
        const name = user?.data.__name.split(" ")

        const newPerson: PersonVacations = {
            id: vacationsArr[i].data.staff!.id,
            name: name ? `${name[0]} ${name[1][0]}.${name[2] ? name[2][0] + "." : ''}` : "Имя не найдено",
            chiefId: vacationsArr[i].data.chief?.id,
            isOnCorrection: isOnCorrection,
            vacations: [newVacation]
        }

        vacationData.push(newPerson)
    }

    renderPage();
}

const renderPage = async () => {
    renderUsers();
    await renderCalendar();
    renderVacations()
}

const renderUsers = () => {
    const root = document.querySelector(".calendar-schedule__left-menu-container");
    const template = document.querySelector(".left-menu__template");
    for (let i = 0; i < vacationData.length; i++) {
        const element = template.content.cloneNode(true);
        const text = element.querySelector(".left-menu__item-text");
        text.innerText = vacationData[i].name;
        const wrapper = element.querySelector(".left-menu__item");
        wrapper.dataset.id = vacationData[i].id

        if (vacationData[i].isOnCorrection) {
            wrapper.classList.add("left-menu-item--correction")
        }



        const user = users.find(item => item.id === vacationData[i].id)

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
        userImageText.innerText = user.data.full_name.lastname[0] + user.data.full_name.firstname[0];

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

        })

        card.addEventListener("click", (e: any) => {
            e.stopPropagation();
        })

        root.append(element)
    }
}

const renderCalendar = async () => {
    const calendarGeneralSettings = await System.productionSchedule.getGeneralSettings();
    const weekends = [calendarGeneralSettings.weekends.monday, calendarGeneralSettings.weekends.tuesday, calendarGeneralSettings.weekends.wednesday, calendarGeneralSettings.weekends.thursday,
    calendarGeneralSettings.weekends.friday, calendarGeneralSettings.weekends.saturday, calendarGeneralSettings.weekends.sunday]
    const dateRange = getRenderDateRange();
    const weekTemplate = document.querySelector(".template-calendar-week");
    const root = document.querySelector(".calendar-schedule__calendar-wrapper")
    if (dateRange) {
        while (dateRange.startDate.before(dateRange.endDate)) {
            //render week
            const element = weekTemplate.content.cloneNode(true);

            const weekText = element.querySelector(".calendar__week-header-text");
            let innerTextWeek = ''
            const startWeekText = dateRange.startDate.day;
            const endWeekText = dateRange.startDate.addDate(0, 0, 6).day;
            if (endWeekText < startWeekText) {
                innerTextWeek = `${startWeekText} ${MONTHS[dateRange.startDate.month]} - ${endWeekText} ${MONTHS[dateRange.startDate.addDate(0, 0, 6).month]}`
            } else {
                innerTextWeek = `${dateRange.startDate.day}-${dateRange.startDate.day + 6} ${MONTHS[dateRange.startDate.month]}`
            }

            weekText.innerText = innerTextWeek
            const containers: any[] = Array.from(element.querySelector(".calendar__days-wrapper").children)
            for (let i = 0; i < 7; i++) {
                const elementContainer = containers[i].querySelector('.calendar__column-day-container')
                for (let j = 0; j < vacationData.length; j++) {
                    const cell = document.createElement("div")
                    cell.classList.add("day-cell")
                    cell.dataset.userid = vacationData[j].id;
                    cell.dataset.day = dateRange.startDate.addDate(0, 0, i).format("DD.MM.YYYY")
                    elementContainer.append(cell)
                }
                containers[i].append(elementContainer)

                //weekends

                if (weekends[i]) {
                    containers[i].classList.add('calendar__day--weekend')
                }
            }

            root.append(element);

            const cell = document.createElement("div")
            cell.classList.add("day-cell")


            dateRange.startDate = dateRange.startDate.addDate(0, 0, 7);
        }
    }

}

const renderVacations = () => {
    const allRanges: DateRange[] = []
    for (let i = 0; i < vacationData.length; i++) {
        for (let j = 0; j < vacationData[i].vacations.length; j++) {
            const vacation = vacationData[i].vacations[j];
            allRanges.push({ startDate: vacation.startDate, endDate: vacation.endDate })
        }
    }
    let counterHelper = 0
    for (let i = 0; i < vacationData.length; i++) {
        for (let j = 0; j < vacationData[i].vacations.length; j++) {
            const vacation = vacationData[i].vacations[j];
            const correspondingCell = document.querySelector(`[data-day='${vacation.startDate.format("DD.MM.YYYY")}'][data-userid='${vacationData[i].id}']`)
            correspondingCell.style.zIndex = i + 1;
            const newElement = document.createElement('a');

            const vacationRenderParts: VacationParts[] = getRenderParts(allRanges, { startDate: vacation.startDate, endDate: vacation.endDate }, counterHelper)

            for (let k = 0; k < vacationRenderParts.length; k++) {
                const barPartElement = document.createElement("div");
                barPartElement.classList.add('vacation-bar__part');
                if (k === 0) {
                    barPartElement.classList.add('vacation-bar__part--start');
                }

                if (k === vacationRenderParts.length - 1) {
                    barPartElement.classList.add('vacation-bar__part--end');
                }

                if (vacationRenderParts[k].dashed) {
                    barPartElement.classList.add('vacation-bar__part--dashed')
                }

                //barPartElement.style.width = k === vacationRenderParts.length - 1 ? `${vacationRenderParts[k].daysAmount * 19.1}px` : `${vacationRenderParts[k].daysAmount * 18.8}px`;
                barPartElement.style.width = `${vacationRenderParts[k].daysAmount * 19}px`;
                newElement.append(barPartElement)
            }

            newElement.classList.add('vacation-bar')
            newElement.style.width = `${vacation.daysAmount * 19}px`;
            if (vacationData[i].vacations[j].correction) {
                newElement.classList.add('vacation-bar--correction')
            }

            //tooltip
            const tooltip = document.createElement('div')
            tooltip.classList.add('vacation-bar__tooltip')
            tooltip.innerHTML = vacationData[i].vacations[j].comment ? `<p>${vacationData[i].vacations[j].comment!}</p>` : "<p>Вернуть на изменение</p>"
            newElement.append(tooltip)

            newElement.href = `./(p:item/absences/vacations/${vacation.id})`
            newElement.addEventListener('click', (e: any) => {
                console.log('click')
                if (!vacationData[i].vacations[j].correction) {
                    //await modal loading
                    let counter = 0;
                    const checkInterval = window.setInterval(() => {
                        counter++
                        const checkElement = document.querySelector(".complex-popup-outer:not([hidden]) .fluid-nav-item .btn.btn-default");

                        if (!!checkElement && checkElement.innerText === "На корректировку") {
                            window.clearInterval(checkInterval)

                            window.setTimeout(() => {
                                checkElement.click();
                            }, 1000)

                            trackPopover(newElement, checkElement, vacationData[i].id)

                        }
                    }, 1000)
                }
            })


            takenRanges.push({ startDate: vacation.startDate, endDate: vacation.endDate })
            correspondingCell.append(newElement)

            counterHelper++
        }
    }
}

const trackPopover = (barElement: any, buttonElement: any, vacationId: string) => {
    const checkPopoverInterval = window.setInterval(() => {
        const currentPopover = document.querySelector('.popover-outer.visible');
        // console.log('test', buttonElement.closest('.complex-popup-outer:not([hidden])') )
        if (!buttonElement.closest('.complex-popup-outer:not([hidden])')) {
            window.clearInterval(checkPopoverInterval);
        }
        if (!!currentPopover) {
            const sendBtn = currentPopover.querySelector(".btn.btn-primary");
            if (sendBtn.dataset.listener !== 'true') {
                sendBtn.addEventListener("click", () => {
                    const commentInput = currentPopover.querySelector("#chief_comment");
                    if (!!commentInput.value) {
                        const leftMenuItem = document.querySelector(`[data-id='${vacationId}']`)
                        leftMenuItem.classList.add('left-menu-item--correction')

                        barElement.classList.add('vacation-bar--correction');
                        const popup = buttonElement.closest('.complex-popup__main');
                        const closeBtn = popup.querySelector(".btn.close");
                        window.clearInterval(checkPopoverInterval);
                        closeBtn?.click()
                    }
                })
                sendBtn.dataset.listener = "true"
            }

        }
    }, 1500);
}

function getRenderDateRange(): DateRange | null {
    let startDate: TDatetime | undefined;
    let endDate: TDatetime | undefined;
    for (let i = 0; i < vacationData.length; i++) {
        for (let j = 0; j < vacationData[i].vacations.length; j++) {
            const currentItem = vacationData[i].vacations[j];
            if (!startDate && !endDate) {
                startDate = currentItem.startDate;
                endDate = currentItem.endDate;
                continue;
            }

            if (startDate!.after(currentItem.startDate)) {
                startDate = currentItem.startDate;
            }

            if (endDate!.before(currentItem.endDate)) {
                endDate = currentItem.endDate;
            }

        }
    }

    if (!!startDate && !!endDate) {
        startDate = startDate.addDate(0, 0, -14)
        endDate = endDate.addDate(0, 0, 14);
        //@ts-ignore
        const startDateDay = startDate.ts.day();
        if (startDateDay !== 1) {
            startDate = startDate.addDate(0, 0, 8 - startDateDay)
        }
        //@ts-ignore
        const endDateDay = endDate.ts.day();
        if (endDateDay !== 1) {
            endDate = endDate.addDate(0, 0, -endDateDay)
        }
        return {
            startDate,
            endDate
        }
    }

    return null


}

const getRenderParts = (ranges: DateRange[], itemRange: DateRange, skipIndex?: number): VacationParts[] => {
    const parts: VacationParts[] = [];
    const isStartDateCrossed = !!ranges.find((item, index) => {
        if (index !== skipIndex) {
            if (
                (itemRange.startDate.year === item.startDate.year && itemRange.startDate.month === item.startDate.month && itemRange.startDate.day === item.startDate.day)
                || (itemRange.startDate.year === item.endDate.year && itemRange.startDate.month === item.endDate.month && itemRange.startDate.day === item.endDate.day)
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
    itemRange.startDate = itemRange.startDate.addDate(0, 0, 1)

    while (!itemRange.startDate.after(itemRange.endDate)) {
        const isCurrentDayCrossed = !!ranges.find((item, index) => {
            if (index !== skipIndex) {
                if (
                    (itemRange.startDate.year === item.startDate.year && itemRange.startDate.month === item.startDate.month && itemRange.startDate.day === item.startDate.day)
                    || (itemRange.startDate.year === item.endDate.year && itemRange.startDate.month === item.endDate.month && itemRange.startDate.day === item.endDate.day)
                    || (itemRange.startDate.after(item.startDate) && itemRange.startDate.before(item.endDate))
                ) {
                    return true
                }
            }

            return false;
        })

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
}