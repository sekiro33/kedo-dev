/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type Staff = ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>;
type EmploymentDirectory = ApplicationItem<Application$kedo$employment_directory$Data, Application$kedo$employment_directory$Params>;
type StaffEmploymentTable = TTable<Table$kedo$staff$employment_table$Row, Table$kedo$staff$employment_table$Result>;

async function getStaffPack(): Promise<void> {
    const size = Context.data.size && Context.data.size > 0 ? Context.data.size : 100;
    const from = Context.data.from ?? 0;

    const staffs = await Context.fields.staffs.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .from(from)
        .size(size)
        .all();

    /** Для проверки в шлюзе */
    if (!staffs || staffs.length == 0) {
        Context.data.staffs = undefined;
        return;
    }

    Context.data.staffs = staffs;
    Context.data.from = from + size;
}

async function dedublicateEmploymentTable(): Promise<void> {
    if (!Context.data.staffs || Context.data.staffs.length == 0) {
        return;
    }

    const staff_ids = Context.data.staffs.map(s => s.id);

    const staffs = await Context.fields.staffs.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(staff_ids)
        ))
        .size(staff_ids.length)
        .all();

    let promises: Promise<void>[] = [];

    for (const staff of staffs) {
        const employment_table = staff.data.employment_table;

        if (!employment_table || employment_table.length == 0) {
            continue;
        }

        promises.push(
            async function () {
                await filterEmploymentTable(staff);
                await dedublicateTable(staff);
            }()
        )

        if (promises.length > 20) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);
}

/** Очистка таблицы занятости сотрудника от некорректных записей. */
async function filterEmploymentTable(staff: Staff): Promise<void> {
    const employment_table = staff.data.employment_table;

    if (!employment_table || employment_table.length) {
        return;
    }

    for (let i = employment_table.length - 1; i >= 0; i++) {
        const row = employment_table[i];

        if (!row.position || !row.type_employment) {
            employment_table.delete(i);
        }
    }

    return staff.save();
}

/** Дедубликация таблицы занятости сотрудника. */
async function dedublicateTable(staff: Staff): Promise<void> {
    function checkRow(row: Table$kedo$staff$employment_table$Row): number {
        let score = 0;

        if (row.id_1c && row.id_1c.length !== 0) {
            score++;
        }

        if (row.admission_date_organization) {
            score++;
        }

        if (row.admission_date_position) {
            score++;
        }

        if (row.organization) {
            score++;
        }

        if (row.subdivision) {
            score++;
        }

        if (row.position) {
            score++;
        }

        if (row.type_employment) {
            score++;
        }

        return score;
    }

    const employment_table = staff.data.employment_table;

    if (!employment_table || employment_table.length == 0) {
        return;
    }

    for (let i = employment_table.length - 1; i >= 0; i--) {
        const row = employment_table[i];

        /** 
         * Проверяем таблицу занятости в карточке сотрудника на наличие дублирующих записей.
         * Проверку на дубль выполняем по позиции и виду занятости, т.к. одна и та же позиция по одному и тому же виду занятости быть не может.
         */
        const duble_index = employment_table.findIndex((r, index) => r.position?.id == row.position?.id && r.type_employment?.code == row.type_employment?.code && index !== i);

        if (duble_index !== -1) {
            const duble = employment_table[duble_index];

            /** 
             * Для дубликата и текущей строки выполняем подсчет "очков":
             * если в дубле больше данных, чем в текущей строке, то удаляем текущую строку, иначе удаляем дубль
             */
            const duble_score = checkRow(duble);
            const current_row_score = checkRow(row);

            if (duble_score > current_row_score) {
                employment_table.delete(i);
            } else {
                employment_table.delete(duble_index);
            }
        }
    }

    return staff.save();
}

async function fillEmploymentTable(): Promise<void> {
    if (!Context.data.staffs || Context.data.staffs.length == 0) {
        return;
    }

    const staff_ids = Context.data.staffs.map(f => f.id);
    const staffs = await Context.fields.staffs.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(staff_ids)
        ))
        .size(staff_ids.length)
        .all();

    // Заполняем таблицу со строками из таблиц занятости сотрудников.
    const staff_employment_table = Context.fields.staff_employment_table.create();

    for (const staff of staffs) {
        const employment_table = staff.data.employment_table;

        if (!employment_table || employment_table.length == 0) continue;

        for (const row of employment_table) {
            const employment_row = staff_employment_table.insert();

            employment_row.id = row.id;
            employment_row.staff = staff;
            employment_row.id_1c = row.id_1c;
            employment_row.type_employment = row.type_employment;
            employment_row.subdivision = row.subdivision;
            employment_row.position = row.position;
            employment_row.organization = row.organization;
            employment_row.date_by = row.date_by;
            employment_row.admission_date_organization = row.admission_date_organization;
            employment_row.admission_date_position = row.admission_date_position;
            employment_row.staff_full_name = staff.data.__name;
            employment_row.employment_directory = row.employment_placement_app;
        }
    }

    Context.data.staff_employment_table = staff_employment_table;
}

