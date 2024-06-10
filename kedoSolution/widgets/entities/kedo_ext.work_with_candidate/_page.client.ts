declare const console: any, document: any, window: any, File: any, DataTransfer: any, FileReader: any, URL: any, VanillaCalendar: any;;

enum FormId {
    START = "start",
    FILL_DATA = "fill_data"
};

enum ButtonType {
    PRIMARY = "primary",
    DANGER = "danger",
    COMMON = "common"
};

enum FieldTypeEnum {
    STRING = "string",
    EMAIL = "email",
    DATE = "date",
    PHONE = "phone",
    BOOLEAN = "boolean",
    FILE = "file",
    CATEGORY = "category",
    SIMPLE = "simple"
};

type candidateDataKey = keyof typeof CandidateDataManager.prototype.candidate.data;

type docData = {
    docId: string,
    docName: string,
    required: boolean,
    file?: FileItem,
    fileName?: string
};

type ButtonComponent = {
    btnType: ButtonType,
    text: string,
    action: Function
};

type KedoFormData = {
    index: string
    title?: string,
    description?: string,
    addData?: Function,
    buttons?: ButtonComponent[],
    replace?: Function,
    wizard?: Wizard,
    validate?: Function,
    fields?: KedoFieldType[]
};

type BoolVariants = {
    name: string,
    code: boolean
};

type CategoryVariants = {
    name: string,
    code: string
};

type KedoFieldType = {
    typeCode: FieldTypeEnum,
    required: boolean,
    label: string,
    appFieldCode?: string,
    maxLength?: number,
    regex?: string,
    variants?: BoolVariants[] | CategoryVariants[],
    placeholder?: string,
    docId?: string,
    id?: string,
    replace?: Function,
    needReplace?: boolean
};

type WizardStep = {
    label: string,
    index: number,
    isFinal: boolean,
    fields?: KedoFieldType[],
    title: string,
    description: string,
    buttons?: ButtonComponent[]
    validate: Function
};

type Wizard = {
    steps: WizardStep[],
};

