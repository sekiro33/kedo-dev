
async function get_settings(): Promise<void> {
    Context.fields.the_department.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
        appFields.is_closed.eq(false)
    ));
    Context.fields.position.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
        appFields.is_closed.eq(false)
    ));


    if (!Context.data.staff) {
        const staff = await Application.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.__createdBy)
            ))
            .first()
        Context.data.staff = staff

    }

    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    const app_employment = settings.find(f => f.data.code == 'app_employment');
    Context.data.app_employment = app_employment ? app_employment.data.status : false;
    const integration_1c = settings.find(f => f.data.code == 'integration_1c');
    Context.data.integration_1c = integration_1c ? integration_1c.data.status : false;
    const alternative_integration = settings.find(f => f.data.code == 'use_alternative_integration');
    Context.data.use_alternative_integration = alternative_integration ? alternative_integration.data.status : false;
    const custom_lna = settings.find(f => f.data.code == 'custom_lna');
    Context.data.custom_lna = custom_lna ? custom_lna.data.status : false;
    const generation_labor_documents = settings.find(f => f.data.code == 'generation_labor_documents');
    Context.data.generation_labor_documents = generation_labor_documents ? generation_labor_documents.data.status : false;
    const documents_submitted_original = settings.find(f => f.data.code == 'documents_submitted_original');
    Context.data.documents_submitted_original = documents_submitted_original ? documents_submitted_original.data.value : '';
    const control_receipt_paper_originals_during_employment = settings.find(f => f.data.code == 'control_receipt_paper_originals_during_employment');
    Context.data.control_receipt_paper_originals_during_employment = control_receipt_paper_originals_during_employment ? control_receipt_paper_originals_during_employment.data.status : false;

    if (Context.data.staff) {
        let staff = await Context.data.staff.fetch();
        staff.data.id_process_recruitment = Context.data.__id;
        if (staff.data.full_name && staff.data.ext_user) {
            let user = await staff.data.ext_user.fetch();
            user.data.fullname!.middlename = staff.data.full_name!.middlename
        }
        await staff.save();
    }
}

async function comment_clear(): Promise<void> {
    Context.data.comment = '';
    const user = await Context.data.staff!.fetch();
    user.data.disclaimer_comment = undefined;
    user.data.invalid_fields = undefined;
    await user.save();
    Context.data.invalid_fields_new = undefined;
    Context.data.invalid_comment = undefined
}

async function status_check(): Promise<boolean> {
    const staff = await Context.data.staff!.fetch();
    if (staff.data.__status && staff.data.__status.code == staff.fields.__status.variants.waiting_for_document_editing.code) {
        return true;
    }
    return false;
}

