/* Client scripts module */

declare const console: any;
declare const window: any;
declare const document: any;

interface stringData{
    responsibleUserText: string,
    fileName: string,
    linkNamespace: string,
    linkCode: string,
    linkId: string,
    fileDate: string,
    statusText: string,
    statusCode: string,
    isTask: boolean,
    fileType: string,
    taskDate: string
}

// время обновления страницы, с
const pageRefreshTime = 60;
// максимальное количество пустых итераций получения старых файлов
const maxEmptyIterationsCount = 3;
// объем чанка получения старых файлов, мес
const sizeChunkOfOldFiles = 2;
// количество старых файлов для добавления при прокрутке
const countOfOldDocumentsForRender = 20;


const host = window.location.host;

const currentDate = new Datetime();
const date = new Date()
const currentDay = date.getDate();

const stringHeight = 100; // высота строки для вычисления высоты раздела для документов

let isFirstRender = true;
let isSearchListenersInit = false;
let isTaskPopupOpen = false;
let isChunkOldFilesLoading = false;
let isOldsFilesRendered = false; // определяет необходимость отрисовки старых файлов

let documentsBottomPoint: number = 0;
let userApp: ApplicationItem<Application$kedo$staff$Data,any>;
let stringOfDocsIds:string = '';

let loaderEl: any;
let loaderDocsEl: any;
let kedoDocsWrappper: any;

let wrapperActions: any;
let wrapperDay: any;
let wrapperWeek: any;
let wrapperMonth: any;

let userDocsAppsWeekOlderArrIteration: any[] = [];
let userDocsAppsWeekOlderArrChunk:any = [];

let currentStepOfRenderOldFiles = 0;
let allOldsFilesRendered = false;

let timerCheckFilesDocs:any;
let timerClosePopupDocs:any;

// for search
let userTasksForSearch: ProcessTaskItem[] = [];
let userTasksForSearchFiltered: ProcessTaskItem[] = [];
let userDocsForSearch: any[] = [];
let userDocsForSearchFiltered: any[] = [];
const numberOfUnloadedElements: number = 5000;



async function renderPage(): Promise<void>{
    if(Context.data.handlers_running) return;    
    await onHandlersDocuments();
    if(Context.data.widget_launched) return;

    if(!Context.data.user_application || !Context.data.current_user) {
        showError('Пользователь не найден.');
        return;
    };

    loaderDocsEl = document.querySelector('.kedo-loader-docs-wrapper');
    
    initSearchSection();

    await getAndRenderDocs();    

    Context.data.widget_launched = true;
}

async function getAndRenderDocs(){
    showLoaderDocs();
    await getFilesDataObject();

    sortDataObjByDate();
    getIdsStringOfDocs();
    
    // обнуляем значения
    allOldsFilesRendered = false;
    Context.data.all_documents_received = false;

    await renderDocuments();
    hideLoaderDocs();
}

async function offHandlersDocuments(){
    window.clearInterval(timerCheckFilesDocs);
    window.clearInterval(timerClosePopupDocs);

    contentBody.removeEventListener('scroll', handleWindowScroll);

    Context.data.handlers_running = false;
}

async function onHandlersDocuments(){
    let findBody = window.setInterval(() => {
        contentBody = document.querySelector('app-page-wrapper');
        if (!contentBody) {
            return;
        };
        contentBody.addEventListener('scroll', handleWindowScroll);
        window.clearInterval(findBody);
    }, 500);

    timerCheckFilesDocs = window.setInterval(async() => {
        await checkUpdateFiles();
    }, pageRefreshTime * 1000)
    
    timerClosePopupDocs = window.setInterval(checkTaskPopup, 2000);
    Context.data.handlers_running = true;
    
}

async function addIntervalCheckFiles(){
    timerCheckFilesDocs = window.setInterval(async() => {
        await checkUpdateFiles();
    }, pageRefreshTime * 1000)
}

let searchFilterInput:any;
let searchFilterSelect:any;
// let searchFilterStatusAny:any;
// let searchFilterStatusSigning:any;
// let searchFilterStatusAgrement:any;
// let searchFilterStatusSigned:any;
// let searchFilterStatusNew:any;
// let searchFilterStatusRemoved:any;
let submitBtn:any;
let clearSearchBtn:any;

