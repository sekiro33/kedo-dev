/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
Документация TS SDK доступна на сайте https://tssdk.elma365.com.

Сигнатуры функций

Для синхронного взаимодействия:
    async function action(): Promise<void>;

Для модели проверки результата:
    async function action(): Promise<void>;
    async function check(): Promise<boolean>;

Для модели обратного вызова:
    async function action(url: string): Promise<void>;
    async function callback(req: HTTPRequest): Promise<void>;

**/

async function action(): Promise<void> {
    const refItem = new RefItem<ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>>('kedo', 'organization', Context.data.organization!.id);
    const organiaztion = await refItem.fetch();

    if (!organiaztion.data.position_head) {
        throw new Error("Не указана должность руководителя организации");
    }

    const position_head = await organiaztion.data.position_head.fetch();
    const staff = position_head.data.staff;
    if (staff && staff.length > 0) {
        const head_staffs = await Promise.all(staff.map(f => f.fetch()));
        for (const head_staff of head_staffs) {
            if (head_staff.data.__status && head_staff.data.__status.code == head_staff.fields.__status.variants.signed_documents.code) {
                Context.data.head_staff = head_staff;
                Context.data.head_staff_user = head_staff.data.ext_user;
                break;
            }
        }
        if (!Context.data.head_staff)
            throw new Error("На должности руководителя не найдено ни одного трудоустроенного сотрудника");
    } else {
        throw new Error("На должности руководителя организации не указаны сотрудники");
    }
}
