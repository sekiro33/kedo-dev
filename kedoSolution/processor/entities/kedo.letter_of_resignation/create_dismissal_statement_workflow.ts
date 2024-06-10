/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getKedoSettings(): Promise<void> {
    const custom_generate_resignation_letter = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('custom_generate_resignation_letter')
        ))
        .first();

    // Проектная генерация заявления на увольнение.
    Context.data.custom_generate = custom_generate_resignation_letter ? custom_generate_resignation_letter.data.status : false;
}

async function getLaborContractNumber(): Promise<void> {

}

async function checkKedoAgreement(): Promise<boolean> {
    if (!Context.data.staff) {
        throw new Error("Context.data.staff is undefined");
    }

    const staff = await Context.data.staff.fetch();

    // Согласие сотрудника на КЭДО.
    return staff.data.kedo_agreement ?? false;
}

async function setLineStatus(): Promise<void> {
    const letter_of_resignation = await Context.data.letter_of_resignation!.fetch()
    letter_of_resignation.data.line_status = `${letter_of_resignation.data.__status!.code};${letter_of_resignation.data.__status!.name}`
    await letter_of_resignation.save();
}

// async function createStatusObj(app: any, status: string): Promise<void> {  
//     const obj_status = {
//         'app' : {
//             'namespace' : app.namespace,
//             'code'      : app.code,
//             'id'        : app.id,
//         },
//         'status'    : status,
//     }
//     Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function createStatusSigning(): Promise<void> {
//     createStatusObj(Context.data.letter_of_resignation, 'signing');
// }
// async function createStatusAppSigning(): Promise<void> {
//     createStatusObj(Context.data.dismissal_app, 'signing_application');
// } 