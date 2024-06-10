/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function ext_user_get(): Promise<void> {
    let staff = (await (await Context.data.setlement_sheet!.fetch()).data.staff!.fetch());
    Context.data.staff = staff;
    Context.data.user = staff.data.ext_user
}




async function status_line_change(): Promise<void> {
    let app = await Context.data.setlement_sheet!.fetch();
    app.data.line_status = app.data.__status!.code+';'+app.data.__status!.name;
    await app.save();
}

async function set_filed(): Promise<void> {
    let app = await Context.data.setlement_sheet!.fetch();
    app.data.line_file_name = (await app.data.__file!.fetch()).data.__name;    
}

async function changeStatusSigning(): Promise<void> {
    if (!Context.data.setlement_sheet) {
        throw new Error("Context.data.setlement_sheet is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.setlement_sheet.namespace,
            code : Context.data.setlement_sheet.code,
            id : Context.data.setlement_sheet.id,
        },
        status : "signing",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusAgreedSigned(): Promise<void> {
    if (!Context.data.setlement_sheet) {
        throw new Error("Context.data.setlement_sheet is undefined");
    }

    const obj_status = {
        app : {
            namespace : Context.data.setlement_sheet.namespace,
            code : Context.data.setlement_sheet.code,
            id : Context.data.setlement_sheet.id,
        },
        status : "agreed_signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}
