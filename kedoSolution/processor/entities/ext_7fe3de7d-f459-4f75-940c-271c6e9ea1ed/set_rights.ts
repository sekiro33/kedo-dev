/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
Документация TS SDK доступна на сайте https://tssdk.elma365.com.
**/

class MyRole {
    group: UserGroupItem | UserItem[] | OrganisationStructureItem
    type: 'group' | 'user' | 'orgstruct'
    code: string
    constructor(group: UserGroupItem | UserItem[] | OrganisationStructureItem, type: 'group' | 'user' | 'orgstruct', code: string) {
        this.code = code;
        this.group = group;
        this.type = type;
    }
    getUsers(): Promise<UserItem[]> {
        if (this.type == "group") {
            return (<UserGroupItem>this.group).users();
        }
        else if (this.type == "orgstruct") {
            return System.users.search().where(i => i.osIds.has((<OrganisationStructureItem>this.group))).size(10000).all()
        }
        else return new Promise<UserItem[]>(() => <UserItem[]>this.group)
    }
    json(): any {
        return {
            code: this.code,
            type: this.type
        }
    }
}

const app_codes = [
    "vacation_docs",
    "vacation_orders",
    "vacations",
    "staff",
]

async function get_app_type(): Promise<void> {
    if (!Context.data.app) {
        throw new Error("Context.data.app is undefined");
    }

    const app = await Context.data.app.fetch();

    Context.data.code = app.code;
    Context.data.namespace = app.namespace;
}

async function check_app_code(): Promise<boolean> {
    if (!Context.data.code) {
        return false;
    }

    if (app_codes.find(f => f == Context.data.code)) {
        return true;
    }

    return false;
}


async function set_permissions(): Promise<void> {
    if (!Context.data.access_settings_organization) {
        Context.data.debug = "Context.data.access_settings_organization is undefined";
        throw new Error("Context.data.access_settings_organization is undefined")
    }

    const app = await Context.data.app!.fetch();
    const get_access_settings_organization = await Context.data.access_settings_organization.fetch();

    // Получаем группу в зависимости от кода приложения.
    const groups = get_access_settings_organization.data[Context.data.code! as keyof typeof get_access_settings_organization.data];
    Context.data.debug += app.id

    if (!groups) {
        Context.data.debug += `access_settings_organization group (${Context.data.code!}) is undefined`;
        throw new Error(`access_settings_organization group (${Context.data.code!}) is undefined`);
    }

    if (!app.fields.access_group) {
        Context.data.debug += groups[0].code;
        throw new Error(`no field access_group in app ${app.code}`);
    }
    app.data.access_group = [];
    const roleGroup = await System.userGroups.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__id.eq(groups[0].code)
    )).first();
    Context.data.debug += roleGroup!.data.__id
    const newRole = new MyRole(roleGroup!, "group", roleGroup!.id) as Role;
    app.data.access_group = [newRole];
    await app.save();

    // if (app.data.hasOwnProperty('access_group')) {
    //     app.data.access_group = groups;
    // }
    // await app.setPermissions(permissions);
}

async function get_access_settings(): Promise<void> {
    const app = await Context.data.app!.fetch();
    let kedo_staff: ApplicationItem<Application$kedo$staff$Data, any>;

    // Определяем организацию.
    switch (Context.data.code) {
        // Сотрудники.
        case "staff":
            Context.data.organization = app.data.organization;
            break;

        // Отпуска.
        case "vacations":
            if (app.data.kedo_staff) {
                kedo_staff = await app.data.kedo_staff.fetch();
                Context.data.organization = kedo_staff.data.organization;
            }
            break;

        // Заявления на отпуск.
        case "vacation_docs":
            if (app.data.kedo_staff) {
                kedo_staff = await app.data.kedo_staff.fetch();
                Context.data.organization = kedo_staff.data.organization;
            }
            break;

        // Приказы на отпуск.
        case "vacation_orders":
            if (app.data.kedo_staff) {
                kedo_staff = await app.data.kedo_staff.fetch();
                Context.data.organization = kedo_staff.data.organization;
            }
            break;

        default:
            break;
    }

    if (!Context.data.organization) {
        Context.data.debug = `Context.data.organization is undefined. App code ${Context.data.code}`;
        throw new Error(`Context.data.organization is undefined. App code ${Context.data.code}`);
    };

    
    const organization = await Context.data.organization.fetch();
    if (organization.data.access_settings_organization) {
        const accessSettings = await organization.data.access_settings_organization.fetch();
        Context.data.access_settings_organization = accessSettings;
        Context.data.access_settings_name = accessSettings.data.__name
    }

    // Context.data.access_settings_organization = await Context.fields.access_settings_organization.app.search()
    //     .where((f, g) => g.and(
    //         f.__deletedAt.eq(null),
    //         f.organization.link(Context.data.organization!)
    //     ))
    //     .first();
}


async function log(): Promise<void> {
    const token = "87fd58b9-5c8c-479b-a357-0ae42a56ae45";

    const ok = {
        code: "ok",
        name: "ok"
    }

    const error = {
        code: "error",
        name: "error"
    }

    const currentDatetime = new Datetime().format();
    const element = await Context.data.app!.fetch();
    const organization = Context.data.organization?.id;
    const acess_setting = Context.data.access_settings_organization?.id;
    const result = Context.data.debug ? error : ok;

    const body = {
        "context": {
            "app": {
                "id": element.id,
                "code": element.code,
                "namespace": element.namespace
            },
            "error": Context.data.debug,
            "result": [
                result
            ],
            "organization": organization ? [organization] : [],
            "access_setting_organization": acess_setting ? [acess_setting] : [],
            "create_datetime": currentDatetime,
            "group_name": Context.data.access_settings_name
        }
    }

    try {
        await fetch(`https://kedo-onpremis-test1.sale.elewise.com/pub/v1/app/kedo_tests/access_settings_log/create`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });
    } catch (e) {
        Context.data.debug = JSON.stringify(e);
    }
}
