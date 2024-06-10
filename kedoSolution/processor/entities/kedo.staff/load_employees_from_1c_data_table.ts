/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

//ТРЕБУЕТСЯ ЖЁСТКИЙ РЕФАКТОРИНГ!!!

type TStaff = ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>;
type TEmploymentTableRow = Table$kedo$staff$employment_table$Row;
type TSubdivision = ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params>;
type TOrganization = ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>;
type TPosition = ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>;
type TEmploymentDirectory = TApplication<Application$kedo$employment_directory$Data, Application$kedo$employment_directory$Params, Application$kedo$employment_directory$Processes>;

interface BasePerson {
    id?: string;
    code?: string;
    individual_id: string;
    name: TFullName;
    firstname: string;
    lastname: string;
    middlename: string;
    email?: TEmail<EmailType.Work>;
    phoneNumber?: TPhone<PhoneType.Work>;
    sex: boolean;
    marriage: boolean;
    birthDate?: TDate;
    city: string;
    street?: string;
    home?: string;
    apartment?: string;
    housing?: string;
    snils: string;
    inn: string;
    category?: any;
}

interface DocumentData {
    isRf: boolean;
    passportSeries: string;
    passportNumber: string;
    passportDepCode: string;
    passportIssueDate: TDate;
    passportIssuer: string;
}

interface EmployeeInfo {
    id: string;
    code: string;
    individual_id: string;
    name: TFullName;
    firstname: string;
    lastname: string;
    middlename: string;
    email?: TEmail<EmailType.Work>;
    phoneNumber?: TPhone<PhoneType.Work>;
    sex: boolean;
    marriage: boolean;
    birthDate: TDate;
    city: string;
    street?: string;
    home?: string;
    apartment?: string;
    housing?: string;
    passportSeries: string;
    passportNumber: string;
    passportDepCode: string;
    passportIssueDate: TDate;
    passportIssuer: string;
    snils: string;
    inn: string;
    category?: any;
    entity?: any;
    position?: any;
    organization?: any;
    subdivision?: any;
}

interface FiringData {
    ref: string;
    ind_ref: string;
    date: string;
}

type staffData = {
    staffId: string,
    orgRightsIds: string | string[],
    isArray: boolean
};

interface TransferData {
    employeeIndividualId: string; //айди физлица
    typeWorkRelation: string; //тип трудоустройства
    subdivisionId: string; //айди подразделения
    orgId: string; //айди организации
    id_1c: string; //айди сотрудника
    typeFromData: boolean; //данные о типе трудоустройства
    transferDate: string; //дата перевода
    rate: number; //ставка
    posId: string; //айди позиции ШР
    existingPositions: boolean; //существуют устанавливаемые позиции 
}

interface ITransferSendData {
    employee: TStaff,
    transferDate: TDate,
    subdivisionApp: TSubdivision,
    orgApp: TOrganization,
    posId: string,
    typeWorkRelation: any,
    employeeId: string,
    typeFromData: boolean,
    rate: number,
    existingPositions: boolean,
}

//интерфейс для срочных ТД и временных КП
interface IFixedTermData {
    employeeIndividualId: string, //айди физлица
    employeeId: string, //айди сотрудника
    endDate: string, //дата окончания перевода
    prevPositionId: string, //айди предыдущей позиции
    prevPositionDate: string, //дата приёма на предыдушую позицию
    isMainWorktype: boolean, //является ли место работы основным
}

//интерфейс для складирования данных по переводам, чтобы потом их отправить в процесс "Обновление позиции ШР"
interface IUpdatedTransferData {
    employeeIndividualId: string,
    employeeId: string,
    newPositionId: string,
    employmentDirectoryId: string | undefined,
    isTemporaryTransfer: boolean,
    endTransferDate?: string,
}

const chunkSize = 100;
const loopSize = 50;
const littleChunkSize = 20;
const posChunkSize = 1;
const posloopSize = 10;

//задача 1217
async function updateFiring(): Promise<void> {

    if (!Context.data.firing_data) {
        Context.data.loop_end = true;
        Context.data.debug += ` loop end `;
        return;
    };

    const data = JSON.parse(Context.data.firing_data);
    const iter_count = data.length - 1;

    if (Context.data.iterator! >= iter_count) {
        Context.data.loop_end = true;
        Context.data.firing_date = undefined;
        Context.data.iterator = -1;
        Context.data.debug += ` loop end `;
        return;
    }

    Context.data.iterator!++;

    if (Context.data.iterator! % loopSize === 0 && Context.data.iterator! !== 0) {
        Context.data.is_pause = true;
    } else {
        Context.data.is_pause = false;
    }

    Context.data.parttime = false;

    const employeeIds = data.map((item: FiringData) => item.ind_ref)
    const employees = await Namespace.app.staff.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        //f.individual_id_1c.in(employeeIds)
    )).size(10000).all()

    Context.data.firing_position_ref = data[Context.data.iterator!].ref;

    const currentEmployee = employees.find(employee => employee.data.id_1c === data[Context.data.iterator!].ref)
    if (!currentEmployee) {

        //задача 1217
        //const currentEmployee_fl = employees.find(employee => employee.data.individual_id_1c === data[Context.data.iterator!].ind_ref);
        let currentEmployee_fl = employees.find(employee => {
            const ids = employee.data.ref_eq_table!.map((elem: any) => elem.individual_ref);
            if (ids.indexOf(data[Context.data.iterator!].ind_ref) !== -1 || employee.data.individual_id_1c === data[Context.data.iterator!].ind_ref) {
                return true;
            }
        });

        if (currentEmployee_fl) {
            Context.data.firing_position_ref = data[Context.data.iterator!].ref;
            Context.data.parttime = true;
            Context.data.current_employee = currentEmployee_fl;
        } else {
            return;
        }

    } else {
        Context.data.current_employee = currentEmployee;
    };

    try {
        const date = new Datetime(data[Context.data.iterator!].date);
        Context.data.debug += ` ${data[Context.data.iterator!].date} `;
        Context.data.debug += ` ${new TDate(date.year, date.month, date.day)} `
        Context.data.firing_date = new TDate(date.year, date.month, date.day);
    } catch (e) {
        Context.data.debug += "Couldn't parse a date";
        Context.data.firing_date = undefined;
        return;
    }
}