function initSearchSection() {
    const searchSection = document.querySelector('.kedo-docs-search');
    const searchMainInput = document.querySelector('.kedo-docs-search__form-main-text');
    searchFilterInput = document.querySelector('.kedo-docs-search__form-filter-text');
    searchFilterSelect = document.querySelector('.kedo-docs-search__form-filter-status-select-string');
    // searchFilterStatusAny = document.querySelector('#filterCheckBoxAny');
    // searchFilterStatusSigning = document.querySelector('#filterCheckBoxSigning');
    // searchFilterStatusAgrement = document.querySelector('#filterCheckBoxAgrement');
    // searchFilterStatusSigned = document.querySelector('#filterCheckBoxSigned');
    // searchFilterStatusNew = document.querySelector('#filterCheckBoxNew');
    // searchFilterStatusRemoved = document.querySelector('#filterCheckBoxRemoved');

    submitBtn = document.querySelector('.kedo-docs-search__form-filter-button');
    clearSearchBtn = document.querySelector('.kedo-docs-search__form-main-btn-clear');

    const kedoSearchMainForm = document.querySelector(".kedo-docs-search__form-main");
    const kedoSearchFilterForm = document.querySelector(".kedo-docs-search__form-filter");

    if(Context.data.show_search_in_my_documents === false) {
        searchSection.classList.add('kedo-docs-search_hidden');
    } else {
        searchSection.classList.remove('kedo-docs-search_hidden');
    }

    async function kedoSearchFormSubmitHandler(evt: any) {
        evt.preventDefault();
        
        showLoaderDocs();

        if(kedoSearchFilterForm.classList.contains('kedo-docs-search__form-filter_acitve')){
            // closeSearchFilter();

            await searchByFilterData();
        } else {
            await searchByMainData();
        }

        clearSearchBtn.classList.remove('kedo-docs-search__form-main-btn-clear_hidden');

        // clearSearchForms();
        hideLoaderDocs();
    }    

    const searchFilterForm = document.querySelector(".kedo-docs-search__form-filter");

    function closeSearchFilter(){
        searchFilterForm.classList.remove('kedo-docs-search__form-filter_acitve');
    }

    function clearSearchFilterForms(){
        // searchMainInput.value = '';
        searchFilterInput.value = '';
        // searchFilterStatusAny.checked = false;
        // searchFilterStatusSigning.checked = false;
        // searchFilterStatusAgrement.checked = false;
        // searchFilterStatusSigned.checked = false;
        // searchFilterStatusNew.checked = false;
        // searchFilterStatusRemoved.checked = false;
        Context.data.filter_date_start = undefined;
        Context.data.filter_date_end = undefined;
    }    

    // window click handler
    function searchCloseWindowClickHandler(evt: any){
        // click on button
        if(evt.target.closest('.kedo-docs-search__form-main-button')){
            searchFilterForm.classList.toggle('kedo-docs-search__form-filter_acitve');
            return;
        }
        if(evt.target.closest('.ui-datepicker')){
            return;
        }
        
        // click on window
        if(!evt.target.closest('.kedo-docs-search__form-filter')){
            closeSearchFilter();
        }
    }

    function setConditionsForSearch(){        
        isOldsFilesRendered = false;
        allOldsFilesRendered = false;
        currentStepOfRenderOldFiles = 0;
        wrapperMonth.textContent = '';
    }

    async function searchByFilterData(){
        searchMainInput.value = '';
        await findAllTasksDocsForSearch();
        
        if(searchFilterInput.value){
            await filterSearchDataByString(searchFilterInput.value);
        } else {
            userTasksForSearchFiltered = userTasksForSearch;
            userDocsForSearchFiltered = userDocsForSearch;
        }

        if(Context.data.filter_date_start){
            await filterSearchDataByStartDate(Context.data.filter_date_start);
        }
        if(Context.data.filter_date_end){
            await filterSearchDataByEndDate(Context.data.filter_date_end);
        }

        // if(searchFilterStatusAny.checked === false){
        //     await filterSearchDataByStatuses();
        // }
        if(searchFilterSelect.value !== "any"){
            await filterSearchDataByStatuses();
        }

        await writeToContextSearchData();

        // задаем условия для запуска
        setConditionsForSearch();
        Context.data.all_documents_received = true;

        window.clearInterval(timerCheckFilesDocs);

        await renderDocuments();
    }

    async function searchByMainData(){
        if(!searchMainInput.value) return;
        clearSearchFilterForms();

        await findAllTasksDocsForSearch();
        await filterSearchDataByString(searchMainInput.value);

        await writeToContextSearchData();

        // задаем условия для запуска
        setConditionsForSearch();
        Context.data.all_documents_received = true;

        window.clearInterval(timerCheckFilesDocs);

        await renderDocuments();
    }

    function setIntpusListeners(){
        searchFilterInput.addEventListener('input', onInputHandler);
        searchFilterSelect.addEventListener('change', onInputHandler)
        // searchFilterStatusAny.addEventListener('input', onInputHandler);
        // searchFilterStatusSigning.addEventListener('input', onInputHandler);
        // searchFilterStatusAgrement.addEventListener('input', onInputHandler);
        // searchFilterStatusSigned.addEventListener('input', onInputHandler);
        // searchFilterStatusNew.addEventListener('input', onInputHandler);
        // searchFilterStatusRemoved.addEventListener('input', onInputHandler);
    }

    async function clearSearchBtnClickHandler(){
        clearSearchBtn.classList.add('kedo-docs-search__form-main-btn-clear_hidden');
        setConditionsForSearch();
        stringOfDocsIds = '';
        Context.data.all_documents_received = false;
        
        await getAndRenderDocs();
        await addIntervalCheckFiles();
    }


    if(isSearchListenersInit) return;

    setIntpusListeners()

    kedoSearchMainForm.addEventListener("submit", kedoSearchFormSubmitHandler);
    kedoSearchFilterForm.addEventListener("submit", kedoSearchFormSubmitHandler);
    window.addEventListener('click', searchCloseWindowClickHandler)
    clearSearchBtn.addEventListener('click', clearSearchBtnClickHandler)

    isSearchListenersInit = true;
}

// function setAnyStatus(){
//     searchFilterSelect.value = "any"
    // searchFilterStatusAny.checked = true;
    // searchFilterStatusSigning.checked = false;
    // searchFilterStatusAgrement.checked = false;
    // searchFilterStatusSigned.checked = false;
    // searchFilterStatusNew.checked = false;
    // searchFilterStatusRemoved.checked = false;
// }

function checkIsFilterEmpty(){
    if(
        // searchMainInput.value.length < 2
        searchFilterInput.value.length < 2
        && searchFilterSelect.value === "any"
        // && searchFilterStatusAny.checked === false
        // && searchFilterStatusSigning.checked === false
        // && searchFilterStatusAgrement.checked === false
        // && searchFilterStatusSigned.checked === false
        // && searchFilterStatusNew.checked === false
        // && searchFilterStatusRemoved.checked === false
        && Context.data.filter_date_start === undefined
        && Context.data.filter_date_end === undefined
    ){
        return true;
    }
    return false;
}

function onInputHandler(evt:any){
    const isFilterEmpty = checkIsFilterEmpty();
    if(!isFilterEmpty){
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }

    // if(evt.target.id === 'filterCheckBoxAny'){
    //     setAnyStatus();
    // } else 
    // if (evt.target.closest('.kedo-docs-search__form-filter-status-input')){
    //     searchFilterStatusAny.checked = false;
    // }
}


async function findAllTasksDocsForSearch(){
    Context.data.data_object_tasks = [];
    Context.data.data_object_files = [];
    Context.data.data_object_old_files = [];
    userTasksForSearch = []
    userTasksForSearchFiltered = []
    userDocsForSearch = []
    userDocsForSearchFiltered = []

    try{
        await Promise.all([await getUserTasksForSearch(), await getPersonalDocsForSearch(), await getUserKedoDocsForSearch()]);
    }
    catch(err){
        console.error(`Promise.all([await getUserTasksForSearch(), await getPersonalDocsForSearch(), await getUserKedoDocsForSearch()]) error: ${err}`)
    }
}

