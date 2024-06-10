
async function get_user(): Promise<void> {
  Context.data.external_user = Context.data.__createdBy;
  const user = await Context.data.external_user.fetch();
  Context.data.staff = await Context.fields.employee.app.search()
    .where((f, q) => q.and
      (f.email.eq(user.data.email!),
        f.__deletedAt.eq(null)
      ))
    .first();
}

async function status_check(): Promise<boolean> {
  const staff = await Context.data.staff!.fetch();
  if (staff.data.__status == staff.fields.__status.variants.waiting_for_document_editing) {
    Context.data.need_a_regeneration = true;
    return true;
  }
  return false;
}

async function comment_clear(): Promise<void> {
  Context.data.comment = '';
}

async function get_date(): Promise<void> {
  Context.data.the_current_date = new Datetime().format('DD.MM.YYYY')
}

async function set_file_name_filed(): Promise<void> {
  let statement = await Context.data.agreement_between_participants_of_electronic_interaction!.fetch();
  statement.data.line_file_name = (await statement.data.__file!.fetch()).data.__name;
  statement.data.line_status = statement.data.__status!.code + ';' + statement.data.__status!.name;
  await statement.save();
}

async function checkOldDocs(): Promise<void> {
  let oldSoev = await Namespace.app.electronic_interaction_agreement.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.staff.link(Context.data.employee!)
    ))
    .first();
  if (!!oldSoev) {
    await oldSoev.delete();
  }
}

async function checkStaffFields(): Promise<void> {
  Context.data.error_message = 'В карточке Сотрудника найдены пустые поля:\n';
  Context.data.fullness_of_fields = true;
  const staff = await Context.data.employee!.fetch();
  if (!staff.data.full_name) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'ФИО;\n';
  }
  if (!staff.data.inn) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'ИНН;\n';
  }
  if (!staff.data.snils) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'СНИЛС;\n';

  }
  if (!staff.data.address) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Адрес регистрации;\n';
  }
  if (!staff.data.passport_series) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Серия паспорта;\n';
  }
  if (!staff.data.passport_number) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Номер паспорта;\n';
  }
  if (!staff.data.issued_by) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Кем выдан;\n';

  }
  if (!staff.data.passport_department_code) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Код подразделения;\n';
  }
  if (!staff.data.date_of_issue) {
    Context.data.fullness_of_fields = false;
    Context.data.error_message += 'Дата выдачи;\n';
  }
}

async function checkExistingAggregateApp(): Promise<boolean> {
  const aggregateApp = await Namespace.app.employment_app.search().where((f, g) => g.and(
    f.__deletedAt.eq(null),
    f.staff.link(Context.data.employee!)
  )).first();
  if (aggregateApp) {
    Context.data.aggregate_app = aggregateApp;
    return true;
  };
  return false;
}

async function generateAppName(): Promise<void> {
  const staff = await Context.data.employee!.fetch();
  const name = staff.data.__name
  const appName = `Документы трудоустройства (${name})`;
  Context.data.app_name = appName;
}

async function setStatusApproval(): Promise<void> {
  if (!Context.data.agreement_between_participants_of_electronic_interaction) {
    throw new Error("Context.data.agreement_between_participants_of_electronic_interaction is undefined");
  }

  const obj_status = {
    app: {
      namespace: Context.data.agreement_between_participants_of_electronic_interaction.namespace,
      code: Context.data.agreement_between_participants_of_electronic_interaction.code,
      id: Context.data.agreement_between_participants_of_electronic_interaction.id,
    },
    status: "approval",
  };

  Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusCancelled(): Promise<void> {
  if (!Context.data.agreement_between_participants_of_electronic_interaction) {
    throw new Error("Context.data.agreement_between_participants_of_electronic_interaction is undefined");
  }

  const obj_status = {
    app: {
      namespace: Context.data.agreement_between_participants_of_electronic_interaction.namespace,
      code: Context.data.agreement_between_participants_of_electronic_interaction.code,
      id: Context.data.agreement_between_participants_of_electronic_interaction.id,
    },
    status: "cancelled",
  };

  Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusSigning(): Promise<void> {
  if (!Context.data.agreement_between_participants_of_electronic_interaction) {
    throw new Error("Context.data.agreement_between_participants_of_electronic_interaction is undefined");
  }

  const obj_status = {
    app: {
      namespace: Context.data.agreement_between_participants_of_electronic_interaction.namespace,
      code: Context.data.agreement_between_participants_of_electronic_interaction.code,
      id: Context.data.agreement_between_participants_of_electronic_interaction.id,
    },
    status: "signing",
  };

  Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusSigned(): Promise<void> {
  if (!Context.data.agreement_between_participants_of_electronic_interaction) {
    throw new Error("Context.data.agreement_between_participants_of_electronic_interaction is undefined");
  }

  const obj_status = {
    app: {
      namespace: Context.data.agreement_between_participants_of_electronic_interaction.namespace,
      code: Context.data.agreement_between_participants_of_electronic_interaction.code,
      id: Context.data.agreement_between_participants_of_electronic_interaction.id,
    },
    status: "signed",
  };

  Context.data.kedo_status = JSON.stringify(obj_status);
}
