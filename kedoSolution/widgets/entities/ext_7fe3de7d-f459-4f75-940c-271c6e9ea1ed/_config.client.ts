/* Client scripts module */

declare const document: any;
declare const console: any;
declare const window: any;

interface ConnectionInfo {
    name: string;
    url: string;
    password: string;
    login: string
}

async function onInit(): Promise<void> {
    fillRelatedDocumentsTable();
}

async function logRealatedDocumentsTable(): Promise<void> {
    const related_documents_json = await Namespace.storage.getItem("related_documents");

    if (!related_documents_json) {
        console.error("related_documents is undefined");
        return;
    }

    const related_documents: IRelatedDocuments[] = JSON.parse(related_documents_json);

    console.log("Related Documents Table", related_documents);
}

async function fillRelatedDocumentsTable(): Promise<void> {
    const related_documents_json = await Namespace.storage.getItem("related_documents");

    let related_documents: IRelatedDocuments[] = [];

    if (related_documents_json) {
        related_documents = JSON.parse(related_documents_json);
    }

    //@ts-ignore
    Context.data.related_documents_table = Context.fields.related_documents_table.create();

    for (const rel_doc of related_documents) {
        const row = Context.data.related_documents_table.insert();

        row.namespace = rel_doc.namespace;
        row.code = rel_doc.code;

        for (const doc of rel_doc.documents) {
            const inner_row = row.documents.insert();

            inner_row.code = doc.code;
            inner_row.namespace = doc.namespace;
            inner_row.related_field_code = doc.related_field_code;
        }
    }

    Context.data.related_documents_table = Context.data.related_documents_table;
}

async function saveNewConnection(): Promise<void> {
    ViewContext.data.pokazat_oshibku = false;
    ViewContext.data.show_warning = false;
    const url = Context.data.url_1c_odata ? Context.data.url_1c_odata.trim() : "";
    const password = Context.data.password;
    const login = Context.data.login;

    if (!url || !password || !login) {
        ViewContext.data.pokazat_oshibku = true;
        return;
    }

    const name = getName(url)

    const newConnection: ConnectionInfo = {
        name,
        url,
        password,
        login
    };

    const existingConnections: ConnectionInfo[] = Context.data.list_of_connected_platforms ? JSON.parse(Context.data.list_of_connected_platforms) : [];
    const exists = existingConnections.find(item => {
        return item.login === newConnection.login && item.password === newConnection.password && item.url === newConnection.url
    })

    if (!!exists) {
        ViewContext.data.show_warning = true;
        return;
    }

    existingConnections.push(newConnection);
    console.log(existingConnections)
    Context.data.list_of_connected_platforms = JSON.stringify(existingConnections);
    renderList()
}

function renderList(): void {
    const container = document.querySelector(".kedo-module__connection-list-container");
    clearList(container)
    const data = Context.data.list_of_connected_platforms ? JSON.parse(Context.data.list_of_connected_platforms) : [];
    console.log(data)

    if (data.length === 0) {
        return;
    }

    for (let i = 0; i < data.length; i++) {
        console.log('rendering item')
        renderItem(data[i], container, data)
    }
}

function getName(url: string): string {
    const searchTerm = 'odata/standard.odata';
    const indexOfFirst = url.indexOf(searchTerm);
    const splitLink = url.slice(0, indexOfFirst - 1).split('/')

    if (splitLink.length) {
        return splitLink[splitLink.length - 1]
    }

    return url
}

function clearList(container: any) {
    try {
        container.innerHTML = ""
    } catch (e) { }
}

function renderItem(itemData: ConnectionInfo, container: any, data: ConnectionInfo[]): void {
    const itemElement = document.querySelector(".kedo-module__connection-item-template").content?.cloneNode(true);
    console.log(itemElement)
    const nameElement = itemElement.querySelector(".kedo-module__item-name");
    nameElement.innerText = itemData.name;

    const deleteElement = itemElement.querySelector(".kedo-module__item-control-icons");
    deleteElement.addEventListener("click", () => {
        const newData = data.filter(item => {
            return item.name != itemData.name && item.url != itemData.url
        })

        const stringData = JSON.stringify(newData)
        Context.data.list_of_connected_platforms = stringData
        renderList()
    })
    console.log(itemElement)
    container.append(itemElement)

}

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

async function saveRelatedDocuments(): Promise<void> {
    const table = Context.data.related_documents_table!;

    const relates: IRelatedDocuments[] = [];

    for (const row of table) {
        const reltate_row: IRelatedDocuments = {
            namespace: row.namespace,
            code: row.code,
            documents: [],
        }

        row.documents.forEach((f: any) => reltate_row.documents.push({
            namespace: f.namespace,
            code: f.code,
            related_field_code: f.related_field_code,
        }));

        relates.push(reltate_row);
    }

    await Namespace.storage.setItem("related_documents", JSON.stringify(relates));

    window.alert("Даннные успешно обновлены");
}
