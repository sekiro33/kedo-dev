/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
const iterationBatch = 100;

async function fillEmployeesData(): Promise<void> {
    Context.data.request_url = "InformationRegister_EM_ОстаткиОтпусков?$format=json&$skip=999999&$inlinecount=allpages";
}

async function fillIterData(): Promise<void> {
    const response = JSON.parse(Context.data.response!);
    const count = parseInt(response["odata.count"]);
    Context.data.amount_of_data = count;
    Context.data.current_iteration = 0;
    Context.data.full_iteration_amount = Math.ceil(count / iterationBatch) - 1;
    Context.data.vacations_data = JSON.stringify([])
}

async function getRequestData(): Promise<void> {
    const startSkip = Context.data.current_iteration! * iterationBatch;
    Context.data.request_url = `InformationRegister_EM_ОстаткиОтпусков?$format=json&$skip=${startSkip}&$top=${iterationBatch}`;
}

async function parseData(): Promise<void> {
    const response = JSON.parse(Context.data.response!)
    const vacations = JSON.parse(Context.data.vacations_data!)

    for(let i = 0; i < response.value.length; i++) {

        const employee = vacations.find((item: any) => item.employeeId === response.value[i]["Сотрудник_Key"])
        if(!!employee) {
            employee.amount += response.value[i]["ОстатокДней"]
        } else {
            vacations.push({
                employeeId: response.value[i]["Сотрудник_Key"],
                amount: response.value[i]["ОстатокДней"]
            })
        }
    }

    Context.data.vacations_data = JSON.stringify(vacations)
}

async function updateIterationData(): Promise<void> {
    Context.data.current_iteration = Context.data.current_iteration! + 1
}

async function updateVacationData(): Promise<void> {
    const vacations = JSON.parse(Context.data.vacations_data!)
    const employees = await Namespace.app.staff.search().where((f, g) => 
        f.__deletedAt.eq(null)
    ).all();
    for(let i = 0; i < vacations.length; i++) {
        const employee = employees.find((item: any) => {
            return item.data.id_1c === vacations[i].employeeId
        })

        if (!!employee) {
            employee.data.remaining_vacation_days = Math.ceil(vacations[i].amount);
            await employee.save()
        }
    }
}

async function get_kedo_settings(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const integration_1c = settings.find(f => f.data.code == 'integration_1c');
    Context.data.integration_is_on = integration_1c ? integration_1c.data.status : false;

    const use_alternative_integration = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.is_alternative = use_alternative_integration ? use_alternative_integration.data.status : false;
}
