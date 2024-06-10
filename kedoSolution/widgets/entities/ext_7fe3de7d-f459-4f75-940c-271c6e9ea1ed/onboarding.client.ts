// renderPage - метод вызывается из Виджета Код, его виджет стоит самым последним на странцие. Использует:
// - findUserAppByExternalUser для поиска текущего юзера и его карточки Сотрудники. Обрабатывает внутренних и внешних пользователей.
// - асинхронно вызывает getLogo и renderQuestion, чтобы не блокировать портал.
// - renderFormWrapper - для отрисовки содержимово, в зависимости от текущего статуса сотрудника.
// - getUserContext - для получения контекста сотрудника в контекст портала(т.к.перерисовка странцы вызывает обнуление значений выведенных UI контекста портала, метод используется после каждой перерисовки, несколько раз).
// - обработчик разлогинивания.
// - обработчик показа политики конфиденциальности.
// - текст для футера берется из переменной textFooterPortal, которая задается в Виджете Код.

// checkUserStatus - используется для проверки статуса карточки Сотрудники и записи его в Context.data.users_status.
// reloadOnFirstLoad - метод использовался для перезагрузки портала, при возникновении ошибок, блокирующих его работу при первом входе. сейчас просто выводит информационные заглушки.
// addBgColorFooterAndMainRowGrey и removeBgColorFooterAndMainRowGrey - используются для изменения фона странцы портала для разных типовrender странцы (основные странцы - голубые, заглушки между шагами - серые).

//last stable anchor

declare const console: any;
declare const FileReader: any;
declare const window: any;
declare const document: any;
declare const initStep1: any;
declare const initStep2: any;
declare const renderButtonPopup: any;
declare const initStep1Error: any;
declare const togglePopup: any;
declare const sessionStorage: any;
declare const firstStepForms: any;
declare const secondStepForms: any;
declare const checkmarkSVG: any;
declare const enableNextButton: any;
const host = window.location.host;

class CustomFilter {
    constructor(private filter: any) {
    };
    json() {
        return this.filter;
    };
};

interface ValidationField {
    fieldName: string;
    fieldType?: 'email' | 'phone' | 'plain' | 'table';
    regExp?: RegExp; 
    notRequired?: boolean;
}

interface ValidationHelper {
    id: string;
    fields: ValidationField[];
}

interface StepError {
    stage: number;
    errorMessage: string;
}

enum _SignTypes {
    attributes = 'attributes',
    file = 'file'
}

// =======================================================
// функции для логирования длительности выполнения методов

// let lastFuncTime:number = 0;
// let logArr: any[] = []

// function addLogToArr(text:string){
//     const timeNow = (new Date()).getTime()
//     const funcTime = (timeNow - lastFuncTime)/1000
//     const commonTime = (timeNow - Context.data.vremya_nachala_test!)/1000
//     // console.log(`${text} - ${date.getSeconds()}с ${date.getMilliseconds()}мс (${date.getTime()})`)
//     logArr.push(`   ${text} - функция длилась ${funcTime}c, с момента запуска портала ${commonTime}c`)
// }

// let zeroTime:number;
// function setTimeToZero(){
//     zeroTime = (new Date).getTime();
//     Context.data.test_data_server = ''
// }
// function writeProcessDuration(text:string){
//     const timeNow = (new Date()).getTime()

//     const funcTime = (timeNow - zeroTime)/1000
    
//     console.log(`${text} - функция выполнялась ${funcTime}c /n`)
// }
// ====================================

// GLOBAL VARS============================================================================================
const stateSteps = {
  invited: 'INVITED',
  step1: 'STEP1',
  step1_wait: 'STEP1_WAIT',
  step2: 'STEP2',
  step2_wait: 'STEP2_WAIT',
  step2_wait_sign_work: "STEP2_SIGNING_WORK",
  step2_unep: 'STEP2_UNEP',
  step2_unep_choice: "STEP2_UNEP_CHOICE",
  step2_unep_wait: "STEP2_UNEP_WAIT",
  step2_lna: "STEP2_LNA",
  step2_signed_lna: "STEP2_SIGNED_LNA",
  step2_waiting_for_documents: "STEP2_WAITING_FOR_DOCUMENTS",
  step3: 'STEP3',
  main_page: 'MAIN_PAGE',
  edit_png: 'EDIT_PNG',
  wait_edit: 'WAIT_EDIT',
  rejected: 'REJECTED',
}

const documentSteps = ["Подписание заявления", "Ознакомление с ЛНА", "Подписание документов трудоустройства"]

// let userAppID: string = '';
let userIDProfile: string|FieldOperand<string>|ContextOperand|null;
let userApp: ApplicationItem<Application$kedo$staff$Data,any>|undefined;

let mainColumnContainer: any;
let leftColumnContainer: any;
let kedoOnCheckSuccesTemp: any;
let loaderEl: any;
let footerElArr: any;
let kedoContentRowEl: any;
let askBtn: any;

let userFilesIdArr: string[] = [];

let kedoMainWindowTemp: any;
let questionElTemp: any;
let kedoOnCheckTemp: any;  
let kedoUnepTemplate: any;
let kedoErrorTemp: any;  
let adjustStep = 0;
let innerUser: UserItem|undefined = undefined;

let kedoDocsArr: ApplicationItem<Application$kedo$documents_for_employment$Data,Application$kedo$documents_for_employment$Params>[] = [];

//================================================VALIDATION OBJECT ====================================================

const stepByStepValidation: ValidationHelper[] = [
    {
        id: 'step-1-0',
        fields: [
            {
                fieldName: 'surname',
            }, 
            {
                fieldName: 'name',
            },
            {
                fieldName: 'patronymic',
                notRequired: true,
            }, 
            {
                fieldName: 'date_of_birth',
            },
            {
                fieldName: 'gender',
            }, 
            {
                fieldName: 'marriage',
            },
            {
                fieldName: 'email_work',
                fieldType: 'email'
            }, 
            {
                fieldName: 'phone_number_work',
                fieldType: 'phone'
            }
        ]
    },
    {
        id: 'step-1-1',
        fields: [
            {
                fieldName: 'region_app',
                notRequired: true
            },
            {
                fieldName: 'city',
            }, 
            {
                fieldName: 'street',
            },
            {
                fieldName: 'house',
            }, 
            {
                fieldName: 'housing',
                notRequired: true,
            },
            {
                fieldName: 'flat',
                notRequired: true,
            }
        ]
    },
    {
        id: 'step-1-2',
        fields: [
            {
                fieldName: 'passport_series',
                regExp: new RegExp("^([0-9A-Za-z]{4})?$"),
                notRequired: true
            },
            {
                fieldName: 'passport_number',
                regExp: new RegExp("^([0-9A-Za-z]{6})?$"),
            }, 
            {
                fieldName: 'date_of_issue',
            },
            {
                fieldName: 'issuer',
            }, 
            {
                fieldName: 'issuer_code',
                regExp: new RegExp("^([0-9]{3}[-]{1}[0-9]{3})?$"),
            },
            {
                fieldName: 'inn',
                regExp: new RegExp("^(([0-9]{12}))?$"),
            },
            {
                fieldName: 'snils',
                regExp: new RegExp("^([0-9]{3}[-]{1}[0-9]{3}[-]{1}[0-9]{3}.[0-9]{2})?$"),
            },
        ]
    },
    {
        id: 'step-1-3',
        fields: [
            {
                fieldName: 'doc_table',
                fieldType: "table"
            }, 
            // {
            //     fieldName: 'passport_registration',
            // },
            // {
            //     fieldName: 'snils_photo',
            // },
            // {
            //     fieldName: 'inn_photo',
            // },
        ]
    },
    {
        id: 'step-1-4',
        fields: [
            {
                fieldName: 'passport_face_photo',
            },
        ]
    },
    {
        id: 'step-2-0',
        fields: []
    },
    {
        id: 'step-2-1',
        fields: [
            {
                fieldName: 'signed_agreement_scan',
            },
        ]
    },
]

// текст подставляется в "заглушки"
const onCheckCommonMessages = {
    title: 'Данные были отправлены на проверку',
    text: 'Дождитесь положительного результата. Оповещение придёт вам на почту или по СМС. Система автоматически переведет вас на следующий шаг.'
}
const onCheckFormingSoevMessages = {
    title: 'Формируем соглашение об электронном взаимодействии',
    text: 'На основании ваших данных будет подготовленно соглашение. Оно необходимо для выпуска усиленной неквалифицированной электронной подписи для вас и дальнейшего обмена документами в электронном виде. По готовности вы получите уведомление.'
}

const onCheckWorkApp = {
    title: 'Формирование ЛНА',
    text: 'В данный момент для вас формируются локально-нормативные акты для ознакомления. Оповещение придёт вам на почту или по СМС. Система автоматически переведет вас на следующий шаг.'
}

const onCheckUnep = {
    title: 'Формируем запрос на выпуск электронной подписи',
    text: 'В данный момент для вас формируется электронная подпись, по окончанию формирования система автоматически переведёт вас на следующий шаг.'
}

const onCheckUnepMessages = {
    title: 'Подтвердите выпуск электронной подписи на портале госуслуг',
    text: 'Заявка на выпуск электронной подписи направлена в Удостоверяющий центр, подтвердите выпуск в вашем личном кабинете на портале госуслуг.'
}

const onCheckUnepReject = {
    title: 'Ваш отказ был отправлен кадровому сотруднику',
    text: 'Вы отказались от заявки на выпуск электронной подписи, ожидайте действий кадрового сотрудника в зависимости от причины.'
}

const onCheckUnepKontur = {
    title: 'Подтвердить выпуск электронной подписи',
    text: "Проверьте ваши данные и подтвердите согласие на выпуск электронной подписи."
}
const onCheckUnepWait = {
    title: 'Выпуск электронной подписи подтвержден',
    text: 'Сейчас для Вас выпускается электронная подпись. Дождитесь положительного результата. Оповещение придёт вам на почту или по СМС. Система автоматически перенаправит вас на следующий шаг.'
}

const onCheckLnaMessage = {
    title: 'Документ ЛНА успешно подписан.',
    text: 'На данном этапе для вас формируется пакет документов для трудоустройства, по окончанию формирования система автоматически переведёт вас на следующий шаг.'
}

const onWaitDocumentsGeneration = {
    title: "Формируется пакет документов для трудоустройства",
    text: "На данном этапе для вас формируется пакет документов для трудоустройства, по окончанию формирования система автоматически переведёт вас на следующий шаг."
}

const onRejectGoskey = {
    title: "Информация передана кадровому сотруднику",
    text: "Ваш комментарий для уточнения списка документов направлен кадровому сотруднику, ожидайте обратной связи"
}

const secretConfirmSuccess = {
    title: "Данные были отправлены на проверку",
    text: "Дождитесь положительного результата. Оповещение придёт вам на почту или по СМС. Система автоматически переведёт вас на следующий шаг."
}

function editOnCheckFormingSoevMessages(firmText:string){
    onCheckFormingSoevMessages.text = `На основании ваших данных будет подготовленно соглашение. Оно необходимо для выпуска усиленной неквалифицированной электронной подписи для вас и дальнейшего обмена документами с ${firmText} в электронном виде. По готовности вы получите уведомление.`
}

const onKedoSuccesMessages = {
    title: 'Поздравляем, вы успешно прошли трудоустройство!',
    text: 'Сейчас вы автоматически попадёте на портал компании и сможете пользоваться всеми его функциями.'
}

function editOnKedoSuccesMessages(firmText:string){
    onKedoSuccesMessages.text = `Сейчас вы автоматически попадёте на портал компании ${firmText} и сможете пользоваться всеми его функциями.`
}

// лого ищется в параметрах, если его нет, то береться из контейнера .logo-template
async function getLogo(){
    try{
        await Server.rpc.getLogoFromParams();
    }
    catch(err){
        console.error(`Server.rpc.getLogoFromParams error ${err}`)
    }
    
    const logoWrapper = document.querySelector('.kedo__header-logo-wrapper');

    if(Context.data.logo_from_params){
        logoWrapper.insertAdjacentHTML('afterbegin', Context.data.logo_from_params);

        const logoSvg = logoWrapper.firstChild;
        if(logoSvg){
            logoSvg.classList.add('logo');
        }
    } else {
        const logo = document.querySelector('.logo-template').content.cloneNode(true);        
        const svgTag = logo.querySelector('svg');

        if(svgTag){
            svgTag.classList.add('logo');
        }
        
        logoWrapper.append(logo)
    }

    logoWrapper.classList.remove('kedo__header-logo-wrapper_hidden');
    await getUserContext();
}

