declare const console: any;
declare const document: any;
declare const window: any;

import VanillaCalendar from "vanilla-calendar.min.js";

type dateInfo = {
    isHoliday?: boolean,
    isDayOff?: boolean,
    date: string,
    dateForCalendar: string,
    isPreDayOff?: boolean,
    description?: string
};

async function onInit(): Promise<void> {
    const waitForCalendar = window.setInterval(() => {
        const customCalendar = document.querySelector(".custom-calendar");
        if (!customCalendar) {
            return;
        };
        window.clearInterval(waitForCalendar);
        const jsonData = <dateInfo[]>JSON.parse(Context.data.json_data!);
        console.log(jsonData)
        console.log(Context.data.dates_table)
        const mappedDescriptions: {[key: string]: {modifier: string, html: string}} = {};
        const holidays = jsonData.filter(day => day.isHoliday);
        holidays.forEach(day => {
            mappedDescriptions[day.dateForCalendar] = {
                modifier: "bg-red",
                html: day.description || ""
            };
        });
        const calendar = new VanillaCalendar(".custom-calendar", {
            settings: {
                selected: {
                    holidays: jsonData.filter(day => day.isDayOff).map(day => day.dateForCalendar),
                    dates: Object.keys(mappedDescriptions)
                },
                visibility: {
                    weekend: false
                },
                lang: 'ru',
            },
            date: {
                min: Context.data.start_date!.format("YYYY-MM-DD"),
                max: new TDate(Context.data.year!, 12, 31).format("YYYY-MM-DD")
            },
            popups: mappedDescriptions
        });
        calendar.init()
    }, 200)
}