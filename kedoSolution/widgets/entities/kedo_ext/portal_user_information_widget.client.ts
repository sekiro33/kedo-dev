
declare const window: any;
declare const document: any;
declare const console: any;

type userSettings = {
    notifications: string,
    provider: string,
    default_page: string
};
type staff = ApplicationItem<Application$kedo$staff$Data, any>;
type position = ApplicationItem<Application$kedo$position$Data, any>;

/** Класс для управления виджетом
 * 
 */
class UserInfoManager {

    constructor() {
        this.userInfoTemplateContent = undefined;
    };

    userInfoTemplateContent: any | undefined

    initWidget() {

        this.userInfoTemplateContent = document.querySelector(".left-menu_user-info");
    }

    async renderWidget() {

        const userInfoName = this.userInfoTemplateContent.querySelector(".left-menu_user-info_data-name");
        const userInfoPosition = this.userInfoTemplateContent.querySelector(".left-menu_user-info_data-position_info");

        userInfoName.textContent = userDataManager.staff.data.full_name ? `${userDataManager.staff.data.full_name.lastname} ${userDataManager.staff.data.full_name.firstname}` : userDataManager.staff.data.__name;
        userInfoPosition.textContent = userDataManager.position ? userDataManager.position.data.__name : "Не определена";

        const userAvatarLeftMenu = document.querySelector(".left-menu_user-info_img");

        if (userDataManager.avatarLink) {
            userAvatarLeftMenu.src = userDataManager.avatarLink;
        };
    };
}

/** Класс, хранящий в себе все данные, относящиеся к текущему пользователю/сотруднику
 * @property user объект типа UserItem, текущий пользователь
 * @property staff объект типа staff (приложение Сотрудники), текущий сотрудник
 * @property organization объект типа organization (приложение Организации), организация сотрудника
 * @property position объект типа position (приложение Позиции ШР), должность сотрудника
 * @property avatarLink ссылка на аватар пользователя
 */
class UserDataManager {

    user: CurrentUserItem;
    staff: staff;
    position: position | undefined;
    avatarLink: string | undefined;
};

async function logout(): Promise<void> {
    await userDataManager.user.logout();
}

function handleAppContainer(target: any) {
    if (!target.classList.contains("qr-modal") && !target.classList.contains("elma-app")) {
        return;
    };
    const appContainer = document.querySelector(".qr-modal");
    appContainer.classList.toggle("hidden");
    closeModalMenu();
};

/** Метод закрывает поповер меню пользователя. */
function closeModalMenu() {
    const elem = document.querySelector('elma-modal-backdrop');
    if (elem) {
        elem.click();
    }
}

let userInfoManager = new UserInfoManager();
let userDataManager = new UserDataManager();

async function onInit(): Promise<void> {
    await getOrRefreshData();
}

async function onLoad() {
    userInfoManager.initWidget();
    userInfoManager.renderWidget();
}

/** Функция используется для получения всех динамических данных, связанных с пользователем (документы, задачи)
 * @param refresh признак того, что идет обновление данных
 * @param refreshTasks признак того, что нужно только обновление задач
 */
async function getOrRefreshData(): Promise<void> {
    
    const currentUser = await System.users.getCurrentUser();
    const currentStaff = await Context.fields.staff_app.app.search().where(f => f.ext_user.in([currentUser])).first();

    if (currentStaff) {
        userDataManager.staff = currentStaff;
        userDataManager.user = <CurrentUserItem>currentUser;
        Context.data.staff_app = currentStaff;
    }
    
    userDataManager.position = userDataManager.staff.data.position ? await userDataManager.staff.data.position.fetch() : undefined;
    userDataManager.avatarLink = userDataManager.user.data.avatar ? await userDataManager.user.data.avatar.getDownloadUrl() : undefined;
};