async function checkUserStatus(){
    // обновляем экземпляр процесса приложения пользователя
    if(!Context.data.user_application) return;

    let statusName: string = '';

    try{
        userApp = await Context.data.user_application.fetch();
    }
    catch(err){
        throw new Error(`Context.data.user_application.fetch error ${err}`);
    }
    
    if(!userApp){
        return;
    }
    if(!userApp.fields.__status){
        return;
    }
    if(!userApp.fields.__status.variants){
        return;
    }

    statusName = userApp.data.__status!.name

    if(!statusName) return;

    // присвоение статуса юзера в зависимости от статуса бизнес процесса
    switch(statusName){
        case userApp.fields.__status.variants.invited.name:
        case userApp.fields.__status.variants.new.name:
            Context.data.users_status = stateSteps.invited;
            break;
        case userApp.fields.__status.variants.filling_pnd.name:
            Context.data.users_status = stateSteps.step1;
            break;
        case userApp.fields.__status.variants.input_data.name:
            Context.data.users_status = stateSteps.step1_wait;
            break;
        case userApp.fields.__status.variants.editing_pnd.name:
            Context.data.users_status = stateSteps.edit_png;
            break;
        case userApp.fields.__status.variants.acquaintance_with_the_agreement.name:
            Context.data.users_status = stateSteps.step2;
            break;
        case userApp.fields.__status.variants.signing_app.name:
            Context.data.users_status = stateSteps.step2_wait_sign_work;
            break;
        case userApp.fields.__status.variants.conclude_an_agreement.name:
            Context.data.users_status = stateSteps.step2_wait;
            break;
        case userApp.fields.__status.variants.sign_type_choice.name:
            Context.data.users_status = stateSteps.step2_unep_choice;
            break;
        case userApp.fields.__status.variants.UNEP_release_confirmation.name:
            Context.data.users_status = stateSteps.step2_unep;
            break;
        case userApp.fields.__status.variants.waiting_NEP.name:
            Context.data.users_status = stateSteps.step2_unep_wait;
            break;
        case userApp.fields.__status.variants.introduction_lna.name:
            Context.data.users_status = stateSteps.step2_lna;
            break;
        case userApp.fields.__status.variants.signing_lna.name:
            Context.data.users_status = stateSteps.step2_signed_lna;
            break;
        case userApp.fields.__status.variants.docs_generation_wait.name:
            Context.data.users_status = stateSteps.step2_waiting_for_documents;
            break;
        case userApp.fields.__status.variants.signing_documents.name:
            Context.data.users_status = stateSteps.step3;
            break;
        case userApp.fields.__status.variants.signed_documents.name:
            Context.data.users_status = stateSteps.main_page;
            break;

        case userApp.fields.__status.variants.rejected.name:
            Context.data.users_status = stateSteps.rejected;
            break;
        case userApp.fields.__status.variants.waiting_for_document_editing.name:
            Context.data.users_status = stateSteps.wait_edit;
            break;
    }
}

function reloadOnFirstLoad(){
    const reloadCountText = sessionStorage.getItem('reloadCount');
    let reloadCountNum: number = 0;

    if(reloadCountText){
        reloadCountNum = Number(reloadCountText);
    }
    //TODO: проверить, нужна ли эта функция
    // if(reloadCountNum){
    //     if(reloadCountNum < 5){
    //         sessionStorage['reloadCount'] = reloadCountNum + 1;
    //         // window.location.reload();
    //         showError("Произошла ошибка доступа к приложению. Пожалуйста, обратитесь к сотруднику отдела кадров.");
    //     } else {
    //         showError("Произошла ошибка доступа к приложению. Пожалуйста, обратитесь к сотруднику отдела кадров.");
    //         throw new Error(`reloadOnFirstLoad error`);
    //     }
    // } else {
    //     sessionStorage.setItem('reloadCount', 1);
    //     // window.location.reload();
    //     showError("Произошла ошибка доступа к приложению. Пожалуйста, обратитесь к сотруднику отдела кадров.");
    // }
}

function addRegexLogix() {
    let form = document.querySelector(".kedo-form__form");
    let snils = form.querySelector("input#snils");
    let dateOfBirth = form.querySelector("input#date_of_birth");
    let dateOfIssue: any;
    let issuerCode: any;
    const now = new TDate();

    if (!snils) {
        if (!dateOfBirth) {
            return;
        };
    };

    if (!dateOfBirth) {
        issuerCode = form.querySelector("input#issuer_code");
        // dateOfIssue = form.querySelector("input#date_of_issue");
        // let dateOfIssueContainer = dateOfIssue.closest("app-dynamic-form-row");
        // dateOfIssue.addEventListener("blur", (event: any) => {
        //     window.setTimeout(() => {
        //         if (!Context.data.date_of_issue) {
        //             return;
        //         };
        //         let dateArray: string[] = [];

        //         if (event.taeget.value.includes("/")) {
        //             dateArray = event.target.value.split("/");
        //         } else {
        //             dateArray = event.target.value.split(".");
        //         };

        //         let [day, month, year] = [+dateArray[0], +dateArray[1], +dateArray[2]];
        //         let now = new TDate();
        //         let newDate = new TDate(year, month, day);
                
        //         if (newDate.after(now)) {
        //             let errorExists = document.querySelector(".date-of-issue-error");
        //             if (!!errorExists) {
        //                 errorExists.remove();
        //             };
        //             let error = document.createElement("div");
        //             error.style.color = "red";
        //             error.className = "date-of-issue-error";
        //             error.innerText = "Дата выдачи паспорта не может быть позже или равна сегодняшней дате."
        //             event.target.classList.add("is-invalid");
        //             dateOfIssueContainer.appendChild(error);
        //         } else {
        //             let errorExists = document.querySelector(".date-of-issue-error");
        //             if (errorExists) {
        //                 errorExists.remove();
        //                 event.target.classList.remove("is-invalid");
        //             };
        //         };

        //     }, 200)
        // });
        Context.fields.date_of_issue.data.setFilter(f => f.lt(now))
        
        issuerCode.addEventListener("keydown", (event: any) => {
            let key = event.keyCode || event.charCode;
            let issuerCodeLength = issuerCode.value.length;

            if (key == 8 || key == 46 || key == 189) {
                return;
            };
            if (issuerCodeLength < 3) {
                return;
            };
            if (issuerCodeLength == 3) {
                issuerCode.value += "-";
            };
        });

        snils.addEventListener("keydown", (event: any) => {
            let key = event.keyCode || event.charCode;
            let snilsLength = snils.value.length;

            if (key == 8 || key == 46) {
                return;
            };
            if (snilsLength < 3) {
                return;
            };
            if (snilsLength == 3) {
                snils.value += "-"
            } else if (snilsLength == 7) {
                snils.value += "-"
            } else if (snilsLength == 11) {
                snils.value += " ";
            }
        });
    } else {
        // let dateOfBirthContainer = dateOfBirth.closest("app-dynamic-form-row");
        // dateOfBirth.addEventListener("blur", (event: any) => {
        //     window.setTimeout(() => {
        //         if (!Context.data.date_of_birth) {
        //             return
        //         };
        //         let dateArray: string[] = [];

        //         if (event.taeget.value.includes("/")) {
        //             dateArray = event.target.value.split("/");
        //         } else {
        //             dateArray = event.target.value.split(".");
        //         };
                
        //         let [day, month, year] = [+dateArray[0], +dateArray[1], +dateArray[2]];
        //         let now = new TDate();
        //         let newDate = new TDate(year, month, day);
                
        //         if (newDate.after(now)) {
        //             let errorExists = document.querySelector(".date-of-birth-error");
        //             if (!!errorExists) {
        //                 errorExists.remove();
        //             };
        //             let error = document.createElement("div");
        //             error.style.color = "red";
        //             error.className = "date-of-birth-error";
        //             error.innerText = "Дата рождения не может быть позже или равна сегодняшней дате."
        //             event.target.classList.add("is-invalid");
        //             dateOfBirthContainer.appendChild(error);
        //         } else {
        //             let errorExists = document.querySelector(".date-of-birth-error");
        //             if (errorExists) {
        //                 errorExists.remove();
        //                 event.target.classList.remove("is-invalid");
        //             };
        //         };

        //     }, 200)
        // });
        Context.fields.date_of_birth.data.setFilter(f => f.lt(now));
    };
};

function logError(){
    if(Context.data.error){
        console.error(Context.data.error)
    }

    Context.data.error = '';
}

// INIT AFTER RENDER HTML FROM WIDGET =======================================================================================
async function renderPage(): Promise<void>{
    console.log("soft update test")
    
    if(Context.data.id_applications_employees) return;
    if(Context.data.user_id) return;
    const appEmployment = await Context.fields.settings.app.search().where(f => f.code.eq("app_employment")).first();
    if (!!appEmployment) {
        let employmentEnabled = appEmployment.data.status;
        if (!employmentEnabled) {
            adjustStep--;
            documentSteps.shift();
        };
    };
    Context.data.vremya_nachala_test = (new Date).getTime();
    // lastFuncTime = Context.data.vremya_nachala_test
    // logArr.push('старт')

    function handleAskQuestionBtnClick() {
        questionWindow.classList.add('kedo__question-card_active')
    }

    async function renderQuestion() {
        if(document.querySelector('#kedo__question-card')) return;

        const questionEl = questionElTemp.content.cloneNode(true);
        const questionCard = questionEl.querySelector('.kedo__question-card');

        questionCard.id = 'kedo__question-card';
        leftColumnContainer.append(questionEl);
        
        let quesionData: any = {};

        const alternativeInfo = await Context.fields.settings.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq("alternate_contacts_info")
        )).first();
        const alternativeInfoStatus = alternativeInfo?.data.status || undefined;
        if (alternativeInfoStatus) {
            await findUserAppByExternalUser()
            const organization = await userApp!.data.organization!.fetch();
            const customHtml = organization.data.custom_html_card;
            const infoCard = document.querySelector("#kedo__question-card");
            infoCard.innerHTML = customHtml;
        } else {
            try {
                await Server.rpc.getHRData();
            }
            catch(err){
                console.error += `Server.rpc.getHRData error ${err}`;
                return;
            }


            if(Context.data.hr_employee_data){
                quesionData = Context.data.hr_employee_data;
            }

            if(quesionData){
                const img = document.querySelector('.kedo__question-employee_img');
                const name = document.querySelector('.kedo__question-employee-name');
                const position = document.querySelector('.kedo__question-employee-position');
                const phone = document.querySelector('.kedo__question-tel');
                const mail = document.querySelector('.kedo__question-mail');

                if(quesionData.avatarLink){
                    img.style = `background: url('${quesionData.avatarLink}') top/cover no-repeat;`;
                    // img.style = `background: url(data:image/png;base64,${quesionData.avatar}) no-repeat center / contain;`;
                } else {
                    img.style = "display: none"
                }
                if(quesionData.mail){
                    mail.textContent = quesionData.mail;
                    mail.href = `mailto:${quesionData.mail}`;
                } else {
                    mail.style = "display: none"
                }
                if(quesionData.name){
                    name.textContent = quesionData.name;
                } else {
                    name.style = "display: none"
                }
                if(quesionData.phone){
                    phone.textContent = quesionData.phone;
                } else {
                    phone.style = "display: none"
                }
                if(quesionData.position){
                    position.textContent = quesionData.position;
                } else {
                    position.style = "display: none"
                }
            };

            askBtn = document.querySelector('.kedo__question-btn-ask');
        };


        questionWindow = document.querySelector('.kedo__question-card');

        questionCard.classList.remove('kedo__question-card_hidden');
        // после изменения в ДОМ, значения в инпутах пропадают
        await getUserContext();
        
        const staff = await Context.data.user_application!.fetch();
        if (staff!.data.__status!.code === staff!.fields.__status.variants.UNEP_release_confirmation.code || staff!.data.__status!.code === staff!.fields.__status.variants.sign_type_choice.code || staff!.data.__status!.code === staff!.fields.__status.variants.signing_documents.code) {
            const goskeyInfoCard = document.createElement("div");
            const goskeyInfoContainer = document.createElement("div");
            const goskeyTitle = document.createElement("h3");
            const goskeyDescription = document.createElement("p");
            const rightColumn = document.querySelector(".kedo__content-column_right");
            const fileTemplate = document.querySelector(".file_line-template").content.cloneNode(true).querySelector(".file_line-file");;
            const fileLink = fileTemplate.querySelector(".common-link");

            await Server.rpc.getGoskeyFile();

            fileLink.href = Context.data.goskey_file_link;
            fileLink.textContent = "Информация о приложении Госключ";

            goskeyInfoCard.className = "kedo__question-card";
            goskeyInfoCard.style.height = "auto";
            goskeyInfoContainer.className = "kedo__question-card-main-info";
            goskeyTitle.textContent = "Полезная информация";
            goskeyDescription.textContent = "Как пользоваться приложением Госключ";

            goskeyInfoContainer.append(goskeyTitle, goskeyDescription, fileTemplate);
            goskeyInfoCard.append(goskeyInfoContainer);
            
            rightColumn.append(goskeyInfoCard);
        };

        // askBtn.addEventListener('click', handleAskQuestionBtnClick);
    }

    let questionWindow: any;

    mainColumnContainer = document.querySelector('.kedo__content-column_main');
    leftColumnContainer = document.querySelector('.kedo__content-column_right');
    loaderEl = document.querySelector('.kedo-loader-wrapper');

    kedoMainWindowTemp = document.querySelector('.kedo__window-wrapper-template');
    questionElTemp = document.querySelector('.kedo__question-card-template');
    kedoOnCheckTemp = document.querySelector('.kedo__on-check-template');
    kedoUnepTemplate = document.querySelector(".kedo__unep-template");

    // logArr.push('вход в findUserAppByExternalUserClient')
    try{
        // await Server.rpc.findUserAppByExternalUser();
        await findUserAppByExternalUser();
    }
    catch(err){
        showError('Ошибка при поиске карточки пользователя.');
        console.error(err);
        return;
    }
    // logArr.push('выход из findUserAppByExternalUserClient')


    if(!Context.data.user_application){
        // window.location.reload();
        showError("Приложение пользователя не найдено.");
        return;
    }    

    getLogo();
    renderQuestion()

    // logArr.push('вход в renderFormWrapper')
    // lastFuncTime = (new Date).getTime()
    // try{
        try {
            await renderFormWrapper();
        } catch (err) {
            showError(err.message);
        }
    // }
    // catch(err){
    //     throw new Error(err)
    //     console.error(err)
    // }
    
    // addLogToArr('renderFormWrapper')
    // logArr.push('выход из renderFormWrapper')

    await getUserContext();
    logError();

    hideLoader();

    // обработчик разлогирования btn exit =========================================
    const btnExit = document.querySelector('.kedo__header-btn-exit');

    async function handleBtnExitClick(){
        let currentExternalUser: CurrentUserItem|undefined = undefined;

        try{
            currentExternalUser = await System.users.getCurrentUser();
        }
        catch(err){
            throw new Error(`System.users.getCurrentUser() error ${err}`);
        }
        
        if(currentExternalUser){
            currentExternalUser.logout();
        }
    }
    btnExit.addEventListener('click', handleBtnExitClick);

    // обработчки показа политики конфиденциальности ==============================
    try{
        await Server.rpc.getPrivacyPolicyAndApprovalId();
    }
    catch(err){
        Context.data.error = `Server.rpc.getPrivacyPolicyAndApprovalId error ${err}`
    }
    logError();

    if(Context.data.id_privacy_policy && !userApp!.data.accepted_agreement && userApp!.data.consent_processing_pdn){
        await showPrivacyPolicy();
    }
    await getUserContext();
    // console.log(logArr)
}


