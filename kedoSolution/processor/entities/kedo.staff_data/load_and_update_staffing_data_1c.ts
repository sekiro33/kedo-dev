/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

// const numberOfUnloadedElements = 1000;
const promisesCount = 30;

async function getParams(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    const alternative_integration = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.is_alternative = alternative_integration ? alternative_integration.data.status : false;
}

async function createNoConnectionsError(): Promise<void> {
    Context.data.error = "Нет доступных подключений 1С"
}

async function errorHandler(): Promise<void> {
    if (!Context.data.error) {
        Context.data.error = "Обнаружена неизвестная ошибка в сценарии"
    }
}

async function parseConnectionsObject(): Promise<void> {
    const connectionsArray = Context.data.connection_object ? JSON.parse(Context.data.connection_object) : [];
    if (connectionsArray.length === 0) return;
    Context.data.number_of_iter = connectionsArray.length;
    Context.data.current_iteration = 0
}

async function startIteration(): Promise<void> {
    const connectionsArray = Context.data.connection_object ? JSON.parse(Context.data.connection_object) : [];
    Context.data.connection_name = connectionsArray[Context.data.current_iteration!].name
}

async function prepareReqForGetData(): Promise<void> {
    Context.data.request_parameters_1c = 'Catalog_ШтатноеРасписание?$format=json';
    Context.data.error = ''
}

async function parseDataUpdateApps(): Promise<void> {
    if (!Context.data.response_1c_json) return;
    const data1S = JSON.parse(Context.data.response_1c_json)["value"];
    let organizationsRefsArray: { ref_key: any; owner_key: any; }[] = [];
    let promises: Promise<void>[] = [];
    const allDivisions = await Namespace.app.structural_subdivision.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allPositions = await Namespace.app.position.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const employmentType = Namespace.app.position.fields.employment_type.variants.main_workplace
    const workRelationsTypeApps = await Namespace.app.type_employment_relationship.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        )).size(10000).all()
    const workRelationsType = workRelationsTypeApps.find(item => {
        return item.data.__name === "Сотрудник без ограничений"
    })

    const processedPosKeys: string[] = []
    const processedDivKeys: string[] = []
    for (let i = 0; i < data1S.length; i++) {
        const data = data1S[i];
        if (data['Должность_Key'] !== "00000000-0000-0000-0000-000000000000") {
            // const isProcessed = processedPosKeys.find((ref: string) => ref === data["Ref_Key"]) 
            // if (!!isProcessed) continue;

            let app: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params> | undefined;
            app = allPositions.find(f => f.data.ref_key === data["Ref_Key"]);
            if (!app)
                app = Namespace.app.position.create();
            app.data.__name = data["Description"];
            app.data.ref_key = data["Ref_Key"];
            app.data.owner_key = data["Owner_Key"];
            app.data.parent_key = data["Parent_Key"];
            app.data.position_key = data["Должность_Key"];
            app.data.base_1c = Context.data.connection_name;
            app.data.remote_work = false
            app.data.employment_type = employmentType
            app.data.type_employment_relationship = workRelationsType
            const salaryValue = data["ОкладТариф"];
            app.data.salary = new Money(salaryValue, 'RUB');
            const date = data["ДатаУтверждения"].split('T')[0].split('-');
            const year = date[0];
            const month = date[1];
            const day = date[2];
            app.data.approval_date = new TDate(year, month, day);
            app.data.quantity = Number(data["КоличествоСтавок"]);
            await app.save()
            // promises.push(app.save());
            // processedPosKeys.push(data["Ref_Key"])
            // if (promises.length >= promisesCount) {
            //     await Promise.all(promises);
            //     promises = []
            // }
        } else {
            organizationsRefsArray.push({ ref_key: data['Ref_Key'], owner_key: data['Owner_Key'] })

            // const isProcessed = processedDivKeys.find((ref: string) => ref === data["Ref_Key"]) 
            // if (!!isProcessed) continue;

            let app: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params> | undefined;
            app = allDivisions.find(f => f.data.ref_key === data["Ref_Key"]);
            if (!app)
                app = Namespace.app.structural_subdivision.create();
            app.data.__name = data["Description"];
            app.data.ref_key = data["Ref_Key"];
            app.data.subdiv_key = data["Подразделение_Key"];
            app.data.owner_key = data["Owner_Key"];
            app.data.parent_key = data["Parent_Key"];
            app.data.position_key = data["Должность_Key"];
            app.data.base_1c = Context.data.connection_name;
            await app.save()
            //promises.push(app.save());
            // processedDivKeys.push(data["Ref_Key"])
            // if (promises.length >= promisesCount) {
            //     await Promise.all(promises);
            //     promises = []
            // }
        }
    }
   // await Promise.all(promises);
    organizationsRefsArray = organizationsRefsArray.filter((f, i, s) =>
        i === s.findIndex(t => t.owner_key === f.owner_key)
    )
    Context.data.organization_ref_key_array_json = JSON.stringify(organizationsRefsArray);
    Context.data.organization_array_length = organizationsRefsArray.length;
}

