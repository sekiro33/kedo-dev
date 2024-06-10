/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function get_creator(): Promise<void> {
  const staff = await Context.data.staff!.fetch();
  const organisation = await staff.data.organization!.fetch();
  if (!organisation.data.provider && (!organisation.data.sign_provider || organisation.data.sign_provider.length < 1)) {
    throw new Error(`Не заполнен провайдер у организации ${organisation.data.__name}`);
  };

  Context.data.api_key = organisation.data.api_key;

  if (organisation.data.sign_provider && organisation.data.sign_provider.length > 0) {
    const provider = organisation.data.sign_provider
    if (provider && (provider.map(p => p.code).indexOf("kontur") !== -1 || provider.map(p => p.code).indexOf("sign_me") !== -1)) {
      Context.data.provider = provider.map(p => p.code).indexOf("kontur") !== -1 ? Context.fields.provider.variants.kontur : Context.fields.provider.variants.sign_me;
    } else {
      Context.data.elctronic_sign_not_required = true;
      return;
    };
  } else {
    const provider = organisation.data.provider;
    if (provider && provider!.find(p => p.code === "kontur")) {
      Context.data.provider = Context.fields.provider.variants.kontur
    } else {
      Context.data.provider = Context.fields.provider.variants.sign_me
    }
  }

  const entity = await organisation.data.entity!.fetch();

  Context.data.user_status = staff.data.__status!.code;
  Context.data.user = staff.data.ext_user;
  Context.data.hr_user = staff.data.staff_member;
  if (staff.data.sex == true) {
    Context.data.line_for_issuing_UNEP = 'M';
    Context.data.gender = Context.fields.gender.variants.m
  } else {
    Context.data.line_for_issuing_UNEP = 'F';
    Context.data.gender = Context.fields.gender.variants.f
  }
  Context.data.date_of_birth = staff.data.date_of_birth;
  Context.data.phone = staff.data.phone;
  Context.data.elektronnaya_pochta = staff.data.email;
  Context.data.line_name = staff.data.full_name!.firstname;
  Context.data.line_surname = staff.data.full_name!.lastname;
  Context.data.line_middle_name = staff.data.full_name!.middlename;
  Context.data.line_region = staff.data.region;
  Context.data.city = staff.data.city;
  Context.data.line_country = 'ru';
  Context.data.snils = staff.data.snils;
  Context.data.line_OGRN = entity.data._ogrn ? entity.data._ogrn : undefined;
  Context.data.series = staff.data.passport_series;
  Context.data.number = staff.data.passport_number;
  Context.data.date_of_issue = staff.data.date_of_issue;
  Context.data.issued_by = staff.data.issued_by;
  Context.data.tin = staff.data.inn;
  Context.data.department_code = staff.data.passport_department_code;
  const start = staff.data.email!.email.indexOf('+');
  if (start != -1) {
    let reduce = staff.data.email!.email.substring(start, staff.data.email!.email.indexOf('@'));
    Context.data.elektronnaya_pochta = { email: staff.data.email!.email.replace(reduce, ''), type: EmailType.Work };
  } else {
    Context.data.elektronnaya_pochta = staff.data.email;
  }
  if (staff.data.russian_passport) {
    Context.data.document_type = { name: "Паспорт", code: "passport" };
  } else {
    Context.data.document_type = { name: "Иной документ", code: "other_identity" };
  };
  Context.data.first_page = staff.data.passport_page_with_photo_and_data;
  Context.data.second_page = staff.data.the_passport_page_with_current_registration;
  Context.data.skan_snils = staff.data.snils_file;
  Context.data.issue_confirm_type_kontur = organisation.data.issue_confirm_type_kontur;

  const settings = await Namespace.app.settings.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
  const nep = settings.find(f => f.data.code == 'new_method_create_sign');
  Context.data.new_method_create_sign = nep ? nep.data.status : false
}

async function certificate_date_change(): Promise<void> {
  const staff = await Context.data.staff!.fetch();
  staff.data.date_receipt_signing_certificate = new Datetime().getDate();
  await staff.save();
}

async function getUserStatus(): Promise<void> {
  const user = await Context.data.staff!.fetch();
  if (user.data.__status!.code === "signed_documents") {
    const domen = await Namespace.app.settings.search()
      .where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.code.eq('domen')
      )).first();
    Context.data.portal_link = `https://${domen!.data.value}/_portal/kedo_ext/user_page`
  };
};

async function checkUserStatus(): Promise<boolean> {
  const user = await Context.data.staff!.fetch();
  return user.data.__status!.code === "signed_documents";
};

async function checkContextStatus(): Promise<boolean> {
  return Context.data.user_status === "signed_documents";
};

async function checkActiveProcess(): Promise<boolean> {
  if (!Context.data.staff) {
    throw new Error("Context.data.staff is undefined");
  }

  const signme_release_active_process = await Application.processes.signme_release._searchInstances()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.__id.neq(Context.id),
      g.or(
        f.__state.like(ProcessInstanceState.exec),
        f.__state.like(ProcessInstanceState.wait)
      ),
      (f as any).__item.eq(Context.data.staff)
    ))
    .size(100)
    .all();

  if (signme_release_active_process && signme_release_active_process.length > 0) {
    return true;
  }

  return false;
}