const formDataObj: KedoFormData[] = [
    {
        index: "1",
        title: "Добро пожаловать на портал! В рамках трудоустройства в компанию companyName Вам необходимо заполнить анкету кандидата и приложить необходимые документы",
        description: "После совершения всех действий нажмите «Продолжить» для перехода к следующему шагу",
        buttons: [
            {
                btnType: ButtonType.PRIMARY, text: "Продолжить",  async action() {
                    await candidateDataManager.setStatus(candidateDataManager.candidate.fields.__status.variants.filling_out_questionnaire);
                    await domManager.refreshForm("2");
                }
            }
        ],
        replace: function (data: {replaceFrom: string, replaceTo: string, field: string}) {
            return this[data.field].replace(data.replaceFrom, data.replaceTo);
        },
        addData: async function() {
            if (!candidateDataManager.relatedPosition.data.description_position && !candidateDataManager.relatedPosition.data.description_position_file) {
                console.log("no positon data")
                return;
            };

            function setPositionFile() {
                positionFileLink.classList.toggle("kedo-hidden");
                candidateDataManager.relatedPosition.data.description_position_file!.getDownloadUrl().then(url => {
                    positionLink.href = url;
                });
                positionLink.textContent = positionLink.textContent.replace("positionName", candidateDataManager.relatedPosition.data.__name);
            };

            function setPositionDescription() {
                positionDescription.innerHTML = candidateDataManager.relatedPosition.data.description_position;
                positionTitle.textContent = positionTitle.textContent.replace("positionName", candidateDataManager.relatedPosition.data.__name);
            };

            const positionInfoTemplate = domManager.positionTemplate.content.cloneNode(true);
            const positionLink = positionInfoTemplate.querySelector(".common-link");
            const positionFileLink = positionInfoTemplate.querySelector(".common-file-field");
            const positionDescription = positionInfoTemplate.querySelector(".common-descriptor");
            const positionTitle = positionInfoTemplate.querySelector(".position_info-container-desctiption_title");

            candidateDataManager.relatedPosition.data.description_position_file && setPositionFile();

            candidateDataManager.relatedPosition.data.description_position && setPositionDescription();

            document.querySelector(".kedo_portal-main_section-container_main-info").appendChild(positionInfoTemplate);
        }
    },
    {
        index: "2",
        wizard: {
            steps: [
                {
                    label: "Основное",
                    title: "Персональные данные",
                    description: "Проверьте и заполните недостающие данные",
                    index: 1,
                    isFinal: false,
                    fields: [
                        {
                            typeCode: FieldTypeEnum.STRING,
                            required: true,
                            label: "Фамилия",
                            appFieldCode: "lastname"
                        },
                        {
                            typeCode: FieldTypeEnum.STRING,
                            required: true,
                            label: "Имя",
                            appFieldCode: "firstname"
                        },
                        {
                            typeCode: FieldTypeEnum.STRING,
                            required: false,
                            label: "Отчество",
                            appFieldCode: "middlename"
                        },
                        {
                            typeCode: FieldTypeEnum.DATE,
                            required: true,
                            label: "Дата рождения",
                            appFieldCode: "date_of_birth",
                            regex: "(0[1-9]|[12][0-9]|3[01])\\.(0[1-9]|1[012])\\.(19|20)\\d\\d",
                            placeholder: "ДД.ММ.ГГГГ",
                            maxLength: 10
                        },
                        {
                            typeCode: FieldTypeEnum.BOOLEAN,
                            required: true,
                            label: "Пол",
                            appFieldCode: "sex",
                            variants: [
                                {
                                    name: "Мужской",
                                    code: true
                                },
                                {
                                    name: "Женский",
                                    code: false
                                }
                            ]
                        },
                        {
                            typeCode: FieldTypeEnum.EMAIL,
                            required: true,
                            label: "E-mail",
                            appFieldCode: "email",
                            regex: "([a-zA-Z0-9._\\-]+@[a-zA-Z0-9._\\-]+\\.[a-zA-Z0-9_\\-]+)"
                        },
                        {
                            typeCode: FieldTypeEnum.PHONE,
                            required: true,
                            label: "Телефон",
                            appFieldCode: "phone",
                            placeholder: "Номер телефона в формате XXXXXXXXXXX (11 цифр)",
                            regex: "(\\+7|8)\\d{10}"
                        }
                    ],
                    buttons: [
                        {
                            btnType: ButtonType.PRIMARY,
                            text: "Продолжить",
                            async action() {
                                const fieldsToUpgrade = formDataObj.find(form => form.index === "2")!.wizard!.steps.find(wizard => wizard.index === 1);
                                const wizardStep = formDataObj.find(form => form.index === "2")!.wizard!.steps.find(wizard => wizard.index === 2);
                                await candidateDataManager.saveCandidateData(fieldsToUpgrade!.fields!.filter(field => field.typeCode !== FieldTypeEnum.SIMPLE && field.typeCode !== FieldTypeEnum.FILE));
                                await domManager.getWizardForm(2, wizardStep!);
                            }
                        }
                    ],
                    validate: function(): boolean {
                        let requiredFields: any[] = [];
                        let field: KedoFieldType;

                        for (field of this.fields) {
                            const relatedNode = document.querySelector(`.required[data-app_code=${field.appFieldCode}]`);
                            relatedNode && relatedNode.querySelector("input") && requiredFields.push(relatedNode);
                        };

                        const genderVariant = document.querySelector(".common_radio-variant.checked");

                        return requiredFields.every((node: any) => {
                            const nodeInput = node.querySelector("input");
                            return nodeInput.validity.valid && nodeInput.value;
                        }) && !!genderVariant;
                    }
                },
                {
                    title: "Адрес регистрации",
                    buttons: [
                        {
                            btnType: ButtonType.COMMON,
                            text: "< Назад",
                            async action() {
                                const wizardStep = formDataObj.find(form => form.index === "2")!.wizard!.steps.find(wizard => wizard.index === 1)
                                await domManager.getWizardForm(1, wizardStep!);
                            }
                        },
                        {
                            btnType: ButtonType.PRIMARY,
                            text: "Продолжить",
                            async action() {
                                const fieldsToUpgrade = formDataObj.find(form => form.index === "2")!.wizard!.steps.find(wizard => wizard.index === 2);
                                const wizardStep = formDataObj.find(form => form.index === "2")!.wizard!.steps.find(wizard => wizard.index === 3);
                                await candidateDataManager.saveCandidateData(fieldsToUpgrade!.fields!);
                                await domManager.getWizardForm(3, wizardStep!);
                            }
                        }
                    ],
                    description: "Заполните адрес регистрации",
                    label: "Адрес регистрации",
                    index: 2,
                    isFinal: false,
                    fields: [
                        {
                            typeCode: FieldTypeEnum.CATEGORY,
                            required: false,
                            label: "Регион",
                            appFieldCode: "directory_of_regions",
                            variants: []
                        },
                        {
                            typeCode: FieldTypeEnum.STRING,
                            required: true,
                            label: "Город (посёлок, село)",
                            appFieldCode: "city"
                        },
                        {
                            typeCode: FieldTypeEnum.STRING,
                            required: true,
                            label: "Улица",
                            appFieldCode: "street"
                        },
                        {
                            typeCode: FieldTypeEnum.STRING,
                            required: true,
                            label: "Дом",
                            appFieldCode: "home"
                        },
                        {
                            typeCode: FieldTypeEnum.STRING,
                            required: false,
                            label: "Корпус",
                            appFieldCode: "housing"
                        },
                        {
                            typeCode: FieldTypeEnum.STRING,
                            required: false,
                            label: "Квартира",
                            appFieldCode: "apartment"
                        },
                    ],
                    validate() {
                        let requiredFields: any[] = [];
                        let field: KedoFieldType;

                        for (field of this.fields) {
                            const relatedNode = document.querySelector(`.required[data-app_code=${field.appFieldCode}]`);
                            relatedNode && relatedNode.querySelector("input") && requiredFields.push(relatedNode);
                        };

                        return requiredFields.every((node: any) => {
                            const nodeInput = node.querySelector("input");
                            return nodeInput.validity.valid && nodeInput.value;
                        });
                    }
                },
                {
                    title: "Документы",
                    label: "Документы",
                    description: "Пожалуйста отсканируйте или сфотографируйте необходимые для загрузки документы и прикрепите файлы. Обратите внимание, что сканы/фото документов должны быть хорошего качества",
                    index: 3,
                    isFinal: true,
                    fields: [
                        
                    ],
                    buttons: [
                        {
                            btnType: ButtonType.COMMON,
                            text: "< Назад",
                            async action() {
                                const wizardStep = formDataObj.find(form => form.index === "2")!.wizard!.steps.find(wizard => wizard.index === 2);
                                await domManager.getWizardForm(2, wizardStep!);
                            }
                        },
                        {
                            btnType: ButtonType.PRIMARY,
                            text: "Продолжить",
                            async action() {
                                const fieldsToUpgrade = formDataObj.find(form => form.index === "2")!.wizard!.steps.find(wizard => wizard.index === 3);
                                await candidateDataManager.saveCandidateData(fieldsToUpgrade!.fields!);
                                await candidateDataManager.setStatus(candidateDataManager.candidate.fields.__status.variants.questionnaire_completed);
                                await domManager.refreshForm("3");
                            }
                        }
                    ],
                    validate() {
                        let requiredFields = Array.from(document.querySelectorAll(".required"));

                        return requiredFields.every((field: any) => {
                            const fileField = field.querySelector(".file_input");

                            if (!fileField) {
                                const inputField = field.querySelector("input");
                                return inputField.validity.valid && inputField.value; 
                            };

                            return fileField.files.length > 0
                        }) || requiredFields.length < 1;
                    }
                },
            ]
        }
    },{
        index: "3",
        title: "Данные были отправлены на проверку",
        description: "Дождитесь положительного результата. Оповещение придёт вам на почту или по СМС. Система автоматически переведет вас на следующий шаг",
        addData() {
            const infoSvg = document.querySelector(".info_svg-template").content.cloneNode(true).querySelector(".info_svg_container");
            domManager.formContainer.prepend(infoSvg)
        }
    },{
        index: "4",
        title: "Медицинский осмотр",
        description: "В случае получения результатов медосмотра в день прохождения укажите ту же дату",
        fields: [
            {
                label: "Дата прохождения",
                required: true,
                appFieldCode: "medical_request_date",
                typeCode: FieldTypeEnum.DATE,
                maxLength: 10,
                placeholder: "ДД.ММ.ГГГГ"
            },{
                label: "Дата получения медкнижки",
                required: true,
                appFieldCode: "medical_book_date",
                typeCode: FieldTypeEnum.DATE,
                maxLength: 10,
                placeholder: "ДД.ММ.ГГГГ"
            },{
                label: "Результаты медосмотра",
                required: true,
                appFieldCode: "results_medical_examination",
                typeCode: FieldTypeEnum.FILE
            }
        ],
        buttons: [
            {
                btnType: ButtonType.PRIMARY,
                text: "Продолжить",
                async action() {
                    await candidateDataManager.setStatus(candidateDataManager.candidate.fields.__status.variants.medical_examination_completed);
                    await domManager.refreshForm("5")
                }
            }
        ],
        validate() {
            const requiredFields = Array.from(document.querySelectorAll(".required"));
            console.log(requiredFields)
            
            return requiredFields.length < 1 || requiredFields.every((field: any) => {
                const fieldInput = field.querySelector(".common_field-input");

                if (fieldInput) {
                    console.log(`checking input: `, field)
                    return fieldInput.validity && fieldInput.validity.valid && fieldInput.value;
                };

                const fileInput = field.querySelector(".file_input");    
                return fileInput.files && fileInput.files.length > 0;
            });
        },
        addData() {
            const fileLine = document.querySelector(".file_line-template").content.cloneNode(true).querySelector(".file_line-file");
            fileLine.querySelector(".file_line-file_name").textContent = "Направление на медосмотр";
            domManager.mainInfoContainer.prepend(fileLine)
        }
    },{
        index: "5",
        title: "Данные были отправлены на проверку",
        description: "Дождитесь положительного результата. Оповещение придёт вам на почту или по СМС. Система автоматически переведет вас на следующий шаг",
        addData() {
            const infoSvg = document.querySelector(".info_svg-template").content.cloneNode(true).querySelector(".info_svg_container");
            domManager.formContainer.prepend(infoSvg);
        }
    },{
        index: "6",
        buttons: [
            {
                btnType: ButtonType.PRIMARY,
                text: "Подтвердить",
                async action() {
                    await candidateDataManager.setStatus(candidateDataManager.candidate.fields.__status.variants.approved);
                    await domManager.refreshForm("6");
                }
            },
            {
                btnType: ButtonType.COMMON,
                text: "Требуется уточнение",
                async action() {
                    const staffCorrectionContainer = document.querySelector(".staff_correction_container-template").content.cloneNode(true).querySelector(".staff_correction_container");
                    const correctionButton = staffCorrectionContainer.querySelector(".staff_correction_container-button");
                    correctionButton.addEventListener("click", async () => {
                        const correctionText = staffCorrectionContainer.querySelector(".staff_correction-comment_section-input").value;
                        candidateDataManager.candidate.data.correction_comment = correctionText;
                        await candidateDataManager.candidate.save();
                        closeContainer(correctionButton, 'staff_correction_container', true);
                        await candidateDataManager.setStatus(candidateDataManager.candidate.fields.__status.variants.clarifying_job_offer);
                        await domManager.refreshForm("8");
                    });
                    domManager.kedoModal.append(staffCorrectionContainer);
                    domManager.kedoModal.classList.toggle("kedo-hidden");
                    
                }
            }
        ],
        title: "Предложение о работе",
        description: "Поздравляем Вас с Предложением о работе. Пожалуйста, ознакомьтесь с условиями ниже и дайте Ваш ответ в течение delay В случае необходимости изменения даты трудоустройства или уточнения условий нажмите 'Требуется уточнение'",
        fields: [
            {
                typeCode: FieldTypeEnum.SIMPLE,
                label: "Кандидат на позицию - positionName",
                appFieldCode: "",
                required: false,
                replace() {
                    return this.label.replace("positionName", candidateDataManager.relatedPosition.data.__name);
                },
                needReplace: false
            },{
                typeCode: FieldTypeEnum.DATE,
                label: "Дата выхода на работу",
                appFieldCode: "date_employment",
                required: true,
                placeholder: "ДД.ММ.ГГГГ",
                maxLength: 10
            },{
                typeCode: FieldTypeEnum.SIMPLE,
                label: 'Описание позиции positionName',
                appFieldCode: "",
                required: false,
                id: "position_field",
                replace() {
                    return this.label.replace("positionName", candidateDataManager.relatedPosition.data.__name);
                },
                needReplace: false
            },{
                typeCode: FieldTypeEnum.SIMPLE,
                label: 'Распечатайте файл, подпишите Предложение о работе и приложите фото/скан подписанного предложения',
                appFieldCode: "",
                required: false,
                id: "file_info"
            },{
                typeCode: FieldTypeEnum.FILE,
                label: 'Подписанное предложение',
                appFieldCode: "signed_job_offer",
                required: false
            }
        ],
        async addData() {
            const positionInfo = candidateDataManager.relatedPosition.data.description_position;
            const positionInfoContainer = document.createElement("p");
            const fileInfoContainer = document.querySelector("#file_info");
            const positionField = domManager.mainInfoContainer.querySelector("#position_field")
            const fileLine = document.querySelector(".file_line-template").content.cloneNode(true).querySelector(".common-file-field");
            fileLine.querySelector(".file_line-file_name").textContent = "Предложение о работе";
            fileLine.href = candidateDataManager.candidate.data.job_offer_candidate ? await candidateDataManager.candidate.data.job_offer_candidate.getDownloadUrl() : "";
            positionInfoContainer.className = "common-descriptor";
            positionInfoContainer.innerHTML = positionInfo;
            fileInfoContainer.after(fileLine);
            positionField.after(positionInfoContainer);
        }
    },
    {
        index: "7",
        title: "Поздравляем, Вы подтвердили предложение о работе!",
        fields: [
            {
                typeCode: FieldTypeEnum.SIMPLE,
                required: false,
                label: "Дата оформления",
                replace() {
                    return candidateDataManager.candidate.data.issue_date ? candidateDataManager.candidate.data.issue_date.format("DD.MM.YYYY") : ""
                },
                needReplace: true
            },
            {
                typeCode: FieldTypeEnum.SIMPLE,
                required: false,
                label: "Дата первого рабочего дня",
                replace() {
                    return candidateDataManager.candidate.data.date_employment ? candidateDataManager.candidate.data.date_employment.format("DD.MM.YYYY") : ""
                },
                needReplace: true
            },
            {
                typeCode: FieldTypeEnum.SIMPLE,
                required: false,
                label: "Должность",
                replace() {
                    return candidateDataManager.relatedPosition ? candidateDataManager.relatedPosition.data.__name : ""
                },
                needReplace: true
            },
            {
                typeCode: FieldTypeEnum.SIMPLE,
                label: 'Описание позиции positionName',
                appFieldCode: "",
                required: false,
                id: "position_field",
                replace() {
                    return this.label.replace("positionName", candidateDataManager.relatedPosition.data.__name);
                },
                needReplace: false
            },
            {
                typeCode: FieldTypeEnum.SIMPLE,
                label: 'Документы',
                required: false,
                id: "documents_field",
                needReplace: false
            },
            {
                typeCode: FieldTypeEnum.SIMPLE,
                label: 'Дополнительная информация',
                required: false,
                id: "additional_info"
            },
        ],
        async addData() {
            const positionInfo = candidateDataManager.relatedPosition.data.description_position;
            const positionInfoContainer = document.createElement("p");
            const positionField = domManager.mainInfoContainer.querySelector("#position_field")
            const documentsField = document.querySelector("#documents_field");


            positionInfoContainer.className = "common-descriptor";
            positionInfoContainer.innerHTML = positionInfo;

            positionField.after(positionInfoContainer);
            
            if (candidateDataManager.candidate.data.memo_for_candidate) {
                const positionMemoFile = document.querySelector(".file_line-template").content.cloneNode(true).querySelector(".common-file-field");
                positionMemoFile.href = await candidateDataManager.candidate.data.memo_for_candidate.getDownloadUrl();
                positionMemoFile.querySelector(".file_line-file_name").textContent = "Памятка о трудоустройстве";
                documentsField.after(positionMemoFile);
            };

            if (candidateDataManager.candidate.data.job_offer_candidate) {
                const jobOfferFile = document.querySelector(".file_line-template").content.cloneNode(true).querySelector(".common-file-field");
                jobOfferFile.href = await candidateDataManager.candidate.data.job_offer_candidate.getDownloadUrl();
                jobOfferFile.querySelector(".file_line-file_name").textContent = "Предложение о работе";

                documentsField.after(jobOfferFile);
            };
        }
    },
    {
        index: "8",
        title: "Данные были отправлены на уточнение",
        description: "Вы запросили уточнение. Пожалуйста, ожидайте, когда к Вам вернутся с ответом. Вам придет оповещение",
        addData() {
            const infoSvg = document.querySelector(".info_svg-template").content.cloneNode(true).querySelector(".info_svg_container");
            domManager.formContainer.prepend(infoSvg);
        }
    }
];

