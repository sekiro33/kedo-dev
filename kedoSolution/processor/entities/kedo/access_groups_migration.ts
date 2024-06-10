class MyRole {
    group: UserGroupItem | UserItem[] | OrganisationStructureItem
    type: 'group' | 'user' | 'orgstruct'
    code: string
    constructor(group: UserGroupItem | UserItem[] | OrganisationStructureItem, type: 'group' | 'user' | 'orgstruct', code: string) {
        this.code = code;
        this.group = group;
        this.type = type;
    }
    getUsers(): Promise<UserItem[]> {
        if (this.type == "group") {
            return (<UserGroupItem>this.group).users();
        }
        else if (this.type == "orgstruct") {
            return System.users.search().where(i => i.osIds.has((<OrganisationStructureItem>this.group))).size(10000).all();
        }
        else return new Promise<UserItem[]>(() => <UserItem[]>this.group)
    }
    json(): any {
        return {
            code: this.code,
            type: this.type
        }
    }
}

type docMeta = { id: string, code: string, ns: string, staffId: string, orgRightsId: string | string[], isArray: boolean };
type docMap = { id: string, ns: string, staffId: string, orgRightsId: string };

const chunkSize = Context.data.chunk_size!;

const namespaces = [
    "kedo",
    "kedo_ext",
    "personnel_documents",
    "absences",
    "time_tracking",
    "absences_ext",
    "business_trips",
    "business_trips_ext"
];

const solutionsNames = [
    "kedo",
    "otpuska",
    "komandirovki"
];

let allDocs: { ns: string, code: string }[];
let allDocsSubarray: { ns: string, code: string }[];
let docCodes: string[];
const size = 20; //размер подмассива allDocsSubarray;

//Ищем все решения
async function getSolutions(): Promise<void> {
    const token = await Context.fields.settings_app.app.search().where(f => f.code.eq("api_key")).first().then(r => r!.data.value)!;
    const domen = await Context.fields.settings_app.app.search().where(f => f.code.eq("domen")).first().then(r => r!.data.value);
    if (!token || !domen) {
        throw new Error("Проверьте заполненность настроек Домен и Api-токен для методов в модуле в приложении Меню настроек.")
    };

    Context.data.domen = domen;
    Context.data.token = token;

    const fullUrl = `https://${domen}/pub/v1/scheme/solutions`;
    const response = await fetch(fullUrl, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error(await response.text());
    };
    const responseJson = await response.json();
    if (responseJson.result.result.length < 1) {
        throw new Error("Не найдено решений");
    };
    const solutions = responseJson.result.result.filter((solution: any) => solutionsNames.indexOf(solution.code) != -1).map((solution: any) => solution.code);

    const allNamespaces = await getAppNamespaces(solutions);
    allDocs = await getDocs(allNamespaces);

    Context.data.alldocs_json = JSON.stringify(allDocs);
    Context.data.number_chunks = Math.ceil(allDocs.length / size)
    Context.data.iteration = 0;

};

//Получем документы
async function getDocs(solutions: string[]): Promise<any[]> {
    try {
        let allDocs: any[] = [];
        let promises: Promise<void>[] = [];
        for (let code of solutions) {
            const appsUrl = `https://${Context.data.domen}/pub/v1/scheme/namespaces/${code}/apps`;
            promises.push(fetch(appsUrl, {
                headers: {
                    Authorization: `Bearer ${Context.data.token}`
                }
            }).then(async response => {
                if (!response.ok) {
                    throw new Error(await response.text());
                };
                const responseJson = await response.json();
                const apps = responseJson.result.result;
                if (apps.length < 1) {
                    Context.data.debug += `Не найдено приложений в ${code}`
                };
                const docs = apps.filter((app: any) => {
                    return namespaces.indexOf(app.namespace) != -1 && app.type.toLowerCase() === "document";
                });
                allDocs.push(...docs);
            }));
        };
        await Promise.all(promises);
        const mappedDocs = allDocs.map((doc: any) => {
            return {
                ns: doc.namespace,
                code: doc.code
            };
        });
        mappedDocs.push({ ns: "kedo", code: "staff" });
        mappedDocs.push({ ns: "kedo", code: "transfer_application" });
        mappedDocs.push({ ns: "kedo", code: "execution_duties" });
        mappedDocs.push({ ns: "kedo", code: "category_assignment" });
        mappedDocs.push({ ns: "kedo", code: "employees_personal_data" });
        mappedDocs.push({ ns: "kedo", code: "medical_request" });
        mappedDocs.push({ ns: "kedo", code: "docs_lna" });
        mappedDocs.push({ ns: "kedo", code: "medical_examination" });
        mappedDocs.push({ ns: "kedo", code: "structural_subdivision" });
        const checkAbsencesResponse = await fetch(`https://${Context.data.domen!}/pub/v1/scheme/namespaces/absences/apps/vacations`, {
            headers: {
                Authorization: `Bearer ${Context.data.token!}`
            }
        });
        const checkBusinessTripsResponse = await fetch(`https://${Context.data.domen!}/pub/v1/scheme/namespaces/business_trips/apps/businesstrip_requests`, {
            headers: {
                Authorization: `Bearer ${Context.data.token!}`
            }
        });
        if (checkAbsencesResponse.ok) {
            mappedDocs.push({ ns: "absences", code: "vacations" });
            mappedDocs.push({ ns: "time_tracking", code: "overtime_work" });
        };
        if (checkBusinessTripsResponse.ok) {
            mappedDocs.push({ ns: "business_trips", code: "businesstrip_requests" });
        };
        return mappedDocs;
    } catch (err) {
        throw new Error(`error at getDocs: ${err.message}`);
    }
};

