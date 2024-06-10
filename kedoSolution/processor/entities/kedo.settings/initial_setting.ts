/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/


async function createData_1(): Promise<void> {
    await createSettings();
    await createRegions();
    await createTypesDocs();
    await createCustomGenerateDocs();
    await createAdditionalWeekendsAndHolidays();
}

async function createData_2(): Promise<void> {
    await setEmployeeWithoutRestrictions();
    await createBenefits();
    await createTypeOfMaterial();
    await createTypeEmploymentRelationship();
    await createReasonsTemporaryTransfer();
    await createWorkShedules();
    await createdCertificates();
    await createSupervisorElement()
}

async function createSettings(): Promise<void> {
    interface setting {
        name: string,
        code: string,
        value?: string,
        status?: boolean,
        description?: string,
        quantity?: number,
    }
    const settings: setting[] = [
        {
            name: 'Использовать Личный кабинет (КЭДО 2.0)',
            code: 'use_my_profile',
            status: false
        },
        {
            name: 'Проектные статусы командировок',
            code: 'business_trips_custom_status',
            status: false
        },
        {
            name: 'Адрес площадки',
            code: 'domen',
            value: Context.data.domen
        },
        {
            name: "Api-ключ для методов в модуле",
            code: "api_key"
        },
        {
            name: "Проектные коды приложений для разграничения доступа",
            code: "custom_app_codes",
            description: "Настройка для разграничения доступа к проектным приложениям, для корректной работы заполните поле Значение кодами приложений через запятую. У ваших приложений должно быть свойство типа Приложение с кодом staff и ссылкой на приложение Сотрудники и свойство типа Роль с кодом access_group, также в настройках доступа тех приложений, которые указаны в свойстве Значение данного элемента, необходимо добавить строку с разграничением доступа, выбрав объектом для назначения прав доступа свойство приложения с кодом access_group"
        },
        {
            name: "Проектная карточка с информацией на портале",
            code: "alternate_contacts_info",
            status: false
        },
        {
            name: "Периодичность отправки уведомления о подписании заявки инициатору",
            code: "remind_interval",
            quantity: 20,
            status: true,
            description: 'Данным параметром настраивается напоминание и периодичность его повторения о том что сотрудник после создания заявки не подписал печатный образ заявления/служебной записки. Значение в минутах. Напоминание происходит только в рабочие часы.'
        },
        {
            name: 'Проектный процесс определение руководителя',
            code: 'custom_definition_head',
            status: false,
        },
        {
            name: 'Использовать модуль Интеграция с УЦ для выдачи НЭП',
            code: 'new_method_create_sign',
            status: false,
            description: "При включении данного параметра выдача НЭП происходит через модуль “Интеграция с УЦ”, который поддерживает одновременную работу с разными удостоверяющими центрами (УЦ)"
        },
        {
            name: 'Проектный процесс создания пользователей',
            code: 'alternative_user_creation',
            status: false,
        },
        {
            name: "Проектный процесс оповещения",
            code: "alternate_notifications",
            status: false
        },
        {
            name: 'Подключен раздел отпусков',
            code: 'podklyuchen_razdel_otpuskov',
            status: false
        },
        {
            name: 'Подключен раздел командировок',
            code: 'travel_section_added',
            status: false
        },
        {
            name: 'Срок оповещения отдела кадров о неподписании приказа сотрудником',
            code: 'notify_deadline_hr_dep',
            status: true,
            quantity: 8,
            description: 'Срок оповещения отдела кадров о неподписании приказа сотрудником. Указывается в рабочих часах.',
        },
        {
            name: 'Срок оповещения руководителя о неподписании приказа сотрудником',
            code: 'notify_deadline_chief',
            status: true,
            quantity: 12,
            description: 'Срок оповещения руководителя о неподписании приказа сотрудником. Указывается в рабочих часах.'
        },
        {
            name: 'Периодичность отправки уведомления сотруднику',
            code: 'remind_frequency',
            status: true,
            quantity: 8,
            description: 'Частота отправки уведомлений сотруднику о каких-либо задачах, документах и т.д. в рамках бизнес-процесса. Указывается время в часах.',
        },
        {
            name: "Участие бухгалтерии в процессах",
            code: "accounting_in_processes",
            status: false
        },
        {
            name: 'Срок уведомления отдела кадров об окончании действия трудового договора/доп.соглашения',
            code: 'days_to_warn_hrs_about_fixedterm_contract',
            status: true,
            quantity: 5,
        },
        {
            name: "Массовое приглашение сотрудников. Трудоустроен",
            code: "mass_invitation_employed",
            status: true
        },
        {
            name: "Массовое приглашение сотрудников. Требуется выпуск НЭП",
            code: "mass_invitation_need_signature",
            status: true
        },
        {
            name: "Массовое приглашение сотрудников. Требуется согласие на обработку ПДн",
            code: "mass_invitation_need_consent_data_processing",
            status: false
        },
        {
            name: "Массовое приглашение сотрудников. Личные данные вносит сотрудник",
            code: "mass_invitation_personal_data_entered_employee",
            status: false
        },
        {
            name: "Массовое приглашение сотрудников. Требуется прикрепить сканы документов",
            code: "mass_invitation_need_attach_scans_documents",
            status: false
        },
        {
            name: "Массовое приглашение сотрудников. СоЭВ подписывается в офисе",
            code: "mass_invitation_agreement_signed_in_office",
            status: true
        },
        {
            name: "Эскалация завершения увольнения на отдел кадров",
            code: "dismissal_escalation_hr",
            description: "За какое время в рабочих часах будет автоматически завершаться задача сотрудника о необходимости передать приказ в отдел кадров",
            quantity: 4,
        },
        {
            name: "Срок в задаче кандидата подписать документы трудоустройства",
            code: "deadline_candidate_task_sign_employment_documents",
            description: "Количество рабочих часов на задачу подписания документов для трудоустройства сотрудником",
            quantity: 16,
        },
        {
            name: "Дополнительные документы предоставляемые в оригинале при трудоустройстве",
            code: "documents_submitted_original",
            description: "В данном параметре текстом перечисляются документы регистрации на портале КЭДО / трудоустройства, оригиналы которых необходимо передавать в бумаге. Указывать документы СоЭВ, Уведомление о переходе на КЭДО и Согласие на КЭДО в данном параметре не нужно.",
            value: '',
        },
        {
            name: "Контролировать получение бумажных оригиналов",
            code: "control_receipt_paper_originals_during_employment",
            description: "Данный параметр во всех процессах активирует дополнительные задачи сотруднику и специалисту отдела кадров подтвердить получение оригиналов документов",
            status: false,
        },
        {
            name: "Срок подтверждения передачи оригиналов документов работодателю",
            code: "deadline_confirming_transfer_original_documents_employer",
            description: "Количество рабочих дней для подтверждения передачи оригинала документов работодателю сотрудником",
            quantity: 3,
        },
        {
            name: "Срок подтверждения получения оригиналов документов от сотрудника",
            code: "deadline_confirming_receipt_original_documents_from_employee",
            description: "Количество рабочих дней для подтверждения получения оригинала документов работодателем от сотрудника",
            quantity: 10,
        },
        {
            name: "Отправлять уведомления об окончании перевода/срочного трудового договора",
            code: "send_notification_about_the_ending_of_personnel_transfer",
            description: "Данный параметр отвечает за отправку уведомлений об окончании переводов/срочных трудовых договоров",
            status: false,
        },
        {
            name: "Требуется уведомление о подписании документов работодателю",
            code: "head_signing_notification",
            description: "Данный параметр отвечает за отправку уведомлений  о подписании приказов, дополнительных соглашений, прочих документов работодателю",
            status: false,
        },

    ];

    const integration_settings: setting[] = [
        {
            name: 'Интеграция с учетной системой',
            code: 'integration_1c',
            status: false
        },
        {
            name: 'Использовать 1C как мастер-систему',
            code: 'use_alternative_integration',
            status: false
        },
        {
            name: 'Использовать альтернативную учетную систему',
            code: 'use_alternative_system',
            status: false
        },
    ]

    const allSettings = await Application.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    const folders = await Application.getFolders();
    const myFolders = folders.find(f => f.name == 'Общие');
    for (const setting of settings) {
        const currentSetting = allSettings.find(f => f.data.code == setting.code);

        if (!currentSetting) {
            const newSetting = Application.create();
            newSetting.data.__name = setting.name;
            newSetting.data.code = setting.code;
            newSetting.data.value = setting.value;
            newSetting.data.status = setting.status;
            newSetting.data.quantity = setting.quantity;
            newSetting.data.description = setting.description;
            newSetting.data.__directory = []; // инициализировать переменную
            newSetting.data.__directory.id = myFolders ? myFolders.id : undefined;
            promises.push(newSetting.save())
        } else {
            if (setting.value && !currentSetting.data.value) currentSetting.data.value = setting.value;
            if (setting.quantity && !currentSetting.data.quantity) currentSetting.data.quantity = setting.quantity;
            if (setting.description && !currentSetting.data.description) currentSetting.data.description = setting.description;
            promises.push(currentSetting.save());
        }
    }

    let integrationFolder = folders.find(f => f.name == 'Настройки интеграции');

    if (!integrationFolder) {
        integrationFolder = await Application.createFolder('Настройки интеграции');
    }

    for (const setting of integration_settings) {
        if (!allSettings.find(f => f.data.code == setting.code)) {
            const newSetting = Application.create();
            newSetting.data.__name = setting.name;
            newSetting.data.code = setting.code;
            newSetting.data.value = setting.value;
            newSetting.data.status = setting.status;
            newSetting.data.description = setting.description;
            newSetting.data.quantity = setting.quantity;
            newSetting.data.__directory = []; // инициализировать переменную
            newSetting.data.__directory.id = integrationFolder ? integrationFolder.id : undefined;
            promises.push(newSetting.save())
        }
    }

    await Promise.all(promises)
}

