declare const document: any;
declare const console: any;
declare const window: any;

async function canRender(): Promise<boolean> {
    return Context.data.provider === "ext_27c1fb4a-e011-47a6-aa26-cf0fc42c39cd@sign_me_sign_widget";
};

async function onInit(): Promise<void> {
    console.log("custom signme");
    Context.data.elma_address = window.location.host;

    await Server.rpc.getCertificates();

    let certs = Context.data.certificates_json ? JSON.parse(Context.data.certificates_json) : [];
    if (!certs || certs.length < 1) {
        return;
    };

    for (let cert of certs) {
        Context.fields.certs.data.variants.push({name: cert.name, code: cert.code});
    };
    const user = await System.users.getCurrentUser();
    console.log(user)
    if (Context.fields.certs.data.variants.length === 1) {
        //@ts-ignore
        Context.data.certs = {name: Context.fields.certs.data.variants[0].name, code: Context.fields.certs.data.variants[0].code};
        await assignCertificate();
    };
};

async function assignCertificate(): Promise<void> {
    console.log(Context.data.certs)
    if (!!Context.data.certs) {
        Context.data.certificate_choosed = true;
        let findPassField = window.setInterval(() => {
            let passField = document.querySelector(".signme-password-field input");
            if (!passField) {
                return;
            };
            window.clearInterval(findPassField);
            passField.type = "password";
        }, 200);
    } else {
        Context.data.certificate_choosed = false;
    };
};

async function signFileWrapper(): Promise<void> {
    Context.data.error_exists = false;
    if (!Context.data.password) {
        Context.data.error = "Вы не ввели пароль";
        Context.data.error_exists = true;
        return;
    };
    handleLoader();
    await Server.rpc.createSign();
    console.log(Context.data.debug)
    handleLoader();
};

function handleLoader() {
    const loader = document.querySelector(".spinner-svg");
    if (!loader) {
        const loaderTemplate = document.querySelector(".my-spinner").content.cloneNode(true);
        const signButton = document.querySelector(".signme-button");
        signButton.append(loaderTemplate);
    } else {
        loader.remove();
    };
};