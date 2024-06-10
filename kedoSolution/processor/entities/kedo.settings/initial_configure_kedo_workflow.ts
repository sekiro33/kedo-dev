/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

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

const VACATION_SOLUTION = "otpuska";
const BUSINESS_TRIP_SOLUTION = "komandirovki";

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

interface ISolution {
  name: string,
  code: string,
}

/** Заполнить токен в меню настроек КЭДО. */
async function setTokenSetting(): Promise<void> {
  let api_key = await Context.fields.settings.app.search().where(f => f.code.eq("api_key")).first();

  if (!api_key) {
    api_key = Context.fields.settings.app.create();
    api_key.data.code = "api_key";
    api_key.data.__name = "Api-ключ для методов в модуле";
  }

  api_key.data.value = Context.data.token;
  await api_key.save();
}

/** Проверка на наличие организаций. */
async function checkOrganization(): Promise<boolean> {
  const organizations = await Namespace.app.organization.search().where(f => f.__deletedAt.eq(null)).size(100).all();
  const setting = await Context.fields.settings.app.search().where(f => f.code.eq('updating_rights_required')).first();
  const updating_rights_required = setting && setting.data.status ? setting.data.status : true;

  return updating_rights_required && organizations.length > 0;
}

/** Запрос на получение списка модулей. */
async function getModulesRequest(moduleIds: string[]): Promise<IModule[]> {
  const modules: IModule[] = [];

  try {
    const requests = moduleIds.map(id => fetch(`${System.getBaseUrl()}/pub/v1/scheme/modules/${id}`, {
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

    return modules;
  } catch (error) {
    throw new Error(error);
  }
}

/** Получить список модулей. */
async function getModules(): Promise<void> {
  const modules = await getModulesRequest(getModulesIds());

  const disabledModules = modules.filter(f => f != undefined && f.enabled == false);

  if (disabledModules.length > 0) {
    throw "Обнаружены выключенные модули";
  }
}

/** Запрос на получение списка решений. */
async function getSolutionsRequest(): Promise<ISolution[]> {
  let solutions: ISolution[] = [];

  try {
    const request = await fetch(`${System.getBaseUrl()}/pub/v1/scheme/solutions`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${Context.data.token}`
      }
    });

    if (!request.ok) {
      throw new Error(JSON.stringify(request));
    }

    const response = await request.json();
    solutions = response.result.result as ISolution[];
    return solutions;

  } catch (error) {
    throw new Error(error);
  }
}

/** Получить список решений. */
async function getSolutions(): Promise<void> {
  const solutions = await getSolutionsRequest();

  Context.data.absences_enabled = solutions.find(f => f.code == VACATION_SOLUTION) ? true : false;
  Context.data.business_trips_enabled = solutions.find(f => f.code == BUSINESS_TRIP_SOLUTION) ? true : false;
}

/** Запуск процесса первичной настройки решения "Отпуска" */
async function vacationsConfigure(): Promise<void> {
  const request = await fetch(`${System.getBaseUrl()}/pub/v1/bpm/template/absences.settings/initial_setting/run`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Context.data.token}`
    },
    body: JSON.stringify({
      "context": {}
    })
  });

  if (!request.ok) {
    throw new Error(`Не удалось запустить процесс первичной настройки отпусков. \n Request: ${JSON.stringify(request)}`);
  }
}

/** Запуск процесса первичной настройки решения "Командировки" */
async function businessTripConfigure(): Promise<void> {
  const request = await fetch(`${System.getBaseUrl()}/pub/v1/bpm/template/business_trips.nastroiki/initial_setting/run`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Context.data.token}`
    },
    body: JSON.stringify({
      "context": {}
    })
  });

  if (!request.ok) {
    throw new Error(`Не удалось запустить процесс первичной настройки командировок. \n Request: ${JSON.stringify(request)}`);
  }
}

async function enable1cIntegration(): Promise<void> {
  const integration_1c = await Context.fields.settings.app.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.code.eq('integration_1c')
    ))
    .first();

  const alternative_integration = await Context.fields.settings.app.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.code.eq('use_alternative_integration')
    ))
    .first();

  if (!alternative_integration || !integration_1c) {
    throw new Error("Не найдены настройки интеграции с 1С");
  }

  alternative_integration.data.status = Context.data.need_integration_1c ?? false;
  integration_1c.data.status = Context.data.need_integration_1c ?? false;

  await Promise.all([alternative_integration.save(), integration_1c.save()]);
}

async function setNewMethodCreateSign(): Promise<void> {
  let new_method_create_sign = await Context.fields.settings.app.search().where(f => f.code.eq('new_method_create_sign')).first();

  if (!new_method_create_sign) {
    throw new Error("Не найдена настройка 'Использовать модуль Интеграция с УЦ для выдачи НЭП' с кодом 'new_method_create_sign'");
  }

  new_method_create_sign.data.status = true;

  await new_method_create_sign.save();
}

/** Запуск процесса заполнения таблицы связанных документов из модуля КЭДО. */
async function fillRealatedDocumentsTable(): Promise<void> {
  try {
    const request = await fetch(`${System.getBaseUrl()}/pub/v1/bpm/template/ext_7fe3de7d-f459-4f75-940c-271c6e9ea1ed/fill_related_documents_table_workflow/run`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Context.data.token}`
      },
      body: JSON.stringify({ context: {} })
    });

    if (!request.ok) {
      throw new Error(JSON.stringify(request));
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function fillGUIDTable(): Promise<void> {
  const request = await fetch(`${System.getBaseUrl()}/pub/v1/bpm/template/kedo.staff/filling_the_guid_table/run`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Context.data.token}`
    },
    body: JSON.stringify({
      "context": {}
    })
  });

  if (!request.ok) {
    throw new Error(`Не удалось запустить процесс Заполнения таблицы GUID у сотрудников. \n Request: ${JSON.stringify(request)}`);
  }
}
