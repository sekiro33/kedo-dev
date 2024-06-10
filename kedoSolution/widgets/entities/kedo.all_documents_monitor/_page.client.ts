declare const document: any;
declare const console: any;
declare const window: any;

type PersonnelDocuments = ApplicationItem<Application$personnel_documents$personnel_documents$Data, any>;
type EmploymentDocuments = ApplicationItem<Application$kedo$documents_for_employment$Data, any>;
type Documents = PersonnelDocuments | EmploymentDocuments;
type Staff = ApplicationItem<Application$kedo$staff$Data, any>;
type KedoStatus = ApplicationItem<Application$kedo$statuses$Data, any>;

interface IDocumentData {
    userNameText?: string,
    userId?: string,
    responsibleUserText?: string,
    responsibleUserId?: string,
    fileName?: string,
    fileNamespace?: string,
    fileCode?: string,
    fileId?: string,
    fileDate?: string,
    statusText?: string,
    statusCode?: string,
    fileType?: string,
    staffId?: string,
    staffNameText?: string
}

interface IDocumentType {
    name: string,
    code: string,
}

// Шаблон строки списка документов
let item_template: any;
let itemsWrapper: any;
let kedoDocsContainer: any;
// Cтандартный контейнер ELMA365
let contentBody: any;
let loader: any;
// Нижняя точка контейнера
let documentsBottomPoint: number = 0;
// Переменная для ID таймаута 
let timeOut: any;

let staffs: Staff[] = [];
let users: UserItem[] = [];
let tasks: ProcessTaskItem[] = [];
let statuses: KedoStatus[] = [];

/** Количество получаемых документов */
const PACK_SIZE: number = 20;
let current_iteration: number = 0;
let no_elements: boolean = false;

const document_types: IDocumentType[] = [
    {
        name: "Соглашение об ЭВ",
        code: "electronic_interaction_agreement"
    },
    {
        name: "Заявление на трудоустройство",
        code: "job_application",
    },
    {
        name: "Заявление о предоставлении сведений о трудовой деятельности",
        code: "information_about_labor_activity",
    },
    {
        name: "Трудовой договор",
        code: "labor_contract",
    },
    {
        name: "Приказ о приёме",
        code: "admission_order",
    },
    {
        name: "Дополнительное документы трудоустройства",
        code: "additional_agreement_to_the_contract",
    },
    {
        name: "Заявление на перевод",
        code: "transfer_application",
    },
    {
        name: "Заявление на увольнение",
        code: "letter_of_resignation",
    },
    {
        name: "Приказ на перевод",
        code: "order_for_transfer",
    },
    {
        name: "Согласие на перевод",
        code: "transfer_approve",
    },
    {
        name: "Доп. соглашение на перевод",
        code: "transfer_approve",
    },
    {
        name: "Приказ на увольнение",
        code: "dismissal_order",
    },
    {
        name: "Приказ об изменении паспортных данных",
        code: "passport_data_change_order",
    },
    {
        name: "Заявление об изменении паспортных данных",
        code: "passport_data_application",
    },
    {
        name: "Заявление на присвоение категории",
        code: "category_assignment",
    },
    {
        name: "Заявление в свободной форме",
        code: "free_from",
    },
    {
        name: "Приказ на оплачиваемый отпуск",
        code: "paid_leave_order",
    },
    {
        name: "Приказ на отпуск без сохранения оплаты",
        code: "leave_without_pay",
    },
    {
        name: "Приказ на отпуск",
        code: "vacation_orders",
    },
    {
        name: "Приказ на командировку",
        code: "order_for_business_trip",
    },
    {
        name: "Приказ на материальную помощь",
        code: "order_financial_assistance",
    },
    {
        name: "Заявление на отпуск без сохранения оплаты",
        code: "application_for_leave_without_pay",
    },
    {
        name: "Заявление на оплачиваемый отпуск",
        code: "paid_leave",
    },
    {
        name: "Заявление на отпуск",
        code: "vacation_docs",
    },
    {
        name: "Служебная записка на командировку",
        code: "memo_business_trip",
    },
    {
        name: "Служебная записка на работу в нерабочее время",
        code: "overtime_requests",
    },
    {
        name: "Авансовый отчёт",
        code: "avansovyi_otchet",
    },
    {
        name: "Служебные задания",
        code: "service_assignments",
    },
    {
        name: "Приказы о работе в нерабочее время",
        code: "overtimeWorkOrders",
    },
    {
        name: "Согласие на работу в нерабочее время",
        code: "overtimeWorkConsent",
    },
    {
        name: "Уведомление о праве отказаться от работы в нерабочее время",
        code: "overtimeWorkNotifications",
    },
    {
        name: "Распоряжение о работе в нерабочее время",
        code: "overtime_order",
    },
    {
        name: "Заявление на выплату пособия",
        code: "benefit_application",
    },
    {
        name: "Заявление на материальную помощь",
        code: "application_for_financial_assistance",
    },
    {
        name: "Служебная записка на командировку",
        code: "trip_requests",
    },
    {
        name: "Приказ на командировку",
        code: "order_for_a_business_trip",
    },
    {
        name: "Согласие на обработку ПДн ребёнка",
        code: "child_personal_data_consent",
    },
    {
        name: "Заявление на перечисление ЗП на расчетный счёт",
        code: "application_for_the_transfer_of_salary_to_the_current_account",
    },
    {
        name: "Справка",
        code: "certificate",
    },
    {
        name: "Прочие документы",
        code: "other_documents",
    },
    {
        name: "Расчётный лист",
        code: "setlement_sheet",
    },
]

