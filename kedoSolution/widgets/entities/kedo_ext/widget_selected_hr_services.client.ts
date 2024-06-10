declare const document: any;
declare const window: any;
declare const console: any;

type service = {
    name: string,
    code: string,
    link: string,
};
type newIssueConstructor = {
    name: string,
    code?: string,
    expandable: boolean,
    issue_type?: string,
    issues?: newIssueConstructor[]
    link?: string
};
type serviceLinkConstructor = {
    name: string,
    ns: string,
    code: string,
    fieldToChange?: string,
    fieldValue?: any
};

let service_manager: ServiceManager;
let userStorageManager: UserStorageManager;

class ServiceManager {

    constructor(userManager: UserStorageManager) {
        this.userManager = userManager;
    };

    userManager: UserStorageManager;

    /** Отрисовка заявок */
    renderServices() {

        this.renderFavorites();

        // Получение шаблонов и окна отображения сервисов для выбора
        const favoriteServicesChoiceContainer = document.querySelector(".services-page_main-content_choices-content");
        const favoriteServiceColumnTemplate = document.querySelector(".favorite-services_choice_column_template");
        const favoriteServiceItemTemplate = document.querySelector(".favorite-services_choice_column-item_template");

        defaultIssues.forEach(issue => {

            const newColumnLabelContent = favoriteServiceColumnTemplate.content.cloneNode(true);
            const newColumnLabelItem = newColumnLabelContent.querySelector(".favorite-services_choice_column");
            const newColumnLabel = newColumnLabelItem.querySelector("h4");

            // Добавление имени сервиса
            newColumnLabel.textContent = issue.name;

            if (issue.expandable && issue.issues) {

                issue.issues.forEach(listIssue => {

                    // Если сервис - отпуска
                    if (listIssue.code && issue.issue_type === "vacation") {

                        const favoriteIssueContent = favoriteServiceItemTemplate.content.cloneNode(true);
                        const favoriteIssueItem = favoriteIssueContent.querySelector(".favorite-services_choice_column-item");
                        const favoriteIssueLabel = favoriteIssueContent.querySelector(".favorite-services_choice_column-item_label");

                        favoriteIssueItem.dataset["service_code"] = listIssue.code;
                        favoriteIssueLabel.textContent = listIssue.name;
                        this.renderComponent(newColumnLabelItem, favoriteIssueContent);

                        return;
                    };

                    const favoriteIssueContent = favoriteServiceItemTemplate.content.cloneNode(true);
                    const favoriteIssueLabel = favoriteIssueContent.querySelector(".favorite-services_choice_column-item_label");
                    const favoriteIssueItem = favoriteIssueContent.querySelector(".favorite-services_choice_column-item");

                    favoriteIssueLabel.textContent = listIssue.name;
                    favoriteIssueItem.dataset["service_code"] = listIssue.code;

                    this.renderComponent(newColumnLabelItem, favoriteIssueContent);
                });
            }

            this.renderComponent(favoriteServicesChoiceContainer, newColumnLabelItem);
        });

        const saveServicesButton = document.querySelector(".services-save-button");
        userStorageManager.setTempServices();

        if (userStorageManager.servicesCount > 5) {
            saveServicesButton.classList.toggle("blocked");
        };

        // Добавление слушателя на кнопку "Добавить"
        saveServicesButton.addEventListener("click", () => {
            userStorageManager.addServices();
            closeServices();
        });
    }

