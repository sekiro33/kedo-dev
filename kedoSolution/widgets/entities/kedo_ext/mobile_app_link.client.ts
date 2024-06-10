import QRious from "qrious.js";

declare const console: any;
declare const document: any;
declare const window: any;

async function onInit(): Promise<void> {
    const appLink = await Namespace.portal.generateELMAAppUrl(true);
    
    if (appLink) {
        let findQrCodeContainer = window.setInterval(() => {
            const qrImg = document.querySelector(".qr-code-img");
            if (!qrImg) {
                console.log("no image");
                return;
            };
            window.clearInterval(findQrCodeContainer);
            const qr = new QRious({
                value: appLink,
                size: 300
            });
            const dataUrl64 = qr.toDataURL();
            qrImg.src = dataUrl64;
        }, 500)
    };
};