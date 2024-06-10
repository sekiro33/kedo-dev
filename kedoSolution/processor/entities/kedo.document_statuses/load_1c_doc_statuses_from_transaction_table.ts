/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function loadStatuses(): Promise<void> {
    const statusData = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("Catalog_EM_СтатусыELMA")
        )).first()
    
    if (!!statusData) {
        const existsingStatuses = await Namespace.app.document_statuses.search()
            .where(f => f.__deletedAt.eq(null)).size(10000).all()
        const parsedStatusData = JSON.parse(statusData.data.table_data!).map((item: any) => {
            return item.data
        })
        const promises : Promise<any>[] = []
        for(let i = 0; i < parsedStatusData.length; i++) {
            let app = existsingStatuses.find(item => item.data.guid === parsedStatusData[i]["Ref"])
            if (!app) {
                app = Namespace.app.document_statuses.create()
            }

            app.data.__name = parsedStatusData[i]["Description"]
            app.data.full_name = parsedStatusData[i]["ИмяДляРазработчика"]
            app.data.guid = parsedStatusData[i]["Ref"]
            app.data.is_blocking = !!parsedStatusData[i]["БлокироватьДокумент"]
            promises.push(app.save())
        }
        await Promise.all(promises)
    }
}
