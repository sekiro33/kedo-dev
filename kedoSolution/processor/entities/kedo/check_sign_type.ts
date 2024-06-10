type Organization = ApplicationItem<Application$kedo$organization$Data, any>
type mockSignObj = {
    docId: string,
    sign: string
};

let signVariants: typeof Context.fields.staff.app.fields.organization.app.fields.sign_provider.variants;
let moduleCodes: string[];

async function checkModules(): Promise<void> {
    if (Context.data.work_docs_sign) {
        Context.data.sign_type = Context.fields.sign_type.variants.goskey;
        return;
    };
    
    const baseUrl = System.getBaseUrl();
    const tokenSetting = await Namespace.app.settings.search().where(f => f.code.eq("api_key")).first();

    if (!tokenSetting || !tokenSetting.data.value) {
        Context.data.module_codes = JSON.stringify(["null"]);
        return;
    };

    let goskeyEnabled = false;
    let commonIntegrationEnabled = false

    const goskeyResponse = await fetch(`${baseUrl}/pub/v1/scheme/modules/7fb0a0d0-fc8d-452e-843f-6a7f2f28a8bf`, {
        headers: {
            Authorization: `Bearer ${tokenSetting.data.value}`
        }
    });

    if (goskeyResponse.ok) {
        const responseJson = await goskeyResponse.json();
        goskeyEnabled = responseJson.module.enabled;
    };

    const commonIntegrationResponse = await fetch(`${baseUrl}/pub/v1/scheme/modules/27c1fb4a-e011-47a6-aa26-cf0fc42c39cd`, {
        headers: {
            Authorization: `Bearer ${tokenSetting.data.value}`
        }
    });

    if (commonIntegrationResponse.ok) {
        const responseJson = await commonIntegrationResponse.json();
        commonIntegrationEnabled = responseJson.module.enabled;
    };

    // if ([goskeyEnabled, commonIntegrationEnabled].every(item => item)) {
    //     Context.data.mo
    // }

    Context.data.module_codes = [goskeyEnabled, commonIntegrationEnabled].every(item => item) ? JSON.stringify(["all"]) :
        goskeyEnabled ? JSON.stringify(["goskey"]) :
        commonIntegrationEnabled ? JSON.stringify(["inner_sign"]) : JSON.stringify(["null"]);

    await checkStaffSignType();
};

async function checkStaffSignType(): Promise<void> {
    if (!Context.data.staff) {
        Context.data.sign_type = Context.fields.sign_type.variants.inner_sign;
        return;
    };

    const staff = await Context.data.staff.fetch();
    
    if (!staff.data.organization) {
        Context.data.sign_type = Context.fields.sign_type.variants.null;
        return;
    };

    moduleCodes = <string[]>JSON.parse(Context.data.module_codes!);

    if (checkModuleCodes("null")) {
        Context.data.sign_type = Context.fields.sign_type.variants.null;
        return;
    };

    const employmentPositions = await Context.fields.employment_directory_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.__status.eq(Context.fields.employment_directory_app.app.fields.__status.variants.actual),
        f.staff.link(staff)
    )).size(100).all();

    if (!employmentPositions || employmentPositions.length < 1) {
        Context.data.sign_type = Context.fields.sign_type.variants.inner_sign;
        return;
    };

    let organization: Organization;

    const mainWorkPlace = employmentPositions.find(pos => pos.data.type_employment && pos.data.type_employment.code === pos.fields.type_employment.variants.main_workplace.code);
    const additionalWorkPlace = employmentPositions.find(pos => pos.data.type_employment && pos.data.type_employment.code === pos.fields.type_employment.variants.external_combination.code);

    if (mainWorkPlace && mainWorkPlace.data.organization) {
        organization = await mainWorkPlace.data.organization.fetch();
    } else if (additionalWorkPlace && additionalWorkPlace.data.organization) {
        organization = await additionalWorkPlace.data.organization.fetch();
    } else {
        Context.data.sign_type = Context.fields.sign_type.variants.null;
        return;
    };

    const signType: TEnum<Enum$kedo$organization$sign_provider>[] | undefined = organization.data.sign_provider;
    signVariants = organization.fields.sign_provider.variants;

    if (signType) {
        if (checkModuleCodes("all") && (checkSignVariants(signVariants.sign_me, signType) || checkSignVariants(signVariants.kontur, signType)) && checkSignVariants(signVariants.goskey, signType) && organization.data.leave_choice_to_staff) {
            if (staff.data.docs_signing_type) {
                const staffSignVariants = staff.fields.docs_signing_type.variants;

                Context.data.debug = "staff choice"

                switch (true) {
                    case (checkModuleCodes("goskey") || checkModuleCodes("all")) && staff.data.docs_signing_type.code === staffSignVariants.goskey.code:
                        Context.data.sign_type = Context.fields.sign_type.variants.goskey;
                        break;
                    case (checkModuleCodes("inner_sign") || checkModuleCodes("all")) && staff.data.docs_signing_type.code === staffSignVariants.inner_sign.code:
                        Context.data.sign_type = Context.fields.sign_type.variants.inner_sign;
                        break;
                    case checkModuleCodes("all") && staff.data.docs_signing_type.code === staffSignVariants.make_choice.code:
                        Context.data.sign_type = Context.fields.sign_type.variants.staff_choice;
                        break;
                };
                return;
            }
        } else if (checkModuleCodes("all") && (checkSignVariants(signVariants.sign_me, signType) || checkSignVariants(signVariants.kontur, signType)) && checkSignVariants(signVariants.goskey, signType) && !organization.data.leave_choice_to_staff) {
            const variantCode = organization.data.sign_provider![0].code;
            switch (variantCode) {
                case "sign_me":
                case "kontur":
                    Context.data.debug = "test"
                    Context.data.sign_type = Context.fields.sign_type.variants.inner_sign;
                    break;
                case "goskey":
                    Context.data.sign_type = Context.fields.sign_type.variants.goskey;
                    break;
            };
            return;
        } else if ((checkModuleCodes("inner_sign") || checkModuleCodes("all")) && (checkSignVariants(signVariants.kontur, signType) || checkSignVariants(signVariants.sign_me, signType))) {
            Context.data.sign_type = Context.fields.sign_type.variants.inner_sign;
            return;
        } else if ((checkModuleCodes("goskey") || checkModuleCodes("all")) && checkSignVariants(signVariants.goskey, signType)) {
            Context.data.sign_type = Context.fields.sign_type.variants.goskey;
            return;
        };
    } else if (staff.data.docs_signing_type) {
        if ((checkModuleCodes("goskey") || checkModuleCodes("all")) && staff.data.docs_signing_type == staff.fields.docs_signing_type.variants.goskey) {
            Context.data.sign_type = Context.fields.sign_type.variants.goskey;
            return;
        } else if ((checkModuleCodes("inner_sign") || checkModuleCodes("all")) && staff.data.docs_signing_type == staff.fields.docs_signing_type.variants.inner_sign) {
            Context.data.sign_type = Context.fields.sign_type.variants.inner_sign;
            return;
        } else if (checkModuleCodes("all") && staff.data.docs_signing_type == staff.fields.docs_signing_type.variants.make_choice) {
            Context.data.sign_type = Context.fields.sign_type.variants.staff_choice;
            return;
        };
    };
};

