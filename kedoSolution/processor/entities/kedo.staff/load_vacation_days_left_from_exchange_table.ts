/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface VacationData {
    employeeId: string;
    individualEmployeeId: string;
    amount: number;
    vacType: string;
}

let batchSize = 5;

async function loadDaysLeftData(): Promise<void> {   
    
    const vacationsData = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("InformationRegister_EM_ОстаткиОтпусков")
        )).where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .size(batchSize).all()

    Context.data.continue = true;
    if (!vacationsData || (vacationsData && vacationsData.length === 0)) {
        Context.data.continue = false;
        Context.data.debug += ` Закончили цикл `;
        return;
    }

    const vacationsType = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("Catalog_ВидыОтпусков")
        )).first()

    const sortedApps = vacationsData.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return bDate - aDate
    })

    const baseArray: any[] = []
    const latestData = baseArray.concat(...(sortedApps.filter(item => !!item.data.table_data).map(item => JSON.parse(item.data.table_data!))));
    Context.data.debug += ` latest data ${latestData.length}`
    if (!!latestData && !!vacationsType) {
        const types = JSON.parse(vacationsType.data.table_data!)
        const parsedVacationsData = latestData.map((item: any) => {
            return item.data["Record"]
        })
        //Context.data.days_left_data = JSON.stringify(parsedVacationsData)
        //Context.data.vacations_type = JSON.stringify(types)
        await parseData(parsedVacationsData);
    } else {
        Context.data.days_left_data = JSON.stringify([])
        Context.data.debug += ` Не загружены данные о типах отпусков или нет данных об остатках отпусков `;
    }
}

async function parseData(data: any[]): Promise<void> {
    //const data = JSON.parse(Context.data.days_left_data!)
    const vacations: VacationData[] = []

    if (!data) {
        return;
    }

    Context.data.debug += ' data length ' + data.length;

    //задача 1331
    //создали переменную для поддержки старого алгоритма. В новом алгоритме берём данные из поля ФизЛицо
    let loadPositions = false;
    if (data && data[0] && data[0][0] && data[0][0].hasOwnProperty("ФизЛицо")) {
        loadPositions = true;
    }

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            const employeeData = data[i][j]

            const employee = vacations.find((item: VacationData) => item.employeeId === employeeData["Сотрудник"] && item.vacType === employeeData["ТипОтпуска"])
            if (!employee) {

                if (!loadPositions) {
                    vacations.push({
                        employeeId: employeeData["Сотрудник"],
                        individualEmployeeId: "",
                        amount: parseFloat(employeeData["ОстатокДней"]),
                        vacType: employeeData["ТипОтпуска"],
                    })
                } else {
                    vacations.push({
                        employeeId: employeeData["Сотрудник"],
                        individualEmployeeId: employeeData["ФизЛицо"],
                        amount: parseFloat(employeeData["ОстатокДней"]),
                        vacType: employeeData["ТипОтпуска"],
                    })
                }
            }
        }
    }

    //Context.data.vacation_data = JSON.stringify(vacations)
    await updateVacationData(vacations, data);
}


