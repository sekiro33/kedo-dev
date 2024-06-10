/* Client scripts module */
declare const console : any;

async function onInit(): Promise<void> {
    await combination_type_onchange();
}

async function combination_type_onchange(): Promise<void> {
    if (Context.data.combination_type) {

        await hide_fields();

        switch (Context.data.combination_type.code) {
            case 'expansion_service_areas':
                ViewContext.data.combination_type_expansion = true;
                break;

            case 'performance_duties':
                ViewContext.data.combination_type_performance = true;
                break;

            case 'professional_duties':
                ViewContext.data.combination_type_professional = true;
                break;
        }
    }
}

async function hide_fields(): Promise<void> {
    ViewContext.data.combination_type_performance = false;
    ViewContext.data.combination_type_professional = false;
    ViewContext.data.combination_type_expansion = false;
}
