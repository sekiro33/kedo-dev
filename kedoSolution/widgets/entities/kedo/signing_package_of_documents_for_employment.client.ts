//7.07 anchor (new entitySign model)
declare const console: any;
declare const window: any;
declare const document: any;

// let userFilesIdArr: any[] = [];
let filesArr: any[] = [];
let origin = window.location.origin;
let href = window.location.href;
let currentUser: any;
let numberOfDocs: number;
let numberOfSignedDocs = 0;

let loaderEl: any;

async function renderFiles(){    
    if (href.includes("portal")) {
        origin += "/_portal/kedo_ext/_start_page";
    };
    const fileLinkTempl = document.querySelector('.kedo__step3-content-files-list-item-template');
    const filesWrapper = document.querySelector('.kedo__step3-content-files-list');
    let laborContractSigned: boolean = false;
    currentUser = await System.users.getCurrentUser();

    loaderEl = document.querySelector('.kedo-loader-wrapper_docs');
    
    function handleButtonsBlock() {
        let buttons: any
        let links: any;
        let laborContractButton: any
        let findButtonsAndLinks = window.setInterval(() => {
            laborContractButton = document.querySelector(".kedo__step3-content-files-list-item-btn:not(disabled)");
            buttons = document.querySelectorAll(".kedo__step3-content-files-list-item-btn.disabled");
            links = document.querySelectorAll(".kedo__step3-content-files-list-item-link.disabled");
            if (!laborContractButton || buttons.length != numberOfDocs - 1) {
                return;
            };
            laborContractButton.classList.remove("btn-glow");
            buttons.forEach((button: any) => button.classList.remove("disabled"));
            links.forEach((link: any) => link.classList.remove("disabled"));
            window.clearInterval(findButtonsAndLinks);
        }, 400)
    };

    async function renderStep3String(fileApp: any, isSigned: boolean){
        let itemRef: any;
        try {
            itemRef = fileApp.data.__sourceRef ? await fileApp.data.__sourceRef.fetch() : fileApp;
        } catch(err) {
            console.error(err)
        }
        const docIsLaborContract = laborContractExists && itemRef.code == "labor_contract";
        const onCheckSignStatus = () => {
            let checkInterval:any;
            let isSigned = false;
            let step = 0;
            checkInterval = window.setInterval(async () => {
                let signHistory: any;
                try {
                    itemRef = fileApp.data.__sourceRef ? await fileApp.data.__sourceRef.fetch() : fileApp;
                    signHistory = await itemRef.getSignHistory();
                } catch(err) {
                    console.log(err)
                }
                if (signHistory) {
                    const fileSign = signHistory.filter((sign: any) => {
                            return sign.type === "file"
                    })
                    if (fileSign) {
                        let dataSigns = await fileApp.getDataSigns()
                        let sign = dataSigns.find((s: any) => s.type === "file");
                        let hash = sign.hash;
                        for (let i = 0; i < fileSign.length; i++) {
                            const signCheck = fileSign[i].signs.find((digitalSign: any) => 
                                (digitalSign.data.__userID === currentUser.data.__id || digitalSign.__userID === currentUser.data.__id)
                                && (!!digitalSign.data.sign || !!digitalSign.sign)
                                && (digitalSign.data.hash === hash || digitalSign.content === hash)
                            );
                            if (signCheck) {
                                console.log("signed")
                                isSigned = true;
                                break;
                            }
                        }
                    } else {
                        isSigned = false;
                    }
                }

                if(isSigned && step === 0) {
                    window.clearInterval(checkInterval);
                    return;
                }

                if (isSigned) {
                    window.clearInterval(checkInterval);
                    numberOfSignedDocs++;
                    const modalList = document.querySelectorAll(".complex-popup-outer:not([hidden])")
                    let currentModal = modalList.item(1)
                    if (!currentModal) {
                        currentModal = modalList.item(0);
                    };
                    let findCloseButton = window.setInterval(() => {
                        let  closeButton = currentModal.querySelector(".modal-header__controls .close.btn") || currentModal.querySelector("header button span")
                        if (!closeButton) {
                            return;
                        }
                        console.log(closeButton)
                        closeButton.click();
                        window.clearInterval(findCloseButton)
                    }, 500)
                    // if (!!closeButton) {

                    // }
                    // const btn = document.querySelector(`[data-guid='${fileId}']`);

                    btn.textContent = 'Подписано';
                    btn.disabled = true;
                    btn.classList.add("kedo__step3-content-files-list-item-btn--disabled");
                    
                    if (docIsLaborContract) {
                        laborContractSigned = true;
                        handleButtonsBlock();
                    };

                    if (numberOfSignedDocs === numberOfDocs) {
                        Context.data.all_docs_signed = true;
                        Context.data.validation_string = "true"
                    }
                }

                step++;
            }, 1000)
        }

        const fileLink = fileLinkTempl.content.cloneNode(true);
        let fileName = 'Файл';

        let fileCode: string = '';
        let fileNamespace: string = '';
        let fileId: string = '';
        
        if(itemRef){
            fileCode = itemRef.code;
            fileNamespace = itemRef.namespace;
            fileId = itemRef.id;
        }
       
        if (itemRef){
            fileName = fileApp.data.__name;
        }

        const img = fileLink.querySelector('.kedo__step3-content-files-list-item-img');
        const link = fileLink.querySelector('.kedo__step3-content-files-list-item-link');
        const btn = fileLink.querySelector('.kedo__step3-content-files-list-item-btn');

        btn.addEventListener("click", () => {
            const loadInterval = window.setInterval(() => {
                const modalList = document.querySelectorAll(".complex-popup-outer:not([hidden])")
                let currentModal = modalList.item(1)
                if (!currentModal) {
                    currentModal = modalList.item(0);
                };
                const signButton = currentModal.querySelector(".btn-group app-sign-app .btn.btn-link")
                if (!signButton) {
                    return;
                }
                window.clearInterval(loadInterval)
                // const button = currentModal.querySelector('.btn.btn-link')
                signButton.click();
            }, 1000)
            onCheckSignStatus();
        })

        // fileType
        let fileItem: any = undefined;

        try{
            fileItem = await itemRef.data.__file.fetch();
        }
        catch(err){
            console.error(`itemRef.data.__file.fetch error: ${err}`);
        }

        let fileTypeText: string = ''; 
        if(fileItem){
            const fileItemArr = fileItem.data.__name.split('.');
            if (fileItemArr.length > 1){
                fileTypeText = fileItemArr[fileItemArr.length - 1];
            }
        }

        img.classList.add('doc-img_pdf');


        link.textContent = fileName;
        if(fileNamespace && fileCode && fileId){
            link.href = `./(p:item/${fileNamespace}/${fileCode}/${fileId})`;
        }
        if (!docIsLaborContract && laborContractExists) {
            btn.disabled = true;
            btn.classList.add("disabled");
            link.classList.add("disabled")
        };

        if (docIsLaborContract && !isSigned) {
            btn.disabled = false;
            btn.classList.remove("disabled");
            link.classList.remove("disabled")
            btn.classList.add("btn-glow");
        } else if (docIsLaborContract && isSigned) {
            laborContractSigned = true;
            handleButtonsBlock();
        };
        if(isSigned) {
            btn.textContent = 'Подписано';
            btn.disabled = true;
            btn.classList.add("kedo__step3-content-files-list-item-btn--disabled");
        } else {
            btn.textContent = 'Подписать';
            btn.href = `./(p:item/${fileNamespace}/${fileCode}/${fileId})`;
        }

        filesWrapper.append(fileLink);
    }

    showLoader();

    if (Context.data.docs_for_sign && Context.data.docs_for_sign.length > 0) {
        filesArr = await Promise.all(Context.data.docs_for_sign.map(doc => doc.fetch()));
        if (filesArr.some(doc => doc.code === "labor_contract")) {
            console.log("labor contract exists")
            const laborContract = filesArr.find(doc => doc.code === "labor_contract");
            filesArr = filesArr.filter(doc => doc.code != "labor_contract");
            filesArr.unshift(laborContract)
        }
    } else {
        try {
            await Namespace.app.documents_for_employment.search()
                .where(item => item.staff.link(Context.data.staff!))
                .size(100)
                .all()
                .then((items) => {
                    if(items){
                        filesArr.push(...items)
                    }
                })
                .catch(err => {
                    console.error(`fileApp = items.find error: ${err}`);
                })
        } catch (e) {
            console.error(`fileApp = items.find error: ${e}`);
            return;
        }
        filesArr = filesArr ? filesArr.filter((file:any) => {
            return file.data.__sourceRef.code !== 'order_for_transfer'
                && file.data.__sourceRef.code !== 'transfer_application'
                && file.data.__sourceRef.code !== 'letter_of_resignation'
                && file.data.__sourceRef.code !== 'dismissal_order'
                && file.data.__sourceRef.code !== 'job_application'
                && file.data.__sourceRef.code !== 'information_about_labor_activity'
                && file.data.__sourceRef.code !== 'electronic_interaction_agreement'
        }) : []

        
        filesArr = filesArr.sort((item1, item2) => {
            if(item2.data.__createdAt.after(item1.data.__createdAt)){
                return -1;
            } else {
                return 1
            }
        })
    }
    let laborContractExists: boolean = false;
    for (let file of filesArr) {
        let fileRef = file.data.__sourceRef ? await file.data.__sourceRef.fetch() : file; 
        laborContractExists = fileRef.code === "labor_contract"
        if (laborContractExists) {
            break;
        };
    };

    if(filesArr && filesArr.length > 0){
        numberOfDocs = filesArr.length;
        for(let i = 0; i < filesArr.length; i++){
            const fileApp = filesArr[i];
            let isSigned = false;
            
            if (fileApp) {
                try {
                    let itemRef = fileApp.data.__sourceRef ? await fileApp.data.__sourceRef : fileApp;
                    const signHistory = await itemRef.getSignHistory();
                    if (signHistory) {
                        let dataSigns = await fileApp.getDataSigns()
                        let sign = dataSigns.find((s: any) => s.type === "file");
                        let hash = sign.hash;
                        const fileSign = signHistory.filter((sign: any) => {
                            return sign.type === "file"
                        });
                        if (!!fileSign) {
                            for (let i = 0; i < fileSign.length; i++) {
                                const signCheck = fileSign[i].signs.find((digitalSign: any) => 
                                    (digitalSign.data.__userID === currentUser.data.__id || digitalSign.__userID === currentUser.data.__id)
                                    && (digitalSign.data.sign || digitalSign.sign)
                                    && (digitalSign.data.hash === hash || digitalSign.content === hash)
                                );
                                if (!!signCheck) {
                                    isSigned = true;
                                    numberOfSignedDocs++;
                                    break;
                                }
                            }
                        } else {
                            isSigned = false;
                        }
                    }
                } catch (e) {
                    isSigned = false
                }
            }
            await renderStep3String(fileApp, isSigned);
        }
        if (numberOfSignedDocs === numberOfDocs) {
            Context.data.all_docs_signed = true;
            Context.data.validation_string = "true"
        }
    } else {
        filesWrapper.textContent = 'Файлы отсутствуют'
    }
    
    hideLoader();
    Context.data.all_documents_loaded = true;
};


function showLoader(){
    loaderEl.classList.add('kedo-loader-wrapper_active')
}
function hideLoader(){
    loaderEl.classList.remove('kedo-loader-wrapper_active')
}

