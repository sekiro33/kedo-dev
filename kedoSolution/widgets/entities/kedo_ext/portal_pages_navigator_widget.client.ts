/* Client scripts module */
async function onNavigate(urls: string[]): Promise<WidgetRefWithValues | undefined>{
    if(!urls.length) {
        return;
    }

    const pages = await Namespace.portal.getPages();

    const page = pages.find(page => page.code === urls[0]);
    if(!page){
        return;
    }

    return UI.Navigator.fromPortalPage(page);
}