/* Client scripts module */

interface ConnectionData {
    name: string,
    url: string,
    password: string,
    login: string,
}

async function onInit(): Promise<void> {
    const connection_list = getConnectionList();
    ViewContext.data.connection_list = connection_list;
}

/** Получить список баз */
function getConnectionList(): ConnectionData[] {
    const connection_list = Context.data.connection_list_1c;
    const connections: ConnectionData[] = connection_list ? JSON.parse(connection_list) : [];

    return connections;
}

/** Добавить новую базу */
function addConnection(connection: ConnectionData): void {
    const connection_list = getConnectionList();
    connection_list.push(connection);
    Context.data.connection_list_1c = JSON.stringify(connection_list);
}

/** Удалить базу */
function removeConnection(connection: ConnectionData): void {
    let connection_list = getConnectionList();
    connection_list = connection_list.filter(f => f.url !== connection.url);
    Context.data.connection_list_1c = JSON.stringify(connection_list);
}

async function openAddBaseModal(): Promise<void> {
    ViewContext.data.url_1c_odata = "";
    ViewContext.data.login = "";
    ViewContext.data.password = "";

    ViewContext.data.add_base_modal_visible = true;
}

async function hideAddBaseModal(): Promise<void> {
    ViewContext.data.url_1c_odata = "";
    ViewContext.data.login = "";
    ViewContext.data.password = "";

    ViewContext.data.add_base_modal_visible = false;
}

async function addNewBaseButtonOnClick(): Promise<void> {
    ViewContext.data.add_base_error_visible = false;

    const url = ViewContext.data.url_1c_odata?.trim();
    const login = ViewContext.data.login;
    const password = ViewContext.data.password;

    if (!url || !login || !password) {
        ViewContext.data.add_base_error_text = `Заполните обязательные поля`;
        ViewContext.data.add_base_error_visible = true;

        return;
    }

    const base_name = getConnectionName(url);

    const new_connection: ConnectionData = {
        name: base_name,
        url: url,
        login: login,
        password: password,
    };

    const connection_list = getConnectionList();

    const connection_exist = connection_list.find(f => f.url === url);

    if (connection_exist) {
        ViewContext.data.add_base_error_text = `База с указанным URL уже есть в списке`;
        ViewContext.data.add_base_error_visible = true;
        
        return;
    }

    addConnection(new_connection);

    await hideAddBaseModal();
}

async function removeConnectionOnClick(url: string): Promise<void> {
    const connection_list = getConnectionList();
    const connection = connection_list.find(f => f.url === url);

    if (!connection) {
        return;
    }

    removeConnection(connection);
}

function getConnectionName(url: string): string {
    const searchTerm = 'odata/standard.odata';
    const indexOfFirst = url.indexOf(searchTerm);
    const splitLink = url.slice(0, indexOfFirst - 1).split('/')

    if (splitLink.length) {
        return splitLink[splitLink.length - 1]
    }

    return url;
}

async function cancelButtonOnClick(): Promise<void> {
    await hideAddBaseModal();
}

async function connectionListOnChange(): Promise<void> {
    const connection_list = getConnectionList();
    ViewContext.data.connection_list = connection_list;
}
