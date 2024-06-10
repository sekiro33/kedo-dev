/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function loadPositionsAndSubdividions(): Promise<void> {

    Context.data.debug += " in load ";

    const allDivisions = await Namespace.app.structural_subdivision.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allPositions = await Namespace.app.position.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const searchData = await Namespace.app.posted_1c_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.table_name.eq("Catalog_ШтатноеРасписание")
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .size(10000).all()
    const sortedApps = searchData.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    })
    const baseArray: any[] = []
    const latestData = baseArray.concat(...(sortedApps.filter(item => item.data.table_name === "Catalog_ШтатноеРасписание" && !!item.data.table_data).map(item => JSON.parse(item.data.table_data!))))
    let data1C: any[] = []
    if (!!searchData) {
        data1C = latestData.map((item: any) => item.data)
    } else {
        Context.data.debug += " return ";
        return;
    }

    try {
        let promises: Promise<void>[] = [];
        const employmentType = Namespace.app.position.fields.employment_type.variants.main_workplace
        const workRelationsTypeApps = await Namespace.app.type_employment_relationship.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null)
            )).size(10000).all()
        const workRelationsType = workRelationsTypeApps.find(item => {
            return item.data.__name.includes("Бессрочный")
        })
        const workSchedules = await Namespace.app.work_schedules.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null)
            )).size(10000).all()
        Context.data.debug += `length is ${data1C.length}`
        const positionRefArr: string[] = []
        for (let i = 0; i < data1C.length; i++) {
            const data = data1C[i]

            Context.data.debug += data['Должность'];

            if (data['Должность'] === "00000000-0000-0000-0000-000000000000" || !!(positionRefArr.find((ref: string) => ref === data["Ref"]))) {
                continue;
            }

            let app: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params> | undefined;

            app = allPositions.find(f => f.data.ref_key === data["Ref"]);
            const isClosed = data["Закрыта"]
            if (!app && isClosed) continue
            if (!app) {
                app = Namespace.app.position.create();
                //app.data.is_closed = false;
            }
            app.data.is_closed = false;
            if (isClosed) {
                app.data.is_closed = true;
            }

            if (!!data["ГрафикРаботыСотрудников"]) {
                const workSchedule = workSchedules.find(item => item.data.id_1c === data["ГрафикРаботыСотрудников"]["data"])
                app.data.work_schedules = workSchedule
            }

            app.data.__name = data["Description"];
            app.data.ref_key = data["Ref"];
            app.data.owner_key = data["Owner"]["data"];
            app.data.parent_key = data["Parent"];
            app.data.position_key = data["Должность"];
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
            positionRefArr.push(data["Ref"])
            promises.push(app.save())
            if (promises.length > 30) {
                await Promise.all(promises)
                promises = []
            }
        }
        await Promise.all(promises)
        promises = []
        const divisionRefArr: string[] = []
        for (let i = 0; i < data1C.length; i++) {
            const data = data1C[i]
            if (data['Должность'] !== "00000000-0000-0000-0000-000000000000" || !!(divisionRefArr.find((ref: string) => ref === data["Ref"]))) {
                continue;
            }
            let app: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params> | undefined;
            app = allDivisions.find(f => f.data.ref_key === data["Ref"]);
            const isClosed = data["Закрыта"]
            if (!app && isClosed) continue
            if (!app) {
                app = Namespace.app.structural_subdivision.create();
                //app.data.is_closed = false;
            }
            app.data.is_closed = false;
            if (isClosed) {
                app.data.is_closed = true;
            }

            app.data.__name = data["Description"];
            app.data.ref_key = data["Ref"];
            app.data.subdiv_key = data["Подразделение"];
            app.data.owner_key = data["Owner"]["data"];
            app.data.parent_key = data["Parent"];
            app.data.position_key = data["Должность"];
            divisionRefArr.push(data["Ref"])

            promises.push(app.save())
            if (promises.length > 30) {
                await Promise.all(promises)
                promises = []
            }
        }
        Context.data.debug += `done length ${data1C.length}`
        await Promise.all(promises);
    } catch (e: any) {
        Context.data.debug += `An error occured: name ${e.name}, message ${e.message}`
    }

    let promises: Promise<void>[] = []
    for (let app of searchData) {
        app.data.is_processed = true
        promises.push(app.save())
        if (promises.length >= 20) {
            await Promise.all(promises)
            promises = []
        }
    }

    await Promise.all(promises)
}

