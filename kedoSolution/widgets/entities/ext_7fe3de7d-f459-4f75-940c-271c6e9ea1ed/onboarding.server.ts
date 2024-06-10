/* Server scripts module */
const blankFileBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAMSURBVBhXY/j//z8ABf4C/qc1gYQAAAAASUVORK5CYII=";

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    let binaryString = atob(base64);
    let bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function appProcessRun(): Promise<void> {
    Context.data.process_id = await Context.fields.user_application.app.processes.Employment.run({});
}

async function getOrSetLicenseFile(): Promise<void> {
    //@ts-ignore
    Context.data.license_file_link = await Namespace.params.data.kedo_license_file.getDownloadUrl();
};

async function getUnepEsiaTask(): Promise<void> {
    let user = await System.users.getCurrentUser();
    let unepTask = await System.processes._searchTasks().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.performers.has(user),
        f.__name.like("подтвердить заявку через ЕСИА")
    )).first();
    if (!!unepTask) {
        Context.data.sign_task_id = unepTask.data.__id;
    };
}

async function getUnepTask(): Promise<void> {
    let user = await System.users.getCurrentUser();
    let unepTask = await System.processes._searchTasks().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.performers.has(user),
        f.__name.like("подписать через смс"),
        f.state.like("in_progress")
    )).first();
    if (!!unepTask) {
        Context.data.sign_task_id = unepTask.data.__id;
    };
};

async function getLnaTask(): Promise<void> {
    let currentUser = await System.users.getCurrentUser();
    let lnaTasks: any[] = [];
    const alternativeIntegration = await Context.fields.settings.app.search().where(f => f.code.eq("custom_lna")).first();
    if (alternativeIntegration && alternativeIntegration.data.status) {
        const templateNsAndCode = alternativeIntegration.data.value;

        const tasks = await System.processes._searchTasks().where((f, g) => g.and(
            f.templateNsAndCode.eq(templateNsAndCode!),
            f.__deletedAt.eq(null),
            f.performers.has(currentUser)
        )).size(10000).all();
        
        lnaTasks = tasks.map(task => {
            return {
                taskId: task.id,
                docName: task.data.__name,
                status: task.data.state
            };
        });

        Context.data.debug = JSON.stringify(lnaTasks);
    } else {
        const rawTasks = await Context.fields.lna_app.app.processes.introduction_lna._searchTasks().where((f, g) => g.and(
            f.__createdBy.eq(currentUser),
            f.state.like("in_progress")
        )).size(10000).all()
        lnaTasks = rawTasks.map(task => {
            return {
                taskId: task.id,
                docName: task.data.__name,
                status: task.data.state
            }
        });
    };

    let taskObjects: {id: string, name: string, status: string}[] = [];

    for (let task of lnaTasks) {
        let docName = task.docName.split(":")[1].trim();

        if (taskObjects.map(t => t.id).indexOf(task.taskId) == -1) {
            taskObjects.push({ id: task.taskId, name: docName, status: task.status});
        };
    };

    Context.data.lna_json = JSON.stringify(taskObjects);
};

async function getLogoFromParams(): Promise<void> {
    if (!Namespace.params.data.portal_logo_svg) return;

    Context.data.logo_from_params = Namespace.params.data.portal_logo_svg;
}

let lastFuncTimeServ: number;

function addLogToArrServ(text: string) {
    const timeNow = (new Date()).getTime()

    const funcTime = (timeNow - lastFuncTimeServ) / 1000
    const commonTime = (timeNow - Context.data.vremya_nachala_test!) / 1000

    Context.data.test_data_server += `   ${text} - функция длилась ${funcTime}c, с момента запуска портала ${commonTime}/`
}

async function getVerificationType() {
    let typeCode = Namespace.params.data.unep_provider.code;
    Context.data.verification_type = typeCode;
}