async function loadAcceptDate(): Promise<void> {

    const tables = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.table_name.like("InformationRegister_КадроваяИсторияСотрудников"),
            f.__deletedAt.eq(null),
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .size(10000)
        .all();

    if (tables.length === 0) return;
    const sortedApps = tables.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    });

    const statusEmployeeInfo = parseData(sortedApps, "InformationRegister_КадроваяИсторияСотрудников")
    // @ts-ignore
    const mappedData = statusEmployeeInfo.filter((item: any) => !!item.data["Record"]).map((item: any) => item.data["Record"]).flat().filter((item: any) => item["Active"]);
    //const acceptData = mappedData.filter((item: any) => item["ВидСобытия"] === "НачальныеДанные" || item["ВидСобытия"] === "Прием" || item["ВидСобытия"] === "Перемещение");
    const acceptData = mappedData.filter((item: any) => item["ВидСобытия"] === "НачальныеДанные" || item["ВидСобытия"] === "Прием");

    //выборка данных по увольнениям
    const firingData = mappedData.filter((item: any) => item["ВидСобытия"] === "Увольнение")

    const parsedFiringData: FiringData[] = []

    for (let item of firingData) {
        const ref = item["Сотрудник"]
        const ind_ref = item['ФизическоеЛицо']
        const date = item["Period"]
        parsedFiringData.push({
            ref: ref,
            ind_ref: ind_ref,
            date: date
        })
    }

    const stringFiringData = JSON.stringify(parsedFiringData)
    Context.data.firing_data = stringFiringData

    const employees = await Context.fields.staff.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    let promises: Promise<void>[] = []

    for (let item of acceptData) {

        //const foundEmployee = employees.find(f => f.data.individual_id_1c === item["ФизическоеЛицо"])
        let foundEmployee = employees.find(employee => {
            const ids = employee.data.ref_eq_table!.map((elem: any) => elem.individual_ref);
            if (ids.indexOf(item["ФизическоеЛицо"]) !== -1 || employee.data.individual_id_1c === item["ФизическоеЛицо"]) {
                return true;
            }
        });

        if (!foundEmployee || !item["Period"]) continue;

        const startDatetime = new Datetime(item["Period"])
        const startDate = new TDate(startDatetime.year, startDatetime.month, startDatetime.day)
        if (!foundEmployee.data.employment_table) continue;

        for (let i = 0; i < foundEmployee.data.employment_table.length; i++) {
            const currentRow = foundEmployee.data.employment_table[i]
            if (currentRow.id_1c === item["Сотрудник"]) {
                //проверка на актуальность данных
                if (currentRow.admission_date_position && currentRow.admission_date_position.after(startDate)) {
                    Context.data.error_stack += ` ${foundEmployee.data.__name} outdated information`;
                    continue;
                }

                currentRow.admission_date_position = startDate;
            }
        }

        if (item["Сотрудник"] === foundEmployee.data.id_1c && (!foundEmployee.data.work_start || (foundEmployee.data.work_start && foundEmployee.data.work_start.after(startDate)))) {
            foundEmployee.data.work_start = startDate;
        }

        promises.push(foundEmployee.save())
    }

    try {
        await Promise.all(promises)
    } catch (e) {
        Context.data.error_stack += " Couldn't save work start dates ";
    }

    promises = []

    //поддержка старого алгоритма расчёта даты приёма в организацию
    for (let i = 0; i < employees.length; i++) {
        const currentEmployee = employees[i]
        if (!currentEmployee.data.employment_table || currentEmployee.data.employment_table.length === 0) {
            continue;
        }
        // find the oldest date
        if (!currentEmployee.data.work_start) continue
        let oldestDate = currentEmployee.data.work_start

        for (let i = 0; i < currentEmployee.data.employment_table.length; i++) {
            const row = currentEmployee.data.employment_table[i]

            if (row.admission_date_position && row.admission_date_position.before(oldestDate)) {
                oldestDate = row.admission_date_position
            }
        }

        for (let i = 0; i < currentEmployee.data.employment_table.length; i++) {
            const row = currentEmployee.data.employment_table[i]
            row.admission_date_organization = oldestDate
        }

        promises.push(currentEmployee.save())
        if (promises.length > littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }
    //конец, позже удалить

    //загрузка персональной информации о дате приёма на работу, номеру тд. и тд
    const staffTables = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .where((f, g) => g.or(
            f.table_name.eq("Catalog_Сотрудники"),
            f.table_name.eq("Catalog_ФизическиеЛица"),
        ))
        .size(10000)
        .all()
    if (staffTables.length === 0) {
        Context.data.debug += ` не нашли данных о персональной информации `
        return;
    }
    const staffSortedApps = staffTables.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    })
    const externalEmployees = parseData(staffSortedApps, "Catalog_Сотрудники");

    Context.data.debug += ` external_employees.length ${externalEmployees.length} `

    for (let employeeData of externalEmployees) {
        let currentEmployee = employees.find((item: any) => item.data.individual_id_1c === employeeData.data["ФизическоеЛицо"]);
        if (currentEmployee) {
            Context.data.debug += ` нашли сотрудника `
            Context.data.debug += ` ${JSON.stringify(employeeData.data["ТекущиеКадровыеДанныеСотрудника"])} `
            if (employeeData.data["ТекущиеКадровыеДанныеСотрудника"] && employeeData.data["ТекущиеКадровыеДанныеСотрудника"].length > 0) {
                Context.data.debug += ` нашли данные по дате приёма `
                let workStartDatetime = new Datetime(employeeData.data["ТекущиеКадровыеДанныеСотрудника"][0]["ДатаПриема"]);
                let workStartDate = new TDate(workStartDatetime.year, workStartDatetime.month, workStartDatetime.day);

                if (employeeData.data["Ref"] === currentEmployee.data.id_1c) {
                    currentEmployee.data.work_start = workStartDate;

                    if (currentEmployee.data.employment_table) {
                        for (let row of currentEmployee.data.employment_table) {
                            row.admission_date_organization = workStartDate;
                        }
                    }
                } else {
                    if (currentEmployee.data.employment_table) {
                        for (let row of currentEmployee.data.employment_table) {
                            if (row.id_1c === employeeData.data["Ref"]) {
                                row.admission_date_organization = workStartDate;
                            }
                        }
                    }
                }

                if (currentEmployee.data.employment_table) {
                    for (let row of currentEmployee.data.employment_table) {
                        if (row.id_1c === employeeData.data["Ref"]) {
                            row.number_employment_contract = employeeData.data["ТекущиеКадровыеДанныеСотрудника"][0]["ТрудовойДоговорНомер"];

                            try {
                                const emp_datetime = new Datetime(employeeData.data["ТекущиеКадровыеДанныеСотрудника"][0]["ТрудовойДоговорДата"].split("T")[0]);
                                row.date_employment_contract_as_date = new TDate(emp_datetime.year, emp_datetime.month, emp_datetime.day);
                            } catch (e) {
                                Context.data.error_stack += ` Ошибка преобразования даты ТД `;
                            }
                        }
                    }
                }
            }

            promises.push(currentEmployee.save())
            if (promises.length > littleChunkSize) {
                await Promise.all(promises)
                promises = []
            }
        }
    }

    for (let app of staffTables) {
        app.data.is_processed = true
        promises.push(app.save())
        if (promises.length >= littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }

    await Promise.all(promises)
    promises = []

    for (let app of tables) {
        app.data.is_processed = true
        promises.push(app.save())
        if (promises.length >= littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }
    await Promise.all(promises)
}

async function getWorkSchedules(): Promise<void> {

    //Context.data.debug += ' in getWorkSchedules '

    const tables = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.table_name.eq("InformationRegister_ГрафикРаботыСотрудников"),
            f.__deletedAt.eq(null)
        ))
        .size(10000)
        .all()
    const workSchedules = await Namespace.app.work_schedules.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .size(10000)
        .all()
    const employees = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .size(10000)
        .all()

    if (tables.length === 0 || workSchedules.length === 0) return;
    const sortedApps = tables.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return bDate - aDate
    })

    const currentTable = sortedApps[0]
    const currentTableParsedData = JSON.parse(currentTable.data.table_data!)
    const data = currentTableParsedData.filter((item: any) => !!item.data["Record"]).map((item: any) => item.data["Record"][0])

    let promises: Promise<void>[] = []
    for (let i = 0; i < employees.length; i++) {
        const currentEmployee = employees[i]

        for (let row of currentEmployee.data.employment_table!) {
            const employeeRef = row.id_1c

            //Context.data.debug += employeeRef!;

            if (!employeeRef) continue

            const foundSchedule = data.find((item: any) => item["Сотрудник"] === employeeRef)

            if (!foundSchedule) continue

            const foundScheduleId = foundSchedule["ГрафикРаботы"]
            const employeesSchedule = workSchedules.find((item: any) => item.data.id_1c === foundScheduleId)

            if (!!foundSchedule) {
                //Context.data.debug += ' employeeRef ' + employeeRef;
                //Context.data.debug += ' employeesSchedule ' + employeesSchedule;
            }

            if (!employeesSchedule) continue

            if (row.id_1c === currentEmployee.data.id_1c) {
                currentEmployee.data.work_schedules = employeesSchedule
            }
            row.work_schedules = employeesSchedule;

            promises.push(currentEmployee.save())
            if (promises.length > littleChunkSize) {
                await Promise.all(promises)
                promises = []
            }
        }
    }

    await Promise.all(promises)
}

async function createPersons(): Promise<void> {
    const tables = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .where((f, g) => g.or(
            f.table_name.eq("Catalog_Сотрудники"),
            f.table_name.eq("Catalog_ФизическиеЛица"),
        ))
        .size(10000)
        .all()
    if (tables.length === 0) {
        return;
    }
    const sorted_apps = tables.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    })

    const tablesPersDocs = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .where((f, g) => g.or(
            f.table_name.eq("InformationRegister_КадроваяИсторияСотрудников"),
        ))
        .size(10000)
        .all()

    let persDocs: any = undefined;

    if (tablesPersDocs && tablesPersDocs.length > 0) {

        const sortedAppPersDoc = tablesPersDocs.sort((a, b) => {
            const aDate: any = a.data.__createdAt.asDate()
            const bDate: any = b.data.__createdAt.asDate()
            return aDate - bDate
        })
        persDocs = parseData(sortedAppPersDoc, "InformationRegister_КадроваяИсторияСотрудников");
    }

    const externalEmployees = parseData(sorted_apps, "Catalog_Сотрудники")
    const externalPersonalData = parseData(sorted_apps, "Catalog_ФизическиеЛица")
    if (externalPersonalData.length === 0) return

    // Доработка для настройки прав доступа.
    Context.data.created_staffs = [];
    await createBaseEmployees(externalEmployees, externalPersonalData, persDocs)

    // let promises: Promise<void>[] = []
    // for (let app of tables) {
    //     app.data.is_processed = true
    //     promises.push(app.save())
    //     if (promises.length >= 20) {
    //         await Promise.all(promises)
    //         promises = []
    //     }
    // }

    // await Promise.all(promises)
}

const parseData = (data: any[], tableName: string): any[] => {
    const result: any[] = []
    data.forEach(item => {
        if (item.data.table_name === tableName && !!item.data.table_data) {
            result.push(...JSON.parse(item.data.table_data!))
        }
    })
    return result
}

async function addPassportData(): Promise<void> {
    const tables = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("InformationRegister_ДокументыФизическихЛиц")
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .size(10000)
        .all()

    if (tables.length === 0) {
        return;
    }
    const sortedApps = tables.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    })

    const baseArray: any[] = []
    const externalDocData = baseArray.concat(...(sortedApps.filter(item => item.data.table_name === "InformationRegister_ДокументыФизическихЛиц" && !!item.data.table_data).map(item => JSON.parse(item.data.table_data!))))

    await addDocumentData(externalDocData)

    let promises: Promise<void>[] = []
    for (let app of tables) {
        app.data.is_processed = true
        promises.push(app.save())
        if (promises.length >= littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }

    await Promise.all(promises)
}

