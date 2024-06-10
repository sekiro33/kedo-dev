const emptyStringRegex = /^\s*\n/gm;
const otherDocsCode = "12.999";

type xmlElement = {
	element_name: string,
	regex: RegExp,
	element_type: string,
	fields?: xmlElement[]
};

type docInfo = {
	id: string,
	created: string,
	employername: string,
	innemployer: string,
	ogrn: string,
	kpp?: string,
	employeer_jobtitle?: string,
	docName: string,
	docNumber?: string,
	docType: string,
	file_name: string,
	file_size: string,
	createdAt: string,
	employeer_sign_date: string,
	sign_name: string,
	sign_size?: string,
	firstnameinfo: string,
	lastnameinfo: string,
	patronymicInfo: string,
	jobtitle: string,
	staff_sign_date?: string,
	snils: string,
	sign_name_staff?: string,
	sign_size_staff?: string
};

type jsonToXmlKey = keyof typeof docData;

let fetchedDoc: any;
let docData: docInfo | undefined;
let xmlText = `<edoc:wredcData xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:edoc="http://mintrud.gov.ru/work-related-electronic-document"
    id= created= version="1.0"
    xsi:schemaLocation="http://mintrud.gov.ru/work-related-electronic-document work-related-electronic-document_20.09.xsd">
    <content>
        <employername></employername>
        <innemployer></innemployer>
        <ogrn></ogrn>
        <kpp></kpp>
        <jobtitle></jobtitle>
        <docinfo>   
            <docName></docName>
            <docNumber></docNumber>
            <date></date>
            <docType></docType>
            <annotation></annotation>
            <file></file>
            <size></size>
            <signature>
                <date></date>
                <x509>
                    <file></file>
                    <size></size>
                </x509>
            </signature>
            <employeeinfo>
                <lastnameinfo></lastnameinfo>
                <firstnameinfo></firstnameinfo>
                <patronymicInfo></patronymicInfo>
                <jobtitle></jobtitle>
                <signature>
                    <date></date>
                    <snils></snils>
                    <x509>
                        <file></file>
                        <size></size>
                    </x509>
                </signature>
            </employeeinfo>
        </docinfo>
    </content>
</edoc:wredcData>`

const globalXmlSchema: xmlElement[] = [
	{
		element_name: "id",
		regex: /id=/,
		element_type: "attribute"
	},
	{
		element_name: "created",
		regex: /created=/,
		element_type: "attribute"
	},
	{
		element_name: "content",
		regex: /(?<open><content>)(?<value>)(?<close><\/content>)/,
		element_type: "object",
		fields: [
			{
				element_name: "employername",
				regex: /(?<open><employername>)(?<value>)(?<close><\/employername>)/,
				element_type: "field"
			},
			{
				element_name: "innemployer",
				regex: /(?<open><innemployer>)(?<value>)(?<close><\/innemployer>)/,
				element_type: "field"
			},
			{
				element_name: "ogrn",
				regex: /(?<open><ogrn>)(?<value>)(?<close><\/ogrn>)/,
				element_type: "field"
			},
			{
				element_name: "kpp",
				regex: /(?<open><kpp>)(?<value>)(?<close><\/kpp>)/,
				element_type: "field"
			},
			{
				element_name: "employeer_jobtitle",
				regex: /(?<open><jobtitle>)(?<value>)(?<close><\/jobtitle>)[\n\w\s\t]*(?<rest><doc)/,
				element_type: "field"
			},
			{
				element_name: "docinfo",
				regex: /(?<open><docinfo>)(?<value>)(?<close><\/docinfo>)/,
				element_type: "object",
				fields: [
					{
						element_name: "docName",
						regex: /(?<open><docName>)(?<value>)(?<close><\/docName>)/,
						element_type: "field"
					},
					// {
					// 	element_name: "docNumber",
					// 	regex: /(?<open><docNumber>)(?<value>)(?<close><\/docNumber>)/,
					// 	element_type: "field"
					// },
					{
						element_name: "createdAt",
						regex: /(?<open><date>)(?<value>)(?<close><\/date>)/,
						element_type: "field"
					},
					{
						element_name: "docType",
						regex: /(?<open><docType>)(?<value>)(?<close><\/docType>)/,
						element_type: "field"
					},
					{
						element_name: "file_name",
						regex: /(?<open><file>)(?<value>)(?<close><\/file>)/,
						element_type: "field"
					},
					{
						element_name: "file_size",
						regex: /(?<open><size>)(?<value>)(?<close><\/size>)/,
						element_type: "field"
					},
					{
						element_name: "employeer_signature",
						regex: /(?<open><signature>)(?<value>[\w\n\s\t\/<>]*)(?<close><\/signature>)[\n\w\s\t]*(?<rest><emp)/,
						element_type: "object",
						fields: [
							{
								element_name: "employeer_sign_date",
								regex: /(?<open><date>)(?<value>)(?<close><\/date>)/,
								element_type: "field"
							},
							{
								element_name: "x509",
								regex: /(?<open><x509>)(?<value>)(?<close><\/x509>)/,
								element_type: "object",
								fields: [
									{
										element_name: "sign_name",
										regex: /(?<open><file>)(?<value>)(?<close><\/file>)/,
										element_type: "field"
									},
									{
										element_name: "sign_size",
										regex: /(?<open><size>)(?<value>)(?<close><\/size>)/,
										element_type: "field"
									},
								]
							},

						]
					},
					{
						element_name: "employeeinfo",
						regex: /(?<open><employeeinfo>)(?<value>)(?<close><\/employeeinfo>)/,
						element_type: "object",
						fields: [
							{
								element_name: "lastnameinfo",
								regex: /(?<open><lastnameinfo>)(?<value>)(?<close><\/lastnameinfo>)/,
								element_type: "field"
							},
							{
								element_name: "firstnameinfo",
								regex: /(?<open><firstnameinfo>)(?<value>)(?<close><\/firstnameinfo>)/,
								element_type: "field"
							},
							{
								element_name: "patronymicInfo",
								regex: /(?<open><patronymicInfo>)(?<value>)(?<close><\/patronymicInfo>)/,
								element_type: "field"
							},
							{
								element_name: "jobtitle",
								regex: /(?<open><jobtitle>)(?<value>)(?<close><\/jobtitle>)/,
								element_type: "field"
							},
							{
								element_name: "staff_signature",
								regex: /(?<open><signature>)(?<value>[\w\n\s\t\/<>]*)(?<close><\/signature>)[\n\w\s\t]*(?<rest><\/emp)/,
								element_type: "object",
								fields: [
									{
										element_name: "staff_sign_date",
										regex: /(?<open><date>)(?<value>)(?<close><\/date>)/,
										element_type: "field"
									},
									{
										element_name: "snils",
										regex: /(?<open><snils>)(?<value>)(?<close><\/snils>)/,
										element_type: "field"
									},
									{
										element_name: "x509_employeer",
										regex: /(?<open><x509>)(?<value>)(?<close><\/x509>)/,
										element_type: "object",
										fields: [
											{
												element_name: "sign_name_staff",
												regex: /(?<open><file>)(?<value>)(?<close><\/file>)/,
												element_type: "field"
											},
											{
												element_name: "sign_size_staff",
												regex: /(?<open><size>)(?<value>)(?<close><\/size>)/,
												element_type: "field"
											},
										]
									},
								]
							},
						]
					},
				]
			},
		]
	}
];

