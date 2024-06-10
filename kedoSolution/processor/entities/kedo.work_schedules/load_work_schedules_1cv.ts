/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface IScheduleDay {
  date: string,
  dateForCalendar: string,
  description: string,
  isDayOff: boolean,
  isHoliday: boolean,
  isPreDayOff: boolean
}

type TSchedule = ApplicationItem<Application$kedo$work_schedules$Data, Application$kedo$work_schedules$Params>;

async function getSchedules(): Promise<void> {
  const tables = await Namespace.app.posted_1c_data.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.table_name.eq("Catalog_ГрафикиРаботыСотрудников"),
    ))
    .where((f, g) => g.or(
      f.is_processed.eq(null),
      f.is_processed.eq(false),
    ))
    
    .size(10000)
    .all();

  if (tables.length > 0) {
    const sortedApps = tables.sort((a, b) => {
      const aDate: any = a.data.__createdAt.asDate()
      const bDate: any = b.data.__createdAt.asDate()
      return aDate - bDate
    });

    const baseArray: any[] = [];
    const workSchedules = baseArray.concat(...(sortedApps.filter(item => item.data.table_name === "Catalog_ГрафикиРаботыСотрудников" && !!item.data.table_data).map(item => JSON.parse(item.data.table_data!))));

    let promises: Promise<any>[] = [];
    for (let i = 0; i < workSchedules.length; i++) {
      const existsingGraphs = await Namespace.app.work_schedules.search()
        .where((f, g) => g.and(
          f.__deletedAt.eq(null)
        )).size(10000).all();
      const item = workSchedules[i].data;
      let graph = existsingGraphs.find((graphItem) => graphItem.data.id_1c === item["Ref"]);

      if (!graph)
        graph = Namespace.app.work_schedules.create();

      graph.data.__name = item["Description"];
      graph.data.id_1c = item["Ref"];
      graph.data.working_hours_week = Number(item["ДлительностьРабочейНедели"]);
      graph.data.work_days = Number(item["РабочихДнейВНеделе"]);
      graph.data.day_offs = 7 - Number(item["РабочихДнейВНеделе"]);
      graph.data.utc = graph.fields.utc.variants["3"];
      let dateNow = new Date().toISOString();
      let datetimeNow = new Datetime(dateNow);
      if (datetimeNow) {
        graph.data.start_date = new TDate(datetimeNow.year, 1, 1);
        graph.data.year_string = String(datetimeNow.year);
        graph.data.year = datetimeNow.year;
      }

      Context.data.debug = ` ${item["Description"]} `;
      await graph.save();
      // promises.push(graph.save())
      // if (promises.length >= 50) {
      //   await Promise.all(promises)
      //   promises = []
      // }
    }
    await Promise.all(promises)
    promises = []

    for (let app of tables) {
      app.data.is_processed = true
      promises.push(app.save())
      if (promises.length >= 20) {
        await Promise.all(promises)
        promises = []
      }
    }

    await Promise.all(promises)
  }

}

//процедура для создания объекта по графикам "айди 1С" : [массив с данными по дням]
async function createSchedulesObject(): Promise<void> {

  let schedulesObject = {};

  const existsingSchedules = await Namespace.app.work_schedules.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null)
    )).size(10000).all();

  let haveIds = false;

  //ищем графики из 1С. Если нашли, добавляем их в объект
  for (let schedule of existsingSchedules) {
    if (schedule.data.id_1c) {
      //@ts-ignore
      schedulesObject[schedule.data.id_1c as string] = [];
      haveIds = true;
    }
  }

  if (haveIds) {
    Context.data.schedules_object = JSON.stringify(schedulesObject);
    Context.data.no_1C_schedules = false;
  } else {
    Context.data.no_1C_schedules = true;
  }

}

//количество запашиваемых пакетов за раз
const batchSize = 10;
//количество итераций цикла в бп
const mainLoopMaxCount = 50;

