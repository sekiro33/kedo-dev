declare const console: any, window: any, document: any, DOMParser: any;

type blockConstructor = {
    titleClass: string,
    titleContent: string,
    iconClass?: string,
    iconContent?: string,
    extraContentClass?: string,
    extraContent?: string,
    status?: string,
    link?: string
};

const monthReference: Record<string, string> = {
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

const svgToTypeReference = {
    business_trip: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_2710_613)">
    <mask id="mask0_2710_613" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
    <path d="M20 0H0V20H20V0Z" fill="white"/>
    </mask>
    <g mask="url(#mask0_2710_613)">
    <path d="M2.08203 17.0783H17.9154" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3.55003 13.0267L1.62793 9.69758C2.03222 9.46416 4.03276 10.1621 4.77749 10.5442L8.81999 9.0972L5.36362 3.11061L7.07803 3.00771L12.6616 8.19995L16.0993 7.11178C17.6217 6.67628 18.1018 7.50787 18.1977 7.67399C18.7738 8.67183 17.6097 9.34387 17.4434 9.43987C16.1131 10.208 3.55003 13.0267 3.55003 13.0267Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    </g>
    <defs>
    <clipPath id="clip0_2710_613">
    <rect width="20" height="20" fill="white"/>
    </clipPath>
    </defs>
    </svg>
    `,
    other: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.8335 1.6665H4.16683C3.70659 1.6665 3.3335 2.0396 3.3335 2.49984V17.4998C3.3335 17.9601 3.70659 18.3332 4.16683 18.3332H15.8335C16.2937 18.3332 16.6668 17.9601 16.6668 17.4998V2.49984C16.6668 2.0396 16.2937 1.6665 15.8335 1.6665Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.0835 11.25H12.9168" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.0835 8.75H12.9168" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.0835 5.83301H12.9168" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.0835 14.1665H10.0002" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
};

const issueCodeToNameReference = {
    application_for_financial_assistance: "Заявка на материальную помощь",
    benefit_application: "Заявка на выплату пособия",
    certificate: "Справка",
    category_assignment: "Заявка на присвоениее категории",
    employees_personal_data: "Заявка на изменение ПДн",
    free_from: "Заявка в свободной форме",
    business_trips: "Командировка",
    businesstrip_requests: "Командировка",
    holidays: "Отпуск",
    vacations: "Отпуск",
    dismissal_app: "Увольнение",
    execution_duties: "Заявка на ИО",
    transfer_application: "Заявка на перевод",
    employment_app: "Трудоустройство",
    medical_request: "Медосмотр",
    cancel_applications: "Отмена документа",
    application_for_the_transfer_of_salary_to_the_current_account: "Перечисление ЗП на расчетный счет",
    setlement_sheet: "Расчётный листок"
};

class DomManager {
    allStatuses: ApplicationItem<Application$kedo$statuses$Data, any>[];
    allBusinessTrips: ApplicationItem<Application$kedo$business_trips$Data, any>[];
    baseUrl = window.location.href;
    businessTripNodeTemplate: any;
    businessTripContainer: any;
    parser: typeof DOMParser;
    elementLoader: any;

    setActive(element: any) {
        element.classList.add("active");
    };

    handleLoader() {
        this.elementLoader.classList.toggle("hidden");
    };

    processComponent(element: any, elementData: blockConstructor, setActive = false) {
        const title = element.querySelector(`.${elementData.titleClass}`);
        title.textContent = elementData.titleContent;
        if (elementData.iconClass) {
            const iconContainer = element.querySelector(`.${elementData.iconClass}`)
            const svg = this.parser.parseFromString(elementData.iconContent, "text/html").body.firstChild;
            iconContainer.append(svg);
        };
        if (elementData.extraContentClass) {
            const extraContentContainer = element.querySelector(`.${elementData.extraContentClass}`);
            extraContentContainer.textContent = elementData.extraContent;
        };
        if (elementData.status) {
            const statusContainer = element.querySelector(".status-name");
            statusContainer.textContent = elementData.status;
        };
        if (setActive) {
            this.setActive(element);
        };
        if (elementData.link) {
            element.href = elementData.link;
        };
    };

    renderComponent(domElement: any, elementToAppend: any, prepend = false, elementData?: blockConstructor, setActive = false, onclick?: Function) {
        if (elementData) {
            this.processComponent(elementToAppend, elementData, setActive);
        };
        if (onclick) {
            elementToAppend.addEventListener("click", onclick);
        };
        if (prepend) {
            if (Array.isArray(elementToAppend)) {
                domElement.prepend(...elementToAppend);
                return;
            };
            domElement.prepend(elementToAppend);
        } else {
            if (Array.isArray(elementToAppend)) {
                domElement.append(...elementToAppend);
                return;
            };
            domElement.appendChild(elementToAppend);
        };
    };
};

const domManager = new DomManager();

async function onInit(): Promise<void> {
    //init().then(_ => domManager.handleLoader());
    init();
};

async function init(): Promise<void> {
    
    const newBusinessTripButton = document.querySelector(".business_trips-page_main-content_add-item");
    newBusinessTripButton.href = `${window.location.href}(p:item/business_trips/businesstrip_requests)`;
    
    const user = await System.users.getCurrentUser();
    const staff = await Context.fields.staff_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(user)
    )).first();

    if (!staff) {
        return;
    };

    domManager.allStatuses = await Context.fields.statuses_app.app.search().where(f => f.__deletedAt.eq(null)).size(100).all();
    domManager.allBusinessTrips = await Context.fields.closest_business_trips.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.kedo_staff.link(staff)
    )).sort("start_date").size(2).all();
    domManager.parser = new DOMParser();
    renderPage();
};

async function renderPage(): Promise<void> {

    domManager.businessTripNodeTemplate = document.querySelector(".personnel-events-widget_item-template");
    domManager.businessTripContainer = document.querySelector(".business_trips-page_main-content-widget_container");
    domManager.elementLoader = document.querySelector("[data-loader=business_trips_widget]");

    domManager.allBusinessTrips.forEach(businessTrip => {
        const [startDay, startMonth, startYear] = businessTrip.data.start_date_string ? businessTrip.data.start_date_string.split(".") : ["", "", ""];
        const [endDay, endMonth, endYear] = businessTrip.data.end_date_string ? businessTrip.data.end_date_string.split(".") : ["", "", ""];
        const businessTripStatus = domManager.allStatuses.find(status => status.id === businessTrip.data.kedo_status?.id);

        let elementData: blockConstructor;

        try {
            elementData = {
                titleClass: "item-header",
                titleContent: `${startDay} ${monthReference[startMonth.replace("0", "")].toLowerCase()} - ${endDay} ${monthReference[endMonth.replace("0", "")].toLowerCase()}`,
                iconClass: "item-icon-container",
                iconContent: svgToTypeReference.other,
                extraContentClass: "item-shortand",
                extraContent: issueCodeToNameReference["business_trips"],
                status: businessTripStatus ? businessTripStatus.data.__name : "Не определён",
                link: `${domManager.baseUrl}(p:item/business_trips/businesstrip_requests/${businessTrip.id})`
            };
        } catch (e) {
            elementData = {
                titleClass: "item-header",
                titleContent: `${startDay} ${monthReference[startMonth.startsWith("0") ? startMonth.replace("0", "") : startMonth]} - ${endDay} ${monthReference[endMonth.startsWith("0") ? endMonth.replace("0", "") : endMonth]}`,
                iconClass: "item-icon-container",
                iconContent: svgToTypeReference.other,
                extraContentClass: "item-shortand",
                extraContent: issueCodeToNameReference["business_trips"],
                status: businessTripStatus ? businessTripStatus.data.__name : "Не определён",
                link: `${domManager.baseUrl}(p:item/business_trips/businesstrip_requests/${businessTrip.id})`
            };
        };

        const newIssueItem = domManager.businessTripNodeTemplate.content.cloneNode(true).querySelector(".personnel-events-widget_item");
        domManager.renderComponent(domManager.businessTripContainer, newIssueItem, false, elementData);
    });
};