/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface DocumentData {
    guid: string;
    employeeGuid: string[];
    docId: string;
}

async function getOldNumberOfDocuments(): Promise<void> {
    /*const helpApp = await Namespace.app.integration_data.search().first();
    if (!helpApp) {
        const newHelpApp = Namespace.app.integration_data.create();
        newHelpApp.data.amount_of_old_documents = 0;
        newHelpApp.data.massiv_izvestnykh_dokumentov = JSON.stringify([])
        await newHelpApp.save();
        Context.data.amount_of_old_documents = 0;
        Context.data.known_documents_array = JSON.stringify([])
        return;
    }

    Context.data.amount_of_old_documents = helpApp.data.amount_of_old_documents
    Context.data.known_documents_array = helpApp.data.massiv_izvestnykh_dokumentov*/
}

async function fillRequestData(): Promise<void> {
    Context.data.url_documents = 'InformationRegister_EM_ДокументыСотрудников?$format=json'
}

async function changeStatus(docData: any): Promise<void> {
    /*const statusApp = await Namespace.app.document_statuses.search().where((f, g) => g.and (
        f.__deletedAt.eq(null),
        f.__name.eq('На подписании')
    )).first()
    if(!!statusApp){
        Context.data.change_status_body = statusApp.data.full_name;
        Context.data.status_change_url = docData["Документ"];
    }*/
}


async function getDocumentsData(): Promise<void> {
    /*const knownDocuments = JSON.parse(Context.data.known_documents_array!)
    const newDocuments: any[] = [];
    const parsedDocs: DocumentData[] = []
    const responseDataArray = JSON.parse(Context.data.response!).value

    if (!!knownDocuments && !!responseDataArray) {
        for (let i = 0; i < responseDataArray.length; i++) {
            const foundDocument = knownDocuments.find((item: any) => {
                return item === responseDataArray[i]['Документ']
            })

            if(!foundDocument) {
                newDocuments.push(responseDataArray[i])
            }
        }

        if (newDocuments.length > 0) {
            for(let i = 0; i < newDocuments.length; i++) {
                const doc = parsedDocs.find((item: DocumentData) => {
                    return item.guid === newDocuments[i]['Документ'] && item.docId === newDocuments[i]["ВнутреннийИдентификаторПечатнойФормы"]
                })
                if (!!doc) {
                    doc.employeeGuid.push(newDocuments[i]["Сотрудник_Key"])
                } else {
                    const newDoc: DocumentData = {
                        guid: newDocuments[i]['Документ'],
                        employeeGuid: [newDocuments[i]['Сотрудник_Key']],
                        docId: newDocuments[i]['ВнутреннийИдентификаторПечатнойФормы']
                    } 
                    parsedDocs.push(newDoc)
                }
            }
            parsedDocs.forEach((item:DocumentData, index: number) => {
                const guidSet = new Set(item.employeeGuid);
                const newArray = Array.from(guidSet)
                parsedDocs[index].employeeGuid = newArray
            })
            Context.data.number_of_new_documents = parsedDocs.length;
            Context.data.current_iteration_number = 0;
            Context.data.new_documents = JSON.stringify(parsedDocs);
        }
        const newKnownDocuments = parsedDocs.map((item: DocumentData) => {
            return item.guid;
        })
        const helpApp = await Namespace.app.integration_data.search().first();
        if (!!helpApp) {
            helpApp.data.amount_of_old_documents = responseDataArray.length;
            helpApp.data.massiv_izvestnykh_dokumentov = JSON.stringify([...knownDocuments, ...newKnownDocuments])
            await helpApp.save()
        }
    }*/
}


async function fillDocFormData(): Promise<void> {
    const docs = JSON.parse(Context.data.new_documents!);
    const iter = Context.data.current_iteration_number;
    const documentId = docs[iter!].docId;
    Context.data.url_documents = `InformationRegister_EM_ПечатныеФормыДокументов?$format=json&$filter=ВнутреннийИдентификаторПечатнойФормы eq '${documentId}'`;
}

async function fillSignData(): Promise<void> {
    /*const responseJSON = JSON.parse(Context.data.response!);
    const docs = JSON.parse(Context.data.new_documents!);
    const currentDoc = docs[Context.data.current_iteration_number!];
    const fileData = responseJSON.value.find((item: any) => {
        return item["Документ"] === currentDoc.guid && item["ВнутреннийИдентификаторПечатнойФормы"] === currentDoc.docId
    })

    if (!!fileData) {
        await changeStatus(fileData);
        let typeApp: any;
        const fileJSON = JSON.parse(fileData["ХранилищеПечатнойФормы"]);
        const fileExtension = fileJSON.type;
        const fileString = fileJSON.data.replace(/\\r\\n/g, '')
        const fileArrayBuffer = await getArrayBufferFromBase64(fileString);
        const newFile = await Context.fields.document_file.create(`${fileData["ПечатнаяФорма"]}.${fileExtension}`, fileArrayBuffer);
        const fileTypeApp = await Namespace.app.document_types.search().where((f, g) => g.and (
            f.__deletedAt.eq(null),
            f.doc_type_id_1c.eq(currentDoc.docId)
        )).all();

        Context.data.file_types = fileTypeApp

        if (Array.isArray(fileTypeApp) && fileTypeApp.length > 1) {
            typeApp = fileTypeApp.find((item: any) => item.data.document_type === fileData["Документ_Type"]);
        } else {
            typeApp = fileTypeApp[0];
        }

        Context.data.current_doc_id = fileData["Документ"];
        Context.data.document_file = newFile;
        Context.data.assigned_employees = JSON.stringify(currentDoc.employeeGuid);
        Context.data.file_type = typeApp ? typeApp : undefined;
        Context.data.start_sign_process = true;
        
    } else {
        Context.data.start_sign_process = false
    }

    Context.data.current_iteration_number = Context.data.current_iteration_number! + 1;*/
}