async function renderCustomTable(): Promise<void> {
    function handleButtons(block: boolean, row: any) {
        let spinner: any;
        if (block) {
            const spinnerTemplate = document.querySelector(".my-spinner").content.cloneNode(true);
            spinner = spinnerTemplate.querySelector(".spinner-svg");
            row.append(spinner);
        } else {
            spinner = row.querySelector(".spinner-svg");
            spinner.remove();
        };
    };
    let contextTable = Context.data.doc_table;
    if (contextTable && contextTable.length > 0) {
        const kedoTable = document.querySelector(".kedo-table");
        const docs = await Promise.all(contextTable!.map(row => row.doc.fetch()));
        
        for (let i in docs) {
            const doc = docs[i]
            const requiredRow = contextTable![i].required;
            const rowTemplate = document.querySelector(".custom-table-row").content.cloneNode(true);
            const tableRow = rowTemplate.querySelector("tr");
            const docNameElement = tableRow.querySelector(".doc-name");
            const fileInput = tableRow.querySelector("input");
            const fileLabel = tableRow.querySelector("label");
            const fileCell = tableRow.querySelector(".doc-file");
            fileInput.id = `file-${i}`;
            fileLabel.htmlFor = `file-${i}`;
            docNameElement.textContent = doc.data.__name;
            if (contextTable![i].file_doc) {
                const rowFileName = await contextTable![i].file_doc.fetch().then(f => f.data.__name);
                fileLabel.textContent = rowFileName;
                fileInput.disabled = true;
                const trashIcon = document.querySelector(".trash-icon-template").content.cloneNode(true);
                const iconContainer = trashIcon.querySelector(".trash-icon-container");
                iconContainer.addEventListener("click", (e: any) => {
                    fileLabel.textContent = "+Файл";
                    fileInput.value = "";
                    fileInput.disabled = false;
                    iconContainer.remove();
                    contextTable = Context.data.doc_table!;
                    const tableRow = contextTable![i]
                    if (tableRow) {
                        //@ts-ignore
                        tableRow.file_doc = undefined;
                        Context.data.doc_table = contextTable;
                        validateTable();
                    };
                });
                fileCell.append(trashIcon);
            };
            fileInput.addEventListener("change", (e: any) => {
                const fileSize = e.target.files[0].size;
                if (fileSize / 1000000 > 10) {
                    fileInput.value = "";
                    const warningTemplate = document.querySelector(".size-warning-template").content.cloneNode(true);
                    const warningText = warningTemplate.querySelector(".big-file-warning");
                    tableRow.append(warningText);
                    window.setTimeout(() => {
                        warningText.remove()
                    }, 1500);
                    return;
                };
                
                const fileName = e.target.value.split(`\\`).slice(-1)[0];
                const trashIcon = document.querySelector(".trash-icon-template").content.cloneNode(true);
                const iconContainer = trashIcon.querySelector(".trash-icon-container");
                iconContainer.addEventListener("click", (e: any) => {
                    fileLabel.textContent = "+Файл";
                    fileInput.value = "";
                    fileInput.disabled = false;
                    iconContainer.remove();
                    contextTable = Context.data.doc_table;
                    const contextTableRow = contextTable![i]
                    
                    if (tableRow) {
                        //@ts-ignore
                        contextTableRow.file_doc = undefined;
                        Context.data.doc_table = contextTable;
                        validateTable();
                    };
                });
                fileInput.disabled = true;
                fileLabel.textContent = fileName;
                fileCell.append(trashIcon);
                const reader = new FileReader();
                reader.addEventListener('load', async (e: any) => {
                    handleButtons(true, tableRow);
                    let checkIfFileLoading = window.setInterval(async () => {
                        if (Context.data.function_pending) {
                            console.log("file loading");
                            return;
                        };
                        Context.data.table_file_buffer = e.target.result.split(";").splice(-1)[0].replace("base64,", "");
                        Context.data.doc_name_and_index = `${fileName};${i}`;
                        Context.data.function_pending = true;
                        window.clearInterval(checkIfFileLoading)
                        await Server.rpc.createFileForTable();
                        Context.data.function_pending = false
                        validateTable();
                        handleButtons(false, tableRow)
                    }, 500)
                });
                reader.readAsDataURL(e.target.files[0]);
            });

            if (requiredRow) {
                tableRow.classList.add("required");
            }
            kedoTable.append(rowTemplate);
        };
        validateTable();
    } else {
        let waitForDom = window.setInterval(() => {
            const infoContainer = document.querySelector(".kedo-form__fields .info-container");
            const nextButton = document.querySelector(".kedo-form__next-btn");
            if (!infoContainer || !nextButton) {
                console.log("dom loading")
                return;
            };
            window.clearInterval(waitForDom);
            infoContainer.innerHTML = "<p>Для вас на этапе приглашения не выбраны виды личных документов, сканы которых необходимо приложить. Нажмите 'Отправить на проверку'</p>"
            nextButton.disabled = false;
            Context.data.table_valid = true;
        }, 200);
    };
};

