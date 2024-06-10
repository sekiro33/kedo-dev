
interface IDocument {
    name: string;
    app_namespace: string;
    app_code: string;
    code: string;
    article: string;
}

let documents: IDocument[] = [
    {
        app_code: 'labor_contract',
        article: '67',
        app_namespace: 'kedo',
        code: '01.006',
        name: 'Трудовой договор',
    },
    {
        app_code: 'overtime_work',
        article: '96, 259',
        app_namespace: 'time_tracking',
        code: '02.006',
        name: 'Согласие работника на привлечение к работе в ночное время, незапрещенной ему по состоянию здоровья в соответствии с медицинским заключением',
    },
    {
        app_code: 'overtime_work',
        article: '99, 259',
        app_namespace: 'time_tracking',
        code: '02.008',
        name: 'Согласие работника на привлечение его к сверхурочной работе',
    },
    {
        app_code: 'overtime_work',
        article: '113, 259, 290',
        app_namespace: 'time_tracking',
        code: '02.010',
        name: 'Согласие работника на привлечение его к работе в выходные и нерабочие праздничные дни',
    },
    {
        app_code: 'vacation_docs',
        article: '124',
        app_namespace: 'absences',
        code: '02.013',
        name: 'Заявление работника о переносе ежегодного оплачиваемого отпуска на другой срок',
    },
    {
        app_code: 'application_for_leave_without_pay',
        article: '128',
        app_namespace: 'personnel_documents',
        code: '02.015',
        name: 'Заявление работника о предоставлении отпуска без сохранения заработной платы',
    },
    {
        app_code: 'vacation_docs',
        article: '128',
        app_namespace: 'absences',
        code: '02.015',
        name: 'Заявление работника о предоставлении отпуска без сохранения заработной платы',
    },
    {
        app_code: 'overtimeWorkNotifications',
        article: '99',
        app_namespace: 'time_tracking',
        code: '02.023',
        name: 'Ознакомление с правом отказаться от сверхурочной работы',
    },
    {
        app_code: 'labor_contract',
        article: '71, 80, 348.12',
        app_namespace: 'kedo',
        code: '11.002',
        name: 'Предупреждение о расторжении трудового договора по собственному желанию',
    },
    {
        app_code: 'information_about_labor_activity',
        article: '66.1',
        app_namespace: 'kedo',
        code: '12.002',
        name: 'Заявление о предоставлении сведений о трудовой деятельности',
    },
    {
        app_code: '-',
        article: '-',
        app_namespace: '-',
        code: '12.999',
        name: 'Иные документы',
    }
]

async function set_types(): Promise<void> {
    const document_codes = documents.map(f => f.code);

    const all_documents = await Application.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.in(document_codes)
        ))
        .size(10000)
        .all();

    let promises: Promise<void>[] = [];

    for (const document of documents) {
        if (all_documents.find(f => f.data.code == document.code)) {
            continue;
        }

        const new_document = Application.create();
        new_document.data.__name = document.name;
        new_document.data.code = document.code;
        new_document.data.app_code = document.app_code;
        new_document.data.app_namespace = document.app_namespace;
        new_document.data.article = document.article;
        promises.push(new_document.save());

        if (promises.length > 20) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);
}
