/* Server scripts module */

// async function findDocsArr(): Promise<void> {
//     let kedoDocs: ApplicationItem<Application$kedo$documents_for_employment$Data,Application$kedo$documents_for_employment$Params>[];
//     let staffDocs: ApplicationItem<Application$personnel_documents$personnel_documents$Data,Application$personnel_documents$personnel_documents$Params>[];
//     let resultObj: any[] = [];
//     let resultObjSorted: any[] = [];

//     async function getKedoData(){
//         try{
//             kedoDocs = await Context.fields.application_kedo_documents.app.search().size(4).all();
//             resultObj.push(...kedoDocs)
//         }
//         catch(err){
//             Context.data.error = `application_kedo_documents.app.search error ${err}`;
//         }
//     }

//     async function getStaffData(){
//         try{
//             staffDocs = await Context.fields.app_hr_documents.app.search().size(4).all();
//             resultObj.push(...staffDocs)
//         }
//         catch(err){
//             Context.data.error = `app_hr_documents.app.search error ${err}`;
//         }
//     }

//     await Promise.all([await getKedoData(), await getStaffData()])

//     resultObjSorted = resultObj.sort((app1: any, app2: any) => {
//         return app2.data.__createdAt.ts._d - app1.data.__createdAt.ts._d
//     })

//     Context.data.custom_application = resultObjSorted.slice(0, 4);
// }
