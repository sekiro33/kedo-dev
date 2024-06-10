declare const console: any;
declare const window: any;
declare const document: any;

const url = window.location.href;

async function onInit(): Promise<void> {
    if (!url.includes("portal")) {
        return;
    };
    let saveButton: any;
    let waitForButton = window.setInterval(() => {
        saveButton = document.querySelector('footer.modal-footer button.btn.btn-primary')
        if (!saveButton) {
            return;
        };
        window.clearInterval(waitForButton)

        saveButton.classList.add('save-button');

        // let buttonContainer = document.createElement("div");
        saveButton.addEventListener("mouseenter", handleTouch);
        saveButton.addEventListener("touchstart", handleTouch);
        // buttonContainer.className = "save-button-container";
        // buttonContainer.classList.add("visible");
        // saveButton.parentNode.append(buttonContainer);
        // saveButton.parentNode.style.position = 'relative';
        // buttonContainer.before(saveButton);

    }, 100)
};

function handleTouch(event: any) {
    if (document.querySelector(".notification-container")) {
        document.querySelector(".notification-container").classList.add("visible");
        window.setTimeout(() => {
            try {
                document.querySelector(".notification-container").classList.remove("visible");
            } catch {
                console.log("window already hidden")
            }
        }, 3000);
        return;
    };

    let notification = document.querySelector(".notification-template").content.cloneNode(true);
    let notificationContainer = notification.querySelector(".notification-container");
    if (Context.data.element_name) {
        let elementName = notificationContainer.querySelector(".element-name");
        elementName.textContent = Context.data.element_name;
    };
    if (Context.data.alert_text) {
        let notificationText = notificationContainer.querySelector(".notification-text");
        notificationText.textContent = Context.data.alert_text;
    };
    event.target.parentNode.append(notification);
    notificationContainer.classList.add("visible");
    // buttonContainer.parentNode.append(saveButton);
    // buttonContainer.remove();
    event.target.disabled = true;
    window.setTimeout(() => {
        event.target.disabled = false;
    }, 500)
    window.setTimeout(() => {
        try {
            notificationContainer.classList.remove("visible");
        } catch {
            console.log("element already removed")
        }
    }, 3000);
};