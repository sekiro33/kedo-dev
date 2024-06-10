/* Client scripts module */
let massive_id_app: string[];
declare let console: any;
declare const document: any;
async function onInit(): Promise<void> {

    //Ищем виды документов, где флаг "Необходим для анкеты кандидата по умолчанию" = true;
    const type_docs = await Context.fields.table_personal_documents.fields.document_type.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.required_for_candidate.eq(true)
    )).size(10000).all();
    //Записываем такие документы в таблицу
    for (let item of type_docs) {
        const row = Context.data.table_personal_documents!.insert();
        row.document_type = item;
    }
    Context.data.table_personal_documents = Context.data.table_personal_documents;

    ViewContext.data.required_phone = true;

    if (Context.data.phone) {
        ViewContext.data.phone_check = Context.data.phone;
    }
    if (Context.data.date_of_birth) {
        ViewContext.data.date_check = Context.data.date_of_birth;
    }
}

async function checkData(): Promise<void> {

    let error_date_candidate: boolean = false;
    let error_date_staff: boolean = false;

    ViewContext.data.text_error = 'Найден схожий кандидат с таким же ФИО'
    ViewContext.data.text_error_staff = 'Найден схожий сотрудник с таким же ФИО'


    let firstname = Context.data.firstname ? Context.data.firstname : '';
    let lastname = Context.data.lastname ? Context.data.lastname : '';
    let middlename = Context.data.middlename ? Context.data.middlename : '';
    Context.data.__name = lastname + ' ' + firstname + ' ' + middlename;

    let candidate_double_date;
    if (Context.data.date_of_birth) {
        candidate_double_date = await ViewContext.fields.candidate_double.app.search()
            .where((f, g) => g.and(
                f.__name.eq(Context.data.__name),
                f.__deletedAt.eq(null),
                f.date_of_birth.eq(Context.data.date_of_birth!),
                f.__id.neq(Context.data.__id)
            ))
            .first();
    }
    let staff_double_date;
    if (Context.data.date_of_birth) {
        staff_double_date = await ViewContext.fields.staff_double.app.search()
            .where((f, g) => g.and(
                f.__name.eq(Context.data.__name),
                f.__deletedAt.eq(null),
                f.date_of_birth.eq(Context.data.date_of_birth!)
            ))
            .first();
    }
    const candidate_double = await ViewContext.fields.candidate_double.app.search()
        .where((f, g) => g.and(
            f.__name.eq(Context.data.__name),
            f.__deletedAt.eq(null),
            f.__id.neq(Context.data.__id)
        ))
        .first();
    const staff_double = await ViewContext.fields.staff_double.app.search()
        .where((f, g) => g.and(
            f.__name.eq(Context.data.__name),
            f.__deletedAt.eq(null),
        ))
        .first();

    if (candidate_double) {
        ViewContext.data.candidate_double = candidate_double;
        ViewContext.data.date_str = candidate_double.data.date_of_birth?.format('DD.MM.YYYY');
        ViewContext.data.phone_tel = candidate_double.data.phone?.tel;

        if (candidate_double_date) {
            ViewContext.data.candidate_double = candidate_double_date;
            ViewContext.data.date_str = candidate_double_date.data.date_of_birth?.format('DD.MM.YYYY');
            ViewContext.data.phone_tel = candidate_double_date.data.phone?.tel;
            ViewContext.data.text_error += ' и датой рождения';
            error_date_candidate = true;
        }

        if (error_date_candidate === true) {
            ViewContext.data.view_error = true;
            ViewContext.data.view_warning = false;
        } else {
            ViewContext.data.view_warning = true;
            ViewContext.data.view_error = false;
        }
    } else {
        ViewContext.data.view_error = false;
        ViewContext.data.view_warning = false;
    }

    if (staff_double) {
        ViewContext.data.staff_double = staff_double;
        ViewContext.data.date_str_staff = staff_double.data.date_of_birth?.format('DD.MM.YYYY');
        ViewContext.data.phone_tel_staff = staff_double.data.phone?.tel;

        if (staff_double_date) {
            if (ViewContext.data.date_check && staff_double_date.data.date_of_birth && ViewContext.data.date_check.equal(staff_double_date.data.date_of_birth)) {
            } else {
                ViewContext.data.staff_double = staff_double_date;
                ViewContext.data.date_str_staff = staff_double_date.data.date_of_birth?.format('DD.MM.YYYY');
                ViewContext.data.phone_tel_staff = staff_double_date.data.phone?.tel;
                ViewContext.data.text_error_staff += ' и датой рождения';
                error_date_staff = true;
            }
        }

        if (error_date_staff === true) {
            ViewContext.data.view_error_staff = true;
            ViewContext.data.view_warning_staff = false;
        } else {
            ViewContext.data.view_warning_staff = true;
            ViewContext.data.view_error_staff = false;
        }
    } else {
        ViewContext.data.view_error_staff = false;
        ViewContext.data.view_warning_staff = false;
    }

    const buttons = document.getElementsByClassName("btn btn-primary")
    for (let button of buttons) {
        if (button.innerHTML.indexOf("Сохранить") != -1) {
            if (ViewContext.data.view_error === true || ViewContext.data.view_error_staff === true) {
                button.disabled = true
            } else {
                button.disabled = false
            }
        }
    }
}