async function loadOrgs(): Promise<void> {
    const searchData = await Namespace.app.posted_1c_data.search()
        .where((f) => f.__deletedAt.eq(null))
        .where((f, g) => g.or(
            f.table_name.eq("Catalog_Организации"),
            f.table_name.eq("InformationRegister_СведенияОбОтветственныхЛицах")
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .size(10000).all()
    if (!searchData) {
        return;
    }
    const sortedApps = searchData.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    })

    const latestData = parseData(sortedApps, "Catalog_Организации")

    let data1C: any[] = []
    if (!!latestData) {
        data1C = latestData.map((item: any) => item.data)
    } else {
        return;
    }
    const loadedOrgsIds: string[] = []
    for (let i = 0; i < data1C.length; i++) {
        const ownerData = data1C[i]
        if (!!(loadedOrgsIds.find((ref: string) => ref === ownerData.Ref))) {
            continue
        }
        let appEntity: ApplicationItem<Application$_system_catalogs$_my_companies$Data, Application$_system_catalogs$_my_companies$Params> | undefined;
        let appOrganization: ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params> | undefined;
        appOrganization = await Namespace.app.organization.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ref_key.eq(ownerData.Ref)
            ))
            .first()
        if (appOrganization && appOrganization.data.entity) {
            appEntity = await appOrganization.data.entity.fetch();
        } else {
            
            appOrganization = await Namespace.app.organization.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.inn.eq(ownerData["ИНН"])
            ))
            .first()
            
            if (!appOrganization) {
                appOrganization = Namespace.app.organization.create();
            } else {
                if (appOrganization.data.entity)
                appEntity = await appOrganization.data.entity.fetch();   
            } 
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
            if (!appEntity.data._inn) {
                appEntity.data._inn = ownerData["ИНН"];
            }
            if (!appEntity.data._ogrn) {
                appEntity.data._ogrn = ownerData["ОГРН"];
            }

            if (!appEntity.data._email || appEntity.data._email.length === 0) {
                const email = ownerData["КонтактнаяИнформация"]?.find((info: any) => info["Тип"] === "АдресЭлектроннойПочты");
                if (email) {
                    appEntity.data._email = [{
                        email: email["АдресЭП"],
                        type: EmailType.Work,
                    }]
                }
            }
            
            try {
            if (!appEntity.data._phone) {
                const phone = ownerData["КонтактнаяИнформация"]?.find((info: any) => info["Тип"] === "Телефон")
                appEntity.data._phone = {
                    tel: phone["Представление"].replace(/\D+/g, ""),
                    type: PhoneType.Main,
                }
            }
            } catch (e) {

            }

            try {
            const legalAddressType = "6b0a2669-1bb5-4c9a-9466-54433ac0a955"
            const actualAddressType = "afa527f2-8b59-4c20-95ae-d0d5a08111ee"
            if (!appEntity.data._legal_address) {
                const addressField = ownerData["КонтактнаяИнформация"]?.find((info: any) => info["Тип"] === "Адрес" && info["Вид"] === legalAddressType)
                if (addressField) {
                    appEntity.data._legal_address = addressField["Представление"]
                }
            }
            if (!appEntity.data._actual_address) {
                const addressField = ownerData["КонтактнаяИнформация"]?.find((info: any) => info["Тип"] === "Адрес" && info["Вид"] === actualAddressType)
                if (addressField) {
                    appEntity.data._actual_address = addressField["Представление"]
                }
            }
            } catch (e) {}
            
            await appEntity.save();
        }

        appOrganization.data.entity = appEntity;
        appOrganization.data.ref_key = ownerData.Ref;
        appOrganization.data.owner_key = '';
        appOrganization.data.parent_key = '';
        appOrganization.data.position_key = '';
        appOrganization.data.inn = ownerData["ИНН"];
        appOrganization.data.base_1c = ownerData["ИмяБазы"];

        if (ownerData.Ref !== ownerData["ГоловнаяОрганизация"]) {
            const app = await Namespace.app.organization.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ref_key.eq(ownerData["ГоловнаяОрганизация"])
            ))
            .first();

            if (app) {
                appOrganization.data.head_org = app;    
            }    
        } 

        loadedOrgsIds.push(ownerData.Ref)
        await appOrganization.save();
    }

    let promises: Promise<void>[] = []
    for (let app of searchData) {
        app.data.is_processed = true
        promises.push(app.save())
        if (promises.length >= 20) {
            await Promise.all(promises)
            promises = []
        }
    }

    await Promise.all(promises)
}

async function fillAppsLinks(): Promise<void> {
    // получаем данные по данной базе 1С
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

    Context.data.debug += `pos ${allPositions.length} subdiv  ${allSubdivisions.length}`
    // проходимся по каждому подразделению и записываем его в элементы
    for (const subdivisionParent of allSubdivisions) {

        const subdivisionsChild = allSubdivisions.filter(f => f.data.parent_key === subdivisionParent.data.ref_key || f.data.parent_key === subdivisionParent.data.subdiv_key);
        for (let subdivisionChild of subdivisionsChild) {
            subdivisionChild.data.subdivision = subdivisionParent;
            try {
                await subdivisionChild.save()
            } catch (e: any) {
                Context.data.debug += `SUBDIV ${subdivisionParent.data.__name} An error occured: name ${e.name}, message ${e.message}`
            }
        }
    }
}

