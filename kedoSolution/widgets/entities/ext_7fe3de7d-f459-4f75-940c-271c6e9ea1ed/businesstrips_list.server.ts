/* Server scripts module */
// async function getTripsApi() {
//     let personalDocsAppsArr: any[] = [];

//     const url = Context.data.request_url!

//     let token: string = Context.data.token!;
    
//     const myHeaders = {
//         "Authorization": `Bearer ${token}`,
//     };

//     const date = new Date()
//     const year = date.getFullYear()
//     const month = date.getMonth() + 1
//     const day = date.getDate()
//     const dateString = `${year - 1}-${month}-${day}`

//     const bodyObj = {
//         "active": true,
//         "filter": {
//             "tf": {
//                 "posted_employees": [Context.data.user_application!.id],
//                 "__createdAt": {
//                     "min": dateString
//                 }
//             }
//         },
//         "from": 0,
//         "size": 100
//     }

//     const requestOptions = {
//         method: "POST",
//         headers: myHeaders,
//         body: JSON.stringify(bodyObj)
//     };

//     await fetch(url, requestOptions)
//         .then(async(res) => {
//             if(res.ok){
//                 return await res.json()
//             } 
//         })
//         .then((res) => {
//             personalDocsAppsArr = res["result"]["result"]
//         })
//     Context.data.response = JSON.stringify(personalDocsAppsArr)
// }