    /** Отрисовка избранных сервисов
    * @param refresh признак, что необходимо обновление контейнера при обновлении страницы
    */
    renderFavorites(refresh = false) {

        // Получение контейнера с избранными сервисами
        const favoriteServicesContainer = document.querySelector(".services-page_main-content_favorites_choice");

        refresh && refreshContainers([favoriteServicesContainer])

        // Получение шаблонов для создания элементов
        const serviceTemplate = document.querySelector(".services-widget_item-template");
        const favoriteServiceTemplate = document.querySelector(".favorite_services-widget_item-template");

        const services = this.userManager.getServices();

        console.log("1");

        services.forEach(service => {

            console.log("2");

            // Если есть код
            if (service.code) {
                console.log("3");
                const fixedLink = document.querySelector(`.fixed-vacations .${service.code}-vacation`);
                //const fixedFavoriteLink = Context.data.for_viewing_only ? serviceTemplate.content.cloneNode(true) : favoriteServiceTemplate.content.cloneNode(true);
                const fixedFavoriteLink = serviceTemplate.content.cloneNode(true);
                const favoriteServiceName = fixedFavoriteLink.querySelector(".services-widget_item-label");
                const fixedFavoriteItem = fixedFavoriteLink.querySelector(".services-widget_item");

                fixedFavoriteItem.dataset["service_code"] = service.code;
                favoriteServiceName.textContent = service.name;

                // Если разрешено редактирование, то добавляем слушателя на кнопку удаления
                if (!Context.data.for_viewing_only) {
                    const deleteServiceButton = fixedFavoriteLink.querySelector(".favorite-services-widget_item_delete");
                    deleteServiceButton.addEventListener("click", () => {
                        userStorageManager.deleteService(fixedFavoriteItem)
                    });
                }

                if (fixedLink) {
                    // В зависимости от пометки "Только для просмотра", выбираем шаблон для рендера
                    if (Context.data.for_viewing_only) {
                        this.renderComponent(favoriteServicesContainer, fixedLink);
                    }
                    else {
                        this.renderComponent(favoriteServicesContainer, fixedFavoriteLink);
                    }
                    return;
                };
            };

            const newService = serviceTemplate.content.cloneNode(true);
            const newFavoriteService = favoriteServiceTemplate.content.cloneNode(true);

            const serviceNameNode = newService.querySelector(".services-widget_item-label");
            const favoriteServiceNameNode = newFavoriteService.querySelector(".services-widget_item-label");
            const serviceContainer = newService.querySelector(".services-widget_item");
            const deleteServiceButton = newFavoriteService.querySelector(".favorite-services-widget_item_delete");
            const favoriteServiceContainer = newFavoriteService.querySelector(".services-widget_item");

            serviceContainer.dataset["service_code"] = service.code;
            favoriteServiceContainer.dataset["service_code"] = service.code;
            serviceNameNode.textContent = service.name;
            favoriteServiceNameNode.textContent = service.name;
            console.log(service.link);
            serviceContainer.href = service.link;
            favoriteServiceContainer.href = service.link;

            if (!Context.data.for_viewing_only) {
                deleteServiceButton.addEventListener("click", () => {
                    userStorageManager.deleteService(favoriteServiceContainer)
                });
            }

            if (Context.data.for_viewing_only) {
                this.renderComponent(favoriteServicesContainer, serviceContainer);
            }
            else {
                this.renderComponent(favoriteServicesContainer, favoriteServiceContainer);
            }

        });

        // Обновление кликабельности кнопки "Добавить" если избранных больше 5
        if (userStorageManager.servicesCount > 5) {
            const saveServicesButton = document.querySelector(".services-save-button");
            saveServicesButton.classList.toggle("blocked");
        };
    };

    /** Метод для рендера элемента в определенной области DOM
     * @param domElement Контейнер, в который нужно вставить элемент
     * @param elementToAppend Элемент для вставки (может быть массивом с DOM-элементами)
     */
    renderComponent(domElement: any, elementToAppend: any) {

        if (Array.isArray(elementToAppend)) {
            domElement.append(...elementToAppend);
            return;
        };
        domElement.appendChild(elementToAppend);
    };
}

/** Класс для хранения и парсинга информации о избранных сервисах пользователя и фильтров для объектов
 * @property baseUrl Адрес площадки
 * @property servicesCount Количество избранных сервисов пользователя
 * @property favoriteServices Массив объектов типа service
 */
class UserStorageManager {

    constructor() {

        // Если избранных сервисов нет
        if (!window.localStorage.getItem("favorite_services")) {
            this.setDefaultServices(true);
        };
        this.favoriteServices = JSON.parse(window.localStorage.getItem("favorite_services")).services;
        this.servicesCount = this.favoriteServices.length;
        this.baseUrl = System.getBaseUrl();
    };

    baseUrl: string;
    servicesCount: number;
    favoriteServices: service[];

    /** Получить избранные заявки */
    getServices() {
        return this.favoriteServices
    };

    /** Управляет визуальным отображением галочек с выбранными сервисами */
    setTempServices() {

        const tempServices = document.querySelectorAll(".services-page_main-content_choices-content .favorite-services_choice_column-item");

        tempServices.forEach((node: any) => {
            if (this.favoriteServices.find(service => service.code === node.dataset["service_code"])) {
                const checkbox = node.querySelector(".favorite-services_choice_column-item_checkbox");
                if (!checkbox.classList.contains("selected")) {
                    checkbox.classList.add("selected");
                }
            }
            else {
                const checkbox = node.querySelector(".favorite-services_choice_column-item_checkbox");
                if (checkbox.classList.contains("selected")) {
                    checkbox.classList.remove("selected");
                }
            }
        });
    };

