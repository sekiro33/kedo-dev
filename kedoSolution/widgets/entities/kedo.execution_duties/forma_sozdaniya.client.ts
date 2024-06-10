/* Client scripts module */
declare const console: any;
declare const document: any;
let all_staffs: ApplicationItem<Application$kedo$staff$Data, any>[] = []
function show_error_message(text: string) {
    ViewContext.data.show_error = true;
    ViewContext.data.error_text = text;
}

function hide_error_message() {
    ViewContext.data.show_error = false;
    ViewContext.data.error_text = undefined;
}

async function onInit(): Promise<void> {
    ViewContext.data.fields_required = true;
    let user = await System.users.getCurrentUser();
    const initiator = await Context.fields.initiator.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user)
        ))
        .first();

    if (initiator) {
        const initiator_employment = await Context.fields.staff_employment_placement.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__status.eq(Context.fields.staff_employment_placement.app.fields.__status.variants.actual),
                f.staff.link(initiator)
            ))
            .size(100)
            .all();

        const organizations = initiator_employment
            .filter(f => f.data.organization != undefined)
            .map(f => f.data.organization!);

        Context.fields.staff.data.setFilter((f, c, g) => g.and(
            f.__deletedAt.eq(null),
            f.organization.link(organizations),
            f.__status.eq(Context.fields.substitute.app.fields.__status.variants.signed_documents)
        ));

        Context.fields.substitute.data.setFilter((f, c, g) => g.and(
            f.__deletedAt.eq(null),
            f.organization.link(organizations),
            f.__status.eq(Context.fields.substitute.app.fields.__status.variants.signed_documents)
        ));

        if (initiator.data.organization) {
            const organiaztion = await initiator.data.organization.fetch();

            if (organiaztion.data.signatories && organiaztion.data.signatories.length > 0) {
                const signatories_app = await Promise.all(organiaztion.data.signatories.map(f => f.fetch()));
                const signatories = signatories_app.filter(f => f.data.ext_user
                    && f.data.__status == f.fields.__status.variants.signed_documents);

                if (signatories.length > 0) {
                    Context.data.signatory = signatories[0];
                }
            }
            Context.data.organization = initiator.data.organization;

            if (initiator.data.employment_table && initiator.data.employment_table.length > 0) {
                Context.data.oragnizations = initiator.data.employment_table.map(f => f.organization);
            }
        }
        Context.data.initiator = initiator;
    }

    if (Context.data.staff) {
        let staff = await Context.data.staff.fetch();
        Context.data.oragnization = staff.data.organization;
    }

    if (ViewContext.data.__formType && ViewContext.data.__formType.code == ViewContext.fields.__formType.variants.edit.code) {
        ViewContext.data.view_result = true;
        Context.data.started_from_vacation_process = false;
        await subtitusuion_set();
    }
    // if (Context.data.started_from_vacation_process === true) {
    //     ViewContext.data.show_dates_string = true;
    // } else {
        ViewContext.data.show_dates_string = false;
    // }
    await check_form();

    all_staffs = await Context.fields.substitute.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__status.eq(Context.fields.substitute.app.fields.__status.variants.signed_documents)
    )).size(3000).all()

    //await infAboutActingSetFilter();
}

async function subtitusuion_set(): Promise<void> {
    if (Context.data.type_combination) {
        const type_combination = await Context.data.type_combination!.fetch();
        ViewContext.data.inf_about_acting_show = false;
        ViewContext.data.substitute_show = false;

        if (type_combination.data.code == 'substitution_only') {
            if (!Context.data.create_result || (Context.data.create_result && Context.data.create_result.code === Context.fields.create_result.variants.create.code)) {
                ViewContext.data.substitute_show = true;
                ViewContext.data.install_replacement_readonly = true;
                /* Context.fields.substitute.data.setFilter((f, c, g) => g.and(
                     f.__status.eq(Context.fields.staff.app.fields.__status.variants.signed_documents),
                     f.organization.link(Context.data.organization!)
                 ));*/
                if (Context.data.inf_about_acting && Context.data.inf_about_acting.length > 0) {
                    for (let i = Context.data.inf_about_acting.length - 1; i >= 0; i--) {
                        Context.data.inf_about_acting.delete(i);
                    }
                    Context.data.inf_about_acting = Context.data.inf_about_acting;
                }
            }
        } else {
            ViewContext.data.inf_about_acting_show = true;
            ViewContext.data.install_replacement_readonly = false;
            await changeInstallReplacement()
        }

    } else {
        ViewContext.data.inf_about_acting_show = false;
        ViewContext.data.substitute_show = false;
        if (Context.data.inf_about_acting && Context.data.inf_about_acting.length > 0) {
            for (let i = Context.data.inf_about_acting.length - 1; i >= 0; i--) {
                Context.data.inf_about_acting.delete(i);
            }
            Context.data.inf_about_acting = Context.data.inf_about_acting;
        }
    }
}

