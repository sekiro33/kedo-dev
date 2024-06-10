
declare const window: any;
declare const document: any;
declare const console: any;

interface PortalPageInfoForRender {
    name: string
    url: string,
    icon: string,
    text: string,
    code: string
}
interface Icon {
    code: string,
    svg: string
}

const not_pages = ['_start_page', 'user_page', 'my_profile', 'work_with_candidate', 'main', 'main_page', 'absence_schedule_page_kedo'];

let navigation_items: PortalPageInfoForRender[] = []

class UserDataManager {
    user: UserItem
}
const userDataManager = new UserDataManager();

function getNavigationItems(): PortalPageInfoForRender[] {
    return navigation_items;
}

async function onInit() {

    const current_user = await System.users.getCurrentUser();
    userDataManager.user = current_user;

    const raw_navigation_items: PortalPageInfo[] = (await Namespace.portal.getPages()).filter(item => {
        const url = item.getUrl().split('/');
        return not_pages.indexOf(url[3]) === -1;
    });

    raw_navigation_items.forEach((item: PortalPageInfo) => {
        const url = item.getUrl().split('/');
        let svg = '';
        let code = '';
        if (url && url[3]) {
            const icon = icons.find(icon => icon.code === url[3])
            svg = icon ? icon.svg : '';
            code = url[3];
        }
        navigation_items.push({
            name: item.name,
            url: getPortalPageUrlForNavigator(item.getUrl()),
            icon: svg,
            text: '',
            code: code
        });
    });
    window.setInterval(function () {
        setActive(window.location.href.replace(System.getBaseUrl(), ''));
    },200);
}

async function getOrRefreshData(): Promise<void> {
    const tasks = await System.processes._searchTasks().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.performers.has(userDataManager.user)
    )).size(10000).sort("__createdAt").all().then(res => res.filter(task => ![ProcessTaskState.cancel, ProcessTaskState.closed].some(item => task.data.state === item)));
    setCounter('task_page_kedo', tasks.length.toString());
}

function setCounter(data_menu_item: string, text: string) {
    const tasksCounter = document.querySelector(`.portal-navbar__item[data-menu-item="${data_menu_item}"] .left-menu_item-counter`);
    if (tasksCounter) {
        tasksCounter.textContent = text;
    }
};

async function onLoad(): Promise<void> {

    setActive(window.location.href.replace(System.getBaseUrl(), ''));

    getOrRefreshData();

    window.setInterval(() => {
        getOrRefreshData().then(_ => {
            console.log("PortalNavigation: refresh");
        });
    }, 60000);
}

function setActive(url: string): void {

    const items_menu = document.querySelectorAll('.portal-navbar .portal-navbar__item');

    items_menu.forEach((item_menu: any) => {

        const href = item_menu.getAttribute('href');

        if (href) {

            if (url.indexOf(href) > -1) {
                if (!item_menu.classList.contains('active')) {
                    item_menu.classList.add('active');
                }
            }
            else if (item_menu.classList.contains('active')) {
                item_menu.classList.remove('active');
            }
        }
        else if (item_menu.classList.contains('active')) {
            item_menu.classList.remove('active');
        }
    });
}

function getPortalPageUrlForNavigator(rawUrl: string) {
    const pathUrlsArray = rawUrl.split('/');
    const navigatorPathUrlsArray = pathUrlsArray.slice(0, -1).concat('main_page', pathUrlsArray[pathUrlsArray.length - 1]);

    return navigatorPathUrlsArray.join('/');
}

