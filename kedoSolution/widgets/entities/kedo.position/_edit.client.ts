/* Client scripts module */
declare const console: any;


async function onSubdivisionChange(): Promise<void> {
    const newSubdivision = await Context.data.subdivision?.fetch();
    Context.data.organization = newSubdivision?.data.organization;

    const orgApp = await newSubdivision?.data.organization?.fetch();
    Context.data.owner_key = orgApp?.data.ref_key ?? "" 
    Context.data.parent_key = newSubdivision?.data.ref_key ?? ""
}