async function fillPosLinks(): Promise<void> {
    // получаем данные по данной базе 1С
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

    Context.data.debug += `pos ${allPositions.length} subdiv  ${allSubdivisions.length}`
    let promises: Promise<void>[] = [];
    // проходимся по каждому подразделению и записываем его в элементы
    for (const subdivisionParent of allSubdivisions) {

        const positionsChild = allPositions.filter(f => f.data.parent_key === subdivisionParent.data.ref_key || f.data.parent_key === subdivisionParent.data.subdiv_key);
        for (let positionChild of positionsChild) {
            positionChild.data.subdivision = subdivisionParent;
            promises.push(positionChild.save())
            if (promises.length > 30) {
                try {
                    await Promise.all(promises)
                } catch (e: any) {
                    Context.data.debug += `SUBDIV ${subdivisionParent.data.__name} An error occured: name ${e.name}, message ${e.message}`
                }
                promises = []
            }
        }
        await Promise.all(promises)

    }
}

async function fillOrgHeadPositions(): Promise<void> {
    
    try {
    
    const tables = await Namespace.app.posted_1c_data.search()
        .where(f => f.__deletedAt.eq(null))
        .where((f, g) => g.or(
            f.table_name.eq("InformationRegister_ПозицииРуководителейПодразделений"),
            f.table_name.eq("Catalog_СтруктураПредприятия")
        ))
        .where((f, g) => g.or(
            f.is_processed.eq(false),
            f.is_processed.eq(null),
        ))
        .size(10000).all()
    const sortedApps = tables.length >= 2 ? tables.sort((a, b) => {
        const aDate: any = a.data.__createdAt.asDate()
        const bDate: any = b.data.__createdAt.asDate()
        return aDate - bDate
    }) : tables
    const baseArray: any[] = []

    const headPositions = baseArray.concat(...(sortedApps.filter(item => item.data.table_name === "InformationRegister_ПозицииРуководителейПодразделений" && !!item.data.table_data).map(item => JSON.parse(item.data.table_data!))))

    const sdStructure = baseArray.concat(...(sortedApps.filter(item => item.data.table_name === "Catalog_СтруктураПредприятия" && !!item.data.table_data).map(item => JSON.parse(item.data.table_data!))))

    if (!!sdStructure && !!headPositions && sdStructure.length > 0 && headPositions.length > 0) {
        const headData = headPositions.map((item: any) => item.data["Record"])
        const sdData = sdStructure.map((item: any) => item.data)
        const subdivisions = await Namespace.app.structural_subdivision.search()
            .where(f => f.__deletedAt.eq(null)).size(10000).all()
        const positions = await Namespace.app.position.search()
            .where(f => f.__deletedAt.eq(null)).size(10000).all()
        for (let subdivision of headData) {
            const posRef = subdivision[0]["ПозицияШтатногоРасписания"]
            const sdStructureRef = subdivision[0]["Подразделение"]
            const struct = sdData.find((item: any) => item.Ref === sdStructureRef)
            if (!struct) continue
            const sdRef = struct["Источник"].data

            Context.data.debug += `found pos and sd ${posRef} ${sdRef}`
            const foundSubdivision = subdivisions.find(item => {
                return item.data.subdiv_key === sdRef
            })
            const foundPosition = positions.find(item => {
                return item.data.ref_key === posRef
            })
            if (!!foundPosition && !!foundSubdivision) {
                Context.data.debug += `success!!`
                foundSubdivision.data.position = foundPosition
                await foundSubdivision.save()
            }
        }
    }

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

    } catch (e) {
        Context.data.debug += ` name ${e.name}, message ${e.message} `;
    }
}

async function linkFix(): Promise<void> {
    const positions = await Namespace.app.position.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.subdivision.eq(null)
        )).size(10000).all()
    if (!positions || positions.length === 0) {
        return
    }
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
        if (!parentKey) continue;
        const subdiv = subdivs.find(div => div.data.ref_key === parentKey)
        curPos.data.subdivision = subdiv
        await curPos.save()

    }
}
async function fillOrgLinks(): Promise<void> {
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

    let promises: Promise<void>[] = [];
    for (const organiaztion of allOrganizations) {
        try {
            const subdivisions = allSubdivisions.filter(f => f.data.owner_key === organiaztion.data.ref_key);
            const positions = allPositions.filter(f => f.data.owner_key === organiaztion.data.ref_key);
            for (let subdivision of subdivisions) {
                subdivision.data.organization = organiaztion;
                promises.push(subdivision.save())
                if (promises.length > 30) {
                    await Promise.all(promises)
                    promises = []
                }
            }
            await Promise.all(promises)
            for (let position of positions) {
                position.data.organization = organiaztion;
                promises.push(position.save())
                if (promises.length > 30) {
                    await Promise.all(promises)
                    promises = []
                }
            }
            await Promise.all(promises)
        } catch (e: any) {
            Context.data.debug += `ORG ${organiaztion.data.__name} An error occured: name ${e.name}, message ${e.message}`
        }
    }
}

const parseData = (data: any[], tableName: string): any[] => {
    const result: any[] = []
    data.forEach(item => {
        if (item.data.table_name === tableName && !!item.data.table_data) {
            let tableData = JSON.parse(item.data.table_data!);
            for (let tableElement of tableData) {
                tableElement.data["ИмяБазы"] = item.data.base_1c_name;
            }

            result.push(...tableData);
        }
    })

    return result;
}