async function createRegions(): Promise<void> {
    interface region {
        name: string,
        code: number
    }
    const regions: region[] = [
        {
            name: 'Краснодарский Край',
            code: 23,
        },
        {
            name: 'Рязанская Область',
            code: 62,
        },
        {
            name: 'Томская Область',
            code: 70,
        },
        {
            name: 'Ульяновская Область',
            code: 73,
        },
        {
            name: 'Москва Город',
            code: 77,
        },
        {
            name: 'Калмыкия Республика',
            code: 8,
        },
        {
            name: 'Оренбургская Область',
            code: 56,
        },
        {
            name: 'Смоленская Область',
            code: 67,
        },
        {
            name: 'Чувашская Республика - Чувашия',
            code: 21,
        },
        {
            name: 'Белгородская Область',
            code: 31,
        },
        {
            name: 'Пензенская Область',
            code: 58,
        },
        {
            name: 'Курская Область',
            code: 46,
        },
        {
            name: 'Волгоградская Область',
            code: 34,
        },
        {
            name: 'Дагестан Республика',
            code: 5,
        },
        {
            name: 'Чукотский Автономный округ',
            code: 87,
        },
        {
            name: 'Челябинская Область',
            code: 74,
        },
        {
            name: 'Северная Осетия - Алания Республика',
            code: 15,
        },
        {
            name: 'Ингушетия Республика',
            code: 6,
        },
        {
            name: 'Камчатский Край',
            code: 41,
        },
        {
            name: 'Крым Республика',
            code: 91,
        },
        {
            name: 'Севастополь Город',
            code: 92,
        },
        {
            name: 'Сахалинская Область',
            code: 65,
        },
        {
            name: 'Адыгея Республика',
            code: 1,
        },
        {
            name: 'Алтай Республика',
            code: 4,
        },
        {
            name: 'Кемеровская Область',
            code: 42,
        },
        {
            name: 'Брянская Область',
            code: 32,
        },
        {
            name: 'Владимирская Область',
            code: 33,
        },
        {
            name: 'Коми Республика',
            code: 11,
        },
        {
            name: 'Липецкая Область',
            code: 48,
        },
        {
            name: 'Калужская Область',
            code: 40,
        },
        {
            name: 'Санкт-Петербург Город',
            code: 78,
        },
        {
            name: 'Пермский Край',
            code: 59,
        },
        {
            name: 'Ивановская Область',
            code: 37,
        },
        {
            name: 'Мордовия Республика',
            code: 13,
        },
        {
            name: 'Нижегородская Область',
            code: 52,
        },
        {
            name: 'Приморский Край',
            code: 25,
        },
        {
            name: 'Амурская Область',
            code: 28,
        },
        {
            name: 'Байконур Город',
            code: 99,
        },
        {
            name: 'Саха /Якутия/ Республика',
            code: 14,
        },
        {
            name: 'Корякский Автономный округ',
            code: 82,
        },
        {
            name: 'Московская Область',
            code: 50,
        },
        {
            name: 'Воронежская Область',
            code: 36,
        },
        {
            name: 'Хабаровский Край',
            code: 27,
        },
        {
            name: 'Новосибирская Область',
            code: 54,
        },
        {
            name: 'Эвенкийский Автономный округ',
            code: 88,
        },
        {
            name: 'Архангельская Область',
            code: 29,
        },
        {
            name: 'Карачаево-Черкесская Республика',
            code: 9,
        },
        {
            name: 'Ленинградская Область',
            code: 47,
        },
        {
            name: 'Тюменская Область',
            code: 72,
        },
        {
            name: 'Башкортостан Республика',
            code: 2,
        },
        {
            name: 'Ярославская Область',
            code: 76,
        },
        {
            name: 'Карелия Республика',
            code: 10,
        },
        {
            name: 'Тамбовская Область',
            code: 68,
        },
        {
            name: 'Псковская Область',
            code: 60,
        },
        {
            name: 'Тверская Область',
            code: 69,
        },
        {
            name: 'Ростовская Областьь',
            code: 61,
        },
        {
            name: 'Омская Область',
            code: 55,
        },
        {
            name: 'Вологодская Область',
            code: 35,
        },
        {
            name: 'Костромская Область',
            code: 44,
        },
        {
            name: 'Иркутская обл Усть-Ордынский Бурятский Округ',
            code: 85,
        },
        {
            name: 'Самарская Область',
            code: 63,
        },
        {
            name: 'Чеченская Республика',
            code: 20,
        },
        {
            name: 'Магаданская Область',
            code: 49,
        },
        {
            name: 'Свердловская Область',
            code: 66,
        },
        {
            name: 'Кабардино-Балкарская Республика',
            code: 7,
        },
        {
            name: 'Бурятия Республика',
            code: 3,
        },
        {
            name: 'Тульская Область',
            code: 71,
        },
        {
            name: 'Коми-Пермяцкий Автономный округ',
            code: 81,
        },
        {
            name: 'Курганская Область',
            code: 45,
        },
        {
            name: 'Тыва Республика',
            code: 17,
        },
        {
            name: 'Ханты-Мансийский Автономный округ - Югра Автономный округ',
            code: 86,
        },
        {
            name: 'Марий Эл Республика',
            code: 12,
        },
        {
            name: 'Удмуртская Республика',
            code: 18,
        },
        {
            name: 'Татарстан Республика',
            code: 16,
        },
        {
            name: 'Иркутская Область',
            code: 38,
        },
        {
            name: 'Таймырский (Долгано-Ненецкий) Автономный округ',
            code: 84,
        },
        {
            name: 'Алтайский Край',
            code: 22,
        },
        {
            name: 'Астраханская Область',
            code: 30,
        },
        {
            name: 'Ненецкий Автономный округ',
            code: 83,
        },
        {
            name: 'Красноярский Край',
            code: 24,
        },
        {
            name: 'Забайкальский край Агинский Бурятский Округ',
            code: 80,
        },
        {
            name: 'Орловская Область',
            code: 57,
        },
        {
            name: 'Мурманская Область',
            code: 51,
        },
        {
            name: 'Новгородская Область',
            code: 53,
        },
        {
            name: 'Кировская Область',
            code: 43,
        },
        {
            name: 'Забайкальский Край',
            code: 75,
        },
        {
            name: 'Хакасия Республика',
            code: 19,
        },
        {
            name: 'Еврейская Автономная область',
            code: 79,
        },
        {
            name: 'Ямало-Ненецкий Автономный округ',
            code: 89,
        },
        {
            name: 'Ставропольский Край',
            code: 26,
        },
        {
            name: 'Калининградская Область',
            code: 39,
        },
        {
            name: 'Саратовская Область',
            code: 64,
        },
    ]
    const allSettings = await Namespace.app.directory_of_regions.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    let promises: Promise<void>[] = [];
    for (const region of regions) {
        if (!allSettings.find(f => f.data.the_code == region.code)) {
            const newRegion = Namespace.app.directory_of_regions.create();
            newRegion.data.__name = region.name;
            newRegion.data.the_code = region.code;
            promises.push(newRegion.save())
        }
        if (promises.length >= 20) {
            await Promise.all(promises);
            promises = []
        }
    }
    await Promise.all(promises)
}