class DomManager {
    formContainer: any;
    mainInfoContainer: any;
    formFooter: any;
    kedoModal: any;
    formPath: any;
    positionTemplate: any;
    wizardContainer: any;
    wizardStepTemplate: any;
    wizardStepConnect: any;
    textFieldTemplate: any;
    simpleFieldTemplate: any;
    nextButton: any;
    sidePanelInfoCard: any;
    frontIndex = 1;
    formIndex = "0";
    wizardIndex = 1;

    setDate(event: any) {
        const inputField = event.target.closest(".common_field-input-container").querySelector("input");
        const calendarContainer = event.target.closest(".common_field-calendar_container");
        const [year, month, day] = [...event.target.dataset.calendarDay.split("-")];

        inputField.value = `${day}.${month}.${year}`;
        calendarContainer.classList.toggle("hidden");
    };

    formatIssuerCode(input:any) {
        if (!input.value || input.value.includes("-")) {
            return;
        };
        
        input.value = input.value.replace(/(\d{3})/, "$1-");
    };

    formatSnils(input: any) {
        if (!input.value) {
            return;
        };

        switch (input.value.replace(/\-/g, "").replace("\s", "").length) {
            case 3:
                input.value = input.value.replace(/(\d{3})/, '$1-');
                break;
            case 6:
                input.value = input.value.replace(/(\d{3})\-(\d{3})/, '$1-$2-');
                break;
            case 9:
                input.value = input.value.replace(/(\d{3})\-(\d{3})\-(\d{3})/, '$1-$2-$3 ');
                break;
        };
    };

    formatDate(input: any) {
        if (!input.value) {
            return;
        };

        switch (input.value.replace(".", "").length) {
            case 2:
                input.value = input.value.replace(/(\d{2})/, '$1.');
                break;
            case 4:
                input.value = input.value.replace(/(\d{2})\.(\d{2})/, '$1.$2.');
                break;
        };
    };

