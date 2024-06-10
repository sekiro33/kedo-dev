declare const console: any, document: any;
async function onInit():Promise<void>{
    const baseUrl = System.getBaseUrl();
    const tokenSetting = await Namespace.app.settings.search().where(f => f.code.eq("api_key")).first();

    if (!tokenSetting || !tokenSetting.data.value) {
        Context.data.enabled_module_code = "null";
        return;
    };

    if(Context.data.sign_provider && Context.data.sign_provider.find(variant => variant.code.toLowerCase() === "kontur")){
        console.log("kontur")
        ViewContext.data.kontur = true;
    };

    
    const goskeyResponse = await fetch(`${baseUrl}/pub/v1/scheme/modules/7fb0a0d0-fc8d-452e-843f-6a7f2f28a8bf`, {
        headers: {
            Authorization: `Bearer ${tokenSetting.data.value}`
        }
    });

    if (goskeyResponse.ok) {
        const responseJson = await goskeyResponse.json();
        const goskeyEnabled = responseJson.module.enabled;

        if (!goskeyEnabled) {
            ViewContext.data.goskey_enabled = false;
        };
    };
};

async function onLoad(): Promise<void> {
    const labels = document.querySelectorAll(".itemscope__item");
    getProvider();

    if (!ViewContext.data.goskey_enabled) {
        const goskeyLabel = Array.from(labels).find((node: any) => {
            const nodeLabel = node.querySelector("label");
            console.log(nodeLabel.textContent.toLowerCase().includes("госключ"))

            if (nodeLabel.textContent.toLowerCase().includes("госключ")) {
                return node;
            };
        });
        if (goskeyLabel) {
            console.log("found");
            (goskeyLabel as any).remove()
        }
    }
};

// async function checkProvider():Promise<void> {
//     if (Context.data.provider && Context.data.provider.code === "kontur") {
//         ViewContext.data.kontur = true
//         ViewContext.data.kontur = ViewContext.data.kontur;
//     } else {
//         ViewContext.data.kontur = false;
//     };
// };

async function getProvider(): Promise<void> {
    const providerCodes = Context.data.sign_provider ? Context.data.sign_provider.map(p => p.code) : [];
    const labels = Array.from(document.querySelectorAll(".itemscope__item"));
    const signMeLabel = <any>labels.find((node: any) => {
        const label = node.querySelector("label");
        return label.textContent.toLowerCase().includes("sign.me");
    });
    const konturLabel = <any>labels.find((node: any) => {
        const label = node.querySelector("label");
        return label.textContent.toLowerCase().includes("контур");
    });
    signMeLabel.classList.remove("disabled");

    ViewContext.data.kontur = Context.data.sign_provider && providerCodes.indexOf("kontur") !== -1;
    ViewContext.data.show_api_key_field = Context.data.sign_provider && (providerCodes.indexOf("sign_me") !== -1 || providerCodes.indexOf("kontur") !== -1);

    if (Context.data.sign_provider && (providerCodes.indexOf("sign_me") !== -1 || providerCodes.indexOf("kontur")) !== -1 && providerCodes.indexOf("goskey") !== -1) {
        ViewContext.data.show_staff_choice_field = true;
    } else {
        ViewContext.data.show_staff_choice_field = false;
        Context.data.leave_choice_to_staff = false;
    };

    if (Context.data.sign_provider && Context.data.sign_provider.find(variant => variant.code.toLowerCase() === "kontur")) {
        if (!signMeLabel.classList.contains("disabled")) {
            signMeLabel.classList.add("disabled");
        };
    } else if (Context.data.sign_provider) {
        signMeLabel.classList.remove("disabled");
    }
    if (Context.data.sign_provider && Context.data.sign_provider.find(variant => variant.code.toLowerCase() === "sign_me")) {
        if (!konturLabel.classList.contains("disabled")) {
            konturLabel.classList.add("disabled");
        };
    } else if (Context.data.sign_provider) {
        konturLabel.classList.remove("disabled");
    };
};

async function findOrganization(): Promise<void> {
    if (Context.data.entity) {
        const organization = await Application.search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.entity.link(Context.data.entity!)
            ))
            .first();
        if (organization) {
            ViewContext.data.show_error = true;
        } else {
            ViewContext.data.show_error = false;
        }
    }
    else {
        ViewContext.data.show_error = false;
    }

}

async function validation(): Promise<ValidationResult> {
    const result = new ValidationResult();
    if (ViewContext.data.show_error === true) {
        result.addContextError('entity', `Организация с указанным юр.лицом уже создана`)
    }
    return result
}

async function changeDefaultGroups(): Promise<void> {
    const allStaff = await Namespace.app.staff.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ext_user.neq(null)
    )).size(10000).all();
    const domenSetting = await Namespace.app.settings.search().where(f => f.code.eq("domen")).first();
    const tokenSetting = await Namespace.app.settings.search().where(f => f.code.eq("api_key")).first();
    if (!domenSetting || !tokenSetting) {
        return;
    };
    const domen = domenSetting.data.value;
    const token = tokenSetting.data.value;
    console.log(token);
    let accountingIds: string[] | undefined = undefined;
    let hrIds: string[] | undefined = undefined;
    let specialIds: string[] | undefined = undefined;
    let signatoriesIds: string[] = [];
    if (Context.data.accounting && Context.data.accounting.length > 0) {
        accountingIds = Context.data.accounting.map(staff => {
            const staffData = allStaff.find(s => s.id === staff.id);
            if (staffData) {
                return staffData.data.ext_user!.id
            };
            return ""
        }).filter(item => item);
    };

    if (Context.data.signatories && Context.data.signatories.length > 0) {
        signatoriesIds = Context.data.signatories.map(staff => {
            const staffData = allStaff.find(s => s.id === staff.id);
            if (staffData) {
                return staffData.data.ext_user!.id
            };
            return ""
        }).filter(item => item);
    };

    if (Context.data.special_access_new && Context.data.special_access_new.length > 0) {
        specialIds = Context.data.special_access_new.map(staff => {
            const staffData = allStaff.find(s => s.id === staff.id);
            if (staffData) {
                return staffData.data.ext_user!.id
            };
            return ""
        }).filter(item => item)
    }

    if (Context.data.hr_department && Context.data.hr_department.length > 0) {
        hrIds = Context.data.hr_department.map(staff => {
            const staffData = allStaff.find(s => s.id === staff.id);
            if (staffData) {
                return staffData.data.ext_user!.id
            };
            return ""
        }).filter(item => item);
    };
    await fetch(`https://${domen}/api/extensions/7fe3de7d-f459-4f75-940c-271c6e9ea1ed/script/change_hr_department_and_accounting`, {
        method: "POST",
        body: JSON.stringify({
            org_id: Context.data.__id,
            accounting_ids: accountingIds,
            hr_ids: hrIds,
            special_ids: specialIds,
            signatories_ids: signatoriesIds
        })
    });
};
