/* Client scripts module */
declare const console: any;
declare const document: any;
declare const window: any;

async function onInit(): Promise<void> {
    if (window.location.href.includes("_portal")) {
        const waitForEvents = window.setInterval(() => {
            const events = document.querySelector(".kedo-vacation-events");

            if (!events) {
                return;
            };

            window.clearInterval(waitForEvents);
            events.style.display = "none";
        });
    }
}