    async deleteFile(e: any) {
        const target = e.target.classList.contains(".file_input-delete") ? e.target : e.target.closest(".file_input-delete");
        const fileInput = target.parentElement.querySelector(".file_input");
        const fileContainer = target.closest(".common_file-container");
        const fileName = target.parentElement.querySelector(".file_input-name");
        const fileId = target.parentElement.querySelector("input").id.replace("id-", "");
        const table = candidateDataManager.candidate.data.table_personal_documents!;
        const relatedRow = table.find(row => row.document_type.id === fileId);
        //@ts-ignore
        relatedRow!.file_document = undefined;
        candidateDataManager.candidate.data.table_personal_documents = table;
        await candidateDataManager.candidate.save();
        fileContainer.classList.remove("kedo-hidden");
        fileName.classList.add("kedo-hidden");
        target.classList.add("kedo-hidden");
        fileInput.value = "";
    }

    downloadFile(e: any) {
        const fileInput = e.target.parentElement.querySelector(".file_input");
        const url = URL.createObjectURL(fileInput.files[0]);
        const mockLink = document.createElement("a");
        mockLink.target = "_blank";
        mockLink.href = url;
        mockLink.download = fileInput.files[0].name || 'download';
        mockLink.click();
    };

    async refreshForm(index: string) {
        const currentForm = formDataObj.find(form => form.index === index);

        if (currentForm) {
            this.frontIndex = Number(index);
            await this.renderForm(currentForm)
        };
    };

    refreshMainContainer() {
        this.formContainer.querySelector(".kedo_portal-main_section-container_main-info").innerHTML = "";
        this.formContainer.querySelector(".common-title").innerHTML = "";
        this.formContainer.querySelector(".common-descriptor").innerHTML = "";
        this.formContainer.querySelector(".common-button-container").innerHTML = "";
        this.mainInfoContainer.innerHTML = "";
    };

    renderButton(button: ButtonComponent) {
        const newButton = document.createElement("button");
        newButton.classList.add("common-button");
        newButton.classList.add(button.btnType);
        newButton.textContent = button.text;
        button.action && newButton.addEventListener("click", button.action);
        if ([2, 4].indexOf(this.frontIndex) !== -1 && button.btnType === ButtonType.PRIMARY) {
            newButton.classList.add("inactive");
            this.nextButton = newButton;
        };
        this.formFooter.querySelector(".common-button-container").appendChild(newButton);
    };

    async renderForm(currentForm: KedoFormData, dataToReplace?: {replaceFrom: string, replaceTo: string}) {
        this.wizardContainer.innerHTML = "";
        this.refreshMainContainer();

        if (!currentForm.buttons) {
            this.formContainer.classList.add("wait")
        } else {
            this.formContainer.classList.remove("wait");
        };

        if (currentForm.title) {
            this.formContainer.querySelector(".common-title").textContent = currentForm.replace && dataToReplace ? currentForm.replace({...dataToReplace, field: "title"}) : currentForm.title;
        };

        if (currentForm.description) {
            this.formContainer.querySelector(".common-descriptor").textContent = currentForm.replace && dataToReplace ? currentForm.replace({...dataToReplace, field: "description"}) : currentForm.description;
        };

        !this.wizardContainer.classList.contains("kedo-hidden") && this.wizardContainer.classList.add("kedo-hidden");
        currentForm.wizard && await this.processWizard(currentForm.wizard);


        const formSteps: any[] = Array.from(document.querySelectorAll(".kedo_portal-main_section-path_part"));

        if (currentForm.fields) {
            for (let field of currentForm.fields) {
                let validate: Function | undefined;

                if (currentForm.validate) {
                    validate = currentForm.validate.bind(currentForm)
                };

                await this.renderField(field, validate);
            };
        };

        currentForm.addData && currentForm.addData();
        currentForm.buttons && currentForm.buttons.forEach(button => this.renderButton(button));

        for (let i = 0; i + 1 <= this.frontIndex; i++) {
            formSteps[i] && !formSteps[i].classList.contains("active") && formSteps[i].classList.toggle("active");
        };

        formSteps.slice(this.frontIndex).forEach((node: any) => {
            node.classList.contains("active") && node.classList.remove("active");
        });

        if (currentForm.validate) {
            const fieldsIsValid = currentForm.validate();
            fieldsIsValid && this.enableNextButton();
            !fieldsIsValid && this.disableNextButton();
        };

        currentForm.validate && currentForm.validate();
    };

    async processWizard(wizard: Wizard) {
        this.wizardContainer.classList.contains("kedo-hidden") && this.wizardContainer.classList.remove("kedo-hidden");

        for (let step of wizard.steps) {
            const wizardStep = this.getStep(step);
            wizardStep.dataset["wizard_index"] = step.index;
            this.wizardContainer.append(wizardStep);

            if (!step.isFinal) {
                const stepConnect = this.wizardStepConnect.content.cloneNode(true);
                this.wizardContainer.append(stepConnect);
            };
        };

        let stepIndex = 0;

        for (let step of wizard.steps) {
            if (candidateDataManager.checkCandidateFields(step.fields!)) {
                stepIndex++;
            };
        };

        await this.getWizardForm(stepIndex + 1, wizard.steps[stepIndex]);
    };