const icons = <Icon[]>[{
    code: 'main_page_kedo',
    svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-menu_icon-svg">
    <path d="M3.75 7.5V17.5H16.25V7.5L10 2.5L3.75 7.5Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.91699 12.0833V17.4999H12.0837V12.0833H7.91699Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"></path>
    <path d="M3.75 17.5H16.25" stroke="black" stroke-linecap="round"></path>
    </svg>`
},
{
    code: 'task_page_kedo',
    svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-menu_icon-svg">
    <path d="M7.50033 3.33325H4.58366C4.35353 3.33325 4.16699 3.5198 4.16699 3.74992V17.9166C4.16699 18.1467 4.35353 18.3333 4.58366 18.3333H16.2503C16.4805 18.3333 16.667 18.1467 16.667 17.9166V3.74992C16.667 3.5198 16.4805 3.33325 16.2503 3.33325H13.3337" stroke="black" stroke-width="1.5"></path>
    <path d="M7.5 5.41667V3.33333H9.14604C9.15742 3.33333 9.16667 3.3241 9.16667 3.31271V2.5C9.16667 1.80965 9.72629 1.25 10.4167 1.25C11.107 1.25 11.6667 1.80965 11.6667 2.5V3.31271C11.6667 3.3241 11.6759 3.33333 11.6873 3.33333H13.3333V5.41667C13.3333 5.64679 13.1468 5.83333 12.9167 5.83333H7.91667C7.68654 5.83333 7.5 5.64679 7.5 5.41667Z" stroke="black" stroke-width="1.5"></path>
    <path d="M7.5 10H13.75" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.5 13.75H13.75" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`
},
{
    code: 'service_page_kedo',
    svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-menu_icon-svg">
    <path d="M15.4167 3.33356H4.58333C4.1231 3.33356 3.75 3.70665 3.75 4.16689V17.5002C3.75 17.9605 4.1231 18.3336 4.58333 18.3336H15.4167C15.8769 18.3336 16.25 17.9605 16.25 17.5002V4.16689C16.25 3.70665 15.8769 3.33356 15.4167 3.33356Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"></path>
    <path d="M7.5 1.66656V4.16656" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M12.5 1.66656V4.16656" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M6.66699 7.91656H13.3337" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M6.66699 11.2501H11.667" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M6.66699 14.5836H10.0003" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`
},
{
    code: 'vacations_page_kedo',
    svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-menu_icon-svg">
    <path d="M14.9997 10.8334V5.83339C14.9997 5.37314 14.6266 5.00006 14.1663 5.00006H4.16634C3.7061 5.00006 3.33301 5.37314 3.33301 5.83339V15.8334C3.33301 16.2936 3.7061 16.6667 4.16634 16.6667H11.2497" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M6.66699 5.00006V16.6667" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M11.667 5.00006V12.0834" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M11.667 4.9999V2.4999C11.667 2.03966 11.2939 1.66656 10.8337 1.66656H7.50033C7.04008 1.66656 6.66699 2.03966 6.66699 2.4999V4.9999" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M14.583 18.3336C16.6541 18.3336 18.333 16.6546 18.333 14.5836C18.333 12.5125 16.6541 10.8336 14.583 10.8336C12.5119 10.8336 10.833 12.5125 10.833 14.5836C10.833 16.6546 12.5119 18.3336 14.583 18.3336Z" stroke="black" stroke-width="1.5"></path>
    <path d="M14.167 13.3336V15.0002H15.8337" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M5.41699 16.6666V18.3332" stroke="black" stroke-width="1.5" stroke-linecap="round"></path>
    </svg>`
},
{
    code: 'business_trips_page_kedo',
    svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-menu_icon-svg">
    <g clip-path="url(#clip0_2710_613)">
    <mask id="mask0_2710_613" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
    <path d="M20 0H0V20H20V0Z" fill="white"></path>
    </mask>
    <g mask="url(#mask0_2710_613)">
    <path d="M2.08203 17.0783H17.9154" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3.55003 13.0267L1.62793 9.69758C2.03222 9.46416 4.03276 10.1621 4.77749 10.5442L8.81999 9.0972L5.36362 3.11061L7.07803 3.00771L12.6616 8.19995L16.0993 7.11178C17.6217 6.67628 18.1018 7.50787 18.1977 7.67399C18.7738 8.67183 17.6097 9.34387 17.4434 9.43987C16.1131 10.208 3.55003 13.0267 3.55003 13.0267Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </g>
    </g>
    <defs>
    <clipPath id="clip0_2710_613">
    <rect width="20" height="20" fill="white"></rect>
    </clipPath>
    </defs>
    </svg>`
},
{
    code: 'absence_schedule_page_kedo',
    svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-menu_icon-svg">
    <path d="M18.125 1.25H1.875C0.839453 1.25 0 2.08945 0 3.125V16.875C0 17.9105 0.839453 18.75 1.875 18.75H18.125C19.1605 18.75 20 17.9105 20 16.875V3.125C20 2.08945 19.1605 1.25 18.125 1.25ZM6.25 17.5H1.875C1.5298 17.5 1.25 17.2202 1.25 16.875V13.75H6.25V17.5ZM6.25 12.5H1.25V8.75H6.25V12.5ZM6.25 7.5H1.25V3.75H6.25V7.5ZM12.5 17.5H7.5V13.75H12.5V17.5ZM12.5 12.5H7.5V8.75H12.5V12.5ZM12.5 7.5H7.5V3.75H12.5V7.5ZM18.75 13.75V16.875C18.75 17.2202 18.4702 17.5 18.125 17.5H13.75V13.75H18.75ZM18.75 12.5H13.75V8.75H18.75V12.5ZM18.75 7.5H13.75V3.75H18.75V7.5Z" fill="black"></path>
    </svg>`
},
{
    code: 'personnel_events_page_kedo',
    svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-menu_icon-svg">
    <path d="M15.8335 1.6665H4.16683C3.70659 1.6665 3.3335 2.0396 3.3335 2.49984V17.4998C3.3335 17.9601 3.70659 18.3332 4.16683 18.3332H15.8335C16.2937 18.3332 16.6668 17.9601 16.6668 17.4998V2.49984C16.6668 2.0396 16.2937 1.6665 15.8335 1.6665Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.0835 11.25H12.9168" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.0835 8.75H12.9168" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.0835 5.83301H12.9168" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.0835 14.1665H10.0002" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`
},
{
    code: 'my_profile_page_kedo',
    svg: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-menu_icon-svg">
    <path d="M10.0003 8.33323C11.8413 8.33323 13.3337 6.84085 13.3337 4.9999C13.3337 3.15895 11.8413 1.66656 10.0003 1.66656C8.15938 1.66656 6.66699 3.15895 6.66699 4.9999C6.66699 6.84085 8.15938 8.33323 10.0003 8.33323Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M17.5 18.3334C17.5 14.1913 14.1421 10.8334 10 10.8334C5.85787 10.8334 2.5 14.1913 2.5 18.3334" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`
}];