async function documents_status_change(status_code: string): Promise<void> {
    const promises: Promise<void>[] = [];
    Context.data.set_documents = [];

    // Трудовой договор.
    const contract = await Namespace.app.labor_contract.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.staff!),
            f.__status.neq(Namespace.app.labor_contract.fields.__status.variants.removed),
            f.__status.neq(Namespace.app.labor_contract.fields.__status.variants.signed)
        ))
        .first();

    if (contract && contract.data.__status && contract.data.__status.code != 'signed') {
        // Меняем статус трудового договора.
        const statuses = contract.fields.__status.all;
        const status = statuses.find((i: { code: string; }) => i.code == status_code)!;
        await contract.setStatus(status);
        contract.data.line_status = `${status.code};${status.name}`;
        promises.push(contract.save())
        Context.data.set_documents.push(contract);
    }

    // Приказ о трудоустройстве.
    const admission_order = await Namespace.app.admission_order.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.staff!),
            f.__status.neq(Namespace.app.admission_order.fields.__status.variants.removed),
            f.__status.neq(Namespace.app.admission_order.fields.__status.variants.signed)
        ))
        .first();

    if (admission_order && admission_order.data.__status && admission_order.data.__status.code != 'signed') {
        // Меняем статус приказа о трудоустройстве.
        const statuses = admission_order.fields.__status.all;
        const status = statuses.find((i: { code: string; }) => i.code == status_code)!;
        await admission_order.setStatus(status);
        admission_order.data.line_status = `${status.code};${status.name}`;
        promises.push(admission_order.save())
        Context.data.set_documents.push(admission_order);
    }

    // Заявление о ПСТД.
    const app_provision_information = await Namespace.app.information_about_labor_activity.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.staff!),
            f.__status.neq(Namespace.app.information_about_labor_activity.fields.__status.variants.removed),
            f.__status.neq(Namespace.app.information_about_labor_activity.fields.__status.variants.signed)
        ))
        .first();

    if (app_provision_information && app_provision_information.data.__status && app_provision_information.data.__status.code != 'signed') {
        // Меняем статус заявления о ПСТД.
        const statuses = app_provision_information.fields.__status.all;
        const status = statuses.find((i: { code: string; }) => i.code == status_code)!;
        await app_provision_information.setStatus(status);
        // Меняем статус в строке заявления о ПСТД.
        app_provision_information.data.line_status = `${status.code};${status.name}`;
        promises.push(app_provision_information.save())
        Context.data.set_documents.push(app_provision_information);
    }

    // Согласия на обработку персональных данных
    const consent_processing_personal_data = await Namespace.app.consent_processing_personal_data.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.staff!),
            f.__status.neq(Namespace.app.consent_processing_personal_data.fields.__status.variants.signed),
        ))
        .first();

    if (consent_processing_personal_data && consent_processing_personal_data.data.__status && consent_processing_personal_data.data.__status.code != 'signed') {
        // Меняем статус согласия на обработку персональных данных.
        const statuses = consent_processing_personal_data.fields.__status.all;
        const status = statuses.find((i: { code: string; }) => i.code == status_code);
        if (status) {
            await consent_processing_personal_data.setStatus(status);
            // Меняем статус в строке согласия на обработку персональных данных.
            consent_processing_personal_data.data.line_status = `${status.code};${status.name}`;
            promises.push(consent_processing_personal_data.save());
            Context.data.set_documents.push(consent_processing_personal_data);
        }
    }

    // Прочие документы трудоустройства.
    const other_docs = await Namespace.app.additional_agreement_to_the_contract.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.staff!),
            f.__status.neq(Namespace.app.additional_agreement_to_the_contract.fields.__status.variants.removed),
            f.__status.neq(Namespace.app.additional_agreement_to_the_contract.fields.__status.variants.signed)
        ))
        .size(10000)
        .all();

    if (other_docs && other_docs.length > 0) {
        Context.data.set_documents = Context.data.set_documents.concat(other_docs);
        // Меняем статус прочих документов трудоустройства.
        const statuses = other_docs[0].fields.__status.all;
        const status = statuses.find((i: { code: string; }) => i.code == status_code);

        if (status) {
            await Promise.all(other_docs.map(f => f.setStatus(status)));
            other_docs.forEach(doc => {
                doc.data.line_status = `${status.code};${status.name}`;
                promises.push(doc.save())
            });
        }
    }

    // Дополнительные соглашения.
    const additional_agreement = await Namespace.app.additional_agreement.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(Context.data.staff!),
            f.__status.neq(Namespace.app.additional_agreement.fields.__status.variants.signed)
        ))
        .size(1000)
        .all();

    if (additional_agreement && additional_agreement.length > 0) {
        Context.data.set_documents = Context.data.set_documents.concat(additional_agreement);
        const additional_agreement_statuses = Namespace.app.additional_agreement.fields.__status.all;
        const status = additional_agreement_statuses.find((s: { code: string }) => s.code == status_code);

        if (status) {
            await Promise.all(additional_agreement.map(f => f.setStatus(status)));
            additional_agreement.forEach(doc => {
                doc.data.line_status = `${status.code};${status.name}`;
                promises.push(doc.save());
            });
        }
    }
    Context.data.set_documents = Context.data.set_documents;
    Context.data.number_documents = Context.data.set_documents.length;
    await Promise.all(promises);
}

async function soev_notification(): Promise<void> {
    Context.data.alert_body = 'Подпишите соглашение об электронном взаимодействии.';
}

async function employee_notification(): Promise<void> {
    Context.data.alert_body = `Процедура трудоустройства завершена и вы получили доступ в портал.
Теперь вы имеете возможность отправлять руководству заявления и служебные записки, ознакамливаться с приказами и распоряжениями компании.
Перейдите на портал для использования кадрового электронного документооборота.`;
}

