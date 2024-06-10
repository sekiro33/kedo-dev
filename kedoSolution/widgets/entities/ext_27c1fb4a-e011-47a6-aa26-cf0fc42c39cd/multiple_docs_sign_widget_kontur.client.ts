declare const console: any, document: any, window: any;

let spinnerTemplate: any;
let codeInput: any;

async function onInit(): Promise<void> {
    const waitForSpinner = window.setInterval(() => {
        spinnerTemplate = document.querySelector("template.my-spinner");
        
        if (!spinnerTemplate) {
            return;
        };
        window.clearInterval(waitForSpinner);
    }, 200)
    await Server.rpc.getCertificates();
};

async function setIssueId(): Promise<void> {
    if (!Context.data.certs_choice) {
        Context.data.certificate_chosen = false;
        return;
    };
    Context.data.issue_id = Context.data.certs_choice.code;
    Context.data.certificate_chosen = true;
    // Context.data.draft_created 
};

async function getCodeWrapper(): Promise<void> {
    if (!Context.data.docs_array) {
        Context.data.error = "Не переданы документы для подписания";
        Context.data.error_exists = true;
        return;
    };
    const findInput = window.setInterval(() => {
        codeInput = document.querySelector(".code-input input");
        if (!codeInput) {
            return;
        };
        window.clearInterval(findInput);
        codeInput.focus();
    }, 300);
    const location = ".get-code-button"
    toggleLoader(location);
    await Server.rpc.createFile()
    toggleLoader(location);
};

async function sendCodeWrapper(): Promise<void> {
    const location = ".send-code-button"
    toggleLoader(location);
    await Server.rpc.sendCode();
    window.setTimeout(async () => {
        await Server.rpc.closeDraft();
        console.log(Context.data.debug)
        toggleLoader(location);
    }, 2000);
};

function toggleLoader(location: string) {
    let loader = document.querySelector(`${location} .spinner-svg`);

    if (!loader) {
        loader = spinnerTemplate.content.cloneNode(true);
        document.querySelector(location).append(loader);
        return;
    };

    document.querySelector(`${location} .spinner-svg`).remove();
};