async function addResponsibleEmployees(): Promise<void> {

    //получаем данные, которые нам пришли из 1С. Нас интересуют данные по занятости, типу трудоустройства и по сведениям об ответственных лицах
    const tables = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .where((f, g) => g.or(
            f.table_name.eq("InformationRegister_СведенияОбОтветственныхЛицах"),
        ))
        .size(10000)
        .all()

    //если данных нет, то выходим
    if (tables.length === 0) {
        return;
    }

    //сортируем данные по дате (чтобы обрабатывать их в правильном порядке)
    const sortedApps = tables.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    })

    //данные о руководителях организации, бухгалтерах и т.д.
    const headData = parseData(sortedApps, "InformationRegister_СведенияОбОтветственныхЛицах")

    //запускаем основной метод
    await fillResponsibleEmployees(headData)

    //обновляем поле Обработано у пакетов данных, которые обработали
    let promises: Promise<void>[] = []
    for (let app of tables) {
        app.data.is_processed = true
        promises.push(app.save())

        if (promises.length >= littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }

    await Promise.all(promises)

}

async function fillResponsibleEmployees(headData: any): Promise<void> {

    const parsedHeadData = headData.map((data: any) => {
        return data.data["Record"][0]
    });

    const allEmployees = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
    )).size(10000).all();

    //загрузка ответственных лиц организации
    if (parsedHeadData.length !== 0) {
        loadHeadData(parsedHeadData, allEmployees);
    };

}

async function addWorkTypes(): Promise<void> {

    Context.data.loop_end = false;

    Context.data.iterator!++;

    if (Context.data.iterator! % posloopSize === 0 && Context.data.iterator! !== 0) {
        Context.data.is_pause = true;
    } else {
        Context.data.is_pause = false;
    }

    //получаем данные, которые нам пришли из 1С. Нас интересуют данные по занятости, типу трудоустройства и по сведениям об ответственных лицах
    const tables = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .where((f, g) => g.or(
            f.table_name.eq("InformationRegister_ВидыЗанятостиСотрудников"),
        ))
        .size(posChunkSize)
        .all();

    //если данных нет, то выходим
    if (tables.length === 0) {
        Context.data.loop_end = true;
        return;
    }

    //сортируем данные по дате (чтобы обрабатывать их в правильном порядке)
    const sortedApps = tables.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    });

    //данные о типах трудоустройства
    const typeData = parseData(sortedApps, "InformationRegister_ВидыЗанятостиСотрудников");

    //запускаем основной метод
    await addTypeData(typeData);

    //обновляем поле Обработано у пакетов данных, которые обработали
    let promises: Promise<void>[] = [];
    for (let app of tables) {
        app.data.is_processed = true;
        promises.push(app.save());

        if (promises.length >= littleChunkSize) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);

}

async function addTypeData(types: any): Promise<void> {

    let promises: Promise<void>[] = [];

    //данные о типе трудоустройства. Исключаем данные по совмещениям (т.к. мы их не обрабатываем) и исключаем непроведённые документы из 1С (поле Active)
    const filteredTypeData = types.filter((item: any) => {
        return !!item.data["Record"]
    }).map((data: any) => {
        return data.data["Record"]
    }).flat().filter((item: any) => {
        return item["ВидЗанятости"] !== "Совмещена" && item["Active"]
    });

    //массив с айди физ лиц. Нужен для упрощённого поиска наличия сотрудников в кадровых данных
    const personsIds = filteredTypeData.map((item: any) => {
        return item["ФизическоеЛицо"]
    })

    const allEmployees = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
    )).size(10000).all();

    //выбираем только новых сотрудников
    const allNeededEmployees = allEmployees.filter(employee => {
        let found = false;
        //@ts-ignore
        const ids: string[] = employee.data.ref_eq_table!.map((elem: any) => elem.individual_ref);
        //@ts-ignore
        if (personsIds && personsIds.indexOf(employee.data.individual_id_1c) !== -1) {
            found = true;
        }

        if (!found && ids) {
            for (let id of ids) {
                //@ts-ignore
                if (personsIds && personsIds.indexOf(id) !== -1) {
                    found = true;
                    break;
                }
            }
        }

        return found;
    });

    //получаем категории занятости
    const mainWorkCategory = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.main_workplace;
    const innerWorkCategory = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.internal_combination;
    const outerWorkCategory = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.external_combination;

    for (let employee of allNeededEmployees) {

        const ids: string[] = employee.data.ref_eq_table!.map((elem: any) => elem.individual_ref);
        let allEmployments = filteredTypeData.filter((item: any) => !!item["ФизическоеЛицо"]).filter((item: any) => {
            return item["ФизическоеЛицо"] === employee.data.individual_id_1c || (!!ids && ids.indexOf(item["ФизическоеЛицо"]) !== -1)
        });

        //итерируемся по всем приёмам
        for (let i = 0; i < allEmployments.length; i++) {

            const currentEmployment = allEmployments[i];

            if (employee.data.employment_table) {
                //ищем строку трудоустройства
                let row = employee.data.employment_table.find(item => item.id_1c === currentEmployment["Сотрудник"]);

                //если строки нет - создаём
                if (!row) {
                    let newRow = employee.data.employment_table.insert();
                    newRow.id_1c = currentEmployment["Сотрудник"];

                    switch (currentEmployment["ВидЗанятости"]) {
                        case "ОсновноеМестоРаботы":
                            newRow.type_employment = mainWorkCategory;
                            break;
                        case "ВнутреннееСовместительство":
                            newRow.type_employment = innerWorkCategory;
                            break;
                        case "Совместительство":
                            newRow.type_employment = outerWorkCategory;
                            break;
                    }

                    //сохранение чанками
                    promises.push(employee.save())
                    if (promises.length >= littleChunkSize) {
                        await Promise.all(promises);
                        promises = [];
                    }

                }
            }
        }
    }

    await Promise.all(promises);
}

async function addPositionData(): Promise<void> {

    Context.data.loop_end = false;

    Context.data.iterator!++;

    if (Context.data.iterator! % posloopSize === 0 && Context.data.iterator! !== 0) {
        Context.data.is_pause = true;
    } else {
        Context.data.is_pause = false;
    }

    //получаем данные, которые нам пришли из 1С. Нас интересуют данные по занятости, типу трудоустройства и по сведениям об ответственных лицах
    const tables = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .where((f, g) => g.or(
            f.table_name.eq("InformationRegister_ЗанятостьПозицийШтатногоРасписания"),
        ))
        .size(10000)
        .all()

    //если данных нет, то выходим
    if (tables.length === 0) {
        Context.data.loop_end = true;
        return;
    }

    //сортируем данные по дате (чтобы обрабатывать их в правильном порядке)
    const sortedApps = tables.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    })

    //данные о позициях
    const positionsData = parseData(sortedApps, "InformationRegister_ЗанятостьПозицийШтатногоРасписания")

    //запускаем основной метод
    await addWorkData(positionsData);

    //обновляем поле Обработано у пакетов данных, которые обработали
    let promises: Promise<void>[] = []
    for (let app of tables) {
        app.data.is_processed = true
        promises.push(app.save())

        if (promises.length >= littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }

    await Promise.all(promises)
}

//проверка на актуальные данные
function isActualData(employee: TStaff,
    employee_id: string,
    position: TPosition,
    transfer_date: TDate): boolean {

    if (employee) {

        if (employee.data.employment_table) {

            const row = employee.data.employment_table.find((item: any) => item.id_1c && item.id_1c === employee_id);

            if (row && row.admission_date_position) {

                //let history_datetime = new Datetime(currentEmployment["Period"]);
                //let history_date = new TDate(history_datetime.year, history_datetime.month, history_datetime.day);

                if (row.admission_date_position.after(transfer_date)) {

                    Context.data.error_stack += ` ${employee.data.__name} ${position.data.__name} ${transfer_date.format()} в строчке ${row.admission_date_position.format()} - устаревшая информация `;
                    Context.data.debug += ` ${employee.data.__name} ${position.data.__name} ${transfer_date.format()} в строчке ${row.admission_date_position.format()} устаревшая информация `;
                    return false;
                }
            }
        }

    }
    return true;
}

