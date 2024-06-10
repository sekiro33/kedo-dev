declare const document: any, console: any, menuFooterText: any, window: any;

interface MenuItem {
    title: string;
    breakPoint?: number;
    iconClass: string;
    contextVariable: string;
    contextCondition?: string; 
    adaptiveOnly?: boolean;
    isAdaptive: boolean;
    onClick?: () => any;
    onChange?: () => any;
}

let userApp: ApplicationItem<Application$kedo$staff$Data,Application$kedo$staff$Params>|undefined = undefined;
let currentUser: any = undefined;
const host = window.location.host;
let isPopupShown: boolean = false;
const breakPoint = 930


const toggleInfoPopup = () => {
    isPopupShown = !isPopupShown;
    const popup = document.querySelector(".user-info-popup");
    popup.classList.toggle("user-info-popup--active")
}

const menuObject: MenuItem[] = [
    {
        title: "Главная",
        iconClass: "icon-main",
        contextVariable: "menu_main_active",
        isAdaptive: false,
    },
    {
        title: "Мои документы",
        iconClass: "icon-documents",
        contextVariable: "menu_documents_active",
        isAdaptive: false,
    },
    {
        title: "Сервисы",
        iconClass: "icon-services",
        contextVariable: "menu_services_active",
        isAdaptive: false,
    },
    {
        title: "Отпуска",
        iconClass: "icon-vacations",
        contextVariable: "menu_vacation_active",
        contextCondition: "is_vacations_active",
        isAdaptive: false,
    },
    {
        title: "Командировки",
        iconClass: "icon-business-trips",
        contextVariable: "menu_trips_active",
        contextCondition: "is_trips_active",
        isAdaptive: false,
    },
    {
        title: "График отсутствий",
        iconClass: "icon-monitor",
        contextVariable: "menu_absence_monitor_active",
        isAdaptive: false    
    },
    {
        title: "Мой профиль",
        iconClass: "icon-profile",
        contextVariable: "menu_my_profile_active",
        isAdaptive: false    
    },
    {
        title: "Главная",
        iconClass: "icon-main",
        contextVariable: "menu_main_active",
        isAdaptive: true,
    },
    {
        title: "Документы",
        iconClass: "icon-documents",
        contextVariable: "menu_documents_active",
        isAdaptive: true,
    },
    {
        title: "Сервисы",
        iconClass: "icon-services",
        contextVariable: "menu_services_active",
        isAdaptive: true,
    },
    {
        title: "Еще",
        iconClass: "icon-more",
        contextVariable: "menu_more_active",
        adaptiveOnly: true,
        onClick: toggleInfoPopup,
        isAdaptive: true,
    },

];

let root: any
let menuItemTemplate: any

async function init(): Promise<void> {
    window.setTimeout(async() => {
        await initMenu();
    }, 200)
}

