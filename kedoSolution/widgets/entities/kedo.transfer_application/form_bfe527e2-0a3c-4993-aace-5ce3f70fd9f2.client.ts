
async function onInit(): Promise<void> {
    debugger;
    // const staff = await Context.data.staff_chief!.fetch();
    // const organization = await staff.data.organization!.fetch();
    // const subdivisions = await staff.fields.structural_subdivision.app.search()
    //     .where((f, g) => g.and(
    //         f.__deletedAt.eq(null),
    //         f.organization.link(organization)
    //     ))
    //     .size(10000)
    //     .all();
    // const positions = await staff.fields.position.app.search()
    //     .where((f, g) => g.and(
    //         f.__deletedAt.eq(null),
    //         f.organization.link(organization)
    //     ))
    //     .size(10000)
    //     .all();
    // const staffs = await staff.fields.dop_staff.app.search()
    //     .where((f, g) => g.and(
    //         f.__deletedAt.eq(null),
    //         f.organization.link(organization)
    //     ))
    //     .size(10000)
    //     .all();
    // const position = positions.find(f => f.id == staff.data.position!.id)!;
    // if (!position.data.subdivision) {
    //     Context.data.chief_user = (await organization_get_head(organization, positions, staffs)) || undefined;
    // } else {
    //     Context.data.chief_user = (await subdivision_get_head(position.data.subdivision, positions, subdivisions, staffs, organization)) || undefined;
    // }
}

async function subdivision_get_head(subdivision: TApplication<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params, Application$kedo$structural_subdivision$Processes>,
    positions: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>[],
    subdivisions: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params>[],
    staffs: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>[],
    organization: ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>): Promise<UserItemRef | undefined> {
    const division = subdivisions.find(f => f.id == subdivision.id)!;
    if (!division.data.position) {
        if (!division.data.subdivision) {
            return organization_get_head(organization, positions, staffs)
        } else {
            return await subdivision_get_head(division.data.subdivision, positions, subdivisions, staffs, organization)
        }
    } else {
        const position_head = positions.find(f => f.id == division.data.position!.id)!;
        if (!position_head.data.staff || position_head.data.staff.length == 0) {
            if (!division.data.subdivision) {
                return organization_get_head(organization, positions, staffs)
            } else {
                return await subdivision_get_head(division.data.subdivision, positions, subdivisions, staffs, organization)
            }
        } else {
            const chief = staffs.find(f => f.id == position_head.data.staff![0].id);
            if (chief) {
                return chief.data.ext_user
            }
        }
    }
}

async function organization_get_head(organization: ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>,
    positions: ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>[],
    staffs: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>[]): Promise<UserItemRef | undefined> {
    if (!organization.data.position_head) {
        return undefined
    } else {
        const position_head = positions.find(f => f.id == organization.data.position_head!.id)!;
        if (!position_head.data.staff || position_head.data.staff.length == 0) {
            return undefined
        } else {
            const chief = staffs.find(f => f.id == position_head.data.staff![0].id);
            if (chief) {
                return chief.data.ext_user
            }
        }
    }
}
