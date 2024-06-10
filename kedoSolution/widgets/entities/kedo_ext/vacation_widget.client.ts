
declare const window: any;
declare const document: any;
declare const console: any;

enum DocType {
    PERSONAL = "personal_data",
    ISSUE = "issue",
    VACATION = "vacation",
    BUSINESS_TRIP = "business_trip"
};
enum LoaderType {
    COMMON = "common",
    MAIN = "main",
    TASKS = "tasks",
    DOCUMENTS = "documents",
    SERVICES = "services",
    SERVICE_DESK = "service_desk",
    BUSINESS_TRIPS = "business_trips",
    VACATIONS = "vacations",
    PROFILE = "profile",
    DOCUMENTS_WIDGET = "personnel_documents_widget",
    ISSUES_WIDGET = "issues_widget",
    VACATION_WIDGET = "top_vacation_widget",
};

const monthReference = {
    "1": "Января",
    "2": "Февраля",
    "3": "Марта",
    "4": "Апреля",
    "5": "Мая",
    "6": "Июня",
    "7": "Июля",
    "8": "Августа",
    "9": "Сентября",
    "10": "Октября",
    "11": "Ноября",
    "12": "Декабря"
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
    work_type?: string
};
type staff = ApplicationItem<Application$kedo$staff$Data, any>;
type status = ApplicationItem<Application$kedo$statuses$Data, any>;

const today = new TDate();
let vacation_manager: VacationManger;
let userDataManager: UserDataManager;
let serializer: Serializer;
let systemDataManager: SystemDataManager;

let closestVacation: objData | undefined;
let current_url = window.location.href;

async function onLoad(): Promise<void> {

    // Инициализация классов
    vacation_manager = new VacationManger();
    userDataManager = new UserDataManager();
    serializer = new Serializer();
    systemDataManager = new SystemDataManager();

    // Получение текущего пользователя, поиск всех сотрудников, получение токена и закгрузка данных
    const [currentUser, allStaff, key_option] = await Promise.all([
        System.users.getCurrentUser(),
        Context.fields.staff_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all(),
        Context.fields.settings_app.app.search().where(f => f.code.eq("api_key")).first(),
        getAllData()
    ]);
    if (key_option) {
        console.log("VacationWidget: token found");
        Context.data.token = key_option.data.value;
    };
    // Поиск текущего сотрудника
    const currentStaff = allStaff.find(staff => staff.data.ext_user && staff.data.ext_user.id === currentUser.id);

    // Если нет сотрудника
    // if (!currentStaff) {
    //     const waitForContainer = window.setInterval(() => {

    //         const unemployedContainer = document.querySelector("#empty-staff");

    //         if (!unemployedContainer) {
    //             console.log("no unemployed container")
    //             return;
    //         };

    //         window.clearInterval(waitForContainer);
    //         unemployedContainer.classList.remove("hidden");
    //     }, 100);
    //     return;
    // };
    userDataManager.staff = currentStaff!;
    Context.data.staff_app = currentStaff;
    userDataManager.user = <CurrentUserItem>currentUser;
    userDataManager.isInnerUser = currentStaff && !currentStaff.data.staff_access || false;

    // Загрузка данных
    getOrRefreshData();
}

/**
 * Функция используется для получения константных данных, после чего вызывается getOrRefreshData для получения данных, которые динамически меняются
 */
async function getAllData(): Promise<void> {

    // Получение статусов
    const allStatuses = await Context.fields.statuses_app.app.search().where(f => f.__deletedAt.eq(null)).size(100).all();
    systemDataManager.statuses = allStatuses;
}

/**
 * Функция используется для получения динамических данных, связанных с пользователем
 * @param refresh признак того, что идет обновление данных
 */
