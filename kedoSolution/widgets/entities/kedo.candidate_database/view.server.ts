/* Server scripts module */
async function changeDateEmploymentInCandidate(): Promise<void> {
    if (Context.data.id_process) {
        const candidate = await Application.search().where(f => f.__id.eq(Context.data.__id)).first();
        if (candidate) {
           candidate.data.date_employment = ViewContext.data.date_employment;
            await candidate!.save() 
        }
    }
}