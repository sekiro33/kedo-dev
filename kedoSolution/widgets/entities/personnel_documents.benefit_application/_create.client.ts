/* Client scripts module */

type StaffApp = TApplication<Application$kedo$staff$Data, any, Application$kedo$staff$Processes>;

async function onInit(): Promise<void> {
    ViewContext.data.is_file_need = false;
    ViewContext.data.hide_file = true;
    ViewContext.data.staff_hide = true;

    const initiators_vairiants = Context.fields.type_of_allowance.app.fields.initiators.variants;

    const user = await System.users.getCurrentUser();

    const staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user)
        ))
        .first();

    if (!staff) {
        throw new Error("Для текущего пользователя не найдена карточка сотрудника");
    }

    Context.data.staff = staff;

    const is_hr_staff = await isHrStaff(staff);

    if (is_hr_staff == true) {
        ViewContext.data.staff_hide = false;
        Context.fields.type_of_allowance.data.setFilter((f, c, g) => g.and(
            f.__deletedAt.eq(null),
            g.or(
                f.initiators.has(initiators_vairiants.staff),
                f.initiators.has(initiators_vairiants.personnel_staff)
            )
        ))
    } else {
        Context.fields.type_of_allowance.data.setFilter((f, c, g) => g.and(
            f.__deletedAt.eq(null),
            f.initiators.has(initiators_vairiants.staff),
        ))
    }
}

async function isHrStaff(staff: StaffApp): Promise<boolean> {
    const staff_employments = await Context.fields.employment_placement.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(staff),
            f.__status.eq(Context.fields.employment_placement.app.fields.__status.variants.actual)
        ))
        .size(1000)
        .all();

    const organizations = await Promise.all(staff_employments
        .filter(f => f.data.organization != undefined)
        .map(f => f.data.organization!.fetch())
    );

    const hr_dep = organizations.reduce((prVal, curVal) => prVal.concat(curVal.data.hr_department ?? []), [] as StaffApp[]);

    return hr_dep.some(s => s.id == staff.id);
}

async function allowanceTypeOnChange(): Promise<void> {
    clearFields();

    ViewContext.data.required_files = 'Выберите вид пособия';
    ViewContext.data.is_file_need = false;
    ViewContext.data.hide_file = true;

    if (!Context.data.type_of_allowance) {
        return;
    }

    const type_of_allowance = await Context.data.type_of_allowance.fetch();
    const required_files = type_of_allowance.data.list_of_required_documents;

    ViewContext.data.required_files = required_files;

    if (required_files && required_files.length > 0) {
        ViewContext.data.is_file_need = true;
        ViewContext.data.hide_file = false;
    }

    switch (type_of_allowance.data.__name) {
        case "Беременность и роды - Пособие по беременности и родам": {
            ViewContext.data.code_2_hide = false;
            ViewContext.data.code_2_need = true;
            break;
        }

        case "Уход за ребенком - Ежемесячное пособие по уходу за ребенком":
        case "Рождение ребенка - Единовременное пособие при рождении  ребенка": {
            ViewContext.data.code_3_hide = false;
            ViewContext.data.code_3_need = true;
            break;
        }

        case "Проф. травма - Пособие по временной нетрудоспособности": {
            ViewContext.data.code_5_hide = false;
            ViewContext.data.code_5_need = true;
            break;
        }

        case "Погребение - Социальное пособие на погребение": {
            ViewContext.data.code_6_hide = false;
            ViewContext.data.code_6_need = true;
            break;
        }

        default: {
            break;
        }
    }
}

function clearFields(): void {
    ViewContext.data.code_2_need = false;
    ViewContext.data.code_2_hide = true;
    ViewContext.data.code_3_need = false;
    ViewContext.data.code_3_hide = true;
    ViewContext.data.code_5_need = false;
    ViewContext.data.code_5_hide = true;
    ViewContext.data.code_6_need = false;
    ViewContext.data.code_6_hide = true;
}    
