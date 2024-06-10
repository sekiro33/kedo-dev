/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function cancellationSubstitution(): Promise<void> {
    const combitation = await Context.data.execution_duties!.fetch();
    if (combitation.data.replacement_id && combitation.data.replacement_id.length > 0) {
        const susbtitution = await System.replacements.search().where((f,g) => g.and(f.__deletedAt.eq(null), f.__id.eq(combitation.data.replacement_id!))).first();
        if (susbtitution) {
            Context.data.debug = 'Нашли замещение'
            const now = new Datetime
            if (susbtitution.data.begin!.before(now)) {
                await susbtitution.interrupt()
            } else {
                Context.data.debug += ', удалили неначатое замещение'
                await susbtitution.delete()
            }
            
        }   
    }
    
}