interface OtherDocument {
    name: string,
    only_employee_signs: boolean,
}

const documents: OtherDocument[] = [
    {
        name: "Договор о мат. ответственности (индивидуальный)",
        only_employee_signs: false,
    },
    {
        name: "Договор о мат. ответственности (коллективный)",
        only_employee_signs: false,
    },
    {
        name: "Согласие на видеонаблюдение",
        only_employee_signs: true,
    },
    {
        name: "Согласие на вакцинацию",
        only_employee_signs: true,
    },
    {
        name: "Обязательство о неразглашении коммерческой тайны",
        only_employee_signs: true,
    },
    {
        name: "Обязательство о неразглашении персональных данных",
        only_employee_signs: true,
    },
    {
        name: "Обязательство о нераспространении информации в СМИ",
        only_employee_signs: true,
    },
    {
        name: "Обязательство сообщать о потенциальном конфликте интересов",
        only_employee_signs: true,
    },
    {
        name: "График работы",
        only_employee_signs: true,
    }
];

async function createOtherDocsTypes(): Promise<void> {
    const ohter_documents = await Application.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    let promises: Promise<void>[] = [];
    for (const document of documents) {
        if (!ohter_documents.find(f => f.data.__name == document.name)) {
            const newDocument = Application.create();
            newDocument.data.__name = document.name;
            newDocument.data.only_employee_signs = document.only_employee_signs;
            promises.push(newDocument.save())
        }
    }
    await Promise.all(promises);
    //Изменяем названия элементов приложений, так как они больше не используются
    promises = [];
    const additional_agreement = ohter_documents.find(f => f.data.__name == 'Дополнительное соглашение');
    const personal_data_consent = ohter_documents.find(f => f.data.__name == 'Согласие на обработку персональных данных');
    if (additional_agreement) {
        additional_agreement.data.__name += ' (НЕ ИСПОЛЬЗОВАТЬ!)';
        promises.push(additional_agreement.save());
    }
    if (personal_data_consent) {
        personal_data_consent.data.__name += ' (НЕ ИСПОЛЬЗОВАТЬ!)';
        promises.push(personal_data_consent.save());
    }
    if (promises && promises.length > 0) {
        await Promise.all(promises);
    }
}