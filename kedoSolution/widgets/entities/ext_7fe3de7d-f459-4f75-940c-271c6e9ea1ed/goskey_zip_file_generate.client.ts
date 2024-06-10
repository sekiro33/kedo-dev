declare const console: any;

import JSZip from "jszip-actual.min.js"

async function createZip(): Promise<void> {
    let docMeta: ApplicationItem<Application$kedo_tests$goskey_files_test$Data, any>
    let docForSend: ApplicationItem<Application$kedo_tests$goskey_files_test$Data, any>
    for (let item of Context.data.goskey_docs!) {
        const doc = await Context.fields.goskey_files_app.app.search().where(f => f.__id.eq(item.id)).first();
        if (doc) {
            console.log(doc);
            if (doc.data.__name.includes("xml")) {
                docMeta = doc;
            } else {
                docForSend = doc;
            };
        };
    };
    let metaSignHistory: EntityVersion[]
    let docSignHistory: EntityVersion[];
    try {
        metaSignHistory = await docMeta!.getSignHistory();
        docSignHistory = await docForSend!.getSignHistory();
    } catch (err) {
        console.log(err);
        Context.data.error = err.message;
        Context.data.error_exists = true;
        return;
    };
    const metaSign = metaSignHistory[0].signs[0].sign;
    const fileSign = docSignHistory[0].signs[0].sign;
    const newZip = new JSZip();
    const docFile = await docForSend!.data.__file!.fetch();
    const docFileBuffer = await fetch(await docFile.getDownloadUrl()).then(r => r.arrayBuffer());
    const metaFile = await docMeta!.data.__file!.fetch();
    const metaFileBuffer = await fetch(await metaFile!.getDownloadUrl()).then(r => r.arrayBuffer());
    
    newZip.file(`${docFile.data.__name}.sig`, fileSign, {base64: true});
    newZip.file(`${metaFile.data.__name}.sig`, metaSign, {base64: true});
    newZip.file(`${docFile.data.__name}`, docFileBuffer, {binary: true});
    newZip.file(`${metaFile.data.__name}`, metaFileBuffer, {binary: true});
    const zipBuffer = await newZip.generate({type: "arrayBuffer"});
    const zipFile = await Context.fields.zip_file.create("test.zip", zipBuffer);
    console.log(zipFile);
    Context.data.zip_file = zipFile;
};