async function getUserTasksForSearch(){
    if(!Context.data.current_user) return;

    userTasksForSearch = await System.processes._searchTasks()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.performers.has(Context.data.current_user!),
            g.or(
                f.state.like(ProcessTaskState.inProgress),
                f.state.like(ProcessTaskState.assignment),
            )
        ))
        .size(7000)
        .all()
}

async function getPersonalDocsForSearch(){
    if(!Context.data.user_application) return;
    
    let appSearch =  Context.fields.app_contract_personnel_documents_new.app.search();
    let numberOfAllElements = await appSearch.count();
    const numberOfIterations = Math.ceil(numberOfAllElements / numberOfUnloadedElements);
 
    for (let i = 0; i < numberOfIterations; i++) {
        const firstElementNumber = i * numberOfUnloadedElements;
        const amountOfElements = (i != numberOfIterations - 1) ? numberOfUnloadedElements : (numberOfAllElements - firstElementNumber);
         
        try {
            const items = await appSearch
                .size(amountOfElements)
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.staff.link(Context.data.user_application!)
                ))
                .from(firstElementNumber)
                .all();
 
            userDocsForSearch.push(...items);
        } catch (err) {
            console.error(`getPersonalDocsForSearch error: ${err}`);
            return;
        }
    }
}

async function getUserKedoDocsForSearch(){
    if(!Context.data.user_application) return;
    
    let appSearch =  Context.fields.documents_contract.app.search();
    let numberOfAllElements = await appSearch.count();
    const numberOfIterations = Math.ceil(numberOfAllElements / numberOfUnloadedElements);
 
    for (let i = 0; i < numberOfIterations; i++) {
        const firstElementNumber = i * numberOfUnloadedElements;
        const amountOfElements = (i != numberOfIterations - 1) ? numberOfUnloadedElements : (numberOfAllElements - firstElementNumber);
         
        try {
            const items = await appSearch
                .size(amountOfElements)
                .where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.staff.link(Context.data.user_application!)
                ))
                .from(firstElementNumber)
                .all();
 
            userDocsForSearch.push(...items);
        } catch (err) {
            console.error(`getUserKedoDocsForSearch error: ${err}`);
            return;
        }
    }
}

async function filterSearchDataByString(searchText: string){
    userTasksForSearchFiltered = userTasksForSearch.filter((item) => {
        return item.data.__name.toLocaleUpperCase().includes(searchText.toLocaleUpperCase());
    })
    userDocsForSearchFiltered = userDocsForSearch.filter((item) => {
        return item.data.__name.toLocaleUpperCase().includes(searchText.toLocaleUpperCase());
    })
}

async function filterSearchDataByStartDate(date: TDate){
    userTasksForSearchFiltered = userTasksForSearchFiltered.filter((item) => {
        return date.before(item.data.__createdAt);
    })
    userDocsForSearchFiltered = userDocsForSearch.filter((item) => {
       return date.before(item.data.__createdAt);
    })
}

async function filterSearchDataByEndDate(date: TDate){
    userTasksForSearchFiltered = userTasksForSearchFiltered.filter((item) => {
        return date.after(item.data.__createdAt);
    })
    userDocsForSearchFiltered = userDocsForSearch.filter((item) => {
       return date.after(item.data.__createdAt);
    })
}

async function filterSearchDataByStatuses(){
    function processCheckBoxData(statusCode:string){
        // if(input.checked === true){
        //     isSomeCheckBoxChecked = true;

        //     for(let i = 0; i < userDocsForSearchFiltered.length; i++){
        //         const status = userDocsForSearchFiltered[i].data.line_status.split(';')[0]

        //         if(status === statusCode){
        //             resultDocsObj.push(userDocsForSearchFiltered[i])
        //         }
        //     }
        // }
        for(let i = 0; i < userDocsForSearchFiltered.length; i++){
            const status = userDocsForSearchFiltered[i].data.line_status.split(';')[0]

            if(status === statusCode){
                resultDocsObj.push(userDocsForSearchFiltered[i])
            }
        }
    }

    let resultDocsObj:any[] = []

    // let isSomeCheckBoxChecked = false;

    switch(searchFilterSelect.value){
        case "signing":
            processCheckBoxData('signing');
            break;
        case "agrement":
            processCheckBoxData('agrement');
            break;
        case "signed":
            processCheckBoxData('signed');
            break;
        case "new":
            processCheckBoxData('new');
            break;
        case "removed":
            processCheckBoxData('removed');
            break;
    }

    // processCheckBoxData(searchFilterStatusSigning, 'signing');
    // processCheckBoxData(searchFilterStatusAgrement, 'agrement');
    // processCheckBoxData(searchFilterStatusSigned, 'signed');
    // processCheckBoxData(searchFilterStatusNew, 'new');
    // processCheckBoxData(searchFilterStatusRemoved, 'removed');

    // if(isSomeCheckBoxChecked){
    //     userTasksForSearchFiltered = [];
    //     userDocsForSearchFiltered = resultDocsObj
    // }

    userTasksForSearchFiltered = [];
    userDocsForSearchFiltered = resultDocsObj
}

async function writeToContextSearchData(){
    await Promise.all(userTasksForSearchFiltered.map(async(item) => {
        Context.data.data_object_files.push(await getElementObj(item, true));
    }))
    
    await Promise.all(userDocsForSearchFiltered.map(async(item) => {
        if(currentDate.addDate(0, 0, -7).after(item.data.__createdAt)){
            Context.data.data_object_old_files.push(await getElementObj(item, false));
        } else {
            Context.data.data_object_files.push(await getElementObj(item, false));
        }
        
    }))

    sortDataObjByDate();
    sortOldDataObjByDate();
}


// ==================================================================================================================================
// ==================================================================================================================================
// ==================================================================================================================================


