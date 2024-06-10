/* Client scripts module */

declare const console: any;
declare const window: any;
declare const document: any;

type fileJson = {
    file_id: string,
    doc_name: string,
    doc_type: string
}

type goskeyDocsMeta = {
    docs_package_name: string,
    files: fileJson[]
};

let goskeyDocs: goskeyDocsMeta = {
    docs_package_name: "ELMA365 КЭДО",
    files: []
};

let goskeyAddButton: any;

async function onInit(): Promise<void> {
    const current_user = await System.users.getCurrentUser();
    const staff = await Context.fields.signatory_app.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(current_user),
        ))
        .first();
    if (staff && staff.data.organization) {
        const staff_organization = await staff.data.organization.fetch();
        Context.data.signatory_staffs_organization = staff_organization;
        //Context.data.staff_chief_app = staff_organization.data.signatories ? staff_organization.data.signatories[0] : undefined;
        // Context.fields.staff_chief_app.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
        //     appFields.organization.link(staff.data.organization!),
        //     appFields.__status.eq(Context.fields.signatory_app.app.fields.__status.variants.signed_documents)
        // ));
    }
    let waitForButton = window.setInterval(() => {
        goskeyAddButton = document.querySelector(".goskey-wrapper .btn-primary");
        if (!goskeyAddButton) {
            return;
        };
        window.clearInterval(waitForButton);
        goskeyAddButton.classList.add("disabled");
    }, 300)
    const now = new Datetime();
    Context.fields.limit.data.setFilter((f, g) => f.gte(now));
    Context.fields.staff_chief_limit.data.setFilter((f, g) => f.gte(now));
};

async function check_replacement(): Promise<void> {
    hide_message();
    if (Context.data.signatory_app && Context.data.limit) {
        const staff = await Context.data.signatory_app.fetch();
        const user = staff.data.ext_user;

        const replacement = await System.replacements.search().where((f, g) => g.and(
            f.absent.eq(user!),
            f.begin.lte(Context.data.limit!),
            f.end.gte(Context.data.limit!)
        )).first();

        if (replacement) {
            show_message('Внимание! Сотрудник отсутствует и по нему установлено замещение. Отправленный документ придет на подписание после завершения замещения.');
        }
    }
}

function show_message(text: string) {
    ViewContext.data.show_infoblock = true;
    ViewContext.data.infoblock_text = text;
}

function hide_message() {
    ViewContext.data.show_infoblock = false;
    ViewContext.data.infoblock_text = undefined;
}
async function checkDocType(): Promise<void> {
    ViewContext.data.staff_document_choose = false;
    ViewContext.data.document_employment_choose = false;
    if (Context.data.doc_type) {
        if (Context.data.doc_type.code === "personnel_doc") {
            ViewContext.data.staff_document_choose = true;
            ViewContext.data.document_employment_choose = false;
        } else {
            ViewContext.data.staff_document_choose = false;
            ViewContext.data.document_employment_choose = true;
        };
    }
};

async function handleExistingValue(): Promise<void> {
    if (Context.data.send_existing_doc) {
        return;
    } else {
        Context.data.doc_type = undefined;
        Context.data.documents_for_employment = undefined;
        Context.data.personnel_document = undefined;
    };
};

async function handleSignTypeChange(): Promise<void> {
    if (Context.data.sign_type && Context.data.sign_type.code == Context.fields.sign_type.variants.work_in_russia.code) {
        ViewContext.data.need_sign_from_employer_reedonly = true;
        Context.data.chief_sign_required = true;
    } else {
        ViewContext.data.need_sign_from_employer_reedonly = false;
    }
    if (Context.data.sign_type!.code === "goskey") {
        ViewContext.data.need_sign_from_employer = false;
        ViewContext.data.sign_type_is_goskey = true;
        Context.data.sign_wigh_goskey = true;
        ViewContext.data.staff_chief_app_visibility = false;
        ViewContext.data.staff_chief_limit_visibility = false;
    } else {
        ViewContext.data.need_sign_from_employer = true;
        ViewContext.data.sign_type_is_goskey = false;
        Context.data.sign_wigh_goskey = false;
        Context.data.goskey_files = [];
        await setStaffChief();
    }
};

