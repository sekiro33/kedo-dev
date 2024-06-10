/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface IStaffLeftover {
    staff_id: string,
    leftovers: ILeftover[],
}

interface ILeftover {
    position_id: string,
    remainder: number,
}

async function getVacationLeftovers(): Promise<void> {
    let from = Context.data.from && Context.data.from >= 0 ? Context.data.from : 0;
    let size = Context.data.size && Context.data.size > 0 ? Context.data.size : 100;

    let leftovers_data: IStaffLeftover[] = Context.data.staff_leftovers_data ? JSON.parse(Context.data.staff_leftovers_data) : [];

    // Получаем пачку остатков отпусков.
    const vacation_leftovers = await Context.fields.vacation_leftovers.app.search()
        .where(f => f.__deletedAt.eq(null))
        .from(from)
        .size(size)
        .all();

    if (!vacation_leftovers || vacation_leftovers.length == 0) {
        Context.data.vacation_leftovers = undefined;
        return;
    }

    Context.data.vacation_leftovers = vacation_leftovers[0];

    // Из пачки выбираем все уникальные guid'ы сотрудников
    const staff_ids = [... new Set(
        vacation_leftovers
            .filter(f => f.data.staff !== undefined)
            .map(f => f.data.staff!.id)
    )];

    const staffs = await Namespace.app.staff.search()
        .where(f => f.__id.in(staff_ids))
        .size(staff_ids.length)
        .all();

    // Для каждого сотрудника формируем запись о его текущих остатках
    for (const staff of staffs) {
        const main_position = (staff.data.employment_table ?? []).find(f => f.type_employment?.code == "main_workplace");

        if (!main_position || !main_position.position) {
            continue;
        }

        let staff_leftover = leftovers_data.find(f => f.staff_id == staff.id);

        if (!staff_leftover) {
            staff_leftover = {
                staff_id: staff.id,
                leftovers: [],
            };

            leftovers_data.push(staff_leftover);
        }

        const leftovers = vacation_leftovers.filter(f => f.data.staff?.id == staff.id && f.data.position?.id == main_position.position.id);

        for (const leftover of leftovers) {
            if (!leftover.data.position) {
                continue;
            }

            let position_leftover = staff_leftover.leftovers.find(f => f.position_id == leftover.data.position?.id);

            if (!position_leftover) {
                position_leftover = {
                    position_id: leftover.data.position.id,
                    remainder: leftover.data.remainder ?? 0,
                };

                staff_leftover.leftovers.push(position_leftover);
            } else {
                position_leftover.remainder += leftover.data.remainder ?? 0;
            }
        }
    }

    Context.data.staff_leftovers_data = JSON.stringify(leftovers_data);
    Context.data.from = from + size;
}

async function updateStaffLeftovers(): Promise<void> {
    const leftovers_data: IStaffLeftover[] = Context.data.staff_leftovers_data ? JSON.parse(Context.data.staff_leftovers_data) : [];

    const staff_ids = leftovers_data.map(f => f.staff_id);
    const staffs = await Namespace.app.staff.search()
        .where(f => f.__id.in(staff_ids))
        .size(staff_ids.length)
        .all();

    let promises: Promise<void>[] = [];

    for (const leftover of leftovers_data) {
        const staff = staffs.find(f => f.id == leftover.staff_id);

        if (!staff) continue;

        const leftovers_days = leftover.leftovers
            .map(f => f.remainder)
            .reduce((pr_val, cur_val) => pr_val += cur_val, 0);

        staff.data.remaining_vacation_days = leftovers_days;

        promises.push(staff.save());

        if (promises.length > 20) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);
}

async function resetCounter(): Promise<void> {
    Context.data.iteration_count = 0;
}

async function incCounter(): Promise<void> {
    Context.data.iteration_count = (Context.data.iteration_count ?? 0) + 1;
}