async function renderDocuments() {
    if(!wrapperActions || !kedoDocsWrappper){
        wrapperActions = document.querySelector('.kedo__main-documents-table-section-list_actions');
        wrapperDay = document.querySelector('.kedo__main-documents-table-section-list_today');
        wrapperWeek = document.querySelector('.kedo__main-documents-table-section-list_week');
        wrapperMonth = document.querySelector('.kedo__main-documents-table-section-list_month');
        kedoDocsWrappper = document.querySelector('.kedo__main-documents-files-wrapper');   
    }
    wrapperMonthTop = wrapperMonth.getBoundingClientRect().top;

    wrapperActions.textContent = '';
    wrapperDay.textContent = '';
    wrapperWeek.textContent = '';
    // wrapperMonth.textContent = '';
    
    // рисуем задачи
    if(Context.data.data_object_tasks){
        for(let i = 0; i < Context.data.data_object_tasks.length; i++){
            renderDocumentString(Context.data.data_object_tasks[i])
        };
        if (Context.data.data_object_tasks.length > 0) {

        }
    }

    // рисуем документы
    if(Context.data.data_object_files){
        for(let i = 0; i < Context.data.data_object_files.length; i++){
            renderDocumentString(Context.data.data_object_files[i])
        };
    }    
    
    // рисуем старые документы
    // if(Context.data.data_object_old_files && isFirstRender){
    if(Context.data.data_object_old_files && !isOldsFilesRendered){
        renderStepOfOldFiles();
    }
    isOldsFilesRendered = true;
    
    // стили заголовков секций и раскрывающиеся списки
    setDocswrappersStyles()

    if(!isFirstRender) return;

    // handler opened list 
    setDocsWrapperClickHandler()    

    window.addEventListener('resize', showTasksOrDocsMobile)

    isFirstRender = false;
}

// lazy loading
let contentBody: any;
let timeOut: any;
let wrapperMonthTop:number;

async function handleWindowScroll(){
    window.clearTimeout(timeOut);

    if(allOldsFilesRendered){
        return
    }

    timeOut = window.setTimeout(async() => {
        if(!wrapperMonth.closest('.kedo__main-documents-table-section').classList.contains('kedo__main-documents-table-section_opened')) return;

        documentsBottomPoint = wrapperMonthTop + wrapperMonth.offsetHeight;
        
        if(documentsBottomPoint - contentBody.scrollTop - window.innerHeight < 150){            
            contentBody.scrollBy(0, -100)
            try {
                await renderStepOfOldFiles();                    
            }
            catch(err){
                throw new Error(`renderStepItems error ${err}`);
            }
            contentBody.scrollBy(0, 100);
        }
    }, 200)
    
}


async function renderStepOfOldFiles(){
    if(allOldsFilesRendered) return;

    // TODO - проверить правильность этого условия
    if(isChunkOldFilesLoading) return;

    // отрисовка элементов
    if((currentStepOfRenderOldFiles + 1) * countOfOldDocumentsForRender > Context.data.data_object_old_files.length){
        for(let i = (currentStepOfRenderOldFiles * countOfOldDocumentsForRender); i < Context.data.data_object_old_files.length; i++){
            renderDocumentString(Context.data.data_object_old_files[i])
        }
        if(Context.data.all_documents_received === true){
            allOldsFilesRendered = true;
        }
    } else {
        for(let i = (currentStepOfRenderOldFiles * countOfOldDocumentsForRender); i < (currentStepOfRenderOldFiles + 1) * countOfOldDocumentsForRender; i++){
            renderDocumentString(Context.data.data_object_old_files[i])
        }
    }
    currentStepOfRenderOldFiles++;

    // расширяем контейнер
    if(wrapperMonth.closest('.kedo__main-documents-table-section').classList.contains('kedo__main-documents-table-section_opened')){
        wrapperMonth.style = `max-height: 100%`//${stringHeight * wrapperMonth.children.length}px`;
    }

    if(allOldsFilesRendered) return;

    await checkFilesToRenderCount();
}

async function checkFilesToRenderCount(){
    // проверка количества неотрисованных элементов
    if((Context.data.data_object_old_files.length - currentStepOfRenderOldFiles * countOfOldDocumentsForRender) < countOfOldDocumentsForRender){
        if(isChunkOldFilesLoading === false){
            await getChunkOfOldFilesWrapper();
        }
    }
}

function setDocswrappersStyles(){
    const wrappersArr = document.querySelectorAll('.kedo__main-documents-table-section-list');
    let openedFilesCount: number = 0;
       
    function clearStyleOfSectionNeedAction(){
        for(let i = 0; i < wrappersArr.length; i++){
            const sectionNeedAction = wrappersArr[i].closest('.kedo__main-documents-table-section');
            sectionNeedAction.classList.remove('kedo__main-documents-table-section_empty');
            sectionNeedAction.classList.remove('kedo__main-documents-table-section_opened');
        }        
    }

    clearStyleOfSectionNeedAction();

    // стили секции Требуют действий
    const sectionNeedAction = wrappersArr[0].closest('.kedo__main-documents-table-section');
    const sectionNeedActionHeader = document.querySelector('.kedo__main-documents-table-section-title-wrapper_action')

    if(wrappersArr[0].children.length === 0){        
        sectionNeedAction.classList.add('kedo__main-documents-table-section_empty');
        sectionNeedActionHeader.classList.remove('kedo__main-documents-table-section-title-wrapper_hidden');
    } else {
        sectionNeedAction.classList.add('kedo__main-documents-table-section_opened');
        sectionNeedActionHeader.classList.add('kedo__main-documents-table-section-title-wrapper_hidden');
        openedFilesCount += wrappersArr[0].children.length;
        wrappersArr[0].style = `max-height: 100%`//${stringHeight * wrappersArr[0].children.length}px`;
    }
    
    // стили остальных секций
    for(let i = 1; i < wrappersArr.length; i++){
        if (wrappersArr[i].children.length === 0){
            wrappersArr[i].closest('.kedo__main-documents-table-section').classList.add('kedo__main-documents-table-section_empty');
        } else {
            if(openedFilesCount < 5){
                wrappersArr[i].closest('.kedo__main-documents-table-section').classList.add('kedo__main-documents-table-section_opened');
                openedFilesCount += wrappersArr[i].children.length;
                wrappersArr[i].style = `max-height: 100%`//${stringHeight * wrappersArr[i].children.length}px`;
            }
        }
    }
}