async function employement_notification(): Promise<void> {
    let user = await Context.data.staff!.fetch();
    let name = '';
    let entity = await user.data.entity;
    if (entity) name = (await entity.fetch()).data.__name
    Context.data.alert_body = `Вы успешно прошли процедуру трудоустройства в компании ${name}.
Теперь вы имеете возможность отправлять руководству заявления и служебные записки, ознакамливаться с приказами и распоряжениями компании.
Перейдите на портал для использования кадрового электронного документооборота.`;
}

async function status_signed(): Promise<void> {
    await documents_status_change('signed');
}

async function status_signing(): Promise<void> {
    await documents_status_change('signing');
}

async function status_removed(): Promise<void> {
    await documents_status_change('removed');
}

async function regenerate_soev(): Promise<void> {
    Context.data.alert_body = `Для вас заново сгенерировано СоЭВ. Перейдите на портал и подпишите соглашение.`;
}

async function soev_field_clear(): Promise<void> {
    let staff = await Context.data.staff!.fetch();
    staff.data.scan_soev = undefined;
    await staff.save();
}

async function set_contract_filed(): Promise<void> {
    let statement = await Context.data.agreement_between_participants_of_electronic_interaction!.fetch();
    statement.data.line_status = statement.data.__status!.code + ';' + statement.data.__status!.name;
    await statement.save();
}

async function set_file_name_filed(): Promise<void> {
    let statement = await Context.data.agreement_between_participants_of_electronic_interaction!.fetch();
    statement.data.line_file_name = (await statement.data.__file!.fetch()).data.__name;
    await statement.save();
}

async function search_LNA(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    // let position: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>;
    const organization = staff.data.organization
    const position = await staff.data.position!.fetch();
    const lnaGroups = await Namespace.app.groups_lna.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.positions.has(position)
    )).size(10000).all();

    const commonLna = await Context.fields.docs_lna.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null)
    )).size(10000).all();

    const lnaForSign = commonLna.filter(doc => {
        let positionIds: string[] = [];

        if (doc.data.groups_lna) {
            const localGroups = lnaGroups.filter(gr => lnaGroups.indexOf(gr) != -1);
            positionIds = [].concat.apply([], localGroups.map(fr => fr.data.positions!.map(pos => pos.id)))
        };

        return (
            doc.data.wWho_acquainted?.code === "all" && doc.data.organization?.id === organization?.id
        ) || (
                doc.data.wWho_acquainted?.code === "groups" && positionIds.indexOf(position.id) != -1
            );
    });

    // let documents_pull = await Context.fields.docs_lna.app.search()
    //     .where((f, g) => g.and(
    //         f.__deletedAt.eq(null),
    //         g.or(
    //             g.and(
    //                 f.organization.link(organization!),
    //                 f.wWho_acquainted.eq({ name: "Все пользователи организации", code: "all" })
    //             ),
    //             g.and(
    //                 f.wWho_acquainted.eq({ name: "Группы для ознакомления", code: "groups" })
    //             )
    //         ),
    //         // f.positions_review.has(position!),
    //         g.or(
    //             f.__status.eq(Context.fields.docs_lna.app.fields.__status.variants.approved),
    //             f.__status.eq(Context.fields.docs_lna.app.fields.__status.variants.current)
    //         )
    //     ))
    //     .size(10000)
    //     .all();
    // if (documents_pull.some(doc => doc.data.wWho_acquainted!.code === "groups")) {
    //     documents_pull = documents_pull.filter(doc => lnaGroups.some(group => doc.data.groups_lna!.indexOf(group) != -1));
    // }
    Context.data.docs_lna = lnaForSign;

    staff.data.list_sign_lna = [];
    await staff.save();
}

async function getHr(): Promise<void> {
    const staff = await Context.data.staff!.fetch();

    if (staff.data.ext_user && staff.data.ext_user.id == Context.data.__createdBy.id) {
        Context.data.staff_member = Context.data.hr_dep![0];
    } else {
        Context.data.staff_member = Context.data.__createdBy;
    }
}

async function checkLNA(): Promise<number> {
    if (Context.data.docs_lna && Context.data.docs_lna.length > 0) {
        return 1
    } else {
        return 0
    }
}

