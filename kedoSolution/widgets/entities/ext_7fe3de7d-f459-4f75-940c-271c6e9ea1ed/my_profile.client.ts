declare const console: any;
declare const navigator: any;
declare const document: any;
declare const window: any;
import zip from "zip.min.js"

function showLoader() {
    let loaderWrapper: any;
    const findLoader = window.setInterval(() => {
        loaderWrapper = document.querySelector(".loader-wrapper-template").content.cloneNode(true);
        if (!loaderWrapper) {
            return;
        };
        window.clearInterval(findLoader);
        const profileContent = document.querySelector(".kedo__my-profile_cotent");
        profileContent.append(loaderWrapper);
    }, 500)
};

function hideLoader() {
    let loaderWrapper = document.querySelector(".loader-wrapper")
    loaderWrapper.remove();
};

async function init(): Promise<void> {
    showLoader();
    await findUser();
    addCopyAndDownloadLogic();
    addButtonsLogic();
    clearAddImageArea();
};

async function renderDigitalSigns(digitalSignsItems: ApplicationItem<Application$kedo$digital_signs_list$Data, any>[]): Promise<void> {
    const digitalSignsContainerTemplate = document.querySelector(".digital-signs-container-template").content.cloneNode(true);
    const digitalSignsContainer = digitalSignsContainerTemplate.querySelector(".digital-signs-container");
    const digitalSignsMock = document.querySelector(".digital-signs-mock");
    const currentUser = await System.users.getCurrentUser();
    const userName = currentUser.data.__name;
    const certificateModal = document.querySelector(".certificate-modal");

    for (let sign of digitalSignsItems) {
        const digitalSignElement = document.querySelector(".digital-sign-item-template").content.cloneNode(true);
        const digitalSignContainer = digitalSignElement.querySelector(".digital-sign-item-container");
        const digitalSignStatus = digitalSignElement.querySelector(".digital-sign-item-status .digital-sign-item-info_value");
        const digitalSignValidity = digitalSignElement.querySelector(".digital-sign-item-valid .digital-sign-item-info_value");
        const digitalSignCertificate = digitalSignElement.querySelector(".download-certificate");
        const digitalSignInfo = digitalSignElement.querySelector(".sign-info-button");
        const certificateLink = await sign.data.cert_file?.getDownloadUrl();
        const certificateInfotemplate = document.querySelector(".certificate-info-template").content.cloneNode(true);
        const certificateInfoContainer = certificateInfotemplate.querySelector(".certificate-information-container")
        const ceertificateUser = certificateInfotemplate.querySelector(".user-link");
        const certificateStatus = certificateInfotemplate.querySelector(".cert-status");
        const certificateNumber = certificateInfotemplate.querySelector(".cert-number");
        const certificateValid = certificateInfotemplate.querySelector(".cert-valid");
        const certificateId = certificateInfotemplate.querySelector(".cert-id");
        const certificateFullName = certificateInfotemplate.querySelector(".cert-full-name");
        const certificateInn = certificateInfotemplate.querySelector(".cert-inn");
        const certificateEmail = certificateInfotemplate.querySelector(".cert-email");
        ceertificateUser.textContent = userName;
        certificateStatus.textContent = sign.data.status;
        certificateNumber.textContent = sign.data.serial_number;
        certificateId.textContent = sign.data.external_id;
        certificateFullName.textContent = userName;
        certificateInn.textContent = sign.data.inn;
        certificateEmail.textContent = sign.data.email;
        certificateValid.textContent = sign.data.valid_to ? sign.data.valid_to.format("DD.MM.YY") : "";
        if (certificateLink) {
            digitalSignCertificate.addEventListener("click", () => {
                window.location.href = certificateLink;
            });
        };
        digitalSignInfo.addEventListener("click", () => {
            certificateInfoContainer.classList.add("active");
            if (!certificateModal.classList.contains("active")) {
                certificateModal.classList.add("active");
            };
        });
        digitalSignStatus.textContent = sign.data.status;
        digitalSignValidity.textContent = sign.data.valid_to ? sign.data.valid_to.format("DD.MM.YY") : "";
        digitalSignContainer.append(certificateInfotemplate)
        digitalSignsContainer.append(digitalSignElement);
    };

    certificateModal.addEventListener("click", () => {
        let allCerts = document.querySelectorAll(".certificate-information-container");
        allCerts.forEach((cert: any) => cert.classList.remove("active"));
        certificateModal.classList.remove("active");
    });
    digitalSignsMock.append(digitalSignsContainer)
};

