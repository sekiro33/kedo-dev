interface ITypeEvents {
    event_name: string,
    event_code: string,
    need_approval: boolean,
    cancel_signatory: boolean,
    start_settings_staff: {
        name: string,
        code: string,
    },
    start_settings_not_staff: {
        name: string,
        code: string,
    },
}

const EVENTSTYPE: ITypeEvents[] = [
    // {
    //     event_name: 'Заявка на трудоустройство',
    //     event_code: 'employment_app',
    //     need_approval: false,
    //     cancel_signatory: true,
    //     start_settings_staff: {
    //         name: "Без документов",
    //         code: "not_documents",
    //     },
    //     start_settings_not_staff: {
    //         name: "Без документов",
    //         code: "not_documents",
    //     },
    // },
    {
        event_name: 'Заявки на перевод',
        event_code: 'transfer_application',
        need_approval: false,
        cancel_signatory: true,
        start_settings_staff: {
            name: "Без документов",
            code: "not_documents",
        },
        start_settings_not_staff: {
            name: "Без документов",
            code: "not_documents",
        },
    },
    {
        event_name: 'Заявки на совмещения',
        event_code: 'execution_duties',
        need_approval: false,
        cancel_signatory: true,
        start_settings_staff: {
            name: "Без документов",
            code: "not_documents",
        },
        start_settings_not_staff: {
            name: "Без документов",
            code: "not_documents",
        },
    },
    // {
    //     event_name: 'Заявка на увольнение',
    //     event_code: 'dismissal_app',
    //     need_approval: false,
    //     cancel_signatory: true,
    //     start_settings_staff: {
    //         name: "Без документов",
    //         code: "not_documents",
    //     },
    //     start_settings_not_staff: {
    //         name: "Без документов",
    //         code: "not_documents",
    //     },
    // },
    // {
    //     event_name: 'Заявки на присвоение категории',
    //     event_code: 'category_assignment',
    //     need_approval: false,
    //     cancel_signatory: true,
    //     start_settings_staff: {
    //         name: "Без документов",
    //         code: "not_documents",
    //     },
    //     start_settings_not_staff: {
    //         name: "Без документов",
    //         code: "not_documents",
    //     },
    // },
    // {
    //     event_name: 'Заявки на изменение персональных данных',
    //     event_code: 'employees_personal_data',
    //     need_approval: false,
    //     cancel_signatory: true,
    //     start_settings_staff: {
    //         name: "Без документов",
    //         code: "not_documents",
    //     },
    //     start_settings_not_staff: {
    //         name: "Без документов",
    //         code: "not_documents",
    //     },
    // },
    {
        event_name: 'Отпуска/отсутствия',
        event_code: 'vacations',
        need_approval: false,
        cancel_signatory: true,
        start_settings_staff: {
            name: "Без документов",
            code: "not_documents",
        },
        start_settings_not_staff: {
            name: "Без документов",
            code: "not_documents",
        },
    },
    {
        event_name: 'Работа в нерабочее время',
        event_code: 'overtime_work',
        need_approval: false,
        cancel_signatory: true,
        start_settings_staff: {
            name: "Без документов",
            code: "not_documents",
        },
        start_settings_not_staff: {
            name: "Без документов",
            code: "not_documents",
        },
    },
    {
        event_name: 'Командировки',
        event_code: 'businesstrip_requests',
        need_approval: false,
        cancel_signatory: true,
        start_settings_staff: {
            name: "Без документов",
            code: "not_documents",
        },
        start_settings_not_staff: {
            name: "Без документов",
            code: "not_documents",
        },
    },
]

async function createEvents(): Promise<void> {
    let promises: Promise<void>[] = [];
    
    const created_apps = await Context.fields.settings_cancel_documents.app.search().where(f => f.__deletedAt.eq(null)).size(100).all();

    for (const event of EVENTSTYPE) {
        let app = created_apps.find(f => f.data.event_code == event.event_code);

        if (!app) {
            app = Context.fields.settings_cancel_documents.app.create();
        }

        app.data.event_name = event.event_name;
        app.data.event_code = event.event_code;
        app.data.need_approval = event.need_approval;
        app.data.cancel_signatory = event.cancel_signatory;
        app.data.start_settings_staff = app.fields.start_settings_staff.data.variants.find(e => e.code == event.start_settings_staff.code) as never;
        app.data.start_settings_not_staff = app.fields.start_settings_not_staff.data.variants.find(e => e.code == event.start_settings_not_staff.code) as never;

        promises.push(app.save());
    }

    await Promise.all(promises);
}
