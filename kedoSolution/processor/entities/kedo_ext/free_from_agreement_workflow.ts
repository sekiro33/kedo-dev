/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function set_status_field(): Promise<void> {
    let app = await Context.data.free_from!.fetch();
    app.data.status_line = app.data.__status!.code + ';' + app.data.__status!.name;
    await app.save();
}

async function comment_get(): Promise<void> {
    let appeal = await Context.data.free_from!.fetch();
    const approvalLists = await appeal.docflow().getApprovalLists();
    Context.data.comment = '';
    let list = approvalLists[0];
    let respondets = list.respondents;
    for (let respondent of respondets) {
        if (respondent.status == "rejected") {
            Context.data.coordinating_comment = respondent.comment;
            break;
        }
    }
    //await item.save();
}