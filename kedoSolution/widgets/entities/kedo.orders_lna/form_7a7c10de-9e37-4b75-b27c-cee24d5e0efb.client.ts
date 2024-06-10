/* Client scripts module */

async function set_responsible(): Promise<void> {
    if(!Context.data.executor_staff!) return;
    let executor = await Context.data.executor_staff.fetch();
    if(!executor.data.ext_user) return;
    Context.data.responsible = executor.data.ext_user;
}