//заполняем данные о руководителях, бухгалтерах и т.д. в приложении Организации
async function loadHeadData(parsedHeadData: any[], allEmployees: TStaff[]): Promise<void> {

    //массив промисов для обработки чанками
    let promises: Promise<void>[] = [];

    //все неудалённые организации
    const orgs = await Namespace.app.organization.search()
        .where(f => f.__deletedAt.eq(null))
        .size(10000).all()

    //цикл по полученным данным
    for (let i = 0; i < parsedHeadData.length; i++) {

        //ищем среди существующих организаций ту, с которой сходится id из пришедших данных
        const currentOrg = orgs.find(item => item.data.ref_key === parsedHeadData[i]["Организация"])
        if (!currentOrg) continue;

        //заполняем позицию руководителя
        if (!currentOrg.data.position_head) {
            const head = allEmployees.find(emp => emp.data.individual_id_1c === parsedHeadData[i]["Руководитель"])
            if (head) {
                currentOrg.data.position_head = head.data.position;
            }
        }

        //заполняем подписантов
        if (!currentOrg.data.signatories || currentOrg.data.signatories.length === 0) {
            const head = allEmployees.find(emp => emp.data.individual_id_1c === parsedHeadData[i]["Руководитель"])
            if (head) {
                currentOrg.data.signatories = [head];
            }
        }

        //заполнение директора
        const head = allEmployees.find(emp => emp.data.individual_id_1c === parsedHeadData[i]["Руководитель"])
        if (head) {
            //заполнение директора в сист. справочнике Организации
            if (currentOrg.data.entity && head.data.ext_user) {
                const orgApp = await currentOrg.data.entity.fetch();
                orgApp.data._director = head.data.ext_user;
                await orgApp.save();
            }

        }

        //заполняем эйчара
        const hr = allEmployees.find(emp => emp.data.individual_id_1c === parsedHeadData[i]["РуководительКадровойСлужбы"])
        if (hr) {
            if (!currentOrg.data.position_hr) {
                currentOrg.data.position_hr = hr.data.position
            }
            if (!currentOrg.data.hr_department || currentOrg.data.hr_department.length === 0) {
                currentOrg.data.hr_department = [hr]
            }
        }

        //заполняем бухгалтера
        if (!currentOrg.data.accounting || currentOrg.data.accounting.length === 0) {
            const accounting = allEmployees.find(emp => emp.data.individual_id_1c === parsedHeadData[i]["ГлавныйБухгалтер"]);

            if (accounting) {
                currentOrg.data.accounting = [accounting]
            }
        }

        //заполняем ответственных за финансы
        if (!currentOrg.data.matching_finance || currentOrg.data.matching_finance.length === 0) {
            const finance = allEmployees.find(emp => emp.data.individual_id_1c === parsedHeadData[i]["Кассир"])
            if (finance) {
                currentOrg.data.matching_finance = [finance]
            }
        }

        //сохранение чанками
        promises.push(currentOrg.save())
        if (promises.length >= littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }
    await Promise.all(promises);
}

//отложенная установка перевода
//все данные помещаем в массив объектов и посылаем подпроцесс с таймером
function addTransferData(transferSendData: ITransferSendData,
    transfers: TransferData[]): boolean {
    let dateNow = new TDate();

    //отправляем данные только в том случае, если дата перевода позже текущей даты
    if (transferSendData.transferDate.after(dateNow)) {

        let transfer: TransferData = {
            employeeIndividualId: transferSendData.employee.data.individual_id_1c!,
            typeWorkRelation: !!transferSendData.typeWorkRelation ? transferSendData.typeWorkRelation.name : "",
            subdivisionId: transferSendData.subdivisionApp.data.ref_key as string,
            orgId: transferSendData.orgApp.data.ref_key as string,
            id_1c: transferSendData.employeeId as string,
            typeFromData: transferSendData.typeFromData,
            transferDate: transferSendData.transferDate.format(),
            rate: transferSendData.rate,
            posId: transferSendData.posId,
            existingPositions: transferSendData.existingPositions,
        }
        transfers.push(transfer);

        //добавили все данные в массив, а пока дальнейшую обработку пропускаем 
        return true;
    }
    return false;
}

//метод для ситуации, если мы уволили сотрудника, а потом приняли снова. При таком подходе у нас будет несколько строк с типом устройства "Основное место работы". Неактуальную информацию (строку занятости) нужно удалить
async function deletePreviousPosition(employee: TStaff,
    employmentRow: TEmploymentTableRow,
    typeFromData: any,
    employeeId: string): Promise<void> {

    //проверка на основное место работы. Совместительства мы не трогаем, так как строчки по ним удаляются при увольнении
    if (typeFromData && employee.data.employment_table && employmentRow.type_employment.name === 'Основное место работы') {
        //проверяем, есть ли ещё строки с основным местом работы
        let mainWorkTypes = employee.data.employment_table.filter((item: any) => item.type_employment.name === 'Основное место работы');
        if (mainWorkTypes && mainWorkTypes.length > 1) {
            //если нашли несколько основных мест, удаляем первое (т.к. мы только что добавили новую строчку, и она, очевидно, не первая)
            let rowToDelete = mainWorkTypes.find((item: any) => item.id_1c !== employeeId);
            if (rowToDelete) {
                try {
                    employee.data.employment_table.delete(employee.data.employment_table.indexOf(rowToDelete));
                    employee.data.id_1c = employmentRow.id_1c;
                    await employee.setStatus(employee.fields.__status.variants.new);
                    await employee.save();
                } catch (e) {
                    Context.data.error_stack += ` Не удалось удалить предыдущее основное место работы `;
                }
            }
        }
    }
}

//функция для получения данных о временных кадровых переводах или срочных трудовых договорах
async function findFixedTermOrTemporaryTransferData(positions: any): Promise<IFixedTermData[]> {
    //данные о срочных ТД и переводах с датой окончания. Нужно для отправки данных кадровикам об окончании срока ТД или КП
    const fixedtermData = positions.filter((item: any) => {
        return !!item.data["Record"]
    }).map((data: any) => {
        return data.data["Record"]
    }).flat().filter((item: any) => {
        return item["ВидЗанятостиПозиции"] !== "Совмещена" && item["Active"] && (!(item["ПланируемаяДатаЗавершения"].includes("0001")) || (!item["ДействуетДо"].includes("0001")))
    })

    //мапим значения по временным КП, чтобы потом всё это отправить в подпроцесс
    let mappedFixedTermData: IFixedTermData[] = [];
    let i = -1;
    for (let item of fixedtermData) {
        i++;
        //у нас есть 2 поля, где хранится дата окончания. Выбираем то, где заполнено значение
        let endDate = item["ПланируемаяДатаЗавершения"];
        if (!endDate || (endDate && endDate.includes("0001"))) {
            endDate = item["ДействуетДо"];
        }

        //ищем сотрудника
        const employee = await Namespace.app.staff.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.individual_id_1c.eq(item["ФизическоеЛицо"])
        )).first();

        //нужно найти предыдущую позицию. Для этого ищем по item["Сотрудник"] в таблице занятости у сотрудника
        if (employee && employee.data.employment_table) {
            let row = employee.data.employment_table.find((elem: any) => elem.id_1c === item["Сотрудник"]);

            if (row && row.position) {

                let posApp = await row.position.fetch();

                let elem: IFixedTermData = {
                    employeeIndividualId: employee.data.individual_id_1c as string,
                    employeeId: row.id_1c as string,
                    endDate: endDate,
                    prevPositionId: posApp.data.ref_key as string,
                    prevPositionDate: row.admission_date_position.format(),
                    isMainWorktype: row.type_employment.name === "Основное место работы" ? true : false,
                }
                mappedFixedTermData.push(elem);
            }
        }
    };

    return mappedFixedTermData;
}

//функция для определения типа перевода (временный или постоянный). Возвращает элемент IUpdatedTransferData, который потом отправляется дальше по процессам
function returnTransferDataElement(mappedFixedTermData: IFixedTermData[], updatedTransferData: IUpdatedTransferData): IUpdatedTransferData {
    let updatedTransferDataElement: IUpdatedTransferData;
    let temporary = mappedFixedTermData.find(item => item.employeeId === updatedTransferData.employeeId);

    if (temporary) {
        updatedTransferDataElement = {
            employeeId: updatedTransferData.employeeId,
            employeeIndividualId: updatedTransferData.employeeIndividualId,
            isTemporaryTransfer: true,
            endTransferDate: updatedTransferData.endTransferDate,
            newPositionId: updatedTransferData.newPositionId,
            employmentDirectoryId: updatedTransferData.employmentDirectoryId
        }
    } else {
        updatedTransferDataElement = {
            employeeId: updatedTransferData.employeeId,
            employeeIndividualId: updatedTransferData.employeeIndividualId,
            isTemporaryTransfer: false,
            newPositionId: updatedTransferData.newPositionId,
            employmentDirectoryId: updatedTransferData.employmentDirectoryId
        }
    };

    return updatedTransferDataElement;
}

