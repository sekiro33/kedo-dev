/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type Staff = ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>;
type EmploymentDirectory = ApplicationItem<Application$kedo$employment_directory$Data, Application$kedo$employment_directory$Params>;

type EmploymentTable = TTable<Table$kedo$staff$employment_table$Row, Table$kedo$staff$employment_table$Result>;
type EmploymentTableRow = Table$kedo$staff$employment_table$Row

const PACK_SIZE = 30;
const PROMISE_SIZE = 20;

async function updateStaffsEmployment(): Promise<void> {
    const staffs_app = (Context.data.staffs ?? []).splice(0, PACK_SIZE);

    if (staffs_app.length == 0) {
        Context.data.staffs = undefined;
        return;
    }

    const staffs = await Context.fields.staffs.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(staffs_app.map(s => s.id))
        ))
        .size(staffs_app.length)
        .all();

    await Promise.all(staffs.map(s => dedublicateTable(s)));
    await Promise.all(staffs.map(s => updateEmploymentTable(s)));
}

async function updateStaffEmployment(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined. Не указан сотрудник.");
    }

    const staff = await Context.data.staff.fetch();

    await dedublicateTable(staff)
    await updateEmploymentTable(staff);
}

async function updateEmploymentTable(staff: Staff): Promise<void> {
    const employment_table = staff.data.employment_table;

    if (!employment_table || employment_table.length == 0) {
        return;
    }

    const staff_employment = await Context.fields.employment_directory.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(staff)
        ))
        .size(1000)
        .all();

    let promises: Promise<void>[] = [];

    for (const row of employment_table) {
        let employment_app: EmploymentDirectory;

        let employment_app_index = staff_employment.findIndex(f => f.id == row.employment_placement_app?.id);

        if (employment_app_index === -1) {
            employment_app = Context.fields.employment_directory.app.create();
        } else {
            employment_app = staff_employment[employment_app_index];
            staff_employment.splice(employment_app_index, 1);
        }

        employment_app.data.staff = staff;
        employment_app.data.position = row.position;
        employment_app.data.type_employment = row.type_employment;
        employment_app.data.subdivision = row.subdivision;
        employment_app.data.organization = row.organization;
        employment_app.data.id_1c = row.id_1c;
        employment_app.data.admission_date_organization = row.admission_date_organization;
        employment_app.data.admission_date_position = row.admission_date_position;
        employment_app.data.date_by = row.date_by;
        employment_app.data.staff_full_name = staff.data.__name;

        promises.push(
            employment_app.save()
                .then(() => {
                    row.employment_placement_app = employment_app;
                })
        );

        if (promises.length > PROMISE_SIZE) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);

    /** Все строки о местах занятости сотрудника, которых больше нет в таблице занятости переводим в статус "Недействительно" */
    await Promise.all(staff_employment.map(f => f.setStatus(Context.fields.employment_directory.app.fields.__status.variants.not_valid)));

    return staff.save();
}

/** Дедубликация таблицы занятости сотрудника. */
async function dedublicateTable(staff: Staff): Promise<void> {
    function checkRow(row: EmploymentTableRow): number {
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

        // Проверяем таблицу занятости в карточке сотрудника на наличие дублирующих записей.
        // Проверку на дубль выполняем по позиции и виду занятости, т.к. одна и та же позиция по одному и тому же виду занятости быть не может.
        const duble_index = employment_table.findIndex((r, index) => r.position?.id == row.position?.id && r.type_employment?.code == row.type_employment?.code && index !== i);

        if (duble_index !== -1) {
            const duble = employment_table[duble_index];

            // Для дубликата и текущей строки выполняем подсчет "очков":
            // если в дубле больше данных, чем в текущей строке, то удаляем текущую строку, иначе удаляем дубль
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

async function resetIterationCounter(): Promise<void> {
    Context.data.iteration_count = 0;
}

async function incIterationCount(): Promise<void> {
    Context.data.iteration_count = (Context.data.iteration_count ?? 0) + 1;
}