function setDocsWrapperClickHandler(){
    function handleDocsWrapperClick(e: any){
        const section = e.target.closest('.kedo__main-documents-table-section');
        if(!section){
            return;
        }
        if(section.classList.contains('kedo__main-documents-table-section_empty')){
            return;
        }
        if(section.classList.contains('kedo__main-documents-table-section_actions')){
            return;
        }
        if(e.target.closest('.kedo__main-documents-table-section-list')){
            return;
        }
        
        const filesWrapper = section.querySelector('.kedo__main-documents-table-section-list');

        if(section.classList.contains('kedo__main-documents-table-section_opened')){
            filesWrapper.style = `max-height: 0px`;
            section.classList.remove('kedo__main-documents-table-section_opened')
        } else {
            // filesWrapper.style = `max-height: ${stringHeight * filesWrapper.children.length}px`;
            filesWrapper.style = `max-height: 100%`;
            section.classList.add('kedo__main-documents-table-section_opened')
        }
    }

    let docsWrappers = document.querySelectorAll(".kedo__main-documents-table-section:not(.kedo__main-documents-table-section_empty):not(.kedo__main-documents-table-section_actions)");

    docsWrappers.forEach((wrapper: any) => {
        let wrapperTitleArrow = wrapper.querySelector(".kedo__main-documents-table-section-title-wrapper .kedo__main-documents-table-section-title-arrow");
        wrapperTitleArrow.addEventListener("click", (e: any) => {
            handleDocsWrapperClick(e)
        })
    })
    kedoDocsWrappper.addEventListener('click', handleDocsWrapperClick);
}

async function checkTaskPopup(){
    const taskPopup = document.querySelector('body > elma-form > form > elma-complex-popup > div');

    if(taskPopup){
        isTaskPopupOpen = true;
    } else {
        if(isTaskPopupOpen){
            isTaskPopupOpen = false;
            await checkUpdateFiles();
        }
    }
}

async function checkUpdateFiles(){
    const oldIdsStringOfDocs = stringOfDocsIds;
        
    await getFilesDataObjectForUpdate();
    sortDataObjByDate();
    getIdsStringOfDocs();

    if(!stringOfDocsIds) return;
    
    if(oldIdsStringOfDocs !== stringOfDocsIds){
        showLoaderDocs();

        // обнуляем значения
        allOldsFilesRendered = false;
        Context.data.all_documents_received = false;

        await renderDocuments();

        hideLoaderDocs();
    }
}

async function renderDocumentString(data: stringData){
    function setStatusStyle(){
        if(data.statusCode === 'new'){
            statusEl.classList.add('kedo__main-documents-table-string-status_default');
            return;
        }
        if(data.statusCode === 'agrement'){
            statusEl.classList.add('kedo__main-documents-table-string-status_agrement');
            return;
        }
        if(data.statusCode === 'signing'){
            statusEl.classList.add('kedo__main-documents-table-string-status_on-sign');
            return;
        }
        if(data.statusCode === 'signed'){
            statusEl.classList.add('kedo__main-documents-table-string-status_signed');
            return;
        }
        if(data.statusCode === 'removed'){
            statusEl.classList.add('kedo__main-documents-table-string-status_cancel');
            return;
        }
        if(data.statusCode.length > 0){
            statusEl.classList.add('kedo__main-documents-table-string-status_default');      
            // statusEl.textContent = '';
            // return;
        }
    }

    const fileString = document.querySelector('.kedo__main-documents-table-section-list-item-template').content.cloneNode(true);
    let fileName = 'Файл';

    if (data.fileName){
        fileName = data.fileName;
    }     

    const nameWrapperEl = fileString.querySelector('.kedo__main-documents-table-string-file-name-wrapper');
    const imgEl = fileString.querySelector('.kedo__main-documents-table-string-file-name-img');
    const linkEl = fileString.querySelector('.kedo__main-documents-table-string-file-name');
    const dateEl = fileString.querySelector('.kedo__main-documents-table-string-date');
    // const responsibleEl = fileString.querySelector('.kedo__main-documents-table-string-user-name');
    const statusEl = fileString.querySelector('.kedo__main-documents-table-string-status');

    // ellips
    if(data.isTask){
        nameWrapperEl.classList.add('kedo__main-documents-table-string-file-name-wrapper_active');
    }

    // img
    let fileType: string = "";
    if (!data.fileType) {
        let fileNameArr = data.fileName.split(".").slice(-1)[0];
        if (fileNameArr.length > 1) {
            fileType = fileNameArr[fileNameArr.length - 1]
        };
    };
    
    // if(data.fileType.includes("doc") || fileType.includes('doc')){
    //     imgEl.classList.add('doc-img_doc');
    // } else if (data.fileType.includes("pdf") || fileType.includes('pdf')){
    //     imgEl.classList.add('doc-img_pdf');
    // } else {
    //     if (!data.isTask) {
    //         imgEl.classList.add('doc_img-null');
    //     };
    // };
    imgEl.classList.add('doc-img_pdf');

    // link
    linkEl.textContent = fileName;
    if(data.isTask){
        linkEl.href = `https://${host}/_portal/kedo_ext/user_page(p:task/${data.linkId})`
    } else {
        if(data.linkCode && data.linkId && data.linkNamespace){
            linkEl.href = `https://${host}/_portal/kedo_ext/user_page(p:item/${data.linkNamespace}/${data.linkCode}/${data.linkId})`
        } else {
            linkEl.href = `https://${host}/_portal/kedo_ext/user_page`
        }
    }

    // дата создания и текст для отображения
    let fileDay: number|undefined = undefined;
    
    let dateText:string = '';        
    let date: Date|undefined = undefined;
    
    if(data.isTask){
        date = !data.taskDate ? undefined : new Date(data.taskDate);
    } else {
        date = !data.fileDate ? undefined : new Date(data.fileDate);
    }

    if(data.fileDate){
        fileDay = (new Date(data.fileDate)).getDate();
    }
    
    if(date){
        dateText = `${date.toLocaleString('ru-RU', { year:'2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}`;
    }   
    dateEl.textContent = dateText;

    // reponsible        
    let responsiblePerson: string = '';
    if(data.responsibleUserText){
        responsiblePerson = data.responsibleUserText;
    }
    // responsibleEl.textContent = responsiblePerson;

    // status 
    statusEl.textContent = ''
    if(data.statusText){
        statusEl.textContent = data.statusText;
        setStatusStyle();
    } else {
        statusEl.textContent = '';
    }

    // добавление на страницу
    if(data.isTask === true){
        wrapperActions.append(fileString);
        return; 
    }
    
    if(data.fileDate < currentDate.addDate(0, 0, -7).format()){
        wrapperMonth.append(fileString);
        return;
    }
    
    if (Number(fileDay) !== Number(currentDay)){
        wrapperWeek.append(fileString);
        return
    } 
    wrapperDay.append(fileString);
}