async function createTypesDocs(): Promise<void> {
    interface doc {
        name: string,
        deleted: boolean,
        description?: string,
        default: boolean,
        required: boolean,
        required_for_candidate?: boolean
    }
    const docs: doc[] = [
        {
            name: 'Паспорт. Страница с фото и данными',
            deleted: true,
            default: true,
            required: true,
            required_for_candidate: true
        },
        {
            name: 'Паспорт. Страница с регистрацией',
            deleted: true,
            default: true,
            required: true,
            required_for_candidate: true,
        },
        {
            name: 'ТК или СТД-Р',
            deleted: false,
            default: true,
            required: false,
            required_for_candidate: true,
        },
        {
            name: 'СНИЛС',
            deleted: true,
            default: true,
            required: false,
            required_for_candidate: true,
        },
        {
            name: 'ИНН',
            deleted: true,
            default: true,
            required: false,
            required_for_candidate: false,
        },
        {
            name: 'Военный билет или приписное свидетельство',
            deleted: true,
            default: true,
            required: false,
            required_for_candidate: false,
        },
        // {
        //     name: 'Свидетельство о рождении детей (при наличии до 18 лет)',
        //     deleted: true,
        //     default: false,
        //     required: false,
        //     required_for_candidate: false,
        // },
        {
            name: 'Диплом об образовании',
            deleted: true,
            default: false,
            required: true,
            required_for_candidate: false,
        },
        {
            name: 'Водительское удостоверение',
            deleted: true,
            default: false,
            required: true
        },
        {
            name: 'Водительская медкомиссия',
            deleted: true,
            default: false,
            required: true
        },
        {
            name: 'Свидетельство о рождении детей',
            deleted: true,
            description: 'Свидетельство о рождении (усыновлении) ребенка либо документ, подтверждающий установление опеки, попечительства над ребенком-инвалидом',
            default: false,
            required: false
        },
        {
            name: 'Документ о месте жительства ребёнка-инвалида',
            deleted: false,
            description: 'Документы, подтверждающие место жительства (пребывания или фактического проживания) ребенка-инвалида',
            default: false,
            required: false
        },
        {
            name: 'Справка об установлении инвалидности',
            deleted: true,
            description: 'Справка, подтверждающая факт установления инвалидности, выданная бюро (главным бюро, Федеральным бюро) медико-социальной экспертизы',
            default: false,
            required: false
        },
        {
            name: 'Удостоверение/дипломы о повышении квалификации',
            deleted: true,
            default: false,
            required: true,
            required_for_candidate: false,
        },
        {
            name: 'Справка о наличии или отсутствии судимости у соискателя',
            deleted: true,
            description: '',
            default: false,
            required: true
        },
        {
            name: 'Справка о наличии или отсутствии административных наказаний за употребление наркотических средств (психотропных веществ) без назначения врача',
            deleted: true,
            description: '',
            default: false,
            required: true
        },
        {
            name: 'Результаты медосмотра',
            deleted: true,
            description: '',
            default: false,
            required: true
        },
        {
            name: 'Паспорт иностранного гражданина',
            deleted: true,
            description: '',
            default: false,
            required: true
        },
        {
            name: 'Миграционная карта',
            deleted: true,
            description: '',
            default: false,
            required: true
        },
        {
            name: 'Разрешение на временное проживание или вид на жительство',
            deleted: true,
            description: '',
            default: false,
            required: true
        },
        {
            name: 'Разрешение на работу или патент',
            deleted: true,
            description: '',
            default: false,
            required: true
        },
        {
            name: 'ДМС',
            deleted: true,
            description: '',
            default: false,
            required: true
        },
        {
            name: 'Согласие на обработку персональных данных (подписанное собственноручно)',
            deleted: true,
            description: '',
            default: true,
            required: true
        },
    ]
    const allSettings = await Namespace.app.types_documents_for_employment.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    for (const doc of docs) {
        if (!allSettings.find(f => f.data.__name == doc.name)) {
            const newDoc = Namespace.app.types_documents_for_employment.create();
            newDoc.data.__name = doc.name;
            newDoc.data.deleted = doc.deleted;
            newDoc.data.default = doc.default;
            newDoc.data.required = doc.required;
            newDoc.data.description = doc.description;
            promises.push(newDoc.save())
        }
    }
    await Promise.all(promises)
}

