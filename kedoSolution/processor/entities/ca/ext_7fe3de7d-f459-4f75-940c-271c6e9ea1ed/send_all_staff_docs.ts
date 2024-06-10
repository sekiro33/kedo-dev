const userId = Namespace.params.data.user_id;
const token = Namespace.params.data.api_token;
const snils = Context.data.snils;
const docKindId = "ETD.OtherDoc";
const groupId = "ETD.LoadingFiles";
const notificationURL = "null.ru"

async function action() {
	let docs = Context.data.documents!;

	for (let doc of docs) {
		let fetchedDoc = await doc.fetch();
		let docLink = await doc.getDownloadUrl();
		let docBuffer = await fetch(docLink).then(doc => doc.arrayBuffer());
		let base64String = btoa(String.fromCharCode(...new Uint8Array(docBuffer)));
		let fileName = fetchedDoc.data.__name;
		let comment = "";
		let response = await fetch("https://ekd-integration.trudvsem.ru/createLaborerDocs", {
			method: "POST",
			headers: {
				"Authorization": `Basic ${token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				userId,
				snils,
				name: fileName,
				comment,
				file: base64String,
				groupId,
				docKindId,
				notificationURL,
				fileName
			})
		});
		if (!response.ok) {
			Context.data.error = await response.text();
			return;
		};
		let responseJson = await response.json();
		let docId = responseJson.documentId;
		let documentLink = responseJson.documentLink;
		if (Context.data.doc_links) {
			Context.data.doc_links += documentLink;
			Context.data.doc_links += "\n";
		} else {
			Context.data.doc_links = documentLink;
			Context.data.doc_links += "\n";
		};
		if (Context.data.doc_id) {
			Context.data.doc_id += docId;
			Context.data.doc_id += "\n";
		} else {
			Context.data.doc_id = docId;
			Context.data.doc_id += "\n";
		};
	};
};