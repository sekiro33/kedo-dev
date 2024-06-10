/* Server scripts module */

async function getNamespaceParams(): Promise<void> {
    Context.data.is_trips_active = (await Context.fields.settings.app.search().where(f => f.code.eq('travel_section_added')).first())!.data.status;
    Context.data.is_vacations_active = (await Context.fields.settings.app.search().where(f => f.code.eq('podklyuchen_razdel_otpuskov')).first())!.data.status;
    Context.data.parameters_set = true;
    Context.data.hide_right_column = !Context.data.is_trips_active && !Context.data.is_vacations_active;
    Context.data.token = Namespace.params.data.token
}

async function getUserEntity(): Promise<void> {
    if(!Context.data.user_application) return;
    const userCard = await Context.data.user_application.fetch();
    if(!userCard) return;

    let entityApp: ApplicationItem<Application$_system_catalogs$_my_companies$Data,Application$_system_catalogs$_my_companies$Params>|undefined = undefined;
    if(userCard.data.entity){
        entityApp = await userCard.data.entity.fetch();
    }
    if(!entityApp) return;

    if(entityApp.data.__name){
        Context.data.entity = entityApp.data.__name;
    }
}