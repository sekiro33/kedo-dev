class MyRole {
    group:UserGroupItem|UserItem[]| OrganisationStructureItem
    type: 'group' | 'user' | 'orgstruct'
    code: string
    constructor (group:UserGroupItem|UserItem[]|OrganisationStructureItem,type:'group' | 'user' | 'orgstruct',code:string){
        this.code = code;
        this.group = group;
        this.type = type;
    }
   getUsers(): Promise<UserItem[]> {
        if(this.type == "group"){
            return (<UserGroupItem> this.group).users();
        }
        else if (this.type == "orgstruct") {
            return System.users.search().where(i => i.osIds.has((<OrganisationStructureItem> this.group))).size(10000).all()
        }
        else return new Promise<UserItem[]>(()=><UserItem[]>this.group)
    }
    json():any {
        return{
             code:this.code,
            type:this.type
        }
    }
};

async function createGroupRights(): Promise<void> {
    const organizations = await Context.fields.org_app.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const mappedGroups = organizations.map(org => {
        if (!org.data.org_groups) {
            return;
        };
        return {
            id: org.id,
            groups: [...org.data.org_groups.map(g => g.code)]
        }
    }).filter((group: any) => group!);
    const allGroups = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null)
    )).size(10000).all();
    let promises: Promise<void>[] = []

    Context.data.debug = JSON.stringify(mappedGroups)

    for (let orgGroups of mappedGroups) {
        const organization = organizations.find(org => org.id === orgGroups!.id);
        const allDocsJson: {path: string, name: string}[] = JSON.parse(Context.data.parent_process_json!);
        for (let groupCode of orgGroups!.groups) {
            const group = allGroups.find(g => g.id === groupCode);
            const groupRole = new MyRole(group!, "group", groupCode) as Role;
            const rightsExists = await Context.fields.rights_app.app.search().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__name.eq(`Права доступа ${group!.data.__name}`)
            )).first();
            if (!rightsExists) {
                const newRightApp = Context.fields.rights_app.app.create();
                newRightApp.data.org_groups = [];
                newRightApp.data.__name = `Права доступа ${group!.data.__name}`;
                newRightApp.data.organization = organization;
                let table = newRightApp.data.doc_table;
                for (let doc of allDocsJson) {
                    const newRow = table!.insert();
                    newRow.doc_type = doc.name;
                    newRow.ns_and_code = doc.path;
                    newRow.access = true;
                };

                newRightApp.data.org_groups = [groupRole]
                newRightApp.data.doc_table = table;
                promises.push(newRightApp.save());
            } else {
                let table = rightsExists.fields.doc_table.create();
                for (let doc of allDocsJson) {
                    const newRow = table!.insert();
                    newRow.doc_type = doc.name;
                    newRow.ns_and_code = doc.path;
                    newRow.access = true;
                };
                rightsExists.data.doc_table = table;
                promises.push(rightsExists.save());
                Context.data.debug += `group Права доступа ${group!.data.__name} exists`
            }
        };
    };

    await Promise.all(promises);
};