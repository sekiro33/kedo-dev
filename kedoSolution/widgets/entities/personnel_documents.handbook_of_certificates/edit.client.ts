/* Client scripts module */
declare const console:any
async function onInit(): Promise<void> {
    if (Context.data.universal_responsible) {
        ViewContext.data.view_responsible = true;
        ViewContext.data.view_organizations_reponsible_table = false;
    } else if (Context.data.universal_responsible == false) {
        ViewContext.data.view_organizations_reponsible_table = true;
        ViewContext.data.view_responsible = false;
    }
}

async function universal_responsible_change(): Promise<void> {
    if (Context.data.universal_responsible) {
        ViewContext.data.view_responsible = true;
        ViewContext.data.view_organizations_reponsible_table = false;
    } else {
        ViewContext.data.view_organizations_reponsible_table = true;
        ViewContext.data.view_responsible = false;
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
    if (Context.data.organizations_reponsible_table && Context.data.organizations_reponsible_table.length > 0 && !Context.data.universal_responsible) {
        let user_ids :string [] = [];
        user_ids = user_ids.concat(...(Context.data.organizations_reponsible_table.map(item=>item.responsible.map(user=>user.id))))
        let users = await System.users.search().where(f=>f.__id.in(user_ids)).size(1000).all()
        for (let i = 0; i < Context.data.organizations_reponsible_table.length; i++) {
            let row = Context.data.organizations_reponsible_table[i];
            let setting = settings.filter(item => item.data.organization && row.organization &&  item.data.organization.id == row.organization.id);
            for (let item of row.responsible) {
                let user_group_ids = users!.find(user=>user.id == item.id)?.data.groupIds!.map(item => item.id);
                if (setting && setting.length > 0) {
                    for (let j = 0; j < setting.length; j++) {
                        let st = setting[j];
                        if (user_group_ids!.indexOf(st.data.org_groups![0].code) != -1) {
                            if ((st.data.doc_table!.find(item => item.ns_and_code == 'personnel_documents;certificate'))!.access == true) {
                                break;
                            }
                            else {
                                let user = users!.find(user=>user.id == item.id)
                                if (j + 1 >= setting.length) {
                                    result.addMessage(user?.data.fullname!.lastname + ' ' + user?.data.fullname!.firstname + ' не имеет доступа к справкам.')
                                }
                            }
                        } else {
                            if (j + 1 >= setting.length) {
                                let user = users!.find(user=>user.id == item.id)
                                result.addMessage(user?.data.fullname!.lastname + ' ' + user?.data.fullname!.firstname + ' не имеет доступа к справкам.')
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