async function getOrRefreshData(refresh = false): Promise<void> {

    // Получение всех отпусков
    const allVacations = await Context.fields.vacations_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.kedo_staff.link(userDataManager.staff)
    )).size(1000).all().then(res => res.map(item => serializer.serializeObjData(item))).then(res => res.sort((a, b) => {
        if (!a.start_date_obj || !b.start_date_obj) {
            return 0;
        };
        //@ts-ignore
        if (a.start_date_obj.before(b.start_date_obj)) {
            return -1;
        }
        //@ts-ignore
        if (a.start_date_obj.after(b.start_date_obj)) {
            return 1;
        };
        return 0;
    }));
    userDataManager.vacations = allVacations;
    vacation_manager.renderWidget(refresh);
}

/**
 * Класс, хранящий в себе глобальные объекты, прямо или косвенно связанные с пользователем/сотрудником, необходимые для отрисовки компонентов
 */
class SystemDataManager {
    statuses: status[];
    users: UserItem[];
    allOrgs: ApplicationItem<Application$kedo$organization$Data, any>[];
    allStructuralSubdivisions: ApplicationItem<Application$kedo$structural_subdivision$Data, any>[];
    allStaff: staff[];
    allCities: { id: string, name: string }[];
};

/**
 * Класс, методы которого используются для сериализации данных
 * @property userDataManager экземпляр класса UserDataManager
 * @property systemDataManager экземпляр класса SystemDataManager
 */
class Serializer {
    userDataManager: UserDataManager;

    setManagers(dataManager: UserDataManager) {
        this.userDataManager = dataManager;
    };

    /**
     * Приводит ФИО к строчному формату Фамилия И.О.
     * @param user пользователь
     */
    serializeName(user: UserItem): string {
        return user.data.fullname && user.data.fullname.lastname && user.data.fullname.middlename
            ? `${user.data.fullname.lastname} ${user.data.fullname.firstname[0]}. ${user.data.fullname.middlename[0]}.`
            : user.data.fullname && user.data.fullname.lastname ? `${user.data.fullname.lastname} ${user.data.fullname.firstname[0]}.` : user.data.__name;
    };

    /**
     * Преобразует объект к типу objData
     * @param item объект приложения, унаследованный от BaseItem
     */
    serializeObjData(item: any): objData {

        const linkCode = item.code === "holidays" ? "vacations" : item.code === "business_trips" ? "businesstrip_requests" : item.code;
        const linkNs = item.code === "holidays" ? "absences" : item.code === "business_trips" ? "business_trips" : item.namespace;
        const itemStatus = item.data.kedo_status ? systemDataManager.statuses.find(s => s.id === item.data.kedo_status.id) : undefined;
        // const referenceCity = userDataManager.businessTripsRefs.find(city => city.objId === item.id);
        const dateArray = item.code === "overtime_work" ? item.data.start_date ? new Datetime(item.data.start_date).format("DD.MM.YYYY").split(".").map(Number) : item.data.date ? new Datetime(item.data.date).format("DD.MM.YYYY").split(".").map(Number) : undefined : undefined;

        return <objData>{
            id: item.id,
            name: item.data.__name,
            code: item.code === "business_trips" ? "businesstrip_requests" : item.code === "holidays" ? "vacations" : item.code,
            ns: item.code === "business_trips" ? item.code : item.code === "holidays" ? "absences" : item.namespace,
            status: itemStatus ? itemStatus.data.name : item.data.__status && item.data.__status.status ? item.data.__status.status.name : "Не определён",
            status_code: itemStatus ? itemStatus.data.code : item.data.__status && item.data.__status.status ? item.data.__status.status.code : "not implemented",
            item_type: DocType.VACATION,
            created_at: item.code === "overtime_work" ? new Datetime(item.data.__createdAt) : item.data.__createdAt,
            link: `${window.location.href}(p:item/${linkNs}/${linkCode}/${item.id})`,
            start_date: item.code === "business_trips" ? item.data.start_date_string : item.code === "holidays" ? item.data.start_string || item.data.rest_day_first && item.data.rest_day_first.format("DD.MM.YYYY") : item.code === "overtime_work" && item.data.start_date_string ? item.data.start_date_string.split(",").length > 1 ? item.data.start_date_string.split(",")[0] : item.data.start_date_string : item.data.date_start ? item.data.date_start.format("DD.MM.YYYY"): item.data.__createdAt.format ? item.data.__createdAt.format("DD.MM.YYYY") : undefined,
            end_date: item.code === "business_trips" ? item.data.end_date_string : item.code === "holidays" ? item.data.end_string || item.data.rest_day_second && item.data.rest_day_second.format("DD.MM.YYYY") || item.data.rest_dat_first && item.data.rest_day_first.format("DD.MM.YYYY") : item.data.date_end ? item.data.date_end.format("DD.MM.YYYY") : item.data.date_start ? item.data.date_start.format("DD.MM.YYYY") : item.data.__createdAt.format ? item.data.__createdAt.format("DD.MM.YYYY") : undefined,
            start_date_obj: item.code === "business_trips" ? item.data.start_date : item.code === "holidays" ? item.data.start ?? item.data.rest_day_first : item.code === "overtime_work" && dateArray ? new TDate(dateArray[2], dateArray[1], dateArray[0]) : item.code === "dismissal_app" ? item.data.date_of_dismissal : item.data.date_start ?? item.data.__createdAt,
            end_date_obj: item.code === "business_trips" ? item.data.end_date : item.code === "holidays" ? item.data.end ?? item.data.rest_day_second ?? item.data.rest_day_first : item.data.date_end ?? item.data.date_end ?? item.data.__createdAt,
            vacation_type: item.code === "holidays" && item.data.type_of ? item.data.type_of.name : undefined,
            vacation_code: item.code === "holidays" && item.data.type_of ? item.data.type_of.code : undefined,
            duration: item.code === "holidays" ? item.data.amount_of_days : item.code === "business_trips" ? item.data.duration : undefined,
            staffId: item.data.kedo_staff ? item.data.kedo_staff.id : undefined,
            work_type: item.data.work_type || ""
        };
    };
};