function addButtonsLogic() {
    let changeToFamilyButton = document.querySelector("#family-change");
    let changeToCategoriesButton = document.querySelector("#categories-change");
    let categoriesContainer = document.querySelector(".kedo__my-profle_docs-misc-info_categories");
    let familyContainer = document.querySelector(".kedo__my-profle_docs-misc-info_content");

    changeToFamilyButton.addEventListener("click", (event: any) => {
        if (changeToFamilyButton.classList.contains("button-pressed")) {
            return;
        };
        changeToFamilyButton.classList.add("button-pressed");
        changeToCategoriesButton.classList.remove("button-pressed");
        categoriesContainer.classList.add("invisible-block");
        familyContainer.classList.remove("invisible-block");
    });

    changeToCategoriesButton.addEventListener("click", (event: any) => {
        if (changeToCategoriesButton.classList.contains("button-pressed")) {
            return;
        };
        changeToCategoriesButton.classList.add("button-pressed");
        changeToFamilyButton.classList.remove("button-pressed");
        familyContainer.classList.add("invisible-block");
        categoriesContainer.classList.remove("invisible-block");
    });
}

function findNewPhoto() {
    let setImage = window.setInterval(async () => {
        let newPhoto = Context.data.avatar;
        
        if (!!newPhoto) {
            window.clearInterval(setImage);
            let imgLink = await Context.data.avatar!.getDownloadUrl();
            Context.data.photo_link = imgLink;
            window.setTimeout(async () => {
                await Server.rpc.setNewAvatar();
                let oldAvatar = document.querySelector(".kedo__my-profle_header-user-image");
                let avatarMock = document.querySelector(".kedo__my-profle_header-user-avatar");
                if (avatarMock.style.display == "flex") {
                    avatarMock.style.display = "none";
                };
                oldAvatar.src = "";
                oldAvatar.src = `data:image/png;base64, ${Context.data.base64_photo}`;
                if (oldAvatar.style.display === "none") {
                    oldAvatar.style.display = "inline";
                };
                Context.data.avatar = undefined;
            }, 1000)
        };
    }, 1000);
};

function clearAddImageArea() {
    let findContainer = window.setInterval(() => {
        let addImageContainer = document.querySelector(".avatar-change .elma-form-text_normal");

        if (addImageContainer) {
            let newImage = document.querySelector(".image-svg").cloneNode(true).content;
            let dropArea = document.querySelector(".drop-area");
            dropArea.addEventListener("click", findNewPhoto);
            addImageContainer.innerText = "";
            addImageContainer.appendChild(newImage);
            window.clearInterval(findContainer);
        };
    }, 500);
};

async function changeUserNotifications(): Promise<void> {
    let notificationChoice = Array.from(document.querySelectorAll(".notification-item input")).find((node: any) => node.checked == true) as any;
    let notificationString = notificationChoice.value;
    Context.data.user_notifications_string = notificationString;
    await Server.rpc.changeNotifications();
};

function setAvatarMock(userName: string) {
    let findMock = !!document.querySelector(".kedo__my-profile_header-user-initials");
    if (findMock) {
        return;
    };
    let initialsContainer = document.createElement("div");
    initialsContainer.className = "kedo__my-profile_header-user-initials";
    initialsContainer.innerText = userName;
    let avatarContainer = document.querySelector(".kedo__my-profle_header-user-avatar");
    avatarContainer.style.display = "flex";
    avatarContainer.style.backgroundColor = "#ECF3FF";
    avatarContainer.appendChild(initialsContainer);
};

