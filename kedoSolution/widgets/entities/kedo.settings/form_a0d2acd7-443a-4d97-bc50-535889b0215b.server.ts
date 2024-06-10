/* Server scripts module */

interface IModule {
    __createdAt: TDatetime,
    __createdBy: string,
    __deletedAt: TDatetime,
    __id: string,
    __updatedAt: TDatetime,
    __updatedBy: string,
    author: string,
    code: string,
    description: string,
    enabled: boolean,
    help: string,
    language: string,
    name: string,
    namespace: string,
    summary: string,
    website: string,
}

const getModulesIds = (): string[] => {
  let ids = [
    // Интеграция с УЦ.
    "27c1fb4a-e011-47a6-aa26-cf0fc42c39cd",
    // Модуль КЭДО.
    "7fe3de7d-f459-4f75-940c-271c6e9ea1ed",
  ];

  // Интеграция с 1С
  if (Context.data.need_integration_1c == true) {
    ids.push("3c26e96d-9ba5-486d-a26e-47918e61fad3");
  }

  return ids;
}


async function getModules(): Promise<void> {
    const modules: IModule[] = [];

    try {
        const requests = getModulesIds().map(id => fetch(`${System.getBaseUrl()}/pub/v1/scheme/modules/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Context.data.token!}`,
            }
        }));

        await Promise.all(requests)
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(data => data.forEach(moduleResponse => {
                modules.push(moduleResponse.module)
            }));

        ViewContext.data.modules = modules.filter(f => f != null && f != undefined);

    } catch (error) {
        throw new Error(error);
    }
}