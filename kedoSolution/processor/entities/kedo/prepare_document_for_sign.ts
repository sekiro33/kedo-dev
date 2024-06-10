type fileJson = {
    file_id: string,
    doc_name: string,
    doc_type: string,
    doc_ns?: string
};

type goskeyDocsMeta = {
    docs_package_name: string,
    files: fileJson[]
};

type docContext = {
    responsible_user: string[],
    responsible: string,
    staff?: string[],
    kedo_staff?: string[],
    __name: string,
    line_file_name: string,
    __file: string[]
}

const namespaces = [
    "kedo",
    "personnel_documents",
    "absences",
    "business_trips",
    "time_tracking"
];

const otherDocumentsCode = "other_documents";
const otherDocumentsNs = "personnel_documents";

async function check_file_format(): Promise<number> {
    const file = await Context.data.file!.fetch();
    const file_name = file.data.__name;

    if (file_name.endsWith('.pdf')) {
        return 1;
    } else if (file_name.endsWith('.docx') || file_name.endsWith('.xlsx')) {
        return 2;
    } else {
        Context.data.incorrect_file_type = true;
        return -1;
    };
};

async function create_document(): Promise<void> {
    if (Context.data.document_type) {
        const doc_type = await Context.data.document_type.fetch();
        let doc;

        if (doc_type.data.app_code) {
            doc = await (await create_app_document(doc_type.data.app_code)).create();
        } else {
            doc = await (await create_app_document("other_documents")).create();
        }

        doc.data.__name = Context.data.app_name;
        doc.data.line_file_name = Context.data.app_name;
        doc.data.__file = Context.data.file;
        doc.data.staff = Context.data.signatory_app;
        doc.data.kedo_staff = Context.data.signatory_app;
        doc.data.responsible = (await Context.data.__createdBy.fetch()).data.__name;
        doc.data.responsible_user = Context.data.__createdBy;
        await doc.save();
        //Context.data.document = doc;
        Context.data.document_id = doc.id;
    }
}

async function create_app_document(doc_type: string): Promise<any> {
    return (Namespace as any).factory.Global.ns.personnel_documents.app[doc_type]
        || (Namespace as any).factory.Global.ns.kedo.app[doc_type]
        || (Namespace as any).factory.Global.ns.absences.app[doc_type]
        || (Namespace as any).factory.Global.ns.business_trips.app[doc_type]
        || (Namespace as any).factory.Global.ns.time_tracking.app[doc_type];
}

async function set_document(): Promise<void> {
    const personnelDocument = await Context.fields.personnel_document.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(Context.data.document_id!)
    ))
        .first();
    Context.data.personnel_document = personnelDocument;

    const documentForEmployment = await Context.fields.documents_for_employment.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(Context.data.document_id!)
    ))
        .first();
    Context.data.documents_for_employment = documentForEmployment;

    if (!personnelDocument && !documentForEmployment) {
        throw new Error('Не найден кадровый документ');
    };
};

/** Запуск подпроцесса через скрипт, чтобы была связь с созданным элементом приложения. */
async function run_sign_process(): Promise<void> {

    let document: any;

    if (Context.data.personnel_document) {
        document = await Context.data.personnel_document!.fetch();
    }

    if (Context.data.documents_for_employment) {
        document = await Context.data.documents_for_employment!.fetch();
    }

    const source = document.data.__sourceRef!;

    const sign_proccess = Namespace.processes.signing_process;

    if (Context.data.signatory_staffs_organization && Context.data.whom_send && Context.data.whom_send.code === 'all_staffs') {
        const staffs = await Context.fields.signatory_staffs.app.search()
            .size(10000)
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__status.eq(Context.fields.signatory_staffs.app.fields.__status.variants.signed_documents),
                f.organization.link(Context.data.signatory_staffs_organization!)
            ))
            .all();
        Context.data.signatory_staffs = staffs;
    }

    const context: any = {
        personel_document: Context.data.personnel_document ? [Context.data.personnel_document.id] : [],
        document_for_employment: Context.data.documents_for_employment ? [Context.data.documents_for_employment.id] : [],
        staff_chief_kedo: Context.data.staff_chief_app ? [Context.data.staff_chief_app.id] : [],
        signatory_staffs: Context.data.signatory_staffs ? Context.data.signatory_staffs.map(f => f.id) : [],
        staff: [Context.data.signatory_app!.id],
        chief_sign_required: Context.data.chief_sign_required,
        limit: Context.data.limit ? Context.data.limit.format() : new Datetime().addDate(0, 0, 1).format(),
        __item: {
            id: source.id,
            code: source.code,
            namespace: source.namespace
        },
        sign_type: [{
            name: Context.data.sign_type!.name,
            code: Context.data.sign_type!.code
        }],
    };

    Context.data.debug = JSON.stringify(context);

    await sign_proccess.run(context);
}