async function getUserDocs(): Promise<void> {
    const user = await Context.data.staff!.fetch();
    const docsTable = user.data.documents_for_employment;
    if (docsTable && docsTable.length > 0) {
        const docs = await Promise.all(docsTable.map(f => f.doc.fetch()));
        for (let row of docsTable) {
            const docType = docs.find(f => f.id == row.doc.id)!;
            const docName = docType.data.__name;
            if (docName.includes("Страница с фото и данными")) {
                user.data.passport_page_with_photo_and_data = row.file_doc;
            } else if (docName.includes("Страница с регистрацией")) {
                user.data.the_passport_page_with_current_registration = row.file_doc;
            } else if (docName.includes("СНИЛС")) {
                user.data.snils_file = row.file_doc;
            } else if (docName.includes("ИНН")) {
                user.data.inn_file = row.file_doc;
            }
        }
    }
    await user.save()
}

async function checkUserOption(): Promise<boolean> {
    let user = await Context.data.staff!.fetch();
    return user.data.is_employed!
}

async function setUserSettings(): Promise<void> {
    let staff = await Context.data.staff!.fetch();
    staff.data.unep_issue_required = Context.data.unep_issue_required;
    staff.data.is_employed = Context.data.already_employed;
    staff.data.signing_soev_office = Context.data.signing_soev_office;
    staff.data.personal_data_employee = Context.data.personal_data_employee;
    staff.data.scans_personal_docs = Context.data.doc_scans_required;
    staff.data.consent_processing_pdn = Context.data.doc_scans_required;
    Context.data.docs_for_employment = staff.data.documents_for_employment;
    Context.data.external_user = staff.data.ext_user;
    await staff.save();
}

async function searchDoubleStaff(): Promise<void> {
    Context.data.staff_double = undefined;
    const staff = await Context.data.staff!.fetch();
    const doubleStaff = await Application.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            g.or(
                f.inn.eq(staff.data.inn!),
                f.snils.eq(staff.data.snils!)
            ),
            f.__id.neq(staff.data.__id),
        ))
        .first();
    if (doubleStaff) {
        Context.data.staff_double = doubleStaff
    }
}

async function getDoubleStaff(): Promise<void> {
    if (!Context.data.staff_double)
        return
    const staff = await Context.data.staff!.fetch();
    const doubleStaff = await Context.data.staff_double.fetch();
    doubleStaff.data.__name = staff.data.__name;
    doubleStaff.data.full_name = staff.data.full_name;
    doubleStaff.data.name = staff.data.name;
    doubleStaff.data.middlename = staff.data.middlename;
    doubleStaff.data.surname = staff.data.surname;
    doubleStaff.data.phone = staff.data.phone;
    doubleStaff.data.email = staff.data.email;
    doubleStaff.data.ext_user = staff.data.ext_user;
    doubleStaff.data.external_user = staff.data.external_user;
    doubleStaff.data.staff_access = staff.data.staff_access;
    doubleStaff.data.user_already_exists = staff.data.user_already_exists;
    doubleStaff.data.work_start = staff.data.work_start;
    doubleStaff.data.beginning_of_the_working_year = staff.data.beginning_of_the_working_year;
    doubleStaff.data.position = staff.data.position;
    doubleStaff.data.organization = staff.data.organization;
    doubleStaff.data.structural_subdivision = staff.data.structural_subdivision;
    doubleStaff.data.notification = staff.data.notification;
    doubleStaff.data.is_employed = staff.data.is_employed;
    doubleStaff.data.unep_issue_required = staff.data.unep_issue_required;
    doubleStaff.data.personal_data_employee = staff.data.personal_data_employee;
    doubleStaff.data.scans_personal_docs = staff.data.scans_personal_docs;
    doubleStaff.data.consent_processing_pdn = staff.data.consent_processing_pdn;
    doubleStaff.data.signing_soev_office = staff.data.signing_soev_office;
    doubleStaff.data.documents_for_employment = staff.data.documents_for_employment;
    doubleStaff.data.date_of_birth = staff.data.date_of_birth;
    doubleStaff.data.sex = staff.data.sex;
    doubleStaff.data.directory_of_regions = staff.data.directory_of_regions;
    doubleStaff.data.city = staff.data.city;
    doubleStaff.data.street = staff.data.street;
    doubleStaff.data.home = staff.data.home;
    doubleStaff.data.housing = staff.data.housing;
    doubleStaff.data.apartment = staff.data.apartment;
    doubleStaff.data.address = staff.data.address;
    doubleStaff.data.passport_series = staff.data.passport_series;
    doubleStaff.data.passport_number = staff.data.passport_number;
    doubleStaff.data.passport_department_code = staff.data.passport_department_code;
    doubleStaff.data.date_of_issue = staff.data.date_of_issue;
    doubleStaff.data.issued_by = staff.data.issued_by;
    doubleStaff.data.snils = staff.data.snils;
    doubleStaff.data.inn = staff.data.inn;
    doubleStaff.data.staff_categories = staff.data.staff_categories;
    staff.data.ext_user = undefined;
    staff.data.external_user = undefined;
    await doubleStaff.save();
    await doubleStaff.setStatus(doubleStaff.fields.__status.variants.input_data);

    await staff.setStatus(staff.fields.__status.variants.rejected);
    await staff.save();
    Context.data.staff = doubleStaff
}


















