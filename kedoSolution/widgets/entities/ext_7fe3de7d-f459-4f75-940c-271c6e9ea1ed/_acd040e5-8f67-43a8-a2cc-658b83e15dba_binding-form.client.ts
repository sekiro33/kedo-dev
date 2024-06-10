/* Client scripts module */

async function change_correcting_variant(): Promise<void> {
    if (ViewContext.data.correct_date) {
        switch (ViewContext.data.correct_date.code) {
            case ViewContext.fields.correct_date.variants.add.code:
                ViewContext.data.show_correct_settings = true;
                
            case ViewContext.fields.correct_date.variants.sub.code:
                ViewContext.data.show_correct_settings = true;

            case ViewContext.fields.correct_date.variants.none.code:
                ViewContext.data.show_correct_settings = false;

            default:
                ViewContext.data.show_correct_settings = false;
        }
    }
}

async function execution_date_onchange(): Promise<void> {
    const correct_variants = ViewContext.fields.correct_date.variants;

    if (ViewContext.data.execution_date) {
        if (ViewContext.data.correct_date?.code == correct_variants.add.code) {
            await add_correct();
        }

        if (ViewContext.data.correct_date?.code == correct_variants.sub.code) {
            await sub_correct();
        }

        if (ViewContext.data.correct_date?.code == correct_variants.none.code) {
            await none_correct();
        }
    }
}

async function add_correct(): Promise<void> {
    const days = ViewContext.data.days ?? 0;
    const hours = ViewContext.data.hours ?? 0;
    const minutes = ViewContext.data.minutes ?? 0;

    let result_date: TDatetime;

    if (ViewContext.data.accounting_working_calendar == true) {
        const sum_hours = days * 24 + hours + (minutes / 60);
        result_date = await System.productionSchedule
            .calcDate(ViewContext.data.execution_date!, new Duration(sum_hours, 'hours'));
    } else {
        result_date = ViewContext.data.execution_date!
            .add(new Duration(days, 'days'))
            .add(new Duration(hours, 'hours'))
            .add(new Duration(minutes, 'minutes'));
    }

    Context.data.execution_time = result_date;
}

async function sub_correct(): Promise<void> {

}

async function none_correct(): Promise<void> {
    Context.data.execution_time = ViewContext.data.execution_date;
}

async function validation(): Promise<ValidationResult> {
    const validationResult = new ValidationResult();
    return validationResult;
}
