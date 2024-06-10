/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface WorkLeave {
    employeeId: string;
    daysAmount: number;
    hoursAmount: number
}

async function loadData(): Promise<void> {
    const tables = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("AccumulationRegister_ДниЧасыОтгулов"),
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

    const externalData = parseData(sortedApps, "AccumulationRegister_ДниЧасыОтгулов") 

    await updatePaidLeaveData(externalData)

    let promises: Promise<void>[] = []
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

const parseData = (data: any[], tableName: string): any[] => {
    const result: any[] = []
    data.forEach(item => {
        if (item.data.table_name === tableName && !!item.data.table_data) {
            result.push(...JSON.parse(item.data.table_data!))
        }
    })
    return result
}

async function updatePaidLeaveData(data: any) {
    const employeeIds = data.map((item: any) => item.data["Record"][0]["Сотрудник"])
    if(employeeIds.length == 0) {
        return;
    }

    const allEmployees = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.id_1c.in(employeeIds)
    )).size(10000).all()

    const workLeaves: WorkLeave[] = []
    for (let i = 0; i < data.length; i++) {
        const employee = workLeaves.find((item: any) => item.employeeId === data[i].data["Record"][0]["Сотрудник"])
        if (!!employee) {
            employee.daysAmount += data[i].data["Record"][0]["Дни"]
            employee.hoursAmount += data[i].data["Record"][0]["Часы"]
            continue;
        }

         workLeaves.push({
            employeeId: data[i].data["Record"][0]["Сотрудник"],
            daysAmount: data[i].data["Record"][0]["Дни"],
            hoursAmount: data[i].data["Record"][0]["Часы"]
        })
    }
    let promises: Promise<void>[] = []  
    for (let i = 0; i < allEmployees.length; i++) {
        const currentEmployee = allEmployees[i]
        let shouldSave = false
        const mainEmployeeData = workLeaves.find((item: WorkLeave) => item.employeeId === currentEmployee.data.id_1c)
        if (!!mainEmployeeData) {
            currentEmployee.data.remaining_work_leave_days = mainEmployeeData.daysAmount
            currentEmployee.data.remaining_work_leave_hours = mainEmployeeData.hoursAmount
            shouldSave = true
        }
        if (currentEmployee.data.employment_table && currentEmployee.data.employment_table.length > 0) {
            for (let j = 0; j < currentEmployee.data.employment_table.length; j++) {
                const row = currentEmployee.data.employment_table[j]
                const rowLeaveData = workLeaves.find((item: WorkLeave) => item.employeeId === row.id_1c)
                if (rowLeaveData) {
                    row.remaining_leave_days = rowLeaveData.daysAmount
                    row.remaining_leave_hours = rowLeaveData.hoursAmount
                    shouldSave = true
                }
            }
        }

        if (shouldSave) {
            promises.push(currentEmployee.save())
            if (promises.length > 50) {
                await Promise.all(promises)
                promises = []
            }
        }
    }


    await Promise.all(promises)

    // for(let i = 0; i < workLeaves.length; i++) {
    //     const employee = allEmployees.find((item: any) => {
    //         return item.data.id_1c === workLeaves[i].employeeId
    //     })

    //     if (!!employee) {
    //         employee.data.remaining_work_leave_days = workLeaves[i].daysAmount
    //         employee.data.remaining_work_leave_hours = workLeaves[i].hoursAmount
    //         await employee.save()
    //     }
    // }
}
