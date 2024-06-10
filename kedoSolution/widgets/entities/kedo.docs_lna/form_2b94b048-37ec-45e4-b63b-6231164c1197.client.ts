/* Client scripts module */

async function validate(): Promise<ValidationResult> {
    let result = new ValidationResult();
    if(Context.data.structural_subdivision == undefined && Context.data.organization == undefined &&  Context.data.familiarizing == undefined){
        result.addMessage('Заполните хотя бы один из вариантов ознакомление сотрудников');
    }
    return result
}
