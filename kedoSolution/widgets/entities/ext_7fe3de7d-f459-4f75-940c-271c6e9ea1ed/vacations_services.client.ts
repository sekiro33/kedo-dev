/* Client scripts module */
declare const document: any, console: any, window: any;
const vacationCards = {
    without_payment: {
        title: 'Заявление на отпуск без сохранения оплаты',
        decription:
            'Нужно отлучиться с работы? Оформите отгул на время вашего отсутствия: на несколько часов или дней.',
        link: 'absences/vacations;values=%7B%22data%22%3A%7B%22type_vacation%22%3A%5B%7B%22code%22%3A%22unpaid%22%2C%22name%22%3A%22%D0%91%D0%B5%D0%B7%20%D1%81%D0%BE%D1%85%D1%80%D0%B0%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F%20%D0%B7%D0%B0%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BD%D0%BE%D0%B9%20%D0%BF%D0%BB%D0%B0%D1%82%D1%8B%22%7D%5D%7D%7D',
        img: `<i _ngcontent-gbx-c361="" class="elma-icons md-16 @wide kedo__main-services-card-title-img-icon">vehicle_car</i>`,
    },
    sick_leave: {
        title: 'Заявление на больничный',
        decription:
            'Заболели? Сообщите об этом работодателю и поскорее выздоравливайте.',
        link: 'absences/vacations;values=%7B%22data%22%3A%7B%22type_vacation%22%3A%5B%7B%22code%22%3A%22sick_leave%22%2C%22name%22%3A%22%D0%91%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D1%87%D0%BD%D1%8B%D0%B9%22%7D%5D%7D%7D',
        img: `<i _ngcontent-wfl-c361="" class="elma-icons md-16 @wide kedo__main-services-card-title-img-icon">category_love</i>`,
    },
    duty: {
        title: 'Заявка на исполнение гос. и общ. обязанностей',
        decription:
            'Заявка на исполнение государственных и общественных обязанностей',
        link: 'absences/vacations;values=%7B%22data%22%3A%7B%22type_vacation%22%3A%5B%7B%22code%22%3A%22duty%22%2C%22name%22%3A%22%D0%98%D1%81%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B3%D0%BE%D1%81.%20%D0%B8%20%D0%BE%D0%B1%D1%89.%20%D0%BE%D0%B1%D1%8F%D0%B7%D0%B0%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D0%B5%D0%B9%22%7D%5D%7D%7D',
        img: `<i _ngcontent-fnt-c410="" class="elma-icons md-18 kedo__main-services-card-title-img-icon">stamp</i>`,
    }
}

function init() {
    window.setTimeout(() => {
        if (Context.data.card_type) {
            const data = vacationCards[Context.data.card_type.code];
            const card = document.querySelector(Context.data.__classes ? `.${Context.data.__classes} .kedo__main-services-card` : "kedo__main-services-card") 

            const cardImgWrapper = card.querySelector('.kedo__main-services-card-title-img')
            const cardTitle = card.querySelector('.kedo__main-services-card-title')
            const cardDecription = card.querySelector('.kedo__main-services-card-description')

            cardImgWrapper.insertAdjacentHTML('afterBegin', data.img)
            cardTitle.textContent = data.title
            cardDecription.textContent = data.decription
        }
    }, 500)
}

function getLink() {
    if (Context.data.card_type) {
        return `${window.location.href}(p:item/${vacationCards[Context.data.card_type.code].link})`;
    }
}