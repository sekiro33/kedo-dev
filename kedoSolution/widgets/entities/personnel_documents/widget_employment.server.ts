/* Server scripts module */

// async function findUserArr(): Promise<void> {
//     const completedStatus = Context.fields.user_application.app.fields.__status.variants.signed_documents;
    
//     try{
//         Context.data.user_applications = await Context.fields.user_application.app.search().where(f => f.__status.neq(completedStatus)).size(4).all();
//     }
//     catch(err){
//         throw new Error(`user_application.app.search error ${err}`);
//     }
// }