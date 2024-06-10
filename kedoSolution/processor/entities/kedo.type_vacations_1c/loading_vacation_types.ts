/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function loadTypes(): Promise<void> {
    const vacationsTypes = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("Catalog_ВидыОтпусков")
        )).where((f, g) => g.or(
            f.is_processed.eq(null),
            f.is_processed.eq(false),
        ))
        .size(10000).all()

    if (vacationsTypes.length === 0) {
        return;
    }
    const sortedApps = vacationsTypes.sort((a, b) => {
      const aDate: any = a.data.__createdAt.asDate()
      const bDate: any = b.data.__createdAt.asDate()
      return bDate - aDate
    })

    const latestData = sortedApps[0]
    const typeApps = await Namespace.app.type_vacations_1c.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    const typeData = JSON.parse(latestData.data.table_data!)
    let promises: Promise<void>[] = []
    for (let i = 0; i < typeData.length; i++) {
        const currentType = typeData[i].data
        const existingApp = typeApps.find(item => item.data.guid === currentType["Ref"])
        if (!!existingApp) continue;
        const newApp = Namespace.app.type_vacations_1c.create()
        newApp.data.__name = currentType["Description"]
        newApp.data.guid = currentType["Ref"]
        promises.push(newApp.save())

        if (promises.length > 50) {
            await Promise.all(promises)
            promises = []
        }
    }

    await Promise.all(promises)

    promises = []

    for (let app of vacationsTypes) {
        app.data.is_processed = true
        promises.push(app.save())
        if (promises.length >= 30) {
            await Promise.all(promises)
            promises = []
        }
    }
    await Promise.all(promises)
}
