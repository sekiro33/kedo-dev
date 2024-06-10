/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
const iterationBatch: number = 50

async function fillContext(): Promise<void> {
    Context.data.iteration_number = typeof Context.data.iteration_number === 'number' ? Context.data.iteration_number + 1 : 0;
    const startSkip = iterationBatch * Context.data.iteration_number
    Context.data.url_positions = `InformationRegister_ЗанятостьПозицийШтатногоРасписания?$format=json&$skip=${startSkip}&$top=${iterationBatch}`
}

async function fillCurrentPositionsInfo(): Promise<void> {
    const positions = Context.data.response ? JSON.parse(Context.data.response) : undefined
    const employees = await Namespace.app.staff.search().all();
    const positionApps: any = {}
    if(!positions) return;
    if (positions.value.length < iterationBatch) {
        Context.data.end_iteration = true;
    }

    for(let i = 0; i < positions.value.length; i++) {
        let employeePosition = positions.value[i];
        const employeeApp = employees.find((item: any) => {
            return item.data.id_1c === employeePosition.RecordSet[employeePosition.RecordSet.length - 1]["Сотрудник_Key"]
        })
        Context.data.error += ` found user ${!!employeeApp}`
        if(!!employeeApp) {
            //find position
            let pos = positionApps[employeePosition.RecordSet[employeePosition.RecordSet.length - 1]["ПозицияШтатногоРасписания_Key"]];
            let subdivision: any;

            if (!pos) {
                pos = await Namespace.app.position.search().where((f: any) => f.ref_key.eq(employeePosition.RecordSet[employeePosition.RecordSet.length - 1]["ПозицияШтатногоРасписания_Key"])).first();

                if (!!pos) {
                    positionApps[employeePosition.RecordSet[employeePosition.RecordSet.length - 1]["ПозицияШтатногоРасписания_Key"]] = pos;
                }
            }

            subdivision = pos ? pos.data.subdivision : undefined

            employeeApp.data.position = pos;
            employeeApp.data.structural_subdivision = subdivision;
            await employeeApp.save()
        }

    }
}
