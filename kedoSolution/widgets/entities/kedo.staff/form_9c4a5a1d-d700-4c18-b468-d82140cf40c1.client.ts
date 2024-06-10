
async function validate(): Promise<ValidationResult> {
    let result = new ValidationResult();
    if (ViewContext.data.all_docs_signed == false || !ViewContext.data.all_docs_signed) {
        result.addViewContextError("all_docs_signed", "Все документы должны быть подписаны.")
    };
    return result;
}