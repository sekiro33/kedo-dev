/* Client scripts module */
declare const document: any;
declare const console: any;
declare const window: any;

let appsForRender: any[];

async function renderWidget(){
    const itemTemp = document.querySelector('.kedo__staff-docs-table-section-list-item-template');
    const itemsWrapper = document.querySelector('.kedo__staff-docs-table-section-list');
    const loader = document.querySelector('.kedo-loader-wrapper-staff-docs');

    loader.classList.add('kedo-loader-wrapper-staff-docs_active');

    try{
        // await Server.rpc.findDocsArr();
        await findDocsArrClientScript();
    }
    catch(err){
        throw new Error(`findDocsArr error ${err}`);
    }
    logError();

    const host = window.location.host;
    
    if(appsForRender){
        for (let i = 0; i < appsForRender.length; i++){
            const app:any = appsForRender[i];

            if(app){
                const itemEl = itemTemp.content.cloneNode(true);
                let code: string = '';
                let id: string = '';
                let namespc: string = '';
                let docapp:any = undefined;
                let statusCode: string = '';
                let statusText: string = '';
                let user: any = undefined;
                let userNameText : string|undefined = 'Пользователь не указан';
                
                function setStatusCodeName(){
                    if(!app.data.line_status) return;
                    const codeNameArr = app.data.line_status.split(';')

                    statusCode = codeNameArr[0];
                    if(codeNameArr.length > 0){
                        statusText = codeNameArr[1];
                    }

                    statusEl.textContent = statusText;
                }    

                function setStatusStyle(){
                    if(statusCode === 'new'){
                        statusEl.classList.add('kedo__staff-docs-table-string-status_default');
                        return;
                    }
                    if(statusCode === 'agrement'){
                        statusEl.classList.add('kedo__staff-docs-table-string-status_agrement');
                        return;
                    }
                    if(statusCode === 'signing'){
                        statusEl.classList.add('kedo__staff-docs-table-string-status_on-sign');
                        return;
                    }
                    if(statusCode === 'signed'){
                        statusEl.classList.add('kedo__staff-docs-table-string-status_signed');
                        return;
                    }
                    if(statusCode === 'removed'){
                        statusEl.classList.add('kedo__staff-docs-table-string-status_cancel');
                        return;
                    }
                    if(statusCode === ''){
                        return;
                    }
                    statusEl.classList.add('kedo__staff-docs-table-string-status_default');         
                }

                function setDocappData(){
                    if(!app.data){
                        return;
                    }
                    if(!app.data.__sourceRef){
                        return;
                    }
                    
                    if(app.data.__sourceRef.code){
                        code = app.data.__sourceRef.code;
                    }
                    if(app.data.__sourceRef.id){
                        id = app.data.__sourceRef.id;
                    }
                    if(app.data.__sourceRef.namespace){
                        namespc = app.data.__sourceRef.namespace;
                    }
                }

                async function getUser(staffField: any){
                    if(!staffField) return;

                    if(Array.isArray(staffField)){
                        try{
                            user = await staffField[0].fetch();
                        }
                        catch(err){
                            Context.data.error += `staffField[0].fetch() error: ${err}`;
                        }
                    } else if(staffField.fetch){
                        try{
                            user = await staffField.fetch();
                        }
                        catch(err){
                            Context.data.error += `staffField.fetch() error: ${err}`;
                        }
                    }
                }

                if(app){
                    setDocappData();
                }

                // пользователь
                const userEl = itemEl.querySelector('.kedo__staff-docs-table-string-user-name');
                
                // поле staff может быть и типа Один, и типа Несколько
                await getUser(app.data.staff)

                if(user){
                    let firstname = '';
                    let lastname = '';
                    let middlename = '';
                    if(user.data.full_name){
                        firstname = !user.data.full_name.firstname ? '' : user.data.full_name.firstname[0].toUpperCase() + '.';
                        lastname = user.data.full_name.lastname;
                        middlename = !user.data.full_name.middlename ? '' : user.data.full_name.middlename[0].toUpperCase() + '.';
                    }
                    userNameText = `${lastname} ${firstname}${middlename}`
                }
                userEl.textContent = userNameText;
                if(app.data.staff){
                    userEl.href = `./(p:item/kedo/staff/${app.data.staff.id})`
                } else {
                    userEl.classList.add('kedo__staff-docs-table-string-user-name_disabled')
                }
                
                // ответственный
                let responsibleUserText: string = '';

                if(app.data.responsible && typeof app.data.responsible === 'string'){
                    responsibleUserText = app.data.responsible!;
                }

                const reaponsibleNameEl = itemEl.querySelector('.kedo__staff-docs-table-string-responsible');
                
                if(app.data.responsible_user){
                    reaponsibleNameEl.href = `./(p:user/${app.data.responsible_user.id})`
                }  
                reaponsibleNameEl.textContent = responsibleUserText;
                
                // имя файла
                const fileNameEl = itemEl.querySelector('.kedo__staff-docs-table-string-file-name');
                if(app.data.__name){
                    fileNameEl.textContent = app.data.__name;
                } else {
                    fileNameEl.textContent = '';
                }

                // let fileItem: any = undefined;
                let fileTypeText: string = '';
                if(app.data.line_file_name){
                    const fileItemArr = app.data.line_file_name.split('.');
                    if (fileItemArr.length > 1){
                        fileTypeText = fileItemArr[fileItemArr.length - 1];
                    }
                }

                const fileImgEl = itemEl.querySelector('.kedo__staff-docs-table-string-file-name-img');
                if(fileTypeText.includes('doc')){
                    fileImgEl.classList.add('doc-img_doc');
                } else if (fileTypeText.includes('pdf')){
                    fileImgEl.classList.add('doc-img_pdf');
                }

                if(code && id){
                    fileNameEl.href = `./(p:item/${namespc}/${code}/${id})`
                } else {
                    fileNameEl.href = `./`
                    fileNameEl.classList.add('kedo__staff-docs-table-string-file-name_disabled');
                }
                
                
                // статус
                const statusEl = itemEl.querySelector('.kedo__staff-docs-table-string-status');
                
                setStatusCodeName();
                setStatusStyle();
                
                itemsWrapper.append(itemEl);
                
                logError();
            }
        }
    }

    const btnAllDocs = document.querySelector('.kedo__staff-docs-btn-all');
    btnAllDocs.href = `https://${host}/kedo/all_documents`;

    loader.classList.remove('kedo-loader-wrapper-staff-docs_active');
}