    async renderField(field: KedoFieldType, validate?: Function) {
        const simpleField = field.typeCode === FieldTypeEnum.SIMPLE;
        const newFieldNode = simpleField ? this.simpleFieldTemplate.content.cloneNode(true).querySelector(".simple_field") : this.textFieldTemplate.content.cloneNode(true).querySelector(".common_field");

        if (field.id) {
            newFieldNode.id = field.id;
        };

        const label = simpleField ? newFieldNode.querySelector(".simple_field-text") : newFieldNode.querySelector(".common_field-label");
        const inputContainer = newFieldNode.querySelector(".common_field-input-container");
        const input = newFieldNode.querySelector(".common_field-input");

        if (candidateDataManager.candidate.data[field.appFieldCode as candidateDataKey]) {
            switch (field.typeCode) {
                case FieldTypeEnum.CATEGORY:
                    input.value = candidateDataManager.region!.data.__name;
                    break;
                case FieldTypeEnum.DATE:
                    input.value = (<TDate>candidateDataManager.candidate.data[field.appFieldCode as candidateDataKey]).format("DD.MM.YYYY");
                    break;
                case FieldTypeEnum.EMAIL:
                    input.value = candidateDataManager.candidate.data.email!.email;
                    break;
                case FieldTypeEnum.PHONE:
                    input.value = candidateDataManager.candidate.data.phone!.tel;
                    break;
                case FieldTypeEnum.STRING:
                    input.value = candidateDataManager.candidate.data[field.appFieldCode as candidateDataKey];
                    break;
            }
        }

        let fieldsIsValid = false;

        !simpleField &&["change", "input", "paste", "blur"].forEach(action => input.addEventListener(action, () => {
            if (validate) {
                fieldsIsValid = validate();
                fieldsIsValid && this.enableNextButton();
                !fieldsIsValid && this.disableNextButton();
            };
        }));
        const booleanField = field.typeCode === FieldTypeEnum.BOOLEAN;

        if (field.typeCode === FieldTypeEnum.DATE) {
            let elementPrototype = Object.getPrototypeOf(input);
            if (elementPrototype.hasOwnProperty("value")) {
                let descriptor = Object.getOwnPropertyDescriptor(elementPrototype, "value");
                Object.defineProperty(input, "value", {
                    get: function() {
                        return descriptor!.get!.apply(this, arguments);
                    },
                    set: function () {
                        descriptor!.set!.apply(this, arguments);
                        if (validate) {
                            fieldsIsValid = validate();
                            fieldsIsValid && domManager.enableNextButton();
                            !fieldsIsValid && domManager.disableNextButton();
                        };
                    }
                });
            }
            const newCalendarNode = document.createElement("div");
            newCalendarNode.className = "common_field-calendar_container";
            newCalendarNode.classList.add("hidden");
            const calendarButton = document.querySelector(".common_date-template").content.cloneNode(true).querySelector(".common_date");
            calendarButton.addEventListener("click", (e: any) => {
                newCalendarNode.classList.toggle("hidden");
            }, false);
            const newCalendar = new VanillaCalendar(newCalendarNode, options);
            inputContainer.append(newCalendarNode);
            inputContainer.append(calendarButton);
            inputContainer.classList.add("common_date-field");
            newCalendar.init();
            input.addEventListener("input", (e: any) => {
                this.formatDate(e.target);
            });
        } else {
            newFieldNode.classList.add(`common_${field.typeCode}`);
        };

        if (field.variants) {
            booleanField && inputContainer.remove();
            let variantsContainer: any;
            let newVariant: any;

            switch (field.typeCode) {
                case FieldTypeEnum.CATEGORY:
                    input.addEventListener("focus", (e: any) => {
                        e.target.nextElementSibling.classList.remove("kedo-hidden");
                    });
                    input.addEventListener("input", () => {
                        const variants = document.querySelectorAll(".common_category-item");
                        variants.forEach((variant: any) => {
                            if (!variant.textContent.toLowerCase().includes(input.value.toLowerCase()) && !variant.classList.contains("kedo-hidden")) {
                                variant.classList.add("kedo-hidden")
                            } else if (variant.textContent.toLowerCase().includes(input.value.toLowerCase()) && variant.classList.contains("kedo-hidden") || !input.value) {
                                variant.classList.remove("kedo-hidden");
                            };
                        });
                    });
                    variantsContainer = document.querySelector(".common_category-container-template").content.cloneNode(true).querySelector(".common_category-container");
                    (field.variants as CategoryVariants[]).forEach(variant => {
                        newVariant = document.querySelector(".common_category-item-template").content.cloneNode(true).querySelector(".common_category-item");
                        newVariant.textContent = variant.name;
                        newVariant.dataset["variant_code"] = variant.code;
                        newVariant.addEventListener("click", () => {
                            input.value = variant.name;
                            input.dataset["variant_code"] = variant.code;
                            newVariant.parentElement.classList.toggle("kedo-hidden");
                        });
                        variantsContainer.append(newVariant);
                    });
                    break;
                case FieldTypeEnum.BOOLEAN:
                    const existingValue = <boolean>candidateDataManager.candidate.data[field.appFieldCode as candidateDataKey];

                    variantsContainer = document.createElement("div");
                    variantsContainer.className = "common_radio";
                    (field.variants as BoolVariants[]).forEach(variant => {
                        newVariant = document.createElement("div");
                        newVariant.className = "common_radio-variant";
                        newVariant.textContent = variant.name;
                        newVariant.dataset["variant_code"] = variant.code;
                        newVariant.addEventListener("click", (e: any) => {
                            commonRadioSelect(e.target);
                            if (validate) {
                                fieldsIsValid = validate();
                                fieldsIsValid && this.enableNextButton();
                                !fieldsIsValid && this.disableNextButton();
                            };
                        });
                        variantsContainer.append(newVariant);
                        if (variant.code === existingValue) {
                            commonRadioSelect(newVariant);
                        };
                    });
            };

            field.typeCode === FieldTypeEnum.CATEGORY && inputContainer.append(variantsContainer);
            field.typeCode === FieldTypeEnum.BOOLEAN && newFieldNode.append(variantsContainer);
        };

        if (field.typeCode === FieldTypeEnum.FILE) {
            inputContainer.remove();
            const fileContainer = document.querySelector(".common_file-container-template").content.cloneNode(true).querySelector(".common_file-container");
            const hiddenInput = fileContainer.querySelector("input");
            const actualInput = fileContainer.querySelector("label");
            hiddenInput.id = `id-${field.docId}`;
            actualInput.htmlFor = `id-${field.docId}`;

            actualInput.addEventListener("dragenter", (e: any) => {
                e.stopPropagation();
                e.preventDefault();
                e.target.parentElement.classList.toggle("hovered");
            });

            actualInput.addEventListener("dragleave", (e: any) => {
                e.stopPropagation();
                e.preventDefault();
                e.target.parentElement.classList.toggle("hovered");
            });

            actualInput.addEventListener("dragover", (e: any) => {
                e.stopPropagation();
                e.preventDefault();
            });

            hiddenInput.addEventListener("change", (e: any) => {
                const files = e.target.files;
                const reader = new FileReader();
                reader.onload = async (e: any) => {
                    const fileInputName = fileContainer.querySelector(".file_input-name");
                    const fileInputDelete = fileContainer.querySelector(".file_input-delete");
                    [fileInputDelete, fileInputName].forEach((node: any) => node.classList.remove("kedo-hidden"));
                    fileInputName.textContent = files[0].name;
                    fileInputName.addEventListener("click", (e: any) => {
                        this.downloadFile(e);
                    });
                    fileInputDelete.addEventListener("click", (e: any) => {
                        this.deleteFile(e).then(_ => {
                            if (validate) {
                                fieldsIsValid = validate();
                                fieldsIsValid && this.enableNextButton();
                                !fieldsIsValid && this.disableNextButton();
                            };
                        });
                    });
                    fileContainer.classList.add("kedo-hidden");
                    if (validate) {
                        fieldsIsValid = validate();
                        console.log("validate file: ", fieldsIsValid)
                        fieldsIsValid && this.enableNextButton();
                        !fieldsIsValid && this.disableNextButton();      
                    };
                };
                reader.readAsArrayBuffer(files[0]);
            })

            actualInput.addEventListener("drop", (e: any) => {
                e.stopPropagation();
                e.preventDefault();
                const dt = e.dataTransfer;
                const files = dt.files;
                e.target.parentElement.classList.toggle("hovered");
                const reader = new FileReader();
                reader.onload = async (e: any) => {
                    const fileBuffer: ArrayBuffer = e.target.result;
                    const table = candidateDataManager.candidate.data.table_personal_documents!
                    const relatedTableRow = table.find(row => row.document_type.id === field.docId);
                    if (relatedTableRow) {
                        relatedTableRow!.file_document = await Context.fields.file_field.create(files[0].name, fileBuffer);
                        candidateDataManager.candidate.data.table_personal_documents = table;
                    } else {
                        candidateDataManager.candidate.data[field.appFieldCode as candidateDataKey] = await Context.fields.file_field.create(files[0].name, fileBuffer);
                    };
                    const fileInputName = fileContainer.querySelector(".file_input-name");
                    const fileInputDelete = fileContainer.querySelector(".file_input-delete");
                    [fileInputDelete, fileInputName].forEach((node: any) => node.classList.remove("kedo-hidden"));
                    fileInputName.textContent = files[0].name;
                    fileInputName.addEventListener("click", (e: any) => {
                        this.downloadFile(e);
                    });
                    fileInputDelete.addEventListener("click", (e: any) => {
                        this.deleteFile(e).then(_ => {
                            if (validate) {
                                fieldsIsValid = validate();
                                fieldsIsValid && this.enableNextButton();
                                !fieldsIsValid && this.disableNextButton();
                            };
                        });
                    });
                    fileContainer.classList.add("kedo-hidden");
                    await candidateDataManager.candidate.save();
                    hiddenInput.files = files;
                    if (validate) {
                        fieldsIsValid = validate();
                        console.log("validate file: ", fieldsIsValid)
                        fieldsIsValid && this.enableNextButton();
                        !fieldsIsValid && this.disableNextButton();
                    };
                };
                reader.readAsArrayBuffer(files[0]);
            });

            const relatedFileObj = candidateDataManager.docsTable.find(file => file.docId === field.docId);

            if (relatedFileObj && relatedFileObj.file) {
                const fileBuffer = await fetch(await relatedFileObj.file.getDownloadUrl()).then(res => res.arrayBuffer());
                const newFile = new File([fileBuffer], relatedFileObj.fileName);
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(newFile);
                hiddenInput.files = dataTransfer.files;
                const fileInputName = fileContainer.querySelector(".file_input-name");
                const fileInputDelete = fileContainer.querySelector(".file_input-delete");
                [fileInputDelete, fileInputName].forEach((node: any) => node.classList.remove("kedo-hidden"));
                fileInputName.textContent = relatedFileObj.fileName;
                fileInputName.addEventListener("click", (e: any) => {
                    this.downloadFile(e);
                });
                fileInputDelete.addEventListener("click", (e: any) => {
                    this.deleteFile(e).then(_ => {
                        if (validate) {
                            fieldsIsValid = validate();
                            fieldsIsValid && this.enableNextButton();
                            !fieldsIsValid && this.disableNextButton();
                        };
                    });
                });
                fileContainer.classList.add("kedo-hidden");
            };

            newFieldNode.append(fileContainer)
        };

        label.textContent = field.replace && !field.needReplace ? field.replace() : field.label;

        if (field.required) {
            label.innerHTML = `${field.label}<span class="required_field"> *</span>`;
        };

        if (field.typeCode === FieldTypeEnum.SIMPLE && field.replace && field.needReplace) {
            newFieldNode.querySelector(".simple_field-description").textContent = field.replace();
        };

        newFieldNode.dataset["app_code"] = field.appFieldCode;

        if (field.regex) {
            input.pattern = field.regex;
        };

        if (field.label === "СНИЛС") {
            input.addEventListener("input", (e: any) => {
                if (e.inputType === "deleteContentBackward" || (input.value && input.value.endsWith("-"))) {
                    return;
                };
                this.formatSnils(e.target);
            });
            input.addEventListener("paste", (e: any) => {
                const data = e.clipboardData.getData('text/plain');
                switch (data.replace(/\-/g, "").replace("\s", "").length) {
                    case 3:
                        input.value = data.replace(/(\d{3})/, '$1-');
                        break;
                    case 6:
                        input.value = data.replace(/(\d{3})\-(\d{3})/, '$1-$2-');
                        break;
                    case 9:
                        input.value = data.replace(/(\d{3})\-(\d{3})\-(\d{3})/, '$1-$2-$3 ');
                        break;
                    default:
                        input.value = data.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1-$2-$3 $4');
                };
            });
        };

        if (field.label === "Код подразделения") {
            input.addEventListener("input", (e: any) => {
                if (e.inputType === "deleteContentBackward" || (input.value && input.value.endsWith("-"))) {
                    return;
                };
                this.formatIssuerCode(e.target);
            });
            input.addEventListener("paste", (e: any) => {
                const data = e.clipboardData.getData('text/plain');
                input.value = data.replace(/(\d{3})/, '$1-');
            });
        }
        
        if (field.maxLength) {
            input.maxLength = field.maxLength;
        };

        if (field.placeholder) {
            input.placeholder = field.placeholder;
        };

        field.replace && field.replace()
        field.required && newFieldNode.classList.add("required");

        this.mainInfoContainer.append(newFieldNode);
    };

