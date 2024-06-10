/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function fillContext(): Promise<void> {
    if (Context.data.table_staff && Context.data.table_staff.length > 0) {
        Context.data.is_table = true;
    }
}


async function updateListPrevPositions(actual_list_staffs: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[], old_list_staffs: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[], staff: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>): Promise<{ actual_list_staffs: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[], old_list_staffs: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[] }> {
    if (actual_list_staffs && actual_list_staffs.length > 0) {
        const length = actual_list_staffs.length;
        for (let index = 0; index < length; index++) {
            if (actual_list_staffs[index].id == staff.id) {
                actual_list_staffs.splice(index, 1);
            }
        }
    }
    old_list_staffs.push(staff);

    return {
        actual_list_staffs: actual_list_staffs,
        old_list_staffs: old_list_staffs
    }

}

//Обработки одного сотрудника для обновления позиции ШР
async function updatePrevPositionSingle(): Promise<void> {
    if (!Context.data.processed_staff) {
        throw new Error('Отсутствует переводимый сотрудник');
    }
    if (!Context.data.employment_directory_processed_staff) {
        throw new Error('Отсутсвует приложение справочника занятости сотрудника');
    }

    const staff = await Context.data.processed_staff.fetch();
    const employment_directory = await Context.data.employment_directory_processed_staff.fetch();

    if (staff && employment_directory) {
        if (!employment_directory.data.position) {
            throw new Error('Отсутствует позиция в приложении справочника занятости сотрудника');
        }
        if (!employment_directory.data.type_employment) {
            throw new Error('Отсутствует тип занятости в приложении справочника занятости сотрудника');
        }
        let position = await employment_directory.data.position.fetch();

        switch (employment_directory.data.type_employment.code) {
            case "main_workplace": {
                if (Context.data.is_restore_position === true && Context.data.new_position) {
                    position = await Context.data.new_position.fetch();
                }
                const list_staffs = await updateListPrevPositions(position.data.staff ?? [], position.data.old_staff ?? [], staff);
                position.data.staff = list_staffs.actual_list_staffs;
                position.data.old_staff = list_staffs.old_list_staffs;
                await position.save();

                break;
            }
            case "internal_combination": {
                if (Context.data.is_restore_position === true && Context.data.new_position) {
                    position = await Context.data.new_position.fetch();
                }
                const list_staffs = await updateListPrevPositions(position.data.staff_internal_combination ?? [], position.data.old_staff_internal_combination ?? [], staff);
                position.data.staff_internal_combination = list_staffs.actual_list_staffs;
                position.data.old_staff_internal_combination = list_staffs.old_list_staffs;
                await position.save();

                break;
            }
            case "external_combination": {
                if (Context.data.is_restore_position === true && Context.data.new_position) {
                    position = await Context.data.new_position.fetch();
                }
                const list_staffs = await updateListPrevPositions(position.data.staff_external_combination ?? [], position.data.old_staff_external_combination ?? [], staff);
                position.data.staff_external_combination = list_staffs.actual_list_staffs;
                position.data.old_staff_external_combination = list_staffs.old_list_staffs;
                await position.save();

                break;
            }
        }
    }
}

async function updateListStaffs(staff: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>, actual_list_staff: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[], old_list_staffs: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[]): Promise<{ old_list_staffs: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[], actual_list_staff: TApplication<Application$kedo$staff$Data, Application$kedo$staff$Params, Application$kedo$staff$Processes>[] }> {
    if (old_list_staffs && old_list_staffs.length > 0) {
        const length = old_list_staffs.length;
        for (let index = 0; index < length; index++) {
            if (old_list_staffs[index].id == staff.id) {
                old_list_staffs.splice(index, 1);
            }
        }
    }
    actual_list_staff.push(staff);

    return {
        old_list_staffs: old_list_staffs,
        actual_list_staff: actual_list_staff,
    }
}

