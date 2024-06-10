/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function set_status_line(): Promise<void> {
    let app = await Context.data.free_from!.fetch();
    app.data.status_line = app.data.__status!.code + ';' + app.data.__status!.name;
    await app.save();
}

async function head_position_get(): Promise<void> {
    const free = await Context.data.free_from!.fetch();
    const staff = await free.data.staff!.fetch();
    Context.data.staff = staff;
    Context.data.provided_information_file = free.data.provided_information_file;
    if (Context.data.director_user) {
        const headApp = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.director_user!)
            ))
            .first()
        Context.data.director_app = headApp!;
        Context.data.boss_position = headApp!.data.position
    }
}

async function set_fields_contract(): Promise<void> {
    let app = await Context.data.free_from!.fetch();
    app.data.file_name_line = (await app.data.__file!.fetch()).data.__name;
    app.data.status_line = app.data.__status!.code + ';' + app.data.__status!.name;
    await app.save();
}


async function set_status_field(): Promise<void> {
    let app = await Context.data.free_from!.fetch();
    app.data.status_line = app.data.__status!.code + ';' + app.data.__status!.name;
    await app.save();
}

async function comment_get(): Promise<void> {
    let appeal = await Context.data.free_from!.fetch();
    const approvalLists = await appeal.docflow().getApprovalLists();
    Context.data.comment = '';
    let list = approvalLists[0];
    let respondets = list.respondents;
    for (let respondent of respondets) {
        if (respondent.status == "rejected") {
            Context.data.coordinating_comment = respondent.comment;
            break;
        }
    }
}

async function status_other_document_check(): Promise<boolean> {
    let app = await Context.data.other_documents!.fetch();
    if (app.data.__status!.code == app.fields.__status.variants.signed.code)
        return true
    else
        return false
}

async function get_file_name(): Promise<void> {
    Context.data.file_name = '';
    let file = (await Context.data.free_from!.fetch()).data.provided_information_file;
    let fetched = await file!.fetch();
    Context.data.file_name += '\n' + fetched.data.__name
}

async function getSettings(): Promise<void> {
    //Интеграция с учетной системой
    const integration_1c = await Context.fields.settings_kedo.app.search()
        .size(10000)
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('integration_1c')
        ))
        .first();
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;
    //Использовать 1С как мастер систему
    const alternative_integration = await Context.fields.settings_kedo.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('use_alternative_integration')
        ))
        .first();
    Context.data.use_alternative_integration = alternative_integration ? alternative_integration.data.status : false;
    //Использовать альтернативную учетную систему
    const alternative_system = await Context.fields.settings_kedo.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('use_alternative_system')
        ))
        .first();
    Context.data.use_alternative_system = alternative_system ? alternative_system.data.status : false;
}

async function get_director_app(): Promise<void> {
    const org_head = await Context.fields.director_app.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(Context.data.staff_chief!),
            f.__status.eq(Context.fields.director_app.app.fields.__status.variants.signed_documents),
        ))
        .first();

    Context.data.director_app = org_head;
}


async function changeStatusSigning(): Promise<void> {
    if (!Context.data.free_from) {
        throw new Error("Context.data.free_from is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.free_from.namespace,
            code : Context.data.free_from.code,
            id : Context.data.free_from.id,
        },
        status : "signing",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusCorrection(): Promise<void> {
    if (!Context.data.free_from) {
        throw new Error("Context.data.free_from is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.free_from.namespace,
            code : Context.data.free_from.code,
            id : Context.data.free_from.id,
        },
        status : "correction",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusApproval(): Promise<void> {
    if (!Context.data.free_from) {
        throw new Error("Context.data.free_from is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.free_from.namespace,
            code : Context.data.free_from.code,
            id : Context.data.free_from.id,
        },
        status : "approval",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusAgreedSigned(): Promise<void> {
    if (!Context.data.free_from) {
        throw new Error("Context.data.free_from is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.free_from.namespace,
            code : Context.data.free_from.code,
            id : Context.data.free_from.id,
        },
        status : "agreed_signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusChiefOrderSigning(): Promise<void> {
    if (!Context.data.free_from) {
        throw new Error("Context.data.free_from is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.free_from.namespace,
            code : Context.data.free_from.code,
            id : Context.data.free_from.id,
        },
        status : "chief_order_signing",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusCompleted(): Promise<void> {
    if (!Context.data.free_from) {
        throw new Error("Context.data.free_from is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.free_from.namespace,
            code : Context.data.free_from.code,
            id : Context.data.free_from.id,
        },
        status : "completed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusCancelled(): Promise<void> {
    if (!Context.data.free_from) {
        throw new Error("Context.data.free_from is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.free_from.namespace,
            code : Context.data.free_from.code,
            id : Context.data.free_from.id,
        },
        status : "cancelled",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusNeedDecision(): Promise<void> {
    if (!Context.data.free_from) {
        throw new Error("Context.data.free_from is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.free_from.namespace,
            code : Context.data.free_from.code,
            id : Context.data.free_from.id,
        },
        status : "need_decision",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}