async function createCustomGenerateDocs(): Promise<void> {
    interface doc {
        name: string,
        code: string,
        status: boolean,
    }
    const docs: doc[] = [
        {
            name: 'Проектная генерация заявления на выплату пособия',
            code: 'custom_generate_benefit_doc',
            status: false
        },
        {
            name: 'Проектная генерация заявления на мат.помощь',
            code: 'custom_generate_financial_assistance_doc',
            status: false
        },
        {
            name: 'Проектная генерация заявления на увольнение',
            code: 'custom_generate_resignation_letter',
            status: false
        },
        {
            name: 'Проектная генерация заявления/служебной записки на перевод',
            code: 'custom_generate_transfer_application',
            status: false
        },
        {
            name: 'Проектная генерация служебной записки на ИО',
            code: 'custom_generate_execution_duties',
            status: false
        },
        {
            name: 'Проектная генерация заявления на изменение ПДн',
            code: 'custom_generate_personal_data_doc',
            status: false
        },

    ]
    const folders = await Application.getFolders();
    const myFolders = folders.find(f => f.name === 'КЭДО - Базовый пакет');
    const allSettings = await Application.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    for (const doc of docs) {
        if (!allSettings.find(f => f.data.code === doc.code)) {
            const newDoc = Application.create();
            newDoc.data.__name = doc.name;
            newDoc.data.code = doc.code;
            newDoc.data.status = doc.status;
            newDoc.data.__directory = []; // инициализировать переменную
            newDoc.data.__directory.id = myFolders ? myFolders.id : undefined;
            promises.push(newDoc.save());
        }
    }
    await Promise.all(promises)
}