async function convertFile(): Promise<void> {
	try {

		let text = Context.data.generated_xml!;
		let utf8: any[] = [];

		for (let i = 0; i < text.length; i++) {
			let charcode = text.charCodeAt(i);

			if (charcode < 0x80) {
				utf8.push(charcode);
			} else if (charcode < 0x800) {
				utf8.push(
					0xc0 | (charcode >> 6),
					0x80 | (charcode & 0x3f)
				);

			}

			else if (charcode < 0xd800 || charcode >= 0xe000) {
				utf8.push(
					0xe0 | (charcode >> 12),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f)
				);
			}

			else {
				i++;
				charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (text.charCodeAt(i) & 0x3ff));
				utf8.push(
					0xf0 | (charcode >> 18),
					0x80 | ((charcode >> 12) & 0x3f),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f)
				);
			};
		};

		let bufView = new Uint8Array(utf8.length);

		for (var i = 0; i < utf8.length; i++) {
			bufView[i] = utf8[i];
		}

		let file = await Context.fields.xml_file.create(`wredc_data.xml`, bufView);
		Context.data.xml_file = file;
	} catch (err) {
		Context.data.error = "xml file generate error" + err.message;
		return;
	};
};

async function getData(): Promise<docInfo | undefined> {
	try {

		let doc = await Context.data.doc!.fetch();

		if (!!doc.data.__sourceRef) {
			fetchedDoc = await doc.data.__sourceRef.fetch();
		} else {
			fetchedDoc = doc;
		};

		let staff = await Context.data.staff!.fetch();
		let extUser = await System.users.search().where(i => i.__id.eq(staff.data.ext_user!.id)).first();
		let file: FileItem | undefined = undefined;
		let fileLink: string = "";
		let fileBase64: string = "";
		let fileSize: string = "0";
		let staffSignDate: string = "";
		let staffSignName: string = "";
		let staffSignSize: string = "";
		let signHistory: any;
		let signSize: string = "";
		let signDate: string = "";
		let employeeSign: any;
		let docType: string = "";
		let organization = await staff.data.organization.fetch();
		let entity = await organization.data.entity.fetch();

		let innemployer = entity.data._inn;
		let ogrn = entity.data._ogrn;
		let kpp = entity.data._kpp;
		let employeerSignUser: any;
		let employeerSignUserName: string = "";

		let docTypeApp = await Namespace.params.fields.doc_number_app.app.search()
			.where((f, g) => g.and(
				f.__deletedAt.eq(null),
				f.app_namespace.eq(fetchedDoc.namespace),
				f.app_code.eq(fetchedDoc.code),
			))
			.first();

		docType = docTypeApp ? docTypeApp.data.code! : otherDocsCode;

		if (!!fetchedDoc) {
			file = await fetchedDoc.data.__file.fetch();
			if (!!file) {
				fileLink = await file!.getDownloadUrl();
				let fileByteArray = await fetch(fileLink).then(async (file) => file.arrayBuffer());
				fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileByteArray)));
				fileSize = fileBase64.length.toString();
				// fileSize = "0";
			};
		};

		let fileName = file?.data.__name!;
		let signName = fileName + ".sig";
		try {
			signHistory = await fetchedDoc.getSignHistory();
		} catch {

		};

		if (signHistory) {
			let sign = signHistory[0].signs.find((s: any) => s.userID != extUser!.id);
			employeeSign = signHistory[0].signs.find((sign: any) => sign.userID === extUser!.id);
			if (!!sign) {
				employeerSignUser = await System.users.search().where((f, g) => g.and(
					f.__deletedAt.eq(null),
					f.__id.eq(sign.userID)
				)).first();
				if (employeerSignUser) {
					employeerSignUserName = employeerSignUser.data.displayedPosition;
				}
				let signBase64 = sign.sign;
				signSize = signBase64.length.toString();
				// signSize = "0";
				signDate = new Datetime(sign.createdAt).format("YYYY-MM-DD");
			};
		}

		let firstName = staff.data.full_name!.firstname;
		let lastName = staff.data.full_name!.lastname;
		let patronymic = staff.data.full_name!.middlename;

		if (!!employeeSign) {
			staffSignName = signName;
			staffSignDate = new Datetime(employeeSign.createdAt).format("YYYY-MM-DD");
			staffSignSize = employeeSign.sign.length.toString();
			// staffSignSize = "";
		};

		let snils = staff.data.snils;
		let jobTitle = staff.data.position ? await staff.data.position.fetch().then((p: any) => p.data.__name) : "Нет должности";

		let docData: docInfo = {
			id: fetchedDoc.data.__id,
			created: new Datetime().format("YYYY-MM-DD"),
			createdAt: doc.data.__createdAt.format("YYYY-MM-DD HH:MM:SS"),
			employername: "ELMA",
			innemployer,
			ogrn,
			kpp,
			docName: fileName,
			docType: docType,
			file_name: fileName,
			file_size: fileSize,
			employeer_sign_date: signDate,
			sign_name: signName,
			sign_size: signSize,
			firstnameinfo: firstName,
			lastnameinfo: lastName,
			patronymicInfo: patronymic,
			jobtitle: jobTitle,
			staff_sign_date: staffSignDate,
			snils: snils,
			sign_name_staff: staffSignName,
			sign_size_staff: staffSignSize,
			employeer_jobtitle: employeerSignUserName
		};

		return docData;
	} catch (err) {
		Context.data.error = "get data error" + err.message;
		return;
	}
};

