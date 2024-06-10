/* Client scripts module */

declare const console: any;

async function onInit(): Promise<void> {
    const user = await System.users.getCurrentUser();

    // Получаем таймзону компании.
    const companyTimeZone = System.timezones.default;

    // Записываем таймзону пользователя.
    let userTimeZone = user.timezone;

    // Если пользователь внешний: получаем его системную таймозону.
    if (user.data.groupIds && user.data.groupIds.find(f => f.id === 'f25906e4-41c3-5a89-8ec2-06648dd1f614')) {
        const timeZones = System.timezones.all();
        const userTimeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
        Intl.DateTimeFormat().resolvedOptions()
        userTimeZone = timeZones.find(f => f.name == userTimeZoneName) ?? companyTimeZone;
    }

    console.log("companyTimeZone", companyTimeZone);
    console.log("userTimeZone", userTimeZone);

    convert(userTimeZone);
}

function convert(timezone: TTimezone): void {
    const date_1 = Context.data.date_1;
    const date_2 = Context.data.date_2;

    if (date_1) {
        console.log("date_1 before correct",date_1.format('DD.MM.YYYY HH:mm'));

        Context.data.date_1_string = date_1.getDate(timezone).format("DD.MM.YYYY");
        Context.data.date_1_string_time = `${Context.data.date_1_string} ${date_1.getTime(timezone).format("HH:mm")}`

        console.log("date_1 after correct",Context.data.date_1_string_time);
    }

    if (date_2) {
        console.log("date_2 before correct",date_2.format('DD.MM.YYYY HH:mm'));

        Context.data.date_2_string = date_2.getDate(timezone).format("DD.MM.YYYY");
        Context.data.date_2_string_time = `${Context.data.date_2_string} ${date_2.getTime(timezone).format("HH:mm")}`

        console.log("date_2 after correct",Context.data.date_2_string_time);
    }
}