async function addFileToPackage(): Promise<void> {
    const docType = await Context.data.document_type!.fetch();
    const file = await Context.data.file!.fetch();
    let docName = "";
    if (Context.data.app_name) {
        docName = Context.data.app_name;
    } else {
        const file = await Context.data.file!.fetch();
        docName = file.data.__name;
    };
    console.log(file.data.__id)
    const newFileMeta: fileJson = {
        //@ts-ignore
        file_id: file.data.__id?.id,
        doc_type: docType.data.app_code || "other_documents",
        doc_name: docName
    };

    if (!Context.data.goskey_files || Context.data.goskey_files.length < 1) {
        Context.data.goskey_files = [Context.data.file!];
    } else {
        Context.data.goskey_files = Context.data.goskey_files.concat([Context.data.file!]);
    };
    goskeyDocs.files.push(newFileMeta)
    if (Context.data.package_name) {
        goskeyDocs.docs_package_name = Context.data.package_name;
    };

    Context.data.goskey_docs_json = JSON.stringify(goskeyDocs);
    console.log(Context.data.goskey_docs_json);
    Context.data.file = undefined;
    Context.data.app_name = "";
    Context.data.document_type = undefined;
    await handleDisabledButton();
};

async function handleDisabledButton(): Promise<void> {
    if (!Context.data.sign_type || Context.data.sign_type.code !== "goskey") {
        return;
    };
    Context.data.document_type && Context.data.file ? goskeyAddButton.classList.remove("disabled") : goskeyAddButton.classList.add("disabled");
};

async function handleDocsChange(): Promise<void> {
    if (!Context.data.goskey_files) {
        Context.data.goskey_docs_json = "";
        return;
    };
    //@ts-ignore
    const fileIds = Context.data.goskey_files.map(f => f.id.id);
    let jsonFilesMeta = <goskeyDocsMeta>JSON.parse(Context.data.goskey_docs_json!);
    jsonFilesMeta.files = jsonFilesMeta.files.filter(file => fileIds.indexOf(file.file_id) !== -1);
    Context.data.goskey_docs_json = JSON.stringify(jsonFilesMeta);
};

async function setStaffChief(): Promise<void> {
    if (Context.data.chief_sign_required === true) {
        ViewContext.data.staff_chief_app_visibility = true;
        ViewContext.data.staff_chief_limit_visibility = true;
        ViewContext.data.send_staffs_organization_visibility = true;
    } else {
        ViewContext.data.staff_chief_app_visibility = false;
        ViewContext.data.staff_chief_limit_visibility = false;
        ViewContext.data.send_staffs_organization_visibility = false;
        Context.data.signatory_staffs = [];
        Context.data.send_staffs_organization = undefined;
        Context.data.whom_send = undefined;
        Context.data.staff_chief_app = undefined;
    }
}

async function setVisibilityWhomSend(): Promise<void> {
    ViewContext.data.whom_send_visibility = false;
    ViewContext.data.organization_visibility = false;
    ViewContext.data.staffs_visibility = false;
    Context.data.signatory_staffs = [];
    Context.data.whom_send = undefined;
    if (Context.data.send_staffs_organization === true) {
        ViewContext.data.whom_send_visibility = true;
        ViewContext.data.organization_visibility = true;
    }
    await setStaffsVisibility();
}

async function setStaffsVisibility(): Promise<void> {
    ViewContext.data.staffs_visibility = false;
    if (Context.data.whom_send) {
        if (Context.data.whom_send.code === 'selected_staffs') {
            ViewContext.data.staffs_visibility = true;
        }
    }
}

async function employmentPlacementOnChange(): Promise<void> {
    // Сбрасываем значение выбранного подписанта
    Context.data.staff_chief_app = undefined;
    
    if (!Context.data.employment_placement) {
        return;
    }

    const employment_placement = await Context.data.employment_placement.fetch();

    if (!employment_placement.data.organization) {
        throw new Error("На выбранном месте занятости не указана организация");
    }

    // При изменении места занятости сотрудника, показываем только сотрудников
    // организации места занятости
    Context.fields.staff_chief_app.data.setFilter((f, c, g) => g.and(
        f.__deletedAt.eq(null),
        f.organization.link(employment_placement.data.organization!),
    ));
}