    /** Парсит DOM, находит выбранные избранные сервисы, и записывает в браузерное хранилище */
    addServices() {

        // Получение checkbox'ов
        const favoriteServicesContainer = document.querySelector(".services-page_main-content_choices-content");
        const newServices = favoriteServicesContainer.querySelectorAll(".favorite-services_choice_column-item:has(.selected)");

        // Получение нового массива избранных заявок
        const favoriteServices: service[] = Array.from(newServices).map((node: any) => {

            const serviceCode = node.dataset["service_code"];
            let referenceService: newIssueConstructor = <newIssueConstructor>{};

            for (let service of defaultIssues) {
                if (!service.issues) {
                    continue;
                };
                // Поиск сервиса
                const innerService = service.issues.find(s => s.code === serviceCode);

                if (innerService) {
                    referenceService = innerService;
                };
            };

            return <service>{
                name: referenceService.name,
                code: referenceService.code,
                link: referenceService.link
            }
        }).filter(item => item.code);

        // Обновление данных
        this.favoriteServices = favoriteServices;
        this.servicesCount = this.favoriteServices.length;
        window.localStorage.setItem("favorite_services", JSON.stringify({
            count: this.servicesCount,
            services: this.favoriteServices
        }));

        service_manager.renderFavorites(true);
    };

    /** Удаляет сервисы со страницы */
    deleteService(service: any) {

        // Получение избранных сервисов
        const favoriteServices = JSON.parse(window.localStorage.getItem("favorite_services"));
        // Получение из окна выбора сервисы
        const mainFavoriteServices = document.querySelectorAll(`.main-page_services-widget_container .services-widget_item`);

        // Удаление элемента сервиса
        for (let node of mainFavoriteServices) {
            if (node.dataset["service_code"] === service.dataset["service_code"]) {
                node.remove();
            };
        };

        // Обновление данных
        favoriteServices.count--;
        favoriteServices.services = favoriteServices.services.filter((item: service) => item.code !== service.dataset["service_code"]);
        window.localStorage.setItem("favorite_services", JSON.stringify(favoriteServices));
        this.favoriteServices = favoriteServices.services;

        // Обновление кликабельности кнопки
        if (this.favoriteServices.length < 5) {
            const saveServicesButton = document.querySelector(".services-save-button");
            saveServicesButton.classList.remove("blocked");
        };
        service.remove();
        userStorageManager.setTempServices();
    };

    /** Генерирует ссылку для сервиса */
    parseLink(service: serviceLinkConstructor): string {
        // const linkObj = encodeURIComponent(`${service.fieldToChange ? `{${`"data":{"${service.fieldToChange}":[${JSON.stringify(service.fieldValue)}]}}`}` : ""}`).replace(/:/g, "%3A").replace(/,/g, "%2C");
        // const fullUrl = `(p:item/${service.ns}/${service.code}${linkObj ? `;values=${linkObj}` : ""})`;
        const fullUrl = `(p:item/${service.ns}/${service.code})`;
        return fullUrl;
    };

    /** Получить дефолтный набор избранных сервисов */
    setDefaultServices(setStorageValue = false) {
        const services: service[] = defaultServices.map(service => {
            return {
                name: service.name,
                link: this.parseLink(service),
                code: service.fieldValue ? service.fieldValue.code : service.code
            };
        });
        const favoriteServices = {
            count: 5,
            services
        }
        if (setStorageValue) {
            window.localStorage.setItem("favorite_services", JSON.stringify(favoriteServices));
        };
    };
};

async function onLoad(): Promise<void> {

    userStorageManager = new UserStorageManager();
    service_manager = new ServiceManager(userStorageManager);
    service_manager.renderServices();
}

/** Функция для сброса компонентов внутри контейнеров при обновлении данных страницы
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

/** Метод открывает/закрывает модальное окно для выбора избранных заявок */
function closeServices() {

    const servicesModal = document.querySelector(".services-page_main-content_modal");
    servicesModal.classList.toggle("hidden");
    
    // Если было закрытие, то обновляем чекбоксы
    if (servicesModal.classList.contains("hidden")) {
        userStorageManager.setTempServices();
    }
};

/** Метод проверяет возможность добавления сервисов в выбранные */
function handleServiceSelect(target: any) {

    target.classList.toggle("selected");
    target.selected = !target.selected;

    const favoriteServicesContainer = document.querySelector(".services-page_main-content_choices-content");
    const newServices = favoriteServicesContainer.querySelectorAll(".favorite-services_choice_column-item:has(.selected)");
    const tempServicesCount = newServices.length;
    const saveButton = document.querySelector(".services-save-button");

    if (tempServicesCount > 5) {
        saveButton.classList.add("blocked");
    }
    else if (saveButton.classList.contains("blocked")) {
        saveButton.classList.remove("blocked");
    };
};

