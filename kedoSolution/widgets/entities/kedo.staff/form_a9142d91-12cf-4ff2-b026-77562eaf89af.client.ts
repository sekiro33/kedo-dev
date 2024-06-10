/* Client scripts module */


async function onInit(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();
        if (staff.data.employment_table) {

            for (Context.data.count_type_employment; Context.data.count_type_employment != 0; Context.data.count_type_employment!--) {
                const row = staff.data.employment_table[Context.data.count_type_employment! - 1];
                if ((row.type_employment.code == 'main_workplace' || row.type_employment.code == 'internal_combination') && Context.data.type_employment_string != 'Внешнее совместительство') {
                    const row_insert_doc = Context.data.documents_table!.insert();
                    row_insert_doc.place_employment_string = row.type_employment.name;
                    row_insert_doc.organization_employee = row.organization;
                    row_insert_doc.responsible = (await row.organization.fetch()).data.signatories![0];
                    row_insert_doc.date_employment_contract = row.date_employment_contract_as_date;
                    row_insert_doc.employment_contract_number = row.number_employment_contract;

                    Context.data.documents_table = Context.data.documents_table;

                }
                if (row.type_employment.code == 'main_workplace' && Context.data.type_employment_string != 'Внешнее совместительство') {
                    const row_insert_order = Context.data.order_table!.insert();
                    row_insert_order.place_employment_string = row.type_employment.name;
                    row_insert_order.organization_employee = row.organization;
                    row_insert_order.responsible = (await row.organization.fetch()).data.signatories![0];

                    Context.data.order_table = Context.data.order_table;
                }
            }
        }

        if (Context.data.type_employment_string == 'Внешнее совместительство') {
            if (Context.data.place_employment) {
                const place_emloyment = await Context.data.place_employment.fetch();
                const row_insert_doc = Context.data.documents_table!.insert();
                row_insert_doc.place_employment_string = place_emloyment.data.type_employment!.name;
                row_insert_doc.organization_employee = place_emloyment.data.organization!;
                row_insert_doc.responsible = (await place_emloyment.data.organization!.fetch()).data.signatories![0];

                Context.data.documents_table = Context.data.documents_table;

                const row_insert_order = Context.data.order_table!.insert();
                row_insert_order.place_employment_string = place_emloyment.data.type_employment!.name;
                row_insert_order.organization_employee = place_emloyment.data.organization!;
                row_insert_order.responsible = (await place_emloyment.data.organization!.fetch()).data.signatories![0];

                Context.data.order_table = Context.data.order_table;
            }
        }
    }
}