//основной метод добавления/изменения позиций у сотрудника и в его таблице занятости
async function addWorkData(positions: any) {
    //TODO отдельно обрабатывать руководителей

    //данные для бп, который обновляет данные в карточке позиции (актуальные и не актуальные сотрудники)
    let updatedTransferData: IUpdatedTransferData[] = [];

    //сюда записываем данные о кадровых переводах, чтобы потом их отложенно выполнить
    let transfers: TransferData[] = [];

    //данные о позициях. Исключаем данные по совмещениям (т.к. мы их не обрабатываем) и исключаем непроведённые документы из 1С (поле Active)
    const filteredPosData = positions.filter((item: any) => {
        return !!item.data["Record"]
    }).map((data: any) => {
        return data.data["Record"]
    }).flat().filter((item: any) => {
        return item["ВидЗанятостиПозиции"] !== "Совмещена" && item["Active"]
    });

    //массив с айди физ лиц. Нужен для упрощённого поиска наличия сотрудников в кадровых данных
    const personsIds = filteredPosData.map((item: any) => {
        return item["ФизическоеЛицо"];
    });

    //получаем данные по временным кадровым переводам
    let mappedFixedTermData: IFixedTermData[] = await findFixedTermOrTemporaryTransferData(positions);

    //преобразовываем данные по срочным ТД и  в строку, чтобы далее в цикле их обрабатывать
    Context.data.fixedterm_data = JSON.stringify(mappedFixedTermData);

    //TODO Возможно стоит сделать поиск чанками
    //выборка по всем не удалённым позициям ШР
    const allPositions = await Namespace.app.position.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    //выборка по всем не удалённым сотрудникам
    const allEmployees = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
    )).size(10000).all();

    //
    let promises: Promise<void>[] = [];

    //если в пришедших данных нет информации о сотрудниках (по сути, пустой пакет) - выходим из метода
    if (personsIds.length === 0) {
        Context.data.debug += ` personsIds.length === 0 `;
        return;
    }

    //получаем категории занятости
    const mainWorkCategory = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.main_workplace
    //const innerWorkCategory = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.internal_combination
    //const outerWorkCategory = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.external_combination

    //выбираем только новых сотрудников
    const allNeededEmployees = allEmployees.filter(employee => {
        let found = false;
        //@ts-ignore
        const ids: string[] = employee.data.ref_eq_table!.map((elem: any) => elem.individual_ref);
        //@ts-ignore
        if (personsIds && personsIds.indexOf(employee.data.individual_id_1c) !== -1) {
            found = true;
        }

        if (!found && ids) {
            for (let id of ids) {
                //@ts-ignore
                if (personsIds && personsIds.indexOf(id) !== -1) {
                    found = true;
                    break;
                }
            }
        }

        return found;
    });

    //загрузка позиций
    for (let employee of allNeededEmployees) {

        Context.data.debug += employee.data.__name

        const ids: string[] = employee.data.ref_eq_table!.map((elem: any) => elem.individual_ref);

        //allEmploymentsAndTransfers - все выбранные данные по приёмам и переводам 
        let allEmploymentsAndTransfers = filteredPosData.filter((item: any) => !!item["ФизическоеЛицо"]).filter((item: any) => {
            return item["ФизическоеЛицо"] === employee.data.individual_id_1c || (!!ids && ids.indexOf(item["ФизическоеЛицо"]) !== -1);
        });

        //массив с айди позиций, которые уже установлены у сотрудника
        const existingPositions = employee.data.employment_table?.map(item => {
            if (item.position && item.position.id)
                return item.position.id;
        });

        //rate - ставка
        let rate = 0;

        //итерируемся по всем приёмам и переводам
        for (let i = 0; i < allEmploymentsAndTransfers.length; i++) {

            const currentEmployment = allEmploymentsAndTransfers[i];

            //убираем записи по увольнениям. По ним у нас ВидЗанятостиПозиции = Открыта.
            if (currentEmployment["ВидЗанятостиПозиции"] !== 'Занята') {
                continue;
            }

            //айди сотрудника
            const employeeId = currentEmployment["Сотрудник"];

            //ставка
            try {
                rate += currentEmployment["КоличествоСтавок"];
            } catch (e) {
                rate += 1;
            }

            let pos: any = undefined;

            //ищем позицию ШР среди существующих
            if (currentEmployment) {
                pos = allPositions.find(item => item.data.ref_key === currentEmployment["ПозицияШтатногоРасписания"])
            }

            //если не нашли, идём к следующим данным
            if (!pos) {
                Context.data.debug += ' Не загружена позиция для ' + employee.data.__name;
                continue;
            }

            //берём организацию из позиции ШР
            const org = pos.data.organization;
            let orgApp = await org.fetch();
            Context.data.debug += ` ${pos.data.__name} ${currentEmployment["Period"]} ${orgApp.data.__name} `;
            //подразделение тоже берём из позиции ШР
            const subdivision = pos.data.subdivision;
            let typeWorkRelation: any;

            //отложенная установка перевода
            //все данные помещаем в массив объектов и посылаем подпроцесс с таймером
            let subdivisionApp = await subdivision.fetch();
            let posApp = await pos.fetch();
            //дата перевода
            let historyDatetime = new Datetime(currentEmployment["Period"]);
            let historyDate = new TDate(historyDatetime.year, historyDatetime.month, historyDatetime.day);

            //строка таблицы занятости
            let employmentRow: Table$kedo$staff$employment_table$Row | undefined

            //находим нужную строку в таблице занятости или создаём новую
            if (existingPositions) {
                Context.data.debug += ` существует позиция `;

                employmentRow = employee.data.employment_table!.find((item: any) => employeeId && item.id_1c && item.id_1c === employeeId);

                //проверяем на актуальность данных
                if (employmentRow && employmentRow.admission_date_position && employmentRow.admission_date_position.after(historyDate)) {
                    Context.data.error_stack += ` ${employee.data.__name} ${currentEmployment["ПозицияШтатногоРасписания"]} ${historyDate.format()} в строке ${employmentRow.admission_date_position.format()} - устаревшая информация `;
                    Context.data.debug += ` ${employee.data.__name} ${currentEmployment["ПозицияШтатногоРасписания"]} ${historyDate.format()} в строке ${employmentRow.admission_date_position.format()} - устаревшая информация `;
                    continue;
                }

                if (!employmentRow) {
                    Context.data.debug += ` не нашли строку в таблице  `;
                    employmentRow = employee.data.employment_table!.insert();
                }
            } else {
                employmentRow = employee.data.employment_table!.insert()
            }
            if (!employmentRow && pos && pos.id) {
                Context.data.error_stack += " Не нашли строку с позицией " + pos.id
                continue;
            }

            //ищем элемент справочника "Справочник занятости"
            let empRow = employee.data.employment_table!.find(item => item.id_1c === employeeId);
            let employmentDirectory: TEmploymentDirectory | undefined = undefined;
            if (empRow) {
                employmentDirectory = empRow.employment_placement_app;
            };

            let updatedTransferDataInfo: IUpdatedTransferData = {
                employeeId: employeeId,
                employeeIndividualId: employee.data.individual_id_1c as string,
                endTransferDate: historyDate.format(),
                newPositionId: currentEmployment["ПозицияШтатногоРасписания"],
                employmentDirectoryId: employmentDirectory ? employmentDirectory.id : undefined,
                isTemporaryTransfer: false
            }

            typeWorkRelation = employmentRow.type_employment;
            if (!typeWorkRelation) {
                typeWorkRelation = mainWorkCategory;
            }

            let typeFromData = false;

            if (!employmentRow.position) {
                typeFromData = true;
            }

            if (!typeFromData) {

                let updatedTransferDataElement: IUpdatedTransferData = returnTransferDataElement(mappedFixedTermData, updatedTransferDataInfo);
                updatedTransferData.push(updatedTransferDataElement);
            }

            //заполняем объект данными
            let transferSendData: ITransferSendData = {
                employee: employee,
                transferDate: historyDate,
                subdivisionApp: subdivisionApp,
                orgApp: orgApp,
                posId: currentEmployment["ПозицияШтатногоРасписания"],
                typeWorkRelation: typeWorkRelation,
                employeeId: employeeId,
                typeFromData: typeFromData,
                rate: currentEmployment["КоличествоСтавок"],
                existingPositions: !!existingPositions
            }
            //проверяем на условия (дата перевода позже текущей)
            let isTransferData = addTransferData(transferSendData, transfers);

            //если условия выполнены
            if (isTransferData) {
                let updatedTransferDataElement: IUpdatedTransferData = returnTransferDataElement(mappedFixedTermData, updatedTransferDataInfo);
                updatedTransferData.push(updatedTransferDataElement);

                //добавили все данные в массив, а пока дальнейшую обработку пропускаем, она будет проходить в другом подпроцессе
                continue;
            }

            //проверка на актуальные данные (чтобы не загрузить старые данные и не затереть новые изменения)
            if (!isActualData(employee, employeeId, posApp, historyDate)) {
                //не актуальная информация, не загружаем её
                return;
            }

            //если заполнен тип трудоустройства и он Основное место работы, тогда заполняем специфичные для него поля
            try {
                if (typeWorkRelation && typeWorkRelation.name === mainWorkCategory.name) {
                    employee.data.employment_type = mainWorkCategory;
                    employee.data.id_1c = employeeId;
                }
            } catch (e) {
                Context.data.value_3 = `${employee.data.__name}`;
            }

            //заполняем айди сотрудника в строке, этот айди является уникальным полем строки и по нему мы ищем соответствие при загрузке
            employmentRow.id_1c = employeeId

            if (org) {
                employmentRow.organization = org
            }
            if (pos) {
                employmentRow.position = pos;
            }
            if (subdivision) {
                employmentRow.subdivision = subdivision
            }

            //заполняем тип трудоустройства только при условии, что у нас есть данные и он ещё не заполнен
            // if (typeFromData && typeWorkRelation !== undefined) {
            //     employmentRow.type_employment = typeWorkRelation;
            // }

            Context.data.debug += ` employmentRow.type_employment ${!!employmentRow.type_employment} `;

            //добавили заполнение даты приёма на позицию для проверки на старую информацию
            employmentRow.admission_date_position = historyDate;

            //заполняем ставку
            try {
                employmentRow.rate = currentEmployment["КоличествоСтавок"]
            } catch (e) {
                employmentRow.rate = 1;
            }

            try {

                //заполняем данные о позиции в самом сотруднике, если приём/перевод был по основному месту работы
                if (employmentRow && employmentRow.type_employment && employmentRow.type_employment.name === mainWorkCategory.name) {
                    if (pos) {
                        employee.data.position = pos;
                    }
                    if (subdivision) {
                        employee.data.structural_subdivision = subdivision;
                    }
                    if (org) {
                        employee.data.organization = org;
                        const orgApp = await org.fetch();
                        employee.data.entity = orgApp.data.entity;
                    }

                    employee.data.employment_type = mainWorkCategory;
                    employee.data.id_1c = employeeId;
                }
            } catch (e) {
                Context.data.value_3 = `${employee.data.__name}`;
            }

            try {
                //если мы уволили сотрудника, а потом приняли снова. При таком подходе у нас будет несколько строк с типом устройства "Основное место работы"
                await deletePreviousPosition(employee, employmentRow, typeFromData, employeeId);
            } catch (e) {
                Context.data.value_3 = `${employee.data.__name}`;
            }
        }

        employee.data.rate = rate;
        promises.push(employee.save());

        //добавление в массив по добавлению прав (в конце процесса)
        if (Context.data.created_staffs!.indexOf(employee) !== -1) {
            Context.data.created_staffs!.push(employee);
        }

        //сохранение чанками
        if (promises.length >= littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }

    //если данные о кадровых переводах имеются, то мы их отправяем на обработку
    if (transfers.length > 0) {
        Context.data.transfers = JSON.stringify(transfers);
    }

    if (updatedTransferData.length > 0) {
        Context.data.data_for_update_positions = JSON.stringify(updatedTransferData);
    }

    await Promise.all(promises)
    promises = []
}