/** Точка входа. */
async function init() {
    item_template = document.querySelector('.kedo__staff-docs-table-section-list-item-template');
    itemsWrapper = document.querySelector('.kedo__staff-docs-table-section-list');
    loader = document.querySelector('.kedo-loader-wrapper-staff-docs');
    kedoDocsContainer = document.querySelector('.kedo__staff-docs');

    Context.data.doc_types = document_types;

    updateDocuments();

    setHandleWindowScroll();
};

/** Установка обработчика на скролл страницы */
function setHandleWindowScroll() {
    contentBody = document.querySelector('.content-body');

    if (!contentBody) {
        window.setTimeout(setHandleWindowScroll, 100);
        return;
    }

    contentBody.addEventListener('scroll', handleWindowScroll);
}

/** Обработчик при скролле страницы вниз */
async function handleWindowScroll() {
    window.clearTimeout(timeOut);

    // Для того, чтобы обработчик срабатывал только по истечении 300мс после окончания скролла, выставляем таймаут
    // Это снизит нагрузку системы
    timeOut = window.setTimeout(async () => {
        if (no_elements === true) {
            return;
        }

        // Расчитываем текущую нижнюю границу контейнера
        documentsBottomPoint = kedoDocsContainer.offsetTop + kedoDocsContainer.offsetHeight;

        // Если мы достигли нижней границе при скролле, вызываем методы получения новой порции данных и их рендера
        if (documentsBottomPoint - contentBody.scrollTop - window.innerHeight < 0) {
            await updateDocuments();
        }
    }, 300)
}

/** Отобразить лоадер */
function showLoader() {
    loader.classList.add('kedo-loader-wrapper-staff-docs_active');
};

/** Скрыть лоадер */
function hideLoader() {
    loader.classList.remove('kedo-loader-wrapper-staff-docs_active');
};

/** Событие при нажатии на кнопку "Найти документы" */
async function searchDocumentsButtonOnClick(): Promise<void> {
    // Сбрасываем количество итераций (прокруток) и очищаем контейнер
    current_iteration = 0;
    no_elements = false;
    itemsWrapper.innerHTML = "";
    updateDocuments();
}

/** Получить новую пачку документов */
async function updateDocuments(): Promise<void> {
    showLoader();

    const from = current_iteration * PACK_SIZE;
    const documents = await searchDocuments(from);

    if (documents.length == 0) {
        no_elements = true;
        hideLoader();
        return;
    }

    current_iteration++;

    await updateData(documents);

    const serialized_docs = serialize(documents);
    renderData(serialized_docs);

    hideLoader();
}

