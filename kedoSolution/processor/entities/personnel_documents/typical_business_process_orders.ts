/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

/** Смена статуса для приложения приказа.
 * @param status_code код статуса
 */
async function setOrderStatus(status_code: string): Promise<void> {
    if (!Context.data.decree) {
        throw new Error("Context.data.decree is undefined");
    }

    const order = await Context.data.decree.fetch();
    const order_statuses = order.fields.__status.all;
    const status = order_statuses.find((i: { code: string; }) => i.code == status_code);

    if (!status) {
        throw new Error(`status with code ${status_code} not found`);
    }

    await order.setStatus(status);

    order.data.line_status = `${order.data.__status.code};${order.data.__status.name}`;

    await order.save();
}

async function status_signing(): Promise<void> {
    await setOrderStatus('signing')
}

async function status_signed(): Promise<void> {
    await setOrderStatus('signed');
}

async function status_rejected(): Promise<void> {
    await setOrderStatus('rejected');
}

/** Генерация тела оповещения. */
async function generateAlertBody(): Promise<void> {
    if (!Context.data.decree) {
        throw new Error("Context.data.decree is undefined");
    }

    const order = await Context.data.decree.fetch();
    Context.data.alert_body = `Подготовлен ${order.data.__name}. Подпишите его электронной подписью на портале КЭДО`;
}

/** Запись файла XML в приказ. */
async function setXmlFile(): Promise<void> {
    if (!Context.data.decree) {
        throw new Error("Context.data.decree is undefined");
    }

    const order = await Context.data.decree.fetch();
    order.data.xml_file = Context.data.xml_file;
    await order.save();
}

async function getSigners(): Promise<void> {
    const kedo_settings = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('head_signing_notification')
        ))
        .first();
    Context.data.head_signing_notification = kedo_settings ? kedo_settings.data.status : false;

    const staff = await Context.data.staff?.fetch();
    const organization_staff = await staff?.data.organization?.fetch();
    Context.data.signers_app = organization_staff?.data.signatories;

    if (Context.data.decree) {
        const ref = new RefItem(Context.data.decree.namespace, Context.data.decree.code, Context.data.decree.id);
        Context.data.personnel_documents = await Context.fields.personnel_documents.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__sourceRef.eq(ref!)
        )).first();
    }
}