async function runGoskeyProcess(): Promise<void> {
    const staff = await Context.data.staff!.fetch();
    const snils = staff.data.snils;
    const goskeyFiles = Context.data.goskey_docs!.map(item => {
        return {
            namespace: item.namespace,
            code: item.code,
            id: item.id
        }
    });

    const userId = staff.data.ext_user!.id;
    const baseUrl = System.getBaseUrl();
    const tokenSetting = await Namespace.app.settings.search().where(f => f.code.eq("api_key")).first();
    const token = tokenSetting!.data.value;
    const packageName = Context.data.package_name;
    let runProcessResponse: FetchResponse;

    runProcessResponse = await fetch(`${baseUrl}/pub/v1/bpm/template/ext_7fb0a0d0-fc8d-452e-843f-6a7f2f28a8bf/send_docs_to_goskey/run`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            context: {
                snils,
                docs_for_sign: goskeyFiles,
                user: [
                    userId
                ],
                docs_description: packageName
            }
        })
    });
    if (!runProcessResponse.ok) {
        throw new Error(`Ошибка при запуске процесса: ${await runProcessResponse.text()}`);
    };
    const processJson = await runProcessResponse.json();
    const processId = processJson.context.__id;
    Context.data.process_id = processId;
};

async function checkProcessState(): Promise<void> {
    const processId = Context.data.process_id;
    const baseUrl = System.getBaseUrl();
    const tokenSetting = await Namespace.app.settings.search().where(f => f.code.eq("api_key")).first();
    const token = tokenSetting!.data.value;
    const response = await fetch(`${baseUrl}/pub/v1/bpm/instance/${processId}/get`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error(`error: ${await response.text()}`);
    };
    const responseJson = await response.json();
    if (responseJson.data.__state === ProcessInstanceState.done) {
        Context.data.sign_rejected = !responseJson.data.docs_signed;
        Context.data.inner_sign_choose = responseJson.data.inner_sign_choose;
        Context.data.sign_object = responseJson.data.sign_object;
        Context.data.process_end = true;
    };
};

function checkModuleCodes(code: string) {
    return moduleCodes.indexOf(code) !== -1;
};

function checkSignVariants(variant: TEnum<Enum$kedo$organization$sign_provider>, providers: TEnum<Enum$kedo$organization$sign_provider>[]): boolean {
    return providers.map(p => p.code).indexOf(variant.code) !== -1;
};

async function setDocSigns(): Promise<void> {
    const signObjArray: mockSignObj[] = JSON.parse(Context.data.sign_object!);
    const docs = await Promise.all(Context.data.goskey_docs!.map(doc => doc.fetch()))

    for (let item of signObjArray) {
        const currentDoc = docs.find(doc => doc.id === item.docId);
        const signData: SignData[] = await currentDoc.getDataSigns();
        const fileHash = signData.find(s => s.type === "file")!.body;
        const newSign: NewSign = {
            sign: item.sign,
            body: fileHash,
            codeProvider: "Goskey"
        };
        await currentDoc.uploadSign(newSign);
    };
};
