declare const document: any, console: any, window: any;

const hiddenItems = [
    "не определён",
    "дать выбор"
];

async function onInit(): Promise<void> {
    const staff = await Context.data.staff!.fetch();

    if (staff.data.goskey_sign_approved) {
        ViewContext.data.first_goskey_sign = false;
    } else {
        ViewContext.data.first_goskey_sign = true;
    };
    
    // if (Context.data.goskey_docs && Context.data.goskey_docs.length < 2) {
    //     const doc = await Context.data.goskey_docs[0].fetch();
    //     ViewContext.data.doc_for_preview = doc.data.__file;
    //     ViewContext.data.one_doc_for_sign = true;
    // };

    await Server.rpc.getFileLink();
};

async function onLoad(): Promise<void> {
    if (!Context.data.leave_choice_to_staff) {
        window.setTimeout(() => {
            const modals = document.querySelectorAll("elma-complex-popup")
            console.log({modals})
            
            const buttons = document.querySelectorAll("elma-complex-popup footer .btn-group .fluid-nav-item");
            console.log(buttons)
            

            buttons.forEach((button: any) => {
                const innerNode = button.querySelector("button");
                console.log(innerNode)
                
                if (innerNode.textContent.toLowerCase().includes("elma")) {
                    button.remove();
                };
            });
        }, 500)
    };
};