async function addDocumentData(documents: any) {
    const filteredData = documents.filter((item: any) => {
        return !!item.data["Record"] && item.data["Record"][0]["Представление"].includes("Паспорт")
    }).map((item: any) => item.data["Record"][0])

    let personsIds = filteredData.map((item: any) => {
        //Context.data.debug += item.data.Record[0]["Физлицо"]
        return item["Физлицо"]
    })
    if (personsIds.length == 0) {
        return;
    }

    let allEmployees: any[];
    try {
        allEmployees = await Namespace.app.staff.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.individual_id_1c.in(personsIds)
        )).size(10000).all()
    } catch (e) {
        personsIds = personsIds.map((item: any) => {
            return item["data"]
        })
        if (personsIds.length == 0) {
            return;
        }

        Context.data.debug += ` ${JSON.stringify(personsIds)} `;

        allEmployees = await Namespace.app.staff.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.individual_id_1c.in(personsIds)
        )).size(10000).all();
    }
    let promises: Promise<void>[] = []

    for (let employee of allEmployees) {
        let found = false;

        const ids = employee.data.ref_eq_table!.map((elem: any) => elem.individual_ref);
        for (let id of ids) {
            if (personsIds.indexOf(id) !== -1 || personsIds.indexOf(employee.data.individual_id_1c)) {
                found = true;
                break;
            }
        }

        if (!found) {
            continue;
        }

        //const docDataTable = filteredData.filter((data: any) => data["Физлицо"] === employee.data.individual_id_1c)
        let docDataTable = filteredData.filter((item: any) => !!item["Физлицо"]).filter((item: any) => {
            //@ts-ignore
            const ids = employee.data.ref_eq_table!.map((elem: any) => elem.individual_ref);
            return item["Физлицо"] === employee.data.individual_id_1c || ids.indexOf(item["Физлицо"]) !== -1
        });

        if (!docDataTable || docDataTable.length == 0) {

            docDataTable = docDataTable = filteredData.filter((item: any) => !!item["Физлицо"]["data"]).filter((item: any) => {
                //@ts-ignore
                const ids = employee.data.ref_eq_table!.map((elem: any) => elem.individual_ref);
                return item["Физлицо"]["data"] === employee.data.individual_id_1c || ids.indexOf(item["Физлицо"]["data"]) !== -1
            });

            Context.data.debug += ` ${JSON.stringify(docDataTable)} `;

            if (!docDataTable || docDataTable.length == 0) {
                continue;
            }
        };

        const sortedPassports = docDataTable.sort((a: any, b: any) => {
            const aDate: any = new Date(a["Period"])
            const bDate: any = new Date(b["Period"])
            return bDate - aDate
        })

        const docData = sortedPassports[0]
        const [issueYear, issueMonth, issueDay] = docData["ДатаВыдачи"].split("T")[0].split("-").map((item: string) => parseInt(item));

        const passport: DocumentData = {
            isRf: docData["Представление"].includes("Паспорт гражданина РФ") || docData["Представление"].includes("Паспорт гражданина Российской Федерации"),
            passportSeries: docData["Серия"].replace(/\s/g, ''),
            passportNumber: docData["Номер"],
            passportDepCode: docData["КодПодразделения"],
            passportIssueDate: new TDate(issueYear, issueMonth, issueDay),
            passportIssuer: docData["КемВыдан"],
        }

        //проверка на актуальность данных
        if (employee.data.date_of_issue && passport.passportIssueDate) {
            if (employee.data.date_of_issue.after(passport.passportIssueDate)) {
                Context.data.error_stack += ` ${employee.data.__name} outdated information `;
                Context.data.debug += ` ${employee.data.__name} outdated information `;
                continue;
            }
        }

        employee.data.passport_series = passport.passportSeries;
        employee.data.russian_passport = passport.isRf;
        employee.data.passport_number = passport.passportNumber;
        employee.data.passport_department_code = passport.passportDepCode.length === 6 ? passport.passportDepCode.slice(0, 3) + "-" + passport.passportDepCode.slice(3) : passport.passportDepCode.replace(" ", "");
        employee.data.date_of_issue = passport.passportIssueDate;
        employee.data.issued_by = passport.passportIssuer;
        promises.push(employee.save())
        if (promises.length >= littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }

    await Promise.all(promises)
}

