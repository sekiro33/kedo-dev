/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface TransferData {
    employee_individual_id: string;
    type_work_relation: any;
    subdivision_id: string;
    org_id: string;
    id_1c: string;
    type_from_data: any;
    transfer_date: TDate;
    rate: number;
    pos_id: string;
    existing_positions: any;
}

//проверка на актуальные данные
function isActualData(employee: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>,
    employeeId: string,
    position: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>,
    transferDate: TDate): boolean {

    if (employee && employee.data.employment_table) {
            //ищем строку в таблице занятости
            const row = employee.data.employment_table.find((item: any) => item.id_1c && item.id_1c === employeeId);

            if (row && row.admission_date_position) {

                 //если пришедшие данные не актуальные, не загружаем их   
                if (row.admission_date_position.after(transferDate)) {

                    Context.data.error_stack += ` ${employee.data.__name} ${position.data.__name} ${transferDate.format()} в строчке ${row.admission_date_position.format()} - устаревшая информация `;
                    Context.data.debug += ` ${employee.data.__name} ${position.data.__name} ${transferDate.format()} в строчке ${row.admission_date_position.format()} устаревшая информация `;
                    return false;
                }
            }
    }
    return true;
}

//метод для ситуации, если мы уволили сотрудника, а потом приняли снова. При таком подходе у нас будет несколько строк с типом устройства "Основное место работы". Неактуальную информацию (строку занятости) нужно удалить
function deletePreviousPosition(employee: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>,
    employmentRow: Table$kedo$staff$employment_table$Row,
    typeFromData: any,
    employeeId: string): void {
    
    //проверка на основное место работы
    if (typeFromData && employee.data.employment_table && employmentRow.type_employment.name === 'Основное место работы') {
        //проверяем, есть ли ещё строки с основным местом работы
        let mainWorkTypes = employee.data.employment_table.filter((item: any) => item.type_employment.name === 'Основное место работы');
        if (mainWorkTypes && mainWorkTypes.length > 1) {
            //если нашли несколько основных мест, удаляем первое (т.к. мы только что добавили новую строчку, и она, очевидно, не первая)
            let rowToDelete = mainWorkTypes.find((item: any) => item.id_1c !== employeeId);
            if (rowToDelete) {
                try {
                    employee.data.employment_table.delete(employee.data.employment_table.indexOf(rowToDelete));
                    employee.data.id_1c = employmentRow.id_1c;
                } catch (e) {
                    Context.data.error_stack += ` Не удалось удалить предыдущее основное место работы `;
                }
            }
        }
    }
}

//основная процедура обработки пришедших данных по переводу
async function handleData(): Promise<void> {

    //небольшая валидация
    if (!Context.data.staff || !Context.data.position) {
        return;
    }

    let employee = await Context.data.staff.fetch();
    let pos = Context.data.position;
    let posApp = await pos.fetch();
    let org = Context.data.organization;
    let subdivision = Context.data.subdivision;
    let typeWorkRelation = Context.data.type_work_relation as string;
    let transferDate = Context.data.transfer_date as TDate;
    let id_1c = Context.data.id_1c as string;
    let rate = Context.data.rate as number;
    let typeFromData = Context.data.type_from_data;
    let existingPositions = Context.data.existing_positions;
    let mainWorkCategory = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.main_workplace;
    let externalWorkCategory = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.external_combination;
    let internalWorkCategory = Context.fields.staff.app.fields.employment_table.fields.type_employment.variants.internal_combination;

    //проверка на актуальные данные
    if (!isActualData(employee, id_1c, posApp, transferDate)) {
        //не актуальная информация, не загружаем её
        return;
    }

    //заполняем поля в карточке, которые заполняются только для основного места работы
    if (typeWorkRelation && (typeWorkRelation === mainWorkCategory.name)) {
        employee.data.employment_type = mainWorkCategory;
        employee.data.id_1c = id_1c;
    }

    //строка таблицы занятости
    let employment_row: Table$kedo$staff$employment_table$Row | undefined

    //проверка и поиск нужной строки в таблице занятости (чтобы обновить данные). Либо же создание новой строки
    if (existingPositions) {
        Context.data.debug += ` существует позиция `;

        employment_row = employee.data.employment_table!.find((item: any) => id_1c && item.id_1c && item.id_1c === id_1c);

        if (!employment_row) {
            Context.data.debug += ` не нашли строку в таблице  `;
            employment_row = employee.data.employment_table!.insert();
        }
    } else {
        employment_row = employee.data.employment_table!.insert()
    }
    if (!employment_row && pos && pos.id) {
        Context.data.error_stack += " Не нашли строку с позицией " + posApp.data.__name;
        return;
    }

    //заполняем айди сотрудника в строке, этот айди является уникальным полем строки и по нему мы ищем соответствие при загрузке
    employment_row.id_1c = id_1c;

    if (org) {
        employment_row.organization = org;
    }
    if (pos) {
        employment_row.position = pos;
    }
    if (subdivision) {
        employment_row.subdivision = subdivision;
    }

    //заполняем тип трудоустройства только при условии, что у нас есть данные и он ещё не заполнен
    if (typeFromData && typeWorkRelation !== undefined) {
        if (typeWorkRelation === mainWorkCategory.name) {
            employment_row.type_employment = mainWorkCategory;
        } else if (typeWorkRelation === externalWorkCategory.name) {
            employment_row.type_employment = externalWorkCategory;
        } else if (typeWorkRelation === internalWorkCategory.name) {
            employment_row.type_employment = internalWorkCategory;
        }
    }

    Context.data.debug += ` employmentRow.type_employment ${!!employment_row.type_employment} `;

    //добавили заполнение для проверки на старую информацию
    employment_row.admission_date_position = transferDate;

    //заполняем ставку
    try {
        employment_row.rate = rate;
    } catch (e) {
        employment_row.rate = 1;
    }

    //заполняем данные о позиции в самом сотруднике, если приём/перевод был по основному месту работы
    if (employment_row && employment_row.type_employment && employment_row.type_employment.name === mainWorkCategory.name) {
        if (!!pos) {
            employee.data.position = pos;
        }
        if (!!subdivision) {
            employee.data.structural_subdivision = subdivision;
        }
        if (!!org) {
            employee.data.organization = org;
            const orgApp = await org.fetch();
            employee.data.entity = orgApp.data.entity;
        }

        employee.data.employment_type = mainWorkCategory;
        employee.data.id_1c = id_1c;
    }

    //если мы уволили сотрудника, а потом приняли снова. При таком подходе у нас будет несколько строк с типом устройства "Основное место работы"
    deletePreviousPosition(employee, employment_row, typeFromData, id_1c);

    await employee.save();
}

//получаем дату перевода
async function getDate(): Promise<void> {
    if (!Context.data.transfer_row) {
        return;
    }

    let data: any = JSON.parse(Context.data.transfer_row);

    if (data.transfer_date) {
        Context.data.transfer_date = data.transfer_date;
    }
}