async function updateVacationData(vacations_data: any[], days_left_data: any[]): Promise<void> {

    const vacationsLeftovers = await Namespace.app.vacation_leftovers.search()
        .where(f => f.__deletedAt.eq(null)).size(10000).all()
    //const vacations: VacationData[] = JSON.parse(Context.data.vacation_data!)
    const vacations: VacationData[] = vacations_data; 
    if (vacations.length === 0) {
        return
    }

    //задача 1331
    //так же заполняем переменную, по которой понимаем, берём данные из поля Сотрудник или ФизЛицо
    let loadPositions = false;
    if (vacations && vacations[0].individualEmployeeId != "") {
        loadPositions = true;
    }

    let promises: Promise<void>[] = []
    let employees: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>[];

    if (!loadPositions) {
        const employeesIds = vacations.map((item: VacationData) => item.employeeId)

        employees = await Namespace.app.staff.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.id_1c.in(employeesIds)
        )).size(10000).all();

        for (let i = 0; i < employees.length; i++) {
            const currentEmployee = employees[i]
            const employeeVacations = vacations.filter((item: VacationData) => {
                return item.employeeId === currentEmployee.data.id_1c
            })
            const totalAmount = employeeVacations.reduce((acc: number, value: VacationData) => acc + value.amount, 0)
            currentEmployee.data.remaining_vacation_days = Math.ceil(totalAmount);
            promises.push(currentEmployee.save())
            if (promises.length >= 20) {
                await Promise.all(promises)
                promises = []
            }
        }
    } else {
        const employeesIds = vacations.map((item: VacationData) => item.individualEmployeeId)

        employees = await Namespace.app.staff.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.individual_id_1c.in(employeesIds)
        )).size(10000).all();

        for (let i = 0; i < employees.length; i++) {
            const currentEmployee = employees[i]
            const employeeVacations = vacations.filter((item: VacationData) => {
                return item.individualEmployeeId === currentEmployee.data.individual_id_1c && item.employeeId === currentEmployee.data.id_1c
            })
            const totalAmount = employeeVacations.reduce((acc: number, value: VacationData) => acc + Math.round(value.amount), 0)
            currentEmployee.data.remaining_vacation_days = Math.ceil(totalAmount);
            promises.push(currentEmployee.save())
            if (promises.length >= 20) {
                await Promise.all(promises)
                promises = []
            }
        }
    }
    await Promise.all(promises)
    promises = []

    //const data = JSON.parse(Context.data.days_left_data!)
    const data = days_left_data;
    const vacationTypes = await Namespace.app.type_vacations_1c.search()
        .where(f => f.__deletedAt.eq(null)).size(10000).all()

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            const employeeData = data[i][j]
            const employee = employees.find((item) => {
                if (!loadPositions) {
                    return item.data.id_1c === employeeData["Сотрудник"]
                } else {
                    return item.data.individual_id_1c === employeeData["ФизЛицо"]
                }
            })
            if (!!employee) {
                employee.data.vacation_leftovers = []
                if (employee.data.employment_table && employee.data.employment_table.length > 0) {
                    employee.data.employment_table.forEach(item => {
                        item.remaining_vacations = []
                    })
                }
                promises.push(employee.save())
                if (promises.length >= 20) {
                    await Promise.all(promises)
                    promises = []
                }
            }
        }
    }
    await Promise.all(promises)
    promises = []

    const employeeIds: string[] = []
    for (let i = 0; i < vacations.length; i++) {

        //Context.data.debug += ' index ' + i + ' ';

        const employeeData = vacations[i]

        const vacationType = vacationTypes.find(item => item.data.guid === employeeData.vacType)

        let employee: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params> | undefined;

        if (!loadPositions) {
            employee = employees.find((item) => {
                if (item.data.id_1c === employeeData.employeeId) {
                    return true
                } else {
                    if (!item.data.employment_table || item.data.employment_table.length === 0)
                        return false

                    const existsInEmploymentTable = item.data.employment_table.find(row => row.id_1c === employeeData.employeeId)
                    return !!existsInEmploymentTable
                }
            })
        } else {
            employee = employees.find((item) => {
                if (item.data.individual_id_1c === employeeData.individualEmployeeId) {
                    return true
                }
            })
        }

        let position: ApplicationItemRef<Application$kedo$position$Data, Application$kedo$position$Params> | undefined = undefined;
        let workplace: string = "";
        if (loadPositions && !!employee) {
            const row = employee.data.employment_table!.find(elem => elem.id_1c === employeeData.employeeId);
            if (row) {
                position = row.position;
                //workplace = row.type_employment.name;
                //Context.data.debug += ' found position '
            }
        }

        let appfind: ApplicationItem<Application$kedo$vacation_leftovers$Data, Application$kedo$vacation_leftovers$Params> | undefined;

        appfind = vacationsLeftovers.find(item => item.data.guid_type_vacation === employeeData.vacType && item.data.guid_staff === employeeData.employeeId && !item.data.__deletedAt);

        if (!appfind) {
            appfind = Namespace.app.vacation_leftovers.create()
        }

        if (!!employee) {

            if (!!vacationType) {
                appfind.data.vacation_type_app = vacationType
                appfind.data.vacation_name = vacationType.data.__name
                appfind.data.__name = `${employee.data.__name} - ${vacationType.data.__name}`
            }
            appfind.data.guid_staff = employeeData.employeeId
            employeeIds.push(employeeData.employeeId)
            appfind.data.guid_type_vacation = employeeData.vacType
            appfind.data.staff = employee
            appfind.data.remainder = Math.ceil(employeeData.amount)

            if (loadPositions) {
                appfind.data.position = position;
                //appfind.data.type_employment = workplace;
            }

            promises.push(appfind.save())
            if (promises.length >= 50) {
                await Promise.all(promises)
                promises = []
            }
        }
    }
    await Promise.all(promises);
    Context.data.employee_ids = JSON.stringify(employeeIds);
}

