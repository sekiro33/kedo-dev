/* Client scripts module */

declare const console: any;
declare const window: any;
declare const document: any;

interface stringData{
    fileName: string,
    linkNamespace: string,
    linkCode: string,
    linkId: string,
    fileType: string,
    fileDateStart: string,
    fileDateEnd: string,
    statusText: string,
    statusCode: string
}

// время обновления страницы, с
const pageRefreshTimeVacations = 60;

const host = window.location.host;
const currentDate = new Datetime();

let loaderDocsElVacations: any;
let stringOfDocsIdsVacations:string = '';
let wrapperDocsVacations:any;
let timerCheckFilesVacations:any;
let timerClosePopupVacations:any;


let isTaskPopupOpen = false;


async function renderVacationDocsWidget(){
    if(Context.data.handlers_running) return;
    onHandlersVacations();

    if(Context.data.widget_launched) return;

    await getAndRenderDocsVacations();    

    Context.data.widget_launched = true;
}

async function offHandlersVacations(){
    window.clearInterval(timerClosePopupVacations);
    window.clearInterval(timerCheckFilesVacations);

    contentBody.removeEventListener('scroll', handleWindowScrollVacations);
    Context.data.handlers_running = false;
}

async function onHandlersVacations(){
    timerClosePopupVacations = window.setInterval(async() => {
        await checkTaskPopupVacations();
    }, 2000);

    timerCheckFilesVacations = window.setInterval(async() => {
        await checkUpdateFilesVacations();
    }, pageRefreshTimeVacations * 1000)

    contentBody.addEventListener('scroll', handleWindowScrollVacations);
    Context.data.handlers_running = true;
}

async function getAndRenderDocsVacations(){
    loaderDocsElVacations = document.querySelector('.kedo-loader-docs-vacation-wrapper');
    
    showLoaderDocsVacations();
    await getFilesDataObjectVacations();

    sortDataObjByDateVacations();
    getIdsStringOfDocsVacations();
    
    await renderDocumentsVacations();
    hideLoaderDocsVacations();
}


async function getFilesDataObjectVacations(): Promise<void> {
    Context.data.data_object_files = [];
    if(!Context.data.user_application) return;

    // personalDocsAppsArr = await getVacationsApi()

    let personalDocsAppsArr = await Context.fields.vacation_contract.app
        .search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff_user.eq(Context.data.current_user!)
            // f.end.lte(new TDate()),
        ))
        .size(8000)
        .all()

    

    personalDocsAppsArr.filter((doc) => {
        let status = doc.data.status;

        if (!!status) {
            return !status!.includes("cancelled");
        };
        return true;
    })

    console.log("vacations list: ", personalDocsAppsArr)

    if(personalDocsAppsArr.length > 0){
        await Promise.all(personalDocsAppsArr.map(async(item) => {
            Context.data.data_object_files.push(await getElementObjVacations(item));
        }))
    }
}

async function renderDocumentsVacations() {
    wrapperDocsVacations = document.querySelector('.kedo__vacation-docs-table-section-list');
    wrapperDocsTopVacations = wrapperDocsVacations.getBoundingClientRect().top;

    wrapperDocsVacations.textContent = '';
    
    // рисуем документы
    if(Context.data.data_object_files){
        if(Context.data.data_object_files.length <= 10){
            for(let i = 0; i < Context.data.data_object_files.length; i++){
                renderDocumentStringVacations(Context.data.data_object_files[i])
            };
            allVacationFilesRendered = true;
        } else {
            for(let i = 0; i < 10; i++){
                renderDocumentStringVacations(Context.data.data_object_files[i])
            };
        }
    }
}

// lazy loading
let contentBody = document.querySelector('app-page-wrapper');
let timeOutScrollVacation: any;
let documentsBottomPoint: number;
let wrapperDocsTopVacations: number;
let allVacationFilesRendered = false;

