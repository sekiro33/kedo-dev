/* Client scripts module */
declare const document: any, console: any, window: any;
import moment from 'moment.js';

async function init() {
    let i = 0;
    let waitForRoot = window.setInterval(async () => {
        const root = document.querySelector(getQuery('.my-vacations'));
        if (!root) {
            i++;
            if (i > 50) {
                window.clearInterval(waitForRoot)
            }
            return;
        };
        window.clearInterval(waitForRoot);
        let currentDate = new TDate();
        root.classList.remove('my-vacations--disabled')

        const vacations = await getData();
        const domList = root.querySelector(getQuery(".vacation-card__info-container"))
        const userApp = await Context.data.user_application!.fetch();
        const user = await userApp.data.ext_user!.fetch();
        const offset = user.timezone.offset;
        const fullOffset = new Duration(offset + -(new Date().getTimezoneOffset() / 60), "hours")
        let gtmRegEx = /GMT\+(?<gmt>\d{2})\d{2}/
        let days_left: number =  userApp.data.remaining_vacation_days ? Math.floor(userApp.data.remaining_vacation_days) : 0
        let currentVacationsCounter = 0

        for (let i = 0; i < vacations.length; i++) {
            const typeCode = vacations[i].data.type_of?.code 
            const shouldRender = typeCode === 'basic' || typeCode === 'additional' || typeCode === 'scheduled'
            if(!shouldRender) continue;

            if (!vacations[i].data.start || !vacations[i].data.end) {
                continue;
            };


            //@ts-ignore
            const offsetAmount = Number(String(vacations[i].data.start!.ts._d).match(gtmRegEx)[1]);
            const offsetToAdd = offset - offsetAmount
            const startDate = vacations[i].data.start_string
            const endDate = vacations[i].data.end_string;

            if (currentDate.before(vacations[i].data.end!)) {
                currentVacationsCounter++
                const element = document.createElement('a')
                element.classList.add('vacation-card__info-item');

                element.href = `${window.location.href}(p:item/absences/vacations/${vacations[i].data.__id})`;

                element.innerText = 
                    `${startDate} - ${endDate} (${getDaysAmountFormatted(vacations[i].data.amount_of_days!)})`
                
                domList.append(element)
            }

        }

        if (!vacations || !currentVacationsCounter) {
            const element = document.createElement('p')
            element.classList.add('vacation-card__info-text');
            element.innerText = "У вас не составлен график отпусков на текущий год"
            domList.append(element)
        }
        const daysElement = root.querySelector(getQuery('.vacation-card__additional-info-container'))
        daysElement.innerText += " " + (days_left > 0 ? days_left : 0);
    }, 1000)
}

function getQuery(query: string): string {
    return Context.data.__classes ? `.${Context.data.__classes} ${query}` : query
}

function getDaysAmountFormatted(duration: number): string {
    if (duration > 10 && duration < 20) {
        return `${duration} дней`
    }

    let resultString = duration + ' ';

    const lastDigit = String(duration).slice(-1);

    switch(lastDigit) {
        case '1':
            resultString += 'день';
            break;
        case '2':
            resultString += 'дня';
            break;
        case '3':
            resultString += 'дня';
            break;
        case '4':
            resultString += 'дня';
            break;
        default:
            resultString += 'дней';
    }
    return  resultString
}

async function getDate(user: UserItem, firstDate: TDate, secondDate: TDate): Promise<void> {
    // const timeZoneCompanyOffset = System.timezones.default.offset;
    // utcOffset() возвращает смещение в минутах, поэтому переводим в часы.
    // const timeZoneUserOffset = moment().utcOffset() / 60;

    // console.log(timeZoneCompanyOffset);
    // console.log(timeZoneUserOffset);
    // console.log(user.timezone.offset);

    // let delta = user.timezone.offset - timeZoneCompanyOffset;

    // Корректировку выполняем только для внутренних пользователей - у внешних всё без корректировки ок.
    // if (user.data.groupIds && user.data.groupIds.find(f => f.id === 'f25906e4-41c3-5a89-8ec2-06648dd1f614')) {
    //     delta = timeZoneUserOffset - timeZoneCompanyOffset;
    // };

    // Context.data.from_utc = timeZoneUserOffset;

    //await convert_date(delta);
    // let fromDate = firstDate.asDatetime(new TTime()).add(new Duration(delta, 'hours')).format("DD.MM.YYYY");
    // let toDate = secondDate.asDatetime(new TTime()).add(new Duration(delta, 'hours')).format("DD.MM.YYYY");
    // console.log(delta)
    // console.log(fromDate)
    // console.log(toDate)
};

async function getData() {
    const currentDate = new TDate();

    let personalDocsAppsArr = await Context.fields.vacation_contract.app
        .search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff_user.eq(Context.data.current_user!),
            f.start.gte(currentDate),
        ))
        .sort("__createdAt")
        .size(8000)
        .all()
    console.log("vacations summary: ", personalDocsAppsArr);
    personalDocsAppsArr = personalDocsAppsArr.filter((vacation) => {
        let vacationStatus = vacation.data.status;
        if (!!vacationStatus) {
            return !vacationStatus.includes("new") || !vacationStatus.includes("cancelled");
        };
    });

    return personalDocsAppsArr
}