function handleElement(regElem: xmlElement, samplePart: string) {
	let fieldType = regElem.element_type;

	switch (fieldType) {
		case "attribute":
			xmlText = samplePart.replace(regElem.regex, `$&"${docData![regElem.element_name as jsonToXmlKey]}"`);
			break;
		case "field":
			if (regElem.element_name == "employeer_jobtitle" && !docData!.employeer_jobtitle) {
				xmlText = samplePart.replace(regElem.regex, "$4")
			} else {
				xmlText = samplePart.replace(regElem.regex, `$1${docData![regElem.element_name as jsonToXmlKey]}$3`);
			};
			break;
		case "object":
			let elementName = regElem.element_name;
			let signExist: boolean;
			switch (elementName) {
				case "staff_signature":
					signExist = !!(docData!.staff_sign_date && docData!.sign_name_staff && docData!.sign_size_staff);

					if (!signExist) {
						xmlText = samplePart.replace(regElem.regex, "$4");
						return;
					};
					break;
				case "employeer_signature":
					signExist = !!(docData!.sign_name && docData!.sign_size && docData!.employeer_sign_date);
					if (!signExist) {
						xmlText = samplePart.replace(regElem.regex, "$4");
						return;
					};
					break;
			}

			for (let field of regElem.fields!) {
				handleElement(field, xmlText);
			};
			break;
	};
};

async function action(): Promise<void> {
	docData = await getData();
	if (!docData) {
		return;
	}
	for (let item of globalXmlSchema) {
		handleElement(item, xmlText!)
	};
	Context.data.generated_xml = xmlText;
	await convertFile();
};
