/* Client scripts module */

async function validate(): Promise<ValidationResult> {
    let result = new ValidationResult();
    if (ViewContext.data.all_docs_signed == false || !ViewContext.data.all_docs_signed) {
        result.addMessage('Все документы должны быть подписаны.');
        result.title = 'Ошибка';
    };
    return result;
}
