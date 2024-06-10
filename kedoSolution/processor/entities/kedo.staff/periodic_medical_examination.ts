/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

type Staff = ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params>
type Position = ApplicationItem<Application$kedo$position$Data, Application$kedo$position$Params>;
type Organization = ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>;
type Subdivision = ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params>;
type SubdivisionApp = TApplication<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params, Application$kedo$structural_subdivision$Processes>;

async function getSettings(): Promise<void> {
    const settings = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null)
        ))
        .size(10000)
        .all();

    const custom_definition_head = settings.find(f => f.data.code == 'custom_definition_head');
    Context.data.custom_definition_head = custom_definition_head ? custom_definition_head.data.status : false
}

async function action(): Promise<void> {
    if (!Context.data.staff && (!Context.data.staffs_many || Context.data.staffs_many.length == 0)) {
        throw new Error("Не указаны сотрудники");
    }

    let staff: Staff;

    if (Context.data.staff) {
        staff = await Context.data.staff.fetch();
    } else {
        staff = await Context.data.staffs_many![0].fetch();
    }

    if (!staff.data.organization) {
        throw new Error("У сотрудника не указана организация");
    }

    if (!staff.data.position) {
        throw new Error("У сотрудника не указана позиция ШР");
    }

    if (!staff.data.structural_subdivision) {
        throw new Error("У сотрудника не указано подразделение");
    }

    const [organization, position, subdivision] = await Promise.all(
        [
            staff.data.organization.fetch(),
            staff.data.position.fetch(),
            staff.data.structural_subdivision.fetch(),
        ]
    )

    Context.data.organization = organization;

    // Подготовка данных.
    const subdivisions = await staff.fields.structural_subdivision.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.organization.link(organization)
        ))
        .size(10000)
        .all();

    const positions = await staff.fields.position.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.organization.link(organization)
        ))
        .size(10000)
        .all();

    const staffs = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.neq(null),
            f.organization.link(organization),
            f.__status.eq(staff.fields.__status.variants.signed_documents)
        ))
        .size(10000)
        .all();


    // Поиск руководителей.
    if (!position.data.subdivision) {
        Context.data.chief = (await organization_get_head(organization, positions)) || undefined;
    } else {
        Context.data.chief = (await subdivision_get_head(position.data.subdivision, positions, subdivisions, staffs, organization, staff)) || undefined;
    }
    if (Context.data.chief) {
        const staff_chief = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.chief!)
            ))
            .first();
        Context.data.chief_app = staff_chief
    }

    async function subdivision_get_head(
        subdivision: SubdivisionApp,
        positions: Position[],
        subdivisions: Subdivision[],
        staffs: Staff[],
        organization: Organization,
        staff: Staff): Promise<UserItemRef | undefined> {

        const division = subdivisions.find(f => f.id == subdivision.id);

        if (!division) {
            return await organization_get_head(organization, positions);
        }

        if (!division.data.position) {
            if (!division.data.subdivision) {
                return await organization_get_head(organization, positions)
            } else {
                return await subdivision_get_head(division.data.subdivision, positions, subdivisions, staffs, organization, staff)
            }
        }

        const position_head = positions.find(f => f.id == division.data.position?.id)!;

        const positions_staffs_app = await Promise.all(
            [
                ...(position_head.data.staff ?? []),
                ...(position_head.data.staff_internal_combination ?? []),
                ...(position_head.data.staff_external_combination ?? []),
            ]
                .map(f => f.fetch())
        )

        const positions_staffs = positions_staffs_app.filter(f => f.data.ext_user
            && f.data.__status?.code == f.fields.__status.variants.signed_documents.code
            && f.id != staff.id);

        if (positions_staffs.length == 0) {
            if (!division.data.subdivision) {
                return await organization_get_head(organization, positions)
            } else {
                return await subdivision_get_head(division.data.subdivision, positions, subdivisions, staffs, organization, staff)
            }
        } else {
            return positions_staffs[0].data.ext_user;
        }
    }

    async function organization_get_head(organization: Organization, positions: Position[]): Promise<UserItemRef | undefined> {
        if (!organization.data.position_head) {
            return undefined;
        }

        const position_head = positions.find(f => f.id == organization.data.position_head?.id);

        if (!position_head) {
            return undefined;
        }

        // Получаем сотрудников на осн. позиции, по внешнему и внутреннему совместительству.
        const staffs_app = await Promise.all(
            [
                ...(position_head.data.staff ?? []),
                ...(position_head.data.staff_internal_combination ?? []),
                ...(position_head.data.staff_external_combination ?? []),
            ]
                .map(f => f.fetch())
        );

        const organization_heads = staffs_app.filter(f => f.data.ext_user && f.data.__status?.code == f.fields.__status.variants.signed_documents.code);

        if (organization_heads.length == 0) {
            return undefined;
        } else {
            return organization_heads[0].data.ext_user;
        }
    }
}

