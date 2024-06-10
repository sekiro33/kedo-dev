/* Client scripts module */

async function subdivision_get(): Promise<void> {
    if (Context.data.position) {
        const position = await Context.data.position.fetch();
        const subdivision = await position.data.subdivision!.fetch();
        const entity = await subdivision.data.organization!.fetch();
        Context.data.subdivision = position.data.subdivision;
        Context.data.organization = entity;
        Context.data.entity = entity.data.entity;
    }
}