async function check_form(): Promise<void> {
    console.log('check form');
    let current_date = new Datetime;
    hide_error_message();
    ViewContext.data.block_error = false;
    await check_basis_app();

    if (Context.data.inf_about_acting && Context.data.inf_about_acting.length > 0) {
        await table_change();
    }

    if (Context.data.start_date && Context.data.end_date) {
        if (Context.data.staff) {
            //await insertion_check(Context.data.staff, false);
            //await check_staff_replacement(Context.data.staff, false);
        }

        if (Context.data.substitute) {
            await insertion_check(Context.data.substitute, true);
            await check_staff_replacement(Context.data.substitute, true);
        }

        if (Context.data.start_date.after(Context.data.end_date)) {
            show_error_message('Дата начала ИО не может быть позже даты окончания')
        }

        if (!Context.data.start_date.after(current_date.add(new Duration(-1, 'days')))) {
            show_error_message('Дата начала ИО не может быть раньше текущей даты')
        }

        if (!Context.data.end_date.after(current_date.add(new Duration(-1, 'days')))) {
            show_error_message('Дата окончания ИО не может быть раньше текущей даты')
        }
    }

    if (Context.data.staff && Context.data.substitute && Context.data.substitute.id == Context.data.staff.id) {
        show_error_message('Замещаемый не может быть выбран в качестве замещающего');
    }

    // if (ViewContext.data.previous_data !== JSON.stringify(await (Context.data.inf_about_acting as any).json())) {
    //     ViewContext.data.previous_data = JSON.stringify(await (Context.data.inf_about_acting as any).json());
    //     Context.data.inf_about_acting = Context.data.inf_about_acting
    // }
}

async function check_staff_replacement(staff: TApplication<Application$kedo$staff$Data, any, Application$kedo$staff_data$Processes>, isSubstitute: boolean): Promise<void> {
    if (staff) {
        const s = await staff.fetch();
        const user = s.data.ext_user;

        if (Context.data.start_date && Context.data.end_date) {
            const replacement = await System.replacements.search().where((f, g) => g.and(
                f.absent.eq(user!),
                g.and(
                    f.begin.lte(Context.data.end_date!),
                    f.end.gte(Context.data.start_date!)
                )
            )).first();

            if (replacement) {
                show_error_message(`Внимание! По ${isSubstitute == true ? 'замещающему' : 'замещаемому'} сотруднику ${s.data.__name} уже установлено автоделегирование задач c ${replacement.data.begin!.format('DD.MM.YYYY')} по ${replacement.data.end!.format('DD.MM.YYYY')}\n`);
            }
        }
    }
}

async function insertion_check(staff: TApplication<Application$kedo$staff$Data, any, Application$kedo$staff_data$Processes>, isSubstitute: boolean): Promise<void> {
    if (Context.data.start_date && Context.data.end_date && staff) {
        const vacations = await ViewContext.fields.vacation.app.search()
            .where((f, q) => q.and(
                f.__deletedAt.eq(null),
                q.or(
                    f.status.eq('signed;Утверждено'),
                    f.status.eq('transfer;Оформление переноса'),
                    f.status.eq('ongoing;В процессе'),
                ),
                f.kedo_staff.link(staff),
                q.or(
                    q.and(
                        f.start.gte(Context.data.start_date!.getDate()),
                        f.start.lte(Context.data.end_date!.getDate())
                    ),
                    q.and(
                        f.end.gte(Context.data.start_date!.getDate()),
                        f.end.lte(Context.data.end_date!.getDate())
                    )
                )
            ))
            .size(10000)
            .all();

        let dublicates: any[] = [];
        if (vacations && vacations.length > 0) {
            dublicates = dublicates.concat(vacations);
        }
        const staff_name = (await staff.fetch()).data.__name;
        if (dublicates && dublicates.length > 0) {
            let error = `Внимание! ${isSubstitute == true ? 'Замещающий сотрудник' : 'Замещаемый сотрудник'} ${staff_name} в указанный период будет отсутствовать. Причина:`
            for (let dublicate of dublicates) {
                error += '\n' + dublicate.data.__name + '; ';
            }
            show_error_message(error);
            if (isSubstitute) {
                ViewContext.data.block_error = true;
            }
        }
    }
}



