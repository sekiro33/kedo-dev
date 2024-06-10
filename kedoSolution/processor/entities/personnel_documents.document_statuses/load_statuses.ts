/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function fillRequestData(): Promise<void> {
    Context.data.url = "Catalog_EM_СтатусыELMA?$format=json";
}


async function updateStatusData(): Promise<void> {
    const response = JSON.parse(Context.data.response!);

    const prevStatuses = await Context.fields.document_statuses.fetchAll();
    const deletePromises: any[] = [];
    prevStatuses.forEach(async (status:any) => deletePromises.push(status.delete()));

    const savePromises: any[] = []
    response.value.forEach((status: any) => {
        const newApp = Context.fields.document_statuses.app.create();
        newApp.data.__name = status["Description"];
        newApp.data.full_name = status["ИмяДляРазработчика"];
        newApp.data.is_blocking = status["БлокироватьДокумент"];
        newApp.data.guid = status["Ref_Key"]
        savePromises.push(newApp.save())
    })

    await Promise.all([...savePromises, ...deletePromises])
}
