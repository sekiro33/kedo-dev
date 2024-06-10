/* Client scripts module */

declare const console: any;

async function onInit(): Promise<void> {
    ViewContext.data.warning_text = ''
    ViewContext.data.view_warning = false;
    Context.data.transfer_table = undefined;
    ViewContext.data.view_table = false;
    ViewContext.data.view_organization = false;
    ViewContext.data.change_department_position = false;
    Context.data.new_position = undefined;
    ViewContext.data.show_work_schedules = false;
    ViewContext.data.work_shedules_required = false;
    ViewContext.data.show_remote_work = false;
    Context.data.transfer_during_absence = undefined;
    Context.data.cause_temporary_transfer = undefined;
    ViewContext.data.show_missing = false;

    ViewContext.data.view_table = false;

    Context.fields.new_position.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
        appFields.is_closed.eq(false)
    ));
    Context.fields.structural_subdivision.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
        appFields.is_closed.eq(false)
    ));

    let user = await System.users.getCurrentUser();
    if (!Context.data.staff) {
        let staff = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(user)
            ))
            .first();
        if (staff) {
            Context.data.staff = staff;
        }
    }

    const current_staff = await Context.data.staff!.fetch();
    Context.data.transfer_date = new TDate();
    if (current_staff.data.organization) {
        Context.data.organization = current_staff.data.organization;
        ViewContext.data.app_organization_view = current_staff.data.organization;
        Context.fields.transfer_during_absence.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
            appFields.organization.link(Context.data.organization!)
        ));
    }

    if (Context.data.transferred_staff_table!.length === 0) {
        const row = Context.data.transferred_staff_table!.insert();
        row.staff = Context.data.staff!;
        Context.data.transferred_staff_table = Context.data.transferred_staff_table;
    }
    const hr_group = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('hr_department')
        ))
        .first();
    if (hr_group) {
        const usersArrays = await Promise.all(hr_group.data.members!.map(x => x.getUsers()));
        const users = usersArrays.reduce((a, b) => a.concat(b));
        if (users.find(f => f.id === user.id)) {
            Context.data.iniciator_manager_hr = true;
        } else {
            Context.data.iniciator_manager_hr = false;
        }
    }
    if (ViewContext.data.__formType && ViewContext.data.__formType.code == ViewContext.fields.__formType.variants.edit.code) {
        ViewContext.data.view_result = true;
    }
    if (Context.data.transfer_type) {
        await changeType();
    }
    await checkTemporaryTransfer();
}



async function changeType(): Promise<void> {
    if (Context.data.transfer_type) {
        switch (Context.data.transfer_type.code) {
            case "transfer_another_position": {
                ViewContext.data.warning_text = ''
                ViewContext.data.view_warning = false;
                Context.data.transfer_table = undefined;
                ViewContext.data.view_table = false;
                ViewContext.data.view_organization = false;
                ViewContext.data.change_department_position = true;
                ViewContext.data.show_work_schedules = false;
                ViewContext.data.show_remote_work = true;
                ViewContext.data.work_shedules_required = false;
                Context.data.date_end = undefined;
                await checkTemporaryTransfer();

                break;
            }
            case "work_condition_change": {
                ViewContext.data.warning_text = ''
                ViewContext.data.view_warning = false;
                Context.data.transfer_table = undefined;
                ViewContext.data.view_table = true;
                ViewContext.data.view_organization = false;
                ViewContext.data.change_department_position = false;
                Context.data.new_position = undefined;
                ViewContext.data.show_work_schedules = false;
                ViewContext.data.show_remote_work = false;
                ViewContext.data.work_shedules_required = true;
                ViewContext.data.show_cause_temporary_transfer = false;
                Context.data.transfer_during_absence = undefined;
                Context.data.cause_temporary_transfer = undefined;
                ViewContext.data.show_missing = false;

                break;
            }
            case "change_of_schedule": {
                ViewContext.data.warning_text = ''
                ViewContext.data.view_warning = false;
                Context.data.transfer_table = undefined;
                ViewContext.data.view_table = true;
                ViewContext.data.view_organization = false;
                ViewContext.data.change_department_position = false;
                Context.data.new_position = undefined;
                ViewContext.data.show_work_schedules = false;
                ViewContext.data.work_shedules_required = true;
                ViewContext.data.show_cause_temporary_transfer = false;
                ViewContext.data.show_remote_work = true;
                Context.data.transfer_during_absence = undefined;
                Context.data.cause_temporary_transfer = undefined;
                ViewContext.data.show_missing = false;

                break;
            }
            default: {
                break;
            }
        }
    } else {
        ViewContext.data.warning_text = ''
        ViewContext.data.view_warning = false;
        Context.data.transfer_table = undefined;
        ViewContext.data.view_table = false;
        ViewContext.data.view_organization = false;
        ViewContext.data.change_department_position = false;
        Context.data.new_position = undefined;
        ViewContext.data.show_work_schedules = false;
        ViewContext.data.work_shedules_required = false;
        ViewContext.data.show_cause_temporary_transfer = false;
        ViewContext.data.show_remote_work = false;
        Context.data.transfer_during_absence = undefined;
        Context.data.cause_temporary_transfer = undefined;
        ViewContext.data.show_missing = false;
    }
}


