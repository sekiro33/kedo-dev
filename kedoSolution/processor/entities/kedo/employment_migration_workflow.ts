/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getStaffPack(): Promise<void> {
    let from = Context.data.from ?? 0;
    let size = Context.data.size ?? 100;

    const staffs = await Context.fields.staffs.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .from(from)
        .size(size)
        .all();

    Context.data.staffs = staffs;

    from += size;
    Context.data.from = from;
}

async function checkStaffPack(): Promise<boolean> {
    return Context.data.staffs != undefined && Context.data.staffs.length > 0;
}

async function updateStaffEmployment(): Promise<void> {
    if (!Context.data.staffs || Context.data.staffs.length == 0) {
        return;
    }

    const staffs = await Context.fields.staffs.fetchAll();

    const employment_directory = await Namespace.app.employment_directory.search()
        .where((f, g) => g.and(
            f.__id.in(staffs.map(s => s.id)),
            f.__deletedAt.eq(null),
            f.__status.eq(Namespace.app.employment_directory.fields.__status.variants.actual)
        ))
        .size(10000)
        .all();

    const employment_statuses = Namespace.app.employment_directory.fields.__status.variants;

    let promises: Promise<void>[] = [];
    let staff_promises: Promise<void>[] = [];

    for (const staff of staffs) {
        const employment_table = staff.data.employment_table;

        /** Получаем все записи в справочнике занятости по сотруднику. */
        const staff_employment = employment_directory.filter(f => f.data.staff?.id == staff.id);

        if (!employment_table || employment_table.length == 0) {
            /** Если таблица занятости пустая, то
             * переводим все актуальные записи о занятости сотрудника
             * в статус "Недействительно".
             */
            if (staff_employment.length > 0) {
                await Promise.all(staff_employment.map(f => f.setStatus(employment_statuses.not_valid)));
            }

            continue;
        }

        /**
         * Для каждой строки в таблице занятости смотрим - есть ли в справочнике соответствующая запись
         * Если есть, то обновляем информацию в ней
         * Если нет, то создаем новую и сохраняем информацию о этой записи в строку в таблице.
         */
        for (const employment of employment_table) {
            // Выполняем поиск по приложению "Место занятости" в таблице.
            // Если строка в таблице не связана с каким-либо элементом в справочнике, то создаем новый элемент.
            let app = employment_directory.find(f => f.id == employment.employment_placement_app?.id) ?? Namespace.app.employment_directory.create();

            app.data.position = employment.position;
            app.data.organization = employment.organization;
            app.data.subdivision = employment.subdivision;
            app.data.staff = staff;
            app.data.type_employment = employment.type_employment;
            app.data.admission_date_organization = employment.admission_date_organization;
            app.data.admission_date_position = employment.admission_date_position;

            // Сохранение информации о созданной/обновленной записи о месте занятости в строку в таблице.
            employment.employment_placement_app = app;

            promises.push(app.save());

            if (promises.length > 20) {
                await Promise.all(promises);
                promises = [];
            }
        }

        staff_promises.push(staff.save());

        if (staff_promises.length > 20) {
            await Promise.all(promises);
            await Promise.all(staff_promises);

            promises = [];
            staff_promises = [];
        }
    }

    if (promises.length > 0) {
        await Promise.all(promises);
    }

    if (staff_promises.length > 0) {
        await Promise.all(staffs);
    }
}

async function resetIterationCounter(): Promise<void> {
    Context.data.iteration_count = 0;
}

async function incIterationCounter(): Promise<void> {
    Context.data.iteration_count = (Context.data.iteration_count ?? 0) + 1;
}
