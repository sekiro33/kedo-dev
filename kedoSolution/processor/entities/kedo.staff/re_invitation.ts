/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function refreshLink(): Promise<void> {
    let external_user = (await Context.data.staff!.fetch()).data.external_user;
    Context.data.invitation_link_for_new_user = await (Namespace as any).factory.Global.ns.kedo_ext.portal.signupUrl((await external_user![0].fetch()), { refresh: true });
    /*Context.data.invitation_link_for_new_user = await Namespace.kedo_ext.signupUrl((await external_user![0].fetch()), {
        refresh: true,
    });*/
    await interlal_user_link();
}
async function ext_user_check(): Promise<boolean> {
    let staff = await Context.data.staff!.fetch();
    let ext_user = staff.data.ext_user;
    if (!staff.data.external_user) return false;
    let external_user = await staff.data.external_user[0].fetch();
    if (ext_user && external_user.data.__user_status == external_user.fields.__user_status.variants.active) return true;
    return false;
}


async function interlal_user_link(): Promise<void> {
    try {
        let user = await Context.data.staff!.fetch();
        let entity: ApplicationItem<Application$_system_catalogs$_my_companies$Data, Application$_system_catalogs$_my_companies$Params> | undefined = undefined
        if (user.data.entity)
            entity = await user.data.entity.fetch();
        Context.data.alert_body =
            `Приглашаем вас на портал обмена кадровыми электронными документами ${entity?.data.__name}.
    На портале вы сможете создавать и подписывать кадровые документы в электронном виде.
    Перейдите по ссылке и пройдите процедуру трудоустройства на портале.`;
    }
    catch (e) {
        Context.data.staff!.sendMessage('Ошибка при генерации приглашения', 'Ошибка ' + e.name + ":" + e.message);
        throw (e);
    }

}
async function user_check(): Promise<boolean> {
    let staff = await Context.data.staff!.fetch();
    if (!staff.data.staff_access) return false;
    return true;
}
