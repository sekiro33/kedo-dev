/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_staff_replcament(): Promise<void> {
    if (!Context.data.staff) {
        Context.data.error = 'Не указан сотрудник';
        throw new Error(Context.data.error);
    }

    const staff = await Context.data.staff.fetch();
    
    if (!staff.data.ext_user) {
        Context.data.error = 'У сотрудника не найден связанный с ним пользователь';
        throw new Error(Context.data.error);
    }

    const user = staff.data.ext_user;

    const now = new Datetime();

    const replacement = await System.replacements.search().where((f, g) => g.and(
        f.absent.eq(user),
        f.begin.lte(now),
        f.end.gte(now),
    )).first()

    if (replacement) {
        Context.data.date_end = replacement.data.end;
    } else {
        Context.data.date_end = undefined;
    }
}
