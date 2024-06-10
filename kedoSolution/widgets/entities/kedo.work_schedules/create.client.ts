declare const window: any;
declare const console: any;
declare const document: any;

// import * as globalVars from "vars.js";

type dateInfo = {
    isHoliday?: boolean,
    isDayOff?: boolean,
    date: string,
    dateForCalendar: string,
    isPreDayOff?: boolean,
    description?: string
};

type holidayInfo = {
    date: string,
    name: string
};

let scheduleButton: any
let holidaysInfo: holidayInfo[];

async function onInit(): Promise<void> {
    Context.data.year = new TDate().year;
    const waitForButton = window.setInterval(() => {
        scheduleButton = document.querySelector(".create-schedule-button");
        if(!scheduleButton) {
            return;
        };
        window.clearInterval(waitForButton);
        scheduleButton.classList.add("disabled");
    }, 200);
}

async function getAllDatesInYear(currentYear: number): Promise<dateInfo[]> {
    const testResponse = await fetch('https://isdayoff.ru/20230625');
    const holidayResponse = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${Context.data.year_string!}/RU`);
    const openKontur = testResponse.ok;

    let jsonDates: Map<string, string>[] = [];
    let objDates: Date[] = [];

    if (holidayResponse.ok) {
        const responseJson = await holidayResponse.json();
        holidaysInfo = responseJson.map((item: any) => {
            return {
                name: item.localName,
                date: convertDate(item.date, "-")
            }
        });
    };

    for (let i = 0; i <= 11; i++) {
        const currentMonthDays = await getDatesFromApi(currentYear, i, openKontur);
        if (currentMonthDays instanceof Map) {
            jsonDates.push(currentMonthDays);
        } else {
            objDates.push(...currentMonthDays);
        };
    };

    let jsonData: dateInfo[] = [];

    if (jsonDates && jsonDates.length > 0) {
        const commonMap: Map<string, string> = new Map<string, string>([].concat.apply([], jsonDates.map(m => {
            return [...m]
        })));
        for (let item of commonMap.entries()) {
            const key = item[0];
            const dayCode = commonMap.get(key);

            const dayMeta: dateInfo = {
                date: key,
                dateForCalendar: convertDate(key, "."),
                isHoliday: !!holidaysInfo.find(item => item.date === key),
                isDayOff: false,
                isPreDayOff: dayCode === "pre_day_off",
                description: holidaysInfo.find(item => item.date === key) ? holidaysInfo.find(item => item.date === key)!.name : ""
            };

            jsonData.push(dayMeta)
        };
        return jsonData;
    } else {
        return objDates.map(date => {
            const day = String(date.getDate()).length == 2 ? String(date.getDate()) : "0" + String(date.getDate());
            const month = String(date.getMonth() + 1).length == 2 ? String(date.getMonth() + 1) : "0" + String(date.getMonth() + 1);
            const dateString = `${day}.${month}.${date.getFullYear()}`;

            return <dateInfo> {
                date: dateString,
                dateForCalendar: convertDate(dateString, "."),
                isDayOff: false
            }
        })
    }
};

function convertDate(date: string, delimiter: string): string {
    let [day, month, year]: string[] = [];
    if (delimiter === "-") {
        [year, month, day] = date.split("-");
        return `${day}.${month}.${year}`;

    } else {
        [day, month, year] = date.split(".");
        return `${year}-${month}-${day}`;
    };
}

async function getDatesFromApi(year: number, month: number, openKontur: boolean): Promise<Date[] | Map<string, string>> {
    let startDate = new Date(year, month, 1);
    let endDate = new Date(year, month + 1, 1);
    let dates: Date[] = [];

    while (startDate < endDate) {
        dates.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + 1);
    };
    if (!openKontur) {
        return dates;
    };

    const monthPadded = String(month + 1).length == 2 ? String(month + 1) : "0" + String(month + 1);
    const datesRequest = await fetch(`https://isdayoff.ru/api/getdata?year=${year}&month=${monthPadded}&pre=1`);
    const datesInfo: any = await datesRequest.text();
    const mappedDays: Map<string, string> = new Map();

    for (let i in datesInfo) {
        const currentDate: Date = dates[Number(i)];
        const paddedMonth = String(month + 1).length == 2 ? String(month + 1) : "0" + String(month + 1);
        const paddedDay = String(currentDate.getDate()).length == 2 ? String(currentDate.getDate()) : "0" + String(currentDate.getDate());
        const dateString = `${paddedDay}.${paddedMonth}.${currentDate.getFullYear()}`;
        const metaNumber = datesInfo[i];
        let dayMeta: string = "";

        switch (metaNumber) {
            case "0":
                dayMeta = "work";
                break;
            case "1":
                dayMeta = "day_off";
                break;
            case "2":
                dayMeta = "pre_day_off";
                break;
        };

        mappedDays.set(dateString, dayMeta);
    };

    return mappedDays;
};