async function set_structural_subdivision(): Promise<void> {
    if (Context.data.new_position) {
        ViewContext.data.view_table = true;
        ViewContext.data.view_organization = true;
        Context.data.transfer_table = undefined;
        const position = await Context.data.new_position.fetch();

        Context.data.structural_subdivision = position.data.subdivision;
        if (ViewContext.data.show_missing === true && position.data.staff && position.data.staff.length === 1) {
            Context.data.transfer_during_absence = position.data.staff[0];
        }

        if (position.data.organization && Context.data.transfer_type && Context.data.transfer_type.code === Context.fields.transfer_type.variants.transfer_another_position.code) {
            const transfer_row_table = Context.data.transfer_table!.insert();
            transfer_row_table.filter_organization = position.data.organization!;
            Context.data.transfer_table = Context.data.transfer_table;

            Context.data.organization = position.data.organization;
            ViewContext.data.filter_organization = position.data.organization;
        }

        //Закоменчено для выгрузки ТН 31.05.2023
        // Context.data.employment_type = position.data.employment_type;
        // Context.data.schedule_work_new = position.data.work_schedules;
        // Context.data.workplace_new = position.data.work_place;
        // Context.data.type_employment_relationship = position.data.type_employment_relationship;

    } else {
        if (Context.data.transfer_table && Context.data.transfer_type && Context.data.transfer_type.code === Context.fields.transfer_type.variants.transfer_another_position.code) {
            ViewContext.data.view_table = false;
            Context.data.transfer_table = undefined;
            ViewContext.data.filter_organization = undefined;
        }
        Context.data.structural_subdivision = undefined;
        Context.data.organization = ViewContext.data.app_organization_view;

        // Context.data.employment_type = undefined;
        // Context.data.schedule_work_new = undefined;
        // Context.data.workplace_new = undefined;
        // Context.data.type_employment_relationship = undefined;
        // Context.data.rate_new = undefined;
    }
}

async function checkTemporaryTransfer(): Promise<void> {
    if (Context.data.temporary_transfer === true) {
        ViewContext.data.show_cause_temporary_transfer = true;
        ViewContext.data.view_date_end = true;
    } else {
        ViewContext.data.show_cause_temporary_transfer = false;
        ViewContext.data.view_date_end = false;
        Context.data.cause_temporary_transfer = undefined;
    }
}

async function checkDates(): Promise<void> {
    ViewContext.data.error_message = '';
    let check = 0;
    let check_start_date = 0
    if (Context.data.date_start && Context.data.date_start.before(new TDate())) {
        check_start_date++;
        ViewContext.data.error_message += '\n"Дата перевода с" не может быть раньше текущей даты';
    }
    if (Context.data.date_start && Context.data.date_end && Context.data.date_end.before(Context.data.date_start)) {
        check++;
        ViewContext.data.error_message += '\n"Дата перевода по" не может быть раньше "Дата перевода с" ';
    }
    ViewContext.data.show_error = check > 0 || check_start_date > 0 ? true : false;
    ViewContext.data.show_error_start_date = check_start_date > 0 ? true : false;
}