async function handleWindowScrollVacations(){
    window.clearTimeout(timeOutScrollVacation);

    if(allVacationFilesRendered){
        return
    }

    timeOutScrollVacation = window.setTimeout(async() => {
        documentsBottomPoint = wrapperDocsTopVacations + wrapperDocsVacations.offsetHeight;
        
        if(documentsBottomPoint - contentBody.scrollTop - window.innerHeight < 150){
            contentBody.scrollBy(0, -100)
            try {
                await renderAllVacationFiles();                    
            }
            catch(err){
                throw new Error(`renderStepItems error ${err}`);
            }
            contentBody.scrollBy(0, 100);
        }
    }, 200)
    
}

async function renderAllVacationFiles(){
    if(Context.data.data_object_files){
        for(let i = 10; i < Context.data.data_object_files.length; i++){
            renderDocumentStringVacations(Context.data.data_object_files[i])
        };
    }
    allVacationFilesRendered = true;
}


async function checkTaskPopupVacations(){
    const taskPopup = document.querySelector('body > elma-form > form > elma-complex-popup > div');

    if(taskPopup){
        if(!isTaskPopupOpen){
            isTaskPopupOpen = true;
            tasksCount = await checkTasksCount();
        }
    } else {
        if(isTaskPopupOpen){
            isTaskPopupOpen = false;
            await checkUpdateFilesVacations();
            await checkAndShowUserTask()
        }
    }
}

let tasksCount = 0;

async function checkTasksCount(){
    const tasks = await System.processes
        ._searchTasks()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.performers.has(Context.data.current_user!),
            g.or(
                f.state.like(ProcessTaskState.inProgress),
                f.state.like(ProcessTaskState.assignment),
            )
        ))
        .count()

    return tasks;
}

async function checkAndShowUserTask(){
    let iterationNumber = 0;
    let newTasksCount = 0;
    let interval: any;

    function showTask(taskId: string){
        const linkElement = document.createElement('a');
        const linkString = `https://${host}/_portal/kedo_ext/user_page(p:task/${taskId})`
        linkElement.href = linkString;
        document.body.append(linkElement)

        linkElement.click();
        linkElement.remove();
    }

    async function showUserTask(){
        const tasks = await System.processes
            ._searchTasks()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.performers.has(Context.data.current_user!),
                g.or(
                    f.state.like(ProcessTaskState.inProgress),
                    f.state.like(ProcessTaskState.assignment),
                )
            ))
            .size(newTasksCount - tasksCount)
            .all()

        for(let i = 0; i < tasks.length; i++){
            if(tasks[i].data.__createdBy.id === Context.data.current_user!.id){
                window.clearInterval(interval);
                showTask(tasks[i].id);
            }
        }
    }
    
    interval = window.setInterval(async () => {
        if(iterationNumber > 2){
            window.clearInterval(interval);
            return;
        }
        iterationNumber++;

        newTasksCount = await checkTasksCount();

        if(newTasksCount > tasksCount){
            await showUserTask();
        }

    }, 5000) 
}


async function checkUpdateFilesVacations(){
    const oldIdsStringOfDocs = stringOfDocsIdsVacations;
        
    await getFilesDataObjectVacations();
    sortDataObjByDateVacations();
    getIdsStringOfDocsVacations();

    if(!stringOfDocsIdsVacations) return;
    
    if(oldIdsStringOfDocs !== stringOfDocsIdsVacations){
        showLoaderDocsVacations();

        await renderDocumentsVacations();

        hideLoaderDocsVacations();
    }
}