async function createSchedule(): Promise<void> {
    Context.data.dates_table = Context.fields.dates_table.create();
    const table = Context.data.dates_table;
    // let currentYearDays = globalVars[Context.data.year_string as keyof globalVars];
    // if (!currentYearDays) {
        const currentYearDays = await getAllDatesInYear(Context.data.year!);
        const dayOffs = getDayOffs(Context.data.start_date!, Context.data.year!, Context.data.work_days!, Context.data.day_offs!);
        currentYearDays.filter(obj => dayOffs.indexOf(obj.date) !== -1).forEach(obj => {
            obj.isDayOff = true;
        });
        const additionalHolidays = await Namespace.app.additional_holidays.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.year.eq(Context.data.year!)
        )).first();

        if (additionalHolidays && additionalHolidays.data.dates_table && additionalHolidays.data.dates_table.length > 0) {
            const additionalHolidaysTable = additionalHolidays.data.dates_table;
            additionalHolidaysTable.filter(row => !row.region || row.region.id === Context.data.region!.id).forEach(row => {
                const currentDate = currentYearDays.find(item => item.date === row.date.format("DD.MM.YYYY"));
                if (currentDate) {
                    currentDate.description = row.holiday_name;
                    currentDate.isDayOff = row.day_off;
                    currentDate.isHoliday = row.holiday;
                };
            });
        };
        for (let dateObj of currentYearDays) {
            const newRow = table.insert();
            const dateArr = dateObj.date.split(".");
            const [day, month, year] = [...dateArr].map(Number)
            newRow.date = new TDate(year, month, day);
            newRow.holiday_name = dateObj.description || "";
            newRow.is_day_off = dateObj.isDayOff || false;
            newRow.is_holiday = dateObj.isHoliday || false;
        };

        Context.data.dates_table = table;
        Context.data.json_data = JSON.stringify(currentYearDays);
        console.log(currentYearDays)
    // };
};

async function handleContextChange(): Promise<void> {
    if (Context.data.work_days && Context.data.day_offs && Context.data.year && Context.data.start_date && Context.data.utc && ViewContext.data.all_required_fields_filled) {
        scheduleButton.classList.remove("disabled")
    } else if (!scheduleButton.classList.contains("disabled")) {
        scheduleButton.classList.add("disabled");
    };
};

async function handleYearChange(): Promise<void> {
    if (Context.data.year) {
        Context.data.year_string = String(Context.data.year);
        ViewContext.data.all_required_fields_filled = true;
        const firstDate = new TDate(Context.data.year, 1, 1);
        const lastDate = new TDate(Context.data.year, 12, 31);

        Context.fields.start_date.data.setFilter((f, g) => g.and(
            f.gte(firstDate),
            f.lte(lastDate)
        ));

        Context.data.start_date = firstDate;

    } else {
        ViewContext.data.all_required_fields_filled = false;
    };
    handleContextChange();
};

function getDayOffs(dateStart: TDate, year: number, workDaysCount: number, dayOffsCount: number): string[] {
    let dayOffs: string[] = [];
    let i = 0;
    let isWorkDays = true;

    while (dateStart.year === year) {
        if (!isWorkDays) {
            dayOffs.push(dateStart.format("DD.MM.YYYY"));
        }
        dateStart = dateStart.addDate(0, 0, 1);
        i++;

        if (isWorkDays && i === workDaysCount) {
            isWorkDays = false;
            i = 0;
        } else if (!isWorkDays && i === dayOffsCount) {
            isWorkDays = true;
            i = 0;
        };
    };

    return dayOffs;
};

function changeYear(elem: any) {
    if (elem.classList.contains("increment")) {
        Context.data.year!++;
    } else {
        Context.data.year!--;
    };
    Context.data.year_string = String(Context.data.year!);
};
