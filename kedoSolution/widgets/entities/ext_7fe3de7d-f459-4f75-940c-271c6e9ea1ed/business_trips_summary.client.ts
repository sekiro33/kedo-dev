declare const document:any, console: any, window: any;

async function init() {
    let i = 0;
    let waitForRoot = window.setInterval(async () => {
        const root = document.querySelector(Context.data.__classes ? `.${Context.data.__classes} .my-trips` : ".my-trips");
        if (!root) {
            i++;
            if (i > 50) {
                window.clearInterval(waitForRoot)
            }
            return;
        };
        window.clearInterval(waitForRoot)
        if (!Context.data.is_trips_active) {
            root.classList.add("my-trips--disabled");
            return;
        }
        // root.classList.remove('my-trips--disabled');
        const currentUserBusinessTrips = await getData()
        const currentDate = new TDate();
        const domList = document.querySelector(Context.data.__classes ? `.${Context.data.__classes} .trips-card__info-container` : ".trips-card__info-container")
        let currentTripsCounter = 0

        for(let i = 0; i < currentUserBusinessTrips.length; i++) {
            const currentItem = currentUserBusinessTrips[i]
            if (!currentItem.data.start_date || !currentItem.data.end_date) {
                continue;
            };

            const startDate = currentItem.data.start_date_string;
            const endDate = currentItem.data.end_date_string;

            if (!endDate || !startDate || currentDate.after(currentItem.data.end_date)) continue;
            
            currentTripsCounter++
            const element = document.createElement('a');
            element.classList.add('trips-card__info-item');
            element.href = `${window.location.href}(p:item/business_trips/businesstrip_requests/${currentItem.data.__id})`
            //@ts-ignore
            element.innerText = `${startDate} - ${endDate} (${currentItem.data.end_date.ts.diff(startDate.ts, 'days')} дней)`
            domList.append(element)

            if (currentDate.after(currentItem.data.start_date!) && currentDate.before(currentItem.data.end_date!.addDate(0, 0, 1))) {
                const titleElement = root.querySelector(".trips-card__title");
                titleElement.innerText = "Вы в командировке";
            }
        }
        if (!currentUserBusinessTrips || currentTripsCounter === 0) {
            const element = document.createElement('p');
            element.classList.add('trips-card__info-text');
            element.innerText = "У вас нет запланированных командировок";
            domList.append(element);
        }
    }, 1000)
}

async function getData() {
    const currentDate = new Datetime()
    let tripsData = await Context.fields.business_trips_contract.app
        .search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            g.or(
                f.traveling_users.has(Context.data.current_user!),
                f.kedo_staff.link(Context.data.employee_card!)
            ),
            f.start_date.gt(currentDate.addDate(-1, 0, 0))
        ))
        .size(8000)
        .all()
    tripsData = tripsData.filter((trip) => {
        let tripStatus = trip.data.status;
        if (!!tripStatus) {
            return !tripStatus.includes("completed") || !tripStatus.includes("canceled") || !tripStatus.includes("in-prepare");
        };
    });

    return tripsData
}