//процедура по заполнению данных о рабочих/выходных/праздничных днях в графике
async function fillSchedules(): Promise<void> {

  //переменная для ухода от ошибки too many loops
  Context.data.wait = false;

  //итератор
  Context.data.loop_counter! += 1;

  if (Context.data.loop_counter! % mainLoopMaxCount === 0) {
    Context.data.wait = true;
  }

  //переменная для работы с циклом
  Context.data.continue = true;

  //получаем данные графиков (с данными о типах дней). Получаем только часть данных (количество - batchSize)
  const tables = await Namespace.app.posted_1c_data.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.table_name.eq("InformationRegister_ГрафикиРаботыПоВидамВремени"),
    ))
    .where((f, g) => g.or(
      f.is_processed.eq(false),
      f.is_processed.eq(null),
    ))
    .size(batchSize)
    .all();

  //справочник по типам дней (рабочий день, выходной день, праздник)
  const types = await Namespace.app.posted_1c_data.search()
    .where(f => f.__deletedAt.eq(null))
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.table_name.eq("Catalog_ВидыИспользованияРабочегоВремени"),
    ))
    .size(10000)
    .all();

  if (types.length === 0) {
    Context.data.debug += ' no types ';
    Context.data.continue = false;
    return;
  }

  //маппим типы дней. Игнор, потому что тайпскрипт не любит метод флэт
  //@ts-ignore
  let mappedTypes = types.map((item: any) => JSON.parse(item.data.table_data!)).flat().map((item: any) => item["data"]);

  if (tables.length === 0) {
    Context.data.continue = false;
    return;
  }

  //объект, в котором храним все полученные и отобранные данные
  let schedulesObject = JSON.parse(Context.data.schedules_object!);

  //уже загруженные графики работы
  const existsingSchedules = await Namespace.app.work_schedules.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null)
    )).size(10000).all();

  //маппим данные о графиках. Игнор, потому что тайпскрипт не любит метод флэт
  //@ts-ignore
  const mappedData = tables.map((item: any) => JSON.parse(item.data.table_data!)).flat().map((item: any) => item["data"]["Record"]).flat();

  //текущая дата
  let now = new Datetime();

  for (let obj of mappedData) {
    for (let existingSchedule of existsingSchedules) {

      //ищем только актуальные данные 
      if (existingSchedule.data.id_1c === obj["ГрафикРаботы"]["data"] && obj["Дата"].slice(0, 4) === String(now.year)) {

        //ищем тип дня
        let dayType = mappedTypes.find((item: any) => item["Ref"] === obj["ВидУчетаВремени"]);

        if (!dayType) {
          Context.data.debug += ` !dayType `;
          continue;
        }

        //заполняем структуру
        let day: IScheduleDay = {
          date: new Datetime(obj["Дата"].split("T")[0]).format("DD.MM.YYYY"),
          dateForCalendar: obj["Дата"].split("T")[0],
          description: dayType["Description"],
          isDayOff: dayType["Description"] === "Выходные дни" || dayType["Description"] === "Дополнительные выходные дни (оплачиваемые)" || dayType["Description"] === "Дополнительные выходные дни (неоплачиваемые)" ? true : false,
          isHoliday: dayType["Description"] === "Праздники без повышенной оплаты" || dayType["Description"] === "Праздники" ? true : false,
          isPreDayOff: false
        };

        //пушим данные в нужный график
        schedulesObject[existingSchedule.data.id_1c!].push(day);
        break;
      }
    }
  }

  Context.data.schedules_object = JSON.stringify(schedulesObject);

  //пакеты переводим в Обработано
  for (let table of tables) {
    table.data.is_processed = true;
    await table.save();
  }
}

//эта процедура добавляем данные по выходным/рабочим/праздничным дням в элемент приложения "Графики работы"
async function addJSONToSchedules(): Promise<void> {

  const existsingSchedules = await Namespace.app.work_schedules.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null)
    )).size(10000).all();

  let schedulesObject = JSON.parse(Context.data.schedules_object!);

  //заполняем json данные в график, чтобы построить календарь
  for (let id in schedulesObject) {
    let arrayOfDays = schedulesObject[id];
    let schedule = existsingSchedules.find((item: TSchedule) => item.data.id_1c === id);

    if (schedule) {
      Context.data.debug += ` added json to ${schedule.data.__name} `;
      schedule.data.json_data = JSON.stringify(arrayOfDays);
      await schedule.save();
    }
  }
}
