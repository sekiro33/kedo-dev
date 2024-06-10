

// const numberOfUnloadedElements: number = 20;
// let countOfIterations: number;
// let firstElementNumber: number;
// let numberOfAllElements: number = 0;

// interface stringData{
//     userNameText: string,
//     userId: string,
//     userDate: string,
//     statusText: string,
//     statusCode: string
// }

// async function findUserArr(): Promise<void> {
    
//     try{
//         Context.data.chunk_data_array = []
        
//         let userSearch = Namespace.app.staff.search()

//         if(!numberOfAllElements){
//             numberOfAllElements = await userSearch.count();
//         }
        
//         if(!countOfIterations){
//             countOfIterations = Math.ceil(numberOfAllElements / numberOfUnloadedElements);
//         }

//         firstElementNumber = Context.data.iteration_number! * numberOfUnloadedElements;
//         const amountOfElements = (Context.data.iteration_number != countOfIterations - 1) ? numberOfUnloadedElements : (numberOfAllElements - firstElementNumber);

//         if(Context.data.iteration_number === countOfIterations){
//             Context.data.all_documents_uploaded = true
//         }
        
//         try {
//             let result: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>[];
//             result = await userSearch
//                 .size(amountOfElements)
//                 .from(firstElementNumber)
//                 .all()
            
//             if(result){
//                 for (let i = 0; i < result.length; i++){
//                     await addElementToGeneralArray(result[i]);
//                 }

//                 Context.data.iteration_number! += 1;
//             }
//         } catch (err) {
//             throw new Error(`userSearch error ${err}`);
//         };
//     }
//     catch(err){
//         throw new Error(`userSearch error ${err}`);
//     }
// }

// async function addElementToGeneralArray(element: ApplicationItem<Application$kedo$staff$Data,any>){
//     if(element){
//         // user
//         let userNameText: string;
//         let userId: string;

//         userNameText = !element.data.__name ? '' : element.data.__name;
//         userId = !element.data.__id ? '' : element.data.__id;
        
//         // date
//         let userDate: string;
//         userDate = !element.data.__createdAt ? '' : element.data.__createdAt.format();
        
//         // status
//         let statusText: string = '';
//         let statusCode: string = '';

//         if(element.data.__status){
//             statusText = !element.data.__status.name ? '' : element.data.__status.name;
//             statusCode = !element.data.__status.code ? '' : element.data.__status.code;
//         }

//         let elementData: stringData = {
//             userNameText,
//             userId,
//             userDate,
//             statusText,
//             statusCode
//         }

//         Context.data.chunk_data_array.push(elementData);
//     }
// }