async function changeTable(): Promise<void> {
    const all_docs = await Context.fields.table_personal_documents.fields.document_type.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null)
    )).size(10000).all();
    massive_id_app = all_docs.map(f => f.id);
    console.log(massive_id_app)
    Context.fields.table_personal_documents.fields.document_type.data.clearFilter();

    if (Context.data.table_personal_documents && Context.data.table_personal_documents.length > 0) {
        let massive_id_table = Context.data.table_personal_documents.map(f => f.document_type.id);
        console.log(massive_id_table)
        let filtred_massive = massive_id_app.filter((item) => (massive_id_table.indexOf(item) == -1))

        Context.fields.table_personal_documents.fields.document_type.data.setFilter(f => f.__id.in(filtred_massive))

    }
}

async function changePosition(): Promise<void> {
    if (Context.data.planned_position) {
        const position = await Context.data.planned_position.fetch();
        const division = await position.data.subdivision!.fetch();
        if (division.data.custom_html_card) {
            Context.data.info_candidate = division.data.custom_html_card
        }
    }
}

async function changeNotification(): Promise<void> {
    if (Context.data.notification) {
        if (Context.data.notification.code == Context.fields.notification.variants.email.code) {
            ViewContext.data.required_email = true;
            ViewContext.data.required_phone = false;
        }
        if (Context.data.notification.code == Context.fields.notification.variants.sms.code) {
            ViewContext.data.required_email = false;
            ViewContext.data.required_phone = true;
        }
    }
}

//Проверяем совпадения по номеру телефона с базой кандидатов и сотрудников
async function setPhone(): Promise<void> {
    if (Context.data.phone) {
        const phone_double = await ViewContext.fields.candidate_double.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.phone.eq(Context.data.phone!),
                f.__id.neq(Context.data.__id)
            ))
            .first();

        let phone_double_staff: any;
        if (ViewContext.data.phone_check) {
            phone_double_staff = await ViewContext.fields.staff_double.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.phone.eq(Context.data.phone!),
                    f.phone.neq(ViewContext.data.phone_check!)
                ))
                .first();
        } else {
            phone_double_staff = await ViewContext.fields.staff_double.app.search()
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.phone.eq(Context.data.phone!)
                ))
                .first();
        }

        if (phone_double) {
            ViewContext.data.error_phone_candidate = true;
            ViewContext.data.phone_candidate = phone_double;

        } else {
            ViewContext.data.error_phone_candidate = false;
        }

        if (phone_double_staff) {
            ViewContext.data.error_phone_staff = true;
            ViewContext.data.phone_staff = phone_double_staff;

        } else {
            ViewContext.data.error_phone_staff = false;
        }
    } else {
        ViewContext.data.error_phone_candidate = false;
        ViewContext.data.error_phone_staff = false;
    }

    const buttons = document.getElementsByClassName("btn btn-primary")
    for (let button of buttons) {
        if (button.innerHTML.indexOf("Сохранить") != -1) {
            if (ViewContext.data.error_phone_candidate === true || ViewContext.data.error_phone_staff === true) {
                button.disabled = true
            } else {
                button.disabled = false
            }
        }
    }
}
