/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function staff_add_category(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    const application = await Context.data.category_assignment!.fetch();
    const category = await application.data.staff_category!.fetch();
    const row = staff.data.categories_table!.insert();
    row.staff_categories = application.data.staff_category!;
    row.expiration_date = Context.data.expiration_date!;
    row.assignment_date = new TDate();
    if (category.data.possibility_overtime_work)
        staff.data.refuse_overtime_work_noticed = false;
    await staff.save();
    Context.data.alert_body = `Вам присвоена категория ${(await application.data.staff_category!.fetch()).data.__name}`;


 if (category.data.code == 'invalid_child') {
        if (application.data.residence_child_confirmation) {
            let app = Context.fields.personal_documents.app.create();
            app.data.staff = staff;
            app.data.type_personal_documents = await Context.fields.personal_documents.app.fields.type_personal_documents.app.search().where((f, g) => g.and(f.__deletedAt.eq(null),
                f.__name.eq('Документ о месте жительства ребёнка-инвалида'))).first();
            app.data.__file = application.data.residence_child_confirmation;
            if (application.data.information_about_child) {
                app.data.family_composition = application.data.information_about_child;
            }
            await app.save();
        }
        if (application.data.medical_disability_confirmation) {
            let app = Context.fields.personal_documents.app.create();
            app.data.staff = staff;
            app.data.type_personal_documents = await Context.fields.personal_documents.app.fields.type_personal_documents.app.search().where((f, g) => g.and(f.__deletedAt.eq(null),
                f.__name.eq('Справка об установлении инвалидности'))).first();
            app.data.__file = application.data.medical_disability_confirmation
            app.data.expiration_date = Context.data.validity_period_isability_certificate;
            if (application.data.information_about_child) {
                app.data.family_composition = application.data.information_about_child;
            }
            await app.save();
        }
    }
    
}

async function set_permissions(): Promise<void> {
    if (!Context.data.head_user) {
        let staff = await Context.data.staff!.fetch();
        await staff.sendMessage('Отсутствует руководитель', 'Не удалось определить руководителя сотрудника');
        return;
    }
    let app = await Context.data.category_assignment!.fetch();
    const props = Object.getOwnPropertyNames(app.fields)
    await Promise.all(props.map(async prop => {
        if ((app.fields[prop] as any).type && (app.fields[prop] as any).type == "FILE") {
            if (app.data[prop]) {
                if (app.data[prop].length != undefined) {
                    for (let file of (app.data[prop] as FileItemRef[])) {
                        let old_perms = await file.getPermissions();
                        old_perms.values.push(new PermissionValue(Context.data.head_user!, [PermissionType.READ]))
                        await file.setPermissions(old_perms)
                    }
                }
                else {
                    let old_perms = await app.data[prop].getPermissions();
                    old_perms.values.push(new PermissionValue(Context.data.head_user!, [PermissionType.READ]))
                    await (app.data[prop] as FileItem).setPermissions(old_perms)
                }
            }
        }
    }))
}



async function status_check(): Promise<boolean> {
    let app = await Context.data.application_category_assignment!.fetch()
    if (app.data.__status && app.data.__status.code === app.fields.__status.variants.removed.code)
        return true
    else
        return false
}

async function condition_check(): Promise<boolean> {
    let app = await Context.data.category_assignment!.fetch();
    let staff_category = await app!.data.staff_category!.fetch();
    if (staff_category!.data.perpetual == false) {
        return true;
    }
    else {
        return false;
    }
}

async function createStatusObj(app: any, status: string): Promise<void> {  
    const obj_status = {
        'app' : {
            'namespace' : app.namespace,
            'code'      : app.code,
            'id'        : app.id,
        },
        'status'    : status,
    }
    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function createStatusAssignmentCanceled(): Promise<void> {
    createStatusObj(Context.data.category_assignment, 'cancelled');
}

async function createStatusAssignmentSigningApp(): Promise<void> {
    createStatusObj(Context.data.category_assignment, 'signing_application');
}

async function createStatusCompleted(): Promise<void> {
    createStatusObj(Context.data.category_assignment, 'completed');
}

async function createStatusPending(): Promise<void> {
    createStatusObj(Context.data.category_assignment, 'pending');
}

async function createStatusApproval(): Promise<void> {
    createStatusObj(Context.data.category_assignment, 'approval');
}

async function createStatusCorrection(): Promise<void> {
    createStatusObj(Context.data.category_assignment, 'correction');
}

async function createStatusStatementCorrection(): Promise<void> {
    createStatusObj(Context.data.application_category_assignment, 'correction');
}

async function createStatusStatementAgreedSigned(): Promise<void> {
    createStatusObj(Context.data.application_category_assignment, 'agreed_signed');
}

async function createStatusStatementApproval(): Promise<void> {
    createStatusObj(Context.data.application_category_assignment, 'approval');
}