async function renderDocumentStringVacations(data: stringData){
    function setStatusStyle(){
        if(data.statusCode === 'new'){
            statusEl.classList.add('kedo__vacation-docs-table-string-status_default');
            return;
        }
        if(data.statusCode === 'ongoing'){
            statusEl.classList.add('kedo__vacation-docs-table-string-status_signed');
            return;
        }
        if(data.statusCode === 'finished'){
            statusEl.classList.add('kedo__vacation-docs-table-string-status_signed');
            return;
        }
        if(data.statusCode === 'transfer'){
            statusEl.classList.add('kedo__vacation-docs-table-string-status_agrement');
            return;
        }
        if(data.statusCode === 'agrement'){
            statusEl.classList.add('kedo__vacation-docs-table-string-status_agrement');
            return;
        }
        if(data.statusCode === 'signing'){
            statusEl.classList.add('kedo__vacation-docs-table-string-status_on-sign');
            return;
        }
        if(data.statusCode === 'signed'){
            statusEl.classList.add('kedo__vacation-docs-table-string-status_signed');
            return;
        }
        if(data.statusCode === 'removed'){
            statusEl.classList.add('kedo__vacation-docs-table-string-status_cancel');
            return;
        }
        if(data.statusCode.length > 0){
            statusEl.classList.add('kedo__vacation-docs-table-string-status_default');      
            // statusEl.textContent = '';
            // return;
        }
    }

    const fileString = document.querySelector('.kedo__vacation-docs-table-section-list-item-template').content.cloneNode(true);
    let fileName = 'Файл';

    if (data.fileName){
        fileName = data.fileName;
    }     

    // const nameWrapperEl = fileString.querySelector('.kedo__vacation-docs-table-string-file-name-wrapper');
    const imgEl = fileString.querySelector('.kedo__vacation-docs-table-string-file-name-img');
    const linkEl = fileString.querySelector('.kedo__vacation-docs-table-string-file-name');
    const dateStartEl = fileString.querySelector('.kedo__vacation-docs-table-string-date_begin');
    const dateEndEl = fileString.querySelector('.kedo__vacation-docs-table-string-date_end');
    const statusEl = fileString.querySelector('.kedo__vacation-docs-table-string-status');

    linkEl.textContent = fileName;

    // img
    if(data.fileType.includes('doc')){
        imgEl.classList.add('doc-img_doc');
    } else if (data.fileType.includes('pdf')){
        imgEl.classList.add('doc-img_pdf');
    }

    // link
    if(data.linkCode && data.linkId && data.linkNamespace){
        linkEl.href = `https://${host}/_portal/kedo_ext/user_page(p:item/${data.linkNamespace}/${data.linkCode}/${data.linkId})`
    } else {
        linkEl.href = `https://${host}/_portal/kedo_ext/user_page`
    }
    
    let dateStartText:string = '';        
    let dateEndText:string = '';        
    let dateStart: Date|undefined = undefined;
    let dateEnd: Date|undefined = undefined;
    
    dateStart = !data.fileDateStart ? undefined : new Date(data.fileDateStart);
    dateEnd = !data.fileDateEnd ? undefined : new Date(data.fileDateEnd);
    
    if(dateStart){
        dateStartText = `${dateStart.toLocaleString('ru-RU', { year:'2-digit', month: 'numeric', day: 'numeric'})}`;
    }   
    if(dateEnd){
        // dateEndText = `${dateEnd.toLocaleString('ru-RU', { year:'2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}`;
        dateEndText = `${dateEnd.toLocaleString('ru-RU', { year:'2-digit', month: 'numeric', day: 'numeric'})}`;
    }   
    dateStartEl.textContent = data.fileDateStart;
    dateEndEl.textContent = data.fileDateEnd;

    // status 
    statusEl.textContent = ''
    if(data.statusText){
        statusEl.textContent = data.statusText;
        setStatusStyle();
    } else {
        statusEl.textContent = '';
    }

    wrapperDocsVacations.append(fileString);
}