// RENDER WRAPPER OF STEPS ==================================================================================================
async function renderFormWrapper(){
    showLoader();
    
    let stepsElementsArray: string|any[];

    let btnSubmitSoevComment: any;
    let textAreaSoevComment: any;

    footerElArr = document.querySelectorAll('.footer');
    kedoContentRowEl = document.querySelector('.kedo__content-row');    

    function renderKedoFormWrapper() {
        const kedoMainWindow = kedoMainWindowTemp.content.cloneNode(true);
        mainColumnContainer.textContent = '';
        mainColumnContainer.append(kedoMainWindow);
        stepsElementsArray = document.querySelectorAll('.kedo__window-header-item');
    }

    function clearStylesOfStepsEl() {
        if(stepsElementsArray){
            for (let i = 0; i < stepsElementsArray.length; i++) {
                stepsElementsArray[i].classList.remove('kedo__window-header-item_active')
                stepsElementsArray[i].classList.remove('kedo__window-header-item--done')
            }
        } else {
            console.error(`stepsElementsArray not found`);
        }
    }
    
    async function reRenderPageAfterChangeStatus(currentStatus: string|undefined){
        let intervalID: any;

        intervalID = window.setInterval(async ()=> {
            await checkUserStatus();
            await Server.rpc.getUnepTask();

            if(Context.data.users_status !== currentStatus || Context.data.sign_task_id){
                await renderFormWrapper();
                hideLoader();

                window.clearInterval(intervalID)
            }
        }, 60000);
    };

    
    async function renderKedoOnCheck(messageObj: { title: string; text: string; }|undefined, stepActive: number|null) {
        mainColumnContainer.textContent = '';
        const kedoOnCheck = kedoOnCheckTemp.content.cloneNode(true);
        const title = kedoOnCheck.querySelector('.kedo__on-check-title');
        const text = kedoOnCheck.querySelector('.kedo__on-check-text');

        if(messageObj){
            title.textContent = !messageObj.title ? '' : messageObj.title;
            text.textContent = !messageObj.text ? '' : messageObj.text;
        };       

        stepsElementsArray = kedoOnCheck.querySelectorAll('.kedo__window-header-item');
        if (!!stepsElementsArray && stepActive != null) {
            for (let i = 0; i < stepActive; i++) {
                 stepsElementsArray[i].classList.add('kedo__window-header-item--done');
            }
            stepsElementsArray[stepActive].classList.add('kedo__window-header-item_active');
        }
        mainColumnContainer.append(kedoOnCheck);
            if (!!messageObj && messageObj.title.includes("портале госуслуг") && !!Context.data.sign_task_id) {
                // esiaLink.href = `./_portal/kedo_ext/_start_page(p:task/${Context.data.sign_task_id})`;
                // esiaLink.textContent = "Подтвердить";
                title.innerHTML = `<a class='esia-confirmation glow' href='./_portal/kedo_ext/_start_page(p:task/${Context.data.sign_task_id})'>Подтвердите</a> выпуск электронной подписи на портале госуслуг.`;
                let esiaConfirmationButton = document.querySelector(".esia-confirmation");
                esiaConfirmationButton.addEventListener("click", () => {
                    let checkTaskClosed = window.setInterval(async () => {
                        let currentTask = await System.processes._searchTasks().where(f => f.__id.eq(Context.data.sign_task_id!)).first();
                        if (currentTask!.data.state == ProcessTaskState.closed) {
                            await userApp!.setStatus(userApp!.fields.__status.variants.waiting_NEP);
                            await renderKedoOnCheck(onCheckUnepWait, 5);
                            window.clearInterval(checkTaskClosed);
                        };
                    }, 1000)
                })
            };
        addBgColorFooterAndMainRowGrey();

        const currentStatus = Context.data.users_status
        await reRenderPageAfterChangeStatus(currentStatus);
        console.log("render kedo on check func")
        hideLoader();
    }    

    async function addUnepButtonsLogic(alternativeIntegration: boolean) {
        let unepMainConfirm = document.querySelector("#popup-confirm");
        let unepMainDiscard = document.querySelector("#popup-discard");
        let mainDiscardPopup = document.querySelector("#discard");
        let mainConfirmPopup = document.querySelector("#confirm");
        let modalBackdrop = document.querySelector(".unep-modal-backdrop");
        let refreshCode = document.querySelector(".kedo-button-sms");
        let unepPopupConfirm = document.querySelector("#check-code");
        // let unepPopupConfirmBackground = unepPopupConfirm.style.bacgroundColor;
        let unepDiscardPopupConfirm = document.querySelector("#unep-discard-button button.popup");
        let unepPopupDiscard= document.querySelector("#discard-code");
        let wrongCode = document.querySelector(".unep-wrong-code");
        let timer = document.querySelector(".timer");
        let loader = document.querySelector(".unep-button-loader");
        let timeout: any;
        let lastSign: DigitalSign;
        if (alternativeIntegration) {
            let issueRejected: boolean = false;
            let rejectPopupButton: any;
            const mainRejectPopup = document.querySelector("#unep-discard-button");
            mainRejectPopup.classList.add("hidden");
            unepMainConfirm.innerHTML = "";
            const taskLink = `./_portal/kedo_ext/_start_page(p:task/${Context.data.sign_task_id})`;
            const linkElement = document.createElement("a");
            linkElement.innerText = "Ознакомиться с заявлением";
            linkElement.href = taskLink;
            linkElement.style.color = "white";
            linkElement.style.textDecoration = "none";
            unepMainConfirm.append(linkElement);
            linkElement.addEventListener("click", () => {
                let findRejectPopup = window.setInterval(() => {
                    rejectPopupButton = document.querySelector("app-task-exit-confirmation .btn-danger");
                    if (!rejectPopupButton) {
                        console.log("no button")
                        return;
                    };
                    window.clearInterval(findRejectPopup);
                    rejectPopupButton.addEventListener("click", () => {
                        console.log("rejected button clicked")
                        // Context.data.unep_issue_rejected = true;
                        issueRejected = true;
                    })
                }, 500);
                let checkTaskInterval = window.setInterval(async () => {
                    let task = await System.processes._searchTasks().where(f => f.__id.eq(Context.data.sign_task_id!)).first();
                    if (task!.data.state == ProcessTaskState.closed) {
                        window.clearInterval(checkTaskInterval);
                        if (issueRejected) {
                            console.log("issue rejected")
                            await renderKedoOnCheck(onCheckUnepReject, 4);
                        } else {
                            await userApp!.setStatus(userApp!.fields.__status.variants.waiting_NEP);
                            await renderKedoOnCheck(onCheckUnepWait, 5);
                        };
                        Context.data.sign_task_id = "";
                    };
                }, 1000)
            });
        } else {
            console.log("old integration")
            let provider: DigitalSignProviderRef = {namespace: "system.__digital_sign_provider", code: "Kontur"};
            if (System['signs' as keyof typeof System]) {
                //@ts-ignore
                lastSign = await System.signs.digitalSigns.getLastRequest(provider);
            } else {
                lastSign = await System.digitalSigns.getLastRequest(provider);
            }

            unepPopupDiscard.addEventListener("click", () => {
                mainConfirmPopup.classList.remove("visible");
            })

            refreshCode.addEventListener("click", sendCode);
            unepPopupConfirm.addEventListener("click", checkCode);

            modalBackdrop.addEventListener("click", (e : any) => {
                modalBackdrop.classList.remove("visible");
                mainConfirmPopup.classList.remove("visible");
                mainDiscardPopup.classList.remove("visible");
            });

            unepMainConfirm.addEventListener("click", (e: any) => {
                e.stopPropagation(); 
                if (mainConfirmPopup.classList.contains("visible")) {
                    mainConfirmPopup.classList.remove("visible");
                    modalBackdrop.classList.remove("visible");
                    wrongCode.classList.remove("visible");
                } else {
                    modalBackdrop.classList.add("visible");
                    mainConfirmPopup.classList.add("visible")
                    mainDiscardPopup.classList.remove("visible");
                }
            });
        };

        unepDiscardPopupConfirm.addEventListener("click", sendComment);
        unepMainDiscard.addEventListener("click", (e: any) => {
            e.stopPropagation();
            if (mainDiscardPopup.classList.contains("visible")) {
                mainDiscardPopup.classList.remove("visible");
                modalBackdrop.classList.remove("visible");
            } else {
                if (!refreshCode.classList.contains("disabled")) {
                    refreshCode.classList.add("disabled");
                    refreshCode.disabled = true;
                };
                wrongCode.classList.remove("visible");
                mainDiscardPopup.classList.add("visible")
                modalBackdrop.classList.add("visible");
                mainConfirmPopup.classList.remove("visible");
            }
        });

        async function sendComment() {
            let userComment = document.querySelector("#discard-comment").value;
            userApp!.data.staff_comment = userComment;
            await userApp!.setStatus(userApp!.fields.__status.variants.input_data);
            await userApp!.save();
            await renderKedoOnCheck(onCheckCommonMessages, null);
        }

        async function checkCode() {
            unepPopupConfirm.disabled = true;
            unepPopupConfirm.style.backgroundColor = "#f1f1f1";
            loader.hidden = false;
            let userCode = document.querySelector("#user_code").value;
            Context.data.secret_code = userCode;
            // TODO: change after saas changes
            let secretSuccess = await lastSign.confirm(userCode);

            if (secretSuccess == true) {
                unepPopupConfirm.style.backgroundColor = "#367eb2";
                unepPopupConfirm.disabled = false;
                loader.hidden = true;
                wrongCode.classList.remove("visible");
                // await Server.rpc.confirmSecret();
                //await userApp!.setStatus(userApp!.fields.__status.variants.waiting_NEP);
                await userApp!.save();
                await renderKedoOnCheck(onCheckUnepWait, 5);
            } else {
                unepPopupConfirm.style.backgroundColor = "#367eb2";
                unepPopupConfirm.disabled = false;
                loader.hidden = true;
                wrongCode.classList.add("visible");
            };
        };

        async function sendCode() {
            setTimer();

            if (!refreshCode.classList.contains("disabled")) {
                    refreshCode.classList.add("disabled");
                    refreshCode.disabled = true;
                };
            // TODO: change after saas changes
            await lastSign.receiveSecret();
        };

        function clearTimer() {
            window.clearInterval(timeout);
        };

        function setTimer() {
            if (!!timeout) {
                clearTimer();
            }
            let seconds = 60;
            timer.innerText = seconds;

            timeout = window.setInterval(() => {
                seconds--;
                timer.innerText = seconds;

                if (seconds <= 0) {
                    refreshCode.classList.remove("disabled");
                    refreshCode.disabled = false;
                    clearTimer();
                };
            }, 1000)
        }
    }

    async function renderStep2Unep(messageObj: { title: string; text: string; }|undefined, alternativeIntegration: boolean) {
        try {
            await getUserContext();
        } catch (err) {
            throw new Error(`error on getContext: ${err.message}`)
        }
        mainColumnContainer.textContent = '';

        const kedoOnCheck = kedoUnepTemplate.content.cloneNode(true);
        const title = kedoOnCheck.querySelector('.kedo__on-check-title');
        const text = kedoOnCheck.querySelector('.kedo__on-check-text');
        stepsElementsArray = kedoOnCheck.querySelectorAll('.kedo__window-header-item');
        for (let i = 0; i < 4; i++) {
            stepsElementsArray[i].classList.add('kedo__window-header-item--done');
        };
        title.style.marginTop = "1rem";
        stepsElementsArray[4].classList.add('kedo__window-header-item_active');

        if(messageObj){
            title.textContent = !messageObj.title ? '' : messageObj.title;
            text.textContent = !messageObj.text ? '' : messageObj.text;
        }
        
        mainColumnContainer.append(kedoOnCheck);
        await addUnepButtonsLogic(alternativeIntegration);
        addBgColorFooterAndMainRowGrey();
    }

    // RENDER STEP 1
    async function renderStep1() {
        // рендер обертки
        renderKedoFormWrapper();
        clearStylesOfStepsEl();
        if(stepsElementsArray.length > 0){
            stepsElementsArray[0].classList.add('kedo__window-header-item_active');
        } else {
            console.error(`stepsElementsArray not found`);
        }

        await getUserContext();
        let user = await Context.data.user_application!.fetch();
        if (!user.data.scans_personal_docs) {
            let stepToDelete = firstStepForms.find((form: any) => form.title.includes("Сканы"));
            firstStepForms.splice(firstStepForms.indexOf(stepToDelete), 1);
        };
        removeBgColorFooterAndMainRowGrey();

        await initStep1();
        // if (Context.data.doc_table) {
        //     const requiredRows = await Promise.all(Context.data.doc_table.filter(doc => doc.required).map(doc => doc.doc.fetch()));
        //     const mappedRows = requiredRows.map(row => row.data.__name)
            
        //     let waitForTable = window.setInterval(() => {
        //         const links = document.querySelectorAll("app-collection-readonly-link a");
        //         const requiredNodes = Array.from(links).filter((link: any) => mappedRows.indexOf(link.textContent.trim().replace("\n", "")) != -1)
        //         if (links.length < Context.data.doc_table!.length) {
        //             return;
        //         };
        //         window.clearInterval(waitForTable);
        //         console.log(requiredNodes);
        //         // requiredNodes.forEach((node: any) => {
        //         //     const nodeRow = node.closest("tr");
        //         //     console.log(nodeRow)
        //         // })
        //     }, 1000)
        // }
    }

    async function renderStep1Edit() {
        // рендер обертки
        renderKedoFormWrapper();
        clearStylesOfStepsEl();

        if(stepsElementsArray.length > 0){
            stepsElementsArray[0].classList.add('kedo__window-header-item_active');
        } else {
            console.error(`stepsElementsArray not found`);
        }

        removeBgColorFooterAndMainRowGrey();

        try{
            await getUserContext();
        }
        catch(err){
            Context.data.error += `getUserContext error ${err}`;
        }
        logError();

        const errorsArr: StepError[]  = []
        const invalidFields = userApp?.data.invalid_fields
        if (invalidFields) {
            invalidFields.forEach(item => {
                let stage = 0
                switch(item.code) {
                    case 'main':
                        stage = 0;
                        break;
                    case 'location':
                        stage = 1;
                        break;
                    case 'documents':
                        stage = 2;
                        break;
                    case 'document_scans':
                        stage = 3
                        break;
                    case 'photo':
                        stage = 4
                        break;
                }

                errorsArr.push({
                    stage,
                    errorMessage: userApp?.data.disclaimer_comment ?? ''
                })
            })
        }

        initStep1Error(errorsArr)
    }

    // RENDER STEP 2
    async function renderStep2() {
        // рендер обертки
        renderKedoFormWrapper();
        clearStylesOfStepsEl();
        stepsElementsArray[0].classList.add('kedo__window-header-item--done');
        stepsElementsArray[1].classList.add('kedo__window-header-item--done');
        stepsElementsArray[2].classList.add('kedo__window-header-item_active');
        
        let fileApp: ApplicationItem<Application$kedo$electronic_interaction_agreement$Data,any>|undefined = undefined;
        
        fileApp = await Context.fields.electronic_interaction_agreement.app
            .search()
            .where((f, g) => g.and(
                f.__deletedAt.eq(null),
                f.staff.link(Context.data.user_application!)
            )).first()        
        try {
            if(fileApp) {
                let fileDownloadUrl: string|undefined = undefined;
                let fileId: string = '';
                let fileName: string = '';
                let fileExtension: string = '';

                if(fileApp.data.__id){
                    fileId = fileApp.data.__id;
                }

                if(fileApp.data.__name){
                    fileName = fileApp.data.__name
                }
                
                const file = fileApp.data.__file;
                let fileItem: FileItem|undefined = undefined;
                if(file){
                    try{
                        fileItem = await file.fetch()
                    }
                    catch(err){
                        console.error(`fileApp.data.__file.fetch error ${err}`)
                    }

                     try{
                        fileDownloadUrl = await file?.getDownloadUrl();
                    }
                    catch(err){
                        console.error(`file?.getDownloadUrl() error ${err}`);
                    }
                }
                
                if(fileItem){
                    const fileNameArr = fileItem.data.__name.split('.')
                    if(Array.isArray(fileNameArr)){
                        const lastIndex = fileNameArr.length - 1
                        fileExtension = fileNameArr[lastIndex];
                    }
                }

                if(fileDownloadUrl && fileId && fileName){
                    let organization = await userApp!.data.organization?.fetch();
                    if (!!organization && organization.data.kedo_regulation) {
                        let kedoRegulation = await organization.data.kedo_regulation.getDownloadUrl();
                        let soevForm = secondStepForms.find((step: any) => step.fieldsId == "step-2-0");
                        soevForm.description += `Также ознакомьтесь с <a href='${kedoRegulation}'>положением о КЭДО</a>.`
                    }
                    await initStep2(fileId, fileName, "pdf", fileDownloadUrl);
                    const fileViewBtn = document.querySelector(".kedo-form__fileview .fileview__name");
                    fileViewBtn.addEventListener("click",() => {
                        let errorBtnInterval: any;
                        errorBtnInterval = window.setInterval(() => {
                            const btn = document.querySelector("body > div.popover-outer.visible > div > div > elma-form > form > elma-popover-footer > elma-buttons > div > div > div.fluid-nav-scope > div:nth-child(1) > button");
                            if (!!btn) {
                                window.clearInterval(errorBtnInterval)

                                btn.addEventListener("click", async () => {
                                    await sendAgreementDocError(false)
                                })
                            }
                        }, 1000)
                    })
                } else {
                    showError("Не найдены данные файла СоЭВ");
                    console.error(`file SOEV not found error`);
                }
            } else {
                showError("Файл СоЭВ не найден");
                console.error(`file SOEV not found error`);
            }

        } catch(err) {
            console.error(`Unable to get the file error ${err}`);
        }

        removeBgColorFooterAndMainRowGrey();

        findBtnSendComment();
    }

    async function renderStep2Lna() {
        renderKedoFormWrapper();
        clearStylesOfStepsEl();
        stepsElementsArray[0].classList.add('kedo__window-header-item--done');
        stepsElementsArray[1].classList.add('kedo__window-header-item--done');
        stepsElementsArray[2].classList.add('kedo__window-header-item--done');
        stepsElementsArray[3].classList.add('kedo__window-header-item--done');
        stepsElementsArray[4].classList.add('kedo__window-header-item--done');
        stepsElementsArray[5].classList.add('kedo__window-header-item--done');
        stepsElementsArray[6].classList.add('kedo__window-header-item_active');
        await renderInnerContentStep2Lna();
    };
    // RENDER STEP 3
    async function  renderStep3() {
        // рендер обертки
        renderKedoFormWrapper();
        clearStylesOfStepsEl();
        stepsElementsArray[0].classList.add('kedo__window-header-item--done');
        stepsElementsArray[1].classList.add('kedo__window-header-item--done');
        stepsElementsArray[2].classList.add('kedo__window-header-item--done');
        stepsElementsArray[3].classList.add('kedo__window-header-item--done');
        stepsElementsArray[4].classList.add('kedo__window-header-item--done');
        stepsElementsArray[5].classList.add('kedo__window-header-item--done');
        stepsElementsArray[6].classList.add('kedo__window-header-item_active');
        // рендер содержимого
        await renderInnerContentStep3();
        removeBgColorFooterAndMainRowGrey();
    }

    function renderRejectedPage(){
        showError("Ваша учетная запись заблокирована. Если это произошло по ошибке — обратитесь к сотруднику отдела кадров.");
    }

    async function handleInvite(){
        if (!userApp) return;
        showLoader();              
        
        try{
            await userApp.setStatus(userApp.fields.__status.variants.filling_pnd);
            await userApp.save();
        }
        catch(err){
            hideLoader();
            Context.data.error += `userApp.setStatus error ${err}`
        }
        logError();

        await renderStep1();
    }

    // закрытие окон просмотра файла
    async function sendCommentHandler(){
        if (!textAreaSoevComment){
            return;
        }

        if (textAreaSoevComment.value){
            showLoader();            

            window.setTimeout(async () => {
                window.history.back();
                Context.data.users_status = stateSteps.wait_edit;

                if (userApp){
                    await renderFormWrapper();

                    hideLoader();
                } else {
                    hideLoader();
                    return;
                }            
            }, 1000)

            btnSubmitSoevComment.removeEventListener('click', sendCommentHandler);   
        }        
    }

    async function findBtnSendComment(){
        let interval: any;

        interval = window.setInterval(() => {
            const btnsArray = document.querySelectorAll('button');
            for (let i = 0; i < btnsArray.length; i++){
                if(
                    btnsArray[i].type === 'submit' 
                    && btnsArray[i].dataset.test === 'createVacancyB'
                    && btnsArray[i].classList.contains('btn-primary')
                ){
                    btnSubmitSoevComment = btnsArray[i];
                    window.clearInterval(interval);

                    btnSubmitSoevComment.addEventListener('click', sendCommentHandler)
                }
            }

            textAreaSoevComment = document.querySelector('#a_comment');
        }, 1000)
    }

    async function handleStep1Wait(){
        // renderKedoFormWrapper();
        // clearStylesOfStepsEl();
        // stepsElementsArray[0].classList.add('kedo__window-header-item--done');
        // stepsElementsArray[1].classList.add('kedo__window-header-item_active');
        await renderKedoOnCheck(onCheckCommonMessages, 1);
    }
    
    try{
        await checkUserStatus();
    } 
    catch(err){
        reloadOnFirstLoad();
    }

    if(!Context.data.users_status){
        reloadOnFirstLoad();
    }

    let organization = await userApp!.data.organization!.fetch();

    switch (Context.data.users_status) {
        case stateSteps.invited:
            await handleInvite();
            break;
        case stateSteps.step1:
            await renderStep1();
            break;
        case stateSteps.step1_wait:
            await handleStep1Wait()
            break;
        case stateSteps.edit_png:
            await renderStep1Edit();
            break;
        case stateSteps.step2:
            await renderStep2();
            break;
        case stateSteps.step2_wait:
            await renderKedoOnCheck(onCheckCommonMessages, 3);
            hideLoader();
            break;
        case stateSteps.step2_wait_sign_work:
            await renderStep3();
            break;
        case stateSteps.step2_unep_choice:
            await renderUnepChoice(organization.data.sign_provider!);
            break;
        case stateSteps.step2_unep:
            let unepIssueConfirmation = organization.data.issue_confirm_type_kontur?.code;
            // let alternativeIntegration: boolean = false;

            // const alternativeIntegrationSetting = await Context.fields.settings.app.search().where(f => f.code.eq("new_method_create_sign")).first();
            // if (!!alternativeIntegrationSetting && alternativeIntegrationSetting.data.status) {
            //     alternativeIntegration = alternativeIntegrationSetting.data.status;
            // };
            if (unepIssueConfirmation == "esia") {
                await Server.rpc.getUnepEsiaTask();
                if (!Context.data.sign_task_id) {
                    await renderKedoOnCheck(onCheckUnep, 4);
                } else {
                    await renderKedoOnCheck(onCheckUnepMessages, 4);
                };
            } else {
                if (userApp!.data.docs_signing_type && userApp!.data.docs_signing_type.code === "goskey") {
                    if (userApp!.data.goskey_nep_released) {
                        renderKedoOnCheck(onWaitDocumentsGeneration, 5);
                    } else {
                        await renderGoskeyStep();
                    };
                } else if (unepIssueConfirmation === "sms" && organization.data.sign_provider) {
                    await Server.rpc.getUnepTask();
                    
                    if (!Context.data.sign_task_id) {
                        await renderKedoOnCheck(onCheckUnep, 4);
                    } else {
                        await renderStep2Unep(onCheckUnepKontur, true);
                    };
                };
            };

            // await renderKedoOnCheck(onCheckUnep, 3);
            break;
        case stateSteps.step2_unep_wait:
            await renderKedoOnCheck(onCheckUnepWait, 5);
            break;
        case stateSteps.step2_waiting_for_documents:
            await renderKedoOnCheck(onWaitDocumentsGeneration, 5);
            break;
        case stateSteps.step2_lna:
            await Server.rpc.getLnaTask();

            if (!Context.data.lna_json || Context.data.lna_json.length == 0) {
                await renderKedoOnCheck(onCheckWorkApp, 6);
                break;
            };
            await renderStep2Lna();
            break;
        case stateSteps.step2_signed_lna:
            await renderKedoOnCheck(onCheckLnaMessage, 6)
            break;
        case stateSteps.step3:
            if (userApp!.data.docs_signing_type!.code === "goskey") {
                const tokenSetting = await Context.fields.settings.app.search().where(f => f.code.eq("api_key")).first();

                if (tokenSetting) {
                    let templateId = await Namespace.storage.getItem("goskey_template_id");

                    if (!templateId) {
                        const processesTemplates = await fetch(`${System.getBaseUrl()}/api/worker/query/system/bp_templates/search`, {
                            method: "PUT",
                            body: JSON.stringify({
                                offset: 0,
                                limit: 100,
                                order: [],
                                filter: {
                                    and: [
                                        {
                                            eq :[
                                                {field: "namespace" },
                                                {const: "ext_7fb0a0d0-fc8d-452e-843f-6a7f2f28a8bf"}
                                            ]
                                        }
                                    ]
                                }
                            })
                        });
                        if (processesTemplates.ok) {
                            const responseJson = await processesTemplates.json();
                            const sendDocsTemplate = responseJson.items.find((item: any) => item.code === "send_docs_to_goskey");
                            templateId = sendDocsTemplate.__id;
                            await Namespace.storage.setItem("goskey_template_id", templateId!);
                        } else {
                            showError(await processesTemplates.text());
                        };
                    };

                    const goskeyProcess = await fetch(`${System.getBaseUrl()}/pub/v1/bpm/instance/bytemplateid/${templateId}/list`, {
                        method: "POST",
                        body: JSON.stringify({
                            filter: {
                                tf: {
                                        "user": userApp!.data.ext_user!.id
                                    }
                            }
                        }),
                        headers: {
                            Authorization: `Bearer ${tokenSetting.data.value}`
                        }
                    });

                    const goskeyDocs = await goskeyProcess.json().then(data => data.result.result[0].docs_for_sign);
                    Context.data.goskey_docs = goskeyDocs;
                    
                    await renderStep3Goskey();
                };
            } else {
                await renderStep3();
            }
            break;
        case stateSteps.rejected:
            renderRejectedPage();
            break;
        case stateSteps.wait_edit:
            await renderKedoOnCheck(onCheckCommonMessages, null);
            break;
        case stateSteps.main_page:
            const useNewPortalSetting = await Context.fields.settings.app.search().where(f => f.code.eq("use_my_profile")).first();
            if (useNewPortalSetting && useNewPortalSetting.data.status) {
                window.location = `https://${host}/_portal/kedo_ext/my_profile`;
            } else {
                window.location = `https://${host}/_portal/kedo_ext/user_page`;
            }
            break;
    };
}