async function create_file_name(): Promise<void> {
    const file = await Context.data.file!.fetch();
    const file_name = file.data.__name.replace(/\.[^.$]+$/, '');
    Context.data.file_name = file_name;
}

async function create_app_name(): Promise<void> {
    if (Context.data.app_name) {
        return;
    }

    Context.data.app_name = Context.data.file_name;
}

async function timer_5(): Promise<void> {
    let currentTime = new Datetime();
    const needTime = currentTime.add(new Duration(5, 'seconds'));
    while (!currentTime.after(needTime)) {
        currentTime = new Datetime();
    }
}

async function setDocFromFile(): Promise<void> {
    let doc: any;
    if (Context.data.documents_for_employment) {
        doc = await Context.data.documents_for_employment.fetch();
    } else {
        doc = await Context.data.personnel_document!.fetch();
    };
    const source = await doc.data.__sourceRef.fetch();
    Context.data.file = source.data.__file;
};

async function getDocsNamespaces(): Promise<void> {
    let apps: any[] = [];
    const tokenSetting = await Namespace.app.settings.search().where(f => f.code.eq("api_key")).first();
    if (!tokenSetting || !tokenSetting.data.value) {
        throw new Error("Проверьте наличие и заполненность настройки 'Api-ключ для методов в модуле' в Меню настроек");
    };
    const token = tokenSetting.data.value;
    Context.data.token = token;
    const baseUrl = System.getBaseUrl();

    for (let ns of namespaces) {
        let res: FetchResponse;
        try {
            res = await fetch(`${baseUrl}/pub/v1/scheme/namespaces/${ns}/apps`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                continue;
            };
            const responseJson = await res.json();
            apps.push(...responseJson.result.result);
        } catch {
            throw new Error(await res!.text())
        };
    };
    try {
        const jsonData = <goskeyDocsMeta>JSON.parse(Context.data.goskey_docs_json!);
        for (let item of jsonData.files) {
            const appType = apps.find((app: any) => app.code === item.doc_type);

            if (!appType) {
                item.doc_type = otherDocumentsCode;
                item.doc_ns = otherDocumentsNs;
            } else {
                item.doc_ns = appType.namespace;
            };
        };
        Context.data.goskey_docs_json = JSON.stringify(jsonData);
    } catch (err) {
        throw new Error(`error at parse: ${err.message}`)
    }
};