//не удалять -в разработке (Юля)
async function check_basis_app(): Promise<void> {
    if (Context.data.app_basis) {
        const app_basis = await Context.data.app_basis.fetch();
        const app_basis_code = app_basis.code;
        if (app_basis_code === 'vacations') {
            // const vacation_app = app_basis as TApplication<Application$absences$vacations$Data, Application$absences$vacations$Params, Application$absences$vacations$Processes>;
            const vacation = app_basis;
            if (Context.data.start_date && Context.data.end_date && vacation.data.start && vacation.data.end) {
                if (Context.data.start_date.before(vacation.data.start)) {
                    show_error_message('Дата начала заявки на ИО указана раньше даты начала заявки на отпуск/отсутствие');
                    ViewContext.data.block_error = true;
                }
                if (Context.data.start_date.after(vacation.data.end)) {
                    show_error_message('Дата начала заявки на ИО указана позже даты окончания заявки на отпуск/отсутствие');
                    ViewContext.data.block_error = true;

                }
                if (Context.data.end_date.before(vacation.data.start)) {
                    show_error_message('Дата окончания заявки на ИО указана раньше даты начала заявки на отпуск/отсутствие');
                    ViewContext.data.block_error = true;

                }
                if (Context.data.end_date.after(vacation.data.end)) {
                    show_error_message('Дата окончания заявки на ИО указана позже даты окончания заявки на отпуск/отсутствие');
                    ViewContext.data.block_error = true;

                }

            }
        }
        if (app_basis_code === 'businesstrip_requests') {
            //@ts-ignore
            const businesstrip_requests_app = app_basis as TApplication<Application$business_trips$businesstrip_requests$Data, Application$business_trips$businesstrip_requests$Params, Application$business_trips$businesstrip_requests$Processes>;
            const businesstrip_requests = await businesstrip_requests_app.fetch();
            if (Context.data.start_date && Context.data.end_date && businesstrip_requests.data.start_date && businesstrip_requests.data.end_date) {
                if (Context.data.start_date.before(businesstrip_requests.data.start_date)) {
                    show_error_message('Дата начала заявки на ИО указана раньше даты начала заявки на командировку');
                    ViewContext.data.block_error = true;

                }
                if (Context.data.start_date.after(businesstrip_requests.data.end_date)) {
                    show_error_message('Дата начала заявки на ИО указана позже даты окончания заявки на командировку');
                    ViewContext.data.block_error = true;

                }
                if (Context.data.end_date.before(businesstrip_requests.data.start_date)) {
                    show_error_message('Дата окончания заявки на ИО указана раньше даты начала заявки на командировку');
                    ViewContext.data.block_error = true;

                }
                if (Context.data.end_date.after(businesstrip_requests.data.end_date)) {
                    show_error_message('Дата окончания заявки на ИО указана позже даты окончания заявки на командировку');
                    ViewContext.data.block_error = true;

                }
            }
        }
    } else {
        hide_error_message();
        ViewContext.data.block_error = false;
    }
}