async function findDocsArrClientScript(): Promise<void> {
    let kedoDocs: ApplicationItem<Application$kedo$documents_for_employment$Data,Application$kedo$documents_for_employment$Params>[];
    let staffDocs: ApplicationItem<Application$personnel_documents$personnel_documents$Data,Application$personnel_documents$personnel_documents$Params>[];
    let resultObj: any[] = [];
    let resultObjSorted: any[] = [];

    async function getKedoData(){
        try{
            kedoDocs = await Context.fields.application_kedo_documents.app
                .search()
                .where((f) => f.__deletedAt.eq(null))
                .size(4)
                .all();
            resultObj.push(...kedoDocs)
        }
        catch(err){
            Context.data.error = `application_kedo_documents.app.search error ${err}`;
        }
    }

    async function getStaffData(){
        try{
            staffDocs = await Context.fields.app_hr_documents.app
                .search()
                .where((f) => f.__deletedAt.eq(null))
                .size(4)
                .all();
            resultObj.push(...staffDocs)
        }
        catch(err){
            Context.data.error = `app_hr_documents.app.search error ${err}`;
        }
    }

    await Promise.all([await getKedoData(), await getStaffData()])

    resultObjSorted = resultObj.sort((app1: any, app2: any) => {
        return app2.data.__createdAt.ts._d - app1.data.__createdAt.ts._d
    })

    appsForRender = resultObjSorted.slice(0, 4);
    // Context.data.custom_application = resultObjSorted.slice(0, 4);
}



function logError(){
    if(Context.data.error){
        console.error(Context.data.error);
        Context.data.error = ''
    }
}