async function updateNewPositionSingle(): Promise<void> {
    if (!Context.data.new_position) {
        throw new Error('Отсутствует позиция на которую требуется перевод сотрудника');
    }
    if (!Context.data.processed_staff) {
        throw new Error('Отсутствует переводимый сотрудник');
    }
    if (!Context.data.employment_directory_processed_staff) {
        throw new Error('Отсутствует приложение места занятости сотрудника');
    }

    let new_position = await Context.data.new_position.fetch();
    const staff = await Context.data.processed_staff.fetch();
    const employment_directory = await Context.data.employment_directory_processed_staff.fetch();

    if (employment_directory && employment_directory.data.type_employment) {
        switch (employment_directory.data.type_employment.code) {
            case "main_workplace": {
                if (Context.data.is_restore_position === true && employment_directory.data.position) {
                    new_position = await employment_directory.data.position.fetch();
                }

                const old_position = await staff.data.position?.fetch();

                if (old_position) {
                    old_position.data.staff = (old_position.data.staff ?? []).filter(f => f.id !== staff.id);
                    old_position.data.old_staff = [...(old_position.data.old_staff ?? []), staff];
                    await old_position.save();
                }

                const lists_staffs = await updateListStaffs(staff, new_position.data.staff ?? [], new_position.data.old_staff ?? []);
                new_position.data.staff = lists_staffs.actual_list_staff;
                new_position.data.old_staff = lists_staffs.old_list_staffs;
                await new_position.save();

                break;
            }
            case "internal_combination": {
                if (Context.data.is_restore_position === true && employment_directory.data.position) {
                    new_position = await employment_directory.data.position.fetch();
                }
                const lists_staffs = await updateListStaffs(staff, new_position.data.staff_internal_combination ?? [], new_position.data.old_staff_internal_combination ?? []);
                new_position.data.staff_internal_combination = lists_staffs.actual_list_staff;
                new_position.data.old_staff_internal_combination = lists_staffs.old_list_staffs;
                await new_position.save();

                break;
            }
            case "external_combination": {
                if (Context.data.is_restore_position === true && employment_directory.data.position) {
                    new_position = await employment_directory.data.position.fetch();
                }
                const lists_staffs = await updateListStaffs(staff, new_position.data.staff_external_combination ?? [], new_position.data.old_staff_external_combination ?? []);
                new_position.data.staff_external_combination = lists_staffs.actual_list_staff;
                new_position.data.old_staff_external_combination = lists_staffs.old_list_staffs;
                await new_position.save();

                break;
            }
        }
    }
}

const fff = Namespace.processes.update_staffing_table

