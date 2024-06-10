type Staff = ApplicationItem<Application$kedo$staff$Data, any>;

// Статус трудоустроен.
const signed_document = Context.fields.staffs.app.fields.__status.variants.signed_documents;

async function onInit(): Promise<void> {
    const user = await System.users.getCurrentUser();

    const staff = await Context.fields.staffs.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(user)
    )).first();

    if (!staff) {
        // Не найдена карточка сотрудника. Блокируем дальнейшие действия.
        ViewContext.data.show_generate_by = false;
        await show_infoblock('Не найдена карточка сотрудника. Дальнейшие действия заблокированы.');
        return;
    }

    if (!staff.data.organization) {
        // У сотрудника не указана организация. Блокируем дальнейшние действия.
        ViewContext.data.show_generate_by = false;
        await show_infoblock('У вас не указана орагнизация. Дальнейшие действия заблокированы.');
    }

    // Устанавливаем текущую дату и год.
    await set_date();
    // Расчёт периода.
    await set_period();

    // Устанавливаем ограничения на выбор приложений:
    //  - Только организация сотрудника-инициатора
    //  - Только подразделения организации сотрудника-инициатора
    //  - Только сотрудники организации сотрудника-инициатора
    Context.fields.organization.data.setFilter((f, c, g) => f.__id.eq(staff.data.organization!.id));
    Context.fields.subdivisions.data.setFilter((f, c, g) => g.and(
        f.__deletedAt.eq(null),
        f.organization.link(staff.data.organization!)
    ));
    Context.fields.staffs.data.setFilter((f, c, g) => g.and(
        f.__deletedAt.eq(null),
        f.organization.link(staff.data.organization!),
        f.__status.eq(signed_document),
    ));
}

// На основе текущей даты установить год и месяц.
async function set_date(): Promise<void> {
    const currentDate = new Datetime();
    const month = currentDate.month;

    Context.data.year = String(currentDate.year);

    switch (month) {
        case 1:
            Context.data.month = Context.fields.month.variants.january;
            break;

        case 2:
            Context.data.month = Context.fields.month.variants.february;
            break;

        case 3:
            Context.data.month = Context.fields.month.variants.march;
            break;

        case 4:
            Context.data.month = Context.fields.month.variants.april;
            break;

        case 5:
            Context.data.month = Context.fields.month.variants.may;
            break;

        case 6:
            Context.data.month = Context.fields.month.variants.june;
            break;

        case 7:
            Context.data.month = Context.fields.month.variants.july;
            break;

        case 8:
            Context.data.month = Context.fields.month.variants.august;
            break;

        case 9:
            Context.data.month = Context.fields.month.variants.september;
            break;

        case 10:
            Context.data.month = Context.fields.month.variants.october;
            break;

        case 11:
            Context.data.month = Context.fields.month.variants.november;
            break;

        case 12:
            Context.data.month = Context.fields.month.variants.december;
            break;

        default:
            break;
    }
}

// Вычисление расчётного периода.
async function set_period(): Promise<void> {
    if (Context.data.month && Context.data.year) {
        const year = Number(Context.data.year);
        const month = Context.fields.month.data.variants.findIndex(f => f.code == Context.data.month!.code) + 1;
        const start_date = new TDate(year, month, 1);
        const end_date = new TDate(year, month + 1, 1).addDate(0, 0, -1);
        Context.data.start_date = start_date;
        Context.data.end_date = end_date;
        ViewContext.data.period = `с ${start_date.format('DD MMMM YYYY г.')} по ${end_date.format('DD MMMM YYYY г.')}`;
    }
}

async function organization_onchange(): Promise<void> {
    await hide_infoblock();

    if (!Context.data.organization) {
        return;
    }

    // Получаем список сотрудников, у которых не указан ID 1C.
    const staffs = await Context.fields.staffs.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.organization.link(Context.data.organization!),
        f.__status.eq(signed_document),
        g.or(
            f.id_1c.eq(null),
            f.individual_id_1c.eq(null),
        ),
    )).size(1000).all();

    if (staffs.length > 0) {
        const staffs_link = generate_staffs_links(staffs);
        await show_infoblock(`<p>У следующих сотрудников отсутствует идентификатор 1С. Для этих сотрудников <b>расчётный лист не будет сформирован</b>:</p>\n ${staffs_link}`);
    }
}

