/* Client scripts module */
declare const console:any;
async function universal_responsible_change(): Promise<void> {
    if (Context.data.universal_responsible) {
        ViewContext.data.required = true;
        ViewContext.data.view_table = false;
    } else {
        ViewContext.data.view_table = true;
        ViewContext.data.required = false;
        if (Context.data.organizations_reponsible_table!.length == 0) {
            let organizations = await Context.fields.organizations_reponsible_table.fields.organization.app.search().where((f, g) => g.and(f.__deletedAt.eq(null))).size(10000).all();
            for (let item of organizations) {
                let row = Context.data.organizations_reponsible_table!.insert();
                row.organization = item;
            }
            Context.data.organizations_reponsible_table = Context.data.organizations_reponsible_table;
        }
    }
}

async function validate(): Promise<ValidationResult> {
    let settings = await ViewContext.fields.rights_settings_by_doc.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    let result = new ValidationResult();
    if (Context.data.organizations_reponsible_table && Context.data.organizations_reponsible_table.length > 0 && !!Context.data.universal_responsible) {
        for (let i = 0; i < Context.data.organizations_reponsible_table.length; i++) {
            let row = Context.data.organizations_reponsible_table[i];
            let setting = settings.filter(item => item.data.organization!.id == row.organization.id);
            for (let item of row.responsible) {
                let user_group_ids = (await item.fetch()).data.groupIds!.map(item => item.id);
                if (setting && setting.length > 0) {
                    for (let j = 0; j < setting.length; j++) {
                        let st = setting[j];
                        if (user_group_ids!.indexOf(st.data.org_groups![0].code) != -1) {
                            if ((st.data.doc_table!.find(item => item.ns_and_code == 'personnel_documents;certificate'))!.access == true) {
                                break;
                            }
                            else {
                                let user = await item.fetch();
                                if (j + 1 >= setting.length) {
                                    result.addMessage(user.data.fullname!.lastname + ' ' + user.data.fullname!.firstname + ' не имеет доступа к справкам.')
                                }
                            }
                        } else {
                            if (j + 1 >= setting.length) {
                                let user = await item.fetch();
                                result.addMessage(user.data.fullname!.lastname + ' ' + user.data.fullname!.firstname + ' не имеет доступа к справкам.')
                            }
                        }
                    }
                } else{
                     result.addMessage('Не найдены настройки по документам')
                }
            }

        }

    }

    return result;
}