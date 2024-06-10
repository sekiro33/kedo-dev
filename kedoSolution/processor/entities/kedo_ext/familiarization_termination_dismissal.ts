/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_data(): Promise<void> {
    if(Context.data.chief_app){
        Context.data.chief = (await Context.data.chief_app.fetch()).data.ext_user;
    }
    Context.data.alert_body = `Сотрудник ${(await Context.data.staff!.fetch()).data.__name} отозвал заявление на увольнение`;
    if(Context.data.letter_of_resignation){
        let app = await Context.data.letter_of_resignation.fetch();
        if(app.data.linked_order){
            let order = await app.data.linked_order.fetch();
            order.setStatus(order.fields.__status.variants.recall)
        }
    }
}
async function set_contract_field(): Promise<void> {
    let statement = await Context.data.letter_of_resignation!.fetch();
    statement.data.line_status = statement.data.__status!.code + ';' + statement.data.__status!.name;
    await statement.save();
}


async function interrupt_process(): Promise<void> {
    if (Context.data.letter_of_resignation) {
        let app = await Context.data.letter_of_resignation.fetch();
        let id = app!.data.id_process!;
        let process = await Context.fields.staff.app.processes.the_dismissal_process._searchInstances().where((proc, g) => g.and(proc.__id.eq(id))).first();
        if (process) {
            try {
               await process.interrupt("Отзыв заявление");
            }
            catch (e) {
                Context.data.debug = e.message
            }
        }
    }
}
