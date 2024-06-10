import JSZip from "jszip.js"

/* Client scripts module */

declare const console: any;
declare const window: any;
declare const document: any;

const DATETIME_FORMAT = `D MMMM YYYY г., HH:mm`;
const CHUNK_SIZE = 20;

interface IRelatedDocuments {
    namespace: string,
    code: string,
    documents: IDocument[],
}

interface IDocument {
    namespace: string,
    code: string,
    related_field_code: string,
}

interface IElement {
    name: string,
    href: string,
    __createdAt: string,
    ref: {
        namespace: string,
        code: string,
        id: string,
    }
}

class CustomFilter {
    constructor(private filter: any) {
    }

    json() {
        return this.filter;
    }
}

async function onInit(): Promise<void> {
    if (!Context.data.app) {
        console.error("Context.data.app is undefined");
        return;
    }

    const json = await Namespace.storage.getItem("related_documents");

    if (!json) {
        console.error("item 'related_documents' is undefined in module storage");
        return;
    }

    const related_documents: IRelatedDocuments[] = JSON.parse(json);

    const relate = related_documents.find(f => f.namespace == Context.data.app!.namespace && f.code == Context.data.app!.code);

    if (!relate) {
        console.error(`not found row in related documents table. app namespace: ${Context.data.app.namespace}; app code: ${Context.data.app.code}`)
        return;
    }

    Promise.all([
        getRelatedDocuments(relate, Context.data.app)
    ]);
}

function getFilter(field_code: string, field_type: string, app: RefItem): any {
    switch (field_type) {
        case "SYS_COLLECTION": {
            return {
                "and": [
                    {
                        "link": [
                            { "field": field_code },
                            { "list": [app.id] },
                        ]
                    }
                ]
            }
        }

        case "REF_ITEM": {
            return {
                "tf": {
                    [`${field_code}`]: {
                        "id": app.id,
                        "code": app.code,
                        "namespace": app.namespace,
                    }
                }
            }
        }

        default: {
            return undefined;
        }
    }

}

async function searchDocuments(namespace: string, code: string, related_field_code: string, app: RefItem): Promise<any> {
    const field_type = (Namespace as any).factory.Global.ns[namespace].app[code].fields[related_field_code].type;

    return (Namespace as any).factory.Global.ns[namespace].app[code].search()
        .where((f: any) => f.__deletedAt.eq(null))
        .where((f: any) => new CustomFilter(getFilter(related_field_code, field_type, app)))
        .size(100)
        .all();
}

async function getRelatedDocuments(relate: IRelatedDocuments, app: RefItem) {
    const documents = relate.documents;

    console.log("documents", documents);

    if (documents.length == 0) {
        console.log("not found related documents");
        return;
    }

    const apps = documents
        .filter(doc => {
            return (Namespace as any).factory.Global.ns[doc.namespace] != undefined
                && (Namespace as any).factory.Global.ns[doc.namespace].app[doc.code] != undefined;
        })
        .map((doc) => searchDocuments(doc.namespace, doc.code, doc.related_field_code, app));


    const docs = await Promise.all(apps);

    const flat_array = docs.reduce(function (prev, next) {
        return prev.concat(next);
    });

    console.log('flat_array', flat_array);

    let document_list: IElement[] = [];

    document_list = flat_array
        .sort((doc1: any, doc2: any) => doc2.data.__createdAt.asDate() - doc1.data.__createdAt.asDate())
        .map((f: any) => {
            let name: string = f.data.__name;

            if (!name || name.trim() == "") {
                name = "Без названия";
            }

            return {
                ref: {
                    namespace: f.namespace,
                    code: f.code,
                    id: f.id,
                },
                href: `${System.getBaseUrl()}/${relate.namespace}/${relate.code}(p:item/${f.namespace}/${f.code}/${f.id})`,
                name: name,
                __createdAt: f.data.__createdAt.format(DATETIME_FORMAT),
            }
        });

    Context.data.documents_list = document_list;
}