async function renderStep3Goskey(): Promise<void> {
    mainColumnContainer.textContent = '';
    const templateId = await Namespace.storage.getItem("goskey_template_id");
    const tokenSetting = await Context.fields.settings.app.search().where(f => f.code.eq("api_key")).first();
    const kedoOnCheck = kedoOnCheckTemp.content.cloneNode(true);
    const title = kedoOnCheck.querySelector('.kedo__on-check-title');
    const text = kedoOnCheck.querySelector('.kedo__on-check-text');
    const img = kedoOnCheck.querySelector(".kedo__on-check-img");
    const buttonsContainer = document.querySelector(".step3_goskey_footer-template").content.cloneNode(true).querySelector(".unep_goskey_footer");
    const documentsContainer = document.createElement("div");
    const fileLineTemplate = document.querySelector(".file_line-template");
    const showPopupButton = buttonsContainer.querySelector("#goskey-reject-popup");
    const cancelRejectButton = buttonsContainer.querySelector("#goskey-hide-comment");
    const commentPopup = buttonsContainer.querySelector(".step3-goskey-reject");
    const sendCommentButton = buttonsContainer.querySelector("#goskey-send-comment");
    const confirmSignButton = buttonsContainer.querySelector("#goskey-signed");
    const textarea = buttonsContainer.querySelector("textarea");
    // const goskeyInfoCard = document.createElement("div");
    // const goskeyInfoContainer = document.createElement("div");
    // const goskeyTitle = document.createElement("h3");
    // const goskeyDescription = document.createElement("p");
    // const rightColumn = document.querySelector(".kedo__content-column_right");

    // goskeyInfoCard.className = "kedo__question-card";
    // goskeyInfoContainer.className = "kedo__question-card-main-info";
    // goskeyTitle.textContent = "Полезная информация";
    // goskeyDescription.textContent = "Как пользоваться приложением Госключ";

    // goskeyInfoContainer.append(goskeyTitle, goskeyDescription);
    // goskeyInfoCard.append(goskeyInfoContainer);
    
    // rightColumn.append(goskeyInfoCard);

    const goskeyDocs: any[] = await Promise.all(Context.data.goskey_docs!.map(doc => doc.fetch()));
    for (let doc of goskeyDocs) {
        const newDocNode = fileLineTemplate.content.cloneNode(true).querySelector(".file_line-file");
        const fileLink = newDocNode.querySelector(".common-link");

        fileLink.href = `${window.location.href}(p:item/${doc.namespace}/${doc.code}/${doc.id})`;
        fileLink.textContent = doc.data.__name;

        documentsContainer.append(newDocNode);
    };

    documentsContainer.className = "step3_files-container";

    [showPopupButton, cancelRejectButton].forEach((node: any) => node.addEventListener("click", () => {
        commentPopup.classList.toggle("hidden");
    }));

    confirmSignButton.addEventListener("click", async () => {
        await userApp!.setStatus(userApp!.fields.__status.variants.signed_documents);
        await finishStep();
    })

    sendCommentButton.addEventListener("click", async () => {
        userApp!.data.staff_comment = textarea.value;
        await userApp!.setStatus(userApp!.fields.__status.variants.waiting_for_document_editing);
        await userApp!.save();
        await renderFormWrapper();
    })

    text.after(documentsContainer);
    documentsContainer.after(buttonsContainer)
    img.remove();
    title.textContent = "Подпишите документы по трудоустройству в приложении Госключ";
    text.innerHTML = "Ознакомьтесь с полным перечнем документов. Внимательно проверьте ваши данные. Если всё заполненно корректно, подпишите документы через приложение Госключ. После подписания в приложении Госключ, нажмите на этом экране кнопку «Ознакомился и подписал»";

    const stepsElementsArray = kedoOnCheck.querySelectorAll('.kedo__window-header-item');

    for (let i = 0; i < 4; i++) {
        stepsElementsArray[i].classList.add('kedo__window-header-item--done');
    };

    stepsElementsArray[4].classList.add('kedo__window-header-item_active');

    console.log(mainColumnContainer)

    mainColumnContainer.append(kedoOnCheck);

    const waitForProcess = window.setInterval(async () => {
        const goskeyProcess = await fetch(`${System.getBaseUrl()}/pub/v1/bpm/instance/bytemplateid/${templateId}/list`, {
            method: "POST",
            body: JSON.stringify({
                filter: {
                    tf: {
                            "user": userApp!.data.ext_user!.id
                        }
                },
                active: true,
                size: 1
            }),
            headers: {
                Authorization: `Bearer ${tokenSetting!.data.value}`
            }
        });
        
        if (!goskeyProcess.ok) {
            window.clearInterval(waitForProcess);
            showError(await goskeyProcess.text());
        };
        const responseJson = await goskeyProcess.json();
        const data = responseJson.result.result[0];

        if (data.__state === "done") {
            confirmSignButton.classList.remove("disabled");
            window.clearInterval(waitForProcess);
        };
    }, 10000)
}