async function updateStaffEmployment(): Promise<void> {
    if (!Context.data.staff_employment_table || Context.data.staff_employment_table.length == 0) {
        return;
    }

    const employment_table = Context.data.staff_employment_table;

    const fiiled_employment_app_ids = employment_table
        .filter(f => f.employment_directory != undefined)
        .map(f => f.employment_directory.id);

    const employment_directory = await Context.fields.employment_directory.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(fiiled_employment_app_ids)
        ))
        .size(fiiled_employment_app_ids.length)
        .all();

    let promises: Promise<void>[] = [];

    for (const row of employment_table) {
        const employment_app = employment_directory.find(f => f.id == row.employment_directory?.id) ?? Context.fields.employment_directory.app.create();

        employment_app.data.staff = row.staff;
        employment_app.data.position = row.position;
        employment_app.data.type_employment = row.type_employment;
        employment_app.data.subdivision = row.subdivision;
        employment_app.data.organization = row.organization;
        employment_app.data.id_1c = row.id_1c;
        employment_app.data.admission_date_organization = row.admission_date_organization;
        employment_app.data.admission_date_position = row.admission_date_position;
        employment_app.data.date_by = row.date_by;
        employment_app.data.staff_full_name = row.staff_full_name;

        promises.push(
            employment_app.save()
                .then(() => {
                    row.employment_directory = employment_app;
                })
        );

        if (promises.length > 20) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);
}

async function setEmploymentValidStatus(): Promise<void> {
    if (!Context.data.staff_employment_table || Context.data.staff_employment_table.length == 0) {
        return;
    }

    const employment_table = Context.data.staff_employment_table;
    const employment_app_ids = employment_table
        .filter(f => f.employment_directory != undefined)
        .map(f => f.employment_directory.id);

    const employment_directory = await Context.fields.employment_directory.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(employment_app_ids)
        ))
        .size(employment_app_ids.length)
        .all();

    let promises: Promise<boolean>[] = [];

    const today = new TDate();

    for (const employment_app of employment_directory) {
        /** 
         * Если в строке места занятости установлено поле "Дата по", то такое место занятости является "Недействительным"
         * Выполняем проверку по этому полю и текущей дате.
         */
        if (employment_app.data.date_by && today.after(employment_app.data.date_by)) {
            promises.push(employment_app.setStatus(Context.fields.employment_directory.app.fields.__status.variants.not_valid));
        } else {
            promises.push(employment_app.setStatus(Context.fields.employment_directory.app.fields.__status.variants.actual));
        }

        if (promises.length > 20) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);
}

async function udpateStaffEmploymentTable(): Promise<void> {
    if (!Context.data.staff_employment_table || Context.data.staff_employment_table.length == 0) {
        return;
    }

    if (!Context.data.staffs || Context.data.staffs.length == 0) {
        return;
    }

    const employment_table = Context.data.staff_employment_table;

    const staff_ids = Context.data.staffs.map(f => f.id);

    /** Получаем всех сотрудников по ID. */
    const staffs = await Context.fields.staffs.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(staff_ids)
        ))
        .size(staff_ids.length)
        .all();

    let promises: Promise<void>[] = [];

    /** В каждом сотруднике обновляем таблицу занятости. */
    for (const staff of staffs) {
        const staff_employment_table = staff.data.employment_table;

        if (!staff_employment_table || staff_employment_table.length == 0) {
            continue;
        }

        const employment_rows = employment_table.filter(f => f.staff?.id === staff.id);

        for (const row of employment_rows) {
            const staff_row = staff_employment_table.find(f => f.id == row.id) ?? staff_employment_table.insert();

            staff_row.id = row.id;
            staff_row.position = row.position;
            staff_row.organization = row.organization;
            staff_row.subdivision = row.subdivision;
            staff_row.type_employment = row.type_employment;
            staff_row.id_1c = row.id_1c;
            staff_row.employment_placement_app = row.employment_directory;
            staff_row.admission_date_organization = row.admission_date_organization;
            staff_row.admission_date_position = row.admission_date_position;
            staff_row.date_by = row.date_by;
        }

        promises.push(staff.save());

        if (promises.length > 20) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);
}

async function incIterationCounter(): Promise<void> {
    Context.data.iteration_count = (Context.data.iteration_count ?? 0) + 1;
}

async function resetIterationCounter(): Promise<void> {
    Context.data.iteration_count = 0;
}

async function setNotValidStatus(): Promise<void> {
    let from = 0;
    const size = 100;
    const chunk_size = 40;

    while (true) {
        const employment_directory = await Context.fields.employment_directory.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__deletedAt.eq(null)
            ))
            .from(from)
            .size(size)
            .all();

        if (!employment_directory || employment_directory.length == 0) {
            break;
        }

        for (let i = 0; i < employment_directory.length; i += chunk_size) {
            const chunk = employment_directory.slice(i, i + chunk_size);

            await Promise.all(chunk.map(f => f.setStatus(Context.fields.employment_directory.app.fields.__status.variants.not_valid)));
        }

        from += size;
    }
}