//Получаем namespace приложений
async function getAppNamespaces(solutions: string[]): Promise<any[]> {
    try {
        let allNamespaces: any[] = [];
        for (let code of solutions) {
            const fullUrl = `https://${Context.data.domen}/pub/v1/scheme/solutions/${code}`;
            const response = await fetch(fullUrl, {
                headers: {
                    Authorization: `Bearer ${Context.data.token}`
                }
            });
            if (!response.ok) {
                throw new Error(await response.text());
            };
            const responseJson = await response.json();
            const content = responseJson.solution.content;
            if (content.length < 1) {
                Context.data.debug += `no apps in namespace ${code}`;
                continue;
            };
            const mappedNamespaces = content.filter((ns: any) => namespaces.indexOf(ns.code) != -1).map((ns: any) => ns.code);
            allNamespaces.push(...mappedNamespaces);
        };
        return allNamespaces;
    } catch (err) {
        throw new Error(`error at getAppNamespaces: ${err.message}`);
    }
};

//Получаем коды документов
async function checkAppsScheme(): Promise<void> {
    const i = Context.data.iteration!;
    let allDocs: { ns: string, code: string }[] = JSON.parse(Context.data.alldocs_json!);
    //Получаем подмассив всех документов
    const allDocsSubarray = allDocs.slice((i * size), (i * size) + size);
    try {
        const domen = Context.data.domen;
        const token = Context.data.token;
        const promises: Promise<string>[] = [];
        allDocsSubarray.forEach(doc => {
            promises.push(fetch(`https://${domen}/pub/v1/scheme/namespaces/${doc.ns}/apps/${doc.code}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(async resp => {
                const respJson = await resp.json();
                if (!respJson.success) {
                    throw new Error(`error at ${JSON.stringify(doc)}: ${respJson.error}`);
                };
                if (!respJson.application.fields.find((field: any) => field.code === "access_group")) {
                    return "";
                };
                return doc.code
            }).catch(err => {
                throw new Error(`error at checkAppsScheme/for: ${err.message}`);
            }));
        });
        const subDocCodes = await Promise.all(promises).then(resp => resp.filter(item => item));
        //Если существует jsonка кодов документов, то прибавляем массив, если нет, то инициализируем новый массив-результат с кодами документов
        if (!Context.data.doccodes_json || Context.data.doccodes_json.length < 1) {
            Context.data.doccodes_json = JSON.stringify(subDocCodes)
        } else {
            let docCodes: string[] = JSON.parse(Context.data.doccodes_json);
            docCodes = docCodes.concat(subDocCodes);
            Context.data.doccodes_json = JSON.stringify(docCodes);
        }

    } catch (err) {
        throw new Error(`error at checkAppsScheme: ${err.message}`);
    };
};

//Получаем все документы
async function getAllItems(docMeta: { ns: string, code: string }): Promise<docMeta[]> {
    const domen = Context.data.domen!;
    const token = Context.data.token!;
    let allDocs: any[] = [];
    let searchFulfilled = false;
    let itemsCount = 0;
    while (!searchFulfilled) {
        const response = await fetch(`https://${domen}/pub/v1/app/${docMeta.ns}/${docMeta.code}/list`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                active: true,
                from: itemsCount,
                size: chunkSize,
            })
        });
        if (!response.ok) {
            throw new Error(await response.text());
        };
        const respJson = await response.json();
        const result = respJson.result.result;
        if (result.length < 1) {
            searchFulfilled = true;
            break;
        };
        if (itemsCount < respJson.result.total) {
            itemsCount += result.length;
        } else {
            searchFulfilled = true;
            break;
        };
        allDocs.push(result.map((item: any) => {
            return {
                id: item.__id,
                ns: docMeta.ns,
                code: docMeta.code,
                staffId: item.kedo_staff ? item.kedo_staff[0] : item.staff ? item.staff[0] : docMeta.code === "structural_subdivision" || docMeta.code === "vacation_schedule" ? item.organization[0] : item.__id
            };
        }));
    };
    let flatDocs = [].concat.apply([], allDocs)
    return flatDocs;
};