async function renderGoskeyStep(): Promise<void> {
    mainColumnContainer.textContent = '';
    const kedoOnCheck = kedoOnCheckTemp.content.cloneNode(true);
    const title = kedoOnCheck.querySelector('.kedo__on-check-title');
    const text = kedoOnCheck.querySelector('.kedo__on-check-text');
    const img = kedoOnCheck.querySelector(".kedo__on-check-img");
    const buttonsContainer = document.querySelector(".unep_goskey_footer-template").content.cloneNode(true).querySelector(".unep_goskey_footer");
    const approveButton = buttonsContainer.querySelector(".unep_goskey_footer-button");

    approveButton.addEventListener("click", async () => {
        userApp!.data.goskey_nep_released = true;
        await userApp!.save();
        await renderFormWrapper();
    })

    title.textContent = "Ваша компания использует приложение Госключ для подписания документов";
    text.innerHTML = "Вам необходимо скачать приложение <a target='_blank' href='https://goskey.ru/'>Госключ</a> и авторизоваться, после авторизации нажмите кнопку ниже";
    img.className = "kedo__on-check-img_goskey"
    text.after(buttonsContainer)

    const stepsElementsArray = kedoOnCheck.querySelectorAll('.kedo__window-header-item');

    for (let i = 0; i < 4; i++) {
        stepsElementsArray[i].classList.add('kedo__window-header-item--done');
    };

    stepsElementsArray[4].classList.add('kedo__window-header-item_active');

    mainColumnContainer.append(kedoOnCheck);
}

async function renderUnepChoice(variants: TEnum<Enum$kedo$organization$sign_provider>[]): Promise<void> {
    mainColumnContainer.textContent = '';
    const kedoOnCheck = kedoOnCheckTemp.content.cloneNode(true);
    const title = kedoOnCheck.querySelector('.kedo__on-check-title');
    const text = kedoOnCheck.querySelector('.kedo__on-check-text');
    const img = kedoOnCheck.querySelector(".kedo__on-check-img");
    const choiceFooter = document.querySelector(".unep_choice_footer-template").content.cloneNode(true).querySelector(".unep_choice_footer");
    const variantsContainer = choiceFooter.querySelector(".unep_choice_footer-choice_container");
    const button = choiceFooter.querySelector(".unep_goskey_footer-button");
    const variantNodesArr: any[] = [];

    variants.forEach(variant => {
        const newVariantNode = document.querySelector(".choice_radio-container-template").content.cloneNode(true).querySelector(".choice_radio-container");
        const input = newVariantNode.querySelector("input");
        const label = newVariantNode.querySelector("label");

        input.id = variant.code;
        input.value = variant.code;
        input.name = "unep_choice";
        label.htmlFor = variant.code;
        label.textContent = variant.name;

        input.addEventListener("change", () => {
            if (button.classList.contains("disabled")) {
                button.classList.remove("disabled")
            };
        });

        variantsContainer.append(newVariantNode);
        variantNodesArr.push(input);
    });

    title.textContent = "Ваша компания использует несколько способов для подписания документов";
    text.innerHTML = "Вам необходимо выбрать наиболее удобный способ подписания";
    img.className = "kedo__on-check-img_choice"
    text.after(choiceFooter);

    button.addEventListener("click", async () => {
        const checkedRadioCode = variantNodesArr.find((node: any) => node.checked).id;

        if (checkedRadioCode === "goskey") {
            userApp!.data.docs_signing_type = userApp!.fields.docs_signing_type.variants.goskey;
            await userApp!.setStatus(userApp!.fields.__status.variants.UNEP_release_confirmation);
            await userApp!.save();
            await renderGoskeyStep();
        } else {
            userApp!.data.docs_signing_type = userApp!.fields.docs_signing_type.variants.inner_sign;
            await userApp!.setStatus(userApp!.fields.__status.variants.UNEP_release_confirmation);
            await userApp!.save();
            await renderFormWrapper();
            hideLoader();
        };
    });

    const stepsElementsArray = kedoOnCheck.querySelectorAll('.kedo__window-header-item');

    for (let i = 0; i < 4; i++) {
        stepsElementsArray[i].classList.add('kedo__window-header-item--done');
    };

    stepsElementsArray[4].classList.add('kedo__window-header-item_active');

    mainColumnContainer.append(kedoOnCheck);
};

async function showPrivacyPolicy(){
    const popup = document.querySelector('.kedo-popap-personal-data');
    const popupBtnOk = popup.querySelector('.kedo-popap-personal-data__button');
    const popupInput = popup.querySelector('.kedo-popap-personal-data__input');
    const popupEntity = popup.querySelector('.kedo-popap-personal-data__text-firm');
    const popupLink = popup.querySelector('.kedo-popap-personal-data__input-label-link');
    const licenseLink = popup.querySelector('.license-link');

    function handleInputPrivacyPolicyClick(){
        if(popupInput.checked){
            popupBtnOk.disabled = false
        } else {
            popupBtnOk.disabled = true
        }
    }

    function closePopup(){
        popup.classList.remove('kedo-popap-personal-data_visible');
    }

    async function handleBtnOkClick(){
        userApp!.data.accepted_agreement = true;
        userApp!.data.time_acceptance_agreement = new Datetime();
        
        await userApp!.save()

        closePopup();
    }
    
    // определение юридического лица
    try{
        await Server.rpc.getUserEntity();
    }
    catch(err){
        Context.data.error += `Server.rpc.getUserEntity error ${err}`;
    }
    logError();

    if(Context.data.entity){
        popupEntity.textContent = `c ${Context.data.entity}`;
    }
    
    if(Context.data.id_privacy_policy){
        popupLink.href = `https://${host}/_portal/kedo_ext/_start_page(p:preview/${Context.data.id_privacy_policy}/readonly)?active=true`
    } else {
        popupLink.href = `https://${host}/_portal/kedo_ext/_start_page`
    }

    // согласие
    if(Context.data.approval_id){
        const approvalText = popup.querySelector('.kedo-popap-personal-data__input-approval');
        approvalText.textContent = '';

        const approvalLink = document.createElement("a");
        approvalLink.classList.add('kedo-popap-personal-data__input-approval-link');
        approvalLink.textContent = 'согласие';
        approvalLink.href = `https://${host}/_portal/kedo_ext/_start_page(p:preview/${Context.data.approval_id}/readonly)?active=true`;

        approvalText.append(approvalLink)
    }
    
    licenseLink.href = Context.data.license_file_link;
    licenseLink.target = "_blank"
    popup.classList.add('kedo-popap-personal-data_visible');
    popupInput.addEventListener('click', handleInputPrivacyPolicyClick);
    popupBtnOk.addEventListener('click', handleBtnOkClick);    
}

function renderDocumentsWizard(stepNumber: number, titleName: string) {
        const formWrapper = document.querySelector(`.${titleName}`)
        const titleAnchor = formWrapper.querySelector(".kedo__step3-content-title");
        const formWizard = document.createElement("ul");
        for (let step of documentSteps) {
            formWizard.className = "kedo-form__wizard"
            const listItem = document.createElement("li");
            listItem.classList.add("kedo-form__step-container");

            const wizardCircle = document.createElement("div");
            wizardCircle.classList.add("kedo-form__wizard-step");

            const checkmarkContainer = document.createElement("div");
            checkmarkContainer.classList.add("kedo-form__wizard-checkmark");
            const stepNameElement = document.createElement("p");
            stepNameElement.classList.add("kedo-form__step-name");
            stepNameElement.innerText = step;

            //arrow
            const arrowElement = document.createElement("div");
            arrowElement.classList.add("kedo-form__step-arrow");

            wizardCircle.append(checkmarkContainer);
            listItem.append(wizardCircle);
            listItem.append(stepNameElement);

            formWizard.append(listItem);
            if (documentSteps.indexOf(step) < stepNumber) {
                listItem.classList.add("kedo-form__step-container--active");
                arrowElement.classList.add("kedo-form__step-arrow--active");
                checkmarkContainer.innerHTML = checkmarkSVG;
            };
            if (documentSteps.indexOf(step) !== documentSteps.length - 1) {
                formWizard.append(arrowElement);
            }
        }
        titleAnchor.after(formWizard)
    }

async function renderInnerContentStep2Lna() {
    let signedDocs = 0;
    const fileLinkTempl = document.querySelector('.kedo__step2lna-content-files-list-item-template');
    const contentTemp = document.querySelector('.kedo__step2_lna-content-template');
    let contentWrapper = document.querySelector('.kedo__window-content');
    let tasksWrapper: any;
    let sendBtn: any;
    let tasks = JSON.parse(Context.data.lna_json!);
    let docsToSign = tasks.length || 0;
    console.log({tasks});
    console.log({docsToSign})

    function getHtmlFromString(htmlStr: string) {
        let temp = document.createElement('template');
        htmlStr = htmlStr.trim();
        temp.innerHTML = htmlStr;
        return temp.content.firstChild;
    };

    async function handleButtonClick() {
        await finishStep();
    };

    async function renderTasks() {
        for (let task of tasks) {
            const taskWrapper = fileLinkTempl.content.cloneNode(true);
            const link = taskWrapper.querySelector('.kedo__step3-content-files-list-item-link');
            const btn = taskWrapper.querySelector('.kedo__step3-content-files-list-item-btn');
            const img = taskWrapper.querySelector('.kedo__step2lna-content-files-list-item-img');
            let statusCode = task.status;
            let taskStatus = statusCode == "in_progress" ? getHtmlFromString('<i _ngcontent-ohy-c850="" class="elma-icons status-icon @in_progress">unresolved</i>') : getHtmlFromString('<i _ngcontent-dqx-c866="" class="elma-icons status-icon @approved">approved</i>');

            link.textContent = task.name;
            if (statusCode == "in_progress") {
                btn.href = `./_portal/kedo_ext/_start_page(p:task/${task.id})`;
                btn.textContent = "Ознакомиться";
                btn.addEventListener("click", (e: any) => {
                    try {
                        let waitForStatus = window.setInterval(async () => {
                            let currentTask = await System.processes._searchTasks().where(f => f.__id.eq(task.id)).first();
                            if (currentTask!.data.state == ProcessTaskState.closed) {
                                window.clearInterval(waitForStatus);
                                signedDocs++
                                btn.classList.add("kedo__step3-content-files-list-item-btn--disabled");
                                btn.textContent = "Ознакомлено";
                                let parentStatus = btn.parentElement.querySelector(".kedo__step2lna-content-files-list-item-img i");
                                parentStatus.remove();
                                let newStatus = getHtmlFromString('<i _ngcontent-dqx-c866="" class="elma-icons status-icon @approved">approved</i>');
                                img.append(newStatus);
                                
                                if (signedDocs == docsToSign) {
                                    sendBtn.disabled = false;
                                    console.log("all signed");
                                };
                            };
                        }, 1000);
                    } catch (err) {
                        throw new Error(err.message)
                }
                });
            } else {
                signedDocs++;
                btn.classList.add("kedo__step3-content-files-list-item-btn--disabled")
                btn.textContent = "Ознакомлено";
            };
            link.style.pointerEvents = `none`;
            img.appendChild(taskStatus)
            tasksWrapper.append(taskWrapper);
            if (signedDocs == docsToSign) {
                sendBtn.disabled = false;
            };

        };
    };

    if(contentWrapper){
        const contentEl = contentTemp.content.cloneNode(true);
        contentWrapper.textContent = '';
        contentWrapper.append(contentEl);
        renderDocumentsWizard(2 + adjustStep, "kedo__step2_lna-content-wrapper");
        tasksWrapper = document.querySelector(".kedo__step2_lna-content-wrapper .kedo__step3-content-files-list")
        let findSendButton = window.setInterval(async () => {
            sendBtn = document.querySelector(".kedo__step2_lna-content-wrapper .kedo__step3-content-btn-send");
            if (!sendBtn) {
                return;
            };
            window.clearInterval(findSendButton);
            sendBtn.addEventListener("click", handleButtonClick);
            
            if (!tasks || tasks.length < 1) {
                sendBtn.disabled = false;
                return;
            } else {
                sendBtn.disabled = true;
                await renderTasks();
            };
        }, 500)
    } else {
        console.log("no wrapper")
        return;
    };
};

// RENDER STEP3 CONTENT ===========================================================================================================
function renderKedoSucces(messageObj: { title: string; text: string; }) {
    kedoOnCheckSuccesTemp = document.querySelector('.kedo__on-success-template'); 
    mainColumnContainer.textContent = ''
    const kedoSucces = kedoOnCheckSuccesTemp.content.cloneNode(true);

    const title = kedoSucces.querySelector('.kedo__on-check-title');
    const text = kedoSucces.querySelector('.kedo__on-check-text');

    if(messageObj){
        title.textContent = !messageObj.title ? '' : messageObj.title;
        text.textContent = !messageObj.text ? '' : messageObj.text;
    }        

    mainColumnContainer.append(kedoSucces);

    addBgColorFooterAndMainRowGrey();
}

