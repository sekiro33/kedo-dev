declare const console: any;
declare const window: any;

const prodKonturCerts = "https://api.kontur.ru/kcr";
const testKonturCerts = "https://api.kontur.ru/kcr";
const testKonturSigns = "http://cloudtest.kontur-ca.ru/v3";
const prodKonturSigns = "https://gost-tls-kontur.elma-bpm.com/v3";
const prodSignMe = "https://gost-tls-signme.elma-bpm.com";
const testSignMe = "https://gost-tls-signme-test.elma-bpm.com";

async function onInit(): Promise<void> {
    let templates: FetchResponse | undefined = undefined;
    try {
        templates = await fetch(`https://${window.location.host}/api/worker/query/system/bp_templates/search`, {
            method: "PUT",
            body: JSON.stringify({
                offset: 0,
                limit: 100,
                order: [],
                filter: {
                    and: [
                        {
                            eq :[
                                {field: "namespace" },
                                {const: "ext_27c1fb4a-e011-47a6-aa26-cf0fc42c39cd"}
                            ]
                        }
                    ]
                }
            })
        });
    } catch {
        templates = await fetch(`http://${window.location.host}/api/worker/query/system/bp_templates/search`, {
            method: "PUT",
            body: JSON.stringify({
                offset: 0,
                limit: 100,
                order: [],
                filter: {
                    and: [
                        {
                            eq :[
                                {field: "namespace" },
                                {const: "ext_27c1fb4a-e011-47a6-aa26-cf0fc42c39cd"}
                            ]
                        }
                    ]
                }
            })
        });
        
    }
    console.log(await templates.json())
}

async function changeKonturServer(): Promise<void> {
    let serverCode = Context.data.kontur_server!.code;
    if (serverCode == "production") {
        Context.data.kontur_server_address = prodKonturCerts;
        Context.data.kontur_sign_server = prodKonturSigns;
    } else {
        Context.data.kontur_server_address = testKonturCerts;
        Context.data.kontur_sign_server = testKonturSigns;
    };
    console.log(Context.data.kontur_sign_server)
};

async function changeSignMeServer(): Promise<void> {
    let serverCode = Context.data.sign_me_server!.code;
    if (serverCode == "production") {
        Context.data.sign_me_server_address = prodSignMe;
    } else {
        Context.data.sign_me_server_address = testSignMe;
    };
};