async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();
    if (ViewContext.data.show_error === true) {
        result.addContextError('date_end', '"Дата перевода по" не может быть раньше "Дата перевода с"');
    }
    if (ViewContext.data.show_error_start_date === true) {
        result.addContextError('date_start', '"Дата перевода с" не может быть раньше текущей даты');
    }
    if (ViewContext.data.show_table_error === true) {
        result.addContextError('transferred_staff_table', 'Невозможно указать одного и того же сотрудника несколько раз');
    }

    if (Context.data.transfer_table && Context.data.transfer_table.length > 0) {
        let count = 0;
        const staffs_id = Context.data.transfer_table.filter(item => item.transfer_staff).map(f => f.transfer_staff.id);
        const staffs = await Context.fields.staff.app.search().where(f => f.__id.in(staffs_id)).size(100).all();
        let staffs_fio: string = "";
        if (Context.data.new_position) {
            let position = await Context.data.new_position.fetch();
            for (let row of Context.data.transfer_table) {
                let staff = staffs.find(item => item.id == row.transfer_staff.id)
                if (staff) {
                    let elem = staff.data.employment_table?.find(item => item.position && item.position.id == position.id);
                    if (!!elem) {
                        staffs_fio += staff.data.full_name ? staff.data.full_name.lastname + " " + staff.data.full_name.firstname + ", " : "";
                        count++;
                    }
                }
            }
            if (!!staffs_fio)
                if (count == 1) {
                    result.addMessage(staffs_fio.slice(0, -2) + ' : данный сотрудник уже назначен на позицию по которому осуществляется перевод')
                } else {
                    result.addMessage(staffs_fio.slice(0, -2) + ' : данные сотрудники уже назначены на позицию по которому осуществляется перевод')
                }

        }
    }
    return result
}

async function updateTable(): Promise<void> {
    ViewContext.data.show_table_error = false;
    ViewContext.data.table_error = '';
    if (Context.data.transferred_staff_table && Context.data.transferred_staff_table.length > 0) {
        const staffs_id = Context.data.transferred_staff_table!.map(f => f.staff.id)
        const findDuplicates = staffs_id.filter((item, index) => staffs_id!.indexOf(item) !== index);
        if (findDuplicates && findDuplicates.length > 0) {
            ViewContext.data.show_table_error = true;
            ViewContext.data.table_error = 'Невозможно указать одного и того же сотрудника несколько раз';
        }
        for (const row of Context.data.transferred_staff_table!) {
            if (row.staff) {
                const staff = await row.staff.fetch();
                row.employment_type = staff.data.employment_type!;
            }
        }
        if (ViewContext.data.table_string !== JSON.stringify((Context.data.transferred_staff_table as any).json())) {
            ViewContext.data.table_string = JSON.stringify((Context.data.transferred_staff_table as any).json());
            Context.data.transferred_staff_table = Context.data.transferred_staff_table;
        }
    }

}


async function checkReason(): Promise<void> {
    ViewContext.data.show_missing = false;
    Context.data.transfer_during_absence = undefined;
    if (Context.data.cause_temporary_transfer) {
        const cause_temporary_transfer = await Context.data.cause_temporary_transfer.fetch();
        if (cause_temporary_transfer.data.__name === 'Для замещения временно отсутствующего (до выхода сотрудника)') {
            ViewContext.data.show_missing = true;
            if (Context.data.new_position) {
                const new_position = await Context.data.new_position.fetch();
                if (new_position.data.staff && new_position.data.staff.length === 1) {
                    Context.data.transfer_during_absence = new_position.data.staff[0];
                }
            }
        }
    }
}

