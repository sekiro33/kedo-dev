/* Client scripts module */
declare var document: any;

const modalsContainerId = 'd1c4a7fe-ba3d-4bdd-bfa7-93a58c4ec7ba';
const mobileMenuModalId = 'df0aa1ba-23a2-4077-817d-2a12fe3aa049';
const mobileCustomModalId = 'fd164163-fdf1-4a56-bcb5-5d8bd1cdaeda';

class menuModal {
    private name: string;
    private element: any;

    constructor(
        readonly elementId: string,
    ){
        this.name = elementId;
        this.element = document.getElementById(elementId);
        this.addToBody();
    }

    getName(): string {
        return this.name;
    }

    show() {
        this.element.style.display = "block";
    }

    hide() {
        this.element.style.display = "none";
    }

    private addToBody() {
        document.body.appendChild(this.element);
    }

    removeFromBody() {
        let header_modals: any;
        this.hide();
        header_modals = document.getElementById(modalsContainerId);
        header_modals.appendChild(this.element);
    }
}

class menuModals {
    private modals: menuModal[] = [];

    private getModal(elementId: string): menuModal | undefined {
        return this.modals.find(m => m.getName() === elementId);
    }

    addModal(elementId: string) {
        this.modals.push(new menuModal(elementId));
    }

    initModals() {
        this.addModal(mobileMenuModalId);
        this.addModal(mobileCustomModalId);
    }

    removeModals() {
        for (let item of <menuModal[]>this.modals) {
            item.removeFromBody();
        }
        this.modals = [];
    }

    show(elementId: string) {
        const modal = this.getModal(elementId);
        if (modal) {
            modal.show()
        }
    }

    hide(elementId: string) {
        const modal = this.getModal(elementId);
        if (modal) {
            modal.hide()
        }
    }
}

let logoImg: string = '/assets/images/elma365.svg';
let companyName: string = 'MyCompany';
let headerText: string = 'PageHeaderText';
let userFIO: string;
let navigation_items: PortalPageInfo[] = [];
const modals: menuModals = new menuModals();

function getLogoSrc(): string {
    return logoImg;
}

function getHeaderText(): string {
    return headerText;
}

function getUserFIO(): string {
    return userFIO;
}

function getCompanyName(): string {
    return companyName;
}

function getStartPageURL(): string {
    return `/_portal/${Namespace.code}/_start_page`;
}

async function onInit(): Promise<void> {
    const promises: Promise<any>[] = [];
    promises.push(loadUserInfo(), loadNavigationItems());
    await Promise.all(promises);
}

async function loadUserInfo(): Promise<void> {
    const user = await System.users.getCurrentUser().catch(() => {
        return undefined;
    });
    if (user) {
        userFIO = `${user.data.fullname?.firstname} ${user.data.fullname?.lastname}`;
    }
}

async function logoutCurrentUser(): Promise<void> {
    const user = await System.users.getCurrentUser();
    await user.logout();
}

async function loadNavigationItems(): Promise<void> {
    navigation_items = await Namespace.kedo_ext.getPages().catch(() => {
        return [];
    });
}

function getNavigationItems(): PortalPageInfo[] {
    return navigation_items;
}

function initModals() {
    modals.initModals();
}

function removeModals() {
    modals.removeModals();
}

function showMobileMenu() {
    initModals();
    modals.show(mobileMenuModalId);
}

function closeMobileMenu() {
    removeModals();
}
