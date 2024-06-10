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
    allStaff: staff[];
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

    async renderProfileSection() {

        if (!Context.data.event_listeners_set) {
            const changeUserDataButton = document.querySelector(".kedo__my-profle_header-title-button");
            changeUserDataButton.href = `${window.location.href}(p:run/kedo.employees_personal_data/processing_application_personal_data;values=%7B%7D;silentRun=true)`;
        };

        const settingsModal = document.querySelector(".settings_modal-container");
        const emailValue = document.querySelector(".work-content-item.email .work-content-item_info-value");
        const phoneValue = document.querySelector(".work-content-item.phone .work-content-item_info-value");
        const organizationValue = document.querySelector(".work-content-item.organization .work-content-item_info-value");
        const subdivisionValue = document.querySelector(".work-content-item.subdivision .work-content-item_info-value");
        const userPositionNode = document.querySelector(".user-position");
        const userAvatarContainer = document.querySelector(".kedo__my-profle_header-user-avatar");

        if (userDataManager.avatarLink) {
            userAvatarContainer.src = userDataManager.avatarLink;
        };

        userPositionNode.textContent = userDataManager.position ? userDataManager.position.data.__name : "Должность не указана";

        emailValue.textContent = userDataManager.staff.data.email ? userDataManager.staff.data.email.email : "Не указан";
        phoneValue.textContent = userDataManager.staff.data.phone ? userDataManager.staff.data.phone.tel : "Не указан";

        organizationValue.textContent = userDataManager.organization ? userDataManager.organization.data.__name : "Не указана";
        subdivisionValue.textContent = userDataManager.subdivision ? userDataManager.subdivision.data.__name : "Не указано";

        if (userDataManager.staff.data.notification) {
            const notificationsRadio = document.querySelectorAll(".notification-item input");
            const notificationToSelect = <any>Array.from(notificationsRadio).find((node: any) => userDataManager.staff.data.notification!.code === node.value);

            if (notificationToSelect) {
                notificationToSelect.click();
            };

            notificationsRadio.forEach((node: any) => node.addEventListener("change", async () => {
                const notificationValue = userDataManager.staff.fields.notification.data.variants.find(variant => variant.code === node.value);
                if (notificationValue) {
                    userDataManager.staff.data.notification = { name: notificationValue.name, code: <any>notificationValue.code };
                    await userDataManager.staff.save();
                };
            }));
        };

        const avatarSvgButton = document.querySelector(".avatar-container_svg");
        const avatarInput = document.querySelector(".avatar-file-input")

        if (!Context.data.event_listeners_set) {

            avatarSvgButton.addEventListener("click", () => {
                avatarInput.click();
            });

            avatarInput.addEventListener("change", () => {
                const reader = new FileReader();
                const file = avatarInput.files[0];
                reader.readAsDataURL(file);
                reader.onload = async function () {
                    const [imgBase64, imgDataUrl] = [reader.result.split(",")[1], reader.result];
                    Context.data.avatar_base64 = imgBase64;

                    [userAvatarContainer].forEach((img: any) => {
                        img.src = imgDataUrl;
                    });

                    await Server.rpc.setUserAvatar();
                };
                reader.onerror = function (error: any) {
                    console.log('error: ', error);
                };
            });
        }

        const userNameContainer = document.querySelector(".user-name");

        userNameContainer.textContent = userDataManager.staff.data.__name;

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
 * Класс, хранящий в себе глобальные объекты, прямо или косвенно связанные с пользователем/сотрудником, необходимые для отрисовки компонентов
 */
class SystemDataManager {
    statuses: status[];
    users: UserItem[];
    allEmploymentPlacements: ApplicationItem<Application$kedo$employment_directory$Data, any>[];
    allOrgs: ApplicationItem<Application$kedo$organization$Data, any>[];
    allStructuralSubdivisions: ApplicationItem<Application$kedo$structural_subdivision$Data, any>[];
    allStaff: staff[];
};

/**
 * Функция используется для получения всех динамических данных, связанных с пользователем (документы, задачи)
 * @param refresh признак того, что идет обновление данных
 * @param refreshTasks признак того, что нужно только обновление задач
 */
async function getOrRefreshData(): Promise<void> {

    userDataManager.organization = await Context.fields.staff_app.app.fields.organization.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(userDataManager.staff.data.organization!.id)
    )).first();
    userDataManager.subdivision = await Context.fields.staff_app.app.fields.structural_subdivision.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(userDataManager.staff.data.structural_subdivision!.id)
    )).first();

    userDataManager.position = userDataManager.staff.data.position ? await userDataManager.staff.data.position.fetch() : undefined;
    userDataManager.avatarLink = userDataManager.user.data.avatar ? await userDataManager.user.data.avatar.getDownloadUrl() : undefined;

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

const userDataManager = new UserDataManager();
const systemDataManager = new SystemDataManager();
const domManager = new DomManager();

async function onInit() {
    await getData();
}

async function onLoad() {
    domManager.renderProfileSection();    
}