// логирование =========================================
// let zeroTimePoint:number;
// function setZeroTime(){
//     zeroTimePoint = (new Date).getTime();
// }
// function writeProcessTime(text:string){
//     const timeNow = (new Date()).getTime()

//     const funcTime = (timeNow - zeroTimePoint)/1000

//     Context.data.test_data_server += `${text} - функция выполнялась ${funcTime}c
// `
// }
// ===============

async function getHRData(): Promise<void> {
    // lastFuncTimeServ = Number(Context.data.test_data_server)
    Context.data.test_data_server = ''
    async function getPostitonApp() {
        if (!hrUser) return;

        lastFuncTimeServ = (new Date).getTime()
        try {
            positionApp = await hrUser.positions()
        }
        catch (err) {
            Context.data.error += `hrUser.positions error ${err}`;
        }
        addLogToArrServ('hrUser.positions')
    }

    async function getAvatarLink() {
        if (!hrUser) return;

        lastFuncTimeServ = (new Date).getTime()
        try {
            avatarLink = await hrUser.data.avatar!.getDownloadUrl();
        }
        catch (err) {
            Context.data.error += `hrUser.data.avatar!.getDownloadUrl error ${err}`;
        }
        addLogToArrServ('hrUser.data.avatar!.getDownloadUrl')
    }

    if (!Context.data.user_application) {
        return;
    }

    let userApp: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params> | undefined = undefined;
    lastFuncTimeServ = (new Date).getTime()
    try {
        userApp = await Context.data.user_application.fetch();
    }
    catch (err) {
        Context.data.error += `user_application.fetch error ${err}`;
    }
    addLogToArrServ('Context.data.user_application.fetch')

    if (!userApp) return;
    if (!userApp.data.staff_member) return;

    let hrUser: UserItem | undefined = undefined;
    lastFuncTimeServ = (new Date).getTime()
    try {
        hrUser = await userApp.data.staff_member.fetch();
    }
    catch (err) {
        Context.data.error += `userApp.data.staff_member.fetch error ${err}`;
    }
    addLogToArrServ('userApp.data.staff_member.fetch')

    if (!hrUser) return;

    // position avatar
    let positionApp: any = undefined;
    let avatarLink: string = '';

    // await Promise.all([getPostitonApp(), getAvatarLink()])     
    await getPostitonApp()
    await getAvatarLink()

    let positionElement: any;
    let positionElementData: any = undefined;
    let positionElementDataName: any;
    let position: string | undefined = '';

    if (positionApp) {
        if (positionApp.length > 0) {
            positionElement = positionApp[0];
        }
    }
    if (positionElement) {
        positionElementData = positionApp[0].data;
    }
    if (positionElementData) {
        positionElementDataName = positionApp[0].data.name;
    }
    if (positionElementDataName) {
        position = positionElementDataName;
    }

    // name
    let name: string = '';
    if (hrUser.data.fullname) {
        if (hrUser.data.fullname.firstname) {
            name += hrUser.data.fullname.firstname
        }
        if (hrUser.data.fullname.lastname) {
            name += ' ' + hrUser.data.fullname.lastname
        }
    }

    // phone
    let phone: string = '';
    if (hrUser.data.workPhone) {
        phone = hrUser.data.workPhone!.tel
    } else if (hrUser.data.mobilePhone) {
        phone = hrUser.data.mobilePhone!.tel
    }

    const resultArr = {
        mail: !hrUser.data.email ? '' : hrUser.data.email,
        name: name,
        phone: phone,
        position: position,
        avatarLink
    }

    Context.data.hr_employee_data = resultArr;
}

