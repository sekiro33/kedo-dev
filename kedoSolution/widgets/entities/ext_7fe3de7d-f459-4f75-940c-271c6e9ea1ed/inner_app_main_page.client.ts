declare const console: any;

async function onInit(): Promise<void> {
    const domenSetting = await Context.fields.settings_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq("domen")
    )).first();
    if (domenSetting) {
        const portalLink = `${domenSetting.data.value}/_portal/kedo_ext/user_page`;
        Context.data.portal_link = portalLink;
        console.log(portalLink)
    };
}