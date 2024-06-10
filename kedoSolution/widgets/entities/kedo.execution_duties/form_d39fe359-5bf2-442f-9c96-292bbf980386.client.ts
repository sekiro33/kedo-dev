/* Client scripts module */
declare const console:any;

async function onInit(): Promise<void> {

    if (Context.data.execution_duties) {
        const app = await Context.data.execution_duties.fetch();
        ViewContext.data.is_cancellation_process = app.data.is_cancellation_process;
    }

    const execution_duties = await Context.data.execution_duties!.fetch();
    const labor_contract = await Context.fields.labor_contract.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(execution_duties.data.substitute!),
            f.__status.eq(Context.fields.labor_contract.app.fields.__status.variants.signed)
        ))
        .first();
    if (labor_contract) {
        Context.data.labor_contract_number = labor_contract.data.labor_contract_number;
        Context.data.contract_date = labor_contract.data.__createdAt.getDate();
    }
    Context.data.start_date = execution_duties!.data.start_date!.getDate();
    Context.data.end_date = execution_duties!.data.end_date!.getDate();
}



async function labor_contract_change(): Promise<void> {
    if (Context.data.labor_contract) {
        let app = await Context.data.labor_contract.fetch();
        Context.data.contract_date = app.data.__createdAt.getDate();
    }
}
