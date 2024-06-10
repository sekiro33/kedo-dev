/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

let defaultLogo = Namespace.params.data.portal_logo_svg || `<svg width="197" height="22" viewBox="0 0 197 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.4281 17.9618H10.6638L14.0085 21.3065C18.0952 21.0072 21.3287 17.5898 21.3287 13.4282V10.6639H17.9618V13.4282C17.9618 15.9275 15.9275 17.9618 13.4281 17.9618Z" fill="#5082E6"/>
            <path d="M17.9619 7.90257V10.6648L21.3065 7.32019C21.0073 3.23544 17.5898 0 13.4282 0H10.6639V3.36688H13.4282C15.9276 3.36688 17.9619 5.40117 17.9619 7.90257Z" fill="#FABE00"/>
            <path d="M7.90257 3.36709H10.6648L7.32019 0.0244751C3.23544 0.321732 0 3.74119 0 7.90278V10.6671H3.36688V7.90278C3.36688 5.40138 5.40117 3.36709 7.90257 3.36709Z" fill="#E62D32"/>
            <path d="M3.36703 13.4283V10.6641L0.0244141 14.0087C0.323693 18.0955 3.74113 21.3289 7.90272 21.3289H10.667V17.962H7.90272C5.40132 17.962 3.36703 15.9277 3.36703 13.4283Z" fill="#5AD2FF"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M155.356 16.9598C156.1 17.2627 156.967 17.4141 157.958 17.4141C158.991 17.4141 159.955 17.2214 160.85 16.8359C161.758 16.4504 162.55 15.9203 163.224 15.2457C163.899 14.5711 164.429 13.7864 164.815 12.8915C165.2 11.9828 165.393 11.0122 165.393 9.97961C165.393 8.94704 165.2 7.98331 164.815 7.08842C164.429 6.17975 163.899 5.38812 163.224 4.7135C162.55 4.03889 161.758 3.50884 160.85 3.12334C159.955 2.73785 158.991 2.5451 157.958 2.5451C156.967 2.5451 156.1 2.70343 155.356 3.02009C154.627 3.33674 154.021 3.68093 153.539 4.05266C152.961 4.49322 152.472 4.98886 152.073 5.53956L153.105 6.46887C153.436 6.00077 153.835 5.58775 154.303 5.22979C154.702 4.91313 155.205 4.6309 155.811 4.38308C156.416 4.1215 157.132 3.9907 157.958 3.9907C158.757 3.9907 159.493 4.12838 160.168 4.40373C160.843 4.66532 161.435 5.03016 161.944 5.49826C162.453 5.95259 162.866 6.49641 163.183 7.12972C163.514 7.76303 163.734 8.43764 163.844 9.15356H156.203V10.5992H163.844C163.761 11.3426 163.555 12.0448 163.224 12.7056C162.908 13.3527 162.488 13.924 161.965 14.4197C161.455 14.9015 160.856 15.2801 160.168 15.5555C159.493 15.8308 158.757 15.9685 157.958 15.9685C157.132 15.9685 156.409 15.8446 155.79 15.5968C155.17 15.3352 154.654 15.0461 154.241 14.7294C153.759 14.3715 153.346 13.9585 153.002 13.4904L151.969 14.4197C152.396 14.9841 152.906 15.4867 153.498 15.9272C154.007 16.2989 154.627 16.6431 155.356 16.9598ZM141.532 2.75162H139.984V17.2076H141.532V12.9741L144.424 9.87636L149.586 17.2076H151.445L145.456 8.74053L150.929 2.75162H148.967L141.532 10.9089V2.75162ZM166.231 15.762H167.057C167.539 15.2664 167.966 14.6193 168.337 13.8208C168.654 13.1324 168.95 12.2444 169.225 11.1567C169.501 10.0553 169.638 8.69923 169.638 7.08842V2.75162H178.519V15.762H180.274V20.3053H178.725V17.2076H167.78V20.3053H166.231V15.762ZM176.97 15.762V4.19722H171.187V7.08842C171.187 8.67169 171.057 10.0071 170.795 11.0948C170.547 12.1824 170.265 13.0773 169.948 13.7795C169.59 14.5918 169.177 15.2526 168.709 15.762H176.97ZM186.654 16.8359C187.563 17.2214 188.534 17.4141 189.566 17.4141C190.599 17.4141 191.563 17.2214 192.457 16.8359C193.366 16.4504 194.158 15.9203 194.832 15.2457C195.507 14.5711 196.037 13.7864 196.423 12.8915C196.808 11.9828 197.001 11.0122 197.001 9.97961C197.001 8.94704 196.808 7.98331 196.423 7.08842C196.037 6.17975 195.507 5.38812 194.832 4.7135C194.158 4.03889 193.366 3.50884 192.457 3.12334C191.563 2.73785 190.599 2.5451 189.566 2.5451C188.534 2.5451 187.563 2.73785 186.654 3.12334C185.76 3.50884 184.975 4.03889 184.3 4.7135C183.626 5.38812 183.095 6.17975 182.71 7.08842C182.324 7.98331 182.132 8.94704 182.132 9.97961C182.132 11.0122 182.324 11.9828 182.71 12.8915C183.095 13.7864 183.626 14.5711 184.3 15.2457C184.975 15.9203 185.76 16.4504 186.654 16.8359ZM191.879 15.5142C191.163 15.8171 190.392 15.9685 189.566 15.9685C188.74 15.9685 187.969 15.8171 187.253 15.5142C186.537 15.2113 185.911 14.7914 185.374 14.2545C184.851 13.7175 184.438 13.0842 184.135 12.3545C183.832 11.6248 183.681 10.8332 183.681 9.97961C183.681 9.12602 183.832 8.33438 184.135 7.6047C184.438 6.87502 184.851 6.24171 185.374 5.70477C185.911 5.16783 186.537 4.74792 187.253 4.44503C187.969 4.14215 188.74 3.9907 189.566 3.9907C190.392 3.9907 191.163 4.14215 191.879 4.44503C192.595 4.74792 193.215 5.16783 193.738 5.70477C194.275 6.24171 194.695 6.87502 194.998 7.6047C195.3 8.33438 195.452 9.12602 195.452 9.97961C195.452 10.8332 195.3 11.6248 194.998 12.3545C194.695 13.0842 194.275 13.7175 193.738 14.2545C193.215 14.7914 192.595 15.2113 191.879 15.5142ZM103.047 10.161C102.922 10.1124 102.825 10.0812 102.755 10.0673L102.985 9.98398C103.144 9.91455 103.328 9.79998 103.536 9.64029C103.752 9.47365 103.97 9.27229 104.193 9.03622C104.415 8.80015 104.602 8.48424 104.755 8.08847C104.915 7.69271 104.995 7.25181 104.995 6.76578C104.995 5.66875 104.575 4.73835 103.734 3.97459C102.894 3.20389 101.822 2.81854 100.516 2.81854C99.9607 2.81854 99.4226 2.89492 98.9019 3.04767C98.3811 3.19348 97.9611 3.35664 97.6417 3.53717C97.3223 3.71075 97.0237 3.9121 96.746 4.14123C96.4683 4.37036 96.2912 4.53005 96.2148 4.62032C96.1385 4.71058 96.0795 4.78348 96.0378 4.83903L97.1001 6.01591L97.2459 5.84927C97.3362 5.73124 97.475 5.5889 97.6625 5.42226C97.8569 5.24868 98.0826 5.07857 98.3395 4.91193C98.5964 4.73835 98.9192 4.59601 99.3081 4.48492C99.7038 4.36689 100.107 4.30787 100.516 4.30787C101.398 4.30787 102.096 4.54047 102.61 5.00567C103.13 5.47086 103.391 6.05757 103.391 6.76578C103.391 7.57814 103.134 8.22734 102.62 8.71336C102.113 9.19245 101.412 9.43199 100.516 9.43199H99.0164V10.9213H100.516C101.565 10.9213 102.412 11.2025 103.057 11.7649C103.71 12.3273 104.036 13.0078 104.036 13.8062C104.036 14.6255 103.72 15.3095 103.089 15.858C102.457 16.4065 101.599 16.6807 100.516 16.6807C100.016 16.6807 99.5372 16.6183 99.0789 16.4933C98.6276 16.3614 98.2596 16.2155 97.975 16.0559C97.6903 15.8892 97.4264 15.7052 97.1834 15.5039C96.9404 15.2956 96.7842 15.1498 96.7148 15.0664C96.6453 14.9762 96.5967 14.9102 96.5689 14.8686L95.4962 15.9309L95.6733 16.1704C95.7982 16.3232 96.0031 16.5106 96.2877 16.7328C96.5724 16.955 96.8988 17.1737 97.2667 17.389C97.6417 17.5973 98.1173 17.7812 98.6936 17.9409C99.2699 18.0937 99.8774 18.1701 100.516 18.1701C102.009 18.1701 103.217 17.7396 104.141 16.8786C105.064 16.0107 105.526 14.9866 105.526 13.8062C105.526 13.223 105.425 12.6988 105.224 12.2336C105.029 11.7615 104.811 11.4004 104.568 11.1504C104.325 10.9005 104.043 10.6852 103.724 10.5047C103.405 10.3173 103.179 10.2027 103.047 10.161ZM116.774 9.77568C115.823 8.8314 114.628 8.35926 113.191 8.35926C112.538 8.35926 112.007 8.43216 111.598 8.57797L115.118 3.02684H113.514L109.036 10.0673L108.754 10.4526C108.588 10.7234 108.414 11.1261 108.234 11.6608C108.06 12.1885 107.973 12.7231 107.973 13.2647C107.973 14.6603 108.456 15.8267 109.421 16.7641C110.386 17.7014 111.608 18.1701 113.087 18.1701C114.566 18.1701 115.788 17.7014 116.753 16.7641C117.725 15.8267 118.211 14.6637 118.211 13.2751C118.211 11.8795 117.732 10.713 116.774 9.77568ZM116.607 13.2751C116.607 14.2957 116.288 15.1185 115.649 15.7434C115.01 16.3683 114.156 16.6807 113.087 16.6807C112.025 16.6807 111.171 16.3683 110.525 15.7434C109.886 15.1185 109.567 14.2957 109.567 13.2751C109.567 12.2475 109.886 11.4212 110.525 10.7963C111.171 10.1714 112.025 9.859 113.087 9.859C114.156 9.859 115.01 10.1714 115.649 10.7963C116.288 11.4212 116.607 12.2475 116.607 13.2751ZM125.991 8.35926C127.428 8.35926 128.622 8.8314 129.574 9.77568C130.525 10.713 131.001 11.876 131.001 13.2647C131.001 14.7158 130.532 15.8962 129.595 16.8057C128.657 17.7153 127.421 18.1701 125.887 18.1701C125.276 18.1701 124.686 18.0937 124.116 17.9409C123.547 17.7812 123.078 17.5973 122.71 17.389C122.349 17.1737 122.03 16.955 121.752 16.7328C121.474 16.5106 121.28 16.3232 121.169 16.1704L120.981 15.9309L122.044 14.8686C122.072 14.9102 122.12 14.9762 122.19 15.0664C122.266 15.1498 122.422 15.2956 122.658 15.5039C122.901 15.7052 123.158 15.8892 123.429 16.0559C123.7 16.2155 124.054 16.3614 124.491 16.4933C124.936 16.6183 125.401 16.6807 125.887 16.6807C126.956 16.6807 127.81 16.3683 128.449 15.7434C129.088 15.1185 129.407 14.2923 129.407 13.2647C129.407 12.2579 129.088 11.4386 128.449 10.8068C127.817 10.1749 126.998 9.859 125.991 9.859C125.324 9.859 124.713 9.99439 124.158 10.2652C123.602 10.536 123.217 10.7963 123.002 11.0463L122.679 11.4525H121.513L122.044 3.02684H130.042V4.52658H123.429L123.106 9.21328C123.189 9.15773 123.307 9.08136 123.46 8.98415C123.613 8.88 123.936 8.75155 124.429 8.5988C124.929 8.4391 125.449 8.35926 125.991 8.35926ZM43.0741 17.9623V15.156H35.1645V11.9189H41.1673V9.11051H35.1645V6.18888H42.8572V3.36835H31.9933V17.9623H43.0741ZM46.589 3.36835V17.9603H56.608V15.1519H49.7602V3.36835H46.589ZM72.5124 3.36835H75.3133V17.9623H72.1523V8.23301L67.4057 14.2057L62.6694 8.27345V17.9623H59.4982V3.36835H62.3502L67.4057 9.72921L72.5124 3.36835ZM81.0088 17.9623L82.2753 14.5231H87.9712L89.2376 17.9623H92.6154L86.807 3.36835H83.4394L77.631 17.9623H81.0088ZM83.3269 11.8158L85.1293 7.0219L86.9216 11.8158H83.3269Z" fill="#233255"/>
          </svg>`

