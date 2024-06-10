/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function setRequestData(): Promise<void> {
    Context.data.current_number_of_iter = 0;
    Context.data.end_iteration = false;
    Context.data.array_heads = '[]';
    Context.data.request_url = "InformationRegister_ПозицииРуководителейПодразделений?$format=json"
}

async function fillIterData(): Promise<void> {
    if (!Context.data.response) return;
    const data1C = JSON.parse(Context.data.response!)["value"];
    if (data1C[Context.data.current_number_of_iter!]) {
        Context.data.request_url = data1C[Context.data.current_number_of_iter!]["Подразделение@navigationLinkUrl"] + "?$format=json";
    }
    Context.data.current_number_of_iter!++;
    if (data1C.length < Context.data.current_number_of_iter!) {
        Context.data.end_iteration = true
    }
    if (!Context.data.subdivision_response) return;
    const subdivResponse = JSON.parse(Context.data.subdivision_response);
    const array_heads: any[] = JSON.parse(Context.data.array_heads!);
    array_heads.push(subdivResponse);
    Context.data.array_heads = JSON.stringify(array_heads)
}

async function setArrayHead(): Promise<void> {
    if (!Context.data.subdivision_response) return;
    const subdivResponse = JSON.parse(Context.data.subdivision_response);
    const array_heads: any[] = JSON.parse(Context.data.array_heads!);
    array_heads.push(subdivResponse);
    Context.data.array_heads = JSON.stringify(array_heads)
}

async function setHeadData(): Promise<void> {
    const data1C = JSON.parse(Context.data.response!)["value"];
    const array_heads: any[] = JSON.parse(Context.data.array_heads!);
    const allSubdivisions = await Namespace.app.structural_subdivision.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.base_1c.eq(Context.data.base_name!)
        ))
        .size(10000)
        .all();
    const allPosisions = await Namespace.app.position.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.base_1c.eq(Context.data.base_name!)
        ))
        .size(10000)
        .all();
    const promises: Promise<void>[] = [];
    for (let i = 0; i < array_heads.length; i++) {
        const position = allPosisions.find(f => f.data.ref_key === data1C[i]["ПозицияШтатногоРасписания_Key"]);
        const subdivision = allSubdivisions.find(f => f.data.subdiv_key === array_heads[i]["Источник"]);
        if (subdivision) {
            subdivision.data.position = position;
            promises.push(subdivision.save())
        }
    }
    await Promise.all(promises)
}