async function createDocsByFiles(): Promise<void> {
    const jsonData = <goskeyDocsMeta>JSON.parse(Context.data.goskey_docs_json!);
    const staff = await Context.data.signatory_app!.fetch()
    const responsible = await Context.data.__createdBy.fetch();
    const responsibleName = responsible.data.__name;
    const baseUrl = System.getBaseUrl();
    const token = Context.data.token;

    let refItems: RefItem[] = [];

    for (let item of jsonData.files) {
        let context: docContext = {
            responsible_user: [
                responsible.id
            ],
            responsible: responsibleName,
            staff: [
                staff.id
            ],
            __name: item.doc_name,
            line_file_name: item.doc_name,
            __file: [
                item.file_id
            ]
        };
        let createFileResponse: FetchResponse;
        try {
            createFileResponse = await fetch(`${baseUrl}/pub/v1/app/${item.doc_ns}/${item.doc_type}/create`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    context: {
                        responsible_user: [
                            responsible.id
                        ],
                        responsible: responsibleName,
                        staff: [
                            staff.id
                        ],
                        __name: item.doc_name,
                        line_file_name: item.doc_name,
                        __file: [
                            item.file_id
                        ]
                    }
                })
            });
            if (!createFileResponse.ok) {
                delete context["staff"];
                context.kedo_staff = [staff.id];
                createFileResponse = await fetch(`${baseUrl}/pub/v1/app/${item.doc_ns}/${item.doc_type}/create`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(context)
                });
            };
            const responseJson = await createFileResponse.json();
            Context.data.debug = JSON.stringify(responseJson)
            refItems.push(new RefItem(
                item.doc_ns!,
                item.doc_type,
                responseJson.item.__id
            ));

        } catch (err) {
            throw new Error(`Ошибка при создании документа ${item.doc_name}`);
        };
    };
    Context.data.goskey_docs = refItems;
};

async function getCurrentFile(): Promise<void> {
    try {
        const file = await Context.data.goskey_files![Context.data.iteration!++].fetch();
        const fileName = file.data.__name.replace(/\.[^.$]+$/, '');
        Context.data.file = file;
        Context.data.incorrect_file_type = false;
        Context.data.file_name = fileName;
    } catch {
        Context.data.all_files_processed = true;
    }
};

async function refreshFileLink(): Promise<void> {
    const docsJson = <goskeyDocsMeta>JSON.parse(Context.data.goskey_docs_json!);

    if (Context.data.incorrect_file_type) {
        //@ts-ignore
        docsJson.files.filter(item => item.file_id !== Context.data.file!.id);
        Context.data.goskey_docs_json = JSON.stringify(docsJson);
        return;
    };

    //@ts-ignore
    const currentItem = docsJson.files.find(item => item.file_id === Context.data.file!.id);
    //@ts-ignore
    Context.data.debug += ` ${Context.data.file!.id} `
    //@ts-ignore
    currentItem!.file_id = Context.data.processed_file!.id;
    Context.data.goskey_docs_json = JSON.stringify(docsJson);
};

async function runGoskeyProcess(): Promise<void> {
    const staff = await Context.data.signatory_app!.fetch();
    const snils = staff.data.snils;
    const goskeyFiles = Context.data.goskey_docs!.map(item => {
        return {
            namespace: item.namespace,
            code: item.code,
            id: item.id
        }
    });
    const signExpiration = Context.data.limit ? Context.data.limit.format() : new Datetime().addDate(0, 0, 1).format();
    const packageName = Context.data.package_name;
    const userId = staff.data.ext_user!.id;
    const signType = Context.data.goskey_sign_type;
    const baseUrl = System.getBaseUrl();
    const token = Context.data.token;
    let runProcessResponse: FetchResponse;

    try {
        runProcessResponse = await fetch(`${baseUrl}/pub/v1/bpm/template/ext_7fb0a0d0-fc8d-452e-843f-6a7f2f28a8bf/send_docs_to_goskey/run`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                context: {
                    snils,
                    docs_for_sign: goskeyFiles,
                    user: [
                        userId
                    ],
                    sign_expiration: signExpiration,
                    docs_description: packageName,
                    sign_type: [
                        {
                            name: signType!.name,
                            code: signType!.code,
                        }
                    ]
                }
            })
        });
        if (!runProcessResponse.ok) {
            throw new Error(`Ошибка при запуске процесса: ${await runProcessResponse.text()}`);
        };
    } catch (err) {
        Context.data.debug = await runProcessResponse!.text();
    }
};

async function getSignatoryApp(): Promise<void> {
    if (!Context.data.signatories || Context.data.signatories.length == 0) {
        return;
    }

    let staffs = await Namespace.app.staff.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.in(Context.data.signatories!)
        ))
        .size(Context.data.signatories.length)
        .all();

    staffs = staffs.filter(s => s.id != Context.data.signatory_app?.id);

    if (staffs.length != 0) {
        Context.data.staff_chief_app = staffs[0];
    }
}