async function initMenu(): Promise<void> {
    if (!Context.data.parameters_set) {
        await Server.rpc.getNamespaceParams()
    }
    root = document.querySelector(".kedo-menu__list");
    menuItemTemplate = document.querySelector(".kedo-menu__list-item-template");
    root.innerHTML = ""
    for (let i = 0; i < menuObject.length; i++) {
        const isAdaptive = menuObject[i].isAdaptive

        if (!!menuObject[i].contextCondition) {            
            const condition = Context.data[menuObject[i].contextCondition!]
            if (!condition) continue;
        }


        const element = menuItemTemplate.content.cloneNode(true);

        //title
        const title = element.querySelector(".kedo-menu__list-item-text");
        title.innerText = menuObject[i].title;

        //icon 
        const icon = element.querySelector(".kedo-menu__list-item-icon");
        icon.classList.add(menuObject[i].iconClass)
        
        const container = element.querySelector(".kedo-menu__list-item");
        if (isAdaptive) {
            container.classList.add('adaptive')
        }

        //status
        if (!Context.data[menuObject[i].contextVariable]) {
            container?.classList.add("kedo-menu__list-item--active")
        }

        container.addEventListener("click", (e: any) => {
            if (!Context.data[menuObject[i].contextVariable]) {
                return;
            };
                
            if (isPopupShown) {
                toggleInfoPopup();
            } else if (!!menuObject[i].onClick){
                //@ts-ignore
                menuObject[i]!.onClick()
            }
            changeActiveItem(menuObject[i].contextVariable)
        })

        root.append(element);
    }   

    //footer 
    const footerElement = document.querySelector(".kedo-menu__footer");
    footerElement.innerText = menuFooterText;

    if(!currentUser){
        try{
            await findUserAppByExternalUser();
        }
        catch(err){
            console.error(err);
            return;
        }
    }

    if (!Context.data.is_user_data_rendered && currentUser) {
        let userFirstName: string = '';
        let userLastName: string = '';
        let userFirm: string = '';
        await Server.rpc.getUserEntity()

        const popup = document.querySelector('.user-page__info-popup.user-info-popup');
        const nameEl = popup.querySelector('.user-info-popup__user-name');
        const companyNameEl = popup.querySelector('.user-info-popup__user-company-name');
        const avatar = popup.querySelector(".user-info-popup__avatar div");

        if(currentUser.data.fullname){
            userFirstName = !currentUser.data.fullname!.firstname ? 'No firstname' : currentUser.data.fullname!.firstname;
            userLastName = !currentUser.data.fullname!.lastname ? 'No lastname' : currentUser.data.fullname!.lastname;
        }
        if(Context.data.entity){
            userFirm = Context.data.entity;
        }

        avatar.innerText = userFirstName ? userFirstName[0] : ''
        nameEl.innerText = userFirstName + ' ' + userLastName;
        companyNameEl.innerText = userFirm;


        Context.data.is_user_data_rendered = true;
    }

    if(userApp) {
        if(userApp.data.__status!.name !== userApp.fields.__status.variants.signed_documents.name){
            window.location = `https://${host}/_portal/kedo_ext/_start_page`;
            return;
        }

        const popup = document.querySelector(".user-info-popup");
        if (!Context.data.is_vacations_active) {
            const  vacationsContainer = document.querySelector(".user-info-popup__vacations");
            vacationsContainer?.remove();
        } else if(!Context.data.vacation_button_active) {
            const vacationsBtn = document.querySelector('.user-info-popup__nav_item--vacations')
            vacationsBtn.addEventListener('click', () => {
                toggleInfoPopup();
                changeActiveItem("menu_vacation_active")
            })
            Context.data.vacation_button_active = true
        }

        if (!Context.data.my_profile_button_active) {
            let profileButton = document.querySelector(".user-info-popup__nav_item--profile");
            if (profileButton) {
                profileButton.addEventListener("click", () => {
                    toggleInfoPopup();
                    changeActiveItem("menu_my_profile_active")
                });
            };
            Context.data.my_profile_button_active = true;
        }

        // Context.data.my_profile_choose = true;

        if (!Context.data.is_trips_active) {
            const  tripsContainer = document.querySelector(".user-info-popup__trips");
            tripsContainer?.remove();
        } else if (!Context.data.trips_button_active) {
            const tripsBtn = document.querySelector('.user-info-popup__nav_item--trips')
            tripsBtn.addEventListener('click', () => {
                toggleInfoPopup();
                changeActiveItem("menu_trips_active")
            })
            Context.data.trips_button_active = true
        }
        const exitBtn = document.querySelector(".user-info-popup__nav_item--exit");
        exitBtn.addEventListener("click", async () => {
            let currentExternalUser: CurrentUserItem|undefined = undefined;

            try{
                currentExternalUser = await System.users.getCurrentUser();
            }
            catch(err){
                throw new Error(`System.users.getCurrentUser() error ${err}`);
            }
            
            if(currentExternalUser){
                currentExternalUser.logout();
            }
        })

    }    
    
    updateContextValues()
}

async function changeActiveItem (contextVariable: string) {
    for (let i = 0; i < menuObject.length; i++) {
        Context.data[menuObject[i].contextVariable] = true;
    }
    Context.data[contextVariable] = false;
    await initMenu();
}

