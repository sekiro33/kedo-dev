/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

const iterationBatch = 100;

async function fillEmployeesData(): Promise<void> {
    Context.data.request_url = "AccumulationRegister_ДниЧасыОтгулов?$format=json&$skip=999999&$inlinecount=allpages";
}

async function fillIterData(): Promise<void> {
    const response = JSON.parse(Context.data.response!);
    const count = parseInt(response["odata.count"]);
    Context.data.amount_of_data = count;
    Context.data.current_iteration = 0;
    Context.data.full_iteration_amount = Math.ceil(count / iterationBatch) - 1;
    Context.data.work_leave_data = JSON.stringify([])
}

async function parseConnectionsObject(): Promise<void> {
    const connectionsArray = Context.data.connections_object ? JSON.parse(Context.data.connections_object) : []

    if (connectionsArray.length === 0) return;

    Context.data.total_number_of_connections = connectionsArray.length
}

async function getRequestData(): Promise<void> {
    const startSkip = Context.data.current_iteration! * iterationBatch;
    Context.data.request_url = `AccumulationRegister_ДниЧасыОтгулов?$format=json&$skip=${startSkip}&$top=${iterationBatch}`;
}

async function updateIterationData(): Promise<void> {
    Context.data.current_iteration = Context.data.current_iteration! + 1
}

async function writeNoConnectionsError(): Promise<void> {
    Context.data.error = "Нет доступных подключений 1С"
}

async function startConnectionsIteration(): Promise<void> {
    const connectionsArray = Context.data.connections_object ? JSON.parse(Context.data.connections_object) : []
    if (!Context.data.current_connection_index) {
        Context.data.current_connection_index = 0;
    }

    Context.data.current_connection_name = connectionsArray[Context.data.current_connection_index].name
}

async function endIteration(): Promise<void> {
    Context.data.current_connection_index = Context.data.current_connection_index! + 1

    if (Context.data.current_connection_index >= Context.data.current_connection_index!) {
        Context.data.end_iteration = true
    }
}


async function parseResponseData(): Promise<void> {
    const response = JSON.parse(Context.data.response!)
    const workLeaves = JSON.parse(Context.data.work_leave_data!)

    for(let i = 0; i < response.value.length; i++) {
        const currentInstance = response.value[i]
        for(let j = 0; j < currentInstance["RecordSet"].length; j++) {
            const employee = workLeaves.find((item: any) => item.employeeId === currentInstance["RecordSet"][j]["Сотрудник_Key"])
            if (!!employee) {
                employee.amount += currentInstance["RecordSet"][j]["Дни"]
                continue;
            }

            workLeaves.push({
                employeeId: currentInstance["RecordSet"][j]["Сотрудник_Key"],
                amount: currentInstance["RecordSet"][j]["Дни"]
            })
        }
    }

    Context.data.work_leave_data = JSON.stringify(workLeaves)
}

async function updateLeavesData(): Promise<void> {
    const workLeaves = JSON.parse(Context.data.work_leave_data!)
    const employees = await Context.fields.staff.app.search().where(f => 
        f.__deletedAt.eq(null)
    ).all()

    for(let i = 0; i < workLeaves.length; i++) {
        const employee = employees.find((item: any) => {
            return item.data.id_1c === workLeaves[i].employeeId
        })

        if (!!employee) {
            employee.data.remaining_work_leave_days = workLeaves[i].amount
            await employee.save()
        }
    }
}
async function getParams(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const alternative_integration = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.is_alternative = alternative_integration ? alternative_integration.data.status : false;
}