async function renderInnerContentStep3(){
    const fileLinkTempl = document.querySelector('.kedo__step3-content-files-list-item-template');
    const contentTemp = document.querySelector('.kedo__step3-content-template');
    const contentWrapper = document.querySelector('.kedo__window-content');
    const currentUser = await System.users.getCurrentUser();
    let filesWrapper: any;
    let btnCancelWrappperEl: any;
    let btnCancel: any;
    let taskCancelled = false;
    let tasks: any[] = [];

    async function sendStep3Rejection() {
        if (userApp) {
            showLoader();
            userApp.data.staff_comment = Context.data.agreement_error_message;
            // changed process and status
            await userApp.setStatus(userApp.fields.__status.variants.waiting_for_document_editing);
            await userApp.save();
            const procInstance = taskForSign!.data.instance;
            const process = await System.processes._searchInstances().where(f => f.__id.eq(procInstance!.__id)).first();
            await process!.interrupt("устаревший");
            console.log("process closed")
            window.setTimeout(async () => {
                if (userApp){
                    await renderFormWrapper();

                    hideLoader();
                } else {
                    hideLoader();
                    return;
                }
            }, 100) 
        }
    }
    if(contentWrapper){
        const contentEl = contentTemp.content.cloneNode(true);
        contentWrapper.textContent = '';
        contentWrapper.append(contentEl);

        btnCancelWrappperEl = document.querySelector('.kedo__step3-content-btn-cancel-wrapper');
        btnCancel = document.querySelector('.kedo__step3-content-btn-cancel')

        const popup = renderButtonPopup(sendStep3Rejection);

        btnCancelWrappperEl.append(popup)
        btnCancel.addEventListener("click", togglePopup);
    } else {
        return;
    };
    
    if (Context.data.users_status == stateSteps.step2_wait_sign_work) {
        renderDocumentsWizard(1 + adjustStep, "kedo__step3-content-wrapper");
    } else {
        await Server.rpc.getLnaTask();

        if (!Context.data.lna_json || Context.data.lna_json.length == 0) {
            documentSteps.shift();
        };
        if (documentSteps.length != 1) {
            renderDocumentsWizard(3 + adjustStep, "kedo__step3-content-wrapper");
        };
    };

    const user = await System.users.getCurrentUser();
    const signTaskWrapper = document.querySelector(".kedo__step3-content-hyperlink");

    if (Context.data.users_status == stateSteps.step2_wait_sign_work) {
        const stepText = document.querySelector(".kedo__step3-content-text");
        stepText.textContent = "Ознакомьтесь с заявлением на трудоустройство и подпишите его."

        signTaskWrapper.textContent = "Подписать";

    };
    let userTasks = await System.processes._searchTasks().where((f, g) => g.and(
        f.performers.has(user)
    )).size(100).sort("__createdAt", false).all();
    userTasks = userTasks.filter(task => {
        return !task.data.__name.includes("смс") && task.data.__name.toLowerCase().includes("подписать") && task.data.state == ProcessTaskState.inProgress;
    });
    let taskForSign = userTasks.find(task => task.data.state === ProcessTaskState.inProgress) ?? undefined;
    if (Context.data.users_status == stateSteps.step2_wait_sign_work) {
        taskForSign = userTasks.find(task => !task.data.__name.includes("пакет") && task.data.state === ProcessTaskState.inProgress);
    };
    if (userTasks.length > 1) {
        const oldTasks = userTasks.slice(1);
        oldTasks.forEach(async task => {
            if (task.data.state == "in_progress" && !task.data.__name.includes("пакет")) {
                const procInstanse = await task.getProcessInstance();
                await procInstanse.interrupt("Устаревший экземпляр");
            };
        });
    };

    const sendBtn = document.querySelector('.kedo__step3-content-btn-send');
    sendBtn.addEventListener('click', handleSendBtnClick)

    if (!taskForSign) {
        signTaskWrapper.classList.add("disabled");
        return;
    };

    const taskId = taskForSign!.id;
    signTaskWrapper.href = `./_portal/kedo_ext/_start_page(p:task/${taskId})`;

    sendBtn.disabled = taskForSign!.data.state == ProcessTaskState.inProgress;

    signTaskWrapper.addEventListener("click", () => {
        let waitForButtons = window.setInterval(() => {
            let taskCancelButton = document.querySelector("app-sign-task-reject-template .btn-primary");
        
            if (!taskCancelButton) {
                return;
            };

            window.clearInterval(waitForButtons);
            taskCancelButton.addEventListener("click", () => {
                console.log("true")
                taskCancelled = true
            });
        }, 300)
    })

    let waitForTaskEnd = window.setInterval(async () => {
        taskForSign = await System.processes._searchTasks().where(f => f.__id.eq(taskId)).first();
        if (taskForSign!.data.state == "in_progress") {
            return;
        };
        if (taskCancelled) {
            window.clearInterval(waitForTaskEnd);
            await userApp!.setStatus(userApp!.fields.__status.variants.rejected);
            await renderFormWrapper();
            return;
        };

        signTaskWrapper.disabled = true;
        sendBtn.disabled = false;
        window.clearInterval(waitForTaskEnd);
    }, 1000)

    async function handleSendBtnClick(){
        if (Context.data.users_status == stateSteps.step2_wait_sign_work) {
            const position = userApp?.data.position;
            if (!position) {
                await userApp!.setStatus(userApp!.fields.__status.variants.introduction_lna)
            } else {
                const documents_pull = await Context.fields.lna_app.app.search().where((f, g) => g.and(
                    f.__deletedAt.eq(null),
                    f.positions_review.has(position!),
                    g.or(
                        f.__status.eq(Context.fields.lna_app.app.fields.__status.variants.approved),
                        f.__status.eq(Context.fields.lna_app.app.fields.__status.variants.current)
                    )
                )).size(10000).all();
                if (!documents_pull || documents_pull.length == 0) {
                    await userApp!.setStatus(userApp!.fields.__status.variants.docs_generation_wait)
                } else {
                    await userApp!.setStatus(userApp!.fields.__status.variants.introduction_lna)
                };
            };
            await renderFormWrapper();
        } else {
            await finishStep();
        };
    };
    
    // обработка нажатия Отказать
    function btnCancelHandler(){
        const popup = renderButtonPopup(() => {});
        btnCancelWrappperEl.append(popup)
    }

    if(btnCancel && btnCancelWrappperEl){
        btnCancel.addEventListener('click', btnCancelHandler)
    }

}

// STEPS CHANGE =======================================================================================================================

async function finishStep1Stage1(){
    // setTimeToZero()
    try{
        sessionStorage.setItem("patronymic", Context.data.patronymic)
        await saveContextStep1Stage1();
    }
    catch(err){
        showError('Произошла ошибка сохранения данных. Пожалуйста, перезагрузите страницу.');
        throw new Error(`Server.rpc.saveContextStep1Stage1 error ${err}`);
    }
    // writeProcessDuration('Server.rpc.saveContextStep1Stage1()')
    logError();
    
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
}
async function finishStep1Stage2(){
    // setTimeToZero()
    try{
        await Server.rpc.saveContextStep1Stage2();
    } catch(err){
        showError('Произошла ошибка сохранения данных. Пожалуйста, перезагрузите страницу.');
        throw new Error(`Server.rpc.saveContextStep1Stage2 error ${err}`);
    };
    logError();
}
async function finishStep1Stage3(){
    // setTimeToZero()
    try{
        await Server.rpc.saveContextStep1Stage3();
    }
    catch(err){
        showError('Произошла ошибка сохранения данных. Пожалуйста, перезагрузите страницу.');
        throw new Error(`Server.rpc.saveContextStep1Stage3 error ${err}`);
    }
    // writeProcessDuration('Server.rpc.saveContextStep1Stage3()')
    logError();
}
async function finishStep1Stage4(){
    // setTimeToZero()
    try{
        await Server.rpc.saveContextStep1Stage4();
    }
    catch(err){
        showError('Произошла ошибка сохранения данных. Пожалуйста, перезагрузите страницу.');
        throw new Error(`Server.rpc.saveContextStep1Stage4 error ${err}`);
    }
    // writeProcessDuration('Server.rpc.saveContextStep1Stage4()')
    logError();
}
async function finishStep1Stage5(){
    // setTimeToZero()
    try{
        await Server.rpc.saveContextStep1Stage5();
    }
    catch(err){
        hideLoader();
        showError('Произошла ошибка сохранения данных. Пожалуйста, перезагрузите страницу.');
        throw new Error(`Server.rpc.saveContextStep1Stage5 error ${err}`);
    }
    // writeProcessDuration('Server.rpc.saveContextStep1Stage5()')
    logError();
}

async function finishStep(){
    async function setAppStatus(status: TStatus<any,any>){
        if(!Context.data.user_application) return;
        let userApp: ApplicationItem<Application$kedo$staff$Data,any>|undefined = undefined;
        try{
            userApp = await Context.data.user_application.fetch()
        }
        catch(err){
            console.error(`Context.data.user_application.fetch error ${err}`)
        }

        if(!userApp) return;

        try{
            await userApp.setStatus(status);
            await userApp.save();
        }
        catch(err){
            throw new Error(`userApp.setStatus error ${err}`);
        }
    }

    async function finishStep3(){
        showLoader();

        if (!userApp) return;
        await setAppStatus(userApp.fields.__status.variants.signed_documents);

        if(!Context.data.entity){
            try{
                // определение юридического лица
                await Server.rpc.getUserEntity();
            }
            catch(err){
                Context.data.error += `Server.rpc.getUserEntity error ${err}`;
            }
        }
        logError();

        if(Context.data.entity){
            editOnKedoSuccesMessages(Context.data.entity);
        }

        renderKedoSucces(onKedoSuccesMessages);

        hideLoader();  

        window.setTimeout(async () => {
            const useNewPortalSetting = await Context.fields.settings.app.search().where(f => f.code.eq("use_my_profile")).first();
            if (useNewPortalSetting && useNewPortalSetting.data.status) {
                window.location = `https://${host}/_portal/kedo_ext/my_profile`;
            } else {
                window.location = `https://${host}/_portal/kedo_ext/user_page`;
            }
        }, 5000)

    }

    async function finishStep2Lna() {
        showLoader();
        await userApp!.setStatus(userApp!.fields.__status.variants.signing_lna);
        await renderFormWrapper();
        hideLoader();
    };

    async function finishStep2(){
        if(!userApp) return;

        showLoader();

        try{
            await Server.rpc.saveContextSetStatusStep2();
            
        }
        catch(err){
            showError('Произошла ошибка сохранения данных. Пожалуйста, перезагрузите страницу.');
            throw new Error(`Server.rpc.saveContextSetStatusStep2 error ${err}`);
        }

        window.setTimeout(async () => {
            if (userApp){
                await renderFormWrapper();          

                hideLoader();
            } else {
                hideLoader();
                return;
            }
        }, 100) 
    }

    async function finishStep1(){
        
        if(!userApp) return;

        showLoader();

        try {
            await Promise.all([Server.rpc.appProcessRun(), setAppStatus(userApp.fields.__status.variants.input_data)])
        }
        catch(err){
            console.error(err)
        }
        logError();

        window.setTimeout(async () => {
            if (userApp){
                await renderFormWrapper();              

                hideLoader();
            } else {
                hideLoader();
                return;
            }
            
        }, 1000)
    }

    async function finishEdit() {
        try{
            userApp = await Context.data.user_application!.fetch();
        }
        catch(err){
            throw new Error(`Context.data.user_application!.fetch error ${err}`);
        }

        if(userApp){
            try{
                await userApp.setStatus(userApp.fields.__status.variants.input_data);
                await userApp.save();
                deleteScanFix();
            }
            catch(err){
                throw new Error(`userApp.setStatus error ${err}`);
            }
        } else {
            return;
        }

        window.setTimeout(async () => {
            if (userApp){
                await renderFormWrapper();

                hideLoader();
            } else {
                hideLoader();
                return;
            }
            
        }, 1000)
    }

    if (userApp){
        switch(Context.data.users_status){
            case stateSteps.step1:
                await finishStep1();
                break;
            case stateSteps.invited:
                await finishStep1();
                break;
            // case stateSteps.step2_wait_sign_work:
            //     await renderFormWrapper()
            case stateSteps.step2:
                await finishStep2();
                break;
            case stateSteps.step2_lna:
                await finishStep2Lna();
                break;
            case stateSteps.step3:
                await finishStep3();
                break;
            case stateSteps.edit_png: 
                await finishEdit();
                break;
        }
    }    
}

function showLoader(){
    loaderEl.classList.add('kedo-loader-wrapper_active')
}
function hideLoader(){
    if (loaderEl.classList.contains("kedo-loader-wrapper_active")) {
        loaderEl.classList.remove('kedo-loader-wrapper_active')
    };
};


