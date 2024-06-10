/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type TPosition = TApplication<Application$kedo$position$Data, Application$kedo$position$Params, Application$kedo$position$Processes>;
type TSubdivision = TApplication<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params, Application$kedo$structural_subdivision$Processes>;
type TOrganization = TApplication<Application$kedo$organization$Data, Application$kedo$organization$Params, Application$kedo$organization$Processes>;

//валидируем данные
async function validate(): Promise<void> {
    Context.data.is_valid = true;

    if (!Context.data.staff || !Context.data.prev_position || !Context.data.end_transfer_date || !Context.data.prev_position_date) {
        Context.data.is_valid = false;    
    }
}

//восстанавливаем предыдущую позицию
async function restorePosition(): Promise<void> {    
    if (Context.data.staff && Context.data.prev_position) {
        let employee = await Context.data.staff.fetch();
        let position = await Context.data.prev_position.fetch();

        if (employee.data.employment_table) {
            //ищем строку в таблице занятости
            let row = employee.data.employment_table.find((item: any) => item.id_1c === Context.data.employee_id);
            if (row) {
                row.position = Context.data.prev_position as TPosition;
                row.subdivision = position.data.subdivision as TSubdivision;
                row.organization = position.data.organization as TOrganization;
                row.admission_date_position = Context.data.prev_position_date as TDate;

                if (Context.data.is_main_worktype) {
                    employee.data.position = Context.data.prev_position as TPosition;
                    employee.data.structural_subdivision = position.data.subdivision as TSubdivision;
                    employee.data.organization = position.data.organization as TOrganization;
                    employee.data.admission_date_position = Context.data.prev_position_date as TDate;
                }

                await employee.save();
            }
        }
    }
}