function sortDataObjByDate(){
    Context.data.data_object_files = Context.data.data_object_files.sort((obj1: stringData, obj2: stringData) => {
        if (obj2.fileDate > obj1.fileDate) {
            return 1;
        }
        if (obj2.fileDate < obj1.fileDate) {
            return -1;
        }
        return 0;
    });

    Context.data.data_object_tasks = Context.data.data_object_tasks.sort((obj1: stringData, obj2: stringData) => {
        if (obj2.fileDate > obj1.fileDate) {
            return 1;
        }
        if (obj2.fileDate < obj1.fileDate) {
            return -1;
        }
        return 0;
    });
}

function sortOldDataObjByDate(){
    Context.data.data_object_old_files = Context.data.data_object_old_files.sort((obj1: stringData, obj2: stringData) => {
        if (obj2.fileDate > obj1.fileDate) {
            return 1;
        }
        if (obj2.fileDate < obj1.fileDate) {
            return -1;
        }
        return 0;
    });
}

function getIdsStringOfDocs(){
    stringOfDocsIds = '';

    if(Context.data.data_object_tasks){
        for (let i = 0; i < Context.data.data_object_tasks.length; i++){
            stringOfDocsIds += Context.data.data_object_tasks[i].linkId;
            stringOfDocsIds += Context.data.data_object_tasks[i].statusCode;
        }
    }
    if(Context.data.data_object_files){
        for (let i = 0; i < Context.data.data_object_files.length; i++){
            stringOfDocsIds += Context.data.data_object_files[i].linkId;
            stringOfDocsIds += Context.data.data_object_files[i].statusCode;
        }
    }
}


async function getFilesDataObject(): Promise<void> {
    Context.data.data_object_files = [];
    Context.data.data_object_old_files = [];
    Context.data.data_object_tasks = [];
    Context.data.chunk_acquisition_iteration_number = 0;
    Context.data.number_of_empty_iterations = 0;
    // Context.data.all_documents_received = false;

    try{
        await Promise.all([await getUserTasks(), await getPersonalDocs(), await getUserKedoDocs(), await getChunkOfOldFilesWrapper()]);
    }
    catch(err){
        console.error(`Promise.all([await getPersonalDocs(), await getUserKedoDocs()]) error: ${err}`)
    }
}

async function getFilesDataObjectForUpdate(): Promise<void> {
    Context.data.data_object_files = [];
    Context.data.data_object_tasks = [];

    try{
        await Promise.all([await getUserTasks(), await getPersonalDocs(), await getUserKedoDocs()]);
    }
    catch(err){
        console.error(`Promise.all([await getPersonalDocs(), await getUserKedoDocs()]) error: ${err}`)
    }
}

async function getChunkOfOldFilesWrapper(){
    if(isChunkOldFilesLoading) return;

    showLoaderDocs();
    isChunkOldFilesLoading = true;

    userDocsAppsWeekOlderArrChunk = [];
    await getChunkOfOldFiles();
    Context.data.data_object_old_files.push(...userDocsAppsWeekOlderArrChunk);

    isChunkOldFilesLoading = false;
    hideLoaderDocs();
}

async function getChunkOfOldFiles(){
    if(Context.data.all_documents_received === true) return;

    // проверка на максимальное количество пустых итераций
    if(Context.data.number_of_empty_iterations! === maxEmptyIterationsCount){
        Context.data.all_documents_received = true;
        return;
    }
    userDocsAppsWeekOlderArrIteration = [];

    let startDay = 0;
    if(Context.data.chunk_acquisition_iteration_number === 0){
        startDay = -7;
    }

    try{
        await Promise.all([await getChunkOldPersonalDocs(startDay), await getChunkOldUserKedoDocs(startDay)]);
    }
    catch(err){
        console.error(`Promise.all([await getChunkOldPersonalDocs(startDay), await getChunkOldUserKedoDocs(startDay)]) error: ${err}`)
    }
    Context.data.chunk_acquisition_iteration_number!++;

    // userDocsAppsWeekOlderArrIteration = userDocsAppsWeekOlderArrIteration.concat(userDocsAppsWeekOlderArrIteration)
    // userDocsAppsWeekOlderArrIteration = userDocsAppsWeekOlderArrIteration.concat(userDocsAppsWeekOlderArrIteration)
    // userDocsAppsWeekOlderArrIteration = userDocsAppsWeekOlderArrIteration.concat(userDocsAppsWeekOlderArrIteration)
    // userDocsAppsWeekOlderArrIteration = userDocsAppsWeekOlderArrIteration.concat(userDocsAppsWeekOlderArrIteration)
  
    // сортируем массив старых документов по дате создания
    userDocsAppsWeekOlderArrIteration = userDocsAppsWeekOlderArrIteration.sort((obj1: stringData, obj2: stringData) => {
        if (obj2.fileDate > obj1.fileDate) {
            return 1;
        }
        if (obj2.fileDate < obj1.fileDate) {
            return -1;
        }
        return 0;
    });

    userDocsAppsWeekOlderArrChunk.push(...userDocsAppsWeekOlderArrIteration);

    // проверка размера полученного чанка
    if(userDocsAppsWeekOlderArrChunk.length < countOfOldDocumentsForRender){
        Context.data.number_of_empty_iterations!++;
        await getChunkOfOldFiles()
    } else {
        Context.data.number_of_empty_iterations = 0;
    }
}