async function notification_set(): Promise<void> {
  if (Context.data.user) {
    let search_result = await Context.fields.staff.app.search()
      .where((f, q) => q.and(
        f.ext_user.eq(Context.data.user!),
        f.__deletedAt.eq(null)
      ))
      .first();
    Context.data.staff = search_result;
    // if (staff.data.__status!.code == staff.fields.__status.variants.invited.code) {
    //   Context.data.notification = staff.fields.notification.variants.email;
    // }
    // else {
    // }
    // if (staff.data.__status!.code == staff.fields.__status.variants.invited.code) {
    //   Context.data.notification = staff.fields.notification.variants.email;
    // }
    // else {
    //   Context.data.notification = staff.data.notification;
    // }
  };
  const alternativeNotification = await Context.fields.settings_app.app.search().where(f => f.code.eq("alternate_notifications")).first();
  await setTimerInterval();

  if (alternativeNotification) {
    Context.data.alternative_notification = alternativeNotification.data.status;
  };
}

async function alert(): Promise<void> {
  if (!Context.data.button_name)
    Context.data.button_name = 'Войти';
  Context.data.alert_body = Context.data.alert_body!.replace('портал', `<a href="${Context.data.portal_link}">портал</a>`);
  if (!Context.data.alert_url)
    Context.data.alert_url = Context.data.portal_link;
  await alert_create(Context.data.alert_head!, Context.data.alert_body!, Context.data.alert_url!, Context.data.button_name)
  await alert_sms_create(Context.data.alert_url!);
}

