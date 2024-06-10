/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function set_line_status(): Promise<void> {
    let app = await Context.data.benefit_application!.fetch();
    app.data.line_status = app.data.__status!.code+';'+app.data.__status!.name;
    await app.save();
}

async function set_line_file_name(): Promise<void> {
    let app = await Context.data.benefit_application!.fetch();
    app.data.line_status = app.data.__status!.code+';'+app.data.__status!.name;
    app.data.line_file_name = (await app.data.__file!.fetch()).data.__name;
    // let user =  await Context.data.responsible_user!.fetch();
    // app.data.responsible_user =user;
    // app.data.responsible = user.data.fullname!.lastname + ' ' + user.data.fullname?.firstname.slice(0, 1) + '.' + user.data.fullname?.middlename.slice(0, 1);
    await app.save();
    
}

async function get_position(): Promise<void> {
    const custom_generate_benefit_doc = await Context.fields.kedo_settings.app.search()
    .where((f,g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq('custom_generate_benefit_doc')
    ))
    .first();
    Context.data.custom_generate_benefit_doc = custom_generate_benefit_doc ? custom_generate_benefit_doc.data.status : false;
    let staff = await Context.fields.staff.app.search().where(f => f.ext_user.eq(Context.data.__createdBy)).first();
    if (staff) {
        const app = await Context.data.benefit_application!.fetch();
        app.data.staff = staff;
        await app.save();
        Context.data.staff = staff;
        Context.data.position = staff.data.position ? (await staff.data.position.fetch()).data.__name : undefined;
        let position_head = (await staff.data.organization!.fetch()).data.position_head;
        if(!position_head) return;
        let head_staff =  (await Context.fields.staff.app.search().where(f=> f.position.link(position_head!)).first());
        if(!head_staff) return;
        Context.data.head_user = head_staff.data.ext_user;
    }
}

async function getApp(): Promise<void> {
    const fetch_app = await Context.data.benefit_application!.fetch();
    
    Context.data.type_benefit = fetch_app.data.type_of_allowance;
    Context.data.edit_staff = fetch_app.data.staff;
    Context.data.employee_comment = fetch_app.data.employee_comment;
}

async function initializingVariable(): Promise<void> {
    Context.data.add_is_agreed = true;
}

async function verificationApproval(): Promise<boolean> {
    if (Context.data.add_is_agreed == true || Context.data.is_agreed == true) {
        return true;
    } else {
        return false;
    }
}

async function changeStatusSigning(): Promise<void> {
    if (!Context.data.benefit_application) {
        throw new Error("Context.data.benefit_application is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.benefit_application.namespace,
            code : Context.data.benefit_application.code,
            id : Context.data.benefit_application.id,
        },
        status : "signing",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusCancelled(): Promise<void> {
    if (!Context.data.benefit_application) {
        throw new Error("Context.data.benefit_application is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.benefit_application.namespace,
            code : Context.data.benefit_application.code,
            id : Context.data.benefit_application.id,
        },
        status : "cancelled",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusAgreedSigned(): Promise<void> {
    if (!Context.data.benefit_application) {
        throw new Error("Context.data.benefit_application is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.benefit_application.namespace,
            code : Context.data.benefit_application.code,
            id : Context.data.benefit_application.id,
        },
        status : "agreed_signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusCorrection(): Promise<void> {
    if (!Context.data.benefit_application) {
        throw new Error("Context.data.benefit_application is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.benefit_application.namespace,
            code : Context.data.benefit_application.code,
            id : Context.data.benefit_application.id,
        },
        status : "correction",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function getSettings(): Promise<void> {
    const accounting_in_processes = await Context.fields.kedo_settings.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq('accounting_in_processes'),
    )).first();
    Context.data.accounting_in_processes = accounting_in_processes ? accounting_in_processes.data.status : false;
}
