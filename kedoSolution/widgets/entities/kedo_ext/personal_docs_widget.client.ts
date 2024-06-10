declare const console: any;
declare const window: any;
declare const document: any;
declare const navigator: any;
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
    uploadableComponents: componentObj[];
    domLoaded: boolean;

    renderProfileSection(refresh = false) {

        async function copyToClipboard(textToCopy: string) {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;

                textArea.style.position = "absolute";
                textArea.style.left = "-999999px";

                document.body.prepend(textArea);
                textArea.select();

                try {
                    document.execCommand('copy');
                } catch (error) {
                    console.error(error);
                } finally {
                    textArea.remove();
                }
            }
        }

        function copyPassportData(copyAllData = false) {
            const allPassportNodes = document.querySelectorAll(".passport-info-item");
            let copyString = "";

            allPassportNodes.forEach((node: any) => {
                const nodeTitle = node.querySelector(".passport-info-item_label").textContent.trim();
                const nodeValue = node.querySelector(".passport-info-item_value").textContent.trim();

                copyString += `${nodeTitle}: ${nodeValue} `;
            });

            copyToClipboard(copyString.trim());

            if (copyAllData) {
                return copyString.trim();
            };
        };

        function copyAll() {
            let copyString = copyPassportData(true);
            const miscValues = document.querySelectorAll(".kedo__my-profle_docs-other-info_item");

            miscValues.forEach((node: any) => {
                const nodeLabel = node.querySelector(".other-info_text");
                const nodeValue = node.querySelector(".kedo__my-profle_docs-other-info_item-content");

                copyString += `${nodeLabel.textContent.trim()}: ${nodeValue.textContent.trim()} `;
            });

            console.log("Скопировано!");
            console.log(copyString);

            if (copyString)
                copyToClipboard(copyString.trim());
        };

        function copyMiscData(event: any) {

            console.log(event);

            const miscValue = event.target.parentElement.parentElement.nextElementSibling.textContent;

            copyToClipboard(miscValue);

            console.log("Скопировано!");
            console.log(miscValue);
        };

        if (!Context.data.event_listeners_set) {
            const copyAllButton = document.querySelector(".kedo__my-profile_docs-copy-all");
            if (copyAllButton) {
                copyAllButton.addEventListener("click", copyAll);
            }

            const copyPasportButton = document.querySelector(".kedo__my-profle_docs-passport-info-copy");
            if (copyPasportButton) {
                copyPasportButton.addEventListener("click", copyPassportData);
            }

            const otherInfoCopyButtons = document.querySelectorAll(".other-info-copy");
            otherInfoCopyButtons.forEach((button: any) => button.addEventListener("click", (event: any) => copyMiscData(event)));
        }

        const snilsNode = document.querySelector(".snils");
        const tinNode = document.querySelector(".inn");
        const passportInfoContainers = Array.from(document.querySelectorAll(".passport-info-item_value")) as any[];

        passportInfoContainers.find(node => node.id == "passport-name").innerText = userDataManager.staff.data.__name;
        passportInfoContainers.find(node => node.id == "passport-gender").innerText = userDataManager.staff.data.sex ? "Мужской" : "Женский";
        passportInfoContainers.find(node => node.id == "passport-birthday").innerText = userDataManager.staff.data.date_of_birth ? userDataManager.staff.data.date_of_birth.format("DD.MM.YYYY") : "Не указана";
        passportInfoContainers.find(node => node.id == "passport-birthplace").innerText = this.formatAddress(userDataManager.staff.data.address as string) || "Не указан";
        passportInfoContainers.find(node => node.id == "passport-number").innerText = `${userDataManager.staff.data.passport_series} ${userDataManager.staff.data.passport_number}`;
        passportInfoContainers.find(node => node.id == "passport-issue-date").innerText = userDataManager.staff.data.date_of_issue ? userDataManager.staff.data.date_of_issue.format("DD.MM.YYYY") : "Не указана";
        passportInfoContainers.find(node => node.id == "passport-subdivision").innerText = userDataManager.staff.data.passport_department_code;
        passportInfoContainers.find(node => node.id == "passport-issue-department").innerText = userDataManager.staff.data.issued_by;

        snilsNode.textContent = userDataManager.staff.data.snils || "Не указан";
        tinNode.textContent = userDataManager.staff.data.inn || "Не указан";

        !refresh && this.handleLoader(LoaderType.PROFILE);
    };

    formatAddress(address: string) {
        //если нам не предоставили адрес или в адресе нет переносов (значит он внесён вручную), тогда выходим
        if (!address) {
            return undefined;
        }

        if (!address.includes("\n")) {
            return address;
        }

        //разбиваем строку адреса на элементы (с разделителем переход на следующую строку)
        let addressArray = address.split("\n");
        let addressLine = "";
        //выполняем манипуляции
        addressArray.forEach((item: string) => { if (item !== "") addressLine += item.replace(",", "").trim() + ", " });
        //убираем последнюю запятую
        addressLine = addressLine.slice(0, addressLine.length - 4);
        addressLine = addressLine.replace(", , ", ", ");

        return addressLine;
    }

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
 * Функция используется для получения всех динамических данных, связанных с пользователем (документы, задачи)
 * @param refresh признак того, что идет обновление данных
 * @param refreshTasks признак того, что нужно только обновление задач
 */
async function getOrRefreshData(refresh = false): Promise<void> {

    userDataManager.position = userDataManager.staff.data.position ? await userDataManager.staff.data.position.fetch() : undefined;

    userDataManager.organization = await Context.fields.staff_app.app.fields.organization.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(userDataManager.staff.data.organization!.id)
    )).first();
    userDataManager.subdivision = await Context.fields.staff_app.app.fields.structural_subdivision.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(userDataManager.staff.data.structural_subdivision!.id)
    )).first();

    userDataManager.avatarLink = userDataManager.user.data.avatar ? await userDataManager.user.data.avatar.getDownloadUrl() : undefined;

    domManager.renderProfileSection(refresh);
};

/**
 * Функция используется для отрисовки и обновления компонентов после того, как все данные загрузились (userDataManager.allDocsLoaded = true)
 * @param refresh признако того, что идёт обновление данных
 */
function renderOrRefreshComponents() {
    getOrRefreshData(true);
    Context.data.event_listeners_set = true;
};

async function getData() {
    const currentUser = await System.users.getCurrentUser();
    const currentStaff = await Context.fields.staff_app.app.search().where(f => f.ext_user.in([currentUser])).first();

    if (currentStaff) {
        userDataManager.staff = currentStaff;
        Context.data.staff_app = currentStaff;
        userDataManager.user = <CurrentUserItem>currentUser;

        userDataManager.organization = await Context.fields.staff_app.app.fields.organization.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(userDataManager.staff.data.organization!.id)
        )).first();
        userDataManager.subdivision = await Context.fields.staff_app.app.fields.structural_subdivision.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.eq(userDataManager.staff.data.structural_subdivision!.id)
        )).first();

        userDataManager.avatarLink = userDataManager.user.data.avatar ? await userDataManager.user.data.avatar.getDownloadUrl() : undefined;
        userDataManager.position = userDataManager.staff.data.position ? await userDataManager.staff.data.position.fetch() : undefined;
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