async function getAndSetUserData(): Promise<void> {
    let user = await Context.data.employee_card!.fetch();
    let externalUser = await System.users.getCurrentUser();

    let avatarExists = !!externalUser!.data.avatar;
    Context.data.current_user = externalUser;
    const digitalSigns = await Context.fields.digital_signs_app.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.user.eq(externalUser),
        f.status.like("Выпущена")
    )).size(100).all();
    if (digitalSigns && digitalSigns.length > 0) {
        await renderDigitalSigns(digitalSigns)
    };
    if (!avatarExists) {
        let userName = `${user!.data.full_name!.lastname[0]}${user!.data.full_name!.firstname[0]}`;
        setAvatarMock(userName);
    } else {
        let userImageContainer = document.querySelector(".kedo__my-profle_header-user-image");
        Context.data.photo_link = await externalUser!.data.avatar!.getDownloadUrl();
        await Server.rpc.getUserAvatar();
        userImageContainer.style.display = "inline";
        let imageBase64 = Context.data.base64_photo;
        userImageContainer.src = `data:image/png;base64, ${imageBase64}`;    
    };

    let userOrganization = user!.data.organization ? await user!.data.organization.fetch().then(o => o.data.__name) : "Не определена";
    let userSubdivision = user!.data.structural_subdivision ? await user!.data.structural_subdivision.fetch().then(s => s.data.__name) : "Не определена";
    let userNotifications = user!.data.notification!.code;
    let nameContainer = document.querySelector(".kedo__my-profle_header-user-work-info");
    let userName = nameContainer.querySelector(".user-name");
    let userPosition = nameContainer.querySelector(".user-position");
    let workInfoContainers = Array.from(document.querySelectorAll(".work-content-item")) as any[];
    let notificationItems = Array.from(document.querySelectorAll(".notification-item input")) as any[];
    let passportInfoContainers = Array.from(document.querySelectorAll(".passport-info-item_value")) as any[];
    let otherInfoBlock = document.querySelector(".kedo__my-profle_docs-misc-info_content");
    let otherInfoCategories = document.querySelector(".kedo__my-profle_docs-misc-info_categories");
    let userTin = document.querySelector("#tin");
    let userSnils = document.querySelector("#snils");
    let email = user!.data.email ? user.data.email.email : "";
    let phone = user!.data.phone ? user.data.phone.tel : "";
    
    workInfoContainers.find(node => node.classList.contains("email")).querySelector(".work-content-item_info-value").innerText = email;
    workInfoContainers.find(node => node.classList.contains("organization")).querySelector(".work-content-item_info-value").innerText = userOrganization;
    workInfoContainers.find(node => node.classList.contains("phone")).querySelector(".work-content-item_info-value").innerText = phone;
    workInfoContainers.find(node => node.classList.contains("subdivision")).querySelector(".work-content-item_info-value").innerText = userSubdivision;

    notificationItems.find(node => node.value == userNotifications).checked = true;

    userName.innerText = user!.data.__name;
    userPosition.innerText = user!.data.position ? await user!.data.position.fetch().then(p => p.data.__name) : "Не определена";

    passportInfoContainers.find(node => node.id == "passport-name").innerText = user!.data.__name;
    passportInfoContainers.find(node => node.id == "passport-gender").innerText = user!.data.sex == true ? "Мужской" : "Женский";
    passportInfoContainers.find(node => node.id == "passport-birthday").innerText = user!.data.date_of_birth ? user!.data.date_of_birth.format("DD.MM.YY") : "Не указана";
    passportInfoContainers.find(node => node.id == "passport-birthplace").innerText = user!.data.address || "Не указан";
    passportInfoContainers.find(node => node.id == "passport-number").innerText = `${user!.data.passport_series} ${user!.data.passport_number}` ;
    passportInfoContainers.find(node => node.id == "passport-issue-date").innerText = user!.data.date_of_issue ? user!.data.date_of_issue.format("DD.MM.YY") : "Не указана";
    passportInfoContainers.find(node => node.id == "passport-subdivision").innerText = user!.data.passport_department_code;
    passportInfoContainers.find(node => node.id == "passport-issue-department").innerText = user!.data.issued_by;
    userTin.innerText = user.data.inn;
    userSnils.innerText = user.data.snils;
    notificationItems.forEach(item => item.addEventListener("change", changeUserNotifications));

    await Promise.all([
        await Server.rpc.getFamilyData(),
        await Server.rpc.getUserCategories()
    ]);

    let userCategories = Context.data.staff_categories;
    let userFamily = Context.data.family_json

    if (!!userCategories && userCategories.length > 0) {
        for (let category of userCategories) {
            let categoryRow = document.querySelector(".misc-info-category_template").cloneNode(true).content;
            let categoryName = categoryRow.querySelector(".misc-info-category_value");

            categoryName.innerText = category.name + "\n" + "Действует до: " + category.date;
            otherInfoCategories.appendChild(categoryRow);
        };
    } else {
        let emptyBlock = otherInfoCategories.querySelector(".block-empty");
        emptyBlock.classList.remove("invisible-block");
    };

    if (!!userFamily && userFamily.length > 0) {
        for (let familyMember of userFamily) {
            let familyBlock = document.querySelector(".misc-info-item_template").cloneNode(true).content;
            let blockKey = familyBlock.querySelector(".misc-info-item_label");
            let blockValue = familyBlock.querySelector(".misc-info-item_value");
            blockKey.innerText = familyMember.kind
            blockValue.innerText = familyMember.name
            otherInfoBlock.appendChild(familyBlock);
        };
    } else {
        let emptyBlock = otherInfoBlock.querySelector(".block-empty");
        let copyInfo = document.querySelector(".kedo__my-profle_misc-header");
        copyInfo.style.display = "none";
        emptyBlock.classList.remove("invisible-block");
    };
    return hideLoader();
};