async function saveContextStep1Stage1(): Promise<void> {
    // setZeroTime()
    const userApp = await Context.data.user_application!.fetch();
    // writeProcessTime('user_application!.fetch')

    if (userApp) {
        userApp.data.full_name!.firstname = !Context.data.name ? '' : Context.data.name;
        userApp.data.full_name!.lastname = !Context.data.surname ? '' : Context.data.surname;
        if (Context.data.patronymic && Context.data.patronymic.length > 0) {
            userApp.data.middlename = Context.data.patronymic;
            userApp.data.full_name!.middlename = Context.data.patronymic;
        };
        userApp.data.date_of_birth = Context.data.date_of_birth;
        userApp.data.sex = Context.data.gender;
        userApp.data.marriage = Context.data.marriage;
        userApp.data.email = Context.data.email_work;
        userApp.data.phone = Context.data.phone_number_work;

        // setZeroTime()
        try {
            await userApp.save();
        }
        catch (err) {
            throw new Error(`userApp.save error ${err}`);
        }
        // writeProcessTime('userApp.save')
    }
}

async function saveContextStep1Stage2(): Promise<void> {
    const userApp = await Context.data.user_application!.fetch();

    if (userApp) {
        let addressArray: string[] = [];
        const region = Context.data.region_app ? await Context.data.region_app.fetch() : undefined
        userApp.data.directory_of_regions = Context.data.region_app || undefined
        userApp.data.region = region ? region.data.__name : "";
        userApp.data.city = Context.data.city || "";
        userApp.data.street = Context.data.street || "";
        userApp.data.home = Context.data.house || "";
        userApp.data.housing = Context.data.housing || "";
        userApp.data.apartment = Context.data.flat || "";

        region && addressArray.push(region.data.__name);
        Context.data.city && addressArray.push(`г ${Context.data.city}`);
        Context.data.street && addressArray.push(`ул ${Context.data.street}`);
        Context.data.housing && addressArray.push(`корп ${Context.data.housing}`);
        Context.data.house && addressArray.push(`д ${Context.data.house}`);
        Context.data.flat && addressArray.push(`кв ${Context.data.flat}`);

        userApp.data.address = addressArray.join(", ");

        try {
            await userApp.save();
        }
        catch (err) {
            throw new Error(`userApp.save error ${err}`);
        }
    }
}

async function saveContextStep1Stage3(): Promise<void> {
    // setZeroTime()
    const userApp = await Context.data.user_application!.fetch();
    // writeProcessTime('user_application!.fetch')

    if (userApp) {
        userApp.data.russian_passport = Context.data.russian_passport;
        userApp.data.passport_series = Context.data.passport_series;
        userApp.data.passport_number = Context.data.passport_number;
        userApp.data.date_of_issue = Context.data.date_of_issue;
        userApp.data.issued_by = Context.data.issuer;
        userApp.data.passport_department_code = Context.data.issuer_code;
        userApp.data.inn = Context.data.inn;
        userApp.data.snils = Context.data.snils;
       
        // setZeroTime()
        try {
            await userApp.save();
        }
        catch (err) {
            throw new Error(`userApp.save error ${err}`);
        }
        // writeProcessTime('userApp.save')
    }
}

async function getGoskeyFile(): Promise<void> {
    Context.data.goskey_file_link = await Namespace.params.data.goskey_info_file.getDownloadUrl();
};

async function saveContextStep1Stage4(): Promise<void> {
    // setZeroTime()
    const userApp = await Context.data.user_application!.fetch();
    // writeProcessTime('user_application!.fetch')

    if (userApp) {
        // userApp.data.passport_page_with_photo_and_data = Context.data.passport_first_spread;
        // userApp.data.the_passport_page_with_current_registration = Context.data.passport_registration;
        // userApp.data.snils_file = Context.data.snils_photo;
        // userApp.data.inn_file = Context.data.inn_photo;

        userApp.data.documents_for_employment = Context.data.doc_table;

        // setZeroTime()
        try {
            await userApp.save();
        }
        catch (err) {
            throw new Error(`userApp.save error ${err}`);
        }
        // writeProcessTime('userApp.save')
    }
}

