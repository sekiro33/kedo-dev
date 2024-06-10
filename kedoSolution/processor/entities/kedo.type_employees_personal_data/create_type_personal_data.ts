
interface ITypePersonalData {
    name: string,
    code: string,
    application_personal_data: boolean,
    order_personal_data: boolean,
    additional_agreement_personal_data: boolean,
    child_personal_data: boolean,
    use_personal_docs: boolean,
}

const PERSONALDATA: ITypePersonalData[] = [
    {
        name: "Паспортные данные",
        code: "passport_data",
        application_personal_data: true,
        order_personal_data: true,
        additional_agreement_personal_data: true,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Изменение адреса регистрации",
        code: "change_address_registration",
        application_personal_data: true,
        order_personal_data: true,
        additional_agreement_personal_data: true,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Изменение фактического места жительства",
        code: "change_residence",
        application_personal_data: false,
        order_personal_data: false,
        additional_agreement_personal_data: false,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Изменение СНИЛС",
        code: "changt_snils",
        application_personal_data: false,
        order_personal_data: false,
        additional_agreement_personal_data: false,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Изменение номера телефона",
        code: "change_phone_number",
        application_personal_data: false,
        order_personal_data: false,
        additional_agreement_personal_data: false,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Данные водительского удостоверения",
        code: "data_driver",
        application_personal_data: false,
        order_personal_data: false,
        additional_agreement_personal_data: false,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Сведения о браке",
        code: "marriage_information",
        application_personal_data: false,
        order_personal_data: false,
        additional_agreement_personal_data: false,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Сведения о воинском учете",
        code: "military_registration",
        application_personal_data: false,
        order_personal_data: false,
        additional_agreement_personal_data: false,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Данные о владении иностранным языком",
        code: "data_language",
        application_personal_data: false,
        order_personal_data: false,
        additional_agreement_personal_data: false,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Сведения об образовании",
        code: "data_education",
        application_personal_data: false,
        order_personal_data: false,
        additional_agreement_personal_data: false,
        child_personal_data: false,
        use_personal_docs: false,
    },
    {
        name: "Сведения о составе семьи",
        code: "composition_family_information",
        application_personal_data: false,
        order_personal_data: false,
        additional_agreement_personal_data: false,
        child_personal_data: true,
        use_personal_docs: false,
    },
]

async function createTypePersonalData(): Promise<void> {
    let promises: Promise<void>[] = [];
    
    const created_apps = await Context.fields.type_employees_personal_data.app.search().where(f => f.__deletedAt.eq(null)).size(100).all();

    for (const personal_data of PERSONALDATA) {
        let app = created_apps.find(f => f.data.code == personal_data.code);

        if (!app) {
            app = Context.fields.type_employees_personal_data.app.create();
        }

        app.data.name = personal_data.name;
        app.data.code = personal_data.code;
        app.data.application_personal_data = personal_data.application_personal_data;
        app.data.order_personal_data = personal_data.order_personal_data;
        app.data.additional_agreement_personal_data = personal_data.additional_agreement_personal_data;
        app.data.child_personal_data = personal_data.child_personal_data;
        app.data.use_personal_docs = personal_data.use_personal_docs;

        promises.push(app.save());
    }

    await Promise.all(promises);
}