// async function action(): Promise<void> {
//     let staff: Staff;

//     if (Context.data.staffs_many && Context.data.staffs_many.length > 0)
//         staff = await Context.data.staffs_many[0].fetch()
//     else if (Context.data.staff) {
//         staff = await Context.data.staff.fetch();
//     } else {
//         throw new Error('Не указаны сотрудники.');
//     }

//     // Определяем позицию от которой будем отталкиваться.
//     let position: Position;

//     if (Context.data.pozition)
//         position = await Context.data.pozition!.fetch()
//     else
//         position = await staff.data.position!.fetch()

//     // Получаем организацию сотрудника.
//     const organization = await position.data.organization!.fetch();
//     Context.data.organization = organization;

//     // Подготовка данных.
//     const subdivisions = await staff.fields.structural_subdivision.app.search()
//         .where((f, g) => g.and(
//             f.__deletedAt.eq(null),
//             f.organization.link(organization)
//         ))
//         .size(10000)
//         .all();

//     const positions = await staff.fields.position.app.search()
//         .where((f, g) => g.and(
//             f.__deletedAt.eq(null),
//             f.organization.link(organization)
//         ))
//         .size(10000)
//         .all();

//     const staffs = await staff.fields.dop_staff.app.search()
//         .where((f, g) => g.and(
//             f.__deletedAt.eq(null),
//             f.ext_user.neq(null),
//             f.organization.link(organization),
//             f.__status.eq(staff.fields.__status.variants.signed_documents)
//         ))
//         .size(10000)
//         .all();

//     // Поиск руководителей.
//     if (Context.data.staffs_many && Context.data.staffs_many.length > 0) {
//         Context.data.chiefs_many = [];
//         for (const staff of staffs) {
//             const position = positions.find(f => f.id == staff.data.position!.id)!;
//             if (!position.data.subdivision) {
//                 Context.data.chiefs_many = Context.data.chiefs_many.concat((await organization_get_head(organization, positions)) || [])
//             } else {
//                 Context.data.chiefs_many = Context.data.chiefs_many.concat((await subdivision_get_head(position.data.subdivision, positions, subdivisions, staffs, organization, staff)) || [])
//             }
//         }
//         const chief_app_many = await Context.fields.chief_app_many.app.search()
//             .where((f, g) => g.and(
//                 f.__deletedAt.eq(null),
//                 f.__status.eq(Context.fields.chief_app_many.app.fields.__status.variants.signed_documents),
//                 f.ext_user.in(Context.data.chiefs_many!)
//             ))
//             .size(10000)
//             .all();
//         Context.data.chief_app_many = chief_app_many
//     } else {
//         if (!position.data.subdivision) {
//             Context.data.chief = (await organization_get_head(organization, positions)) || undefined;
//         } else {
//             Context.data.chief = (await subdivision_get_head(position.data.subdivision, positions, subdivisions, staffs, organization, staff)) || undefined;
//         }
//         if (Context.data.chief) {
//             const staff_chief = await Context.fields.staff.app.search()
//                 .where((f, g) => g.and(
//                     f.__deletedAt.eq(null),
//                     f.ext_user.eq(Context.data.chief!)
//                 ))
//                 .first();
//             Context.data.chief_app = staff_chief
//         }
//     }
// }

