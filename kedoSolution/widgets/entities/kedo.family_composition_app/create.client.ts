/* Client scripts module */

declare const document: any;

async function onInit(): Promise<void> {
    const current_user = await System.users.getCurrentUser();
    let staff = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.eq(current_user)
    )).first();

    if (staff) {
        Context.data.staff = staff;
    }

    Context.fields.staff.data.setFilter((f, c, g) => g.and(
        f.ext_user.eq(current_user)
    ));
}

async function changeChildDate(): Promise<void> {
    if (Context.data.birth_date) {
        const current_date = new TDate();
        if (Context.data.birth_date.after(current_date)) {
            ViewContext.data.error_child_date = "Дата рождения не может быть позднее текущей даты."
            ViewContext.data.view_error_child_date = true;
        } else {
            ViewContext.data.error_child_date = "";
            ViewContext.data.view_error_child_date = false;
        }
    }

    checkLabels();
}

function checkLabels() {
    const button_save = document.querySelectorAll('.btn-primary');
    for (let button of button_save) {
        if (button.innerText.includes('Сохранить')) {
            if (ViewContext.data.view_error_child_date === true || ViewContext.data.view_sex_error === true) {
                button.disabled = true;
            } else {
                button.disabled = false;
            }
        }
    }
}
async function changeType(): Promise<void> {
    if (Context.data.relation_degree) {
        if (Context.data.relation_degree.code == "husband_wife") {
            ViewContext.data.view_marriage_certificate = true;
        } else {
            ViewContext.data.view_marriage_certificate = false;
        }

        if (Context.data.relation_degree.code == "child") {
            ViewContext.data.view_birth_certificate = true;
        } else {
            ViewContext.data.view_birth_certificate = false;
        }

        if (Context.data.relation_degree.code == "mother") {
            Context.data.sex = Context.fields.sex.variants.female;
        }

        if (Context.data.relation_degree.code == "father") {
            Context.data.sex = Context.fields.sex.variants.male;
        }

        if (Context.data.relation_degree.code == "sister") {
            Context.data.sex = Context.fields.sex.variants.female;
        }

        if (Context.data.relation_degree.code == "brother") {
            Context.data.sex = Context.fields.sex.variants.male;
        }
    }

    checkLabels();
}

async function checkSex(): Promise<void> {
    if (Context.data.relation_degree && Context.data.sex) {
        if ((Context.data.relation_degree.code == "mother" || Context.data.relation_degree.code == "sister") && Context.data.sex.code == "male") {
            ViewContext.data.view_sex_error = true;
            ViewContext.data.sex_error = 'Указан неккоректный пол родственника.';

            checkLabels();
            return;
        } else {
            ViewContext.data.view_sex_error = false;
            ViewContext.data.sex_error = '';
        }

        if ((Context.data.relation_degree.code == "father" || Context.data.relation_degree.code == "brother") && Context.data.sex.code == "female") {
            ViewContext.data.view_sex_error = true;
            ViewContext.data.sex_error = 'Указан неккоректный пол родственника.';

            checkLabels();
            return;
        } else {
            ViewContext.data.view_sex_error = false;
            ViewContext.data.sex_error = '';
        }
    }

    checkLabels();
}

async function checkSnils(): Promise<void> {
    if (Context.data.snils) {
        let split_str = Context.data.snils.match(/(\d{1,3})/g);
        if (split_str && split_str[0].length == 3 && (split_str[1])) {
            Context.data.snils = split_str[0] + '-' + split_str[1];
        }
        if (split_str && split_str[1].length == 3 && (split_str[2])) {
            Context.data.snils += '-' + split_str[2];
        }

        if (split_str && split_str[2].length == 3 && (split_str[3])) {
            Context.data.snils += ' ' + split_str![3];
        }
    }
}
