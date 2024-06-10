declare const document: any;
declare const window: any;
declare const console: any;

async function onInit(): Promise<void> {
    const table = Context.data.doc_table;
    if (!table || table.length < 1) {
        return;
    };
    let waitForTable = window.setInterval(() => {
        let domTable = document.querySelector(".kedo-table");
        if(!table) {
            return;
        };
        window.clearInterval(waitForTable);
        for (let row of table) {
            const rowTemplate = document.querySelector(".custom-table-row").content.cloneNode(true);
            const tableRow = rowTemplate.querySelector(".doc-row")
            const rowName = rowTemplate.querySelector(".doc-name");
            const rowNsCode = rowTemplate.querySelector(".doc-ns-code");
            const rowAccess = rowTemplate.querySelectorAll(".doc-access .kedo-button");
            rowAccess.forEach((btn: any) => btn.addEventListener("click", async (e: any) => {
                await handleAccessChange(e, tableRow);
            }));
            let buttonToDisable: any;
            if (row.access) {
                buttonToDisable = tableRow.querySelector(".button-access");
            } else {
                buttonToDisable = tableRow.querySelector(".button-restrict");
            };
            buttonToDisable.disabled = true;
            buttonToDisable.classList.add("clicked");
            rowName.textContent = row.doc_type;
            rowNsCode.textContent = row.ns_and_code;
            domTable.append(rowTemplate);
        };
    }, 200)
};

function handleButtonsBlock() {
    const kedoButtons = document.querySelectorAll(".kedo-button");
    kedoButtons.forEach((button: any) => button.classList.toggle("disabled"));
}

async function handleAccessChange(e: any, row: any) {
    handleButtonsBlock();
    e.target.classList.add("clicked");
    const access = e.target.dataset.access == "true" ? true : false;
    const otherButton = access ? e.target.previousElementSibling : e.target.nextElementSibling;
    otherButton.disabled = false;
    otherButton.classList.remove("clicked");
    e.target.disabled = true;
    const docNsAndCode = row.querySelector(".doc-ns-code").textContent;
    const docName = row.querySelector(".doc-name").textContent;
    const tableRow = Context.data.doc_table!.find(row => row.ns_and_code === docNsAndCode);

    if (tableRow) {
        tableRow.access = access;
        const docCode = docNsAndCode.split(";").slice(-1)[0];
        await changeDocAccess(docCode, access, docName);
    };
    handleButtonsBlock();
};

async function changeDocAccess(docCode: string, access: boolean, docName: string): Promise<void> {
    const organization = await Context.data.organization!.fetch();
    const orgRights = await Context.fields.rights_by_organization_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.organization.link(Context.data.organization!)
    )).first();
    console.log({orgRights})
    const roleId = Context.data.org_groups![0].code;
    const group = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(roleId)
    )).first();
    if (group) {
        console.log({group})
        const groupName = `Доступы для ${docName} ${organization.data.__name}`
        if (orgRights) {
            const groupToChange = await System.userGroups.search().where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.__name.eq(groupName)
            )).first();
            if (groupToChange) {
                console.log({groupToChange})
                let groupExists: boolean;
                if (groupToChange.data.subOrgunitIds?.find(gr => gr === group.id)) {
                    groupExists = true;
                } else {
                    groupExists = !groupToChange.data.subOrgunitIds || groupToChange.data.subOrgunitIds.length < 1;
                }

                if (access) {
                    if (!groupExists) {
                        console.log("add item")
                        await groupToChange.addItem(group)
                    } else {
                        console.log("already added")
                    }
                } else {
                    if (groupExists) {
                        console.log("delete group from access")
                        if (groupToChange.data.subOrgunitIds) {
                            for (let id of groupToChange.data.subOrgunitIds!) {
                                if (id == group.data.__id) {
                                    console.log("id exists")
                                    delete groupToChange.data.subOrgunitIds![groupToChange.data.subOrgunitIds!.indexOf(id)];
                                    break;
                                };
                            };
                            groupToChange.data.subOrgunitIds = groupToChange.data.subOrgunitIds!.filter(id => id);
                        }
                    };
                };
                await groupToChange.save();
                const currentElement = await Application.search().where(f => f.__id.eq(Context.data.__id)).first();
                if (currentElement) {
                    const table = currentElement.data.doc_table;
                    const rowToChange = table!.find(row => row.ns_and_code.split(";")[1] === docCode);
                    if (rowToChange) {
                        rowToChange.access = access;
                        currentElement.data.doc_table = table;
                        await currentElement.save();
                    };
                }
            };
        };
    }
};