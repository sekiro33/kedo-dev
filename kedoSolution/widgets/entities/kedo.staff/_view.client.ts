import JSZip from "jszip.js"
import XLSX from "xlsx.full.min.js";
declare const console: any;
declare const window: any;
declare const document: any;

let currentModal: any;

class MyRole {
    group: UserGroupItem | UserItem[] | OrganisationStructureItem
    type: 'group' | 'user' | 'orgstruct'
    code: string
    constructor(group: UserGroupItem | UserItem[] | OrganisationStructureItem, type: 'group' | 'user' | 'orgstruct', code: string) {
        this.code = code;
        this.group = group;
        this.type = type;
    };
    getUsers(): Promise<UserItem[]> {
        if (this.type == "group") {
            return (<UserGroupItem>this.group).users();
        }
        else if (this.type == "orgstruct") {
            return System.users.search().where(i => i.osIds.has((<OrganisationStructureItem>this.group))).size(10000).all()
        }
        else return new Promise<UserItem[]>(() => <UserItem[]>this.group)
    }
    json(): any {
        return {
            code: this.code,
            type: this.type
        }
    }
};

async function onInit(): Promise<void> {
    console.log(Context.data.external_user)
    console.log(Context.data.employment_table)
    const groups = await System.userGroups.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    if (Context.data.employment_table) {
        console.log(Context.data.employment_table.length)
    }
    let waitForModal = window.setInterval(async () => {
        currentModal = document.querySelector(".complex-popup__content");
        if (!currentModal) {
            return
        };
        window.clearInterval(waitForModal);
        await checkUserAndLocation()
    }, 500)
    ViewContext.data.staff = await ViewContext.fields.staff.app.search().where(f => f.__id.eq(Context.data.__id)).first();
    console.log('staff: ', ViewContext.data.staff);
    let family_members = await ViewContext.fields.family_composition.app.search().where(f => f.staff.link(ViewContext.data.staff!)).size(10000).all();
    console.log(family_members);
    if (family_members && family_members.length > 0) {
        for (let member of family_members) {

            let row = ViewContext.data.current_family_info!.insert();
            row.family_composition = member;
            row.birth_date = member.data.birth_date!;
            row.relation_degree = member.data.relation_degree!;
            row.status = member.data.__status!.name
        }
    }
    ViewContext.data.current_family_info = ViewContext.data.current_family_info;

    ViewContext.data.details_status = [];

    if (Context.data.ext_user) {
        const staffUser = await Context.data.ext_user.fetch();
        const userGroups = await System.userGroups.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.subOrgunitIds.has(staffUser.id)
        )).size(10000).all();
        ViewContext.data.staff_groups = userGroups.map(group => {
            return new MyRole(group, "group", group.id) as Role
        });
    }

    let current_user = await System.users.getCurrentUser();
    let staff = await Application.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.ext_user.eq(current_user))).first();
    let user = await current_user.fetch();
    if (user.data.groupIds && user.data.groupIds.length > 0) {
        let user_gropusId = groups.filter(group => user.data.groupIds!.map(g => g.id).indexOf(group.id) != -1).map(group => group.data.code)
        console.log(user_gropusId);
        if ((~(user_gropusId.indexOf('abdecf4b-b6ba-419f-bac7-c1455d2a6159'))) || (~(user_gropusId.indexOf('administrators'))) || (~(user_gropusId.indexOf('supervisor')))) {
            ViewContext.data.view_tab_personal_documents = true;
            ViewContext.data.view_tab_family = true;
            ViewContext.data.user_is_admin = true;
        }
        else if ((~(user_gropusId.indexOf('dfede5be-5011-4ec9-b535-8c9ca3fc4d19')))) {
            ViewContext.data.view_tab_personal_documents = true;
            ViewContext.data.view_tab_family = false;
        }
        else if (staff && ViewContext.data.staff && staff.id == ViewContext.data.staff.id) {
            ViewContext.data.view_tab_personal_documents = true;
            ViewContext.data.view_tab_family = true;
        }
        else {
            ViewContext.data.view_tab_personal_documents = false;
            ViewContext.data.view_tab_family = false;
        }
    }

    const docs = await Namespace.app.types_documents_for_employment.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    //const names = ['Паспорт. Страница с регистрацией', 'Паспорт. Страница с фото и данными', 'СНИЛС', 'ИНН'];

    //const myDocs = docs.filter(f => names.find(i => i == f.data.__name));
    const myDocs = docs.filter(f => {
        if (f.data.default) {
            return f;
        }
    })
    if (!Context.data.docs_table_full) {
        for (const doc of myDocs) {
            const row = Context.data.documents_for_employment!.insert();
            row.doc = doc
            row.required = doc.data.required!;
        }
        Context.data.docs_table_full = true;
        console.log(Context.data.documents_for_employment)
    }

    Context.data.documents_for_employment = Context.data.documents_for_employment;
}