async function setEmployeeWithoutRestrictions(): Promise<void> {
    const emoloyee = await Namespace.app.employees_categories.search()
        .size(10000)
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('default')
        ))
        .first()

    if (emoloyee) {
        interface setting {
            name: string,
            code: string,
            feature?: TRefItem,
            quantity?: number,
            status?: boolean,
            description?: string
        }
        const settings: setting[] = [
            {
                name: 'Категория сотрудников по умолчанию',
                code: 'employee_category',
                feature: emoloyee
            },
            {
                name: 'Медосмотры - количество дней до начала выборки',
                code: 'med_start_days',
                quantity: 30
            },
            {
                name: 'Медосмотры - интервал выборки (дни)',
                code: 'med_interval_days',
                quantity: 14
            },
            {
                name: 'Создание и подписаниe заявления о трудоустройстве',
                code: 'app_employment',
                status: false
            },
            {
                name: 'Медосмотр при приеме и переводе сотрудника',
                code: 'med_exam_process',
                status: false
            },
            {
                name: 'Подписание СЗ/Заявления руководителем организации',
                code: 'director_signing',
                status: false
            },
            {
                name: 'Создание и подписание приказа о приёме',
                code: 'admission_order',
                status: true
            },
            {
                name: 'Создание и подписание заявления о предоставлении сведений о трудовой деятельности',
                code: 'information_about_labor_activity',
                status: false
            },
            {
                name: 'Проектная генерация документов трудоустройства',
                code: 'generation_labor_documents',
                status: false
            },
            {
                name: 'Генерация дополнительных документов для трудоустройства',
                code: 'additional_documents_for_employment',
                status: false
            },
            {
                name: 'Проверка сгенерированных документов трудоустройства',
                code: 'checking_generated_documents',
                status: true
            },
            {
                name: 'Проектный процесс ознакомления с ЛНА',
                code: 'custom_lna',
                status: false
            },
            {
                name: 'Максимальный суммарный процент доплат за ИО',
                code: 'max_total_percent_substitution',
                status: false,
                quantity: 0
            },
            {
                name: 'Распознавание документов',
                code: 'document_recognition',
                status: false,
                description: "Параметр адаптирует процесс работы с кандидатом, трудоустройство и изменения ПДн под шаги с распознаванием приложенных сканов документов.",
            },
            {
                name: 'Срок заполнения анкеты кандидатом',
                code: 'deadline_filling_questionnaire_candidate',
                description: "Параметр регулирует время на заполнение анкеты кандидатом в календарных днях от момента его приглашения на портал.",
                quantity: 4
            },
            {
                name: 'Срок проверки и ознакомления этапов рассмотрения кандидата',
                code: 'period_verification_consideration_candidate',
                description: "Параметр регулирует время на принятие решение по кандидату в календарных днях в случае если не заполнена анкета в срок, если кандидат отказался на одном из шагов прохождение",
                quantity: 2
            },
            {
                name: 'Срок принятия финального решения о кандидате',
                code: 'deadline_making_final_decision_candidate',
                description: "Параметр регулирует время на принятие финального решения о кандидате",
                quantity: 5
            },
            {
                name: 'Срок подписания предложения о работе',
                code: 'deadline_signing_job_offer',
                description: "Параметр регулирует время на подписание предложения о работе кандидатом.",
                quantity: 4
            },
            {
                name: 'Проверка службой безопасности',
                code: 'security_check',
                status: true,
                quantity: 4,
                description: "Параметр влияет на наличие дополнительного шага о проверке кандидата службой безопасности, а также регулирует время на проверку кандидата в процессе Работа с кандидатом.",
            },
            {
                name: 'Срок формирования документов для кандидата',
                code: 'deadline_formation_documents_candidate',
                description: "Параметр регулирует время на формирования направления на медосмотр и формирование предложения о работе в процессе Работа с кандидатом",
                quantity: 3
            },
            {
                name: 'Открытие счета через работодателя',
                code: 'opening_account_employer',
                status: false,
                description: "Параметр влияет возможность открытия лицевого счёта через работодателя в процессе Работа с кандидатом.",
            },
            {
                name: 'Дата напоминания о трудоустройстве кандидату',
                code: 'date_reminder_employment_candidate',
                description: "Параметр регулирует количество дней до трудоустройства, когда должно быть направлено напоминание письмом кандидату",
                quantity: 5
            },
            {
                name: 'Срок отображения портала у кандидата после завершения рассмотрения',
                code: 'period_displaying_portal_candidate_after_completion_review',
                description: "Параметр определяет время, в течение которого отклоненный кандидат имеет доступ к порталу до блокировки.",
                quantity: 5
            },
            {
                name: 'Выбирать ответственного за трудоустройство',
                code: 'select_person_responsible_employment',
                status: true,
                description: "Параметр определяет наличие дополнительной функции выбора ответственного за трудоустройство сотрудника в процесса `Работа с кандидатом` в шаге после подтверждения кандидатом предложения о работе.",
            },
            {
                name: 'Срок предоставления дополнительных данных для трудоустройства и их проверки',
                code: 'deadline_providing_additional_information_employment_and_verifying',
                description: "Параметр время выполнения задачи предоставления дополнительных данных кандидатом в процессе `Работа с кандидатом`",
                quantity: 1
            },
            {
                name: 'Срок запроса дополнительных данных для трудоустройства',
                code: 'deadline_requesting_additional_information_employment',
                description: "Параметр регулирует срок, за сколько дней до трудоустройства ответственному за прием приходит задача `Запросить доп. данные для трудоустройства` и определяет время выполнения этой задачи в процессе `Работа с кандидатом`",
                quantity: 2
            },
            {
                name: 'Медицинский осмотр. Требуется приложить направление и сообщить даты прохождения',
                code: 'medical_checkup_required_attach_direction_indicate_dates_passage',
                status: false,
                quantity: 7,
                description: "Параметр регулирует наличие шагов Медицинского осмотра: Формирование направления и указание кандидатом дат прохождения медосмотра. При включенном параметре процесс идет по ветке `Медосмотр нужен`. Имеет приоритет при одновременно включенном параметре `Медицинский осмотр. Требуется сообщить даты прохождения`. Дополнительно регулируется срок прохождения медосмотра кандидатом.",
            },
            {
                name: 'Медицинский осмотр. Требуется сообщить даты прохождения',
                code: 'medical_checkup_dates_required',
                status: false,
                quantity: 7,
                description: "Параметр регулирует наличие шагов Медицинского осмотра: указание кандидатом дат прохождения медосмотра. При включенном параметре процесс идет по ветке `Медосмотр нужен`. Не имеет приоритета при одновременно включенном параметре `Медицинский осмотр. Требуется приложить направление и сообщить даты прохождения`. Дополнительно регулируется срок прохождения медосмотра кандидатом.",
            },
        ]
        const allSettings = await Application.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
        const folders = await Application.getFolders();
        const myFolders = folders.find(f => f.name === 'КЭДО - Базовый пакет');
        const promises: Promise<void>[] = [];
        for (const setting of settings) {
            if (!allSettings.find(f => f.data.code == setting.code)) {
                const newSetting = Application.create();
                newSetting.data.__name = setting.name;
                newSetting.data.code = setting.code;
                newSetting.data.feature = setting.feature;
                newSetting.data.quantity = setting.quantity;
                newSetting.data.__directory = []; // инициализировать переменную
                newSetting.data.__directory.id = myFolders ? myFolders.id : undefined;
                newSetting.data.status = setting.status;
                newSetting.data.description = setting.description;
                promises.push(newSetting.save())
            }
        }
        await Promise.all(promises)
    }
}

async function createBenefits(): Promise<void> {
    interface benefit {
        name: string,
        initiators?: TEnum<Enum$personnel_documents$handbook_of_benefits$initiators>[],
        list?: string
    }
    const benefits: benefit[] = [
        {
            name: 'Уход за ребенком - Ежемесячное пособие по уходу за ребенком',
            initiators: [
                {
                    "code": "staff",
                    "name": "Сотрудники"
                }
            ],
            list: 'Свидетельство о рождении или усыновлении (копия), Свидетельство о рождении предыдущего ребёнка(копия), Приказ о замене послеродового отпуска на отпуск по уходу за ребёнком(копия), Справка с места работы второго родителя или обоих родителей о том, что он/ она / они не получает пособия(оригинал), Справка из органов социальной защиты населения по месту жительства родителей о неполучении ежемесячного пособия по уходу за ребёнком(оригинал)'
        },
        {
            name: 'Уход за ребенком - Ежемесячное пособие по уходу за ребенком',
            initiators: [
                {
                    "code": "staff",
                    "name": "Сотрудники"
                }
            ],
            list: 'Свидетельство о рождении или усыновлении (копия), Свидетельство о рождении предыдущего ребёнка(копия), Приказ о замене послеродового отпуска на отпуск по уходу за ребёнком(копия), Справка с места работы второго родителя или обоих родителей о том, что он/ она / они не получает пособия(оригинал), Справка из органов социальной защиты населения по месту жительства родителей о неполучении ежемесячного пособия по уходу за ребёнком(оригинал)'
        },
        {
            name: 'Беременность и роды - Пособие по беременности и родам',
            initiators: [
                {
                    "code": "staff",
                    "name": "Сотрудники"
                }
            ]
        },
        {
            name: 'Погребение - Социальное пособие на погребение',
            initiators: [
                {
                    "code": "staff",
                    "name": "Сотрудники"
                }
            ],
            list: 'Справка о смерти (оригинал)'
        },
        {
            name: 'Проф. травма - Пособие по временной нетрудоспособности',
            initiators: [
                {
                    "code": "personnel_staff",
                    "name": "Кадровые работники"
                },
            ],
            list: 'Акт о несчастном случае на производстве (по форме Н-1) или Акт о случае профессионального заболевания, Копии материалов расследования, если оно не завершено'
        },
        {
            name: 'Рождение ребенка - Единовременное пособие при рождении ребенка',
            initiators: [
                {
                    "code": "staff",
                    "name": "Сотрудники"
                }
            ],
            list: 'Справка о рождении ребенка (оригинал), Справка с места работы другого родителя о том, что такое пособие не назначалось (оригинал)'
        },
        {
            name: 'Возмещение - Возмещение расходов Страхователям на Страхователю выплату социального пособия на погребение',
            initiators: [
                {
                    "code": "personnel_staff",
                    "name": "Кадровые работники"
                },
            ],
            list: 'Справка о смерти (оригинал)'
        },
        {
            name: 'Нетрудоспособность - Пособие по временной нетрудоспособности'
        },
        {
            name: 'Возмещение расходов на оплату четырех дополнительных выходных дней одному из родителей для ухода за детьми-инвалидами',
            initiators: [
                {
                    "code": "staff",
                    "name": "Сотрудники"
                }
            ],
            list: 'Паспорт или доверенность'
        },
    ]
    const allBenefits = await Context.fields.handbook_of_benefits.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    for (const benefit of benefits) {
        if (!allBenefits.find(f => f.data.__name === benefit.name)) {
            const newBenefit = Context.fields.handbook_of_benefits.app.create();
            newBenefit.data.__name = benefit.name;
            newBenefit.data.initiators = benefit.initiators;
            newBenefit.data.list_of_required_documents = benefit.list;
            promises.push(newBenefit.save())
        }
    }
    await Promise.all(promises)
}