// async function subdivision_get_head(
//     subdivision: SubdivisionApp,
//     positions: Position[],
//     subdivisions: Subdivision[],
//     staffs: Staff[],
//     organization: Organization,
//     staff: Staff): Promise<UserItemRef | undefined> {

//     const division = subdivisions.find(f => f.id == subdivision.id)!;

//     if (!division.data.position) {
//         if (!division.data.subdivision) {
//             return await organization_get_head(organization, positions)
//         } else {
//             return await subdivision_get_head(division.data.subdivision, positions, subdivisions, staffs, organization, staff)
//         }
//     }

//     const position_head = positions.find(f => f.id == division.data.position!.id)!;

//     const positions_staffs_app = await Promise.all(
//         [...position_head.data.staff!, ...position_head.data.staff_internal_combination!, ...position_head.data.staff_external_combination!]
//             .map(f => f.fetch())
//     );

//     const positions_staffs = positions_staffs_app.filter(f => f.data.ext_user
//         && f.data.__status?.code == f.fields.__status.variants.signed_documents.code
//         && f.id != staff.id);

//     if (positions_staffs.length == 0) {
//         if (!division.data.subdivision) {
//             return await organization_get_head(organization, positions)
//         } else {
//             return await subdivision_get_head(division.data.subdivision, positions, subdivisions, staffs, organization, staff)
//         }
//     } else {
//         return positions_staffs[0].data.ext_user;
//     }
// }

// async function organization_get_head(organization: Organization, positions: Position[]): Promise<UserItemRef | undefined> {
//     if (!organization.data.position_head) {
//         return undefined;
//     }

//     const position_head = positions.find(f => f.id == organization.data.position_head!.id)!;

//     // Получаем сотрудников на осн. позиции, по внешнему и внутреннему совместительству.
//     const staffs_app = await Promise.all(
//         [...position_head.data.staff!, ...position_head.data.staff_internal_combination!, ...position_head.data.staff_external_combination!]
//             .map(f => f.fetch())
//     )
//     const position_head_staffs = staffs_app.filter(f => f.data.ext_user && f.data.__status?.code == f.fields.__status.variants.signed_documents.code);

//     if (position_head_staffs.length == 0) {
//         return undefined;
//     } else {
//         return position_head_staffs[0].data.ext_user;
//     }
// }

async function getSupervisor(): Promise<void> {
    const supervisor = await System.userGroups.search().where(f => f.__id.eq('331e62d2-072e-58ac-9581-74abcc67f050')).first();
    const user = await System.users.search().where(f => f.groupIds.has(supervisor!)).first();
    const staff = await Context.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(user!)
        ))
        .first();
    Context.data.chief = user;
    Context.data.chief_app = staff
}