//Разделяем на чанки
async function splitDocs(): Promise<void> {
    const docs: { ns: string, code: string }[] = JSON.parse(Context.data.alldocs_json!);
    const allStaff = await Context.fields.staff_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allOrgs = await Context.fields.organization_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const allOrgRights = await Context.fields.org_rights_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const docCodes: string[] = JSON.parse(Context.data.doccodes_json!);
    const filteredDocs = docs.filter(doc => docCodes.indexOf(doc.code) !== -1);
    let promises: Promise<any>[] = [];

    for (let doc of filteredDocs) {
        promises.push(getAllItems(doc))
    };

    let allDocsFiltred: docMeta[] = [].concat.apply([], await Promise.all(promises));

    Context.data.debug = JSON.stringify(allDocsFiltred)
    allDocsFiltred = allDocsFiltred.filter(item => {
        const staff = allStaff.find(s => s.id === item.staffId);
        if (!staff && !item.staffId) {
            return false;
        };

        let organization: ApplicationItem<Application$kedo$organization$Data, any>;
        let orgRights: ApplicationItem<Application$kedo$access_settings_organization$Data, any> | ApplicationItem<Application$kedo$access_settings_organization$Data, any>[];
        if (item.code == "staff" && staff && staff.data.employment_table && staff.data.employment_table.length > 1) {
            const allStaffOrgs = staff!.data.employment_table.filter(row => row.organization).map(row => row.organization.id);
            const orgsWithAccessRights = allOrgs.filter(org => allStaffOrgs.indexOf(org.id) != -1 && org.data.access_settings_organization);
            const orgRightsIds = orgsWithAccessRights.map(org => org.data.access_settings_organization!.id);
            const accessSettingsWithFields = allOrgRights.filter(right => orgRightsIds.indexOf(right.id) != -1 && right.data[item.code as keyof typeof right.fields]);
            item.orgRightsId = accessSettingsWithFields.map(right => right.id);
            item.isArray = true;
            return true;
        };
        if (item.code === "structural_subdivision" && !staff) {
            organization = allOrgs.find(org => org.id === item.staffId)!
        } else if (staff) {
            if (!staff.data.organization) {
                return false;
            };
            organization = allOrgs.find(org => org.id === staff!.data.organization!.id)!;
        };
        if (!organization! || !organization.data.access_settings_organization) {
            Context.data.debug += `no org for ${item.code} ${item.id}`
            return false;
        };
        orgRights = allOrgRights.find(right => right.id === organization.data.access_settings_organization!.id)!;
        if (!orgRights) {
            Context.data.debug += `no org rights for organization ${organization.data.__name}`
            return false;
        };
        item.orgRightsId = orgRights.id;
        const fieldExists = orgRights.fields[item.code as keyof typeof orgRights.fields];
        if (!fieldExists) {
            Context.data.debug += `no field ${item.code} for ${orgRights.data.__name}`
            return false;
        };
        const roleField = orgRights.data[item.code as keyof typeof orgRights.data];
        if (!roleField || roleField.length < 1) {
            Context.data.debug += `empty field ${item.code} for ${orgRights.data.__name}`
            return false;
        };
        return true;
    });


    let chunks: docMeta[][] = [];
    for (let i = 0; i < allDocsFiltred.length; i += chunkSize) {
        const chunk = allDocsFiltred.slice(i, i + chunkSize);
        chunks.push(chunk)
    };

    if (chunks.length > 0) {
        Context.data.chunks = chunks;
        Context.data.chunks_exists = true;
        Context.data.iteration = 0
    }
};

//Выполняем миграцию прав на документ
async function migrateDocRights(): Promise<void> {
    const allOrgRights = await Context.fields.org_rights_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const domen = Context.data.domen!;
    const token = Context.data.token!;
    const promises: Promise<FetchResponse>[] = [];
    let chunk: docMeta[] = Context.data.chunks[Context.data.iteration!];

    for (let doc of chunk) {
        if (doc.isArray) {
            const orgRights = allOrgRights.filter(right => doc.orgRightsId.indexOf(right.id) != -1);
            const roleFields = orgRights.map(right => {
                return {
                    type: "group",
                    code: right.data[doc.code as keyof typeof right.data][0].code
                }
            });
            promises.push(fetch(`https://${domen}/pub/v1/app/${doc.ns}/${doc.code}/${doc.id}/update`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    context: {
                        access_group: roleFields
                    }
                })
            }));
        } else {
            const orgRights = allOrgRights.find(right => right.id === doc.orgRightsId)!;
            const roleField = orgRights!.data[doc.code as keyof typeof orgRights.data];
            promises.push(fetch(`https://${domen}/pub/v1/app/${doc.ns}/${doc.code}/${doc.id}/update`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    context: {
                        access_group: [
                            {
                                type: "group",
                                code: roleField[0].code
                            }
                        ]
                    }
                })
            }));
        }
    };

    await Promise.all(promises);

    Context.data.iteration!++;
    if (chunk.length < chunkSize) {
        Context.data.all_objects_processed = true;
        Context.data.debug += `items processed: ${[].concat.apply([], (Context.data.chunks as docMeta[][])).length}`;
    };
};
async function timeout(): Promise<void> {
    Context.data.iteration! += 1;
    Context.data.timer = new Datetime().add(new Duration(5, 'seconds'));
}