// async function createdMaterials(): Promise<void> {
//     interface material {
//         name: string,
//         list?: string
//     }
//     const materials: material[] = [
//         {
//             name: 'рождение ребенка',
//             list: 'Свидетельство о рождении'
//         },
//         {
//             name: 'Выплата работнику или бывшему работнику в связи со смертью члена его семьи',
//             list: 'Свидетельство о смерти'
//         }
//     ]
//     const allMaterials = await Context.fields.types_of_material.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
//     const promises: Promise<void>[] = [];
//     for (const material of materials) {
//         if (!allMaterials.find(f => f.data.__name === material.name)) {
//             const newMaterial = Context.fields.types_of_material.app.create();
//             newMaterial.data.__name = material.name;
//             newMaterial.data.list_of_required_documents = material.list;
//             promises.push(newMaterial.save())
//         }
//     }
//     await Promise.all(promises)
// }

async function createTypeEmploymentRelationship(): Promise<void> {
    interface type {
        name: string,
        possible_time_limit?: boolean,
        note?: string
    }
    const types: type[] = [
        {
            name: 'Договор подряда (ГПХ)',
            possible_time_limit: true
        },
        {
            name: 'Договор оказания услуг (ГПХ)',
            possible_time_limit: true
        },
        {
            name: 'Срочный',
            possible_time_limit: true
        },
        {
            name: 'Бессрочный',
            possible_time_limit: false
        }
    ]
    const allTypes = await Context.fields.type_employment_relationship.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    for (const typeRelationship of types) {
        if (!allTypes.find(f => f.data.__name === typeRelationship.name)) {
            const newType = Context.fields.type_employment_relationship.app.create();
            newType.data.__name = typeRelationship.name;
            newType.data.possible_time_limit = typeRelationship.possible_time_limit;
            promises.push(newType.save());
        }
    }
    await Promise.all(promises)
}

async function createReasonsTemporaryTransfer(): Promise<void> {
    interface reason {
        name: string,
        agreement_required?: boolean,
        maximum_transfer_term?: number,
        note?: string
    }
    const reasons: reason[] = [
        {
            name: 'В связи с простоем',
            agreement_required: false,
            maximum_transfer_term: 1
        },
        {
            name: 'По соглашению сторон',
            agreement_required: true,
            maximum_transfer_term: 12
        },
        {
            name: 'Для замещения временно отсутствующего (до выхода сотрудника)',
            agreement_required: true,
        },
        {
            name: 'В связи с Катастрофой, ЧС и т.д.',
            agreement_required: false,
            maximum_transfer_term: 1
        },
        {
            name: 'В связи с медицинским заключением',
            agreement_required: true,
            maximum_transfer_term: 4
        }
    ]
    const allReasons = await Namespace.app.reasons_temporary_transfer.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    for (const reasonTransfer of reasons) {
        if (!allReasons.find(f => f.data.__name === reasonTransfer.name)) {
            const newReason = Namespace.app.reasons_temporary_transfer.create();
            newReason.data.__name = reasonTransfer.name;
            newReason.data.agreement_required = reasonTransfer.agreement_required;
            newReason.data.maximum_transfer_term = reasonTransfer.maximum_transfer_term;
            promises.push(newReason.save());
        }
    }
    await Promise.all(promises)
}

async function createWorkShedules(): Promise<void> {
    interface workShedule {
        name: string,
        working_hours?: number,
        working_hours_week?: number,
        total_accounting?: boolean,
    }
    const workShedules: workShedule[] = [
        {
            name: 'Пятидневка с 9 до 18',
        },
        {
            name: 'Сокращенная пятидневка с 9 до 17',
        },
        {
            name: 'Сменный график 2 через 2',
        },
    ]
    const allWorkShedules = await Namespace.app.work_schedules.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    for (const workShedule of workShedules) {
        if (!allWorkShedules.find(f => f.data.__name === workShedule.name)) {
            const newWorkShedule = Namespace.app.work_schedules.create();
            newWorkShedule.data.__name = workShedule.name;
            promises.push(newWorkShedule.save());
        }
    }
    await Promise.all(promises)
}

async function createdCertificates(): Promise<void> {
    class MyRole {
        user: UserItem[]
        type: 'user'
        code: string
        constructor(user: UserItem[], type: 'user', code: string) {
            this.code = code;
            this.user = user;
            this.type = type;
        }
        getUsers(): Promise<UserItem[]> {
            return new Promise<UserItem[]>(() => <UserItem[]>this.user)
        }
        json(): any {
            return {
                code: this.code,
                type: this.type
            }
        }
    }
    function userGroup2Role(user: UserItem[]): Role {
        return new MyRole(user, 'user', user![0].id) as Role
    }

    interface certificate {
        name: string
        form_is_required?: boolean,
        period_is_required?: boolean,
        list_of_required_documents?: string
    }
    const certificates: certificate[] = [
        {
            name: '2-НДФЛ',
            period_is_required: true,
        },
        {
            name: 'Справка о среднем заработке (за период)',
            period_is_required: true,
        },
        {
            name: 'Справка о среднем заработке для визы',
        },
        {
            name: 'Справка в службу занятости',
        },
        {
            name: 'Справка для банков (по форме банка)',
            form_is_required: true,
            list_of_required_documents: 'Образец документа по форме которого требуется справка'
        },
        {
            name: 'Справка об удержанных алиментах за период',
        },
        {
            name: 'Справка №182Н',
        },
        {
            name: 'Справка о периоде работы у работодателя',
        },
        {
            name: 'Справка с места работы о не получении ежемесячного пособия на период отпуска по уходу за ребенком',
        },
        {
            name: 'Справка с места работы о не получении единовременного пособия при рождении ребенка за счет средств ФСС',
        },
    ]

    const user = await System.users.search().first()
    const supervisor = [userGroup2Role([user!])]
    const allCertificates = await Context.fields.handbook_of_certificates.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    for (const certificate of certificates) {
        if (!allCertificates.find(f => f.data.__name === certificate.name)) {
            const newCertificate = Context.fields.handbook_of_certificates.app.create();
            newCertificate.data.__name = certificate.name;
            newCertificate.data.responsible = supervisor;
            newCertificate.data.form_is_required = certificate.form_is_required;
            newCertificate.data.period_is_required = certificate.period_is_required;
            newCertificate.data.list_of_required_documents = certificate.list_of_required_documents;
            promises.push(newCertificate.save())
        }
    }
    await Promise.all(promises)
}