async function subdivisions_onchange(): Promise<void> {
    await hide_infoblock();

    if (Context.data.subdivisions) {
        const staffs = await Context.fields.staffs.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__status.eq(signed_document),
            f.structural_subdivision.link(Context.data.subdivisions!),
            g.or(
                f.id_1c.eq(null),
                f.individual_id_1c.eq(null)
            )
        )).size(1000).all();

        const staffs_map: Map<string, Staff[]> = new Map<string, Staff[]>();

        for (const staff of staffs) {
            if (!staff.data.structural_subdivision) {
                continue;
            }

            if (staffs_map.has(staff.data.structural_subdivision.id)) {
                const value = staffs_map.get(staff.data.structural_subdivision.id);
                value!.push(staff);
            } else {
                staffs_map.set(staff.data.structural_subdivision.id, [staff]);
            }
        }

        let infoblock_text = `<p>У следующих сотрудников отсутствует идентификатор 1С. Для этих сотрудников <b>расчётный лист не будет сформирован</b>:</p>\n`;

        const subdivisions_ids = staffs.map(s => s.data.structural_subdivision!.id);

        const subdivisions = await Context.fields.subdivisions.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(subdivisions_ids)
        )).size(1000).all();

        for (const subdivision of subdivisions) {
            const staffs = staffs_map.get(subdivision.id);

            if (!staffs || staffs.length == 0) {
                continue;
            }

            infoblock_text += `<p>${subdivision.data.__name}</p>\n ${generate_staffs_links(staffs)}\n`;
        }

        if (staffs.length > 0) {
            await show_infoblock(infoblock_text);
        }
    }
}

declare const console: any;

async function staffs_onchange(): Promise<void> {
    await hide_infoblock();

    if (Context.data.staffs) {
        const staffs_ids = Context.data.staffs.map(f => f.id);

        const bad_staffs = await Context.fields.staffs.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(staffs_ids),
            f.__status.eq(signed_document),
            g.or(
                f.id_1c.eq(null),
                f.individual_id_1c.eq(null),
            )
        )).size(1000).all();

        if (bad_staffs.length > 0) {
            const staffs_link = generate_staffs_links(bad_staffs);
            await show_infoblock(`<p>У следующих сотрудников отсутствует идентификатор 1С. Для этих сотрудников <b>расчётный лист не будет сформирован</b>:</p>\n ${staffs_link}`);
        }
    }
}

async function generate_by_onchange(): Promise<void> {
    // Очищаем и скрываем все поля.
    await hide_fields();
    await clear_fields();

    if (Context.data.generate_by) {
        switch (Context.data.generate_by.code) {
            case Context.fields.generate_by.variants.organization.code:
                ViewContext.data.show_organization = true;
                break;

            case Context.fields.generate_by.variants.subdivision.code:
                ViewContext.data.show_subdivision = true;
                break;

            case Context.fields.generate_by.variants.staff.code:
                ViewContext.data.show_staffs = true;
                break;

            default:
                break;
        }
    }
}

function generate_staffs_links(staffs: Staff[]): string {
    return `<ul>${staffs.map(s => `<li><a target="_blank" href="(p:item/kedo/staff/${s.id})">${s.data.__name}</a></li>`).join('')}</ul>`;
}

async function show_infoblock(text: string): Promise<void> {
    ViewContext.data.show_infoblock = true;
    ViewContext.data.infoblock_text = `<div style="display: flex; flex-direction: column;">${text}</div>`;
}

async function hide_infoblock(): Promise<void> {
    ViewContext.data.show_infoblock = false;
    ViewContext.data.infoblock_text = undefined;
}

async function hide_fields(): Promise<void> {
    ViewContext.data.show_organization = false;
    ViewContext.data.show_staffs = false;
    ViewContext.data.show_subdivision = false;
}

async function clear_fields(): Promise<void> {
    Context.data.organization = undefined;
    Context.data.subdivisions = undefined;
    Context.data.staffs = undefined;
}