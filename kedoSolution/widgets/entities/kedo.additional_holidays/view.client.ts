declare const document: any;
declare const window: any;
declare const console: any;

let customTable: any;
let addDateButton: any;
let regions: ApplicationItem<Application$kedo$directory_of_regions$Data, any>[];
let globalIndex = 0;

async function onInit(): Promise<void> {
    const [firstDayArr, lastDayArr]: string[][] = [`01.01.${Context.data.year_string}`, `31.12.${Context.data.year_string}`].map(date => date.split("."));
    const [fDay, fMonth, fYear, lDay, lMonth, lYear] = [].concat.apply([], [firstDayArr, lastDayArr].map(arr => arr.map(item => Number(item))));
    const [firstDay, lastDay] = [new TDate(fYear, fMonth, fDay), new TDate(lYear, lMonth, lDay)]
    ViewContext.fields.date.data.setFilter((f, g) => g.and(
        f.gte(firstDay),
        f.lte(lastDay),
    ));

    regions = await Context.fields.region.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    let waitForTable = window.setInterval(async () => {
        customTable = document.querySelector(".kedo-table");
        addDateButton = document.querySelector(".add-date-button button");
        if (!customTable || !addDateButton) {
            return;
        };
        window.clearInterval(waitForTable);
        if (Context.data.dates_table && Context.data.dates_table.length > 0) {
            const table = Context.data.dates_table;

            for (let row of table) {
                try {
                    const region = row.region ? regions.find(r => r.id === row.region.id) : undefined;
                    const regionName = region ? region.data.__name : "Общероссийский";
                    const date = row.date.format("DD.MM.YYYY");
                    const isDayOff = row.day_off ? "✓" : "✗";
                    const isHoliday = row.holiday ? "✓" : "✗";
                    const holidayName = row.holiday_name ? row.holiday_name : '';
                    await addRowToDomTable({ regionName, date, isDayOff, isHoliday, index: row.row_index, holidayName });
                } catch (err) {
                    console.log(err.message)
                    continue;
                };
            };

            Context.data.dates_table = table;
        };
        handleDateChange();
    })
};

async function addRowToDomTable(rowData: any) {
    const newRowTemplate = document.querySelector(".custom-table-row").content.cloneNode(true);
    const newRow = newRowTemplate.querySelector("tr");
    const holidayNode = newRowTemplate.querySelector(".day-holiday");
    const dayOffNode = newRowTemplate.querySelector(".day-off");
    const dateNode = newRowTemplate.querySelector(".day-date");
    const regionNode = newRowTemplate.querySelector(".day-region");
    const holidayName = newRowTemplate.querySelector(".day-holiday-name");
    const deleteButtonNode = document.createElement("div");
    const currentElement = await Application.search().where(f => f.__id.eq(Context.data.__id)).first();
    deleteButtonNode.className = "delete-button-wrapper";
    dateNode.textContent = rowData.date;
    regionNode.textContent = rowData.regionName;
    holidayNode.innerHTML = rowData.isHoliday;
    dayOffNode.innerHTML = rowData.isDayOff;
    holidayName.textContent = rowData.holidayName;
    dateNode.appendChild(deleteButtonNode);
    deleteButtonNode.addEventListener("click", async () => {
        newRow.remove();
        deleteButtonNode.remove();
        const restDeleteNodes = document.querySelectorAll(".delete-button-wrapper");
        restDeleteNodes.forEach((node: any) => {
            node.style.pointerEvents = "none";
        });

        const table = Context.data.dates_table;
        const rowToDelete = table!.find((r: any) => r.row_index === rowData.index);
        console.log(rowToDelete)
        console.log(table!.indexOf(rowToDelete!))
        table!.delete(table!.indexOf(rowToDelete!));

        Context.data.dates_table = table;
        currentElement!.data.dates_table = table;
        await currentElement!.save();
        await Context.fetch();
        restDeleteNodes.forEach((node: any) => {
            node.style.pointerEvents = "auto";
        });
        handleDateChange();
    });
    handleDateChange();
    customTable.append(newRowTemplate);
}

async function addDateToTable(): Promise<void> {
    await handleDateChange();
    if (!ViewContext.data.error_exists) {
        const table = Context.data.dates_table ? Context.data.dates_table : Context.fields.dates_table.create();
        const newRow = table.insert();
        newRow.date = ViewContext.data.date!;
        newRow.region = ViewContext.data.region!;
        newRow.day_off = ViewContext.data.day_off!;
        newRow.holiday = ViewContext.data.holiday!;
        newRow.row_index = table.length + 100;
        newRow.holiday_name = ViewContext.data.holiday_name || "";
        const currentElement = await Application.search().where(f => f.__id.eq(Context.data.__id)).first();
        currentElement!.data.dates_table = table;
        await currentElement!.save();

        const region = ViewContext.data.region ? regions.find(r => r.id === ViewContext.data.region!.id) : undefined;
        let regionName = region ? region.data.__name : "Общероссийский";
        const date = ViewContext.data.date!.format("DD.MM.YYYY");
        const isDayOff = ViewContext.data.day_off ? "&check;" : "&cross;";
        const isHoliday = ViewContext.data.holiday ? "&check;" : "&cross;";

        await addRowToDomTable({ regionName, date, isDayOff, isHoliday, index: newRow.row_index, holidayName: newRow.holiday_name });
    }
};
//обрабатываем изменение даты
async function handleDateChange(): Promise<void> {
    const table = Context.data.dates_table;
    const rows = table!.filter((row: any) => row.date.equal(ViewContext.data.date!))   //получаем строки с такой же датой
    if (rows && rows.length > 0) {
        
        if (ViewContext.data.region && rows!.some((row: any) => row.region && row.region.id == ViewContext.data.region!.id)) { //если среди строк есть такая где совпадает регион
            addDateButton.classList.add("disabled");
            ViewContext.data.error_exists = true;
            return
        }
        if (!ViewContext.data.region && rows!.some((row: any) => row.region == undefined)) {    //среди строк есть строка без региона и мы его не указывали
            addDateButton.classList.add("disabled");
            ViewContext.data.error_exists = true;
            return
        }
    };

    addDateButton.classList.remove("disabled");
    ViewContext.data.error_exists = false;

};

async function handleHolidayChange(): Promise<void> {
    if (ViewContext.data.holiday) {
        ViewContext.data.holiday_choose = true;
        ViewContext.data.day_off = true;
        return;
    };
    ViewContext.data.holiday_choose = false;
};