async function findUser(): Promise<void> {
    let findUserInterval = window.setInterval(async () => {
        if (!Context.data.employee_card) {
            return;
        };
        window.clearInterval(findUserInterval);
        await getAndSetUserData();
    }, 500);
};

async function downloadAllDocs(): Promise<void> {
    let loaderSpinner = document.querySelector(".loader-spinner");
    loaderSpinner.classList.remove("invisible-block");
    let staff = await Context.data.employee_card!.fetch();
    let employmentDocs: any[];

    employmentDocs = [...await Promise.all([await staff.fields.documents_employment.fetchAll(), await staff.fields.personal_documents.fetchAll()])];
    employmentDocs = [].concat.apply([], employmentDocs);
    
    if (!employmentDocs) {
        return;
    };

    let fileName = ''
    let base64Writer = new zip.Data64URIWriter("application/zip");
    let zipWriter = new zip.ZipWriter(base64Writer);
    let dublicatedFileNames: {name: string, copies: number}[] = [];
    let mappedDocs = await Promise.all(employmentDocs.map(async doc => {
        let docFile = (await doc.data.__sourceRef!.fetch()).data.__file;

        if (!docFile) {
            return;
        };

        let fileBuffer = await fetch(await docFile.getDownloadUrl()).then(r => r.arrayBuffer());
        let fileBase64 = arrayBufferToBase64(fileBuffer);
        fileName = doc.data.__name;

        return {name: fileName, base64: fileBase64};
    }));
    
    for (let doc of mappedDocs) {
        if (!doc) {
            continue;
        };

        let dublicate: number = 1;

        fileName = doc.name
        let currentFile = dublicatedFileNames.find((obj: any) => obj.name == fileName)!;

        if (!currentFile) {
            dublicatedFileNames.push({name: fileName, copies: 1})
        } else {
            dublicate = currentFile.copies++;
            fileName = `(${dublicate})${fileName}`
        }
        if (!fileName.includes("pdf") || !fileName.includes("txt") || !fileName.includes("docx")) {
            fileName += ".pdf";
        }
        await zipWriter.add(fileName, new zip.Data64URIReader(doc.base64))
    };

    await zipWriter.close()
    let zipBase64 = await base64Writer.getData();
    let a = document.createElement("a");
    a.href = zipBase64;
    a.download = `Кадровые документы (${staff.data.__name})`;
    a.click();

    loaderSpinner.classList.add("invisible-block");
}

