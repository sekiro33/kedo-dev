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
const pageRefreshTimeTravels = 60;

const host = window.location.host;
const currentDate = new Datetime();

let loaderDocsElTravels: any;
let stringOfDocsIdsTravels:string = '';
let wrapperDocsTravels:any;
let timerCheckFilesTravel:any;
let timerClosePopupTravel:any;


let isTaskPopupOpen = false;


async function renderTravelDocsWidget(){    
    if(Context.data.handlers_running) return;
    onHandlersTravels();

    if(Context.data.widget_launched) return;

    // console.log('renderTravelDocsWidget')

    await getAndRenderDocsTravel();    

    Context.data.widget_launched = true;
}

async function offHandlersTravels(){
    window.clearInterval(timerClosePopupTravel);
    window.clearInterval(timerCheckFilesTravel);

    contentBody.removeEventListener('scroll', handleWindowScrollTravels);
    Context.data.handlers_running = false;
}

async function onHandlersTravels(){
    timerClosePopupTravel = window.setInterval(async() => {
        await checkTaskPopupTravel()
    }, 2000);

    timerCheckFilesTravel = window.setInterval(async() => {
        // console.log('setInterval checkUpdateFiles travel')
        await checkUpdateFilesTravel();
    }, pageRefreshTimeTravels * 1000)

    contentBody.addEventListener('scroll', handleWindowScrollTravels);
    Context.data.handlers_running = true;
}

// async function addIntervalCheckFilesTravel(){
//     timerCheckFiles = window.setInterval(async() => {
//         console.log('window.setInterval travel')
//         await checkUpdateFilesTravel();
//     }, pageRefreshTime * 1000)
// }

async function getAndRenderDocsTravel(){
    loaderDocsElTravels = document.querySelector('.kedo-loader-docs-travel-wrapper');
    
    showLoaderDocsTravel();
    await getFilesDataObjectTravel();

    sortDataObjByDateTravel();
    getIdsStringOfDocsTravel();
    
    await renderDocumentsTravel();
    hideLoaderDocsTravel();
}


async function getFilesDataObjectTravel(): Promise<void> {
    Context.data.data_object_files = [];
    if(!Context.data.user_application) return;

    let personalDocsAppsArr: any[] = [];

    // personalDocsAppsArr = await getTripsApi();

    personalDocsAppsArr = await Context.fields.business_trip_contract.app
        .search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            g.or(
                f.traveling_users.has(Context.data.current_user!),
                f.kedo_staff.link(Context.data.user_application!)
            ),
            f.__createdAt.gt(currentDate.addDate(-1, 0, 0))
        ))
        .size(8000)
        .all()

    if(personalDocsAppsArr.length > 0){
        await Promise.all(personalDocsAppsArr.map(async(item) => {
            Context.data.data_object_files.push(await getElementObjTravel(item));
        }))
    }
    
    // console.log('Context.data.data_object_files')
    // console.log(Context.data.data_object_files)
}

async function renderDocumentsTravel() {
    // console.log('renderDocuments')

    wrapperDocsTravels = document.querySelector('.kedo__travel-docs-table-section-list');
    wrapperDocsTopTravels = wrapperDocsTravels.getBoundingClientRect().top;

    wrapperDocsTravels.textContent = '';
    
    // рисуем документы
    if(Context.data.data_object_files){
        if(Context.data.data_object_files.length <= 10){
            for(let i = 0; i < Context.data.data_object_files.length; i++){
                renderDocumentStringTravel(Context.data.data_object_files[i])
            };
            allTravelsFilesRendered = true;
        } else {
            for(let i = 0; i < 10; i++){
                renderDocumentStringTravel(Context.data.data_object_files[i])
            };
        }
    }
}


// lazy loading
let contentBody = document.querySelector('app-page-wrapper');
let timeOutScrollTravels: any;
let documentsBottomPoint: number;
let wrapperDocsTopTravels: number;
let allTravelsFilesRendered = false;

