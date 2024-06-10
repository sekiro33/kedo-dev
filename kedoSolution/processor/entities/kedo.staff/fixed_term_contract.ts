/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function fillDate(): Promise<void> {
    
    const setting = await Namespace.app.settings.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq('days_to_warn_hrs_about_fixedterm_contract')
    )).first();

    let diff: number = 5;

    if (setting && setting.data.quantity) {
        diff = setting.data.quantity;
    }

    if (Context.data.contract_expire_date) {
        Context.data.warn_date = Context.data.contract_expire_date.addDate(0, 0, -diff);
    }

}

async function getSettings(): Promise<void> {
    const setting = await Namespace.app.settings.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq('send_notification_about_the_ending_of_personnel_transfer')
    )).first();

    let notify = false;

    if (setting && setting.data.status) {
        notify = setting.data.status;
    }

    Context.data.send_notification = notify;
}