async function getChunkOldPersonalDocs(startDay: number): Promise<void> {
    let personalDocsAppsArr: ApplicationItem<Application$personnel_documents$personnel_documents$Data, Application$personnel_documents$personnel_documents$Params>[] = [];

    if(!Context.data.user_application) return;

    //@ts-ignore
    personalDocsAppsArr = await Context.fields.app_contract_personnel_documents_new.app
        .search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.user_application!),
            f.__createdAt.lt(currentDate.addDate(0, -(Context.data.chunk_acquisition_iteration_number! * sizeChunkOfOldFiles), startDay)),
            f.__createdAt.gt(currentDate.addDate(0, -((Context.data.chunk_acquisition_iteration_number! + 1) * sizeChunkOfOldFiles), 0))
        ))
        .size(7000)
        .all()

    if(personalDocsAppsArr.length > 0){
        await Promise.all(personalDocsAppsArr.map(async(item) => {
            userDocsAppsWeekOlderArrIteration.push(await getElementObj(item, false));
        }))
    }
}

async function getChunkOldUserKedoDocs(startDay: number): Promise<void> {
    let kedoDocsArr: ApplicationItem<Application$kedo$documents_for_employment$Data, Application$kedo$documents_for_employment$Params>[] = [];

    if(!Context.data.user_application) return;

    kedoDocsArr = await Context.fields.documents_contract.app
        .search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.user_application!),
            f.__createdAt.lt(currentDate.addDate(0, -(Context.data.chunk_acquisition_iteration_number! * sizeChunkOfOldFiles), startDay)),
            f.__createdAt.gt(currentDate.addDate(0, -((Context.data.chunk_acquisition_iteration_number! + 1) * sizeChunkOfOldFiles), 0))
        ))
        .size(7000)
        .all()

    if(kedoDocsArr){
        await Promise.all(kedoDocsArr.map(async(item) => {
            userDocsAppsWeekOlderArrIteration.push(await getElementObj(item, false));
        }))
    }
}

async function getUserTasks(){
    let userTasks: ProcessTaskItem[] = [];

    if(!Context.data.current_user) return;

    userTasks = await System.processes._searchTasks()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.performers.has(Context.data.current_user!),
            g.or(
                f.state.like(ProcessTaskState.inProgress),
                f.state.like(ProcessTaskState.assignment),
            )
        ))
        .size(7000)
        .all()

    if(userTasks.length > 0){
        await Promise.all(userTasks.map(async(item) => {
            Context.data.data_object_tasks.push(await getElementObj(item, true));
        }))
    }
}
 
async function getPersonalDocs(): Promise<void> {
    let personalDocsAppsArr: ApplicationItem<Application$personnel_documents$personnel_documents$Data, Application$personnel_documents$personnel_documents$Params>[] = [];

    if(!Context.data.user_application) return;
    //@ts-ignore
    personalDocsAppsArr = await Context.fields.app_contract_personnel_documents_new.app
        .search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.user_application!),
            f.__createdAt.gt(currentDate.addDate(0, 0, -7))
        ))
        .size(10000)
        .all()
    if(personalDocsAppsArr.length > 0){
        await Promise.all(personalDocsAppsArr.map(async(item) => {
            Context.data.data_object_files.push(await getElementObj(item, false));
        }))
    }
}


async function getUserKedoDocs(): Promise<void> {
    let kedoDocsArr: ApplicationItem<Application$kedo$documents_for_employment$Data, Application$kedo$documents_for_employment$Params>[] = [];

    if(!Context.data.user_application) return;

    kedoDocsArr = await Context.fields.documents_contract.app
        .search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.user_application!),
            f.__createdAt.gt(currentDate.addDate(0, 0, -7))
        ))
        .size(7000)
        .all()

    console.log(kedoDocsArr)

    if(kedoDocsArr){
        await Promise.all(kedoDocsArr.map(async(item) => {
            Context.data.data_object_files.push(await getElementObj(item, false));
        }))
    }
}