async function generateAppName(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    const name = staff.data.__name;
    const appName = `Документы трудоустройства (${name})`;
    Context.data.app_name = appName;
};

async function checkAggregateApp(): Promise<boolean> {
    if (Context.data.aggregate_app) {
        return true;
    };

    return false;
};

async function setDataLaborContract(): Promise<void> {
    if (Context.data.labor_contract && Context.data.staff && Context.data.position) {
        const labor_contract = await Context.data.labor_contract.fetch();
        const number_contract = labor_contract.data.labor_contract_number;
        const date_contract = labor_contract.data.labor_contract_date ? labor_contract.data.labor_contract_date : new Datetime;
        const staff = await Context.data.staff.fetch();
        if (staff.data.employment_table) {
            for (let row of staff.data.employment_table) {
                if (row.position.id == Context.data.position.id) {
                    row.number_employment_contract = number_contract ? number_contract : '1';
                    row.date_employment_contract = date_contract.format('DD.MM.YYYY');
                }
            }
            await staff.save();
        }
    }
}

async function setStatusAgreementNew(): Promise<void> {
    if (!Context.data.agreement_between_participants_of_electronic_interaction) {
        throw new Error("Context.data.agreement_between_participants_of_electronic_interaction is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.agreement_between_participants_of_electronic_interaction.namespace,
            code: Context.data.agreement_between_participants_of_electronic_interaction.code,
            id: Context.data.agreement_between_participants_of_electronic_interaction.id,
        },
        status: "new",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusAgreementCancelled(): Promise<void> {
    if (!Context.data.agreement_between_participants_of_electronic_interaction) {
        throw new Error("Context.data.agreement_between_participants_of_electronic_interaction is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.agreement_between_participants_of_electronic_interaction.namespace,
            code: Context.data.agreement_between_participants_of_electronic_interaction.code,
            id: Context.data.agreement_between_participants_of_electronic_interaction.id,
        },
        status: "cancelled",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusAgreementSigned(): Promise<void> {
    if (!Context.data.agreement_between_participants_of_electronic_interaction) {
        throw new Error("Context.data.agreement_between_participants_of_electronic_interaction is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.agreement_between_participants_of_electronic_interaction.namespace,
            code: Context.data.agreement_between_participants_of_electronic_interaction.code,
            id: Context.data.agreement_between_participants_of_electronic_interaction.id,
        },
        status: "signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusDocumentsSigning(): Promise<void> {
    await getDocumentFromMassive('signing');
}

async function setStatusDocumentsCancelled(): Promise<void> {
    await getDocumentFromMassive('cancelled');
}

async function setStatusDocumentsSigned(): Promise<void> {
    await getDocumentFromMassive('signed');
}

async function getDocumentFromMassive(status: string): Promise<void> {
    if (Context.data.number_documents) {
        const document = Context.data.set_documents![Context.data.number_documents - 1];
        const obj_status = {
            app: {
                namespace: document.namespace,
                code: document.code,
                id: document.id,
            },
            status: status,
        };

        Context.data.kedo_status = JSON.stringify(obj_status);
        Context.data.number_documents -= 1;
    } else {
        Context.data.number_documents = 0
    }


}

async function checkIntegrationAndParametr(): Promise<boolean> {
    //Если включена настройка проектной генерации используем ее
    if (Context.data.generation_labor_documents) {
        return false
    }
    //Если выключена проверяем есть ли интеграция с 1С
    else {
        if (Context.data.integration_1c) {
            return true
        } else {
            return false
        }
    }
}

async function cleanUserDocuments(): Promise<void> {
    let staff = await Context.data.staff!.fetch();
    if (staff.data.documents_for_employment) {
        let table = staff.data.documents_for_employment
        for (let i = 0; i < table.length; i++) {
            const type_doc = await table[i].doc.fetch()
            if (type_doc.data.deleted == true) {
                table.delete(i);
                i--
            }
            table = table;
        }
    }
    await staff.save();
}

async function checkNeedSoevControll(): Promise<void> {
    let staff = await Context.data.staff!.fetch();
    if (staff.data.organization) {
        let entity = await staff.data.organization!.fetch();
        Context.data.address_HR_department = entity.data.address_HR_department;
    }
    let additional_documents = Context.data.documents_submitted_original ? Context.data.documents_submitted_original : '';
    if (staff.data.signing_soev_office) {
        Context.data.documents_submitted_original = 'Уведомление о переходе на КЭДО' + `\n` + additional_documents;
        return
    }
    if (staff.data.kedo_agreement) {
        Context.data.documents_submitted_original = 'Уведомление о переходе на КЭДО' + `\n` + 'СоЭВ' + `\n` + additional_documents;
        return
    }
    Context.data.documents_submitted_original = 'Уведомление о переходе на КЭДО' + `\n` + additional_documents;
}

async function setTermTransferOriginals(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    const deadline_confirming_transfer_original_documents_employer = settings.find(f => f.data.code == 'deadline_confirming_transfer_original_documents_employer');
    const number_days = deadline_confirming_transfer_original_documents_employer ? (deadline_confirming_transfer_original_documents_employer.data.quantity ? deadline_confirming_transfer_original_documents_employer.data.quantity : 3) : 3;
    Context.data.deadline_confirming_transfer_original_documents_employer = (new Datetime).add(new Duration(number_days, 'days'));
}

async function setTermReceivingOriginals(): Promise<void> {
    const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all()
    const deadline_confirming_receipt_original_documents_from_employee = settings.find(f => f.data.code == 'deadline_confirming_receipt_original_documents_from_employee');
    const number_days = deadline_confirming_receipt_original_documents_from_employee ? (deadline_confirming_receipt_original_documents_from_employee.data.quantity ? deadline_confirming_receipt_original_documents_from_employee.data.quantity : 10) : 10;
    Context.data.deadline_confirming_receipt_original_documents_from_employee = (new Datetime).add(new Duration(number_days, 'days'));
}

async function setAddress(): Promise<void> {
    if (!Context.data.staff) {
        throw new Error("Не указан сотрудник. Context.data.staff is undefined");
    }

    const staff = await Context.data.staff.fetch();

    const region_app = await staff.data.directory_of_regions?.fetch();

    // Записываем адрес сотрудника.
    const region = region_app ? `${region_app.data.__name},` : ``;
    const housing = staff.data.housing ? ` к.${staff.data.housing}` : ``;
    const apartment = staff.data.apartment ? ` кв.${staff.data.apartment}` : ``;

    staff.data.address = `${region} г. ${staff.data.city}, ул. ${staff.data.street}, д.${staff.data.home}${housing}${apartment}`.trim();

    await staff.save();
}

async function checkGoskeyUnep(): Promise<boolean> {
    const staff = await Context.data.staff!.fetch();
    return staff.data.goskey_nep_released ?? false;
};

async function checkSignType(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    const organization = await staff.data.organization!.fetch();

    if (!organization.data.sign_provider) {
        return;
    };

    if (organization.data.sign_provider.map(p => p.code).indexOf("goskey") !== -1 && organization.data.sign_provider.length === 1) {
        Context.data.docs_signing_type = Context.fields.docs_signing_type.variants.goskey;
        return;
    };

    Context.data.sign_type_choice = organization.data.leave_choice_to_staff;

}

async function checkStaffSignType(): Promise<void> {
    const staff = await Context.data.staff!.fetch();

    if (staff.data.docs_signing_type!.code == "goskey") {
        Context.data.docs_signing_type = Context.fields.docs_signing_type.variants.goskey;
    } else {
        Context.data.docs_signing_type = Context.fields.docs_signing_type.variants.inner_sign;
    };
}
