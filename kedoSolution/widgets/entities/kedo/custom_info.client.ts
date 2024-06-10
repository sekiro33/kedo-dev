/* Client scripts module */
declare const console: any, document: any, window: any;

async function handleContextChange(): Promise<void> {
    const blockType = getWrapperClass();
    if (Context.data.user) {
        const user = await Context.data.user.fetch();
        const userName = user.data.__name;
        const userLink = `./(p:user/${user.id})`;
        Context.data.info_string = Context.data.info_string!.replace("link", `<a class='user-link ${blockType}' href=${userLink}>${userName}</a>`)
        Context.data.user_name = userName;
        Context.data.user_link = userLink;
        console.log(Context.data.user_link)
        console.log(Context.data.user_name)
    };

    if (Context.data.staff_app) {
        const staff = await Context.data.staff_app.fetch();
        const staffName = staff.data.__name;
        const staffLink = `./(p:item/kedo/staff/${staff.id})`;
        Context.data.info_string = Context.data.info_string!.replace("link", `<a class='user-link ${blockType}' href=${staffLink}>${staffName}</a>`)
        Context.data.staff_name = staffName;
        Context.data.staff_link = staffLink;
        console.log(Context.data.staff_link)
        console.log(Context.data.staff_name)
    };
};

function hoverInit(): void {
    const popupContainer = document.querySelector(`.${getWrapperClass()} .holidays-info__popup-wrapper`);
    if (!Context.data.hover_text) {
        popupContainer.classList.add('holidays-info__popup-wrapper--disabled');
        return;
    }

    const container = document.querySelector(`.${getWrapperClass()}.holidays-info__container`);

    container.addEventListener('mouseover', () => {
        popupContainer.classList.remove('holidays-info__popup-wrapper--hidden');
    })

    container.addEventListener('mouseout', () => {
        popupContainer.classList.add('holidays-info__popup-wrapper--hidden');
    })
}

// Предыдущая версия функции. Если изначально не указана информационная строка - упадёт с ошибкой и виджет не будет отображаться.
/* function getWrapperClass(): string {
    const infoType = Context.data.info_type!.code;
    const controlNumber = Context.data.info_string!.charCodeAt(0) +
        Context.data.info_string!.charCodeAt(1) +
        Context.data.info_string!.charCodeAt(2) +
        Context.data.info_string!.charCodeAt(Context.data.info_string!.length - 1)
    return infoType + controlNumber
} */

function getWrapperClass(): string {
    return Context.data.info_type!.code;
};
