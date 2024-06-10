const signMeUrl = Namespace.params.data.sign_me_server_address;
const konturUrl = `${Namespace.params.data.kontur_server_address}/v1/issues`;
const apiKey = Context.data.api_key!;
const requestId = Context.data.request_id;
const konturHeaders: Record<string, string> = {
    "X-KONTUR-APIKEY": apiKey,
    "Content-Type": "application/json"
}

async function logData(response: FetchResponse): Promise<void> {
    let requestEndpoint: string = "";
    let responseJson: any = {};
    let responseText: string = "";
    requestEndpoint = response.url.split("/").slice(-1)[0];
    switch (requestEndpoint) {
        case "activate":
            responseText = await response.text();

            if (responseText.includes("1")) {
                Context.data.request_confirmed = true;
            };
            break;
        case requestId:
            if (Context.data.request_data_full) {
                responseJson = await response.json();
                let requestStatus = responseJson.status;
                if (requestStatus == "released") {
                    Context.data.cert_released = true;
                };
                return;
            };
            responseJson = await response.json();
            let requestDocs = responseJson.documents.find((doc: any) => doc.type == "passport" || doc.type == "otherIdentity").requisites;
            Context.data.passport_series = requestDocs.find((doc: any) => doc.type == "series")?.value;
            Context.data.passport_number = requestDocs.find((doc: any) => doc.type == "number")?.value;
            Context.data.issue_date = requestDocs.find((doc: any) => doc.type == "issueDate")?.value;
            Context.data.birth_date = requestDocs.find((doc: any) => doc.type == "birthDate")?.value;
            Context.data.birth_place = requestDocs.find((doc: any) => doc.type == "birthPlace")?.value;
            Context.data.issue_id = requestDocs.find((doc: any) => doc.type == "issueOrganizationId")?.value;
            Context.data.issued_by = requestDocs.find((doc: any) => doc.type == "issueOrganization")?.value;
            Context.data.request_data_full = true;
            break;
    };
};

async function logError(response?: FetchResponse, error?: string) {
    Context.data.error_exists = true;

    if (!!response) {
        switch (response.status) {
            case 400:
                if (response.url.includes("validate")) {
                    const errorMessage = (await response.json()).error.message;
                    Context.data.error = errorMessage;
                    break;
                };
                const errorDetails = (await response.json()).error.details;
                const errorFields = errorDetails.map((field: any) => {
                    return JSON.stringify({
                        'Поле': field.target,
                        'Причина': field.message
                    });
                }).join(", ");
                Context.data.error = errorFields;
            case 401:
                Context.data.error = "Неверный api-ключ"
            case 403:
                Context.data.error = "Недостаточно прав на создание заявки"
            case 404:
                Context.data.error = "Заявка с данным идентификатором не найдена.";
            case 408:
                Context.data.error = "Превышено время ожидания запроса.";
            case 409:
                Context.data.error = "Данная заявка в процессе актуализации.";
            case 429:
                Context.data.error = "Данные заявки изменялись слишком много раз, попробуйте заново.";
        };
        return;
    };
    throw new Error(error);
};

async function activate(): Promise<void> {
    Context.data.error_exists = false;
    let body = JSON.stringify({
        api_key: apiKey,
        uid: requestId
    });
    let response = await fetch(`${signMeUrl}/activate`, {
        headers: {
            "Content-Type": "application/json"
        },
        body
    });
    if (!response.ok) {
    
    };
    await logData(response);
};

async function getRequestData(): Promise<void> {
    Context.data.error_exists = false;
    let response = await fetch(`${konturUrl}/${requestId}`, {
        headers: konturHeaders
    });
    if (!response.ok) {
        await logError(response);
    };
    await logData(response)
};

async function confirmSubjectIdentification(): Promise<void> {
    Context.data.error_exists = false;
    let response = await fetch(`${konturUrl}/${requestId}/subject-identification`, {
        method: "PUT",
        headers: konturHeaders,
        body: JSON.stringify({
            identifiedBy: Context.data.responsible_user!.id,
            identificationSubjectType: "employee"
        })
    });
    if (!response.ok) {
        Context.data.debug = response.statusText + " " + Context.data.responsible_user!.id
        await logError(response);
    };
};

async function validateIssue(): Promise<void> {
    Context.data.error_exists = false;
    let response = await fetch(`${konturUrl}/${requestId}/validate`, {
        method: "POST",
        headers: konturHeaders
    });

    if (!response.ok) {
        await logError(response);
    };
};