async function prepareReqOrganiztion(): Promise<void> {
    Context.data.error = '';
    Context.data.response_1c_json = '';
    const orgsArray = JSON.parse(Context.data.organization_ref_key_array_json!);
    Context.data.request_parameters_1c = `Catalog_ШтатноеРасписание(guid'${orgsArray[Context.data.organization_array_length! - 1].ref_key}')/Owner?$format=json`
}

async function createOwnerApp(): Promise<void> {
    if (!Context.data.response_1c_json) {
        Context.data.organization_array_length!--;
        Context.data.error += ` Ошибка при запросе данных из 1С по организации `;
        return;
    }
    let appEntity: ApplicationItem<Application$_system_catalogs$_my_companies$Data, Application$_system_catalogs$_my_companies$Params> | undefined;
    let appOrganization: ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params> | undefined;
    const orgsArray = JSON.parse(Context.data.organization_ref_key_array_json!);
    const dataObj = orgsArray[Context.data.organization_array_length! - 1];
    const ownerData = JSON.parse(Context.data.response_1c_json);
    appOrganization = await Namespace.app.organization.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ref_key.eq(dataObj.owner_key)
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
    appOrganization.data.ref_key = dataObj.owner_key;
    appOrganization.data.base_1c = Context.data.connection_name;
    appOrganization.data.owner_key = '';
    appOrganization.data.parent_key = '';
    appOrganization.data.position_key = '';
    await appOrganization.save();
    Context.data.organization_array_length!--;
}

async function fillAppsLinks(): Promise<void> {
    // получаем данные по данной базе 1С
    const allOrganizations = await Namespace.app.organization.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.base_1c.eq(Context.data.connection_name!)
        ))
        .size(10000)
        .all();
    const allSubdivisions = await Namespace.app.structural_subdivision.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.base_1c.eq(Context.data.connection_name!)
        ))
        .size(10000)
        .all();
    const allPositions = await Namespace.app.position.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.base_1c.eq(Context.data.connection_name!)
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
            await subdivision.save()
            // promises.push(subdivision.save());
            // if (promises.length >= promisesCount) {
            //     await Promise.all(promises);
            //     promises = []
            // }
        }
        for (const position of positions) {
            position.data.organization = organiaztion;
            await position.save()
            // promises.push(position.save());
            // if (promises.length >= promisesCount) {
            //     await Promise.all(promises);
            //     promises = []
            // }
        }
    }
    //await Promise.all(promises);
    promises = [];
    // проходимся по каждому подразделению и записываем его в элементы
    for (const subdivisionParent of allSubdivisions) {
        const subdivisionsChild = allSubdivisions.filter(f => f.data.parent_key === subdivisionParent.data.ref_key);
        const positionsChild = allPositions.filter(f => f.data.parent_key === subdivisionParent.data.ref_key);
        for (const subdivisionChild of subdivisionsChild) {
            subdivisionChild.data.subdivision = subdivisionParent;
            await subdivisionChild.save()
            // promises.push(subdivisionChild.save());
            // if (promises.length >= promisesCount) {
            //     await Promise.all(promises);
            //     promises = []
            // }
        }
        for (const positionChild of positionsChild) {
            positionChild.data.subdivision = subdivisionParent;
            await positionChild.save()
            //promises.push(positionChild.save());
            // if (promises.length >= promisesCount) {
            //     await Promise.all(promises);
            //     promises = []
            // }
        }
    }
    //await Promise.all(promises)
}