const updateContextValues = () => {
    for (let i = 0; i < menuObject.length; i++) {
        if (!Context.data[menuObject[i].contextVariable]) {
            switch(menuObject[i].contextVariable) {
                case "menu_main_active":
                    Context.data.hide_my_services = false;
                    Context.data.show_service_cards = false;
                    Context.data.hide_my_documents = false;
                    Context.data.show_search_in_my_documents = false;
                    Context.data.hide_right_column = !Context.data.is_trips_active && !Context.data.is_vacations_active;
                    Context.data.my_profile_choose = false;
                    Context.data.show_absence_monitor = false;
                    break;
                case "menu_documents_active":
                    Context.data.hide_my_services = true;
                    Context.data.hide_my_documents = false;
                    Context.data.show_search_in_my_documents = true;
                    Context.data.hide_right_column = true;
                    Context.data.my_profile_choose = false;
                    Context.data.show_absence_monitor = false;
                    break;
                case "menu_services_active":
                    Context.data.hide_my_services = false;
                    Context.data.show_service_cards = true;
                    Context.data.hide_my_documents = true;
                    Context.data.hide_right_column = true;
                    Context.data.my_profile_choose = false;
                    Context.data.show_absence_monitor = false;
                    break;
                case "menu_vacation_active":
                    Context.data.hide_my_services = true;
                    Context.data.hide_my_documents = true;
                    Context.data.hide_right_column = true;
                    Context.data.my_profile_choose = false;
                    Context.data.show_absence_monitor = false;
                    break;
                case "menu_trips_active":
                    Context.data.hide_my_services = true;
                    Context.data.hide_my_documents = true;
                    Context.data.hide_right_column = true;
                    Context.data.my_profile_choose = false;
                    Context.data.show_absence_monitor = false;
                    break;
                case "menu_absence_monitor_active":
                    Context.data.hide_my_services = true;
                    Context.data.hide_my_documents = true;
                    Context.data.hide_right_column = true;
                    Context.data.my_profile_choose = false;
                    Context.data.show_absence_monitor = true;
                    break;
                case "menu_my_profile_active":
                    Context.data.hide_my_services = true;
                    Context.data.hide_my_documents = true;
                    Context.data.hide_right_column = true;
                    Context.data.my_profile_choose = true;
                    Context.data.show_absence_monitor = false;
                    break;
            }
            break;
        }
    }
}


async function findUserAppByExternalUser(): Promise<void> {
    async function findInnerUserApp(){
        if(!currentUser) return;
        
        userApp = await Context.fields.user_application.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                g.or(
                    f.ext_user.eq(currentUser),
                    f.external_user.has(currentUser)
                )
            ))
            .first()
        if (!userApp) {
            const extUserId = currentUser.originalData.profiles[0].id;
            console.log('before: ', currentUser.id)
            userApp = await Context.fields.user_application.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.external_user.has(extUserId)
            ))
            .first()
            currentUser = await System.users.search().where(f => f.__id.eq(extUserId)).first()
            console.log(userApp)
        }
        if(!userApp) return;

        Context.data.user_application = userApp;
    }

    currentUser = await System.users.getCurrentUser();
    Context.data.current_user = currentUser

    await findInnerUserApp();
    // if(!currentUser){
    //     return;
    // }

    // if(currentUser){
    //     Context.data.current_user = currentUser;
    // } else {
    //     return
    // }        

    // if(!currentUser.originalData){
    //     return
    // }
    // if(!currentUser.originalData.profiles){
    //     await findInnerUserApp();
    //     return
    // }
    // if(!currentUser.originalData.profiles[0]){
    //     await findInnerUserApp();
    //     return
    // }
    // if(currentUser.originalData.profiles[0].id){
    //     externalUserApp = currentUser.originalData.profiles[0];
    // } else {
    //     await findInnerUserApp();
    //     return;
    // }
    
    // if(externalUserApp){
    //     await findExternalUserApp();
    // } else {
    //     return;
    // }
}