async function alert_create(head: string, text: string, url: string, button_name: string): Promise<void> {
  Context.data.notification_text = `<div style="font-family: Helvetica, Helvetica Neue, Arial, sans-serif;  width: 100%;  display: flex;  flex-direction: column;  align-items: center;">
    <div style="max-width: 720px;  padding: 20px 40px;">
      <div style="margin: 0 0 50px;  display: flex;">
        <div style="display: flex;  align-items: flex-end; padding: 0 0 5px 0;">
          ${defaultLogo}
        </div>
      </div>
      <div style="padding: 0 0 40px; border-bottom: 1px solid #000;">
        <p style="font-size: 24px;  color: #2a75b5;  font-weight: bold;  margin: 0 0 40px;">${head}</p>
        <p style="font-size: 18px;  color: #000000;  margin: 0 0 20px;">${text}</p>
        <a href="${url}" style="color: #fff; background-color: #146EBC; border-radius: 32px; padding: 16px 48px;text-decoration: none; font-size: 18px;font-weight: 700; display: inline-block;text-align: center; margin: 24px 0; min-width: 100px;">
          ${button_name}
        </a>
      </div>
      <div style="padding: 20px 0 0;">
        <p style="margin: 0; font-size: 14px; line-height: 18px; color: #979797;">Вы получили данное письмо, потому что данный e-mail был указан при регистрации в ELMA КЭДО. Если это письмо попало к вам по ошибке, пожалуйста, проигнорируйте его.</p>
      </div>
    </div>
</div>`
}