async function handleWindowScrollTravels(){
    window.clearTimeout(timeOutScrollTravels);

    if(allTravelsFilesRendered){
        return
    }

    timeOutScrollTravels = window.setTimeout(async() => {
        documentsBottomPoint = wrapperDocsTopTravels + wrapperDocsTravels.offsetHeight;
        
        if(documentsBottomPoint - contentBody.scrollTop - window.innerHeight < 150){
            // console.log('must be render new step')
            
            contentBody.scrollBy(0, -100)
            try {
                await renderAllTravelsFiles();                    
            }
            catch(err){
                throw new Error(`renderStepItems error ${err}`);
            }
            contentBody.scrollBy(0, 100);
        }
    }, 200)
    
}

async function renderAllTravelsFiles(){
    if(Context.data.data_object_files){
        for(let i = 10; i < Context.data.data_object_files.length; i++){
            renderDocumentStringTravel(Context.data.data_object_files[i])
        };
    }
    allTravelsFilesRendered = true;
}


async function checkTaskPopupTravel(){
    const taskPopup = document.querySelector('body > elma-form > form > elma-complex-popup > div');

    if(taskPopup){
        if(!isTaskPopupOpen){
            isTaskPopupOpen = true;
            tasksCount = await checkTasksCount();
        }
    } else {
        if(isTaskPopupOpen){
            isTaskPopupOpen = false;
            await checkUpdateFilesTravel();
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


async function checkUpdateFilesTravel(){
    const oldIdsStringOfDocs = stringOfDocsIdsTravels;
        
    await getFilesDataObjectTravel();
    sortDataObjByDateTravel();
    getIdsStringOfDocsTravel();

    if(!stringOfDocsIdsTravels) return;
    
    if(oldIdsStringOfDocs !== stringOfDocsIdsTravels){
        showLoaderDocsTravel();

        // обнуляем значения

        await renderDocumentsTravel();

        hideLoaderDocsTravel();
    }
}


async function renderDocumentStringTravel(data: stringData){    
    function setStatusStyle(){
        if(data.statusCode === 'new'){
            statusEl.classList.add('kedo__travel-docs-table-string-status_default');
            return;
        }
        if(data.statusCode === 'agrement'){
            statusEl.classList.add('kedo__travel-docs-table-string-status_agrement');
            return;
        }
        if(data.statusCode === 'signing'){
            statusEl.classList.add('kedo__travel-docs-table-string-status_on-sign');
            return;
        }
        if(data.statusCode === 'signed'){
            statusEl.classList.add('kedo__travel-docs-table-string-status_signed');
            return;
        }
        if(data.statusCode === 'removed'){
            statusEl.classList.add('kedo__travel-docs-table-string-status_cancel');
            return;
        }
        if(data.statusCode.length > 0){
            statusEl.classList.add('kedo__travel-docs-table-string-status_default');      
            // statusEl.textContent = '';
            // return;
        }
    }
    console.log(data)
    const fileString = document.querySelector('.kedo__travel-docs-table-section-list-item-template').content.cloneNode(true);
    let fileName = 'Файл';

    if (data.fileName){
        fileName = data.fileName;
    }     

    const nameWrapperEl = fileString.querySelector('.kedo__travel-docs-table-string-file-name-wrapper');
    const imgEl = fileString.querySelector('.kedo__travel-docs-table-string-file-name-img');
    const linkEl = fileString.querySelector('.kedo__travel-docs-table-string-file-name');
    const dateStartEl = fileString.querySelector('.kedo__travel-docs-table-string-date_begin');
    const dateEndEl = fileString.querySelector('.kedo__travel-docs-table-string-date_end');
    const statusEl = fileString.querySelector('.kedo__travel-docs-table-string-status');

    linkEl.textContent = fileName;

    // img
    // if(data.fileType.includes('doc')){
    //     imgEl.classList.add('doc-img_doc');
    // } else if (data.fileType.includes('pdf')){
    //     imgEl.classList.add('doc-img_pdf');
    // }
    imgEl.classList.add('doc-img_pdf');
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
        dateStartText = `${dateStart.toLocaleString('ru-RU', { year:'2-digit', month: 'numeric', day: 'numeric' })}`;
    }   
    if(dateEnd){
        dateEndText = `${dateEnd.toLocaleString('ru-RU', { year:'2-digit', month: 'numeric', day: 'numeric' })}`;
    }   
    dateStartEl.textContent = dateStartText;
    dateEndEl.textContent = dateEndText;

    // status 
    statusEl.textContent = ''
    if(data.statusText){
        statusEl.textContent = data.statusText;
        setStatusStyle();
    } else {
        statusEl.textContent = '';
    }

    wrapperDocsTravels.append(fileString);
}

async function getElementObjTravel(element: any){
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
    
    function setStatusCodeName(){

        const codeNameArr = element.data.status.split(";")

        if(codeNameArr.length > 0){
            statusText = codeNameArr[0]
        }

        // new - серый
        // agrement - желтый
        // signing - синий
        // signed - зеленый
        // removed - красынй
        // переводим оригинальный статус в статус для отрисовки
        switch(statusText){
            case "in-prepare":
            // statusCode = `in-prepare`;
            statusCode = `signing`;
            statusText = `Заполнение`;
            break;
            
            case "agrement":
            // statusCode = `on-approval`;
            statusCode = `agrement`;
            statusText = `На согласовании`;
            break;

            case "signed":
            // statusCode = `approved`;
            statusCode = `agrement`;
            statusText = `Согласовано`;
            break;

            case "asking-money":
            // statusCode = `asking-money`;
            statusCode = `agrement`;
            statusText = `Запрос денежных средств`;
            break;

            case "reciving-money":
            // statusCode = `reciving-money`;
            statusCode = `agrement`;
            statusText = `Получение денежных средств`;
            break;

            case "money-is-recived":
            // statusCode = `money-is-recived`;
            statusCode = `agrement`;
            statusText = `Денежные средства выданы`;
            break;

            case "in-progress":
            // statusCode = `in-progress`;
            statusCode = `signing`;
            statusText = `В командировке`;
            break;

            case "report":
            // statusCode = `report`;
            statusCode = `signing`;
            statusText = `Подготовка отчета`;
            break;

            case "completed":
            // statusCode = `completed`;
            statusCode = `signed`;
            statusText = `Завершена`;
            break;

            case "canceled":
            // statusCode = `canceled`;
            statusCode = `removed`;
            statusText = `Отклонено`;
            break;

            default:
            statusCode = codeNameArr[0];
            statusText = codeNameArr[1];
            break;
        }
    }

    function setDocappData(){
        if(!element.data){
            return;
        }
        
        if(element.code){
            fileCode = element.code;
        }
        if(element.data.__id){
            fileId = element.data.__id;
        }
        if(element.namespace){
            fileNamespace = element.namespace;
        }
        // fileNamespace = `business_trips`;
        // fileCode = `businesstrip_requests`;
        // fileId = element["__id"]
    }

    // docApp
    setDocappData();

    // await getDocapp();
 
    if(element.data["__name"]){
        fileName = element.data["__name"];
    }
    if(element.data["start_date"]){
        fileDateStart = element.data["start_date"].format();
    }
    if(element.data["end_date"]){
        fileDateEnd = element.data["end_date"].format();
    }
    
    setStatusCodeName();

    if(element && element.data.__name){
        const fileItemArr = element.data.__name.split('.');
        if (fileItemArr.length > 1){
            fileType = fileItemArr[fileItemArr.length - 1];
        }
    }

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
function showLoaderDocsTravel(){
    loaderDocsElTravels.classList.add("kedo-loader-docs-travel-wrapper_active");
}
function hideLoaderDocsTravel(){
    loaderDocsElTravels.classList.remove("kedo-loader-docs-travel-wrapper_active");
}


function sortDataObjByDateTravel(){
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


function getIdsStringOfDocsTravel(){
    stringOfDocsIdsTravels = '';

    if(Context.data.data_object_files){
        for (let i = 0; i < Context.data.data_object_files.length; i++){
            stringOfDocsIdsTravels += Context.data.data_object_files[i].linkId;
            stringOfDocsIdsTravels += Context.data.data_object_files[i].statusCode;
        }
    }
}


function logErrorTravel(){
    if(Context.data.error){
        console.error(Context.data.error)
    }

    Context.data.error = '';
}


// async function getTripsApi(){
//     let personalDocsAppsArr: any[] = [];

//     Context.data.request_url = `https://${host}/pub/v1/app/business_trips/businesstrip_requests/list`

//     if(!Context.data.token){
//         console.error(`Error: token not found`);
//     } else {
//         await Server.rpc.getTripsApi();
//         personalDocsAppsArr = JSON.parse(Context.data.response!)
//     }
    
//     return personalDocsAppsArr;
// }