// =================================================================================================================================================
function validateTable() {
    const requiredRows = Context.data.doc_table!.filter(row => row.required);
    const isValid = requiredRows.every(row => row.file_doc) || (!requiredRows || requiredRows.length < 1);
    let findNextButton = window.setInterval(() => {
        const nextButton = document.querySelector(".kedo-form__next-btn");
        if (!nextButton) {
            return;
        };
        window.clearInterval(findNextButton)
        if (isValid) {
            Context.data.table_valid = true;
            nextButton.disabled = false;
            // nextButton.addEventListener("click", finishStep1Stage4);
            return;
        };
        nextButton.disabled = true;
        Context.data.table_valid = false;
    }, 500)
}
async function validate(currentId: string, validCB?: (isValid: boolean, id: string) => void): Promise<boolean> {
    if (Context.data.users_status === stateSteps.step1 && !currentId.includes("step-1")) return true;
    if(Context.data.users_status === stateSteps.step2 && !currentId.includes("step-2")) return true;
    const currentStep = stepByStepValidation.find(step => step.id === currentId);
    if (!currentStep) {
        console.error('Validation not found');
        return false;
    };

    let isValid = true;
    if (currentStep && currentStep.fields)
    for (let field of currentStep.fields) {
        if (field.notRequired) continue;
        if (field.fieldType === 'plain' || !field.fieldType) {
            isValid = typeof Context.data[field.fieldName] !== 'undefined' && Context.data[field.fieldName] !== '';

            // if (isValid && field.fieldName === "snils") {
            //     // validateSnils(Context.data.snils!, document.querySelector("#snils"));
            //     isValid = !Context.data.wrong_snils_format;
            //     console.log(`snils is valid: ${isValid}`);
            //     console.log(Context.data.wrong_snils_format);
            // };

            if (isValid && !!field.regExp) {
                if (!field.regExp.test(Context.data[field.fieldName])) {
                    isValid = false
                }             
            }
        };
        if (field.fieldName === "signed_agreement_scan") {
            if (!Context.data.signed_agreement_scan) {
                isValid = false;
                return isValid;
            };
            isValid = true;
        }

        if (field.fieldType === 'table') {
            isValid = Context.data.table_valid!;
            return isValid;
        }
        if (field.fieldType === 'email') do {
            if (!Context.data[field.fieldName]) {
                isValid = false;
                break;
            }
            const emailRegExp = new RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$', 'i');
            if (userApp && userApp.data.email) {
                isValid = emailRegExp.test(userApp.data.email.email)
            } else {
                if (Array.isArray(Context.data[field.fieldName])) {
                    const validTest = Context.data[field.fieldName].find((item: any) => !emailRegExp.test(item.email));
                    isValid = !validTest;
                } else {
                    isValid = emailRegExp.test(Context.data[field.fieldName].email);
                }
            }
        } while (false);

        if (field.fieldType === 'phone') do {
            if (!Context.data[field.fieldName]){
                isValid = false;
                break;
            };
            if (userApp && userApp.data.phone) {
                isValid = /\+\d{11,15}/g.test(userApp.data.phone.tel);
            } else {
                if (Array.isArray(Context.data[field.fieldName])) {
                    const validTest = Context.data[field.fieldName].find((item: any) => !item.isValid);
                    isValid = !validTest;
                } else {
                    isValid = Context.data[field.fieldName].isValid;
                }
            }
        } while (false);

        if (!isValid) break;
    }
    if (validCB) {
        validCB(isValid, currentId)
    };
    return isValid;
}

function saveErrorMessage(e: any) {
    Context.data.agreement_error_message = e.target.value;
    
}



async function sendAgreementDocError(saveMessage: boolean) {
    if (userApp) {
        showLoader();
        if (saveMessage) {
            userApp.data.staff_comment = Context.data.agreement_error_message;
        }
        await userApp.setStatus(userApp.fields.__status.variants.waiting_for_document_editing);
        await userApp.save();
        window.setTimeout(async () => {
            if (userApp){
                await renderFormWrapper();

                hideLoader();
            } else {
                hideLoader();
                return;
            }
        }, 100) 
    }
}



async function getUserContext(){
    if(!userApp){
        return;
    };
    if (userApp.data.documents_for_employment && userApp.data.documents_for_employment.length > 0 && Context.data.doc_table && Context.data.doc_table.length < 1) {
        Context.data.doc_table = userApp.data.documents_for_employment;
    };
    if(userApp.data.full_name){
        if(userApp.data.full_name.firstname){
            Context.data.name = userApp.data.full_name.firstname;
        }
        if(userApp.data.full_name.lastname){
            Context.data.surname = userApp.data.full_name.lastname;
        }
        if(userApp.data.full_name.middlename){
            Context.data.patronymic = userApp.data.full_name.middlename;
        }
        if(userApp.data.middlename) {
            Context.data.patronymic = userApp.data.middlename;
        }
    }
    if(userApp.data.date_of_birth){
        Context.data.date_of_birth = userApp.data.date_of_birth;
    }
    if(userApp.data.sex){
        Context.data.gender = userApp.data.sex;
    }
    if(userApp.data.marriage){
        Context.data.marriage = userApp.data.marriage;
    }
    if(userApp.data.email){
        Context.data.email_work = {email: userApp.data.email.email, type: EmailType.Work}
    }
    if(userApp.data.phone){
        Context.data.phone_number_work = userApp.data.phone;
    }
    // ===
    if(userApp.data.directory_of_regions){
        Context.data.region_app = userApp.data.directory_of_regions;
    }
    if(userApp.data.city){
        Context.data.city = userApp.data.city;
    }
    if(userApp.data.street){
        Context.data.street = userApp.data.street;
    }
    if(userApp.data.home){
        Context.data.house = userApp.data.home;
    }
    if(userApp.data.housing){
        Context.data.housing = userApp.data.housing;
    }
    if(userApp.data.apartment){
        Context.data.flat = userApp.data.apartment;
    }
    // ===
    if(userApp.data.passport_series){
        Context.data.passport_series = userApp.data.passport_series;
    }
    if(userApp.data.passport_number){
        Context.data.passport_number = userApp.data.passport_number;
    }
    if(userApp.data.date_of_issue){
        Context.data.date_of_issue = userApp.data.date_of_issue;
    }
    if(userApp.data.issued_by){
        Context.data.issuer = userApp.data.issued_by;
    }
    if(userApp.data.passport_department_code){
        Context.data.issuer_code = userApp.data.passport_department_code;
    }
    if(userApp.data.inn){
        Context.data.inn = userApp.data.inn;
    }
    if(userApp.data.snils){
        Context.data.snils = userApp.data.snils;
    }
    // ===
    if(userApp.data.passport_page_with_photo_and_data){
        Context.data.passport_first_spread = userApp.data.passport_page_with_photo_and_data;
    }
    if(userApp.data.the_passport_page_with_current_registration){
        Context.data.passport_registration = userApp.data.the_passport_page_with_current_registration;
    }
    if(userApp.data.snils_file){
        Context.data.snils_photo = userApp.data.snils_file;
    }
    if(userApp.data.inn_file){
        Context.data.inn_photo = userApp.data.inn_file;
    }
    // ===
    if(userApp.data.photo_with_unfolded_passport){
        Context.data.passport_face_photo = userApp.data.photo_with_unfolded_passport;
    }
}


async function showError(text: string){   
    kedoErrorTemp = document.querySelector('.kedo-error-wrapper-template'); 
    const kedoErrorEl = kedoErrorTemp.content.cloneNode(true);
    const kedoErrorTextEl = kedoErrorEl.querySelector('.kedo-error-text');
    kedoErrorTextEl.textContent = text;

    if(mainColumnContainer){
        mainColumnContainer.textContent = '';
        mainColumnContainer.append(kedoErrorEl);
    }
    hideLoader();
}

function goToPortalMainPage(){
    window.location = `https://${host}/_portal/kedo_ext/user_page`;
}


// добавление стилей (для мобильных версий)
function addBgColorFooterAndMainRowGrey(){
    for(let i = 0; i < footerElArr.length; i++){
        footerElArr[i].classList.add('footer_color_grey');
    }    
    kedoContentRowEl.classList.add('kedo__content-row_color_grey');
}
function removeBgColorFooterAndMainRowGrey(){
    for(let i = 0; i < footerElArr.length; i++){
        footerElArr[i].classList.remove('footer_color_grey');
    }  
    kedoContentRowEl.classList.remove('kedo__content-row_color_grey');
}


// =========================================================================================================================================
// =========================================================================================================================================
// =========================================================================================================================================


async function findUserAppByExternalUser(): Promise<void> {
    async function findInnerUserApp(){
        if(!currentUser) return;
        
        userApp = await Context.fields.user_application.app.search().where((f, g) => g.and(
                f.ext_user.eq(currentUser!),
                f.__status.neq(Context.fields.user_application.app.fields.__status.variants.dismissed)
            )).first();
        if(!userApp) return;

        Context.data.user_application = userApp;
        Context.data.id_applications_employees = userApp.data.__id;

        if(userApp!.data.__status!.name === userApp!.fields.__status!.variants.invited.name){
            console.log("saving user")
            await saveInnerUserData();
        }
    }

    async function saveInnerUserData(){
        if(!userApp) return;
        if(!currentUser)return;
        if(!currentUser.data.fullname)return;

        if(!userApp.data.full_name) return;

        if(currentUser.data.fullname.firstname){
            userApp.data.full_name.firstname = currentUser.data.fullname.firstname;
        }
        if(currentUser.data.fullname.middlename){
            userApp.data.full_name.middlename = currentUser.data.fullname.middlename;
        }
        if(currentUser.data.fullname.lastname){
            userApp.data.full_name.lastname = currentUser.data.fullname.lastname;
        }

        await userApp.save();
    }

    async function saveExternalUserData(){
        if(!userApp) return;
        if(!currentUser)return;
        if(!currentUser.data.fullname)return;
        
        let extUserApp: ApplicationItem<Application$_system_catalogs$_user_profiles$Data,any>|undefined = undefined;
        // lastFuncTime = (new Date).getTime()
        try{
            extUserApp = await Context.fields.application_external_user.app.search().where(item => item.__id.eq(Context.data.external_user_id!)).first()
        }
        catch(err){
            Context.data.error += ` Context.fields.application_external_user.app.search error ${err} `
        }
        // addLogToArr('saveUserData application_external_user.app.search')
        logError();

        if(!extUserApp) return;
        if(!extUserApp.data.fullname) return;

        if(!userApp.data.full_name) return;

        if(extUserApp.data.fullname.firstname){
            userApp.data.full_name.firstname = extUserApp.data.fullname.firstname;
        }
        if(extUserApp.data.fullname.middlename){
            userApp.data.full_name.middlename = extUserApp.data.fullname.middlename;
        }
        if(extUserApp.data.fullname.lastname){
            userApp.data.full_name.lastname = extUserApp.data.fullname.lastname;
        }

        // lastFuncTime = (new Date).getTime()
        await userApp.save();
        // addLogToArr('saveUserData userApp.save')
    }

    let userApp: ApplicationItem<Application$kedo$staff$Data,Application$kedo$staff$Params>|undefined = undefined;

    let currentUser: UserItem|undefined = undefined;
    

    // lastFuncTime = (new Date).getTime()
    try{
        currentUser = await System.users.getCurrentUser();
    }
    catch(err){
        throw new Error(`System.users.getCurrentUser error ${err}`);
    }
    // addLogToArr('System.users.getCurrentUser')

    if(!currentUser){
        console.log("no current user")
        return;
    }

    if(currentUser){
        Context.data.user_id = currentUser.data.__id;
        await findInnerUserApp()
    };
}

const deleteScanFix = () => {
    const removeBtn = document.querySelector("#step-2-1 .btn.btn-danger");

    if (!!removeBtn) {
        removeBtn.click()
    }
}

function validateInn(inn: string, element: any) {
    let errorExists = element.parentElement.querySelector(".inn-error-container");
    if (!inn || inn.length < 12) {
        if (errorExists) {
            errorExists.remove();
        };
        return;
    };
	let result = false;
    const checkDigit = function (inn: string, coefficients: number[]) {
        let n = 0;
        for (let i in coefficients) {
            n += coefficients[i] * parseInt(inn[i]);
        }
        return n % 11 % 10;
    };
    switch (inn.length) {
        case 10:
            let n10 = checkDigit(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
            if (n10 === parseInt(inn[9])) {
                result = true;
            }
            break;
        case 12:
            let n11 = checkDigit(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
            let n12 = checkDigit(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
            if ((n11 === parseInt(inn[10])) && (n12 === parseInt(inn[11]))) {
                result = true;
            }
            break;
    }
    if (!result) {
        if (!errorExists) {
            let errorText = document.createElement("p");
            errorText.className = "inn-error-container";
            errorText.textContent = "ИНН не соответствует единому формату РФ";
            errorText.style.color = "#df352c";
            element.parentElement.append(errorText);
        };
        return;
    }
    if (errorExists) {
        const existingError = element.parentElement.querySelector(".inn-error-container");
        existingError.remove();
    }
    Context.data.wrong_inn_format = false;
};

function validateSnils(snils: string, element: any) {
    let errorExists = element.parentElement.querySelector(".snils-error-container");
    if (!snils || snils.length < 14) {
        if (errorExists) {
            errorExists.remove();
        };
        return;
	};
    snils = snils.replace(/[\s-]/g, "");
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(snils[i]) * (9 - i);
    }
    let checkDigit = 0;
    if (sum < 100) {
        checkDigit = sum;
    } else if (sum > 101) {
        checkDigit = sum % 101;
        if (checkDigit === 100) {
            checkDigit = 0;
        }
    }
    if (checkDigit === parseInt(snils.slice(-2))) {
        if (errorExists) {
            errorExists.remove();
        };
        Context.data.wrong_snils_format = false;
        return;
    };

    if (!errorExists) {
        let errorText = document.createElement("p");
        errorText.textContent = "СНИЛС не соответствует единому формату РФ";
        errorText.className = "snils-error-container";
        errorText.style.color = "#df352c";
        element.parentElement.append(errorText);
        Context.data.wrong_snils_format = true;
    }

    if (Context.data.wrong_snils_format) {
        const nextButton = document.querySelector(".kedo-form__next-btn");

        if (!nextButton.disabled) {
            nextButton.disabled = true;
        } else {
            nextButton.disabled = false;
        };
    };
};

function getContextData(): boolean {
    return Context.data.table_valid!
};

function logTable() {
    console.log(Context.data.doc_table);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    let binaryString = atob(base64);
    let bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