async function checkUserAndLocation(): Promise<void> {
    const user = await System.users.getCurrentUser();
    console.log(user);
    //@ts-ignore
    if ((user.originalData.profiles || window.location.href.includes("_portal")) && Context.data.ext_user?.id != user.id) {
        currentModal.innerHTML = "";
        const divBlocker = document.createElement("div");
        const blockerText = document.createElement("div");
        divBlocker.style.width = "100%";
        divBlocker.style.height = "100%";
        divBlocker.style.position = "absolute";
        divBlocker.style.display = "flex";
        divBlocker.style.justifyContent = "center";
        divBlocker.style.alignItems = "center";
        divBlocker.style.fontSize = "24px";
        blockerText.textContent = "Нет доступа к данному элементу с внешнего портала.";
        divBlocker.append(blockerText);
        currentModal.append(divBlocker);
    }
}

async function download_move_files(): Promise<void> {
    if (!Context.data.documents_employment)
        return
    let files: any[] = [];
    // await download_files(Context.data.documents_employment);
}

async function download_personnel_documents_files(): Promise<void> {
    if (!Context.data.personnel_documents)
        return
    let files: any[] = [];
    await download_files(Context.data.personnel_documents);
}


async function download_all_files(): Promise<void> {
    let files: any[] = [];
    files = files.concat(Context.data.personnel_documents);
    files = files.concat(Context.data.documents_employment);
    await download_files(files)
}