async function saveContextStep1Stage5(): Promise<void> {
    // setZeroTime()
    const userApp = await Context.data.user_application!.fetch();
    // writeProcessTime('user_application!.fetch')

    if (userApp) {
        userApp.data.photo_with_unfolded_passport = Context.data.passport_face_photo;

        // setZeroTime()
        try {
            await userApp.save();
        }
        catch (err) {
            throw new Error(`userApp.save error ${err}`);
        }
        // writeProcessTime('userApp.save')
    }
}

async function saveContextSetStatusStep2(): Promise<void> {
    const userApp = await Context.data.user_application!.fetch();
    if (userApp) {
        userApp.data.scan_soev = Context.data.signed_agreement_scan;

        try {
            await userApp.setStatus(userApp.fields.__status.variants.conclude_an_agreement);
        }
        catch (err) {
            throw new Error(`userApp.setStatus error ${err}`);
        }

        try {
            await userApp.save();
        }
        catch (err) {
            await userApp.setStatus(userApp.fields.__status.variants.acquaintance_with_the_agreement);
            throw new Error(`userApp.save error ${err}`);
        }
    }
}

async function getUserEntity(): Promise<void> {
    if (!Context.data.user_application) return;

    let userApp: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params> | undefined = undefined;
    let entityApp: ApplicationItem<Application$_system_catalogs$_my_companies$Data, Application$_system_catalogs$_my_companies$Params> | undefined = undefined;
    try {
        userApp = await Context.data.user_application.fetch()
    }
    catch (err) {
        Context.data.error += `Context.data.user_application.fetch error ${err}`;
    }
    if (!userApp) {
        return;
    }
    if (!userApp.data.entity) {
        return;
    }
    try {
        entityApp = await userApp.data.entity.fetch();
    }
    catch (err) {
        Context.data.error += `userApp.data.entity.fetch error ${err}`;
    }

    if (!entityApp) {
        return;
    }
    if (entityApp.data.__name) {
        Context.data.entity = entityApp.data.__name;
    }
}

async function getPrivacyPolicyAndApprovalId(): Promise<void> {
    if (Context.data.user_application) {
        let userApp: ApplicationItem<Application$kedo$staff$Data, Application$kedo$staff$Params> | undefined = undefined;
        try {
            userApp = await Context.data.user_application.fetch();
        }
        catch (err) {
            Context.data.error += `Context.data.user_application.fetch error ${err}`;
            Context.data.debug += ` Context.data.user_application.fetch error ${err} `
        }

        if (!userApp) {
            Context.data.debug += " no user app "
            return;
        }

        let userEntityApp: ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params> | undefined = undefined;
        if (userApp.data.organization) {
            try {
                userEntityApp = await userApp.data.organization.fetch();
            }
            catch (err) {
                Context.data.error += `userApp.data.entity.organization error ${err}`;
                Context.data.debug += `userApp.data.entity.organization error ${err}`
            }
        }

        if (!userEntityApp) {
            Context.data.debug += " no organization "
            return
        }

        if (userEntityApp.data.confidentiality_policy) {
            Context.data.id_privacy_policy = userEntityApp.data.confidentiality_policy.id;
        }
        if (userEntityApp.data.agreement_processing_personal_data) {
            Context.data.approval_id = userEntityApp.data.agreement_processing_personal_data.id;
        }
        await getOrSetLicenseFile();
    };
}

async function createFileForTable(): Promise<void> {
    const fileBuffer = base64ToArrayBuffer(Context.data.table_file_buffer);
    const [fileName, indexValue] = Context.data.doc_name_and_index!.split(";");
    const index = Number(indexValue);
    const newFile = await Context.fields.passport_first_spread.create(fileName, fileBuffer);
    const contextTable = Context.data.doc_table!;
    const tableRow = contextTable[index];
    if (tableRow) {
        tableRow.file_doc = newFile;
        Context.data.doc_table = contextTable;
    };
};