//Обработки таблицы сотрудников для обновления позиции ШР
async function updatePrevPositionTable(): Promise<void> {
    if (!Context.data.table_staff || Context.data.table_staff.length == 0) {
        throw new Error('Таблица сотрудников пуста');
    }

    const staffs_ids = Context.data.table_staff.map(f => f.staffs.id);
    let staffs_data_array: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>[] = [];
    if (staffs_ids && staffs_ids.length > 0) {
        staffs_data_array = await Context.fields.staff.app.search()
            .where(f => f.__id.in(staffs_ids))
            .size(staffs_ids.length)
            .all();
    }

    const employment_directory_ids = Context.data.table_staff.map(f => f.employment_directory.id);
    let employment_directory: ApplicationItem<Application$kedo$employment_directory$Data, Application$kedo$employment_directory$Params>[] = [];
    if (employment_directory_ids && employment_directory_ids.length > 0) {
        employment_directory = await Context.fields.employment_directory.app.search()
            .where(f => f.__id.in(employment_directory_ids))
            .size(employment_directory_ids.length)
            .all();
    }

    let position: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>[] = [];
    if (employment_directory && employment_directory.length > 0) {
        const position_ids = employment_directory.map(f => f.data.position!.id);
        if (position_ids && position_ids.length > 0) {
            position = await Context.fields.position.app.search()
                .where(f => f.__id.in(position_ids))
                .size(position_ids.length)
                .all();
        }
    }

    if (position && position.length > 0) {
        let promises: Promise<void>[] = [];

        let update_position: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>;
        if (Context.data.new_position) {
            update_position = await Context.data.new_position.fetch();
        }

        for (let row of Context.data.table_staff) {
            const place = employment_directory.find(f => f.id == row.employment_directory.id);
            if (place && place.data.type_employment) {
                const prev_position_staff = position.find(f => f.id == place.data.position!.id);
                const staff = staffs_data_array.find(f => f.id == place.data.staff!.id);

                switch (place.data.type_employment.code) {
                    case "main_workplace": {
                        if (Context.data.is_restore_position === true) {
                            Context.data.debug = 'Временный перевод основной';
                            if (staff && update_position! && update_position.data.staff && update_position.data.staff.length > 0) {
                                const length = update_position.data.staff.length;
                                for (let index = 0; index < length; index++) {
                                    if (update_position.data.staff[index].id == staff.id) {
                                        update_position.data.staff.splice(index, 1);
                                    }
                                }
                                if (!update_position.data.old_staff) {
                                    update_position.data.old_staff = [];
                                }
                                update_position.data.old_staff.push(staff);
                                promises.push(update_position.save());
                            }
                        } else {
                            if (staff && prev_position_staff && prev_position_staff.data.staff && prev_position_staff.data.staff.length > 0) {
                                const length = prev_position_staff.data.staff.length;
                                for (let index = 0; index < length; index++) {
                                    if (prev_position_staff.data.staff[index].id == staff.id) {
                                        prev_position_staff.data.staff.splice(index, 1);
                                    }
                                }
                                if (!prev_position_staff.data.old_staff) {
                                    prev_position_staff.data.old_staff = [];
                                }
                                prev_position_staff.data.old_staff.push(staff);
                                promises.push(prev_position_staff.save());
                            }
                        }

                        break;
                    }
                    case "internal_combination": {
                        if (Context.data.is_restore_position === true) {
                            Context.data.debug = 'Временный перевод внутренний';
                            if (staff && update_position! && update_position.data.staff_internal_combination && update_position.data.staff_internal_combination.length > 0) {
                                const length = update_position.data.staff_internal_combination.length;
                                for (let index = 0; index < length; index++) {
                                    if (update_position.data.staff_internal_combination[index].id == staff.id) {
                                        update_position.data.staff_internal_combination.splice(index, 1);
                                    }
                                }
                                if (!update_position.data.old_staff_internal_combination) {
                                    update_position.data.old_staff_internal_combination = [];
                                }
                                update_position.data.old_staff_internal_combination.push(staff);
                                promises.push(update_position.save());
                            }
                        } else {
                            if (staff && prev_position_staff && prev_position_staff.data.staff_internal_combination && prev_position_staff.data.staff_internal_combination.length > 0) {
                                const length = prev_position_staff.data.staff_internal_combination.length;
                                for (let index = 0; index < length; index++) {
                                    if (prev_position_staff.data.staff_internal_combination[index].id == staff.id) {
                                        prev_position_staff.data.staff_internal_combination.splice(index, 1);
                                    }
                                }
                                if (!prev_position_staff.data.old_staff_internal_combination) {
                                    prev_position_staff.data.old_staff_internal_combination = [];
                                }
                                prev_position_staff.data.old_staff_internal_combination.push(staff);
                                promises.push(prev_position_staff.save());
                            }
                        }

                        break;
                    }
                    case "external_combination": {
                        if (Context.data.is_restore_position === true) {
                            Context.data.debug = 'Временный перевод внешний';
                            if (staff && update_position! && update_position.data.staff_external_combination && update_position.data.staff_external_combination.length > 0) {
                                const length = update_position.data.staff_external_combination.length;
                                for (let index = 0; index < length; index++) {
                                    if (update_position.data.staff_external_combination[index].id == staff.id) {
                                        update_position.data.staff_external_combination.splice(index, 1);
                                    }
                                }
                                if (!update_position.data.old_staff_external_combination) {
                                    update_position.data.old_staff_external_combination = [];
                                }
                                update_position.data.old_staff_external_combination.push(staff);
                                promises.push(update_position.save());
                            }
                        } else {
                            if (staff && prev_position_staff && prev_position_staff.data.staff_external_combination && prev_position_staff.data.staff_external_combination.length > 0) {
                                const length = prev_position_staff.data.staff_external_combination.length;
                                for (let index = 0; index < length; index++) {
                                    if (prev_position_staff.data.staff_external_combination[index].id == staff.id) {
                                        prev_position_staff.data.staff_external_combination.splice(index, 1);
                                    }
                                }
                                if (!prev_position_staff.data.old_staff_external_combination) {
                                    prev_position_staff.data.old_staff_external_combination = [];
                                }
                                prev_position_staff.data.old_staff_external_combination.push(staff);
                                promises.push(prev_position_staff.save());
                            }
                        }

                        break;
                    }
                }
            }
            if (promises.length > 20) {
                await Promise.all(promises);
                promises = [];
            }
        }
        await Promise.all(promises);
    }
}

type Staff = ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>;
type EmploymentDirectory = ApplicationItem<Application$kedo$employment_directory$Data, Application$kedo$employment_directory$Params>;
type Position = ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>;

