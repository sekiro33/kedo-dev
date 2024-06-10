/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function loadPositionsAndSubdividions(): Promise<void> {
    const allDivisions = await Namespace.app.structural_subdivision.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allPositions = await Namespace.app.position.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const searchData = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("Catalog_ШтатноеРасписание")
        ))
        .first()
    let data1C: any[] = []
    if (!!searchData) {
        data1C = JSON.parse(searchData.data.table_data!).map((item:any) => item.data)
    }
    try {
        let promises: Promise<void>[] = [];
        for (let i = 0; i < data1C.length; i++) {
            const data = data1C[i]         
            if (data['Должность'] !== "00000000-0000-0000-0000-000000000000") {
                let app: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params> | undefined;
                app = allPositions.find(f => f.data.ref_key === data["Ref"]);
                if (!app)
                    app = Namespace.app.position.create();
                app.data.__name = data["Description"];
                app.data.ref_key = data["Ref"];
                app.data.owner_key = data["Owner"]["data"];
                app.data.parent_key = data["Parent"];
                app.data.position_key = data["Должность"];
                const salaryValue = data["ОкладТариф"];
                app.data.salary = new Money(salaryValue, 'RUB');
                const date = data["ДатаУтверждения"].split('T')[0].split('-');
                const year = date[0];
                const month = date[1];
                const day = date[2];
                app.data.approval_date = new TDate(year, month, day);
                app.data.quantity = Number(data["КоличествоСтавок"]);
                promises.push(app.save())
            } else {
                Context.data.debug += `${data["Description"]} ${data["Ref"]} ${data["Подразделение"]} ${data["Owner"]["data"]} ${data["Parent"]} ${data["Должность"]}`
                let app: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params> | undefined;
                app = allDivisions.find(f => f.data.ref_key === data["Ref"]);
                if (!app)
                    app = Namespace.app.structural_subdivision.create();
                app.data.__name = data["Description"];
                app.data.ref_key = data["Ref"];
                app.data.subdiv_key = data["Подразделение"];
                app.data.owner_key = data["Owner"]["data"];
                app.data.parent_key = data["Parent"];
                app.data.position_key = data["Должность"];
                await app.save()
            }
        }
        Context.data.debug += `done length ${data1C.length}`
        await Promise.all(promises);
    } catch (e: any) {
        Context.data.debug += `An error occured: name ${e.name}, message ${e.message}`
    }
}

async function loadOrgs(): Promise<void> {
    const searchData = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("Catalog_Организации")
        ))
        .first()

    let data1C: any[] = []
    if (!!searchData) {
        data1C = JSON.parse(searchData.data.table_data!).map((item: any) => item.data)
    }
    for(let i = 0; i < data1C.length; i++) {
        let appEntity: ApplicationItem<Application$_system_catalogs$_my_companies$Data, Application$_system_catalogs$_my_companies$Params> | undefined;
        let appOrganization: ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params> | undefined;
        const ownerData = data1C[i]
        appOrganization = await Namespace.app.organization.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ref_key.eq(ownerData.Ref)
            ))
            .first()
        if (appOrganization && appOrganization.data.entity) {
            appEntity = await appOrganization.data.entity.fetch();
        } else {
            appOrganization = Namespace.app.organization.create();
        }
        if (!appEntity) {
            appEntity = await Context.fields.app_legal_entity.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.__name.eq(ownerData["Description"])
                ))
                .first()
        }
        if (!appEntity) {
            appEntity = Context.fields.app_legal_entity.app.create();
        }
        if (appEntity) {
            appEntity.data.__name = ownerData["Description"];
            appEntity.data._full_legal_name = ownerData["НаименованиеПолное"];
            appEntity.data._inn = ownerData["ИНН"];
            appEntity.data._ogrn = ownerData["ОГРН"];
            await appEntity.save();
        }
        appOrganization.data.entity = appEntity;
        appOrganization.data.ref_key = ownerData.Ref;
        appOrganization.data.owner_key = '';
        appOrganization.data.parent_key = '';
        appOrganization.data.position_key = '';
        await appOrganization.save();
    }
}

async function fillAppsLinks(): Promise<void> {
    // получаем данные по данной базе 1С
    const allOrganizations = await Namespace.app.organization.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .size(10000)
        .all();
    const allSubdivisions = await Namespace.app.structural_subdivision.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .size(10000)
        .all();
    const allPositions = await Namespace.app.position.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .size(10000)
        .all();
    // проходимся по каждой организации и записываем её в элементы
    let promises: Promise<void>[] = [];
    for (const organiaztion of allOrganizations) {
        const subdivisions = allSubdivisions.filter(f => f.data.owner_key === organiaztion.data.ref_key);
        const positions = allPositions.filter(f => f.data.owner_key === organiaztion.data.ref_key);
        for (const subdivision of subdivisions) {
            subdivision.data.organization = organiaztion;
            promises.push(subdivision.save())
        }
        for (const position of positions) {
            position.data.organization = organiaztion;
            promises.push(position.save())
        }
    }
    await Promise.all(promises);
    promises = [];
    // проходимся по каждому подразделению и записываем его в элементы
    for (const subdivisionParent of allSubdivisions) {
        const subdivisionsChild = allSubdivisions.filter(f => f.data.parent_key === subdivisionParent.data.ref_key);
        const positionsChild = allPositions.filter(f => f.data.parent_key === subdivisionParent.data.ref_key);
        for (const subdivisionChild of subdivisionsChild) {
            subdivisionChild.data.subdivision = subdivisionParent;
            promises.push(subdivisionChild.save())
        }
        for (const positionChild of positionsChild) {
            positionChild.data.subdivision = subdivisionParent;
            promises.push(positionChild.save())
        }
    }
    await Promise.all(promises)
}

async function fillOrgHeadPositions(): Promise<void> {
    // const tables = await Namespace.app.posted_1c_data.search()
    //     .where(f => f.__deletedAt.eq(null))
    //     .where((f, g) => g.or(
    //         f.table_data.eq("InformationRegister_ЗанятостьПозицийШтатногоРасписания"),
    //         f.table_data.eq("InformationRegister_СведенияОбОтветственныхЛицах"),
    //         f.table_data.eq("Catalog_Сотрудники")
    //     )).size(10000)
    //     .all()
    // const 
}
