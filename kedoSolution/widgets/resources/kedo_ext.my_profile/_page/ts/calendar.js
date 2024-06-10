const options = {
    actions: {
        clickDay(event, self) {
            setDate(event)
        }
    },
    settings: {
        lang: "ru-RU"
    }
}

function setDate(event) {
    const [year, month, day] = [...event.target.dataset.calendarDay.split("-")]
    const calendarInput = event.target.closest(".task-search-date").querySelector("input");
    calendarInput.value = `${day}.${month}.${year}`;
    const closestCalendar = event.target.closest(".vanilla-calendar");
    closestCalendar.classList.toggle("hidden");
}

function checkComponents() {
    return !!(
        document.querySelector(".mobile .created-at-calendar") &&
        document.querySelector(".created-at-calendar") &&
        document.querySelector(".mobile .valid-to-calendar") &&
        document.querySelector(".valid-to-calendar") &&
        document.querySelector(".documents-page_main-content_title_search-extend_item-value_calendar") &&
        document.querySelector(".business_trips_start-calendar") &&
        document.querySelector(".business_trips_end-calendar") &&
        document.querySelector(".vacations_start-calendar") &&
        document.querySelector(".vacations_end-calendar")
    );
};

(function setCalendars() {
    const waitForComponents  = window.setInterval(() => {
        if (!checkComponents()) {
            console.log("waiting for calendar components")
            return;
        };
        window.clearInterval(waitForComponents);
        const docsCalendar = new VanillaCalendar(".documents-page_main-content_title_search-extend_item-value_calendar", options);
        const vacationsStartCalendar = new VanillaCalendar(".vacations_start-calendar", options)
        const vacationsEndCalendar = new VanillaCalendar(".vacations_end-calendar", options)
        const businessTripsStartCalendar = new VanillaCalendar(".business_trips_start-calendar", options)
        const businessTripsEndCalendar = new VanillaCalendar(".business_trips_end-calendar", options)
        const mobileCreatedAtClanedar = new VanillaCalendar(".mobile .created-at-calendar", options);
        const createdAtClanedar = new VanillaCalendar(".created-at-calendar", options);
        const mobileValidToClanedar = new VanillaCalendar(".mobile .valid-to-calendar", options);
        const validToClanedar = new VanillaCalendar(".valid-to-calendar", options);
        [
            createdAtClanedar,
            mobileCreatedAtClanedar,
            validToClanedar,
            mobileValidToClanedar,
            docsCalendar,
            businessTripsStartCalendar,
            businessTripsEndCalendar,
            vacationsStartCalendar,
            vacationsEndCalendar
        ].forEach(calendar => calendar.init());
    }, 100)
})();