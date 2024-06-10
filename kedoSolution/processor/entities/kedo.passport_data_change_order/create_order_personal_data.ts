/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_labor_number(): Promise<void> {
    let staff = await Context.data.staff!.fetch();
    let doc = await Context.fields.labor_contract.app.search().where(f => f.staff.link(staff)).first();
    if (!doc)
        return
    Context.data.labor_contract = doc;
}

async function getPositions(): Promise<void> {
    if (Context.data.boss) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.boss!)
            ))
            .first();
        Context.data.boss_position = headApp!.data.position;
    }

    if (Context.data.responsible_accouting_user) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.responsible_accouting_user!)
            ))
            .first();
        Context.data.responsible_accounting = headApp;
    }

    if (Context.data.responsible_hr_dep_user) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.responsible_hr_dep_user!)
            ))
            .first();
        Context.data.responsible_hr_dep = headApp;
    }
}

async function getEmploymentContract(): Promise<void> {
    if (!Context.data.staff_personal_data) {
        throw new Error("Context.data.staff_personal_data is undefined");
    }

    const staff_app = await Context.data.staff_personal_data.fetch();
    if (staff_app.data.full_name) {
        Context.data.full_name_string = staff_app.data.full_name!.lastname + " " + staff_app.data.full_name!.firstname + " " + staff_app.data.full_name!.middlename;
    } else {
        Context.data.full_name_string = "";
    }
    
}

async function setDocName(): Promise<void> {
    if (Context.data.file) {
        const doc_name = await Context.data.file.fetch();
        Context.data.file_name = doc_name.data.__name;
    }
}

async function processingTableDocuments(): Promise<void> {
    if (Context.data.order_table) {
        Context.data.count_row_table = Context.data.order_table.length;

        const row = Context.data.order_table[Context.data.count_row_table! - 1];
        Context.data.organization_employee = row.organization_employee;
        const signatory = await row.responsible.fetch();
        Context.data.signatory!.push(signatory.data.ext_user!);

        if (row.file) {
            Context.data.need_create_file = true;
            Context.data.need_number = false;
            Context.data.file = row.file;
        } else {
            Context.data.need_number = true;
        }
    }
}

async function processingOrganization(): Promise<void> {
    if (Context.data.isExternalApp == true && Context.data.place_employment) {
        const place_employment = await Context.data.place_employment.fetch();
        Context.data.organization_employee = place_employment.data.organization;
    } else {
        const staff = await Context.data.staff!.fetch();
        Context.data.organization_employee = staff.data.organization;
    }
}