async function getStaffChief(): Promise<void> {
    if (!Context.data.staff_employment) {
        throw new Error("Место занятости сотрудника не указано; Context.data.staff_employment is undefined");
    }

    const staff_employment = await Context.data.staff_employment.fetch();

    if (!staff_employment.data.position) {
        throw new Error("В выбранному месту занятости не указана позиция ШР сотрудника");
    }

    if (!staff_employment.data.organization) {
        throw new Error("В выбранному месту занятости не указана организация сотрудника");
    }

    const staff = await staff_employment.data.staff!.fetch();
    const position = await staff_employment.data.position.fetch();
    const organization = await staff_employment.data.organization.fetch();

    Context.data.organization = organization;

    // Подготовка данных.
    const subdivisions = await staff_employment.fields.subdivision.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.organization.link(organization)
        ))
        .size(10000)
        .all();

    const positions = await staff_employment.fields.position.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.organization.link(organization)
        ))
        .size(10000)
        .all();

    const staffs = await staff_employment.fields.staff.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.neq(null),
            f.organization.link(organization),
            f.__status.eq(staff.fields.__status.variants.signed_documents)
        ))
        .size(10000)
        .all();


    // Поиск руководителей.
    if (!position.data.subdivision) {
        Context.data.chief = (await organization_get_head(organization, positions)) || undefined;
    } else {
        Context.data.chief = (await subdivision_get_head(position.data.subdivision, positions, subdivisions, staffs, organization, staff)) || undefined;
    }
    if (Context.data.chief) {
        const staff_chief = await Context.fields.staff.app.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.ext_user.eq(Context.data.chief!)
            ))
            .first();
        Context.data.chief_app = staff_chief
    }

    async function subdivision_get_head(
        subdivision: SubdivisionApp,
        positions: Position[],
        subdivisions: Subdivision[],
        staffs: Staff[],
        organization: Organization,
        staff: Staff): Promise<UserItemRef | undefined> {

        const division = subdivisions.find(f => f.id == subdivision.id);

        if (!division) {
            return await organization_get_head(organization, positions);
        }

        if (!division.data.position) {
            if (!division.data.subdivision) {
                return await organization_get_head(organization, positions)
            } else {
                return await subdivision_get_head(division.data.subdivision, positions, subdivisions, staffs, organization, staff)
            }
        }

        const position_head = positions.find(f => f.id == division.data.position?.id)!;

        const positions_staffs_app = await Promise.all(
            [
                ...(position_head.data.staff ?? []),
                ...(position_head.data.staff_internal_combination ?? []),
                ...(position_head.data.staff_external_combination ?? []),
            ]
                .map(f => f.fetch())
        )

        const positions_staffs = positions_staffs_app.filter(f => f.data.ext_user
            && f.data.__status?.code == f.fields.__status.variants.signed_documents.code
            && f.id != staff.id);

        if (positions_staffs.length == 0) {
            if (!division.data.subdivision) {
                return await organization_get_head(organization, positions)
            } else {
                return await subdivision_get_head(division.data.subdivision, positions, subdivisions, staffs, organization, staff)
            }
        } else {
            return positions_staffs[0].data.ext_user;
        }
    }

    async function organization_get_head(organization: Organization, positions: Position[]): Promise<UserItemRef | undefined> {
        if (!organization.data.position_head) {
            return undefined;
        }

        const position_head = positions.find(f => f.id == organization.data.position_head?.id);

        if (!position_head) {
            return undefined;
        }

        // Получаем сотрудников на осн. позиции, по внешнему и внутреннему совместительству.
        const staffs_app = await Promise.all(
            [
                ...(position_head.data.staff ?? []),
                ...(position_head.data.staff_internal_combination ?? []),
                ...(position_head.data.staff_external_combination ?? []),
            ]
                .map(f => f.fetch())
        );

        const organization_heads = staffs_app.filter(f => f.data.ext_user && f.data.__status?.code == f.fields.__status.variants.signed_documents.code);

        if (organization_heads.length == 0) {
            return undefined;
        } else {
            return organization_heads[0].data.ext_user;
        }
    }
}


async function getFutureChief(): Promise<void> {
    if (!Context.data.new_position) {
        throw new Error('Не указана новая позиция ШР');
    }
    const new_position = await Context.data.new_position.fetch();

    if (new_position.data.subdivision) {
        const subdivision = await new_position.data.subdivision.fetch();

        if (subdivision.data.position) {
            const position_chief = await subdivision.data.position.fetch();

            const chieffs_app = await Promise.all([
                ...(position_chief.data.staff ?? []),
                ...(position_chief.data.staff_internal_combination ?? []),
                ...(position_chief.data.staff_external_combination ?? []),
            ]
                .map(f => f.fetch())
            );

            if (chieffs_app) {
                const current_chieff = chieffs_app.filter(f => f.data.ext_user && f.data.__status?.code == f.fields.__status.variants.signed_documents.code);
                if (current_chieff) {
                    Context.data.chief = current_chieff[0].data.ext_user;
                }
            }
        }
    }
}