async function changeTransferTable(): Promise<void> {
    if (Context.data.transfer_table && Context.data.transfer_table.length > 0) {
        const filter_organization = await ViewContext.data.filter_organization?.fetch();
        const staffs_id = Context.data.transfer_table.map(f => f.transfer_staff.id);
        const staffs = await Context.fields.staff.app.search().where(f => f.__id.in(staffs_id)).size(100).all();

        for (const row of Context.data.transfer_table) {

            const staff_data = staffs.find(f => f.id == row.transfer_staff.id);

            // Нужна, чтобы не обновлять строчку таблицы, если не было изменений в сотруднике. сделано для того, чтобы каждый раз не перезаписывалось место занятости
            if (row.json_staff !== JSON.stringify((staff_data as any).json())) {
                row.json_staff = JSON.stringify((staff_data as any).json());
                if (staff_data) {
                    row.transfer_employment_place = undefined!;
                    row.transfer_work_schedule = undefined!;
                    row.transfer_workplace = undefined!;

                    const employment_table = staff_data.data.employment_table ?? staff_data.fields.employment_table.create();

                    if (Context.data.transfer_type && Context.data.transfer_type.code === Context.fields.transfer_type.variants.transfer_another_position.code) {
                        if (ViewContext.data.filter_organization) {
                            row.filter_organization = ViewContext.data.filter_organization;
                        }

                        const [main, internal, external] = [
                            employment_table.find(f => f.type_employment.code == "main_workplace" && f.organization.id == row.filter_organization.id),
                            employment_table.find(f => f.type_employment.code == "internal_combination" && f.organization.id == row.filter_organization.id),
                            employment_table.find(f => f.type_employment.code == "external_combination" && f.organization.id == row.filter_organization.id),
                        ];

                        const staff_workplace = main || internal || external;

                        if (!staff_workplace) {
                            row.error = true;
                            continue;
                        }

                        row.error = false;
                        row.transfer_employment_place = staff_workplace.employment_placement_app;
                        row.transfer_work_schedule = staff_workplace.work_schedules;
                        row.transfer_workplace = staff_workplace.work_place;

                    } else {
                        const [main, internal, external] = [
                            employment_table.find(f => f.type_employment.code == "main_workplace"),
                            employment_table.find(f => f.type_employment.code == "internal_combination"),
                            employment_table.find(f => f.type_employment.code == "external_combination"),
                        ];

                        const staff_workplace = main || internal || external;

                        row.error = false;

                        if (staff_workplace) {
                            row.transfer_employment_place = staff_workplace.employment_placement_app;
                            row.transfer_work_schedule = staff_workplace.work_schedules;
                            row.transfer_workplace = staff_workplace.work_place;
                            if (staff_data.data.organization)
                                row.filter_organization = staff_data.data.organization;
                        }
                    }
                }
            }
        }

        if (ViewContext.data.transfer_table_string !== JSON.stringify((Context.data.transfer_table as any).json())) {
            ViewContext.data.transfer_table_string = JSON.stringify((Context.data.transfer_table as any).json());
            const search_error = Context.data.transfer_table.filter(f => f.error === true);
            if (search_error && search_error.length > 0) {
                ViewContext.data.warning_text = `Выбранный(-ие) сотрудник(-и) не имеет(-ют) мест занятости в ${filter_organization ? filter_organization.data.__name : 'выбранной организации'}`;
                ViewContext.data.view_warning = true;
            } else {
                ViewContext.data.warning_text = ''
                ViewContext.data.view_warning = false;
            }
            Context.data.transfer_table = Context.data.transfer_table;
        }

        const find_duplicates_staff_id = Context.data.transfer_table.map(f => f.transfer_staff.id);
        const find_duplicates_employment_place_id = Context.data.transfer_table.map(f => f.transfer_employment_place.id);
        const find_duplicates_staff = find_duplicates_staff_id.filter((item, index) => find_duplicates_staff_id.indexOf(item) !== index);
        const find_duplicates_employment_place = find_duplicates_employment_place_id.filter((item, index) => find_duplicates_employment_place_id.indexOf(item) !== index);

        if (find_duplicates_staff && find_duplicates_employment_place && find_duplicates_staff.length > 0 && find_duplicates_employment_place.length > 0) {
            ViewContext.data.show_table_error = true;
            ViewContext.data.table_error = 'Невозможно указать одного и того же сотрудника несколько раз с одним видом занятости';
        } else {
            ViewContext.data.show_table_error = false;
            ViewContext.data.table_error = '';
        }
    }
}