async function getElementObj(element: ProcessTaskItem|ApplicationItem<Application$personnel_documents$personnel_documents$Data, Application$personnel_documents$personnel_documents$Params>|ApplicationItem<Application$kedo$documents_for_employment$Data, Application$kedo$documents_for_employment$Params>, isTask: boolean){
    let fileCode: string = '';
    let fileId: string = '';
    let fileNamespace:any =  '';
    let docapp:any = undefined;
    let statusText: string = '';
    let statusCode: string = '';
    let fileType: string = '';
    let fileName: string = '';
    let fileDate: string = '';
    let taskDate: string = '';
    function setStatusCodeName(){
        if(isTask){
            // if(!docapp) return
            // if(!docapp.data.__status) return
            // if(!docapp.data.__status.status) return
            switch (element.data.state) {
                case ProcessTaskState.cancel: 
                    statusCode = "removed";
                    statusText = "Отменена";
                    break;
                case ProcessTaskState.assignment:
                    statusCode = "agrement";
                    statusText = "На распределении";
                    break;
                case ProcessTaskState.closed:
                    statusCode = "signed";
                    statusText = "Выполнена";
                    break;
                case ProcessTaskState.inProgress:
                    statusCode = "agrement";
                    statusText = "В процессе";
                    break;
            };
        } else {
            if(!element.data.line_status) {
                statusCode = "not_implemented";
                statusText = "Не определён";
                return;
            };
            const codeNameArr = element.data.line_status.split(';')

            statusCode = codeNameArr[0];
            if(codeNameArr.length > 1){
                statusText = codeNameArr[1]
            } else {
                switch (true) {
                    case element.data.line_status.toUpperCase().includes("ПОДПИС"):
                        statusCode = "signed";
                        statusText = "Подписан";
                        break;
                    case element.data.line_status.toUpperCase().includes("СОГЛАСОВ"):
                        statusCode = "signed";
                        statusText = "Согласован";
                        break;
                    case element.data.line_status.toUpperCase().includes("НА ПОДПИС"):
                        statusCode = "signing";
                        statusText = "На подписании";
                        break;
                    case element.data.line_status.toUpperCase().includes("НА СОГЛАС"):
                        statusCode = "agrement";
                        statusText = "На согласовании";
                        break;
                }
            }
        }
    }
    function setDocappData(){
        if(!element.data){
            return;
        }
        if(!element.data.__sourceRef){
            return;
        }
        
        if(element.data.__sourceRef.code){
            fileCode = element.data.__sourceRef.code;
        }
        if(element.data.__sourceRef.id){
            fileId = element.data.__sourceRef.id;
        }
        if(element.data.__sourceRef.namespace){
            fileNamespace = element.data.__sourceRef.namespace;
        }
    }

    async function getDocappByItem(){
        let doc: any;
        if(element.data.__item){
            try{
                doc = await element.data.__item.fetch();
            }
            catch(err){
                console.error(`element.data.__item.fetch error: ${err}`)
            }
        }
        
        if(!doc) return;

        if(doc.fields.linked_order && doc.data.linked_order){
            try{
                docapp = await doc.data.linked_order.fetch();
            }
            catch(err){
                console.error(`doc.data.linked_order.fetch error: ${err}`)
            }
        }

        if(!docapp && !!doc){
            docapp = doc;
        }
    }

    // docApp
    if(isTask){
        fileCode = element.code;
        fileNamespace = element.namespace;
        fileId = element.id;
    } else {
        setDocappData();
    }

    if(isTask){
        await getDocappByItem();
    }
    
    if(element && element.data.__name){
        if(isTask && docapp){
            fileName = element.data.__name; 
        } else {
            fileName = element.data.__name;     
        }
    }
    
    if(element && element.data.__createdAt){
        fileDate = element.data.__createdAt.format();
    }
    if(isTask){
        taskDate = !element.data.dueDate ? '' : `${element.data.dueDate.format()}`;
    }
    
    setStatusCodeName();

    // responsible
    let responsibleUserText: string = '';

    if(!isTask){
        if(element.data.responsible && typeof element.data.responsible === 'string'){
            responsibleUserText = element.data.responsible;
        }         
    }

    if(element && element.data.line_file_name){
        fileType = element.data.line_file_name.split('.').slice(-1)[0];

        // if (fileItemArr.length > 1){
        //     fileType = fileItemArr[fileItemArr.length - 1];
        // };
    };

    const stringElement: stringData = {
        responsibleUserText,
        fileName,
        linkNamespace: fileNamespace,
        linkCode: fileCode,
        linkId: fileId,
        fileDate,
        statusText,
        statusCode: statusCode,
        isTask,
        fileType,
        taskDate
    }    

    return stringElement;
}

// ===============================================================================================================
function showLoaderDocs(){
    loaderDocsEl.classList.add("kedo-loader-docs-wrapper_active");
}
function hideLoaderDocs(){
    loaderDocsEl.classList.remove("kedo-loader-docs-wrapper_active");
}

function getShortString(str: string) {
    const stringLength = 60;
    if (str.length < stringLength) return str;

    let resultString = str.slice(0, stringLength)
    const index = resultString.lastIndexOf(' ')
    resultString = resultString.slice(0, index) + '...'

    return resultString;
}

async function showError(text: string){
    hideLoaderDocs();
    kedoDocsWrappper = document.querySelector('.kedo__main-documents-files-wrapper'); 
    kedoDocsWrappper.textContent = text;
    kedoDocsWrappper.style = "color: #323232; font-size: 24px;";
}

let title:any;
let tasksHead:any;
let tasksWrapper:any;
let docsHead:any;
let docsTodayWrapper:any;
let docsWeekWrapper:any;
let docsMonthWrapper:any;

function showDocsAndTasks(){
    title.textContent = 'Мои документы';

    tasksHead.classList.remove('kedo__main-documents-table-head_hidden');
    tasksWrapper.classList.remove('kedo__main-documents-table-section_hidden');

    // docsHead.classList.remove('kedo__main-documents-table-head_hidden')
    docsTodayWrapper.classList.remove('kedo__main-documents-table-section_hidden');
    docsWeekWrapper.classList.remove('kedo__main-documents-table-section_hidden');
    docsMonthWrapper.classList.remove('kedo__main-documents-table-section_hidden');
}

function showTasksOrDocsMobile(){
    title = document.querySelector('.kedo__main-documents-title')
    tasksHead = document.querySelector('.kedo__main-documents-table-head_actions')
    tasksWrapper = document.querySelector('.kedo__main-documents-table-section_actions')
    // docsHead = document.querySelector('.kedo__main-documents-table-head_docs')
    docsTodayWrapper = document.querySelector('.kedo__main-documents-table-section_today')
    docsWeekWrapper = document.querySelector('.kedo__main-documents-table-section_week')
    docsMonthWrapper = document.querySelector('.kedo__main-documents-table-section_month')

    if(window.innerWidth < 998){
        if(Context.data.show_tasks === true){            
            title.textContent = 'Мои задачи';

            tasksHead.classList.add('kedo__main-documents-table-head_hidden');
            tasksWrapper.classList.remove('kedo__main-documents-table-section_hidden');

            // docsHead.classList.add('kedo__main-documents-table-head_hidden');
            docsTodayWrapper.classList.add('kedo__main-documents-table-section_hidden');
            docsWeekWrapper.classList.add('kedo__main-documents-table-section_hidden');
            docsMonthWrapper.classList.add('kedo__main-documents-table-section_hidden');
        }

        if(Context.data.show_documents === true){
            title.textContent = 'Мои документы';

            tasksHead.classList.add('kedo__main-documents-table-head_hidden');
            tasksWrapper.classList.add('kedo__main-documents-table-section_hidden');

            // docsHead.classList.add('kedo__main-documents-table-head_hidden');
            docsTodayWrapper.classList.remove('kedo__main-documents-table-section_hidden');
            docsWeekWrapper.classList.remove('kedo__main-documents-table-section_hidden');
            docsMonthWrapper.classList.remove('kedo__main-documents-table-section_hidden');
        }
    } else {
        showDocsAndTasks();
    }
}