/**
 * Класс, хранящий в себе все данные, относящиеся к текущему пользователю/сотруднику
 * @property user объект типа UserItem, текущий пользователь
 * @property staff объект типа staff (приложение Сотрудники), текущий сотрудник
 * @property vacations отпуска в формате objData
 * @property allStaff массив с объектами типа staff (приложение Сотрудники), все сотрудники
 * @property isInnerUser признак того, что пользователь является внутренним
 */
class UserDataManager {
    constructor() {
        this.vacations = [];
    };

    user: CurrentUserItem;
    staff: staff;
    vacations: objData[];
    allStaff: staff[];
    isInnerUser: boolean;
}

class VacationManger {

    // Инициализация виджета
    async renderWidget(refresh = false) {

        const newVacationMainButton = document.querySelector(".info-row_plan-link");        // Кнопка "Запланировать"
        newVacationMainButton.href = `${window.location.href}(p:item/absences/vacations)`;  // Указываем ссылку на форму создания

        // Процесс перенести отпуск
        async function runProcess() {
            closeModalRechedule();
            const runProcessResponse = await fetch(`${System.getBaseUrl()}/pub/v1/bpm/template/absences.vacations/reschedule_vacation/run`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${Context.data.token!}`
                },
                body: JSON.stringify({
                    context: {
                        kedo_staff: [
                            userDataManager.staff.id
                        ],
                        vacations: [
                            closestVacation!.id
                        ]
                    }
                })
            });
            if (!runProcessResponse.ok) {
                console.log(await runProcessResponse.text());
            } else {
                console.log(await runProcessResponse.json());
            }
        };

        const vacationContainer = document.querySelector(".main-page_vacation-widget");             // Виджет
        const planAmountElement = vacationContainer.querySelector(".info-row_plan-amount_value");   // Накоплено дней
        this.changeElement(planAmountElement, `${userDataManager.staff.data.remaining_vacation_days || 0} ${getNoun(userDataManager.staff.data.remaining_vacation_days || 0, "день", "дня", "дней")}`, true);

        closestVacation = userDataManager.vacations.find(vac => vac.start_date_obj && vac.start_date_obj.after(today.asDatetime(new TTime()))); // Поиск отпусков

        if (closestVacation) {

            const [startDay, startMonth] = closestVacation.start_date!.split(".");
            const closestVacationElement = vacationContainer.querySelector(".info-row_label-text-start");    // Дата начала
            const vacationRescheduleElement = vacationContainer.querySelector(".info-row_closest-link");     // Кнопка "Перенести отпуск"
            const vacationRescheduleElementButton = document.querySelector(".info-row_closest-link.button-vacation-reschedule");     // Кнопка "Перенести отпуск"
            const vacationDurationElement = vacationContainer.querySelector(".info-row_closest_value");      // Количество дней ближ. отпуска текст
            this.changeElement(vacationDurationElement, `${closestVacation.duration ?? 1} ${getNoun(closestVacation.duration ?? 1, "день", "дня", "дней")}`);
            this.changeElement(closestVacationElement, `C ${startDay.replace("0", "")} ${(<any>monthReference)[startMonth.replace("0", "")].toLowerCase()}`, true);

            if (vacationRescheduleElement.classList.contains("hidden")) {
                this.handleHiddenElement(vacationRescheduleElement)
            };

            !refresh && vacationRescheduleElementButton && vacationRescheduleElementButton.addEventListener("click", runProcess);

            if (closestVacationElement.classList.contains("hidden")) {
                this.handleHiddenElement(closestVacationElement)
            };
        }
        else {
            const vacationDurationElement = vacationContainer.querySelector(".info-row_closest");   // Количество дней ближ. отпуска
            const emptyVacationElement = vacationContainer.querySelector(".empty-vacation");        // Текст, если отпуска нет

            if (!vacationDurationElement.classList.contains("hidden")) {
                this.handleHiddenElement(vacationDurationElement);
            }
            if (emptyVacationElement.classList.contains("hidden")) {
                this.handleHiddenElement(emptyVacationElement);
            }
        };

        !refresh && this.handleLoader(LoaderType.VACATION_WIDGET);
    }
    /** Включает/выключает анимацию загрузки страницы
   * @param loader тип загрузчика, выборка по атрибуту data-loader
   */
    handleLoader(loaderType: LoaderType) {
        const loader = document.querySelector(`.kedo-loader-wrapper[data-loader=${loaderType}]`);
        if (loader) {
            loader.classList.toggle("hidden");
        }
        else {
            const waitForLoader = window.setInterval(() => {
                const loader = document.querySelector(`.kedo-loader-wrapper[data-loader=${loaderType}]`);
                if (!loader) {
                    return;
                };
                window.clearInterval(waitForLoader)
                loader.classList.toggle("hidden");

            }, 100);
        }

    };

    /**
     * Метод для добавления/удаления класса .hidden для элемента
     * @param element DOM-элемент
     */
    handleHiddenElement(element: any) {
        element.classList.toggle("hidden");
    };

    /**
     * Метод для изменения DOM-элемента
     * @param element элемент для изменения
     * @param content контент для вставки в редактируемый элемент (DOM-элемент или строка в случае textContent = true)
     * @param textContent признак, что вставляемый контент имеет строчный тип
     * @param className присваивает класс для корневого элемента element
     */
    changeElement(element: any, content: any, textContent = false, className?: string) {

        textContent ? element.textContent = content : element.innerHTML = content;

        if (className) {
            element.firstChild.classList ? element.firstChild.classList.add(className) : element.className = className
        };
    };
}

/** Метод закрывает поповер перенесения отпуска. */
function closeModalRechedule() {
    const elem = document.querySelector('elma-modal-backdrop');
    elem.click();
}

/** Метод создает окончание для числа
 * @param {number} number Число
 * @param {string} number Окончание для 1, 21 ... n1
 * @param {string} number Окончание для 2 - 4, 22 - 30, ..., n2 - n0
 * @param {string} number Окончание для 5 - 20
 */
function getNoun(number: number, one: string, two: string, five: string): string {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    };
    n %= 10;
    if (n === 1) {
        return one;
    };
    if (n >= 2 && n <= 4) {
        return two;
    };
    return five;
};