async function alert_sms_create(url: string): Promise<void> {
  if (Context.data.notification_text_for_sms) {
    Context.data.notification_text_for_sms = Context.data.notification_text_for_sms.replace('(ссылка)', url);
  }
}

async function checkIfDocExists(): Promise<boolean> {
  return !!Context.data.doc_app && Context.data.alert_delay_required!;
}

async function checkDocSign(): Promise<void> {
  const docApp = await Context.data.doc_app!.fetch();
  const staff = await Context.data.staff!.fetch();
  const currentUser = await staff.data.ext_user!.fetch();
  const source = docApp.data.__sourceRef ? await docApp.data.__sourceRef.fetch() : docApp;
  Context.data.alert_body = `Не забудьте зайти на портал и подписать ${source.data.__name}`;
  Context.data.alert_head = 'Не забудьте подписать документ';
  Context.data.notification_text_for_sms = `Не забудьте зайти на портал и подписать документ.`
  await alert_create(Context.data.alert_head, Context.data.alert_body, Context.data.alert_url!, Context.data.button_name!)
  await alert_sms_create(Context.data.alert_url!);
  try {
    const signHistory = await source.getSignHistory();
    const fileSign = signHistory.filter((sign: any) => {
      return sign.type === "file"
    })
    let dataSigns = await source.getDataSigns()
    let sign = dataSigns.find((s: any) => s.type === "file");
    let hash = sign.hash;
    for (let i = 0; i < fileSign.length; i++) {
      const signCheck = fileSign[i].signs.find((digitalSign: any) =>
        (digitalSign.data.__userID === currentUser.data.__id || digitalSign.__userID === currentUser.data.__id)
        && (!!digitalSign.data.sign || !!digitalSign.sign)
        && (digitalSign.data.hash === hash || digitalSign.content === hash)
      );
      if (signCheck) {
        Context.data.doc_app_signed = true;
        Context.data.alert_delay_required = false;
        return
      };
    };
  } catch {
    Context.data.alert_delay_required = false;
    return;
  };
}

