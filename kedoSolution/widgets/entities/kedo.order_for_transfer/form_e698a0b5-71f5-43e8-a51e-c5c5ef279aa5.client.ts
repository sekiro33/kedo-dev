/* Client scripts module */


async function onInit(): Promise<void> {
    const now = new TDate().addDate(0, 0, -1);
    Context.fields.order_date.data.setFilter(f => f.gte(now));
}