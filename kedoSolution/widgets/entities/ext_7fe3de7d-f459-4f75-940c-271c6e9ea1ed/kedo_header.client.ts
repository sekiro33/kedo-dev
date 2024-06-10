declare const console: any;
declare const window: any;
declare const document: any;

async function renderHeader(): Promise<void>{
    // console.log('+++ renderHeader')
    try{
        await Server.rpc.getHeaderData();
    }
    catch(err){
        console.error(`Server.rpc.getHeaderData error ${err}`)
    }

    // console.log(Context.data.entity)
    // console.log(Context.data.logo_from_params)
    getLogo();
    setUserData();
    let headerText: any;
    let appQrModal: any;
    let qrContainer: any;
    let contextMenu: any;
    let qrTrigger: any
    let waitForHeader = window.setInterval(() => {
        headerText = document.querySelector(".kedo__header-user-info-text-wrapper");
        if (!headerText) {
            return;
        };
        window.clearInterval(waitForHeader);
        headerText.addEventListener("click", (e: any) => {
            handleQrAppWindow(e);
        });
        contextMenu = document.querySelector(".app-qr-container");
        appQrModal = document.querySelector(".app-qr-modal");
        appQrModal.addEventListener("click", () => {
            console.log("click");
            [contextMenu, headerText].forEach((node: any) => node.classList.remove("opened"));
            appQrModal.classList.toggle("hidden");
        });
        qrContainer = document.querySelector(".app-qr-info-container");
        qrContainer.addEventListener("click", (e: any) => {
            if (!e.target.classList.contains("app-qr-info-container")) {
                console.log("safe zone");
                return;
            }
            contextMenu.classList.toggle("blurred");
            qrContainer.classList.toggle("hidden");
        });
        let findTrigger = window.setInterval(() => {
            qrTrigger = document.querySelector(".qr-app-trigger");
            if (!qrTrigger) {
                return;
            };
            window.clearInterval(findTrigger)
            qrTrigger.addEventListener("click", (e: any) => handleQrWindow(e));
        }, 500)
    });

    // обработчик разлогинивания =====================================================
    const btnExit = document.querySelector('.kedo__header-btn-exit');

    async function handleBtnExitClick(){
        let currentExternalUser: CurrentUserItem|undefined = undefined;

        try{
            currentExternalUser = await System.users.getCurrentUser();
        }
        catch(err){
            throw new Error(`getCurrentUser error ${err}`);
        }
        
        if(currentExternalUser){
            currentExternalUser.logout();
        }
    }
    if (window.screen.availWidth >= 930) {
        btnExit.addEventListener('click', handleBtnExitClick);
    }

    // mobile header =================================================================
    const headerNavBtnsEl = document.querySelector('.kedo__header-btns-wrapper');
    let resizeTimeout: number|null;
    let isHandlerWindowClickInit = false;

    function handleQrWindow(e: any) {
        const qrInfoContainer = document.querySelector(".app-qr-info-container");
        contextMenu.classList.toggle("blurred");
        qrInfoContainer.classList.toggle("hidden");
    };

    function handleWindowClick(e: any){
        if(!e.target.closest('.kedo__header-nav')){
            headerNavBtnsEl.classList.remove('kedo__header-btns-wrapper_visible')
        }
        if(e.target.closest('.kedo__header-user-info-wrapper') || e.target.closest('.kedo__header-nav-arrow')){
            headerNavBtnsEl.classList.toggle('kedo__header-btns-wrapper_visible');
        }
    }
    
    function handleQrAppWindow(e: any) {
        if (e.target.tagName.toLowerCase() === "button" || e.target.classList.contains("app-qr-container")) {
            return;
        };
        let contextMenu: any;
        let parentElement: any;
        if (e.target == headerText) {
            contextMenu = e.target.querySelector(".app-qr-container");
            parentElement = e.target;
        } else {
            parentElement = e.target.closest(".kedo__header-user-info-text-wrapper");
            contextMenu = parentElement.querySelector(".app-qr-container");
        };
        
        if (contextMenu && parentElement) {
            appQrModal.classList.toggle("hidden");
            [contextMenu, parentElement].forEach((node: any) => node.classList.toggle("opened"));
        };
    };

    function checkWindowWidth(){
        if(window.innerWidth < 767 && !isHandlerWindowClickInit){
            window.addEventListener('click', handleWindowClick);
            isHandlerWindowClickInit = true;
        } else if (window.innerWidth >= 767 && isHandlerWindowClickInit) {
            window.removeEventListener('click', handleWindowClick);
            isHandlerWindowClickInit = false;
        }
    }

    function resizeThrottler() {
        if ( !resizeTimeout ) {
            resizeTimeout = window.setTimeout(function() {
                resizeTimeout = null;
                checkWindowWidth();
            }, 66);
        }
    }
    
    window.addEventListener("resize", resizeThrottler, false);    

    checkWindowWidth();
}

async function getLogo(){
    const logoWrapper = document.querySelector('.kedo__header-logo-wrapper');

    if(Context.data.logo_from_params){
        logoWrapper.insertAdjacentHTML('afterbegin', Context.data.logo_from_params);

        const logoSvg = logoWrapper.firstChild;
        if(logoSvg){
            logoSvg.classList.add('logo');
        }
    } else {
        const logo = document.querySelector('.logo-template').content.cloneNode(true);        
        const svgTag = logo.querySelector('svg');

        if(svgTag){
            svgTag.classList.add('logo');
        }
        
        logoWrapper.append(logo)
    }

    logoWrapper.classList.remove('kedo__header-logo-wrapper_hidden');
}

async function setUserData(){
    if(!Context.data.user_card) return;

    let userFirstName: string = '';
    let userLastName: string = '';
    let userFirm: string = '';

    const userInfoEl = document.querySelector(".kedo__header-nav");
    // const userInfoEl = document.querySelector(".kedo__header-user-info-wrapper");
    const userImgEl = userInfoEl.querySelector('.kedo__header-user-info-img');
    const userNameEl = userInfoEl.querySelector('.kedo__header-user-info-name');
    const userSurnameEl = userInfoEl.querySelector('.kedo__header-user-info-surname');
    const userFirmEl = userInfoEl.querySelector('.kedo__header-user-info-firm');

    const userCard = await Context.data.user_card.fetch();
    if(!userCard) return;

    if(userCard.data.full_name){
        userFirstName = !userCard.data.full_name!.firstname ? 'No firstname' : userCard.data.full_name!.firstname;
        userLastName = !userCard.data.full_name!.lastname ? 'No lastname' : userCard.data.full_name!.lastname;
    }

    if(Context.data.entity){
        userFirm = Context.data.entity;
    }

    userImgEl.textContent = userFirstName[0];
    userNameEl.textContent = userFirstName + ' ';
    userSurnameEl.textContent = userLastName;
    userFirmEl.textContent = userFirm;
    if (window.screen.availWidth < 930) {
        console.log("mobile header")
    } else {
        userInfoEl.classList.remove("kedo__header-nav_hidden");
    }
}