    async getWizardForm(index: number, wizardStep: WizardStep) {
        this.refreshMainContainer();
        const wizardSteps: any = Array.from(document.querySelectorAll(".wizard_step"));
        this.formContainer.querySelector(".common-title").textContent = wizardStep.title;
        this.formContainer.querySelector(".common-descriptor").textContent = wizardStep.description;
        let fieldsIsValid = false;

        for (let field of wizardStep.fields!) {
            const validate = wizardStep.validate.bind(wizardStep);
            await this.renderField(field, validate);
        };

        fieldsIsValid = wizardStep.validate();

        if (wizardStep.buttons) {
            wizardStep.buttons.forEach(button => this.renderButton(button));
        };

        for (let i = 0; i < index; i++) {
            !wizardSteps[i].classList.contains("active") && wizardSteps[i].classList.toggle("active");
            wizardSteps[i].nextElementSibling && wizardSteps[i].nextElementSibling.classList.contains("wizard_step-connect") && wizardSteps[i].nextElementSibling.classList.add("active");
        };

        wizardSteps.slice(index).forEach((node: any) => {
            node.classList.contains("active") && node.classList.remove("active");
            node.nextElementSibling && node.nextElementSibling.classList.contains("active") && node.nextElementSibling.classList.remove("active");
        });
        
        fieldsIsValid && this.enableNextButton();
        !fieldsIsValid && this.disableNextButton();
    };

    getStep(step: WizardStep): any {
        const newStep = this.wizardStepTemplate.content.cloneNode(true).querySelector(".wizard_step");
        newStep.querySelector(".wizard_step-label").textContent = step.label;
        return newStep;
    };

    disableNextButton() {
        !this.nextButton.classList.contains("inactive") && this.nextButton.classList.add("inactive");
    };

    enableNextButton() {
        this.nextButton.classList.contains("inactive") && this.nextButton.classList.remove("inactive");
    };

    handleLoader(node: any) {
        if (node.querySelector(".loader_spinner-container")) {
            node.querySelector(".loader_spinner-container").remove();
        } else {
            const loaderTemplate = document.querySelector(".loader_spinner-container-template").content.cloneNode(true).querySelector(".loader_spinner-container");
            node.append(loaderTemplate)
        };
    };

    async setHrData(): Promise<void> {
        const hr = candidateDataManager.createdBy
        const hrName = this.sidePanelInfoCard.querySelector(".user-name");
        const hrPosition = this.sidePanelInfoCard.querySelector(".user-position");
        const hrAvatar = this.sidePanelInfoCard.querySelector(".user-avatar");
        const hrPhone = this.sidePanelInfoCard.querySelector(".phone-info");
        const hrEmail = this.sidePanelInfoCard.querySelector(".email-info");

        const staff = await Context.fields.staff.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.ext_user.eq(hr)
        )).first();

        const userAvatarLink = hr.data.avatar ? await hr.data.avatar.getDownloadUrl() : "";
        hrName.textContent = hr.data.__name
        hrAvatar.src = userAvatarLink;

        if (staff && staff.data.position) {
            const positionName = await staff.data.position.fetch().then(position => position.data.__name);
            hrPosition.textContent = positionName;
        };

        if (hr.data.workPhone || hr.data.mobilePhone) {
            hrPhone.textContent = hr.data.workPhone && hr.data.workPhone.tel ? hr.data.workPhone.tel : hr.data.mobilePhone && hr.data.mobilePhone.tel ? hr.data.mobilePhone.tel : "";
        };

        if (hr.data.email) {
            hrEmail.textContent = hr.data.email;
        };
    };
};

class CandidateDataManager {
    user: UserItem;
    candidate: ApplicationItem<Application$kedo$candidate_database$Data, any>;
    relatedPosition: ApplicationItem<Application$kedo$position$Data, any>;
    organization: ApplicationItem<Application$kedo$organization$Data, any> | undefined;
    region: ApplicationItem<Application$kedo$directory_of_regions$Data, any> | undefined;
    medicalRequest: ApplicationItem<Application$kedo$medical_request$Data, any> | undefined;
    createdBy: UserItem;
    docsTable: docData[] = [];

    async setStatus(status: TStatus<StatusItem$kedo$candidate_database$__default, StatusGroups$kedo$candidate_database>): Promise<void> {
        await this.candidate.setStatus(status);
    };

