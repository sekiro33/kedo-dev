// async function changeProviderFieldVisibility(): Promise<void> {
//     const providerType = Context.data.provider!.code;

//     switch (providerType) {
//         case "sign_me":
//             ViewContext.data.show_doc_type = false;
//             ViewContext.data.sign_me_provider = true;
//             ViewContext.data.kontur_provider = false;
//             Context.data.document_type = {name: "Паспорт", code: "passport"};
//             break;
//         case "kontur":
//             ViewContext.data.show_doc_type = true;
//             ViewContext.data.sign_me_provider = false;
//             ViewContext.data.kontur_provider = true;
//             break;
//     };
// };

// async function changeDocumentFieldVisibility(): Promise<void> {
//     const documentType = Context.data.document_type!.code;

//     switch (documentType) {
//         case "passport":
//             ViewContext.data.passport_identity = true;
//             ViewContext.data.other_identity = false;
//             break;
//         case "other_identity":
//             ViewContext.data.passport_identity = false;
//             ViewContext.data.other_identity = true;
//             break;
//     };

// }