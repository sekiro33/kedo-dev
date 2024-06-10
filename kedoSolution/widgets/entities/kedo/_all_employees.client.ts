/* Client scripts module */
declare const document: any;
declare const console: any;
declare const window: any;

let chunkDataArray:any[];
let allUsers: any[] = []
let allTasks: ProcessTaskItem[]
let processesError: ProcessInstanceItem[]
let externalUsers: ApplicationItem<Application$_system_catalogs$_user_profiles$Data, any>[] = [];

interface stringData{
    staffNameText: string,
    staffId: string,
    staffDate: string,
    lastUpdateDate: TDatetime,
    statusText: string,
    statusCode: string,
    userId: string
}

let isScrollListenerAdded = false;
const host = window.location.host;

let itemTemp: any;
let itemsWrapper: any;
let loader: any;

let adminUsers: UserItem[] = [];
let currentUser: CurrentUserItem;

let isUserAdmin = false;

async function getAdminUsers(){
    const groupsAdmin = await System.userGroups
        .search()
        .where((f, g) => g.or(
            f.code.eq("administrators"),
            f.code.eq("supervisor")
        ))
        .all();

    if(!groupsAdmin) return;

    for(let i = 0; i < groupsAdmin.length; i++){
        const users = await groupsAdmin[i].users();
        adminUsers.push(...users)
    }
}
async function getCurrentUser(){
    currentUser = await System.users.getCurrentUser()
}

async function getAllUsers(){
    allUsers = await System.users.search().size(10000).all()
    externalUsers = await Context.fields.external_user.app.search().where(i => i.__deletedAt.eq(null)).all();
}

async function getProcessInstances(){
    processesError = await Namespace.app.staff.processes.Employment
        ._searchInstances()
        .where((f, g) => g.or(
            f.__state.like(ProcessInstanceState.error),
            f.__state.like(ProcessInstanceState.cancel)
        ))
        .size(10000)
        .all()
}

async function getAppsArr(){
    try{
        await findUserArrClientScript();
        // await Server.rpc.findUserArr();
    }
    catch(err){
        throw new Error(`findUserArr error ${err}`);
    }
}

async function renderItems(){ 
    if (chunkDataArray.length === 0) {
        hideLoader()
        Context.data.view_message = true;
        return
    }

    showLoader();

    // for(let i = 0; i < Context.data.chunk_data_array.length; i++){
    for(let i = 0; i < chunkDataArray.length; i++){
        const app : stringData = chunkDataArray[i]
        // const app : stringData = Context.data.chunk_data_array[i]
        const itemEl = itemTemp.content.cloneNode(true);

        //continue if the process was dial for 5 or more days
        const currentDate: TDatetime = new Datetime()
        // if (app.lastUpdateDate.before(currentDate.addDate(0, 0, -5))) {
        //     console.log("skip")
        //     continue;
        // }

        // staff
        const userName = itemEl.querySelector('.kedo__employment-table-string-user-name');
        userName.textContent = !app.staffNameText ? 'Имя не определено' : app.staffNameText;
        if(app.staffId){
            userName.href = `https://${host}/kedo/staff(p:item/kedo/staff/${app.staffId})`
        } else {
            userName.href = `./`
        }

        // date
        const dateEl = itemEl.querySelector('.kedo__employment-table-string-date');
        if(app.staffDate){
            const date = new Date(app.staffDate);

            dateEl.textContent = `${date.toLocaleString('ru-RU', { year:'2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}`;
        } else {
            dateEl.textContent = `Дата не определена`;
        }

        // status
        const statusText = itemEl.querySelector('.kedo__employment-table-string-status-text');
        const statusImg = itemEl.querySelector('.kedo__employment-table-string-status-img');

        statusText.textContent = !app.statusText ? 'Статус не определен' : app.statusText;

        if(app.statusText && app.statusCode){
            switch(app.statusCode){
                case 'invited':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_0-4');
                    break;
                case 'filling_pnd':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_0-4');
                    break;

                case 'input_data':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_1-4');
                    break;
                case 'editing_pnd':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_1-4');
                    break;                       

                case 'acquaintance_with_the_agreement':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_2-4');
                    break;                        
                case 'conclude_an_agreement':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_2-4');
                    break;
                case 'UNEP_release_confirmation':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_2-4');
                    break;                        

                case 'signing_documents':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_3-4');
                    break;
                case 'waiting_for_document_editing':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_1-4');
                    break;
                case 'signed_documents':
                    statusImg.classList.add('kedo__employment-table-string-status-img_status_4-4');
                    break;
            }
        }

        // process
        // let user: UserItem|undefined = undefined
        // if(app.userId && allUsers){
        //     user = allUsers.find(item => item.id === app.userId)
        // }

        let process: ProcessInstanceItem|undefined;
        if(processesError){
            process = processesError.find(item => {
                if(item.data.__item && item.data.__item.id === app.staffId){
                    return true
                }
                return false;
            })
        }

        if(process){
            if(isUserAdmin){
                const taskLink = itemEl.querySelector('.kedo__employment-table-string-task_link');
                if(process.data.__state === ProcessInstanceState.error){
                    taskLink.textContent = "Ошибка в процессе";
                } else if (process.data.__state === ProcessInstanceState.cancel){
                    taskLink.textContent = "Процесс отменен";
                }
                taskLink.href = `https://${host}/kedo/all_employees(p:history/${process.id})` 
            } else {
                const taskLink = itemEl.querySelector('.kedo__employment-table-string-task_text');
                if(process.data.__state === ProcessInstanceState.error){
                    taskLink.textContent = "Ошибка в процессе, обратитесь к администратору";
                } else if (process.data.__state === ProcessInstanceState.cancel){
                    taskLink.textContent = "Процесс отменен, обратитесь к администратору";
                }
            }
        }
        
        itemsWrapper.append(itemEl);
    }

    hideLoader();
}

