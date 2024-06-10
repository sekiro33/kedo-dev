/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_template(): Promise<void> {
    const settings = await Context.data.application_for_the_transfer_of_salary_to_the_current_account!.getSettings();
    let files = await settings.getDocTemplates();
    for (let file of files) {
        let template = (await System.files.search().where((f, q) => q.and(f.__id.eq(file.fileId), f.__name.like('Заяв'))).first());
        if (template) {
            Context.data.template_file = template;
        }
    }
}

async function set_contract_field(): Promise<void> {
    let statement = await Context.data.application_for_the_transfer_of_salary_to_the_current_account!.fetch();
    statement.data.staff = await Context.fields.staff.app.search().where(f => f.ext_user.eq(Context.data.__createdBy)).first();
    statement.data.line_file_name = (await Context.data.document_file!.fetch()).data.__name;
    await statement.save();
}

async function status_string_refresh(): Promise<void> {
    let statement = await Context.data.application_for_the_transfer_of_salary_to_the_current_account!.fetch();
    statement.data.line_status = statement.data.__status!.code+';'+statement.data.__status!.name;
    await statement.save();
}

async function getDirector(): Promise<void> {
    const app = await Context.data.application_for_the_transfer_of_salary_to_the_current_account!.fetch();
    const staff = await app.data.staff!.fetch();
    const organization = await staff.data.organization!.fetch();
    const chief_position = await organization.data.position_head!.fetch();
    Context.data.director = chief_position.data.staff![0];
}

async function changeStatusSigning(): Promise<void> {
    if (!Context.data.application_for_the_transfer_of_salary_to_the_current_account) {
        throw new Error("Context.data.application_for_the_transfer_of_salary_to_the_current_account is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.application_for_the_transfer_of_salary_to_the_current_account.namespace,
            code : Context.data.application_for_the_transfer_of_salary_to_the_current_account.code,
            id : Context.data.application_for_the_transfer_of_salary_to_the_current_account.id,
        },
        status : "signing",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusCancelled(): Promise<void> {
    if (!Context.data.application_for_the_transfer_of_salary_to_the_current_account) {
        throw new Error("Context.data.application_for_the_transfer_of_salary_to_the_current_account is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.application_for_the_transfer_of_salary_to_the_current_account.namespace,
            code : Context.data.application_for_the_transfer_of_salary_to_the_current_account.code,
            id : Context.data.application_for_the_transfer_of_salary_to_the_current_account.id,
        },
        status : "cancelled",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusAgreedSigned(): Promise<void> {
    if (!Context.data.application_for_the_transfer_of_salary_to_the_current_account) {
        throw new Error("Context.data.application_for_the_transfer_of_salary_to_the_current_account is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.application_for_the_transfer_of_salary_to_the_current_account.namespace,
            code : Context.data.application_for_the_transfer_of_salary_to_the_current_account.code,
            id : Context.data.application_for_the_transfer_of_salary_to_the_current_account.id,
        },
        status : "agreed_signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}
