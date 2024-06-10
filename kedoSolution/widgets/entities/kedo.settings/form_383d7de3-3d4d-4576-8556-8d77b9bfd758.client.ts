/* Client scripts module */

declare const document: any;
declare const window: any;
declare const console: any;

const TOKEN_NAME = "Токен КЭДО";

const INSTRUCTION_TEXT = `В рамках данного процесса будет выполнена настройка всех доступных решений КЭДО.`;

interface ITokenRequest {
    userId: string,
    __name: string,
}

interface IToken {
    expiredAt: string,
    token: string,
    userId: string,
    __createdAt: string,
    __createdBy: string,
    __deletedAt: string,
    __id: string,
    __name: string,
    __updatedAt: string
    __updatedBy: string,
}

async function onInit(): Promise<void> {
    ViewContext.data.instruction_text = INSTRUCTION_TEXT;
    getDomen();
    await createKedoToken();
}

function getDomen(): void {
    Context.data.domen = window.location.host;
}

async function createKedoToken(): Promise<void> {
    ViewContext.data.token_required = true;
    ViewContext.data.token_readonly = false;

    let authToken = await getAuthTokenRequest();

    if (!authToken) {
        throw new Error("Не удалось получить токен авторизации");
    }

    const user = await System.users.getCurrentUser();
    const userId = user.id;

    const tokens: IToken[] = await getCreatedTokenRequest(authToken) ?? [];

    // Проверяем - токен КЭДО уже создан?
    const kedoToken = tokens.find(f => f.__name == TOKEN_NAME);

    if (!kedoToken) {
        const token = await createTokenRequest(authToken, userId);
        Context.data.token = token;
    } else {
        Context.data.token = kedoToken.token;
    }

    ViewContext.data.token_readonly = true;
    ViewContext.data.token_required = false;
}

/** Запрос на получение токена авторизации. */
async function getAuthTokenRequest(): Promise<string | undefined> {
    const request = await fetch(`${System.getBaseUrl()}/api/auth`);

    if (!request.ok) {
        throw new Error(JSON.stringify(request));
    }

    const authToken = request.headers.get('token');
    return authToken;
}

/** Запрос на создание токена. */
async function createTokenRequest(vtoken: string, userId: string): Promise<string> {
    try {
        const request = await fetch(`${System.getBaseUrl()}/api/token`, {
            method: "POST",
            headers: {
                "Cookie": `vtoken=${vtoken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: userId,
                __name: TOKEN_NAME,
            }),
        })

        if (!request.ok) {
            throw new Error(JSON.stringify(request));
        }

        const response = await request.json();
        return response.token;

    } catch (error) {
        throw new Error(error);
    }
}

/** Запрос на получение списка созданных токенов. */
async function getCreatedTokenRequest(vtoken: string): Promise<IToken[]> {
    let tokens: IToken[] = [];

    try {
        const request = await fetch(`${System.getBaseUrl()}/api/token`, {
            method: "GET",
            headers: {
                "Cookie": `vtoken=${vtoken}`,
                "Content-Type": "application/json"
            }
        });

        if (!request.ok) {
            throw new Error(JSON.stringify(request));
        }

        const response = await request.json();
        tokens = response.result as IToken[];
        return tokens;

    } catch (error) {
        throw new Error(error);
    }
}

/** Тестовый запрос на проверку приложенного токена. */
async function testRequest(): Promise<FetchResponse> {
    const request = await fetch(`${System.getBaseUrl()}/pub/v1/scheme/namespaces`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${Context.data.token}`
        }
    });

    return request;
}

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();

    const testResponse = await testRequest();

    if (testResponse.status == 401) {
        result.addContextError("token", "Некорректный токен");
    }

    return result;
}
