/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function create_file_name(): Promise<void> {
    const order_file = await Context.data.order_file!.fetch();
    const name_file = order_file.data.__name.split('.docx')[0];
    Context.data.order_file_name = name_file;
}

async function get_labor_contract(): Promise<void> {
    const labor_contract = await Context.fields.labor_contract.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.staff.link(Context.data.staff!)
    )).first();

    if (labor_contract) {
        Context.data.labor_contract = labor_contract;
        Context.data.labor_contract_number = labor_contract.data.__index!.toString();
    }
}

