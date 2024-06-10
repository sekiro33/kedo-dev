/* Client scripts module */
declare const console: any;
declare const document: any;
declare const window: any;

async function onInit(){
    function sendErrorHandler(){        
        const closeBtn = document.querySelector('button.close.btn.btn-link.btn-style-icon.elma-icons');
        closeBtn.click();

        // удаление слушателей оставить в конце слушателей
        sendBtn.removeEventListener("click", sendErrorHandler);
    }

    function findSendBtn(){
        if(sendBtn) return;

        sendBtn = document.querySelector('body > div.popover-outer.visible > div > div > elma-form > form > elma-popover-footer > elma-buttons > div > div > div.fluid-nav-scope > div:nth-child(1) > button');

        if(!sendBtn) return;
            
        sendBtn.addEventListener("click", sendErrorHandler);
    }

    let sendBtn:any;
    window.setInterval(findSendBtn, 500)
}