/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

//let employee_app: any;
const url = "https://1cfresh.com/a/hrm/1869190/ru_RU/odata/standard.odata/"
const pass = "T4ixesu"
const login = "admin.user"
let individualRes: any;

async function fillInfo(): Promise<void> {
    const employee_app = await Context.data.staff!.fetch();

    //-----------------------Виды документов----------------------------------

    Context.data.documents_types_url = "Catalog_ВидыДокументовФизическихЛиц?$format=json"

    //-----------------------Физические лица----------------------------------
    Context.data.request_type = !!employee_app.data.individual_id_1c ? "PATCH" : "POST";
    Context.data.employee_exists = !!employee_app.data.individual_id_1c;

    const individualObject = {
        "Description": employee_app.data.__name,
        "ДатаРождения": employee_app.data.date_of_birth!.format('YYYY-MM-DD') + "T00:00:00",
        "Пол": employee_app.data.sex ? "Мужской" : "Женский",
        "ИНН": employee_app.data.inn,
        "СтраховойНомерПФР": employee_app.data.snils,
        "ФИО": employee_app.data.full_name!.lastname + " " + employee_app.data.full_name!.firstname + " " + employee_app.data.full_name!.middlename,
        "Фамилия": employee_app.data.full_name!.lastname,
        "Имя": employee_app.data.full_name!.firstname,
        "Отчество": employee_app.data.full_name!.middlename,
        "Инициалы": employee_app.data.full_name!.firstname[0] + ". " + employee_app.data.full_name!.middlename[0] + ".",
    }
     Context.data.individual_request_body = JSON.stringify(individualObject)

    Context.data.url_individuals = employee_app.data.individual_id_1c  
        ? `Catalog_ФизическиеЛица(guid'${employee_app.data.individual_id_1c}')?$format=json`  
        : "Catalog_ФизическиеЛица?$format=json"

    //=========================================================================

}

async function fillEmployeeAndPassportInfo(): Promise<void> {
    const employee_app = await Context.data.staff!.fetch();
    const personalInfo = Context.data.individuals_result ? JSON.parse(Context.data.individuals_result) : undefined;

    if (personalInfo) {
        Context.data.individual_id = personalInfo["Ref_Key"]
        employee_app.data.individual_id_1c = personalInfo["Ref_Key"]
    }


    //Паспорт

    if (!employee_app.data.passport_saved_in_1s) {
        Context.data.renew_passport = true;
        Context.data.request_type_documents = "POST"
        const documentTypesJSON = JSON.parse(Context.data.document_types!)
        const passportId = documentTypesJSON!.value.find((obj: any) => {
            return obj["КодПФР"] === "ПАСПОРТ РОССИИ"
        })

        const documentObject = {
            "Физлицо_Key": Context.data.individual_id,
            "ВидДокумента_Key": passportId["Ref_Key"],
            "Серия": employee_app.data.passport_series,
            "Номер": employee_app.data.passport_number,
            "ДатаВыдачи": employee_app.data.date_of_issue!.year + "-" + employee_app.data.date_of_issue!.month + "-" + employee_app.data.date_of_issue!.day + "T00:00:00",
            "КемВыдан": employee_app.data.issued_by,
            "КодПодразделения": employee_app.data.department_code,
        }
        Context.data.telo_zaprosa_dokumenty = JSON.stringify(documentObject)

        Context.data.url_documents = "InformationRegister_ДокументыФизическихЛиц?$format=json"
        employee_app.data.passport_saved_in_1s = true;
    }
    await employee_app.save()


    //Сотрудник

    Context.data.request_type = !!employee_app.data.id_1c ? "PATCH" : "POST";

    const org = await employee_app.data.organization!.fetch();
    const orgRef = org.data.ref_key

    const employeeObject = !!employee_app.data.id_1c ? {
        "Description": employee_app.data.__name,
    } : {
        "Description": employee_app.data.__name,
        "ФизическоеЛицо_Key": Context.data.individual_id,
        "ГоловнаяОрганизация_Key": orgRef,
    }
    Context.data.request_body_employees = JSON.stringify(employeeObject)

    Context.data.url_employee = employee_app.data.id_1c  
        ? `Catalog_Сотрудники(guid'${employee_app.data.id_1c}')?$format=json`  
        : "Catalog_Сотрудники?$format=json"
    
}

async function fillId(): Promise<void> {
    const employee_app = await Context.data.staff!.fetch();
    const employeeInfo = Context.data.employees_response ? JSON.parse(Context.data.employees_response) : undefined;

    if (employeeInfo) {
        Context.data.employee_id = employeeInfo["Ref_Key"]
        employee_app.data.id_1c = employeeInfo["Ref_Key"]
        await employee_app.save()
    }
}




