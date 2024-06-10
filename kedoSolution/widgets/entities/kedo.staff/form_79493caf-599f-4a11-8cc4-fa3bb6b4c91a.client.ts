/* Client scripts module */

async function onInit(): Promise<void> {
    Context.data.russian_passport = true;
    ViewContext.data.isRussianPassport = true;
}

async function changeRussianPassDepCode(): Promise<void> {
    if (Context.data.russian_passport_department_code) {
        let split_str = Context.data.russian_passport_department_code.match(/(\d{1,3})/g);
        if (split_str && split_str[0].length == 3 && (split_str[1])) {
            Context.data.russian_passport_department_code = split_str[0] + '-' + split_str[1];
        }
    }
}

async function checkSnils(): Promise<void> {
    if (Context.data.context_snils) {
        let split_str = Context.data.context_snils.match(/(\d{1,3})/g);
        if (split_str && split_str[0].length == 3 && (split_str[1])) {
            Context.data.context_snils = split_str[0] + '-' + split_str[1];
        }
        if (split_str && split_str[1].length == 3 && (split_str[2])) {
            Context.data.context_snils += '-' + split_str[2];
        }
        if (split_str && split_str[2].length == 3 && (split_str[3])) {
            Context.data.context_snils += ' ' + split_str![3];
        }

    }
}

async function checkRussianSeries(): Promise<void> {
    if (Context.data.russian_passport_series) {
        let split_str = Context.data.russian_passport_series.match(/(\d{1,4})/g);
        if (split_str && split_str[0].length == 4 && (split_str[1])) {
            Context.data.russian_passport_series = split_str[0];
        }
    }
}

async function checkRussianNumber(): Promise<void> {
    if (Context.data.russian_passport_number) {
        let split_str = Context.data.russian_passport_number.match(/(\d{1,6})/g);
        if (split_str && split_str[0].length == 6 && (split_str[1])) {
            Context.data.russian_passport_number = split_str[0];
        }
    }
}

async function checkInn(): Promise<void> {
    if (Context.data.context_inn) {
        let split_str = Context.data.context_inn.match(/(\d{1,12})/g);
        if (split_str && split_str[0].length == 12 && (split_str[1])) {
            Context.data.context_inn = split_str[0];
        }
    }
}

async function validation(): Promise<void> {
    if (Context.data.russian_passport == true) {
        ViewContext.data.isRussianPassport = true;
        ViewContext.data.isNotRussianPassport = false;

        if (ViewContext.data.code) {
            Context.data.russian_passport_department_code = ViewContext.data.code;
        }
        if (ViewContext.data.number) {
            Context.data.russian_passport_number = ViewContext.data.number;
        }
        if (ViewContext.data.series) {
            Context.data.russian_passport_series = ViewContext.data.series;
        }
    }
    if (Context.data.russian_passport == false) {
        ViewContext.data.isRussianPassport = false;
        ViewContext.data.isNotRussianPassport = true;

        ViewContext.data.code = Context.data.russian_passport_department_code;
        ViewContext.data.number = Context.data.russian_passport_number;
        ViewContext.data.series = Context.data.russian_passport_series;

        Context.data.russian_passport_department_code = undefined;
        Context.data.russian_passport_number = undefined;
        Context.data.russian_passport_series = undefined;
    }
}