interface IAppData {
    name: string,
    file: FileItem,
    signFiles?: FileItem[],
    xmlFile?: FileItem,
}

async function getSignFiles(app: any): Promise<FileItem[] | undefined> {
    if (!app.getSignHistory) return;

    try {
        const sign_history: EntityVersion[] = await app.getSignHistory();

        if (!sign_history || sign_history.length == 0) return;

        const signs = sign_history[0].signs;
        const signFiles = await Promise.all(signs.map(f => f.createSignFile()));
        return signFiles;
    } catch (err) {
        return;
    }
}

async function getAppData(ref: RefItem): Promise<IAppData | undefined> {
    const app = await ref.fetch();

    if (!app.data.__file) return;

    const file: FileItem = await app.data.__file.fetch();
    const signs = await getSignFiles(app);

    let xml_file: FileItem | undefined;

    if (app.data.xml_file) {
        xml_file = await app.data.xml_file.fetch();
    }

    return <IAppData>{
        name: app.data.__name,
        file: file,
        xmlFile: xml_file,
        signFiles: signs,
    };
}

interface IFileData {
    name: string,
    binaryData: ArrayBuffer,
}

async function getFileContent(file: FileItem): Promise<IFileData> {
    console.log(file);

    const file_download_url = await file.getDownloadUrl();
    const response = await fetch(file_download_url);
    const binary_content = await response.arrayBuffer();

    return <IFileData>{
        name: file.data.__name,
        binaryData: binary_content,
    };
}

async function downloadFiles(): Promise<void> {
    Context.data.loader = true;

    const files: IElement[] = Context.data.documents_list;

    var jszip = new JSZip();

    if (!files || files.length == 0) {
        return;
    }

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const files_pack = files.slice(i, i + CHUNK_SIZE);

        await Promise.all(files_pack.map(async (f) => {
            const ref = new RefItem(f.ref.namespace, f.ref.code, f.ref.id);
            const app_data = await getAppData(ref);

            if (!app_data) return;

            const files = [
                app_data.file,
                ...(app_data.signFiles ?? []),
            ];

            if (app_data.xmlFile) files.push(app_data.xmlFile);

            const files_data = await Promise.all(files
                .filter(f => f != undefined)
                .map(f => getFileContent(f))
            );

            const folder = jszip.folder(app_data.name);

            console.log(folder);

            files_data.forEach(f => folder.file(f.name, f.binaryData, { binary: true }));
        }))

        // await Promise.all(files_pack.map(async (f) => {
        //     const app_ref = new RefItem(f.ref.namespace, f.ref.code, f.ref.id);
        //     const app = await app_ref.fetch();

        //     if (!app.data.__file) return;

        //     const app_file = await app.data.__file.fetch();

        //     const res = await fetch(await app_file.getDownloadUrl());
        //     const content = await res.arrayBuffer();

        //     let file_name = ''
        //     if (app_file.data.__name.includes('.pdf') || app_file.data.__name.includes('.docx')) {
        //         file_name = app_file.data.__name;
        //     }
        //     else {

        //         file_name = app_file.data.__name + app_file.data.line_file_name!.substring(app_file.data.line_file_name!.lastIndexOf('.'), app_file.data.line_file_name!.length);
        //     }
        //     jszip.file(file_name, content);

        // }));
    }

    await jszip.generateAsync({ type: "uint8array" })
        .then(async function (content: any) {
            const file = await Context.fields.archive_file.create(`documents_${new Datetime(new Date()).getDate().format('DD.MM.YYYY')}.zip`, content);
            Context.data.archive_file = file;
            window.location.href = await Context.data.archive_file.getDownloadUrl();
            Context.data.loader = false;
        })
        .catch((error: any) => {
            //TODO: вывод информации о ошибке
            Context.data.loader = false;
        });
}