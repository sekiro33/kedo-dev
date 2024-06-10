/* Client scripts module */

async function onInit(): Promise<void> {
    let type_benefit = await Context.data.type_benefit!.fetch();
    
    if (type_benefit.data.__name == 'Беременность и роды - Пособие по беременности и родам') {
        ViewContext.data.dates = true;
        ViewContext.data.child = false;
        ViewContext.data.injury = false;
        ViewContext.data.death = false;

        ViewContext.data.file_required = true;
    }
    if (type_benefit.data.__name == 'Рождение ребенка - Единовременное пособие при рождении  ребенка'
        || type_benefit.data.__name == 'Уход за ребенком - Ежемесячное пособие по уходу за ребенком') {
        ViewContext.data.child = true;
        ViewContext.data.dates = false;
        ViewContext.data.injury = false;
        ViewContext.data.death = false;

        ViewContext.data.file_required = true;
    }
    if (type_benefit.data.__name == 'Проф. травма - Пособие по временной нетрудоспособности') {
        ViewContext.data.injury = true;
        ViewContext.data.child = false;
        ViewContext.data.dates = false;
        ViewContext.data.death = false;

        ViewContext.data.file_required = true;
    }
    if (type_benefit.data.__name == 'Погребение - Социальное пособие на погребение') {
        ViewContext.data.death = true;
        ViewContext.data.child = false;
        ViewContext.data.dates = false;
        ViewContext.data.injury = false;

        ViewContext.data.file_required = true;
    }

    if (type_benefit.data.__name == "Возмещение расходов на оплату четырех дополнительных выходных дней одному из родителей для ухода за детьми-инвалидами") {
        ViewContext.data.death = false;
        ViewContext.data.child = false;
        ViewContext.data.dates = false;
        ViewContext.data.injury = false;

        ViewContext.data.file_required = true;
    }
}

async function required_fields(): Promise<void> {
    let type_benefit = await Context.data.type_benefit!.fetch();
    
    if (type_benefit.data.__name == 'Беременность и роды - Пособие по беременности и родам') {
        ViewContext.data.dates = true;
        ViewContext.data.child = false;
        ViewContext.data.injury = false;
        ViewContext.data.death = false;

        ViewContext.data.file_required = true;
    }
    if (type_benefit.data.__name == 'Рождение ребенка - Единовременное пособие при рождении  ребенка'
        || type_benefit.data.__name == 'Уход за ребенком - Ежемесячное пособие по уходу за ребенком') {
        ViewContext.data.child = true;
        ViewContext.data.dates = false;
        ViewContext.data.injury = false;
        ViewContext.data.death = false;

        ViewContext.data.file_required = true;
    }
    if (type_benefit.data.__name == 'Проф. травма - Пособие по временной нетрудоспособности') {
        ViewContext.data.injury = true;
        ViewContext.data.child = false;
        ViewContext.data.dates = false;
        ViewContext.data.death = false;

        ViewContext.data.file_required = true;
    }
    if (type_benefit.data.__name == 'Погребение - Социальное пособие на погребение') {
        ViewContext.data.death = true;
        ViewContext.data.child = false;
        ViewContext.data.dates = false;
        ViewContext.data.injury = false;

        ViewContext.data.file_required = true;
    }

    if (type_benefit.data.__name == "Возмещение расходов на оплату четырех дополнительных выходных дней одному из родителей для ухода за детьми-инвалидами") {
        ViewContext.data.death = false;
        ViewContext.data.child = false;
        ViewContext.data.dates = false;
        ViewContext.data.injury = false;

        ViewContext.data.file_required = true;
    }
}