function addCopyAndDownloadLogic() {
    // function handleMiscCopy() {
    //     let resultString: string = "";
    //     let item: any;
    //     let miscInfoItems = document.querySelectorAll(".kedo__my-profle_docs-misc-info_content .misc-info-item");
    //     for (item of Array.from(miscInfoItems)) {
    //         let key = item.querySelector(".misc-info-item_label").innerText;
    //         let value = item.querySelector(".misc-info-item_value").innerText;
    //         resultString += `${key}: ${value} \n`
    //     };

    //     navigator.clipboard.writeText(resultString);   
    // };

    function handleOtherInfoCopy(item: any) {
        let textToCopy = "";
        let key = item.querySelector(".other-info_text").innerText;
        let value = item.querySelector(".kedo__my-profle_docs-other-info_item-content").innerText;

        textToCopy = `${key}: ${value}`;
        navigator.clipboard.writeText(textToCopy);
    };

    function handlePassportCopy(passportItems: any) {
        let passportInfoString = "";
        let item: any;

        for (item of Array.from(passportItems)) {
            let key = item.querySelector(".passport-info-item_label").innerText;
            let value = item.querySelector(".passport-info-item_value").innerText;
            passportInfoString += `${key}: ${value} \n`
        };

        navigator.clipboard.writeText(passportInfoString);
    };

    function handleAllInfoCopy(passportItems: any) {
        let allInfoString = "";
        let item: any;

        for (item of Array.from(passportItems)) {
            let key = item.querySelector(".passport-info-item_label").innerText;
            let value = item.querySelector(".passport-info-item_value").innerText;
            allInfoString += `${key}: ${value} \n`
        };

        let tinKey = tinItem.querySelector(".other-info_text").innerText;
        let tinValue = tinItem.querySelector(".kedo__my-profle_docs-other-info_item-content").innerText;
        let snilsKey = snilsItem.querySelector(".other-info_text").innerText;
        let snilsValue = snilsItem.querySelector(".kedo__my-profle_docs-other-info_item-content").innerText;

        allInfoString += `${tinKey}: ${tinValue}\n`;
        allInfoString += `${snilsKey}: ${snilsValue}\n`;

        navigator.clipboard.writeText(allInfoString);
    };

    let passportContainer = document.querySelector(".kedo__my-profle_docs-passport-info_content");
    let passportItems = passportContainer.querySelectorAll(".passport-info-item");
    let copyAllInfo = document.querySelector(".kedo__my-profile_docs-copy-all");
    let copyPassport = document.querySelector(".passport-info-copy_button");
    let copyMiscInfo = document.querySelector(".kedo__my-profle_misc-copy");
    let otherInfoItems = document.querySelectorAll(".kedo__my-profle_docs-other-info_item");
    let downloadDocsButton = document.querySelector(".kedo__my-profle_docs-download-info");
    let tinItem = otherInfoItems[0];
    let snilsItem = otherInfoItems[1];

    downloadDocsButton.addEventListener("click", downloadAllDocs);
    downloadDocsButton.addEventListener("touchend", downloadAllDocs);

    otherInfoItems.forEach((item: any) => {
        item.addEventListener("click", () => {
            handleOtherInfoCopy(item);
        });
        
        item.addEventListener("touchend", () => {
            handleOtherInfoCopy(item);
        });
    });

    copyPassport.addEventListener("click", () => {
        handlePassportCopy(passportItems)
    });

    copyPassport.addEventListener("touchend", () => {
        handlePassportCopy(passportItems)
    });

    copyAllInfo.addEventListener("click", () => {
        handleAllInfoCopy(passportItems)
    });

    copyAllInfo.addEventListener("touchend", () => {
        handleAllInfoCopy(passportItems)
    });
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa(binary);
};