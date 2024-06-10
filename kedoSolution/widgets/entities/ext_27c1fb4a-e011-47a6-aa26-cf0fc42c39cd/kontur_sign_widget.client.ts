declare const console: any;
declare const window: any;
declare const document: any;

async function canRender(): Promise<boolean> {
    return Context.data.provider === "ext_27c1fb4a-e011-47a6-aa26-cf0fc42c39cd@kontur_sign_widget"
}

async function onInit(): Promise<void> {
    await Server.rpc.getCerts();
    
    let certs = Context.data.certs_json ? JSON.parse(Context.data.certs_json!) : [];
    if (!certs || certs.length < 1) {
        // const providerVariants = document.querySelectorAll("elma-popover-menu-option span");
        // for (let provider of providerVariants) {
        //     if (provider.textContent.includes("УЦ Контур")) {
        //         provider.parentElement.remove();
        //         break;
        //     };
        // };
        Context.data.__hidden = true;
        return;
    };

    for (let cert of certs) {
        Context.fields.certificates.data.variants.push({name: cert.name, code: cert.code});
    };
    if (Context.fields.certificates.data.variants.length === 1) {
        //@ts-ignore
        Context.data.certificates = {name: Context.fields.certificates.data.variants[0].name, code: Context.fields.certificates.data.variants[0].code};
        await assignCertificate();
    };
};

function showLoader(location: string) {
    let loader = document.querySelector(".my-spinner").content.cloneNode(true);
    let triggerElement = document.querySelector(location);
    triggerElement.append(loader);
};

function hideLoader(location: string) {
    let loader = document.querySelector(`${location} .spinner-svg`)
    loader.remove();
};

async function assignCertificate(): Promise<void> {
    if (!!Context.data.certificates) {
        Context.data.certificate_assigned = true;
    } else {
        Context.data.certificate_assigned = false;
    };
};

async function createFileWrapper(): Promise<void> {
    showLoader(".send-code");
    Context.data.sign_error = false;
    Context.data.sign_success = false;
    await Server.rpc.createFile();
    console.log("debug: ", Context.data.debug)
    hideLoader(".send-code");
};

async function closeDraftWrapper():Promise<void> {
    showLoader(".create-sign")
    Context.data.sign_error = false;
    Context.data.sign_success = false;
    await Server.rpc.sendCode();
    if (!Context.data.sign_error) {
        window.setTimeout(await Server.rpc.closeDraft(), 5000);
    };
    hideLoader('.create-sign');
};

function onlyUnique(value: any, index: any, array: any) {
    return array.indexOf(value) === index;
};