const defaultServices: serviceLinkConstructor[] = [
    {
        name: "Отпуск без сохранения ЗП",
        ns: "absences",
        code: "vacations",
        fieldToChange: "type_vacation",
        fieldValue: {
            code: "unpaid",
            name: "Отпуск без сохранения заработной платы"
        }
    },
    {
        name: "Запросить справку",
        ns: "personnel_documents",
        code: "certificate"
    },
    {
        name: "Уведомить о больничном",
        ns: "absences",
        code: "vacations",
        fieldToChange: "type_vacation",
        fieldValue: {
            code: "sick_leave",
            name: "Больничный"
        }
    },
    {
        name: "Оформить командировку",
        ns: "business_trips",
        code: "businesstrip_requests",
    },
    {
        name: "Отпуск оплачиваемый",
        ns: "absences",
        code: "vacations",
        fieldToChange: "type_vacation",
        fieldValue: {
            code: "basic",
            name: "Ежегодный оплачиваемый отпуск"
        }
    }
];

const defaultIssues: newIssueConstructor[] = [
    {
        name: "Отпуск/отсутствие",
        expandable: true,
        issue_type: "vacation",
        issues: [
            {
                name: "Ежегодный оплачиваемый отпуск",
                code: "basic",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations)`
            },
            {
                name: "Отпуск без сохранения ЗП",
                code: "unpaid",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations)`
            },
            {
                name: "Дополнительный отдых",
                code: "additional",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations)`
            },
            {
                name: "Оплачиваемый учебный отпуск",
                code: "study",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations)`
            },
            {
                name: "Больничный",
                code: "sick_leave",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations)`
            },
            {
                name: "По беременности и родам",
                code: "pregnancy",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations)`
            },
            {
                name: "По уходу за ребенком",
                code: "child_care",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations)`
            },
            {
                name: "Исполнение гос. и общ. обязанностей",
                code: "duty",
                expandable: false,
                link: `${window.location.href}(p:item/absences/vacations)`
            }
        ]
    },
    {
        name: "Перевод/увольнение",
        issue_type: "issue",
        expandable: true,
        issues: [
            {
                name: "Заявка на перевод",
                code: "transfer_application",
                expandable: false,
                link: `${window.location.href}(p:item/kedo/transfer_application)`
            },
            {
                name: "Заявка на увольнение",
                expandable: false,
                code: "dismissal_app",
                link: `${window.location.href}(p:item/kedo/dismissal_app)`
            },
        ]
    },
    {
        name: "Заявления на выплату",
        issue_type: "finance",
        expandable: true,
        issues: [
            {
                name: "Изменение расчетного счета",
                expandable: false,
                code: "application_for_the_transfer_of_salary_to_the_current_account",
                link: `${window.location.href}(p:item/personnel_documents/application_for_the_transfer_of_salary_to_the_current_account)`
            },
            {
                name: "Мат. помощь",
                expandable: false,
                code: "application_for_financial_assistance",
                link: `${window.location.href}(p:item/personnel_documents/application_for_financial_assistance)`
            },
            {
                name: "Пособие",
                expandable: false,
                code: "benefit_application",
                link: `${window.location.href}(p:item/personnel_documents/benefit_application)`
            },
        ]
    },
    {
        name: "Прочие заявления",
        issue_type: "personal_data",
        expandable: true,
        issues: [
            {
                name: "Изменить личные данные",
                expandable: false,
                code: "employees_personal_data",
                link: `${window.location.href}(p:item/kedo/employees_personal_data)`
            },
            {
                name: "Присвоить льготную категорию",
                expandable: false,
                code: "category_assignment",
                link: `${window.location.href}(p:item/kedo/category_assignment)`
            },
            {
                name: "В свободной форме",
                expandable: false,
                code: "free_from",
                link: `${window.location.href}(p:item/personnel_documents/free_from)`
            },
            {
                name: "Справка",
                expandable: false,
                code: "certificate",
                link: `${window.location.href}(p:item/personnel_documents/certificate)`
            },
            {
                name: "Командировка",
                expandable: false,
                code: "businesstrip_requests",
                link: `${window.location.href}(p:item/business_trips/businesstrip_requests)`
            },
            {
                name: "Вызвать на работу в нерабочее время",
                expandable: false,
                code: "overtime_work",
                link: `${window.location.href}(p:item/time_tracking/overtime_work)`
            },
        ]
    }
    // {
    //     name: "Заявки в IT",
    //     issue_type: "issue",
    //     expandable: true,
    //     issues: [
    //         {
    //             name: "Создать заявку",
    //             expandable: false,
    //             code: "applications",
    //             link: `${window.location.href}(p:run/service_desk.applications/creating_request_by_external_user;values=%7B%7D)`
    //         }
    //     ]
    // },
];