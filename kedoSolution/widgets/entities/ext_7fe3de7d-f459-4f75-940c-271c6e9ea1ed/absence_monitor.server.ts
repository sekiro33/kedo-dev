type overtimeWorkItem = {
    id: string,
    name: string,
    userName: string,
    duration: number,
    startDate: string,
    staffId: string
};

let overtimeRequestBody = {
    filter: {
        and: [
            {
                eq: [
                    {
                        field: "__deletedAt",
                    },
                    null
                ],
            },
            {
                neq: [
                    {
                        field: "kedo_status",
                    },
                    null
                ]
            },
            {
                neq: [
                    {
                        field: "date",
                    },
                    null
                ]
            },
            {
                neq: [
                    {
                        field: "duration_number",
                    },
                    null
                ]
            },
            {
                neq: [
                    {
                        field: "duration_number",
                    },
                    null
                ]
            },
        ],
    }
};

async function checkUserIsAdmin(): Promise<void> {
    const user = await System.users.getCurrentUser();
    const adminGroup = await System.userGroups.search().where(f => f.code.eq("administrators")).first();

    if (adminGroup!.data.subOrgunitIds && adminGroup!.data.subOrgunitIds.indexOf(user.id) != -1) {
        Context.data.user_is_admin = true;
        return;
    };
};

async function getOvertimeWork(): Promise<void> {
    const tokenSetting = await Context.fields.kedo_options.app.search().where(f => f.code.eq("api_key")).first();

    if (!tokenSetting) {
        Context.data.overtime_work_json = JSON.stringify([]);
        return;
    };

    let staffIds: string[] = [];

    if (!!Context.data.staff && Context.data.staff?.length > 0) {
        staffIds = Context.data.staff.map(s => s.id);
        overtimeRequestBody.filter.and.push({
        //@ts-ignore
            in: [
                {
                    field: "kedo_staff"
                },
                {
                    list: staffIds
                }
            ]
        });
    };

    if (Context.data.organization) {
        const organizationStaff = await Context.fields.staff.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.organization.link(Context.data.organization!)
        )).size(5000).all().then(staff => staff.map(s => s.id));

        staffIds = Array.from(new Set(staffIds.concat(...organizationStaff)));
    };

    if (Context.data.subdivision) {
        const subdivisionStaff = await Context.fields.staff.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.structural_subdivision.link(Context.data.subdivision!)
        )).size(5000).all().then(staff => staff.map(s => s.id));
        staffIds = Array.from(new Set(staffIds.concat(...subdivisionStaff)));
    };

    if (staffIds.length > 0) {
        overtimeRequestBody.filter.and.push({
        //@ts-ignore
            in: [
                {
                    field: "kedo_staff"
                },
                {
                    list: staffIds
                }
            ]
        });
    }

    const token = tokenSetting.data.value;
    const overworkResponse = await fetch(`${System.getBaseUrl()}/pub/v1/app/time_tracking/overtime_work/list`, {
        method: "POST",
        body: JSON.stringify({
            ...overtimeRequestBody,
            size: 100
        }),
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!overworkResponse.ok) {
        throw new Error(await overworkResponse.text());
    };

    const responseJson = await overworkResponse.json();

    if (responseJson.result.total > 0) {
        const overtimeWorkJson: overtimeWorkItem[] = await Promise.all(responseJson.result.result.map(async (item: any) => {
            return {
                id: item.__id,
                name: item.__name,
                duration: item.duration_number,
                startDate: new Datetime(item.date).format("DD.MM.YYYY"),
                userName: await Context.fields.staff.app.search().where(f => f.__id.eq(item.kedo_staff[0])).first().then(s => s!.data.__name),
                staffId: item.kedo_staff[0]
            }
        }));
        Context.data.overtime_work_json = JSON.stringify(overtimeWorkJson)
    };
};