async function setTimerInterval(): Promise<void> {
  const remindIntervalMinutes = await Context.fields.settings_app.app.search().where(f => f.code.eq("remind_interval")).first();
  if (remindIntervalMinutes) {
    if (!remindIntervalMinutes.data.status) {
      Context.data.alert_delay_required = false;
      return
    }
    const minutesDuration = new Duration(remindIntervalMinutes.data.quantity!, "minutes");
    const remindInterval = new Datetime().add(minutesDuration);
    Context.data.remind_interval = remindInterval;
  } else {
    const defaultMinutes = new Duration(20, "minutes");
    const now = new Datetime().add(defaultMinutes);
    Context.data.remind_interval = now;
  };
}

async function checkProductionSchedule(): Promise<boolean> {
    const companySchedule = await System.productionSchedule.getGeneralSettings()
    const companyWeekends = Object.keys(companySchedule.weekends).filter(day => companySchedule.weekends[day as keyof typeof companySchedule.weekends]);
    const today = new Date();
    const weekday = today.toLocaleDateString("en-EN", {weekday: "long"}).toLowerCase();
    const timeForWorkStart = new Duration(companySchedule.daySchedule.workingTime.from, "seconds");
    const timeForWorkEnd = new Duration(companySchedule.daySchedule.workingTime.to, "seconds");
    const workStart = new Datetime().truncateTime().add(timeForWorkStart);
    const workEnd = new Datetime().truncateTime().add(timeForWorkEnd);
    return companyWeekends.indexOf(weekday) != -1 && new Datetime(today).after(workStart) && new Datetime(today).before(workEnd);
}
