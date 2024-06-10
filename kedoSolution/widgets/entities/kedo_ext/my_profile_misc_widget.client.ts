declare const console: any;
declare const window: any;
declare const document: any;
declare const filePath: any;
declare const DOMParser: any;
declare const FileReader: any;

type staff = ApplicationItem<Application$kedo$staff$Data, any>;
type organization = ApplicationItem<Application$kedo$organization$Data, any>;
type family = ApplicationItem<Application$kedo$family_composition_app$Data, any>;
type subdivision = ApplicationItem<Application$kedo$structural_subdivision$Data, any>;
type position = ApplicationItem<Application$kedo$position$Data, any>;
type status = ApplicationItem<Application$kedo$statuses$Data, any>;

type category = {
    name: string,
    assignment_date: string,
    expiration_date: string
};

type componentObj = {
    cls: string,
    component: any;
};

type objData = {
    id: string,
    code: string,
    ns: string,
    name: string,
    status: string,
    status_code: string,
    business_type: string,
    render_zone: string,
    created_at: TDatetime,
    item_type: string,
    link: string,
    start_date?: string,
    end_date?: string,
    start_date_obj: TDate | TDatetime,
    end_date_obj: TDate | TDatetime,
    vacation_type?: string,
    vacation_code?: string,
    duration?: number,
    cityId?: string,
    cityName?: string,
    staffId: string,
    work_type?: string,
    type_employment?: string,
};

type userSettings = {
    notifications: string,
    provider: string,
    default_page: string
};

enum LoaderType {
    COMMON = "common",
    MAIN = "main",
    TASKS = "tasks",
    DOCUMENTS = "documents",
    SERVICES = "services",
    BUSINESS_TRIPS = "business_trips",
    VACATIONS = "vacations",
    PROFILE = "profile",
    DOCUMENTS_WIDGET = "personnel_documents_widget",
    ISSUES_WIDGET = "issues_widget",
    VACATION_WIDGET = "vacation_widget",
};

class UserDataManager {
    user: CurrentUserItem;
    staff: staff;
    organization: organization | undefined;
    subdivision: subdivision | undefined;
    position: position | undefined;
    categories: category[];
    family: { name: string, relation: string }[];
    avatarLink: string | undefined;
};

class DomManager {
    constructor() {
        this.userInfoTemplateContent = undefined;
        this.loader = undefined;
        this.parser = new DOMParser();
        this.domLoaded = false;
    };

    parser: typeof DOMParser;
    root: componentObj | undefined;
    loader: componentObj | undefined;
    userInfoTemplateContent: any | undefined
    domLoaded: boolean;

    renderProfileSection() {

        function setMiscItems(event: any) {
            let target = event.target;
            const choice = event.target.dataset["choice"];
            const otherButton = choice === "family" ? document.querySelector("[data-choice='category']") : document.querySelector("[data-choice='family']");
            if (event.target.classList.contains("misc-button-title")) {
                target = choice === "family" ? document.querySelector("[data-choice='family']") : document.querySelector("[data-choice='category']");
            }
            const itemToShow = document.querySelector(`#${choice}`);
            const otherItem = choice === "family" ? document.querySelector("#category") : document.querySelector("#family");
            itemToShow.classList.toggle("hidden");
            otherItem.classList.toggle("hidden");
            [target, otherButton].forEach(item => item.classList.toggle("pressed"));
        }

        if (!Context.data.event_listeners_set) {
            const buttons = document.querySelectorAll(".misc-button");
            buttons.forEach((button: any) => button.addEventListener("click", setMiscItems, true));
        }

        const familyInfoContainer = document.querySelector(".kedo__my-profle_docs-family-info_content");
        const categoryInfoContainer = document.querySelector(".kedo__my-profle_docs-category-info_content");

        refreshContainers([categoryInfoContainer], "misc-info-item-category");
        refreshContainers([familyInfoContainer], "family-info-item");

        if (userDataManager.family && userDataManager.family.length > 0) {
            const familyItemTemplate = document.querySelector(".family-info-item_template");

            for (let item of userDataManager.family) {
                const familyItemContent = familyItemTemplate.content.cloneNode(true);
                const familyItem = familyItemContent.querySelector(".family-info-item");
                const familyItemLabel = familyItem.querySelector(".family-info-item_label");
                const familyItemValue = familyItem.querySelector(".family-info-item_value");

                familyItemLabel.textContent = item.relation
                familyItemValue.textContent = item.name;

                familyInfoContainer.append(familyItem);
            };
        } else {
            const emptyFamilyTemplate = document.querySelector(".kedo__my-profle_docs-family-info_content_empty");
            if (emptyFamilyTemplate.classList.contains("hidden")) {
                emptyFamilyTemplate.classList.toggle("hidden");
            };
        };

        if (userDataManager.categories && userDataManager.categories.length > 0) {
            const categoryItemTemplate = document.querySelector(".misc-info-item-category_template");

            for (let item of userDataManager.categories) {
                const categoryItemContent = categoryItemTemplate.content.cloneNode(true);
                const categoryItem = categoryItemContent.querySelector(".misc-info-item-category");
                const categoryItemValue = categoryItem.querySelector(".misc-info-category_value");

                categoryItemValue.innerHTML = `${item.name} <br>Действует до: ${item.expiration_date}`;

                categoryInfoContainer.append(categoryItem);
            };
        } else {
            // const defaultCategoryTemplate = document.querySelector(".misc-info-item-category");
            // if (defaultCategoryTemplate.classList.contains("hidden")) {
            //     defaultCategoryTemplate.classList.toggle("hidden");
            // };
            const categoryItemTemplate = document.querySelector(".category-info-item_template");
            const categoryItemContent = categoryItemTemplate.content.cloneNode(true);
            const categoryItem = categoryItemContent.querySelector(".default-category");
            categoryInfoContainer.append(categoryItem);
        };

        this.handleLoader(LoaderType.PROFILE);
    };