async function download_files(files: TApplication<Application$personnel_documents$personnel_documents$Data, any, Application$personnel_documents$personnel_documents$Processes>[] | undefined): Promise<void> {
    var jszip = new JSZip;
    console.log(jszip);
    if (!files)
        return
    await Promise.all(files.map(async f => {
        let f_fetched = await f.fetch();
        let f_file = (await f_fetched.data.__sourceRef!.fetch()).data.__file
        const res = await fetch(await f_file.getDownloadUrl())
        const content = await res.arrayBuffer()
        let file_name = ''
        if (f_fetched.data.__name.includes('.pdf') || f_fetched.data.__name.includes('.docx')) {
            file_name = f_fetched.data.__name;
        }
        else {

            file_name = f_fetched.data.__name + f_fetched.data.line_file_name!.substring(f_fetched.data.line_file_name!.lastIndexOf('.'), f_fetched.data.line_file_name!.length);
        }
        jszip.file(file_name, content);
    }))

    jszip.generateAsync({ type: "uint8array" })
        .then(async function (content: any) {
            const file = await ViewContext.fields.archiev_file.create(`${Context.data.__name}  ${new Datetime(new Date()).getDate().format('DD.MM.YYYY')}.zip`, content);
            ViewContext.data.archiev_file = file
            window.location.href = await ViewContext.data.archiev_file.getDownloadUrl();
        });
}
async function getUserLnaDocs(): Promise<void> {
    if (Context.data.ext_user) {
        let promises: Promise<void>[] = [];
        const lnaDocs = await Context.fields.list_sign_lna.app.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
        const user = await Context.data.ext_user.fetch();
        let jsonData: { "Перечень ЛНА": string, "Подразделение": string, "Должность": string, "ФИО": string, "Статус ознакомления": string, "Комментарий": string }[] = [];
        for (let doc of lnaDocs) {
            const informLists = await doc.docflow().getInformLists();
            if (!informLists || informLists.length < 1) {
                continue;
            };
            if (informLists.some(list => list.respondents.map(u => u.id).indexOf(user.id) !== -1)) {
                const positionName = Context.data.position ? await Context.data.position.fetch().then(p => p.data.__name) : "";
                const subdivisionName = Context.data.structural_subdivision ? await Context.data.structural_subdivision.fetch().then(s => s.data.__name) : "";
                const docName = doc.data.__name;
                const name = Context.data.__name;
                const informList = await doc.docflow().getInformLists().then(list => list.find(list => list.respondents.map(u => u.id).indexOf(user.id) != -1)!);
                const currentList = informList.respondents.find(u => u.id === user.id)!
                const status = currentList.status;
                let statustext = status === "done" ? "Ознакомлен" : status === "in_progress" ? "На ознакомлении" : "Отказ от ознакомления";
                const taskDate = `${currentList.ts.format("DD.MM.YYYY")} г.`;
                statustext += `\n ${taskDate}`
                const comment = currentList.comment;
                jsonData.push({
                    "Перечень ЛНА": docName,
                    "Подразделение": subdivisionName,
                    "Должность": positionName,
                    "ФИО": name,
                    "Статус ознакомления": statustext,
                    "Комментарий": comment || ""
                })
            };
        };

        if (!jsonData || jsonData.length < 1) {
            return;
        };
        const maxDocNameLength = Math.max(...jsonData.map(item => item["Перечень ЛНА"].length)) + 1;
        const maxSubdivisonLength = Math.max(...jsonData.map(item => item["Подразделение"].length)) + 1;
        const maxPositionLength = Math.max(...jsonData.map(item => item["Должность"].length)) + 1;
        const maxNameLength = Math.max(...jsonData.map(item => item["ФИО"].length)) + 1;
        const maxStatusLength = Math.max(...jsonData.map(item => item["Статус ознакомления"].length)) + 1;
        const maxCommentLength = Math.max(...jsonData.map(item => item["Комментарий"].length)) || 15;

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(jsonData);
        worksheet["!cols"] = [
            { wch: maxDocNameLength },
            { wch: maxSubdivisonLength },
            { wch: maxPositionLength },
            { wch: maxNameLength },
            { wch: maxStatusLength },
            { wch: maxCommentLength },
        ]
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ознакомление с ЛНА")
        const fileName = `Отчёт по ознакомлению с документами ЛНА сотрудника ${Context.data.__name}.xlsx`
        XLSX.writeFile(workbook, fileName)
    };
};

interface IVacationLeftover {
    position?: string,
    remainder: number,
}

interface IVacationLeftoverData {
    position?: string,
    leftovers: IVacationLeftover[],
    sum: number,
}

async function getActualLeftovers(): Promise<void> {
    if (!ViewContext.data.staff) {
        throw new Error("ViewContext.data.staff is undefined");
    }

    if (!Context.data.employment_table || Context.data.employment_table.length == 0) {
        throw new Error("У сотрудника не указаны места занятости");
    }

    const staff = ViewContext.data.staff;

    const vacation_leftovers = await Namespace.app.vacation_leftovers.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff.link(staff)
        ))
        .size(10000)
        .all();

    const employment_placement_ids = [...new Set(vacation_leftovers
        .filter(f => f.data.position != undefined)
        .map(f => f.data.position!.id)
    )];

    const employment_placements = await Namespace.app.employment_directory.search()
        .where(f => f.__id.in(employment_placement_ids))
        .size(employment_placement_ids.length)
        .all();

    const leftovers_data : IVacationLeftoverData[] = [];

    for (const employment_placement of employment_placements) {
        if (!employment_placement.data.position) continue;

        const leftovers = vacation_leftovers.filter(f => f.data.position?.id == employment_placement.data.position?.id);

        if (leftovers.length == 0) continue;

        const leftover_data: IVacationLeftoverData = {
            position: employment_placement.data.__name,
            leftovers: leftovers.map(l => {
                return {
                    remainder: l.data.remainder ?? 0,
                    position: l.data.position?.id,
                }
            }),
            sum : leftovers.reduce((prVal, curVal) => prVal += curVal.data.remainder ?? 0, 0)
        }

        leftovers_data.push(leftover_data);
    }

    ViewContext.data.leftovers_data = leftovers_data;
}
