/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function check_personal_id(): Promise<boolean> {
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();
        return staff.data.individual_id_1c ? true : false;
    }
    return false;
}

async function get_payslip_request(): Promise<void> {
    if (!Context.data.integration_app_id) {
        Context.data.error = `Отсутствует ID приложения интеграции (запрос на РЛ)`;
        throw new Error(Context.data.error);
    }
    
    if (Context.data.integration_app_id) {
        Context.data.payslip_requests_1c = await Context.fields.payslip_requests_1c.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.eq(Context.data.integration_app_id!)
            ))
            .first();

        if (!Context.data.payslip_requests_1c) {
            Context.data.error = `Не найдено приложение интеграции (запрос на РЛ)`;
            throw new Error(Context.data.error);
        }
    }
}

async function get_print_form(): Promise<void> {
    if (Context.data.payslip_requests_1c) {
        const payslip_requests_1c = await Context.data.payslip_requests_1c.fetch();
        
        if (payslip_requests_1c.data.print_forms && payslip_requests_1c.data.print_forms.length > 0) {
            Context.data.payslip_file = payslip_requests_1c.data.print_forms[0];
        }
    }
}