async function table_change(): Promise<void> {
    await checkLengthTable()
    ViewContext.data.inf_about_acting_warning_visible = false;
    ViewContext.data.inf_about_acting_warning_text = undefined;

    let alternate_ids: string[] = [];

    const table = Context.data.inf_about_acting;

    if (table && table.length > 0) {
        const employment_placements = await Promise.all(table.map(f => f.substitute_employment_placement.fetch()));

        const external_combination = employment_placements.filter(f => f.data.type_employment?.code == 'external_combination');

        /**
         * Если есть вн. совместительства, то выводим предупреждение.
         */
        if (external_combination.length > 0) {
            const external_combination_staff = await Promise.all(external_combination.map(f => f.data.staff!.fetch()));

            //Вывод предупреждения о внешнем совместительстве.
            ViewContext.data.inf_about_acting_warning_visible = true;
            ViewContext.data.inf_about_acting_warning_text = `
            <div>
                <p>Внимание! Проверьте максимально допустимое кол-во часов по совместительству при оформлении замещения на:</p>
                <ul>
                    ${external_combination_staff.map(f => `<li>${f.data.__name}</li>`)}
                </ul>
            </div>`;
        }

        const staffs = await Promise.all(employment_placements.map(f => f.data.staff!.fetch()));

        for (let i = 0; i < table.length; i++) {
            const row = table[i];
            if (!row.organization && Context.data.organization) {
                row.organization = Context.data.organization;
            }
            const employment_place = employment_placements.find(f => f.id == row.substitute_employment_placement.id);

            const staff = staffs.find(f => f.id == employment_place?.data.staff?.id)!;

            row.substitute = staff;

            await check_staff_replacement(staff, true);
            await insertion_check(staff, true);
            alternate_ids.push(staff.id);
        }
        // Context.fields.substitute.data.setFilter(fc => fc.__id.in(alternate_ids));
    }
}

async function validation(): Promise<ValidationResult> {
    let current_date = new Datetime;
    console.log("validate")
    let kedo_settings = await ViewContext.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq("max_total_percent_substitution")
        )).first();
    let total: number = 0;
    let alternate_ids: string[] = [];
    const result = new ValidationResult();
    
    if (Context.data.inf_about_acting && Context.data.inf_about_acting.length > 0) {
        for (let i = 0; i < Context.data.inf_about_acting.length; i++) {
            let row = Context.data.inf_about_acting[i];
            alternate_ids.push(row.substitute.id);
            if (row.percent > 0 && row.type_surcharge.code != Context.fields.inf_about_acting.fields.type_surcharge.variants.fixed_amount.code) {
                total += row.percent
            }
        }
    }
    //console.log(alternate_ids)
    //console.log("staff id")
    //console.log(Context.data.staff!.id)
    //console.log(alternate_ids!.indexOf(Context.data.staff!.id) > -1)
    if (Context.data.posted_result == undefined || Context.data.posted_result.code !== Context.fields.posted_result.variants.reject.code) {
        if (Context.data.staff && alternate_ids.indexOf(Context.data.staff!.id) > -1) {
            result.addMessage('Замещаемый не может быть выбран в качестве замещающего');
        }
        if ((kedo_settings && kedo_settings.data.status && kedo_settings.data.quantity) && total > kedo_settings.data.quantity) {
            result.addMessage('Максимальный суммарный процент доплаты за ИО не может быть больше ' + kedo_settings.data.quantity)
        }
        if (Context.data.staff && Context.data.substitute && Context.data.substitute.id == Context.data.staff.id) {
            result.addMessage('Замещаемый не может быть выбран в качестве замещающего');
        }
        if (new Set(alternate_ids).size !== alternate_ids.length) {
            result.addContextError('inf_about_acting', 'Выбор одного заместителя несколько раз не возможен');
        }
        if (Context.data.substitution_date && Context.data.start_date && Context.data.substitution_date.after(Context.data.start_date)) {
            result.addContextError('substitution_date', 'Дата выбора замещения не может быть после Даты начала замещения');
        }
        if (Context.data.substitution_date && Context.data.end_date && Context.data.substitution_date.after(Context.data.end_date)) {
            result.addContextError('substitution_date', 'Дата выбора замещения не может быть после Даты окончания замещения')
        }
        if (ViewContext.data.block_error == true) {
            result.addMessage('Ознакомьтесь с ошибками ниже и исправьте их');
        }
        if (Context.data.start_date && Context.data.end_date) {
            if (Context.data.start_date.after(Context.data.end_date)) {
                result.addContextError('start_date', 'Дата начала ИО не может быть позже даты окончания')
            }

            if (!Context.data.start_date.after(current_date.add(new Duration(-1, 'days')))) {
                result.addContextError('start_date', 'Дата начала ИО не может быть раньше текущей даты')
            }

            if (!Context.data.end_date.after(current_date.add(new Duration(-1, 'days')))) {
                result.addContextError('end_date', 'Дата окончания ИО не может быть раньше текущей даты')
            }
            // if (new Date(Context.data.start_date.day, Context.data.start_date.month, Context.data.start_date.year) < (new Date(current_date.day, current_date.month, current_date.year))) {
            //     result.addContextError('start_date', 'Дата начала ИО не может быть раньше текущей даты')
            // }
            // if (new Date(Context.data.end_date.day, Context.data.end_date.month, Context.data.end_date.year) < (new Date(current_date.day, current_date.month, current_date.year))) {
            //     result.addContextError('end_date', 'Дата окончания ИО не может быть раньше текущей даты')
            // }
        }
    } else {
        ViewContext.data.inf_about_acting_show = false;
        ViewContext.data.substitute_show = false;
    }
    return result
}

