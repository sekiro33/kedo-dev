
async function getBossPosition(): Promise<void> {
    if (Context.data.boss) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.boss!)
            ))
            .first()
        Context.data.boss_position = headApp!.data.position
    }
}

async function createStatusObj(app: any, status: string): Promise<void> {

    const obj_status = {
        'app': {
            'namespace': app.namespace,
            'code': app.code,
            'id': app.id,
        },
        'status': status,
    }

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function createStatusChiefOrderSigning(): Promise<void> {
    createStatusObj(Context.data.additional_agreement, 'chief_order_signing');
}
async function createStatusAppChiefOrderSigning(): Promise<void> {
    createStatusObj(Context.data.staff_personal_data, 'chief_doc_signing');
}


async function setDocName(): Promise<void> {
    if (Context.data.file) {
        const doc_name = await Context.data.file.fetch();
        Context.data.file_name = doc_name.data.__name.replace('.docx', '');
    }
}

async function getEmploymentContract(): Promise<void> {
    // if (!Context.data.staff) {
    //     throw new Error("Context.data.staff is undefined");
    // }
    if (!Context.data.staff_personal_data) {
        throw new Error("Context.data.staff_personal_data is undefined");
    }
    // Context.data.employment_contract = await Context.fields.employment_contract.app.search()
    //     .where((f, g) => g.and(
    //         f.__deletedAt.eq(null),
    //         f.staff.link(Context.data.staff!)
    //     ))
    //     .first();

    const staff_app = await Context.data.staff_personal_data.fetch();
    if (staff_app.data.full_name) {
        Context.data.full_name_string = staff_app.data.full_name!.lastname + " " + staff_app.data.full_name!.firstname + " " + staff_app.data.full_name!.middlename;
    } else {
        Context.data.full_name_string = "";
    }
}

async function processingTable(): Promise<void> {
    // if (Context.data.staff) {
    //     const staff = await Context.data.staff.fetch();
    //     if (staff.data.employment_table) {
    //         Context.data.count_type_employment = staff.data.employment_table.length;
    //     }
    // }

    if (Context.data.info_additional_table) {
        Context.data.count_type_employment = Context.data.info_additional_table.length;
    }
}

async function processingRows(): Promise<void> {
    if (Context.data.info_additional_table) {
        const row = Context.data.info_additional_table[Context.data.count_type_employment! - 1];
        Context.data.organization_employee = row.organization_employee;
        Context.data.agreement_number = row.number;
        Context.data.agreement_date = row.agreement_date;
        Context.data.number_labor_contract = row.employment_contract_number;
        Context.data.date_labor_contract = row.date_employment_contract;


        Context.data.count_type_employment!--;

        if (Context.data.count_type_employment == 0) {
            Context.data.isEmployeeProcessed = true;
        } else {
            Context.data.isEmployeeProcessed = false;
        }
    }
    // Context.data.is_main_workplace = false;
    // Context.data.is_internal_combination = false;
    // Context.data.is_external_combination = false;

    // if (Context.data.staff) {
    //     const staff = await Context.data.staff.fetch();
    //     if (staff.data.employment_table) {
    //         const row = staff.data.employment_table[Context.data.count_type_employment! - 1];

    //         if (Context.data.isExternalApp == true && Context.data.place_employment) {
    //             const place_employment = await Context.data.place_employment.fetch();
    //             Context.data.type_employment_string = place_employment.data.type_employment!.name;
    //             Context.data.organization_employee = place_employment.data.organization;
    //             Context.data.is_external_combination = false;

    //             return;
    //         }

    //         Context.data.type_employment_string = row.type_employment.name;
    //         Context.data.organization_employee = row.organization;
    //         Context.data.place_employment = row.employment_placement_app;
    //         Context.data.count_type_employment!--;

    //         if (row.type_employment.code == 'main_workplace') {
    //             Context.data.is_main_workplace = true;
    //             if (Context.data.is_internal_place == true) {
    //                 Context.data.type_employment_string = `${row.type_employment.name} и внутреннее(-ие) совместительство(-а)`;
    //             }
    //         }
    //         if (row.type_employment.code == 'internal_combination') {
    //             Context.data.is_internal_combination = true;
    //             Context.data.is_internal_place = true;
    //         }
    //         if (row.type_employment.code == 'external_combination') {
    //             Context.data.is_external_combination = true;
    //         }

    //         if (Context.data.count_type_employment == 0) {
    //             Context.data.isEmployeeProcessed = true;
    //         } else {
    //             Context.data.isEmployeeProcessed = false;
    //         }
    //     }
    // }


}

async function processingTableDocuments(): Promise<void> {
    if (Context.data.documents_table) {
        Context.data.count_row_table = Context.data.documents_table.length;
    }
}

async function processingRowsDocumentsTable(): Promise<void> {
    if (Context.data.documents_table) {
        const row = Context.data.documents_table[Context.data.count_row_table! - 1];
        Context.data.organization_employee = row.organization_employee;
        Context.data.number_labor_contract = row.employment_contract_number;
        Context.data.date_labor_contract = row.date_employment_contract;
        Context.data.signatory_table_app = row.responsible;
        const signatory = await row.responsible.fetch();
        Context.data.signatory_table = signatory.data.ext_user;
        Context.data.need_choise_signatory = false;


        if (!row.file) {
            Context.data.need_create_file = true;
            Context.data.count_row_table!--;

            if (Context.data.count_row_table == 0) {
                Context.data.isEmployeeProcessed = true;
            } else {
                Context.data.isEmployeeProcessed = false;
            }

            return;
        }
        Context.data.file = row.file;

        Context.data.count_row_table!--;

        if (Context.data.count_row_table == 0) {
            Context.data.isEmployeeProcessed = true;
        } else {
            Context.data.isEmployeeProcessed = false;
        }
    }
}
