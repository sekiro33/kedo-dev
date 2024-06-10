import zip from "zip.min.js";
declare const document: any;
declare const window: any;
declare const console: any;

let confirmButton: any;

async function onInit(): Promise<void> {
    let waitForButton = window.setInterval(() => {
        confirmButton = window.confirmButton;
        if (!confirmButton) {
            console.log("no confirm button inner")
            return;
        };
        window.clearInterval(waitForButton);
        window.confirmButton = undefined;
        confirmButton.classList.add("disabled");
    }, 100);
};

async function getFileWithSigns(): Promise<void> {
    let spinnerSvg: any;
    try {
        const signConfirm = document.querySelector(".sign-confirm");
        const loader = document.querySelector(".my-spinner").content.cloneNode(true);
        signConfirm.append(loader)
        spinnerSvg = document.querySelector(".spinner-svg");
        await Server.rpc.getFileWithSigns();
        const fileBase64 = Context.data.file_base64;
        let reader = new zip.Data64URIReader(fileBase64)
        let zipReader = new zip.ZipReader(reader)
        let entries = await zipReader.getEntries();
        // let innerZip = entries.find((f: any) => f.filename.includes("zip"));
        // let innerBlob = new zip.BlobReader(await innerZip.getData(new zip.BlobWriter()))
        // let innerFiles = new zip.ZipReader(innerBlob)
        // let innerEntries = await innerFiles.getEntries();
        let simpleSign = entries.find((f: any) => f.filename.includes("xml"));
        console.log(entries)
        if (!simpleSign) {
            console.log("no sign");
            spinnerSvg.remove();
            return;
        };
        console.log("sign loaded")
        let sign = await simpleSign.getData(new zip.Data64URIWriter());
        let signbase64 = sign.split(",")[1];
        let doc = await Context.data.doc!.fetch();
        let fetchedDoc: any;
        if (doc.data.__sourceRef) {
            fetchedDoc = await doc.data.__sourceRef.fetch();
        } else {
            fetchedDoc = doc;
        }
        const fileSigns = await fetchedDoc.getSignHistory();
        const signs = fileSigns[0].signs.filter((s: any) => s.data.type === "file");
        const userId = Context.data.user!.id
        if (signs.find((s: any) => s.data.__createdBy.id === userId)) {
            console.log("sign already attached");
            spinnerSvg.remove();
            return;
        };

        let body = (await fetchedDoc.getDataSigns()).find((s: any) => s.type === "file")!.body;
        let newSign: NewSign = {
            body,
            sign: signbase64,
            codeProvider: "Работа в России ПЭП"
        };
        console.log(newSign)
        confirmButton.classList.remove("disabled");
        await fetchedDoc.uploadSign(newSign);
        await fetchedDoc.save();
        spinnerSvg.remove()
    } catch (e) {
        console.log(e.message);
        spinnerSvg.remove()
    };
};

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = atob(base64);
    const len = binary_string.length;
    let bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    };

    return bytes.buffer;
}