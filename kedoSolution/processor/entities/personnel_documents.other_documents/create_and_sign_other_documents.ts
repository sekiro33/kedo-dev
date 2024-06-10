/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function set_status_set(): Promise<void> {
    let app = await Context.data.other_documents!.fetch();
    app.data.line_status = app.data.__status!.code + ';' + app.data.__status!.name;
    await app.save();
}

async function getStaffApp(): Promise<void> {
    if (!Context.data.staff_user)
        Context.data.staff_user = Context.data.__createdBy
    const staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(Context.data.staff_user!)
        ))
        .first()
    Context.data.staff = staff
}

async function calc_overdue_date(): Promise<void> {
    // Если дату указали во входных параметрах - пропускаем.
    if (Context.data.overdue_date) {
        return;
    }

    // Иначе, устанавливаем дату подписания сами.
    const currentDate = new Datetime();
    Context.data.overdue_date = await System.productionSchedule.calcDate(currentDate, new Duration(8, 'hours'));
}

async function changeStatusSigning(): Promise<void> {
    if (!Context.data.other_documents) {
        throw new Error("Context.data.other_documents is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.other_documents.namespace,
            code: Context.data.other_documents.code,
            id: Context.data.other_documents.id,
        },
        status: "signing",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusCancelled(): Promise<void> {
    if (!Context.data.other_documents) {
        throw new Error("Context.data.other_documents is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.other_documents.namespace,
            code: Context.data.other_documents.code,
            id: Context.data.other_documents.id,
        },
        status: "cancelled",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function changeStatusSigned(): Promise<void> {
    if (!Context.data.other_documents) {
        throw new Error("Context.data.other_documents is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.other_documents.namespace,
            code: Context.data.other_documents.code,
            id: Context.data.other_documents.id,
        },
        status: "signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function getSigners(): Promise<void> {
    const kedo_settings = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('head_signing_notification')
        ))
        .first();
    Context.data.head_signing_notification = kedo_settings ? kedo_settings.data.status : false;

    const staff = await Context.data.staff?.fetch();
    const organization_staff = await staff?.data.organization?.fetch();
    Context.data.signers_app = organization_staff?.data.signatories;
}
