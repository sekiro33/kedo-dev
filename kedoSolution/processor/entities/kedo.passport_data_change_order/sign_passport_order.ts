async function line_status_set(): Promise<void> {
    let doc = await Context.data.passport_data_change_order!.fetch();
    doc.data.line_status = `${doc.data.__status!.code};${doc.data.__status!.name}`
    await doc.save();
}