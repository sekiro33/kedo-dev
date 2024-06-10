/* Client scripts module */

declare const console:any;
declare const document:any;
declare const window:any;
declare const setLinks:any;

const host = window.location.host;
const origin = window.location.origin;
let managerUsers: any[] = [];
let currentUser: CurrentUserItem;

async function initWidget(): Promise<void>{
    showManagersCards()

    const cardWrapper = document.querySelector('.kedo__main-services-cards-wrapper');

    const serviceInfoRow = document.querySelector('.kedo__main-services-info-row');
    const listPersons = document.querySelector('.kedo__main-services-info-list_persons');
    const listAccounting = document.querySelector('.kedo__main-services-info-list_accounting');

    function setMainTabStyles(){
        serviceInfoRow.classList.add('kedo__main-services-info-row_is-main-tab');
        listPersons.classList.add('kedo__main-services-info-list_persons_is-main-tab');
        listAccounting.classList.add('kedo__main-services-info-list_accounting_is-main-tab');
    }
    function offMainTabStyles(){
        serviceInfoRow.classList.remove('kedo__main-services-info-row_is-main-tab');
        listPersons.classList.remove('kedo__main-services-info-list_persons_is-main-tab');
        listAccounting.classList.remove('kedo__main-services-info-list_accounting_is-main-tab');
    }

    // async function addDelayedAlerts(): Promise<void> {
    //     await getCurrentUser();
    //     const articleCards = document.querySelectorAll(".kedo__main-services-card:not(.kedo__main-services-element_hidden):not(.vacation-card):not(.overtime-work)");
    //     articleCards.forEach((card: any) => {
    //         const articleTitle = card.querySelector(".kedo__main-services-card-title").textContent;
    //         const articleLink = card.querySelector("a");
    //         articleLink.addEventListener('click', () => {
    //             let findSaveButton = window.setInterval(() => {
    //                 let saveButton = document.querySelector('footer.modal-footer button.btn.btn-primary')
    //                 if (!saveButton) {
    //                     return;
    //                 };
    //                 saveButton.addEventListener('click', () => {
    //                     Context.data.alert_info_json = `Не забудьте зайти на портал и подписать ${articleTitle.toLowerCase()}.`;
    //                     Context.data.delayed_alert_required = true;
    //                     console.log(Context.data.alert_info_json);
    //                 })
    //                 window.clearInterval(findSaveButton)
    //             })
    //         });
    //     });
    //     window.addEventListener('beforeunload', async function(e: any) {
    //         // e.preventDefault();
    //         // e.returnValue = false;
    //         if (Context.data.delayed_alert_required) {
    //             console.log('start process')
    //             const alertInfoObj = Context.data.alert_info_json!;
    //             await Namespace.processes.delayed_alert.run({alert_text: alertInfoObj});
    //             Context.data.delayed_alert_required = false;
    //         };
    //         return false;
    //     });
    //     Context.data.event_listeners_added = true;
    // };

    const allElements = document.querySelectorAll('.kedo__main-services-element');
    allElements.forEach((item: any) => item.classList.remove('kedo__main-services-element_hidden'))

    const hasCardElement = document.querySelectorAll('.kedo__main-services-element_has-card')

    // is cards show need
    if(Context.data.show_service_cards === true){
        hasCardElement.forEach((item: any) => item.classList.add('kedo__main-services-element_hidden'));
        cardWrapper.classList.remove('kedo__main-services-cards-wrapper_hidden');
        offMainTabStyles()
    } else {
        cardWrapper.classList.add('kedo__main-services-cards-wrapper_hidden');
        setMainTabStyles();
    }   

    const vacationElements = document.querySelectorAll('.kedo__main-services-element_vacation');
    const noVacationElements = document.querySelectorAll('.kedo__main-services-element_no-vacation');

    if(Context.data.are_there_vacations === true){
        noVacationElements.forEach((item: any) => item.classList.add('kedo__main-services-element_hidden'));
    } else {
        vacationElements.forEach((item: any) => item.classList.add('kedo__main-services-element_hidden'));
    }

    const tripsElements = document.querySelectorAll('.kedo__main-services-element_trips');
    const noTripsElements = document.querySelectorAll('.kedo__main-services-element_no-trips');

    if(Context.data.are_there_business_trips === true){
        noTripsElements.forEach((item: any) => item.classList.add('kedo__main-services-element_hidden'));
    } else {
        tripsElements.forEach((item: any) => item.classList.add('kedo__main-services-element_hidden'));
    }
    // if (!Context.data.event_listeners_added) {
    //     await addDelayedAlerts();
    // };
    const contentElement = document.querySelector('.kedo__main-services-content');
    contentElement.classList.remove('kedo__main-services-content_hidden');
}

async function showManagersCards(){
    await Promise.all([await getManagerUsers(), await getCurrentUser()]);
    console.log(currentUser.data.groupIds)
    console.log(Context.data.show_overtime_work)
    
    if((managerUsers && managerUsers.find(uid => uid === currentUser.id)) || Context.data.show_overtime_work){
        console.log("user is manager")
        const managersCards = document.querySelectorAll('.kedo__main-services-element_for-managers');

        managersCards.forEach((item: any) => {
            item.classList.remove('kedo__main-services-element_hidden-for-staff')
        })
    };
    if (!Context.data.show_overtime_work) {
        const overtimeBlocks = document.querySelectorAll(".overtime-work");
        overtimeBlocks.forEach((block: any) => {
            block.style.display = "none";
        });
    };
};


async function getManagerUsers(){
    await Server.rpc.getManagerGroups();
    managerUsers = [];
    let groupsAdmin = Context.data.groups_json ? JSON.parse(Context.data.groups_json!) : undefined;

    if(!groupsAdmin) return;

    for (let group of groupsAdmin) {
        managerUsers.push(...group.usersIds)
    };
};
async function getCurrentUser(){
    currentUser = await System.users.getCurrentUser()
}