async function saveEmployee(employee: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>): Promise<void> {
    try {
        employee.save();
    } catch (e) {
        Context.data.debug += String(e);
    }
}

async function linkVacations(): Promise<void> {
    if (!Context.data.employee_ids) return;
    const employeeIds = JSON.parse(Context.data.employee_ids)
    const employees = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.id_1c.in(employeeIds)
    )).size(10000).all()
    const vacations = await Namespace.app.vacation_leftovers.search().where((f, g) => g.and(
        f.__deletedAt.eq(null)
    )).size(10000).all()
    let promises: Promise<void>[] = []
    for (let i = 0; i < employees.length; i++) {
        const currentEmployee = employees[i]
        const mainId = currentEmployee.data.id_1c
        const additIds: string[] = []
        if (currentEmployee.data.employment_table) {
            for (let j = 0; j < currentEmployee.data.employment_table.length; j++) {
                additIds.push(currentEmployee.data.employment_table[j].id_1c)
            }
        }

        const employeeVacations = vacations.filter(item => item.data.guid_staff === mainId || !!(additIds.find((id: string) => item.data.guid_staff === id)))
        employeeVacations.forEach(item => {
            if (item.data.guid_staff === mainId) {
                currentEmployee.data.vacation_leftovers!.push(item)
            }

            if (!currentEmployee.data.employment_table || currentEmployee.data.employment_table.length === 0) {
                return
            }

            const currentEmployeeRow = currentEmployee.data.employment_table.find(row => row.id_1c === item.data.guid_staff)
            if (!currentEmployeeRow) {
                return
            }
            currentEmployeeRow.remaining_vacations.push(item)
        })
        promises.push(saveEmployee(currentEmployee))
        if (promises.length >= 50) {
            await Promise.all(promises)
            promises = []
        }
    }
    await Promise.all(promises)
}

async function markDataAsProcessed(): Promise<void> {
    const vacationsData = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("InformationRegister_EM_ОстаткиОтпусков")
        )).where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .size(batchSize).all()

    let promises: Promise<void>[] = []
    for (let table of vacationsData) {
        table.data.is_processed = true
        promises.push(table.save())
        if (promises.length >= 20) {
            await Promise.all(promises)
            promises = []
        }
    }
    await Promise.all(promises)
}

async function fillTheRest(): Promise<void> {

    try {

        const vacation_leftovers = await Namespace.app.vacation_leftovers.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
        let promises: Promise<void>[] = [];

        for (let vl of vacation_leftovers) {
            if (!vl.data.staff || !vl.data.position || !vl.data.type_employment) {
                const employee = await Namespace.app.staff.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.id_1c.eq(vl.data.guid_staff!))).size(10000).first();

                if (employee) {
                    vl.data.staff = employee;
                    vl.data.position = employee.data.position;
                    vl.data.type_employment = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.main_workplace.name;
                    promises.push(vl.save());
                    if (promises.length >= 20) {
                        await Promise.all(promises);
                        promises = [];
                    }
                }
            }
        }
        await Promise.all(promises);

    } catch (e) {
        Context.data.debug += ` Error while saving the vacation leftovers `;
    }
}
