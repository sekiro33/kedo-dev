/* Client scripts module */
async function onInit(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();
        
        if (staff.data.employment_table && staff.data.employment_table.length > 0) {
            const row = staff.data.employment_table[0];
            Context.data.contract_number = row.number_employment_contract;
            Context.data.contract_date = row.date_employment_contract_as_date;
        }
    }
}