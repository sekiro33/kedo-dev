declare const console: any;

async function onInit(): Promise<void> {
    if (Context.data.__file) {
        ViewContext.data.tab_visibility = true;
    } else {
        ViewContext.data.tab_visibility = false;
    }

    const doc = await Application.search().where(f => f.__id.eq(Context.id)).first();
    
    if (doc) {
        const data_signs = await doc.getDataSigns();

        if (data_signs && data_signs.length > 0) {
            ViewContext.data.sign_status_visible = true;
        }
    }
}