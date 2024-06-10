/* Client scripts module */

async function onInit(): Promise<void> {
    if (Context.data.table_data) {
        ViewContext.data.table_data_view = JSON.parse(Context.data.table_data);
    }
}