async function searchDocuments(from: number): Promise<Documents[]> {
    const personnel_documents = Context.fields.appendix_hr_documents_contract_new.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.line_status.neq('removed;Удален'),
        ))
        .from(from)
        .size(PACK_SIZE)
        .sort("__createdAt", false);

    const employment_documents = Context.fields.appendix_employment_documents_contract.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.line_status.neq('removed;Удален'),
        ))
        .from(from)
        .size(PACK_SIZE)
        .sort("__createdAt", false);

    const documents_search = [personnel_documents, employment_documents];

    // Фильтры
    if (Context.data.doc_statuses) {
        const variantCode = Context.data.doc_statuses.code;

        switch (variantCode) {
            case "signed":
                documents_search.forEach(search => search.where((f, g) => g.or(
                    f.line_status.like("signed"),
                    f.line_status.like("end")
                )));
                break;
            case "unsigned":
                documents_search.forEach(search => search.where((f, g) => g.or(
                    f.line_status.like("new"),
                    f.line_status.like("signing"),
                    f.line_status.like("agrement"),
                    f.line_status.like("in_preparation")
                )));
                break;
            case "rejected":
                documents_search.forEach(search => search.where((f, g) => g.or(
                    f.line_status.like("removed"),
                    f.line_status.like("rejected"),
                    f.line_status.like("correction"),
                )));
                break;
            case "active":
                documents_search.forEach(search => search.where((f, g) => g.or(
                    f.line_status.like("new"),
                    f.line_status.like("signing"),
                    f.line_status.like("agrement"),
                    f.line_status.like("in_preparation"),
                    f.line_status.like("correction")
                )));
                break;
        };
    }

    if (Context.data.from_date) {
        const from_date = Context.data.from_date!.asDatetime(new TTime(0, 0, 0, 0));
        documents_search.forEach(search => search.where(f => f.__createdAt.gte(from_date)));
    }

    if (Context.data.to_date) {
        const to_date = Context.data.to_date.asDatetime(new TTime(0, 0, 0, 0));
        documents_search.forEach(search => search.where(f => f.__createdAt.lte(to_date)));
    }

    if (Context.data.staff_user) {
        documents_search.forEach(search => search.where(f => f.staff.link(Context.data.staff_user!)));
    }

    if (Context.data.string_search && Context.data.string_search.length > 0) {
        documents_search.forEach(search => search.where(f => f.__name.like(Context.data.string_search!)));
    }

    const [hr_docs, work_docs] = await Promise.all(
        [
            personnel_documents.all(),
            employment_documents.all()
        ]
    );

    let documents = [...hr_docs, ...work_docs];

    if (!!Context.data.selected_doc_types && Context.data.selected_doc_types.length > 0) {
        let docTypes : string[] = Context.data.selected_doc_types;
        documents = documents.filter(item => docTypes.indexOf(item.data.__sourceRef?.code!) != -1);
    };

    let mappedItems = documents
        .filter(f => f.data.__sourceRef != undefined)
        .map(item => {
            return {
                id: item.data.__sourceRef!.id,
                code: item.data.__sourceRef!.code,
                namespace: item.data.__sourceRef!.namespace
            };
        });

    tasks = await System.processes._searchTasks()
        .where((f, g) => g.and(
            //@ts-ignore
            f.__item.in(mappedItems),
            //@ts-ignore
            f.state.neq(ProcessTaskState.cancel),
            //@ts-ignore
            f.state.neq(ProcessTaskState.closed)
        ))
        .size(100)
        .all();

    if (Context.data.deadline && Context.data.deadline.code != "all") {
        let deadlineCode = Context.data.deadline.code;
        const now = new Datetime();
        let hours: number = 0;
        let itemsFiltered: boolean = false;

        switch (deadlineCode) {
            case "less_than_eight":
                hours = 8
                break;
            case "less_than_four":
                hours = 4
                break;
            case "expired":
                documents = documents.filter(item => {
                    let task = tasks.find(t => t.data.__item.id == item.data.__sourceRef!.id);
                    if (!task) {
                        return false;
                    };
                    let dueDate = task.data.dueDate;
                    if (!dueDate) {
                        return false;
                    };
                    return now.after(dueDate);
                });
                itemsFiltered = true;
                break;
        };

        if (!itemsFiltered) {
            documents = documents.filter(item => {
                let task = tasks.find(t => t.data.__item.id == item.data.__sourceRef!.id);
                if (!task) {
                    return false;
                };
                let dueDate = task.data.dueDate;
                if (!dueDate) {
                    return false;
                };
                return dueDate.sub(now).hours < hours;
            });
        };
    };

    if (Context.data.sign_before) {
        let signBefore = Context.data.sign_before;
        documents = documents.filter(item => {
            let task = tasks.find(t => t.data.__item.id == item.data.__sourceRef!.id);
            if (!task) {
                return false;
            };
            let dueDate = task.data.dueDate;
            if (!dueDate) {
                return false;
            };
            return signBefore.after(dueDate);
        });
    };

    documents = documents.sort((app1, app2) => {
        if (app1.data.__createdAt.after(app2.data.__createdAt)) {
            return -1;
        }
        if (app1.data.__createdAt.before(app2.data.__createdAt)) {
            return 1;
        }
        return 0;
    })

    return documents;
}

