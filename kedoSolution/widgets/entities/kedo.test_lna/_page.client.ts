declare const console: any;

async function getDoc(): Promise<void> {
    let position = Context.data.position
    let lnaDocs = await Context.fields.lna_doc.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.positions_review.has(position!),
        g.or(
            f.__status.eq(Context.fields.lna_doc.app.fields.__status.variants.approved),
            f.__status.eq(Context.fields.lna_doc.app.fields.__status.variants.current)
        )
    )).size(10000).all()
    console.log(lnaDocs)
};
