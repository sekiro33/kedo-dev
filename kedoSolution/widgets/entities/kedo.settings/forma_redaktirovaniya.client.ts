/* Client scripts module */

interface TypeNotifications {
    name: string,
    code: string,
}

const NOTIFICATIONS: TypeNotifications[] = [
    {
        name: 'Email',
        code: 'email'
    },
    {
        name: 'SMS',
        code: 'sms'
    },
    {
        name: 'Email и SMS',
        code: 'email_and_sms'
    },
]

async function onInit(): Promise<void> {
    if (Context.data.status == true || Context.data.status == false)
        ViewContext.data.view_status = true
    if (Context.data.members && Context.data.members.length > 0)
        ViewContext.data.view_groups = true
    // if (Context.data.feature)
    //     ViewContext.data.view_app = true
    if (Context.data.quantity || Context.data.quantity == 0)
        ViewContext.data.view_count = true
    // if (Context.data.value)
    //     ViewContext.data.view_meaning = true

    if (Context.data.code == "notification_staff") {
        ViewContext.data.view_category = true;

        for (let item of NOTIFICATIONS) {
            Context.fields.category.data.variants.push({ code: item.code, name: item.name });
        }
    }
}
