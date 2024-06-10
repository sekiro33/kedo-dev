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

async function get_payslip(): Promise<void> {
    if (Context.data.payslip_request_id) {
        Context.data.payslip_request = await Context.fields.payslip_request.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__id.eq(Context.data.payslip_request_id!)
            ))
            .first();
    }
}

async function get_print_form(): Promise<void> {
    if (Context.data.payslip_request) {
        const payslip_request = await Context.data.payslip_request.fetch();
        if (payslip_request.data.print_forms && payslip_request.data.print_forms.length > 0) {
            Context.data.payslip_file = payslip_request.data.print_forms[0];
        }
    }
}

async function check_print_form(): Promise<boolean> {
    return Context.data.payslip_file ? true : false;
}
