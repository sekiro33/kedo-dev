/* Client scripts module */

interface IVacationLeftover {
    name: string,
    position?: string,
    remainder: number,
}

interface IVacationLeftoverData {
    position?: string,
    leftovers: IVacationLeftover[],
    sum: number,
}

declare const console: any;

async function onInit(): Promise<void> {
    getActualLeftovers();
}

async function getActualLeftovers(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined");
    }

    const staff = await Context.data.staff.fetch();

    if (!staff.data.employment_table || staff.data.employment_table.length == 0) {
        throw new Error("У сотрудника не указаны места занятости");
    }

    const vacation_leftovers = await Namespace.app.vacation_leftovers.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(staff)
        ))
        .size(10000)
        .all();

    const employment_table = staff.data.employment_table ?? staff.fields.employment_table.create();

    const employment_placement_ids = employment_table
        .filter(f => f.employment_placement_app)
        .map(f => f.employment_placement_app.id);

    const employment_placements = await Namespace.app.employment_directory.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(employment_placement_ids),
            f.__status.eq(Namespace.app.employment_directory.fields.__status.variants.actual),
            f.staff.link(staff),
        ))
        .size(employment_placement_ids.length)
        .all();

    const vacation_leftover_table = Context.fields.vacation_leftover_table.create();

    for (const employment_placement of employment_placements) {
        if (!employment_placement.data.position) continue;

        const leftovers = vacation_leftovers.filter(f => f.data.position?.id == employment_placement.data.position?.id);

        if (leftovers.length == 0) continue;

        const row = vacation_leftover_table.insert();

        const leftovers_table = Context.fields.vacation_leftover_table.fields.leftovers.create();

        for (const leftover of leftovers) {
            const leftover_row = leftovers_table.insert();

            leftover_row.remainder = leftover.data.remainder ?? 0;
            if (leftover.data.vacation_type_app) leftover_row.vacation_type = leftover.data.vacation_type_app;
        }

        row.employment_placement = employment_placement;
        row.leftovers = leftovers_table;
    }

    Context.data.vacation_leftover_table = vacation_leftover_table;
}