async function prepareReqHeadOrgLink(): Promise<void> {
    Context.data.error = '';
    Context.data.response_1c_json = '';
    Context.data.request_parameters_1c = `InformationRegister_СведенияОбОтветственныхЛицах?$format=json`;
}

async function prepaereReqHeadPhysRef(): Promise<void> {
    if (!Context.data.response_1c_json) return;
    let headOrgLink: string = '';
    const res = JSON.parse(Context.data.response_1c_json);
    headOrgLink = res.value[0]["Руководитель@navigationLinkUrl"]
    Context.data.error = '';
    Context.data.response_1c_json = '';
    Context.data.request_parameters_1c = `${headOrgLink}?$format=json`;
}

async function getPhysicHistoryArr(): Promise<void> {
    if (!Context.data.response_1c_json) return;
    let headPhysicRefKey: string = '';
    const res = JSON.parse(Context.data.response_1c_json);
    if (!res["Ref_Key"]) return;
    headPhysicRefKey = res["Ref_Key"];
    Context.data.error = '';
    Context.data.response_1c_json = '';
    Context.data.request_parameters_1c = `InformationRegister_КадроваяИсторияСотрудников?$format=json&$filter=RecordSet/any(d: d/ФизическоеЛицо_Key eq guid'${headPhysicRefKey}')`;
}

async function setOwnersHeader(): Promise<void> {
    if (!Context.data.response_1c_json) return;
    const res = JSON.parse(Context.data.response_1c_json);
    if (!res.value) return;
    const physicHistoryArr: any[] = res.value;
    const headerPositionRef: string = physicHistoryArr[0]["RecordSet"][0]["Должность_Key"];
    const owners = await Namespace.app.organization.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.base_1c.eq(Context.data.connection_name!)
        ))
        .size(10000)
        .all();
    const headerPositionApp = await Namespace.app.position.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.position_key.eq(headerPositionRef)
        ))
        .first();
    let promises: Promise<void>[] = [];
    for (const owner of owners) {
        owner.data.position_head = headerPositionApp;
        await owner.save()
        // promises.push(owner.save());
        // if (promises.length >= promisesCount) {
        //     await Promise.all(promises);
        //     promises = []
        // }
    }
   // await Promise.all(promises)
   await linkFix()
}

async function linkFix(): Promise<void> {
    const positions = await Namespace.app.position.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.subdivision.eq(null)
        )).size(10000).all()
    //@ts-ignore
    const positionParentKeys: string[] = positions.filter(item => !!item.data.parent_key).map(item => item.data.parent_key)
    const subdivs = await Namespace.app.structural_subdivision.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ref_key.in(positionParentKeys)
        )).size(10000).all()
    Context.data.debug += " length " + positions.length
    for (let i = 0; i < positions.length; i++) {
        const curPos = positions[i]
        const parentKey = curPos.data.parent_key
        if (!parentKey)  continue;
        const subdiv = subdivs.find(div => div.data.ref_key === parentKey)
        curPos.data.subdivision = subdiv
        await curPos.save()
        
    }
}

async function endIteration(): Promise<void> {
    Context.data.current_iteration!++
}
