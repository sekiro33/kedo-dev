const userNotificationsReference = {
    email: {
        name: "Email",
        code: "email"
    },
    sms: {
        name: "SMS",
        code: "sms"
    },
    email_and_sms: {
        name: "Email и SMS",
        code: "email_and_sms"
    },
    without_notifications: {
        name: "Без уведомлений",
        code: "without_notifications"
    }
};

type notificationKey = keyof typeof userNotificationsReference;

async function getUserCategories(): Promise<void> {
    let user = await Context.data.employee_card!.fetch();
    let userCategories = user.data.categories_table;
    let categories: any[] = [];

    if (!!userCategories) {
        for (let category of userCategories) {
            let categoryApp = await category.staff_categories.fetch();
            let categoryName = categoryApp.data.__name;
            let categoryDate = category.expiration_date ? category.expiration_date.format("DD.MM.YYYY") : "Без срока";
            let categoryObj = {
                name: categoryName,
                date: categoryDate
            };
            categories.push(categoryObj);
        };
    };

    Context.data.staff_categories = categories;
}

async function setNewAvatar(): Promise<void> {
    let user = await Context.data.ext_user_app!.fetch();
    let imgLink = Context.data.photo_link!;
    let photoArrayBuffer = await fetch(imgLink).then(response => response.arrayBuffer());
    let newImg = await Context.fields.avatar.create("new-img.jpg", photoArrayBuffer);
    let photoBase64 = btoa(new Uint8Array(photoArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    Context.data.base64_photo = photoBase64;
    user.data.avatar = newImg;
    await user.save();
};

async function getFamilyData(): Promise<void> {
    let user = await Context.data.employee_card!.fetch();
    let userFamily = await Context.fields.family.app.search().where(i => i.staff.link(user)).all();
    let familyData: any[] = [];

    for (let user of userFamily) {
        familyData.push({kind: user.data.relation_degree!.name, name: `${user.data.full_name!.lastname} ${user.data.full_name!.firstname} ${user.data.full_name!.middlename}`})
    }

    Context.data.family_json = familyData
}

async function changeNotifications(): Promise<void> {
    let user = await Context.data.employee_card!.fetch();
    let notificationChoice = Context.data.user_notifications_string;
    let notificationObj = userNotificationsReference[notificationChoice as notificationKey];
    user.data.notification = {name: notificationObj.name, code: notificationObj.code as Enum$kedo$staff$notification};
    await user.save();
};

async function getUserAvatar(): Promise<void> {
    let photoLink = Context.data.photo_link!;
    let photoArrayBuffer = await fetch(photoLink).then(response => response.arrayBuffer());
    let photoBase64 = btoa(new Uint8Array(photoArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    // let photoBase64 = btoa(String.fromCharCode(...new Uint8Array(photoArrayBuffer)));
    Context.data.base64_photo = photoBase64;
}