    async saveCandidateData(fields: KedoFieldType[]) {
        //todo фильтрация по типу file и simple
        for (let field of fields) {
            const relatedNode = document.querySelector(`.common_field[data-app_code="${field.appFieldCode}"]`);
            console.log(`.common_field[data-app_code="${field.appFieldCode}"]`);
            let actualValue: any;
            let relatedInput: any;

            switch (field.typeCode) {
                case FieldTypeEnum.BOOLEAN:
                    const stringValue = document.querySelector(".common_radio-variant.checked").dataset["variant_code"];
                    actualValue = stringValue === "true" ?? false;
                    break;
                case FieldTypeEnum.CATEGORY:
                    relatedInput = relatedNode.querySelector("input"); 
                    const regionId = relatedInput.dataset["variant_code"].trim();
                    console.log(regionId);
                    actualValue = await this.candidate.fields.directory_of_regions.app.search().where(f => f.__id.eq(regionId)).first();
                    break;
                case FieldTypeEnum.DATE:
                    relatedInput = relatedNode.querySelector("input"); 
                    const [day, month, year]: number[] = [...relatedInput.value.split(".").map(Number)];
                    actualValue = new TDate(year, month, day);
                    break;
                case FieldTypeEnum.EMAIL:
                    relatedInput = relatedNode.querySelector("input"); 
                    actualValue = this.candidate.fields.email.create(relatedInput.value);
                    break;
                case FieldTypeEnum.PHONE:
                    relatedInput = relatedNode.querySelector("input");
                    actualValue = this.candidate.fields.phone.create(relatedInput.value);
                    break;
                case FieldTypeEnum.STRING:
                    relatedInput = relatedNode.querySelector("input");
                    actualValue = relatedInput.value;
                    break;
            };

            this.candidate.data[field.appFieldCode as keyof typeof this.candidate.data] = actualValue;
        }

        await this.candidate.save();
    };

    checkCandidateFields(portalFields: KedoFieldType[]): boolean {
        let stepFilled = true
        portalFields.filter(field => !!field.appFieldCode).map(field => field.appFieldCode).forEach(field => {
            //сравнение с undefined, потому что булевое поле в значении false считает за соответствие условию
            if (candidateDataManager.candidate.data[field as candidateDataKey] === undefined) {
                stepFilled = false;
            };
        });
        return stepFilled;
    }

    async getCandidateData(): Promise<void> {
        this.region = this.candidate.data.directory_of_regions ? await this.candidate.data.directory_of_regions.fetch() : undefined;
        this.relatedPosition = await this.candidate.data.planned_position!.fetch();
        this.organization = this.candidate.data.organization ? await this.candidate.data.organization.fetch() : undefined;
        this.medicalRequest = this.candidate.data.medical_request ? await this.candidate.data.medical_request.fetch() : undefined;
        this.docsTable = this.candidate.data.table_personal_documents ? await Promise.all(this.candidate.data.table_personal_documents.map(async row => {
            const doc = await row.document_type.fetch();
            const file = row.file_document ? await row.file_document.fetch() : undefined;

            return {
                docId: doc.id,
                docName: doc.data.__name,
                fileName: file && file.data.__name,
                required: doc.data.required ?? false,
                file
            }
        })) : [];

        this.docsTable.length > 0 && this.synchronizeDocStep();
        this.createdBy = await this.candidate.data.__createdBy.fetch();
    };

    synchronizeDocStep() {
        const wizardStep = formDataObj.find(form => form.index === "2")!.wizard!.steps.find(step => step.index === 3);
        const documentRecognition = systemDataManager.documentRecognition;
        let passportExists = false;
        let innExists = false;
        let snilsExists = false;
        let snilsRequired = false;
        let passportRequired = false;
        let innRequired = false;

        for (let doc of this.docsTable) {
            wizardStep!.fields!.push({
                label: doc.docName,
                required: doc.required,
                typeCode: FieldTypeEnum.FILE,
                docId: doc.docId
            });

            if (doc.docName.toLowerCase().includes("инн")) {
                innExists = true;
                innRequired = doc.required;
            }
            if (doc.docName.toLowerCase().includes("паспорт")) {
                passportExists = true;
                passportRequired = doc.required;
            }
            if (doc.docName.toLowerCase().includes("снилс")) {
                snilsExists = true;
                snilsRequired = doc.required;
            };
        };

        if (passportExists && !documentRecognition) {
            wizardStep!.fields! = wizardStep!.fields!.concat([
                {
                    label: "Серия",
                    required: passportRequired,
                    typeCode: FieldTypeEnum.STRING,
                    regex: "\\d{4}",
                    placeholder: "XXXX",
                    appFieldCode: "passport_series",
                    maxLength: 4
                },{
                    label: "Номер",
                    required: passportRequired,
                    typeCode: FieldTypeEnum.STRING,
                    regex: "\\d{6}",
                    placeholder: "XXXXXX",
                    appFieldCode: "passport_number",
                    maxLength: 6
                },{
                    label: "Дата выдачи",
                    required: passportRequired,
                    typeCode: FieldTypeEnum.DATE,
                    regex: "(0[1-9]|[12][0-9]|3[01])\\.(0[1-9]|1[012])\\.(19|20)\\d\\d",
                    placeholder: "ДД.ММ.ГГГГ",
                    appFieldCode: "date_of_issue",
                    maxLength: 10
                },{
                    label: "Кем выдан",
                    required: passportRequired,
                    typeCode: FieldTypeEnum.STRING,
                    appFieldCode: "issued_by"
                },{
                    label: "Код подразделения",
                    required: passportRequired,
                    typeCode: FieldTypeEnum.STRING,
                    appFieldCode: "passport_department_code",
                    regex: "\\d{3}\-\\d{3}",
                    maxLength: 7
                }
            ])
        };

        if (innExists && !documentRecognition) {
            wizardStep!.fields!.push({
                label: "ИНН",
                required: innRequired,
                typeCode: FieldTypeEnum.STRING,
                placeholder: "XXXXXXXXXXXX",
                regex: "\\d{12}",
                maxLength: 12
            });
        };

        if (snilsExists && !documentRecognition) {
            wizardStep!.fields!.push({
                label: "СНИЛС",
                required: snilsRequired,
                typeCode: FieldTypeEnum.STRING,
                placeholder: "XXX-XXX-XXX XX",
                regex: "\\d{3}-\\d{3}-\\d{3}\\s\\d{2}",
                maxLength: 14
            });

        }
    };
};

class SystemDataManager {
    regions: ApplicationItem<Application$kedo$directory_of_regions$Data, any>[];
    documentRecognition = false;

    async setRegions(): Promise<void> {
        this.regions = await Context.fields.staff.app.fields.directory_of_regions.app.search().where(f => f.__deletedAt.eq(null)).size(1000).all();
        this.synchronizeRegions();
    };

    async getRecognitionSettings(): Promise<void> {
        const recognitionSetting = await Context.fields.settings_app.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq("document_recognition")
        )).first();
        this.documentRecognition = recognitionSetting ? recognitionSetting.data.status ?? false : false;
    };

    synchronizeRegions() {
        const wizardStep = formDataObj.find(form => form.index === "2")!.wizard!.steps.find(step => step.index === 2);
        const regionField = wizardStep!.fields!.find(field => field.typeCode === FieldTypeEnum.CATEGORY);

        for (let region of this.regions) {
            (regionField!.variants! as CategoryVariants[]).push({name: region.data.__name, code: region.id});
        };
    };
};

const options = {
    actions: {
        clickDay(event: any, self: any) {
            domManager.setDate(event)
        }
    },
    settings: {
        lang: "ru-RU"
    }
};
const domManager = new DomManager();
const candidateDataManager = new CandidateDataManager();
const systemDataManager = new SystemDataManager();

function mock() {
    console.log("test button");
};

