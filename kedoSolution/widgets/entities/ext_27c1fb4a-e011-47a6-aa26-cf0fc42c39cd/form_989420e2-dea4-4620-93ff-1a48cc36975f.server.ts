const apiKey = Context.data.api_key!;
const headers: Record<string, string> = {
    "X-KONTUR-APIKEY": apiKey,
    "Content-Type": "application/json"
};
const baseUrl = `${Namespace.params.data.kontur_server_address}/v1/issues`;
const requestId = Context.data.request_id;

async function getSecretCode(): Promise<void> {
    let response = await fetch(`${baseUrl}/${requestId}/confirmation-requests`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            "operationToConfirm": "signingReleaseStatement"
        })
    });
    
    if (!response.ok) {
        let responseJson = await response.json();
        ViewContext.data.error_exists = true;
        let errorMessage = responseJson.error.message;
        ViewContext.data.error = `${response.status}: ${errorMessage}`;
        return;
    };
};

async function confirmSecret(): Promise<void> {
    ViewContext.data.wrong_code = false;
    let response = await fetch(`${baseUrl}/${requestId}/documents/releaseStatement/sign`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            confirmationInfo: {
                smsCode: ViewContext.data.sms_code!
            }
        })
    });
    if (!response.ok) {
        let responseJson = await response.json();
        let errorCode = responseJson.error.code;
        ViewContext.data.error_exists = true;
        switch (errorCode) {
            case "WrongConfirmationCode":
                ViewContext.data.error = "Неверный код, попробуйте еще раз.";
                break;
            case "ConfirmationCodeExpired":
                ViewContext.data.error = "Срок действия кода истёк, запросите новый.";
                break;
            default:
                ViewContext.data.error = responseJson.error.message;
                break;
        };
        return;
    };
    ViewContext.data.request_confirmed = true;
};