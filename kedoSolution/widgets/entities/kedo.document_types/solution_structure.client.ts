/* Client scripts module */

import { TreeNode, TreeView, TreeConfig, TreePath } from "sometree.js";

declare const document: any;
declare const console: any;
declare const window: any;

let tree: any;
let leafs: any[] = [];

interface ISolutionStrucutre {
    name: string,
    code: string,
    icon?: string,
    apps: IApp[],
}

interface ISolution {
    name: string,
    code: string,
}

interface IApp {
    name: string,
    code: string,
}

interface INamespace {
    name: string,
    code: string,
    icon?: string,
}

const namespaces: INamespace[] = [
    {
        name: 'КЭДО',
        code: 'kedo',
        icon: `<i class="elma-icons">user_many</i>`,
    },
    {
        name: 'Приказы и заявления',
        code: 'personnel_documents',
        icon: `<i class="elma-icons">file_type_bookmark</i>`,
    }
];

function showLoader(): void {
    Context.data.loader = true;
}

function hideLoader(): void {
    Context.data.loader = false;
}

async function onInit(): Promise<void> {
    Context.data.container_id = generateGuid();

    const token = await Namespace.app.settings.search().where(f => f.code.eq("api_key")).first();

    if (!token) {
        hideLoader();
        throw new Error('Не найден параметр со значением токена в настройках КЭДО. api_key not found');
    }

    if (token && !token.data.value) {
        hideLoader();
        throw new Error('Токен не указан в настройках КЭДО. api_key.value is undefined');
    }

    Context.data.token = token.data.value;

    prepareData();
}

async function prepareData(): Promise<void> {
    showLoader();
    await get_documents_types();
    searchContainter();
    hideLoader();
}

function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function searchContainter() {
    const list = document.querySelector(`#list-container-${Context.data.container_id}`);

    if (list) {
        createTree(list);
    } else {
        window.setTimeout(searchContainter, 500);
    }
}

function createTree(container: any): void {
    const clearSelect = (node: any) => {
        node.setSelected(false);
        Context.data.selected_element = undefined;
    }

    const structure: ISolutionStrucutre[] = Context.data.solution_structure;

    /** Задаем иконки для дочерних элементов дерева, закрывающую и открывающую иконку ветки. */
    TreeConfig.leaf_icon = `<i _ngcontent-ubh-c693="" class="elma-icons md-20">file_type_text</i>`;
    TreeConfig.open_icon = `<i _ngcontent-upa-c222="" class="default elma-icons ng-star-inserted" style="transform: rotate(90deg);">arrow_right</i>`
    TreeConfig.close_icon = `<i _ngcontent-upa-c222="" class="default elma-icons ng-star-inserted">arrow_right</i>`;

    var root = new TreeNode("Список доступных решений");

    root.on("select", clearSelect);

    const selected_element = {
        select: () => { },
        namespace: Context.data.selected_element?.namespace,
        name: Context.data.selected_element?.name,
        code: Context.data.selected_element?.code,
    }

    for (const solution of structure) {
        const node = new TreeNode(solution.name, {
            name: solution.name,
            code: solution.code,
            icon: solution.icon,
        });

        solution.apps.forEach((app: IApp) => {
            const child = new TreeNode(app.name, {
                name: app.name,
                code: app.code,
            });

            child.on("select", (node: any) => {
                const options = node.getOptions();

                Context.data.selected_element = {
                    namespace: solution.code,
                    name: `${solution.name} -> ${options.name}`,
                    code: options.code,
                }
            });

            if (selected_element.code && selected_element.code == app.code) {
                selected_element.select = () => {
                    root.setExpanded(true);
                    node.setExpanded(true);
                    child.setSelected(true);
                }
            }

            node.addChild(child);

            leafs.push(child);
        });

        node.on("select", clearSelect);

        root.addChild(node);
    }

    tree = new TreeView(root, container);

    tree.collapseAllNodes();
    root.setExpanded(true);
    selected_element.select();
    tree.reload();
}

async function get_documents_types(): Promise<void> {
    const solutions = await getSolutionsRequest();

    if (solutions.find(f => f.code == "komandirovki")) {
        namespaces.push({
            name: 'Командировки',
            code: 'business_trips',
            icon: `<i class="elma-icons">vehicle_plane</i>`,
        });
    }

    if (solutions.find(f => f.code == "otpuska")) {
        namespaces.push({
            name: 'Отпуска',
            code: 'absences',
            icon: `<i class="elma-icons">system_brightness</i>`,
        });
        namespaces.push({
            name: 'УРВ',
            code: 'time_tracking',
            icon: `<i class="elma-icons">system_time</i>`,
        });
    }

    Context.data.solution_structure = await get_apps(namespaces);
}

/** Запрос на получение списка решений. */
async function getSolutionsRequest(): Promise<ISolution[]> {
    let solutions: ISolution[] = [];

    try {
        const request = await fetch(`${System.getBaseUrl()}/pub/v1/scheme/solutions`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Context.data.token}`
            }
        });

        if (!request.ok) {
            throw new Error(JSON.stringify(request));
        }

        const response = await request.json();
        solutions = response.result.result as ISolution[];
        return solutions;

    } catch (error) {
        throw new Error(error);
    }
}

async function get_apps(namespaces: INamespace[]): Promise<ISolutionStrucutre[] | undefined> {
    const solution_structure: ISolutionStrucutre[] = [];

    try {
        const requests = namespaces.map(f => fetch(`${System.getBaseUrl()}/pub/v1/scheme/namespaces/${f.code}/apps`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Context.data.token}`
            }
        }));

        await Promise.all(requests)
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(data => data.forEach((d, index) => {
                const apps = d.result.result
                    .filter((f: any) => f.type == "DOCUMENT" && f.__deletedAt == null)
                    .map((f: any) => {
                        return {
                            name: f.name,
                            code: f.code,
                        }
                    });

                const namespace = namespaces[index];

                solution_structure.push({
                    name: namespace.name,
                    code: namespace.code,
                    icon: namespace.icon,
                    apps: apps
                });
            }));

        return solution_structure;
    } catch (error) {
        throw new Error(`Произошла ошибка во время выполнения запроса: ${JSON.stringify({ name: error.name, message: error.message, stack: error.stack })}`);
    }
}

async function selectNode(): Promise<void> {
    collapseNodes();

    if (!Context.data.selected_element) {
        return;
    }

    const root = tree.getRoot();
    const selected_namespace = root.getChildren().find((f: any) => f.getOptions().code == Context.data.selected_element.namespace);
    const selected_app = selected_namespace.getChildren().find((f: any) => f.getOptions().code == Context.data.selected_element.code);

    root.setExpanded(true);
    selected_namespace.setExpanded(true);
    selected_app.setSelected(true);
    tree.reload();
}

async function collapseNodes(): Promise<void> {
    leafs.forEach(f => f.setSelected(false));

    tree.collapseAllNodes();
    tree.getRoot().setExpanded(true);
    tree.reload();
}