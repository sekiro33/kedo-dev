import XLSX from "xlsx.full.min.js";

declare const console: any;

let allStaff: ApplicationItem<Application$kedo$staff$Data, any>[];
let allUsers: UserItem[];
let subdivisions: ApplicationItem<Application$kedo$structural_subdivision$Data, any>[];
let positions: ApplicationItem<Application$kedo$position$Data, any>[];

async function onInit(): Promise<void> {
    allStaff = await Namespace.app.staff.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    allUsers = await System.users.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    subdivisions = await Namespace.app.structural_subdivision.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    positions = await Namespace.app.position.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
};

async function generateExcelFileFromLna(): Promise<void> {
    const currentLna = await Application.search().where(f => f.__id.eq(Context.data.__id)).first();
    const informList = await currentLna!.docflow().getInformLists().then(list => list[0])
    const rawData = informList.respondents.map(user => {
        const staff = allStaff.find(s => s.data.ext_user?.id === user.id);
        if (!staff) {
            return;
        };
        const subdivision = subdivisions.find(s => staff.data.structural_subdivision?.id === s.id);
        if (!subdivision) {
            return;
        };
        const position = positions.find(p => staff.data.position?.id === p.id);
        if (!position) {
            return;
        };
        const docName = Context.data.__name;
        const subdivisionName = subdivision.data.__name;
        const positionName = position.data.__name;
        const userName = staff.data.__name;
        let statusText = user.status === "done" ? "Ознакомлен" : user.status === "in_progress" ? "На ознакомлении" : "Отказ от ознакомления";
        statusText += ` ${user.ts.format("DD.MM.YYYY")} г.`;
        const comment = user.comment || "";
        return {
            "ЛНА": docName,
            "Подразделение": subdivisionName,
            "Должность": positionName,
            "ФИО": userName,
            "Статус ознакомления": statusText,
            "Комментарий": comment
        };
    }).filter(item => item != undefined);
    const docNameLength = Context.data.__name.length;
    const maxSubdivisionLength = Math.max(...rawData.map(item => item!["Подразделение"].length)) + 1;
    const maxPositionLength = Math.max(...rawData.map(item => item!["Должность"].length)) + 1;
    const maxUsernameLength = Math.max(...rawData.map(item => item!["ФИО"].length)) + 1;
    const maxStatusLength = Math.max(...rawData.map(item => item!["Статус ознакомления"].length)) || 15;
    const maxCommentLength = Math.max(...rawData.map(item => item!["Комментарий"].length)) + 1;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rawData);
    worksheet["!cols"] = [
        {wch: docNameLength},
        {wch: maxSubdivisionLength},
        {wch: maxPositionLength},
        {wch: maxUsernameLength},
        {wch: maxStatusLength},
        {wch: maxCommentLength},
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ознакомление с ЛНА");
    const fileName = `Отчёт по ознакомлению с ${Context.data.__name}.xlsx`;
    XLSX.writeFile(workbook, fileName);
};