async function createTypeOfMaterial(): Promise<void> {
    interface type {
        name: string,
        list_of_required_documents: string,
        sum?: TMoney<'RUB'>
    }
    const types: type[] = [
        {
            name: 'Рождение ребенка',
            list_of_required_documents: 'Свидетельство о рождении',
            sum: new Money(15000, 'RUB')
        },
        {
            name: 'Заключение брака',
            list_of_required_documents: 'Свидетельство о регистрации брака ',
            sum: new Money(15000, 'RUB')
        },
        {
            name: 'Смерть близкого родственника',
            list_of_required_documents: 'Свидетельство о смерти. Документ, подтверждающий факт родства (например, св-во о рождении)',
            sum: new Money(15000, 'RUB')
        },
        {
            name: 'Тяжелая болезнь',
            list_of_required_documents: 'Подтверждающие документы',
        },
        {
            name: 'Тяжелая болезнь близкого родственника',
            list_of_required_documents: 'Подтверждающие документы',
        },
        {
            name: 'Причинение ущерба имуществу',
            list_of_required_documents: 'Подтверждающие документы',
        },
        {
            name: 'Иная материальная помощь',
            list_of_required_documents: 'Подтверждающие документы',
        }
    ]
    const allTypes = await Context.fields.types_of_material.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    for (const typeMaterial of types) {
        if (!allTypes.find(f => f.data.__name === typeMaterial.name)) {
            const newType = Context.fields.types_of_material.app.create();
            newType.data.__name = typeMaterial.name;
            newType.data.list_of_required_documents = typeMaterial.list_of_required_documents;
            newType.data.sum = typeMaterial.sum;
            promises.push(newType.save());
        }
    }
    await Promise.all(promises)
}

async function createSupervisorElement(): Promise<void> {
    try {
        const supervisor = await System.userGroups.search().where(f => f.__id.eq('331e62d2-072e-58ac-9581-74abcc67f050')).first();
        const userSupervisor = await System.users.search().where(f => f.groupIds.has(supervisor!)).first();
        const staff = await Namespace.app.staff.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(userSupervisor!)
            ))
            .first();

        if (!staff) {
            if (!userSupervisor) return
            const staffSupervisor = Namespace.app.staff.create();
            staffSupervisor.data.full_name = userSupervisor.data.fullname;
            staffSupervisor.data.name = userSupervisor.data.fullname?.firstname;
            staffSupervisor.data.surname = userSupervisor.data.fullname?.lastname;
            staffSupervisor.data.middlename = userSupervisor.data.fullname?.middlename;
            staffSupervisor.data.email = userSupervisor.data.email ? staffSupervisor.fields.email.create(userSupervisor.data.email) : undefined;
            staffSupervisor.data.phone = userSupervisor.data.workPhone;
            staffSupervisor.data.ext_user = userSupervisor;
            staffSupervisor.data.work_start = new TDate();

            const employee_category = await Namespace.app.settings.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.code.eq('employee_category'))).first();
            const defCategory = employee_category!.data.feature;
            const refDefCategory = new RefItem<ApplicationItem<Application$kedo$employees_categories$Data, Application$kedo$employees_categories$Params>>('kedo', 'employees_categories', defCategory!.id);
            const item = await refDefCategory.fetch();
            const row = staffSupervisor.data.categories_table!.insert();
            row.staff_categories = item;

            await staffSupervisor.save();
            await staffSupervisor.setStatus(staffSupervisor.fields.__status.variants.signed_documents)
        };
    } catch (err) {
        throw new Error(`error at supervisor staff create: ${err.message}`)
    }
}