async function createBaseEmployees(employees: any, persons: any, types: any = undefined) {

    let mappedData: any;
    let acceptData: any;
    let fireData: any;

    if (types) {
        //выбираем данные по приёму на работу и по увольнению
        // @ts-ignore
        mappedData = types.filter((item: any) => !!item.data["Record"]).map((item: any) => item.data["Record"]).flat().filter((item: any) => item["Active"] && item["КоличествоСтавок"] === 1);
        acceptData = mappedData.filter((item: any) => item["ВидСобытия"] === "НачальныеДанные" || item["ВидСобытия"] === "Прием" || item["ВидСобытия"] === "Перемещение");
        fireData = mappedData.filter((item: any) => item["ВидСобытия"] === "Увольнение");
    }

    const personsIds = persons.filter((item: any) => !!item.data["ИНН"]).map((item: any) => item.data["ИНН"])

    if (personsIds.length == 0) {
        return;
    }
    const allEmployees = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.inn.in(personsIds)
    )).size(10000).all()

    const defaultCategory = await Namespace.app.employees_categories.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq("default")
    )).first()

    let promises: Promise<void>[] = []
    const processedIds: string[] = []

    for (let i = persons.length - 1; i >= 0; i--) {
        const person = persons[i].data

        if (types) {

            let found_accept_data = acceptData.filter((elem: any) => elem["ФизическоеЛицо"] === person["Ref"]);
            let found_fire_data = fireData.filter((elem: any) => elem["ФизическоеЛицо"] === person["Ref"]);

            //на основании данных, если нам пришёл приём и увольнение, тогда мы не загружаем такого сотрудника (скорее всего это первичная выгрузка и нам не нужно загружать уволенных)
            if (found_accept_data && found_accept_data.length > 0 && found_fire_data && found_fire_data.length > 0) {

                Context.data.debug += ` in 1 `

                let last_accept_date = new TDate(1, 1, 1);
                let last_fire_date = new TDate(1, 1, 1);

                for (let found_data of found_accept_data) {
                    Context.data.debug += ` a ${found_data["Period"]} `
                    let datetime = new Datetime(found_data["Period"]);
                    let date = new TDate(datetime.year, datetime.month, datetime.day);
                    if (date && date.after(last_accept_date)) {
                        last_accept_date = date;
                    }
                }

                for (let found_data of found_fire_data) {
                    Context.data.debug += ` f ${found_data["Period"]} `
                    let datetime = new Datetime(found_data["Period"]);
                    let date = new TDate(datetime.year, datetime.month, datetime.day);
                    if (date && date.after(last_fire_date)) {
                        last_fire_date = date;
                    }
                }

                Context.data.debug += ` fdate ${last_fire_date.day}.${last_fire_date.month}.${last_fire_date.year} `
                Context.data.debug += ` fdate ${last_accept_date.day}.${last_accept_date.month}.${last_accept_date.year} `

                if (last_fire_date.after(last_accept_date)) {
                    Context.data.error_stack += ` ${person['Description']} не был загружен, так как он принят и уволен по основному месту работы `
                    continue;
                }
            }
        }

        const isProcessed = !!(processedIds.find((inn: string) => inn === person["ИНН"]))
        if (isProcessed) continue;

        let createNew = false;
        let employeeId: string | undefined = "";
        let employeeCode: string | undefined = "";

        //если у сотрудника не заполнен ИНН, пропускаем такого сотрудника
        if (person["ИНН"] === "") {
            continue;
        }

        let currentEmployee = allEmployees.find(e => e.data.inn === person["ИНН"]);
        if (!currentEmployee) {
            const currentEmployee = employees.find((item: any) => person.Ref === item.data["ФизическоеЛицо"])?.data
            if (!currentEmployee) {
                Context.data.error_stack += `для физического лица ${person["Description"]} ${person["ИНН"]} не найден сотрудник`
            } else {
                //Context.data.debug += ` ${person.Ref} found in external table`
                employeeId = currentEmployee["Ref"]
                employeeCode = currentEmployee["Code"]
            }

            createNew = true
        } else {
            Context.data.debug += ` ${person["ИНН"]} found ${currentEmployee.data.id_1c}`
            employeeId = currentEmployee.data.id_1c
            employeeCode = currentEmployee.data.personal_number
        }
        const addressField = person["КонтактнаяИнформация"]?.find((info: any) => info["Тип"] === "Адрес")
        let addressObj: any = {}
        if (!!addressField) {

            if (addressField["Значение"] !== "") {
                addressObj = addressField["Значение"] ? JSON.parse(addressField["Значение"]) : {};
            } else {

                const extractAddressInfo = (input: string) => {
                    // Регулярное выражение для извлечения данных
                    const regex = /(?:г(?:ор(?:од)?)?)?\s*(?:п\.?|пос\.?|посёлок|поселок|с\.?|село|пгт|дер\.?|д\.?)?\s*([^\d,]+),\s*ул\.?\s*([^\d,]+),\s*д(?:ом)?\.?\s*(\d+),\s*кв\.?\s*(\d+)/;

                    // Извлекаем данные с помощью регулярного выражения
                    const match = input.match(regex);

                    if (match) {
                        // Индексы групп в регулярном выражении
                        const cityIndex = 1;
                        const streetIndex = 2;
                        const houseIndex = 3;
                        const apartmentIndex = 4;

                        // Извлекаем данные из совпадения
                        const city = match[cityIndex].trim();
                        const street = match[streetIndex].trim();
                        const house = match[houseIndex].trim();
                        const apartment = match[apartmentIndex].trim();

                        // Формируем итоговую строку
                        const result = {
                            "city": city,
                            "street": street,
                            "houseNumber": house,
                            "apartments": [{ "number": apartment }],
                        }
                        return result;
                    } else {
                        return new Object;
                    }
                }

                addressObj = extractAddressInfo(addressField["Представление"]);
            }
        }

        const email = person["КонтактнаяИнформация"]?.find((info: any) => info["Тип"] === "АдресЭлектроннойПочты");
        const phoneNumber = person["КонтактнаяИнформация"]?.find((info: any) => info["Тип"] === "Телефон" && info["Представление"]?.length >= 11);

        let birthYear: number | undefined = undefined
        let birthMonth: number | undefined = undefined
        let birthDay: number | undefined = undefined
        try {
            [birthYear, birthMonth, birthDay] = person["ДатаРождения"].split("T")[0].split("-").map((item: string) => parseInt(item)); // new Date("00-00-0000T00:00:00")
        } catch (e) {
            Context.data.error_stack += "Couldn't parse date " + person["ДатаРождения"]
        }

        // @TODO УБРАТЬ
        const singleEmployeeData: BasePerson = {
            id: employeeId,
            code: employeeCode,
            individual_id: person["Ref"],
            name: {
                firstname: person["Имя"],
                lastname: person["Фамилия"],
                middlename: person["Отчество"],
            },
            firstname: person["Имя"],
            lastname: person["Фамилия"],
            middlename: person["Отчество"],
            email: email ? {
                email: email["Представление"],
                type: EmailType.Work,
            } : undefined,
            phoneNumber: phoneNumber ? {
                tel: formatPhoneNumber(phoneNumber["Представление"]),
                type: PhoneType.Work,
            } : undefined,
            sex: person["Пол"] === "Мужской" ? true : false,
            marriage: false,
            city: addressObj?.city || addressObj?.locality || addressObj?.area,
            street: addressObj?.street || undefined,
            home: addressObj?.houseNumber,
            apartment: addressObj?.apartments && addressObj.apartments.length > 0 ? addressObj.apartments[0].number : undefined,
            housing: addressObj?.buildings && addressObj.buildings.length > 0 ? addressObj.buildings[0].number : undefined,
            snils: person["СтраховойНомерПФР"],
            inn: person["ИНН"],
        }

        if (birthDay && birthMonth && birthYear) {
            singleEmployeeData.birthDate = new TDate(birthYear, birthMonth, birthDay)
        }

        if (createNew || !currentEmployee) {
            currentEmployee = Context.fields.staff.app.create()
            currentEmployee.data.id_1c = singleEmployeeData.id
            currentEmployee.data.user_already_exists = false
            currentEmployee.data.personal_number = singleEmployeeData.code
            currentEmployee.data.individual_id_1c = singleEmployeeData.individual_id

            let row = currentEmployee.data.ref_eq_table!.insert();
            row.individual_ref = singleEmployeeData.individual_id;

            if (!!defaultCategory) {
                const newRow = currentEmployee.data.categories_table!.insert()
                newRow.staff_categories = defaultCategory
                currentEmployee.data.staff_categories = [defaultCategory]
            }
        }

        const individualIds = currentEmployee.data.ref_eq_table!.map((item: any) => item.individual_ref)
        if (individualIds.indexOf(singleEmployeeData.individual_id) === -1) {
            let row = currentEmployee.data.ref_eq_table!.insert();
            row.individual_ref = singleEmployeeData.individual_id;
        }

        if (!!singleEmployeeData.name) {
            currentEmployee.data.full_name = singleEmployeeData.name;
        }
        if (!!singleEmployeeData.firstname) {
            currentEmployee.data.name = singleEmployeeData.firstname;
        }
        if (!!singleEmployeeData.lastname) {
            currentEmployee.data.surname = singleEmployeeData.lastname;
        }
        if (!!singleEmployeeData.middlename) {
            currentEmployee.data.middlename = singleEmployeeData.middlename;
        }
        if (!!singleEmployeeData.email) {
            currentEmployee.data.email = singleEmployeeData.email
        }
        if (!!singleEmployeeData.phoneNumber) {
            currentEmployee.data.phone = singleEmployeeData.phoneNumber
        }
        if (singleEmployeeData.sex === true) {
            currentEmployee.data.sex = singleEmployeeData.sex;
        } else {
            currentEmployee.data.sex = false;
        }
        if (!!singleEmployeeData.birthDate) {
            currentEmployee.data.date_of_birth = singleEmployeeData.birthDate
        }
        if (!!singleEmployeeData.city) {
            currentEmployee.data.city = singleEmployeeData.city
        }
        if (!!singleEmployeeData.street) {
            currentEmployee.data.street = singleEmployeeData.street
        }
        if (!!singleEmployeeData.home) {
            currentEmployee.data.home = singleEmployeeData.home
        }
        if (!!singleEmployeeData.apartment) {
            currentEmployee.data.apartment = singleEmployeeData.apartment
        }
        if (!!singleEmployeeData.housing) {
            currentEmployee.data.housing = singleEmployeeData.housing
        }
        if (!!singleEmployeeData.snils) {
            currentEmployee.data.snils = singleEmployeeData.snils
        }
        if (!!singleEmployeeData.inn) {
            //задача 2329
            //скорее всего это временное решение, но думаю, что оно решит основную проблему
            //у нас перезаполняется инн инном другого сотрудника
            //поэтому сделаем заполнение инн только если поле изначально пустое

            if (!currentEmployee.data.inn) {
                currentEmployee.data.inn = singleEmployeeData.inn;
            }
        }

        const address = `
                ${singleEmployeeData.city ? singleEmployeeData.city : ""}
                ${singleEmployeeData.street ? ", ул. " + singleEmployeeData.street : ""}
                ${singleEmployeeData.home ? ", д. " + singleEmployeeData.home : ""}
                ${singleEmployeeData.housing ? ", корп. " + singleEmployeeData.housing : ""}
                ${singleEmployeeData.apartment ? ", кв. " + singleEmployeeData.apartment : ""}
            `
        currentEmployee.data.address = address;
        currentEmployee.data.registration_address = address;

        // Доработка для настройки прав доступа.
        Context.data.created_staffs!.push(currentEmployee);
        promises.push(currentEmployee.save());
        if (currentEmployee.data.inn) {
            processedIds.push(currentEmployee.data.inn!);
        }

        if (promises.length >= littleChunkSize) {
            await Promise.all(promises)
            promises = []
        }
    }
    await Promise.all(promises)
}

async function loadAdditionalOrgData(): Promise<void> {
    const searchData = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("InformationRegister_СведенияОбОтветственныхЛицах")
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .size(10000).all()

    if (!searchData || searchData.length === 0) {
        return;
    }
    const sortedApps = searchData.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    })

    const data = parseData(sortedApps, "InformationRegister_СведенияОбОтветственныхЛицах")
    const personIds: string[] = []
    const orgIds: string[] = []
    for (let i = 0; i < data.length; i++) {
        const id = data[i].data.Record[0]
    }

}

class MyRole {
    group: UserGroupItem | UserItem[] | OrganisationStructureItem
    type: 'group' | 'user' | 'orgstruct'
    code: string
    constructor(group: UserGroupItem | UserItem[] | OrganisationStructureItem, type: 'group' | 'user' | 'orgstruct', code: string) {
        this.code = code;
        this.group = group;
        this.type = type;
    }
    getUsers(): Promise<UserItem[]> {
        if (this.type == "group") {
            return (<UserGroupItem>this.group).users();
        }
        else if (this.type == "orgstruct") {
            return System.users.search().where(i => i.osIds.has((<OrganisationStructureItem>this.group))).size(10000).all()
        }
        else return new Promise<UserItem[]>(() => <UserItem[]>this.group)
    }
    json(): any {
        return {
            code: this.code,
            type: this.type
        }
    }
}

