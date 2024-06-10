/* Client scripts module */

async function onInit(): Promise<void> {
    let arrayCodeGroups = ['0b7cab5e-31ef-4bd8-8f91-b5689111cf7a', 'dfede5be-5011-4ec9-b535-8c9ca3fc4d19', 'abdecf4b-b6ba-419f-bac7-c1455d2a6159', '0798a43a-8ed9-4b30-8dfe-e16559fb7695', 'administrators'];
    let currentUser = await System.users.getCurrentUser();

    let curUserCodeGroups = currentUser.data.groupIds?.map(f => f.code);
    if (curUserCodeGroups && curUserCodeGroups.length > 0) {
        for (let one of arrayCodeGroups) {
            if (curUserCodeGroups.find(f => f == one)) {
                ViewContext.data.viewrightpanel = true;
            }
        }
    }
}