/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function prepare_staffs(): Promise<boolean> {
    if (Context.data.staff && Context.data.staff.length > 0) {
        Context.data.staff_kedo = Context.data.staff.pop();
        return true
    } else {
        return false
    }
}
async function checkStaffFields(): Promise<void> {
 
  Context.data.error_message = 'В карточке Сотрудника найдены пустые поля:\n';
  Context.data.fullness_of_fields = true;
  const staff = await Context.data.staff_kedo!.fetch();
  if (!staff.data.full_name) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'ФИО;\n';
  }
  if (!staff.data.inn) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'ИНН;\n';
  }
  if (!staff.data.snils) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'СНИЛС;\n';
  }
   if (!staff.data.email) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Электронная почта;\n';
  }
   if (!staff.data.phone) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Телефон;\n';
  }
  if (!staff.data.passport_series) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Серия паспорта;\n';
  }
  if (!staff.data.passport_number) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Номер паспорта;\n';
  }
  if (!staff.data.passport_department_code) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Код подразделения;\n';
  }
  if (!staff.data.date_of_issue) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Дата выдачи;\n';
  }
    if (!staff.data.date_of_birth) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Дата рождения;\n';
  }
}

async function processingLabels(): Promise<void> {
  if (Context.data.russian_passport == true) {
    Context.data.series = Context.data.russian_passport_series;
    Context.data.number = Context.data.russian_passport_number;
    Context.data.pass_code = Context.data.russian_passport_department_code;
  }
  if (Context.data.russian_passport == false) {
    Context.data.series = Context.data.context_passport_series;
    Context.data.number = Context.data.context_passport_number;
    Context.data.pass_code = Context.data.context_passport_department_code;
  }
}

async function interrupt_process_recruiment(): Promise<void> {
  if (Context.data.staff_kedo) {
    const staff = await Context.data.staff_kedo.fetch();
    if (staff.data.id_process_recruitment) {
      const massive_process = staff.data.id_process_recruitment.split(',');
      for (let process_id of massive_process) {
        const process = await System.processes._searchInstances().where(f => f.__id.eq(process_id)).first();
        if (process) {
          try {
            await process.interrupt('Сотрудник приглашен заново')
          } catch (e) {}
        }
      }
      
    }
  }
    
}