async function updateNewPositionTable(): Promise<void> {
    if (!Context.data.table_staff || Context.data.table_staff.length == 0 || !Context.data.new_position) {
        throw new Error('Таблица переводимых сотрудников пуста, или отсутствует позиция, на которую требуется перевести сотрудника(-ов)');
    }

    const staffs_ids = Context.data.table_staff.map(f => f.staffs.id);
    let staffs_data_array: Staff[] = [];
    if (staffs_ids && staffs_ids.length > 0) {
        staffs_data_array = await Context.fields.staff.app.search()
            .where(f => f.__id.in(staffs_ids))
            .size(staffs_ids.length)
            .all();
    }

    const employment_directory_ids = Context.data.table_staff.map(f => f.employment_directory.id);
    let employment_directory: EmploymentDirectory[] = [];
    if (employment_directory_ids && employment_directory_ids.length > 0) {
        employment_directory = await Context.fields.employment_directory.app.search()
            .where(f => f.__id.in(employment_directory_ids))
            .size(employment_directory_ids.length)
            .all();
    }

    let position: Position[] = [];
    if (employment_directory && employment_directory.length > 0) {
        const position_ids = [
            ...employment_directory.filter(f => f.data.position != undefined).map(f => f.data.position!.id),
            ...staffs_data_array.filter(f => f.data.position != undefined).map(f => f.data.position!.id),
        ];

        if (position_ids && position_ids.length > 0) {
            position = await Context.fields.position.app.search()
                .where(f => f.__id.in(position_ids))
                .size(position_ids.length)
                .all();
        }
    }

    let new_position = await Context.data.new_position.fetch();
    let promises: Promise<void>[] = [];

    for (let row of Context.data.table_staff) {
        const type_employment = employment_directory.find(f => f.id == row.employment_directory.id);
        const staff = staffs_data_array.find(f => f.id == row.staffs.id);

        if (type_employment && type_employment.data.type_employment && staff) {
            switch (type_employment.data.type_employment.code) {
                case "main_workplace": {
                    if (Context.data.is_restore_position === true) {
                        const prev_position = position.find(f => f.id == type_employment.data.position!.id);
                        if (prev_position)
                            new_position = prev_position;
                    }

                    const main_position = position.find(f => f.id === staff.data.position?.id);

                    if (main_position) {
                        main_position.data.staff = (main_position.data.staff ?? []).filter(f => f.id !== staff.id);
                    }

                    if (new_position) {
                        if (!new_position.data.staff || new_position.data.staff.length == 0) {
                            new_position.data.staff = [];
                        }
                        if (new_position.data.old_staff && new_position.data.old_staff.length > 0) {
                            const length = new_position.data.old_staff.length;
                            for (let index = 0; index < length; index++) {
                                if (new_position.data.old_staff[index].id == staff.id) {
                                    new_position.data.old_staff.splice(index, 1);
                                }
                            }
                        }
                        new_position.data.staff.push(staff);
                        promises.push(
                            (async function () {
                                if (main_position) {
                                    await main_position.save();
                                }
                                await new_position.save();
                            })()
                        );
                    }

                    break;
                }
                case "internal_combination": {
                    if (Context.data.is_restore_position === true) {
                        const prev_position = position.find(f => f.id == type_employment.data.position!.id);
                        if (prev_position)
                            new_position = prev_position;
                    }
                    if (new_position) {
                        if (!new_position.data.staff_internal_combination || new_position.data.staff_internal_combination.length == 0) {
                            new_position.data.staff_internal_combination = [];
                        }
                        if (new_position.data.old_staff_internal_combination && new_position.data.old_staff_internal_combination.length > 0) {
                            const length = new_position.data.old_staff_internal_combination.length;
                            for (let index = 0; index < length; index++) {
                                if (new_position.data.old_staff_internal_combination[index].id == staff.id) {
                                    new_position.data.old_staff_internal_combination.splice(index, 1);
                                }
                            }
                        }
                        new_position.data.staff_internal_combination.push(staff);
                        promises.push(new_position.save());
                    }

                    break;
                }
                case "external_combination": {
                    if (Context.data.is_restore_position === true) {
                        const prev_position = position.find(f => f.id == type_employment.data.position!.id);
                        if (prev_position)
                            new_position = prev_position;
                    }
                    if (new_position) {
                        if (!new_position.data.staff_external_combination || new_position.data.staff_external_combination.length == 0) {
                            new_position.data.staff_external_combination = [];
                        }
                        if (new_position.data.old_staff_external_combination && new_position.data.old_staff_external_combination.length > 0) {
                            const length = new_position.data.old_staff_external_combination.length;
                            for (let index = 0; index < length; index++) {
                                if (new_position.data.old_staff_external_combination[index].id == staff.id) {
                                    new_position.data.old_staff_external_combination.splice(index, 1);
                                }
                            }
                        }
                        new_position.data.staff_external_combination.push(staff);
                        promises.push(new_position.save())
                    }

                    break;
                }
            }
        }
        if (promises.length > 20) {
            await Promise.all(promises);
            promises = [];
        }
    }
    await Promise.all(promises);
}