async function getElementObjVacations(element: any){
    let fileCode: string = '';
    let fileId: string = '';
    let fileNamespace:any =  '';
    let docapp:any = undefined;
    let statusText: string = '';
    let statusCode: string = '';
    let fileType: string = '';
    let fileName: string = '';
    let fileDateStart: string = '';
    let fileDateEnd: string = '';
    console.log(element)
    function setStatusCodeName(){
        if(!element.data.status) return;
        statusText = element.data.status.split(";")[0];
        
        // new - серый
        // agrement - желтый
        // signing - синий
        // signed - зеленый
        // removed - красынй
        // переводим оригинальный статус в статус для отрисовки

        switch(statusText){
            case "new":
            statusText = "Новый"
            statusCode = `new`;
            break;

            case `agrement`:
            statusText = "На согласовании"
            statusCode = `agrement`;
            break;

            case `signing`:
            statusText = "На подписании"
            statusCode = `signing`;
            break;

            case `signed`:
            statusText = "Подписан"
            statusCode = `signed`;
            break;

            case 'ongoing':
            statusText = 'В процессе';
            statusCode = 'ongoing';
            break;

            case 'transfer':
            statusText = 'Перенос';
            statusCode = 'transfer';
            break;

            case `correction`:
            statusText = "На корректировке"
            statusCode = `agrement`;
            break;

            case `cancelled`:
            statusText = "Отменён"
            statusCode = `removed`;
            break;

            default:
            statusCode = `new`;
            statusText = `Не определен`;
            break;
        }
    }

    function setDocappData(){
        // if(!element.data){
        //     return;
        // }
        // if(!element.data){
        //     return;
        // }
        
        if(element.data.__sourceRef.code){
            fileCode = element.data.__sourceRef.code;
        }
        if(element.data.__sourceRef.id){
            fileId = element.data.__sourceRef.id || element.id;
        }
        if(element.data.__sourceRef.namespace){
            fileNamespace = element.data.__sourceRef.namespace || element.namespace;
        }

        // fileNamespace = `absences`;
        // fileCode = `vacations`;
        // fileId = element["__id"]
    }

    // docApp
    setDocappData();

    // await getDocapp();
    
    if(element.data["__name"]){
        fileName = element.data["__name"];
    }
    
    if(element.data["start_string"]){
        fileDateStart = element.data["start_string"];
    }
    if(element.data["end_string"]){
        fileDateEnd = element.data["end_string"];
    }
    
    setStatusCodeName();

    // if(element && element.data.line_file_name){
    //     const fileItemArr = element.data.line_file_name.split('.');
    //     if (fileItemArr.length > 1){
    //         fileType = fileItemArr[fileItemArr.length - 1];
    //     }
    // }

    const stringElement: stringData = {
        fileName,
        linkNamespace: fileNamespace,
        linkCode: fileCode,
        linkId: fileId,
        fileType,
        fileDateStart,
        fileDateEnd,
        statusText,
        statusCode: statusCode,
    }    

    return stringElement;
}


// ===========================================================================================================
function showLoaderDocsVacations(){
    if(!loaderDocsElVacations) return;
    loaderDocsElVacations.classList.add("kedo-loader-docs-vacation-wrapper_active");
}
function hideLoaderDocsVacations(){
    if(!loaderDocsElVacations) return;
    loaderDocsElVacations.classList.remove("kedo-loader-docs-vacation-wrapper_active");
}


function sortDataObjByDateVacations(){
    Context.data.data_object_files = Context.data.data_object_files.sort((obj1: stringData, obj2: stringData) => {
        if (obj2.fileDateStart > obj1.fileDateStart) {
            return 1;
        }
        if (obj2.fileDateStart < obj1.fileDateStart) {
            return -1;
        }
        return 0;
    });
}


function getIdsStringOfDocsVacations(){
    stringOfDocsIdsVacations = '';

    if(Context.data.data_object_files){
        for (let i = 0; i < Context.data.data_object_files.length; i++){
            stringOfDocsIdsVacations += Context.data.data_object_files[i].linkId;
            stringOfDocsIdsVacations += Context.data.data_object_files[i].statusCode;
        }
    }
}


function logErrorVacations(){
    if(Context.data.error){
        console.error(Context.data.error)
    }

    Context.data.error = '';
}

// async function getVacationsApi(){
//     let personalDocsAppsArr: any[] = [];
//     Context.data.request_url =  `https://${host}/pub/v1/app/absences/vacations/list`
//     if(!Context.data.token){
//         console.error(`Error: token not found`);
//     } else {
//         await Server.rpc.getVacationsApi()
//         personalDocsAppsArr = JSON.parse(Context.data.response!)
//     }
   
    
//     return personalDocsAppsArr;
// }