function commonRadioSelect(target: any) {
    target.parentElement.querySelectorAll(".common_radio-variant").forEach((variant: any) => {
        if (variant.classList.contains("checked")) {
            variant.classList.remove("checked");
        };
    });
    target.classList.add("checked");
}

function refreshForm(target: any) {
    const formIndex = target.dataset["index"].trim();
    domManager.frontIndex = formIndex;
    const currentForm = formDataObj.find(form => form.index === formIndex);
    if (currentForm) {
        domManager.renderForm(currentForm);
    }
};

function setChecked(target: any, cls?: string, id?: string) {
    target.classList.toggle("checked");

    cls && document.querySelector(`.${cls}`).classList.toggle("inactive");
    id && document.querySelector(`#${id}`).classList.toggle("inactive");
};

function closeContainer(target: any, cls: string, withModal = false, func?: Function) {
    target.closest(`.${cls}`).remove();
    withModal && document.querySelector(".kedo-modal").classList.toggle("kedo-hidden");
    func && func();
};

async function sendComment(): Promise<void> {
    // await candidateDataManager.setStatus(candidateDataManager.candidate.fields.__status.variants.)
};

async function onInit(): Promise<void> {
    const user = await System.users.getCurrentUser();
    const candidate = await Context.fields.candidate.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.candidate.eq(user)
    )).first();
    candidateDataManager.candidate = candidate!;

    await Promise.all([
        systemDataManager.getRecognitionSettings(),
        systemDataManager.setRegions(),
        candidateDataManager.getCandidateData()
    ]);

    if (!candidate) {
        const waitForTemplate = window.setInterval(() => {
            const emptyTemplate = document.querySelector(".unemployed");

            if (!emptyTemplate) {
                return;
            };

            window.clearInterval(waitForTemplate);
            emptyTemplate.classList.toggle("kedo-hidden");

        }, 200)
        return;
    };
};

function checkRootComponents(): boolean {
    domManager.formContainer = document.querySelector(".kedo_portal-main_section-container");
    domManager.kedoModal = document.querySelector(".kedo-modal");
    domManager.formPath = document.querySelector(".kedo_portal-main_section-path");
    domManager.formFooter = document.querySelector(".kedo_portal-main_section-container_footer");
    domManager.positionTemplate = document.querySelector(".position_info-container-template");
    domManager.wizardContainer = document.querySelector(".wizard_container");
    domManager.wizardStepTemplate = document.querySelector(".wizard_step-template");
    domManager.wizardStepConnect = document.querySelector(".wizard_step-connect-template");
    domManager.textFieldTemplate = document.querySelector(".common_field-template");
    domManager.simpleFieldTemplate = document.querySelector(".simple_field-template");
    domManager.mainInfoContainer = document.querySelector(".kedo_portal-main_section-container_main-info");
    domManager.sidePanelInfoCard = document.querySelector(".kedo_portal-main_section-side_panel-info_card");

    return [
        domManager.formContainer,
        domManager.kedoModal,
        domManager.formPath,
        domManager.formFooter,
        domManager.formFooter,
        domManager.wizardContainer,
        domManager.wizardStepTemplate,
        domManager.wizardStepConnect,
        domManager.textFieldTemplate,
        domManager.simpleFieldTemplate,
        domManager.mainInfoContainer,
        domManager.sidePanelInfoCard,
        VanillaCalendar
    ].every((node: any) => node);
}

async function onLoad(): Promise<void> {
    if (!candidateDataManager.candidate) {
        return;
    };

    const statusVariants = candidateDataManager.candidate.fields.__status.variants;
    let replaceObj: {replaceFrom: string, replaceTo: string};

    switch (candidateDataManager.candidate.data.__status!.code) {
        case statusVariants.invited.code:
            domManager.frontIndex = 1;
            replaceObj = {replaceFrom: "companyName", replaceTo: candidateDataManager.organization ? candidateDataManager.organization.data.__name : ""};
            break;
        case statusVariants.filling_out_questionnaire.code:
            domManager.frontIndex = 2;
            break;
        case statusVariants.questionnaire_completed.code:
        case statusVariants.secutiry_check.code:
        case statusVariants.security_agreed.code:
            domManager.frontIndex = 3;
            break;
        case statusVariants.passing_medical_examination.code:
            domManager.frontIndex = 4;
            break;
        case statusVariants.medical_examination_completed.code:
            domManager.frontIndex = 5;
            break;
        case statusVariants.signing_job_offer.code:
            domManager.frontIndex = 6;
            break;
        case statusVariants.job_offer_signed.code:
            domManager.frontIndex = 7;
            break;
        case statusVariants.clarifying_job_offer.code:
            domManager.frontIndex = 8;
            break;
    };

    domManager.formIndex = String(domManager.frontIndex);

    const currentForm = formDataObj.find(form => form.index === domManager.formIndex);
    const additionalInfoCard = document.querySelector(".kedo_portal-main_section-side_panel-additional_card");

    if (candidateDataManager.candidate.data.info_candidate) {
        additionalInfoCard.classList.contains("kedo-hidden") && additionalInfoCard.classList.remove("kedo-hidden");
        const cardDescription = additionalInfoCard.querySelector(".common-descriptor");
        cardDescription.innerHTML = candidateDataManager.candidate.data.info_candidate;
    };

    if (candidateDataManager.candidate.data.memo_for_candidate) {
        additionalInfoCard.classList.contains("kedo-hidden") && additionalInfoCard.classList.remove("kedo-hidden");
        const fileField = additionalInfoCard.querySelector(".common-file-field");
        fileField.classList.remove("kedo-hidden");
        const fileLink = additionalInfoCard.querySelector(".common-link");
        fileLink.href = await candidateDataManager.candidate.data.memo_for_candidate.getDownloadUrl();
    };

    if (!checkRootComponents()) {
        const waitForRoot = window.setInterval(async () => {
            if (!checkRootComponents()) {
                return;
            };
            window.clearInterval(waitForRoot);

            domManager.handleLoader(domManager.sidePanelInfoCard);
            domManager.setHrData().then(_ => {
                domManager.handleLoader(domManager.sidePanelInfoCard);
            });

            if (currentForm) {
                await domManager.renderForm(currentForm, replaceObj!);
            };
        }, 200)
    } else if (checkRootComponents() && currentForm) {
        domManager.handleLoader(domManager.sidePanelInfoCard);
        domManager.setHrData().then(_ => {
            domManager.handleLoader(domManager.sidePanelInfoCard);
        });
        await domManager.renderForm(currentForm, replaceObj!);
    };

    window.setInterval(() => {
        switch (candidateDataManager.candidate.data.__status!.code) {
            case statusVariants.invited.code:
                domManager.frontIndex = 1;
                replaceObj = {replaceFrom: "companyName", replaceTo: candidateDataManager.organization ? candidateDataManager.organization.data.__name : ""};
                break;
            case statusVariants.filling_out_questionnaire.code:
                domManager.frontIndex = 2;
                break;
            case statusVariants.questionnaire_completed.code:
            case statusVariants.secutiry_check.code:
            case statusVariants.security_agreed.code:
                domManager.frontIndex = 3;
                break;
            case statusVariants.passing_medical_examination.code:
                domManager.frontIndex = 4;
                break;
            case statusVariants.medical_examination_completed.code:
                domManager.frontIndex = 5;
                break;
            case statusVariants.signing_job_offer.code:
                domManager.frontIndex = 6;
                break;
            case statusVariants.job_offer_signed.code:
                domManager.frontIndex = 7;
                break;
            case statusVariants.clarifying_job_offer.code:
                domManager.frontIndex = 8;
                break;
        };
        const currentForm = formDataObj.find(form => form.index === domManager.formIndex);
        domManager.refreshForm(currentForm!.index)
    }, 60000)
};