async function updateData(documents: Documents[]): Promise<void> {
    const user_ids = documents
        .map(f => f.data.__createdBy.id)
        .filter(f => users.findIndex(u => u.id === f) === -1);

    const staff_ids = documents
        .filter(f => f.data.staff != undefined && staffs.findIndex(s => s.id === f.data.staff!.id) === -1)
        .map(f => f.data.staff!.id);

    const status_ids = documents
        .filter(f => f.data.kedo_status != undefined && statuses.findIndex(s => s.id === f.data.kedo_status.id) === -1)
        .map(f => f.data.kedo_status.id);

    const [new_users, new_staffs, new_statuses] = await Promise.all([
        System.users.search()
            .where(f => f.__id.in(user_ids))
            .size(user_ids.length)
            .all(),
        Context.fields.staff_user.app.search()
            .where(f => f.__id.in(staff_ids))
            .size(staff_ids.length)
            .all(),
        Namespace.app.statuses.search()
            .where(f => f.__id.in(status_ids))
            .size(100)
            .all(),
    ]);

    users = [...users, ...new_users];
    staffs = [...staffs, ...new_staffs];
    statuses = [...statuses, ...new_statuses];
}

/** Форматирование ФИО сотрудника */
function getFullName(name: string): string {
    const userNameArr = name.split(" ");

    if (userNameArr.length === 3) {
        return `${userNameArr[0]} ${userNameArr[1][0]}.${userNameArr[2][0]}.`;
    } else {
        return `${userNameArr[0]} ${userNameArr[1][0]}.`;
    }
}

function serialize(items: Documents[]): IDocumentData[] {
    let serialized_documents: IDocumentData[] = [];

    for (const item of items) {
        const document: IDocumentData = {
            fileName: `<Без названия>`,
            statusText: `Не определен`,
            userNameText: 'Пользователь не указан',
        };

        const created_by = users.find(f => f.id === item.data.__createdBy?.id);
        const staff = staffs.find(f => f.id === item.data.staff?.id);
        const task = tasks.find(f => f.data.__item.id == item.data.__sourceRef?.id)
        const status = statuses.find(f => f.id == item.data.kedo_status?.id);

        if (status) {
            document.statusCode = status.data.code;
            document.statusText = status.data.name;
        }

        if (item.data.__sourceRef) {
            const source = item.data.__sourceRef;

            document.fileId = source.id;
            document.fileNamespace = source.namespace;
            document.fileCode = source.code;
        }

        if (created_by) {
            document.userId = created_by.id;
            document.userNameText = getFullName(created_by.data.__name);
        }

        if (staff) {
            document.staffId = staff.id;
            document.staffNameText = getFullName(staff.data.__name);
        }

        if (item.data.__name) {
            document.fileName = item.data.__name;
        }

        if (item.data.__createdAt) {
            document.fileDate = item.data.__createdAt.format();
        }

        if (task) {
            const performers = task.data.performers ?? [];

            if (performers.length > 0) {
                const user = users.find(f => f.id === performers[0].id);

                if (user) {
                    document.responsibleUserId = user.id;
                    document.responsibleUserText = getFullName(user.data.__name);
                }
            }
        }

        serialized_documents.push(document);
    }

    return serialized_documents;
}

