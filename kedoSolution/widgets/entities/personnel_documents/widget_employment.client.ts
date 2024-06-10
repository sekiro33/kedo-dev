/* Client scripts module */
declare const document: any;
declare const console: any;
declare const window: any;

let appsToRender: any[];

async function renderWidget(){
    const itemTemp = document.querySelector('.kedo__employment-table-section-list-item-template');
    const itemsWrapper = document.querySelector('.kedo__employment-table-section-list');

    const loader = document.querySelector('.kedo-loader-wrapper-employment');
    loader.classList.add('kedo-loader-wrapper-employment_active');
    
    const host = window.location.host;

    try{
        // await Server.rpc.findUserArr();
        await findUserArrClientScript();
    }
    catch(err){
        throw new Error(`findUserArr error ${err}`);
    }
    
    if(appsToRender){
        for (let i = 0; i < appsToRender.length; i++){
            const app = appsToRender[i];
            // let app: ApplicationItem<Application$kedo$staff$Data,any>|undefined = undefined;
            // try{
            //     app = await Context.data.user_applications[i].fetch();
            // }
            // catch(err){
            //     throw new Error(`user_applications[i].fetch error ${err}`);
            // }

            if(app){
                const itemEl = itemTemp.content.cloneNode(true);

                const userName = itemEl.querySelector('.kedo__employment-table-string-user-name');
                userName.textContent = !app.data.__name ? '' : app.data.__name;
                userName.href = `https://${host}/kedo/staff(p:item/kedo/staff/${app.data.__id})`

                const dateEl = itemEl.querySelector('.kedo__employment-table-string-date');
                const date = new Date(app.data.__createdAt.format());

                dateEl.textContent = `${date.toLocaleString('ru-RU', { year:'2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}`;
                
                // const dateString = app.data.__createdAt.format().split('T');
                // const dateArr = dateString[0].split('-');
                // let date: string = '';
                // if(dateArr[0].length === 4){
                //     date = `${dateArr[2]}.${dateArr[1]}.${dateArr[0][2]}${dateArr[0][3]}`;
                // }
                // const time = dateString[1].slice(0, 5);
                // dateEl.textContent = !app.data.__updatedAt ? '' : `${date} ${time}`;

                
                if(app.data.__status){
                    const status = app.data.__status!.name;
                    const statusText = itemEl.querySelector('.kedo__employment-table-string-status-text');
                    const statusImg = itemEl.querySelector('.kedo__employment-table-string-status-img');

                    statusText.textContent = status;

                    switch(app.data.__status!.name){
                        case app.fields.__status.variants.invited.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_0-4');
                            break;
                        case app.fields.__status.variants.filling_pnd.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_0-4');
                            break;

                        case app.fields.__status.variants.input_data.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_1-4');
                            break;
                        case app.fields.__status.variants.editing_pnd.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_1-4');
                            break;
                        case app.fields.__status.variants.waiting_for_document_editing.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_1-4');
                            break;

                        case app.fields.__status.variants.acquaintance_with_the_agreement.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_2-4');
                            break;
                        case app.fields.__status.variants.conclude_an_agreement.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_2-4');
                            break;
                        case app.fields.__status.variants.UNEP_release_confirmation.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_2-4');
                            break;

                        case app.fields.__status.variants.signing_documents.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_3-4');
                            break;
                        

                        case app.fields.__status.variants.signed_documents.name:
                            statusImg.classList.add('kedo__employment-table-string-status-img_status_4-4');
                            break;
                    }
                }

                itemsWrapper.append(itemEl);
            }
        }
    }

    const btnAllDocs = document.querySelector('.kedo__employment-btn-all');
    btnAllDocs.href = `https://${host}/kedo/all_employees`;
    
    loader.classList.remove('kedo-loader-wrapper-employment_active');
}


async function findUserArrClientScript(): Promise<void> {
    const completedStatus = Context.fields.user_application.app.fields.__status.variants.signed_documents;
    
    try{
        // Context.data.user_applications = await Context.fields.user_application.app.search().where(f => f.__status.neq(completedStatus)).size(4).all();
        appsToRender = await Context.fields.user_application.app
            .search()
            // .where((f, g) => g.and(
            //     f.__deletedAt.eq(null),
            //     f.__status.neq(completedStatus)
            // ))
            // .where(f => f.__status.neq(completedStatus))
            .size(4)
            .all();
    }
    catch(err){
        throw new Error(`user_application.app.search error ${err}`);
    }
}