async function createAdditionalWeekendsAndHolidays(): Promise<void> {

    let year_string = '2024';

    interface dates_table {
        date: TDate,
        region?: number,
        holiday: boolean,
        day_off: boolean,
        row_index?: number,
        holiday_name: string
    }

    const additional_holidays: dates_table[] = [
        {
            date: new TDate(2024, 1, 1),
            holiday: true,
            day_off: true,
            row_index: 0,
            holiday_name: 'Новогодние каникулы'
        },
        {
            date: new TDate(2024, 1, 2),
            holiday: true,
            day_off: true,
            row_index: 1,
            holiday_name: 'Новогодние каникулы'
        },
        {
            date: new TDate(2024, 1, 3),
            holiday: true,
            day_off: true,
            row_index: 2,
            holiday_name: 'Новогодние каникулы'
        },
        {
            date: new TDate(2024, 1, 4),
            holiday: true,
            day_off: true,
            row_index: 3,
            holiday_name: 'Новогодние каникулы'
        },
        {
            date: new TDate(2024, 1, 5),
            holiday: true,
            day_off: true,
            row_index: 4,
            holiday_name: 'Новогодние каникулы'
        },
        {
            date: new TDate(2024, 1, 6),
            holiday: true,
            day_off: true,
            row_index: 5,
            holiday_name: 'Новогодние каникулы'
        },
        {
            date: new TDate(2024, 1, 7),
            holiday: true,
            day_off: true,
            row_index: 6,
            holiday_name: 'Рождество Христово'
        },
        {
            date: new TDate(2024, 1, 8),
            holiday: true,
            day_off: true,
            row_index: 7,
            holiday_name: 'Новогодние каникулы'
        },
        {
            date: new TDate(2024, 2, 23),
            holiday: true,
            day_off: true,
            row_index: 8,
            holiday_name: 'День защитника Отечества'
        },
        {
            date: new TDate(2024, 3, 8),
            holiday: true,
            day_off: true,
            row_index: 9,
            holiday_name: 'Международный женский день'
        },
        {
            date: new TDate(2024, 4, 29),
            holiday: false,
            day_off: true,
            row_index: 10,
            holiday_name: 'Перенос выходного дня'
        },
        {
            date: new TDate(2024, 4, 30),
            holiday: false,
            day_off: true,
            row_index: 11,
            holiday_name: 'Перенос выходного дня'
        },
        {
            date: new TDate(2024, 5, 1),
            holiday: true,
            day_off: true,
            row_index: 12,
            holiday_name: 'Праздник Весны и Труда'
        },
        {
            date: new TDate(2024, 5, 9),
            holiday: true,
            day_off: true,
            row_index: 13,
            holiday_name: 'День Победы'
        },
        {
            date: new TDate(2024, 5, 10),
            holiday: false,
            day_off: true,
            row_index: 14,
            holiday_name: 'Перенос выходного дня'
        },
        {
            date: new TDate(2024, 6, 12),
            holiday: true,
            day_off: true,
            row_index: 15,
            holiday_name: 'День России'
        },
        {
            date: new TDate(2024, 11, 4),
            holiday: true,
            day_off: true,
            row_index: 16,
            holiday_name: 'День народного единства'
        },
        {
            date: new TDate(2024, 12, 30),
            holiday: false,
            day_off: true,
            row_index: 17,
            holiday_name: 'Перенос выходного дня'
        },
        {
            date: new TDate(2024, 12, 31),
            holiday: false,
            day_off: true,
            row_index: 18,
            holiday_name: 'Перенос выходного дня'
        },
        {
            date: new TDate(2024, 7, 12),
            region: 31,
            holiday: true,
            day_off: true,
            row_index: 19,
            holiday_name: 'День Прохоровского поля - Третьего ратного поля России'
        },
        {
            date: new TDate(2024, 6, 16),
            region: 16,
            holiday: true,
            day_off: true,
            row_index: 20,
            holiday_name: 'Курбан-байрам'
        },
        {
            date: new TDate(2024, 4, 10),
            region: 16,
            holiday: true,
            day_off: true,
            row_index: 21,
            holiday_name: 'Ураза-Байрам'
        },
        {
            date: new TDate(2024, 8, 30),
            region: 16,
            holiday: true,
            day_off: true,
            row_index: 22,
            holiday_name: 'День Республики Татарстан'
        },
        {
            date: new TDate(2024, 11, 6),
            region: 16,
            holiday: true,
            day_off: true,
            row_index: 23,
            holiday_name: 'День Конституции Республики Татарстан'
        },
        {
            date: new TDate(2024, 5, 14),
            region: 1,
            holiday: true,
            day_off: true,
            row_index: 24,
            holiday_name: 'Радоница'
        },
        {
            date: new TDate(2024, 5, 14),
            region: 64,
            holiday: true,
            day_off: true,
            row_index: 25,
            holiday_name: 'Радоница'
        },
        {
            date: new TDate(2024, 5, 14),
            region: 58,
            holiday: true,
            day_off: true,
            row_index: 26,
            holiday_name: 'Радоница'
        },
        {
            date: new TDate(2024, 5, 14),
            region: 26,
            holiday: true,
            day_off: true,
            row_index: 27,
            holiday_name: 'Радоница'
        },
        {
            date: new TDate(2024, 5, 14),
            region: 23,
            holiday: true,
            day_off: true,
            row_index: 28,
            holiday_name: 'Радоница'
        },
        {
            date: new TDate(2024, 5, 14),
            region: 7,
            holiday: true,
            day_off: true,
            row_index: 29,
            holiday_name: 'Радоница'
        },
        {
            date: new TDate(2024, 2, 10),
            region: 3,
            holiday: true,
            day_off: true,
            row_index: 30,
            holiday_name: 'Сагаалган'
        },
        {
            date: new TDate(2024, 2, 12),
            region: 3,
            holiday: false,
            day_off: true,
            row_index: 31,
            holiday_name: 'Перенос выходного дня'
        },
        {
            date: new TDate(2024, 2, 10),
            region: 80,
            holiday: true,
            day_off: true,
            row_index: 32,
            holiday_name: 'Сагаалган'
        },
        {
            date: new TDate(2024, 2, 12),
            region: 80,
            holiday: false,
            day_off: true,
            row_index: 33,
            holiday_name: 'Перенос выходного дня'
        },

    ]

    //Ищем приложение с текущим годом
    const weekend_reference = await Namespace.app.additional_holidays.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.year_string.eq(year_string))).first();
    let row_index = 0;
    if (weekend_reference) {
        //Если оно есть и таблица дат заполнена актуализируем старые данные и добавляем новые
        if (weekend_reference.data.dates_table && weekend_reference.data.dates_table.length > 0) {
            for (let item of additional_holidays) {
                let i = weekend_reference.data.dates_table.findIndex(f => f.row_index == item.row_index)
                if (i !== -1) {
                    weekend_reference.data.dates_table[i].date = item.date;
                    weekend_reference.data.dates_table[i].holiday = item.holiday;
                    weekend_reference.data.dates_table[i].day_off = item.day_off;
                    weekend_reference.data.dates_table[i].holiday_name = item.holiday_name;
                    if (item.region) {
                        const region = await Namespace.app.directory_of_regions.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.the_code.eq(item.region!))).first();
                        weekend_reference.data.dates_table[i].region = region ? region : undefined!;
                    }
                } else {
                    const row = weekend_reference.data.dates_table!.insert();
                    row.date = item.date;
                    row.holiday = item.holiday;
                    row.day_off = item.day_off;
                    row.holiday_name = item.holiday_name;
                    row.row_index = row_index;
                    if (item.region) {
                        const region = await Namespace.app.directory_of_regions.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.the_code.eq(item.region!))).first();
                        row.region = region ? region : undefined!;
                    }
                }
                row_index += 1;
            }
            //Если приложение есть, а таблица не заполнена, то добавляем данные в таблицу
        } else {
            for (let item of additional_holidays) {
                const row = weekend_reference.data.dates_table!.insert();
                row.date = item.date;
                row.holiday = item.holiday;
                row.day_off = item.day_off;
                row.holiday_name = item.holiday_name;
                row.row_index = row_index;
                if (item.region) {
                    const region = await Namespace.app.directory_of_regions.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.the_code.eq(item.region!))).first();
                    row.region = region ? region : undefined!;
                }
                row_index += 1;
            }
        }
        await weekend_reference.save();
    }

    //Если приложения не существует создаем его и наполняем таблицу дат
    else {
        const application_holiday = Namespace.app.additional_holidays.create();
        application_holiday.data.year_string = year_string;

        for (let item of additional_holidays) {
            const row = application_holiday.data.dates_table!.insert();
            row.date = item.date;
            row.holiday = item.holiday;
            row.day_off = item.day_off;
            row.holiday_name = item.holiday_name;
            row.row_index = row_index;
            if (item.region) {
                const region = await Namespace.app.directory_of_regions.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.the_code.eq(item.region!))).first();
                row.region = region ? region : undefined!;
            }
            row_index += 1;
        }

        await application_holiday.save();
    }

}


