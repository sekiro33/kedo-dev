/* Client scripts module */
let navigation_items: PortalPageInfo[] = [];
function getNavigationItems(): PortalPageInfo[] {
    return navigation_items;
}

async function onInit() {
    const promises: Promise<any>[] = [];
    promises.push(loadNavigationItems());
    await Promise.all(promises);
}
async function loadNavigationItems(){
    navigation_items = await Namespace.kedo_ext.getPages();
}