    handleLoader(loaderType: LoaderType) {
        const waitForLoader = window.setInterval(() => {
            const loader = document.querySelector(`.kedo-loader-wrapper[data-loader=${loaderType}]`);
            if (!loader) {
                return
            };
            window.clearInterval(waitForLoader)
            loader.classList.toggle("hidden");

        }, 100)
    };
}

/**
 * Функция для сброса компонентов внутри контейнеров при обновлении данных страницы
 * @param containers массив с DOM-элементами
 * @param classToDelete при указании класса - удаляет элементы с подходящим классом внутри контейнера
 */
function refreshContainers(containers: any[], classToDelete?: string): void {
    if (classToDelete) {
        Array.from(containers).forEach((container: any) => {
            const nodesToDelete = container.querySelectorAll(`.${classToDelete}`);
            nodesToDelete.forEach((node: any) => {
                node.remove();
            });
        });

        return;
    };

    containers.forEach((container: any) => {
        container.innerHTML = "";
    });
};

/**
 * Функция используется для получения всех динамических данных, связанных с пользователем (документы, задачи)
 * @param refresh признак того, что идет обновление данных
 * @param refreshTasks признак того, что нужно только обновление задач
 */
async function getOrRefreshData(): Promise<void> {

    userDataManager.categories = userDataManager.staff.data.categories_table ? await Promise.all(userDataManager.staff.data.categories_table.map(async row => {
        return {
            name: await row.staff_categories.fetch().then(item => item.data.__name),
            expiration_date: row.expiration_date ? row.expiration_date.format("DD.MM.YYYY") : "Без срока",
            assignment_date: row.assignment_date ? row.assignment_date.format("DD.MM.YYYY") : "Без срока"
        };
    })) : [];

    const userFamily = await Context.fields.family_composition_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.staff.link(userDataManager.staff)
    )).size(100).all().then(data => data.map(item => {
        return {
            name: item.data.full_name ? `${item.data.full_name.lastname} ${item.data.full_name.firstname} ${item.data.full_name.middlename || ""}` : "",
            relation: item.data.relation_degree ? item.data.relation_degree.name : "Не указан"
        };
    }));

    userDataManager.family = userFamily;

    domManager.renderProfileSection();
};

/**
 * Функция используется для отрисовки и обновления компонентов после того, как все данные загрузились (userDataManager.allDocsLoaded = true)
 * @param refresh признако того, что идёт обновление данных
 */
function renderOrRefreshComponents() {
    getOrRefreshData();
    Context.data.event_listeners_set = true;
};

async function getData() {
    const currentUser = await System.users.getCurrentUser();
    const currentStaff = await Context.fields.staff_app.app.search().where(f => f.ext_user.in([currentUser])).first();

    if (currentStaff) {
        userDataManager.staff = currentStaff;
        Context.data.staff_app = currentStaff;
        userDataManager.user = <CurrentUserItem>currentUser;
    }
}

const userDataManager = new UserDataManager();
const domManager = new DomManager();

async function onInit() {
    await getData();
}

async function onLoad() {
    domManager.renderProfileSection();
}