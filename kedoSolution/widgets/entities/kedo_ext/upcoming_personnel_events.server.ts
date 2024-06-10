
async function getItemsFromApi(ns: string, code: string, staffFilter = false): Promise<{id: string, name: string}[] | any[] |undefined> {

    const baseUrl = System.getBaseUrl();
    const token = Context.data.token

    if (!token) {
        Context.data.error = "no token";
        return;
    };

    const testResponse = await fetch(`${baseUrl}/pub/v1/app/${ns}/${code}/list`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
                active: true
        })
    });

    if (!testResponse.ok) {
        Context.data.error = "error at check: " + await testResponse.text();
        return;
    };

    const allItems: {id: string, name: string}[] | any[] = [];

    let searchFulfilled = false;
    let itemsCount = 0;

    while (!searchFulfilled) {
        let body: Record<string, any> = {
            active: true,
            from: itemsCount,
            size: 100
        };

        if (staffFilter) {
            body.filter = {
                link: [
                    {field: "kedo_staff"},
                    {list: [Context.data.staff_app!.id]}
                ]
            }
        }
        const response = await fetch(`${baseUrl}/pub/v1/app/${ns}/${code}/list`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            Context.data.error = "error at cycle: " + await response.text();
            break;
        };

        const respJson = await response.json();
        const result = respJson.result.result;
        if (result.length < 1) {
            searchFulfilled = true;
            break;
        };
        if (itemsCount < respJson.result.total) {
            itemsCount += result.length;
        } else {
            searchFulfilled = true;
            break;
        };

        if (staffFilter) {
            allItems.push(result);
        } else {
            allItems.push(result.map((item: any) => {
                return {
                    id: item.__id,
                    name: item.__name
                };
            }));
        }
    };

    return allItems;
};

async function getOvertimeWork(): Promise<void> {
    const allItems = await getItemsFromApi("time_tracking", "overtime_work", true);

    if (allItems) {
        Context.data.debug = JSON.stringify([].concat.apply([], allItems))
        Context.data.overtime_work_json = JSON.stringify([].concat.apply([], allItems).map((item: any) => {
            return {
                id: item.__id,
                code: "overtime_work",
                namespace: "time_tracking",
                data: {
                    kedo_status: item.kedo_status ? {
                        id: item.kedo_status[0]
                    } : undefined,
                    __name: item.__name,
                    __createdAt: item.__createdAt,
                    start_date: item.start_date,
                    date: item.date,
                    start_date_string: item.start_date_string ?? undefined,
                    kedo_staff: item.kedo_staff ? {
                        id: item.kedo_staff[0]
                    } : undefined,
                    work_type: item.overtime_type ? item.overtime_type[0].name : "Работа в нерабочее время"
                }
            }
        }));
    };
};