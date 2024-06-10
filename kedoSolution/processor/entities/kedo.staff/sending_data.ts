const userId = "9a81cb30-4aef-11ed-b0f9-f557cda0de1e";
const token = "UUsybjl6dlgzdVB5VmVzdE8xeng6VmswejBFSmh0TnRhZ3BwTzhNSVJiVkNZb3F5TDZYZHpSZ3BHRmJBUQ==";
const docKindId = "ETD.OtherDoc";
const groupId = "ETD.LoadingFiles";
const notificationURL = "null.ru";

async function sendDoc(): Promise<void> {
  Context.data.wrong_document = "";
  Context.data.doc_links = "";
  Context.data.doc_ids = "";
  let staff = await Context.data.staff!.fetch();
  let snils = staff.data.snils!.replace(/-/g, "").replace(/\s/g, "");
  let staffDocs = await Context.fields.staff_docs_contract.app.search().where((f, g) => g.and(
    f.__deletedAt.eq(null),
    f.staff.link(staff)
  )).size(10000).all();
  let docs = await Context.fields.docs_contract.app.search().where((f, g) => g.and(
    f.__deletedAt.eq(null),
    f.staff.link(staff)
  )).size(10000).all();

  let sources = await Promise.all([...staffDocs, ...docs].map(doc => doc.data.__sourceRef?.fetch()));
  Context.data.debug = sources.map(doc => doc.data.__name).join("\n")
  let allDocs = await Promise.all(sources.map(async source => {
    const fileName = await source.data.__file.fetch().then((r: any) => r.data.__name);
    return {
      name: fileName,
      link: await source.data.__file.getDownloadUrl()
    }
  }));

  for (let doc of allDocs) {
    let docLink = doc.link;
    let docBuffer = await fetch(docLink).then(doc => doc.arrayBuffer());
    let base64String = _arrayBufferToBase64(docBuffer);
    let fileName = doc.name
    let comment = "";
    let body = JSON.stringify({
        userId,
        snils,
        name: fileName,
        comment,
        file: base64String,
        groupId,
        docKindId,
        notificationURL,
        fileName
      });
    let response = await fetch("https://ekd-integration.trudvsem.ru/createLaborerDocs", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${token}`,
        "Content-Type": "application/json"
      },
      body
    });
    let responseText = await response.text();

    if (!response.ok || JSON.parse(responseText).error) {
      if (responseText.includes("валидации") || responseText.includes("PDF")) {
        Context.data.wrong_document += fileName;
        Context.data.wrong_document += "\n";
        Context.data.debug += responseText;
        continue;
      };
      Context.data.error_exists = true;
      let error = responseText;
      Context.data.error = error;
      return;
    };

    let responseJson = JSON.parse(responseText);
    let docId = responseJson.documentId;
    let documentLink = responseJson.documentLink;

    Context.data.doc_links += documentLink;
    Context.data.doc_links += "\n";
    Context.data.doc_ids += docId;
    Context.data.doc_ids += "\n";
    await _sleep(1000);
  };
};

function _arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    let bytes = new Uint8Array( buffer );
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    };
    return btoa(binary);
};

async function _sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}