/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function fileds_get(): Promise<void> {
    Context.data.substitute = (await Context.data.substitute_staff!.fetch()).data.ext_user
    if (!Context.data.execution_duties) return;
    let app = await Context.data.execution_duties.fetch();
    if (!app.data.inf_about_acting) return;
    let row = app.data.inf_about_acting.find(f => f.substitute = Context.data.substitute_staff!)
    Context.data.percent = row?.percent;
    if (row && row.type_surcharge.code == Context.fields.execution_duties.app.fields.inf_about_acting.fields.type_surcharge.variants.fixed_amount.code) {
        Context.data.type_surcharge = 'руб'
    } else {
        Context.data.type_surcharge = '%'
    }
}

async function getBossPositiion(): Promise<void> {
    if (Context.data.boss) {
        const headApp = await Context.fields.substitute_staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.boss!)
            ))
            .first()
        Context.data.director = headApp;
        Context.data.boss_position = headApp!.data.position
    }
}

async function checkConsent(): Promise<void> {
    const app = await Context.data.execution_duties!.fetch();
    app.data.count_signatories = (app.data.count_signatories || 0) + 1;
    if (app.data.execution_responsibilities_consent && app.data.execution_responsibilities_consent.length > 0) {
        app.data.execution_responsibilities_consent.push(Context.data.execution_responsibilities_consent!);
    } else {
        app.data.execution_responsibilities_consent = [];
        app.data.execution_responsibilities_consent.push(Context.data.execution_responsibilities_consent!);
    }
    await app.save();
    if (app.data.count_signatories == app.data.total_number)
        await app.setStatus(app.fields.__status.variants.signing_sz)
}

async function check_kedo_agreement(): Promise<boolean> {
    let staff = await Context.data.substitute_staff!.fetch();
    if (staff.data.kedo_agreement == true) {
        return true;
    }
    else {
        return false;
    }
}

async function setStatusCancelled(): Promise<void> {
    if (!Context.data.execution_responsibilities_consent) {
        throw new Error("Context.data.execution_responsibilities_consent is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.execution_responsibilities_consent.namespace,
            code: Context.data.execution_responsibilities_consent.code,
            id: Context.data.execution_responsibilities_consent.id,
        },
        status: "cancelled",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusSigned(): Promise<void> {
    if (!Context.data.execution_responsibilities_consent) {
        throw new Error("Context.data.execution_responsibilities_consent is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.execution_responsibilities_consent.namespace,
            code: Context.data.execution_responsibilities_consent.code,
            id: Context.data.execution_responsibilities_consent.id,
        },
        status: "signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusPaperSigned(): Promise<void> {
    if (!Context.data.execution_responsibilities_consent) {
        throw new Error("Context.data.execution_responsibilities_consent is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.execution_responsibilities_consent.namespace,
            code: Context.data.execution_responsibilities_consent.code,
            id: Context.data.execution_responsibilities_consent.id,
        },
        status: "paper_signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusPaperSigning(): Promise<void> {
    if (!Context.data.execution_responsibilities_consent) {
        throw new Error("Context.data.execution_responsibilities_consent is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.execution_responsibilities_consent.namespace,
            code: Context.data.execution_responsibilities_consent.code,
            id: Context.data.execution_responsibilities_consent.id,
        },
        status: "signing",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function checkTypeCombination(): Promise<number> {
    const execution_duties = await Context.data.execution_duties!.fetch();
    const execution_duties_type = await execution_duties.data.type_combination!.fetch();

    if (execution_duties_type.data.code == 'performance_employee_duties') { //исполнение обязанностей
        Context.data.doc_type = 'Согласие на замещение';
        return 1;
    }

    if (execution_duties_type.data.code == 'combining_positions') { //совмещение должностей
        Context.data.doc_type = 'Уведомление о замещении';
        return 2;
    }
    Context.data.doc_type = 'Уведомление о замещении';
    return 3; //расширение зон обслуживания
}