async function splitStaff(): Promise<void> {

    //try {
    Context.data.new_staff_exists = true;
    const staffs = await Context.fields.created_staffs.fetchAll();
    Context.data.debug += ` ${staffs!.length} `;
    const allOrgs = await Namespace.app.organization.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allOrgRights = await Namespace.app.access_settings_organization.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    let staffMeta: staffData[] = [];
    let accessSettingsIds: string[] = [];
    for (let staff of staffs) {
        let isArray = false;
        if (staff.data.employment_table && staff.data.employment_table.length > 1) {
            isArray = true;
            const staffOrgsIds = staff.data.employment_table.map(row => row.organization.id);
            const staffOrgs = allOrgs.filter(org => staffOrgsIds.indexOf(org.id) != -1 && org.data.access_settings_organization);
            accessSettingsIds = staffOrgs.map(org => org.data.access_settings_organization!.id);
        }
        let org = allOrgs.find(o => o.id === staff.data.organization?.id);
        //условие на работающих только по совместительству
        if (!org) {
            if (staff.data.employment_table && staff.data.employment_table.length > 0) {
                const staffOrgsIds = staff.data.employment_table.map(row => row.organization.id);
                if (staffOrgsIds && staffOrgsIds.length > 0) {
                    org = allOrgs.find(o => o.id === staffOrgsIds[0]);
                }
            }
        };
        if (!org) {
            Context.data.debug += ` no org `;
            continue;
        }
        const orgRights = allOrgRights.find(right => right.id === org!.data.access_settings_organization?.id);
        if (!orgRights) {
            Context.data.debug += ` no orgRights `;
            continue;
        };
        const rightsField = orgRights.data.staff;
        if (!rightsField || rightsField.length < 1) {
            Context.data.debug += ` no rightsField `;
            continue;
        };
        staffMeta.push({
            staffId: staff.id,
            orgRightsIds: isArray ? accessSettingsIds : orgRights.id,
            isArray
        });
    };
    //Context.data.debug = JSON.stringify(staffMeta)
    let chunks: staffData[][] = [];
    for (let i = 0; i < staffMeta.length; i += chunkSize) {
        const chunk = staffMeta.slice(i, i = chunkSize);
        chunks.push(chunk)
    };
    Context.data.max_iteration = chunks.length;
    Context.data.chunks = chunks;
    if (chunks.length == 0) {
        Context.data.debug += ` no new staff `;
        Context.data.new_staff_exists = false;
    };

    //} catch (e) {
    //    Context.data.debug += ` ${e.message} `;
    //}
}

async function set_access_groups(): Promise<void> {
    // Получаем созданных сотрудников.
    const staffs = await Context.fields.created_staffs.fetchAll();
    // Получаем права доступа по организациям.
    const access_groups = await Namespace.app.access_settings_organization.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
    )).size(1000).all();
    const userGroups = await System.userGroups.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const chunk: staffData[] = Context.data.chunks[Context.data.iteration!];

    const promises: Promise<void>[] = [];

    for (const item of chunk) {
        try {
            const staff = staffs.find(s => s.id === item.staffId)!;
            let accessRoles: Role[] = []
            if (item.isArray) {
                accessRoles = access_groups.filter(gr => item.orgRightsIds.indexOf(gr.id) !== -1).map(access => {
                    const userGroup = userGroups.find(group => group.id === access.data.staff![0].code);
                    return new MyRole(userGroup!, "group", userGroup!.id) as Role;
                });
            } else {
                const access_group = access_groups.find(gr => gr.id === item.orgRightsIds)!;
                const roleGroup = userGroups.find(f => f.data.__id == access_group.data.staff![0].code);
                const newRole = new MyRole(roleGroup!, "group", roleGroup!.id) as Role;
                accessRoles.push(newRole);

            }

            Context.data.debug += ` добавили группы ${accessRoles.length} `;
            staff.data.access_group = accessRoles;

            promises.push(staff.save());
        } catch (e) {
            Context.data.error_stack += ` Не смогли добавить группы поступа ${e.message} `
        }
    };

    await Promise.all(promises);
    if (Context.data.iteration === Context.data.max_iteration! - 1) {
        Context.data.all_staff_processed = true;
    } else {
        Context.data.iteration!++;
    }
};

//заполняем переменные для 
async function fillVarsForFixedterm(): Promise<void> {
    //если данных нет, то двигаемся дальше
    if (!Context.data.fixedterm_data) {
        Context.data.loop_end = true;
        return;
    }

    //парсим данные
    const data: IFixedTermData[] = JSON.parse(Context.data.fixedterm_data);

    Context.data.iterator!++;

    //делаем паузу каждые loopSize итераций
    if (Context.data.iterator! % loopSize === 0 && Context.data.iterator! !== 0) {
        Context.data.is_pause = true;
    } else {
        Context.data.is_pause = false;
    }

    if (Context.data.iterator! >= data.length) {
        Context.data.loop_end = true;
        return;
    }

    //заполняем переменные
    let endDate = new Datetime(data[Context.data.iterator!].endDate);
    let prevPosDate = new Datetime(data[Context.data.iterator!].prevPositionDate);

    const employee = await Namespace.app.staff.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.individual_id_1c.eq(data[Context.data.iterator!].employeeIndividualId)
    )).first();

    const position = await Namespace.app.position.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ref_key.eq(data[Context.data.iterator!].prevPositionId)
    )).first();

    Context.data.current_employee = employee;
    Context.data.end_transfer_date = new TDate(endDate.year, endDate.month, endDate.day);
    Context.data.employee_id = data[Context.data.iterator!].employeeId;
    Context.data.prev_position = position;
    Context.data.prev_position_date = new TDate(prevPosDate.year, prevPosDate.month, prevPosDate.day);
    Context.data.is_main_worktype = data[Context.data.iterator!].isMainWorktype;
}

async function fillPositionTransitions(): Promise<void> {

    if (!Context.data.data_for_update_positions) {
        Context.data.debug += ` ${!Context.data.data_for_update_positions} `;
        Context.data.loop_end = true;
        return;
    }
    Context.data.iterator!++;
    let updatedTransferData: IUpdatedTransferData[] = JSON.parse(Context.data.data_for_update_positions);
    Context.data.max_iteration = updatedTransferData.length;
    Context.data.debug += ` updatedTransferData.length ${updatedTransferData.length} `

    if (Context.data.iterator! >= Context.data.max_iteration!) {
        Context.data.loop_end = true;
        return;
    }

    //делаем паузу каждые loopSize итераций
    if (Context.data.iterator! % loopSize === 0 && Context.data.iterator! !== 0) {
        Context.data.is_pause = true;
    } else {
        Context.data.is_pause = false;
    }

    let employee = await Namespace.app.staff.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.individual_id_1c.eq(updatedTransferData[Context.data.iterator!].employeeIndividualId)
    )).first();
    let pos = await Namespace.app.position.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ref_key.eq(updatedTransferData[Context.data.iterator!].newPositionId)
    )).first();
    let empDir = await Namespace.app.employment_directory.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(updatedTransferData[Context.data.iterator!].employmentDirectoryId as string)
    )).first();

    Context.data.current_employee = employee;
    Context.data.new_position = pos;
    Context.data.employment_directory = empDir;

    Context.data.is_temporary = updatedTransferData[Context.data.iterator!].isTemporaryTransfer;
    Context.data.end_transfer_date = undefined;
    if (updatedTransferData[Context.data.iterator!].hasOwnProperty("endTransferDate")) {
        let datetime = new Datetime(updatedTransferData[Context.data.iterator!].endTransferDate as string);
        Context.data.end_transfer_date = new TDate(datetime.year, datetime.month, datetime.day);
    }
}

//очистка переменных для следующего цикла
async function clearVars(): Promise<void> {
    Context.data.loop_end = false;
    Context.data.current_employee = undefined;
    Context.data.firing_date = undefined;
    Context.data.is_pause = false;
    Context.data.iterator = -1;
    Context.data.end_transfer_date = undefined;

    // const setting = await Namespace.app.settings.search().where((f, g) => g.and(
    //     f.__deletedAt.eq(null),
    //     f.code.eq('send_notification_about_the_ending_of_personnel_transfer')
    // )).first();

    // let notify = false;

    // if (setting && setting.data.status) {
    //     notify = setting.data.status;
    // }

    // if (notify === false) {
    //     Context.data.fixedterm_data = JSON.stringify([]);
    // }
}

///////////////////////////////////////////////////////////////////////////////helpers

//задача 1261
function formatPhoneNumber(phoneNumber: string, plus: boolean = true): string {

    const startsWith = plus ? '+7' : '8';
    let phone = phoneNumber.replace(/[^0-9]/g, '');
    if (phone.startsWith('7') && plus) {
        phone = phone.substring(1);
    }
    if (phone.startsWith('8')) {
        phone = phone.substring(1);
    }

    return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/g, `${startsWith}$1$2$3$4`);
}
