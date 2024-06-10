/* Client scripts module */

async function onInit(): Promise<void> {
    if (!Context.data.document_recognition) {
        ViewContext.data.required_set_data = true;
        if (Context.data.table_personal_documents) {
            for (let item of Context.data.table_personal_documents) {
                const type_doc = await item.document_type.fetch();
                if (type_doc.data.__name == 'ИНН') { 
                    ViewContext.data.required_inn = true
                }
            }
        }
    } else {
        ViewContext.data.required_set_data = false;
    }
    
}
async function changeSnils(): Promise<void> {
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

        validateSnils(Context.data.snils)
    }
}

function validateSnils(snils: string) {
    if (Context.data.personal_data_employee == false) {
        if (!snils || snils.length < 14) {
            ViewContext.data.wrong_snils_format = false;
            return;
        };
        snils = snils.replace(/[\s-]/g, "");
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(snils[i]) * (9 - i);
        }
        let checkDigit = 0;
        if (sum < 100) {
            checkDigit = sum;
        } else if (sum > 101) {
            checkDigit = sum % 101;
            if (checkDigit === 100) {
                checkDigit = 0;
            }
        }
        if (checkDigit === parseInt(snils.slice(-2))) {
            ViewContext.data.wrong_snils_format = false;
            return;
        };
        ViewContext.data.wrong_snils_format = true;
    }
};

function validateInn(inn: string) {
    
    if (!inn || inn.length < 12) {
        ViewContext.data.wrong_inn_format = false;
        return;
    };
    let result = false;
    const checkDigit = function (inn: string, coefficients: number[]) {
        let n = 0;
        for (let i in coefficients) {
            n += coefficients[i] * parseInt(inn[i]);
        }
        return n % 11 % 10;
    };
    switch (inn.length) {
        case 10:
            let n10 = checkDigit(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
            if (n10 === parseInt(inn[9])) {
                result = true;
            }
            break;
        case 12:
            let n11 = checkDigit(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
            let n12 = checkDigit(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
            if ((n11 === parseInt(inn[10])) && (n12 === parseInt(inn[11]))) {
                result = true;
            }
            break;
    }
    if (!result) {
        ViewContext.data.wrong_inn_format = true;
        return;
    }
    ViewContext.data.wrong_inn_format = false;
    
};

async function changeTable(): Promise<void> {
    if (Context.data.table_personal_documents) {
        for (let i = 0; i < Context.data.table_personal_documents.length; i++) {
            if (!Context.data.table_personal_documents[i].document_type && Context.data.table_personal_documents[i].file_document) {
                Context.data.table_personal_documents.delete(i);
                Context.data.table_personal_documents = Context.data.table_personal_documents;
            }
        }
    }
}

async function changeINN(): Promise<void> {
    if (Context.data.inn) {
        validateInn(Context.data.inn)
    }
}