function showLoader(){
    loader.classList.add('kedo-loader-wrapper-employment_active');
}
function hideLoader(){
    loader.classList.remove('kedo-loader-wrapper-employment_active');
}

async function getChunkData(){
    try{
        await getAppsArr();
    }
    catch(err){
        throw new Error(`getAppsArr error ${err}`);
    }
}

async function renderWidget(){
    itemTemp = document.querySelector('.kedo__employment-table-section-list-item-template');
    itemsWrapper = document.querySelector('.kedo__employment-table-section-list');
    loader = document.querySelector('.kedo-loader-wrapper-employment');

    showLoader();
    
    await Promise.all([await getAllUsers(), await getProcessInstances(), await getAdminUsers(), await getCurrentUser()]);

    if(adminUsers.find(item => item.id === currentUser.id)){
        isUserAdmin = true;
    }

    await getChunkData();

    await renderItems();
        
    // lazy loading
    let contentBody = document.querySelector('.content-body');
    let kedoUsersContainer = document.querySelector('.kedo__employment');
    let documentsBottomPoint: number = 0;
    let timeOut: any;

    async function handleWindowScroll(){
        window.clearTimeout(timeOut);

        timeOut = window.setTimeout(async() => {
            documentsBottomPoint = kedoUsersContainer.offsetTop + kedoUsersContainer.offsetHeight;
            
            if(documentsBottomPoint - contentBody.scrollTop - window.innerHeight < 0){
                await renderItems();
                if(!Context.data.all_documents_uploaded){
                    await getAppsArr();
                }
                if(Context.data.all_documents_uploaded){
                    Context.data.custom_application = [];
                }
                
                documentsBottomPoint = kedoUsersContainer.offsetTop + kedoUsersContainer.offsetHeight
            }
        }, 300)
    }

    if(!isScrollListenerAdded){
        contentBody.addEventListener('scroll', handleWindowScroll);
        isScrollListenerAdded = true;
    }

    await getChunkData();
}

// ================================================================================================

const numberOfUnloadedElements: number = 20;
let countOfIterations: number;
let firstElementNumber: number;
let numberOfAllElements: number = 0;

async function findUserArrClientScript(): Promise<void> {
    try{
        // Context.data.chunk_data_array = []
        chunkDataArray = []
        
        let userSearch = Namespace.app.staff.search()

        if(!numberOfAllElements){
            numberOfAllElements = await userSearch.count();
        }
        
        if(!countOfIterations){
            countOfIterations = Math.ceil(numberOfAllElements / numberOfUnloadedElements);
        }

        firstElementNumber = Context.data.iteration_number! * numberOfUnloadedElements;
        const amountOfElements = (Context.data.iteration_number != countOfIterations - 1) ? numberOfUnloadedElements : (numberOfAllElements - firstElementNumber);

        if(Context.data.iteration_number === countOfIterations){
            Context.data.all_documents_uploaded = true
        }
        
        try {
            let result: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>[];
            result = await userSearch
                .where(f => f.__deletedAt.eq(null))
                .size(amountOfElements)

                .from(firstElementNumber)
                .all()
            
            if(result){
                for (let i = 0; i < result.length; i++){
                    await addElementToGeneralArray(result[i]);
                }

                Context.data.iteration_number! += 1;
            }
        } catch (err) {
            throw new Error(`userSearch error ${err}`);
        };
    }
    catch(err){
        throw new Error(`userSearch error ${err}`);
    }
}

async function addElementToGeneralArray(element: ApplicationItem<Application$kedo$staff$Data,any>){
    if(element){
        // user
        let staffNameText: string;
        let staffId: string;
        let userId: string;

        staffNameText = !element.data.__name ? '' : element.data.__name;
        staffId = !element.data.__id ? '' : element.data.__id;
        userId = !element.data.ext_user ? '' : element.data.ext_user.id;
        
        //task
        if (!!element.data.ext_user) {
            let externalUser = allUsers.find(u => u.data.__id == element.data.ext_user?.id)
            let tasks = await System.processes._searchTasks().where(i => i.performers.has(externalUser)).all();
        }

        // date
        let staffDate: string;
        staffDate = !element.data.__createdAt ? '' : element.data.__createdAt.format();

        //last update date
        let lastUpdateDate: TDatetime;
        lastUpdateDate = element.data.__updatedAt ?? null 
        
        // status
        let statusText: string = '';
        let statusCode: string = '';

        if(element.data.__status){
            statusText = !element.data.__status.name ? '' : element.data.__status.name;
            statusCode = !element.data.__status.code ? '' : element.data.__status.code;
        }

        if(statusCode === element.fields.__status.variants.signed_documents.code){
            return;
        }

        let elementData: stringData = {
            staffNameText,
            staffId,
            staffDate,
            lastUpdateDate,
            statusText,
            statusCode,
            userId
        }

        chunkDataArray.push(elementData);
        // Context.data.chunk_data_array.push(elementData);
    }
}
