/* Server scripts module */
async function getLogoFromParams(): Promise<void> {
    if(!Namespace.params.data.portal_logo_svg) return;
    
    Context.data.logo_from_params = Namespace.params.data.portal_logo_svg;
}

async function getUserEntity(): Promise<void> {
    if(!Context.data.user_card) return;
    const userCard = await Context.data.user_card.fetch();
    if(!userCard) return;
    let entityApp: ApplicationItem<Application$kedo$organization$Data, any>;
    if(userCard.data.organization){
        entityApp = await userCard.data.organization.fetch();
    } else {
        return;
    };

    if(entityApp.data.__name){
        Context.data.entity = entityApp.data.__name;
    }
}

async function getHeaderData(): Promise<void> {
    await Promise.all([await getLogoFromParams(), await getUserEntity()])
}
