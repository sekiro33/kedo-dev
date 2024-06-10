declare const document: any;
declare const window: any;
declare const console: any;

let saveButton: any;

async function onInit(): Promise<void> {
    const fullName = `${Context.data.surname} ${Context.data.name} ${Context.data.lastname || ""}`;
    const region = Context.data.region || "";
    let fullAddress = Context.data.country;
    if (region) {
        fullAddress += `, ${region}`;
    };
    const user = await Context.data.user!.fetch();
    
    const staff = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(user)
    )).first();
    fullAddress += `, ${Context.data.city!}`;
    if (staff) {
        fullAddress += `, ${staff.data.street}, ${staff.data.home}`;
        if (staff.data.housing) {
            fullAddress += `, к ${staff.data.housing}`;
        };
        if (staff.data.apartment) {
            fullAddress += `, кв ${staff.data.apartment}`;
        };
    };
    ViewContext.data.passport_info = `${Context.data.passport_series} ${Context.data.passport_number}`;
    ViewContext.data.address = fullAddress;
    ViewContext.data.full_name = fullName;
};

function handleSpinner(buttonClass: string) {
    let spinnerTemplate = document.querySelector(".my-spinner").content.cloneNode(true);
    let button = document.querySelector(buttonClass);
    let innerSvg = button.querySelector("svg")
    if (!!innerSvg) {
        innerSvg.remove();
    } else {
        button.append(spinnerTemplate);
    };
};

async function sendCodeWrapper(): Promise<void> {
    handleSpinner(".send-code");
    await Server.rpc.getSecretCode();
    handleSpinner(".send-code");
};

async function confirmCodeWrapper(): Promise<void> {
    handleSpinner(".confirm-code");
    await Server.rpc.confirmSecret();
    console.log(Context.data.debug)
    handleSpinner(".confirm-code");
    if (ViewContext.data.request_confirmed) {
        console.log("requestConfirmed: ", ViewContext.data.request_confirmed)
        const buttons = document.querySelectorAll("footer elma-buttons button");
        if (buttons && buttons.length > 0) {
            saveButton = document.querySelector("footer elma-buttons .btn-primary");
            saveButton.style.backgroundColor = "#1e6599";
            saveButton.style.pointerEvents = "default";
            const confirmButton = buttons[0];
            confirmButton.click();
        };
    };
    console.log(ViewContext.data.error)
};