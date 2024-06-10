/* Client scripts module */

async function interrupt(): Promise<void> {
    if (Context.data.id_process) {
        const candidate = await Application.search().where(f => f.__id.eq(Context.data.__id)).first();
        const status = Application.fields.__status.variants.refused
        await candidate!.setStatus(status)
        
        const process = await System.processes._searchInstances().where(f => f.__id.eq(Context.data.id_process!)).first();
        await process!.interrupt('Работа с кандидатом прервана инициатором');
    }
    
}

async function changeDateEmployment(): Promise<void> {
    await Server.rpc.changeDateEmploymentInCandidate();
    const process = await System.processes._searchInstances().where(f => f.__id.eq(Context.data.id_process!)).first();
        try {
            const context = {possible_date_employment: ViewContext.data.date_employment, change_timer: true}
            process?.updateContext(context, 'Изменена дата трудоустройства');
            const timer1 = await process?.getTimer('f5852b93-d90b-4ec8-a75c-7201a0792f00');
            if (timer1) {
                timer1.interrupt()
            }
            const timer2 = await process?.getTimer('a7bed67d-516b-4983-827a-c1d0934add4d');
            if (timer2) {
                timer2.interrupt()
            }
        } catch (e) {

        }
        
}
