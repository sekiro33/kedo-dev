/* Client scripts module */

async function subtitusuion_set(): Promise<void> {
    if (Context.data.substitution_type) {
        ViewContext.data.inf_about_acting_show = false;
        ViewContext.data.substitute_show = false;
        if (Context.data.substitution_type.code == Context.fields.substitution_type.variants.substitution_performance.code) {
            ViewContext.data.inf_about_acting_show = true;
            ViewContext.data.substitute_show = true;
        }
        if (Context.data.substitution_type.code == Context.fields.substitution_type.variants.substitution.code) ViewContext.data.substitute_show = true;
        if (Context.data.substitution_type.code == Context.fields.substitution_type.variants.performance.code) ViewContext.data.inf_about_acting_show = true;
    }
    else {
        ViewContext.data.inf_about_acting_show = false;
        ViewContext.data.substitute_show = false;
    }
}


async function date_correct(): Promise<void> {
    if (Context.data.start_date && Context.data.end_date) {
        const timeZoneCompany = System.timezones.default.offset + 100;
        let timeZoneUser: number;
        const curUser = await (await System.users.getCurrentUser()).fetch();
        if (curUser.data.groupIds && curUser.data.groupIds.find(f => f.id === 'f25906e4-41c3-5a89-8ec2-06648dd1f614'))
            timeZoneUser = -(Context.data.start_date.asDate().getTimezoneOffset() / 60) + 100;
        else
            timeZoneUser = curUser.timezone.offset + 100;
        ViewContext.data.timezone = timeZoneUser - 100;
        const delta = timeZoneUser - timeZoneCompany;
        Context.data.start_day_line = Context.data.start_date.add(new Duration(delta, 'hours')).format("DD.MM.YYYY");
        Context.data.end_date_line = Context.data.end_date.add(new Duration(delta, 'hours')).format("DD.MM.YYYY");
    }
}