async function getArrayBufferFromBase64(base64: string): Promise<ArrayBuffer> {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

async function getDocType(): Promise<void> {
    // const searchType = Context.data.file_type;
    // if(!searchType) return

    // const awaitingApp = await Namespace.app.awaiting_documents_catalog.search().where((f, g) => g.and (
    //     f.__deletedAt.eq(null),
    //     f.document_type.link(searchType),
    //     f.document_id.eq(Context.data.current_doc_id!)
    // )).first();
    // if (!awaitingApp){
    //     return
    // } else {
    //     Context.data.start_sign_process = false; 
    // }


    // const appToWrite = await awaitingApp.data.awaiting_app!.fetch();
    // appToWrite.data.__file = Context.data.document_file;
    // await appToWrite.save();

    // await awaitingApp.delete();

}


async function get_kedo_settings(): Promise<void> {
    const alternative_integration = await Context.fields.kedo_settings.app.search().where((f => f.code.eq('use_alternative_integration'))).first();
    Context.data.alternative_integration = alternative_integration ? alternative_integration.data.status : false;
}

async function get_staff(id_1c: string): Promise<ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params> | undefined> {
    return await Context.fields.staffs.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__status.eq(Context.fields.staffs.app.fields.__status.variants.signed_documents),
        g.or(
            f.id_1c.eq(id_1c),
            f.individual_id_1c.eq(id_1c),
        ),
    )).first();
}

async function get_staff_by_id(id: string): Promise<ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params> | undefined> {
    return await Context.fields.staffs.app.search().where((f, g) => g.and(
        f.__id.eq(id),
    )).first();
}

async function get_await_docs(): Promise<void> {
    // Печатные формы.
    Context.data.print_forms = [];
    // Сотрудники.
    const staff_ids: string[] = [];
    // Идентификаторы печатных форм.
    const ids: string[] = [];

    const await_docs = await Context.fields.await_docs.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.document_creation_data.eq(null),
        f.processed_elma.eq(false),
        f.document_odata_name.neq("Document_ПриемНаРаботу"),
    )).size(10000).all();

    const doc_types = await Context.fields.document_type_1c.app.search().size(10000).all();

    for (const doc of await_docs) {
        if (doc.data.print_forms && doc.data.print_forms.length > 0) {
            const print_forms_id: string[] = JSON.parse(doc.data.print_forms_id!);
            const print_forms = doc.data.print_forms;
            const individual_id_1c: string[] = JSON.parse(doc.data.personal_guid_1c!);
            const staff = await get_staff(individual_id_1c[0]);

            if (staff == undefined) {
                continue;
            } 

            for (let i = 0; i < print_forms_id.length; i++) {
                Context.data.print_forms.push(print_forms[i]);
                staff_ids.push(staff.data.__id);

                const type = doc_types.find(f => f.data.doc_type_id_1c == print_forms_id[i]);
                if (type && type.data.app_code) {
                    ids.push(type.data.app_code);
                } else {
                    ids.push("other_documents")
                }
            }
            doc.data.processed_elma = true;
            await doc.save();
        }
    }

    Context.data.document_types_json = JSON.stringify(ids);
    Context.data.staff_ids_json = JSON.stringify(staff_ids);
}

async function get_print_form(): Promise<void> {
    // Получаем печатную форму.
    Context.data.print_form = Context.data.print_forms!.pop();

    // Сотрудника (подписанта).
    const staff_ids : string[] = JSON.parse(Context.data.staff_ids_json!);
    Context.data.staff = await get_staff_by_id(staff_ids.pop()!);
    Context.data.staff_ids_json = JSON.stringify(staff_ids);
    
    // Вид документа.
    const types: string[] = JSON.parse(Context.data.document_types_json!);
    const doc_type = types.pop();
    Context.data.document_types_json = JSON.stringify(types);
    Context.data.document_type_1c = await Context.fields.document_type_1c.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.app_code.eq(doc_type!)
    )).first();
}

async function reset_counter(): Promise<void> {
    Context.data.counter = 0;
}

async function check_print_forms_length(): Promise<boolean> {
    return Context.data.print_forms!.length > 0 ? true : false;
}

async function inc_counter(): Promise<void> {
    Context.data.counter! += 1;
}
