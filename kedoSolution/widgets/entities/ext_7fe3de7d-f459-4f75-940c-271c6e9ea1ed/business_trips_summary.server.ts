/* Server scripts module */
async function getData() {
    let token: string = '';
    if(Context.data.token){
        token = Context.data.token;
    } 

    const url = Context.data.request_url!
    const reqHeaders = {
        "Authorization": `Bearer ${token}`,
    }
    const date = new Date()
    const year = date.getFullYear()
    const dateString = `${year}-1-1`
    

    const reqBody = {
        "active": true,
        "filter": {
            "tf": {
                "posted_employees": [Context.data.employee_card!.id],
                "__createdAt": {
                    "min": dateString
                }
            }
        },
        "from": 0,
        "size": 100
    }

    let result: any = null
    await fetch(url, {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify(reqBody)
    }).then(async(res) => {
             if(res.ok){
                return await res.json()
            }
        })
        .then((res) => {
            result = res.result.result
        })
    Context.data.response = JSON.stringify(result);
}