function renderData(data: IDocumentData[]): void {
    for (let item of data) {
        let itemEl = item_template.content.cloneNode(true);

        // Статус элемента
        let statusEl = itemEl.querySelector('.kedo__staff-docs-table-string-status');

        statusEl.textContent = ''

        if (item.statusCode === 'new') {
            statusEl.classList.add('kedo__staff-docs-table-string-status_default');
        };

        if (item.statusCode === 'agrement') {
            statusEl.classList.add('kedo__staff-docs-table-string-status_agrement');
        };

        if (item.statusCode === 'signing') {
            statusEl.classList.add('kedo__staff-docs-table-string-status_on-sign');
        };

        if (item.statusCode === 'signed') {
            statusEl.classList.add('kedo__staff-docs-table-string-status_signed');
        };

        if (item.statusCode === 'removed') {
            statusEl.classList.add('kedo__staff-docs-table-string-status_cancel');
        };

        statusEl.classList.add('kedo__staff-docs-table-string-status_default');

        if (item.statusText) {
            statusEl.textContent = item.statusText;
        }

        // Инициатор
        let userEl = itemEl.querySelector('.kedo__staff-docs-table-string-user-name');
        userEl.textContent = item.userNameText;

        if (item.userId) {
            userEl.href = `${System.getBaseUrl()}/kedo/all_documents(p:user/${item.userId})`
        } else {
            userEl.classList.add('kedo__staff-docs-table-string-user-name_disabled')
        };

        // Сотрудник
        let staffEl = itemEl.querySelector('.kedo__staff-docs-table-string-staff-name');
        staffEl.textContent = item.staffNameText;

        if (item.staffId) {
            staffEl.href = `${System.getBaseUrl()}/kedo/all_documents(p:item/kedo/staff/${item.staffId})`
        } else {
            staffEl.classList.add('kedo__staff-docs-table-string-user-name_disabled')
        };

        // Ответственный
        let reaponsibleNameEl = itemEl.querySelector('.kedo__staff-docs-table-string-responsible');
        if (item.responsibleUserText) {
            reaponsibleNameEl.textContent = item.responsibleUserText;
        } else {
            reaponsibleNameEl.textContent = '';
        }

        if (item.responsibleUserId) {
            reaponsibleNameEl.href = `${System.getBaseUrl()}/kedo/all_documents(p:user/${item.responsibleUserId})`
        } else {
            reaponsibleNameEl.classList.add('kedo__staff-docs-table-string-responsible_disabled');
        }

        // Название файла
        const fileNameEl = itemEl.querySelector('.kedo__staff-docs-table-string-file-name');
        // const fileImgEl = itemEl.querySelector('.kedo__staff-docs-table-string-file-name-img');
        if (item.fileName) {
            fileNameEl.textContent = item.fileName;
        } else {
            fileNameEl.textContent = '';
        }

        // if(item.fileType){
        //     if(item.fileType.includes('doc')){
        //         fileImgEl.classList.add('doc-img_doc');
        //     } else if (item.fileType.includes('pdf')){
        //         fileImgEl.classList.add('doc-img_pdf');
        //     };
        // };

        if (item.fileCode && item.fileId) {
            fileNameEl.href = `${System.getBaseUrl()}/kedo/all_documents(p:item/${item.fileNamespace}/${item.fileCode}/${item.fileId})`
        } else {
            fileNameEl.href = `${System.getBaseUrl()}/kedo/all_documents`;
            fileNameEl.classList.add('kedo__staff-docs-table-string-file-name_disabled');
        }

        // Дата создания
        let dateEl = itemEl.querySelector('.kedo__staff-docs-table-string-date');

        if (item.fileDate) {
            const date = new Date(item.fileDate);
            dateEl.textContent = `${date.toLocaleString('ru-RU', { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}`;
        }

        itemsWrapper.append(itemEl)
    }
}

/** Событие при выборе вида документа */
function selectDocType(e: any, doc_type : IDocumentType) {
    let selected_doc_types : string[] = Context.data.selected_doc_types ?? [];

    if (e.checked == true && selected_doc_types.indexOf(doc_type.code) == -1) {
        selected_doc_types.push(doc_type.code);
    }

    if (e.checked == false) {
        selected_doc_types = selected_doc_types.filter(f => f != doc_type.code);
    }

    Context.data.selected_doc_types = selected_doc_types;
}