async function changeRequriedFields(): Promise<void> {
    Context.data.define_substitution_later = false;
    Context.data.substitution_date = undefined;
    ViewContext.data.fields_required = false;
    if (Context.data.create_result) {
        if (Context.data.create_result.code == Context.fields.create_result.variants.create.code) {
            ViewContext.data.fields_required = true;
            await subtitusuion_set();
        }
        if (Context.data.create_result.code == Context.fields.create_result.variants.set_later.code) {
            Context.data.define_substitution_later = true;
            ViewContext.data.inf_about_acting_show = false;
            ViewContext.data.substitute_show = false;
        }
        if (Context.data.create_result.code == Context.fields.create_result.variants.cancel.code) {
            ViewContext.data.inf_about_acting_show = false;
            ViewContext.data.substitute_show = false;
        }
    }
}

/** Событие при изменении места занятости замещаемого сотрудника. */
async function staffEmploymentPlacementOnChange(): Promise<void> {
    // Очищаем таблицу.
    Context.data.inf_about_acting = Context.fields.inf_about_acting.create();

    //await infAboutActingSetFilter();
}

class CustomFilter {
    constructor(private filter: any) {

    }

    json() {
        return this.filter;
    }
}

// async function infAboutActingSetFilter(): Promise<void> {
//     if (!Context.data.staff_employment_placement) {
//         Context.fields.inf_about_acting.fields.substitute_employment_placement.data.setFilter((f, c, g) => g.and(
//             f.__id.eq(null)
//         ));
//         return;
//     }

//     const substitute_employment_place = await Context.data.staff_employment_placement.fetch();

//     let ids: string[] = [];

//     console.log('here 01');

//     /** Очень плохой костыль, но работает как нужно. */
//     const elems = await Context.fields.staff_employment_placement.app.search()
//         .where((f, g) => g.and(
//             f.__deletedAt.eq(null),
//             f.__status.eq(Context.fields.staff_employment_placement.app.fields.__status.variants.actual),
//             f.organization.link(substitute_employment_place.data.organization!),
//         ))
//         .size(10000)
//         .all();

//     if (all_staffs?.length) {
//         ids = elems
//             .filter(e => e.data.staff?.id != Context.data.staff?.id &&
//                 all_staffs.find(item => e.data.staff &&
//                     item.data.__id == e.data.staff.id &&
//                     item.data.__status!.code == Context.fields.substitute.app.fields.__status.variants.signed_documents.code)
//             )
//             .map(e => e.data.__id);
//     } else {
//         ids = elems
//             .filter(e => e.data.staff?.id != Context.data.staff?.id)
//             .map(e => e.data.__id);
//     }

//     Context.fields.inf_about_acting.fields.substitute_employment_placement.data.setFilter((f, c, g) => g.and(
//         f.__id.in(ids)
//     ));

//     // Context.fields.inf_about_acting.fields.substitute_employment_placement.data.setFilter((f, c, g) => g.and(
//     //     f.__deletedAt.eq(null),
//     //     f.__status.eq(Context.fields.inf_about_acting.fields.substitute_employment_placement.app.fields.__status.variants.actual),
//     //     f.organization.link(substitute_employment_place.data.organization!),
//     // ));
// }

async function changeInstallReplacement(): Promise<void> {
    if (Context.data.install_replacement) {
        ViewContext.data.substitute_show = true;
    } else {
        ViewContext.data.substitute_show = false;
    }
}

async function checkLengthTable(): Promise<void> {
    const children = document.querySelectorAll('elma-type-table-full-line') //ищем все табличные строки на странице
    console.log(children)
    const lastRow = children[children.length - 2];//Последняя строка - всегда футер таблицы, поэтому берем пред-предыдущую строку
    if (Context.data.inf_about_acting!.length == 5) {
        lastRow.style.display = 'none';//Отключаем отображение
    } else {
        lastRow.style.display = '';
    }
}

