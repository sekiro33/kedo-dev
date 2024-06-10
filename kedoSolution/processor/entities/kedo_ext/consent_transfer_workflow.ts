/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getStaff(): Promise<void> {
  const staff = await Context.data.staff!.fetch();
  Context.data.staff_user = staff.data.ext_user;
  Context.data.current_date = new TDate;
}

async function successfulApproval(): Promise<void> {
  const transfer_application = await Context.data.transfer_application!.fetch();
  if (transfer_application.data.transfer_approve && transfer_application.data.transfer_approve.length > 0) {
    transfer_application.data.transfer_approve.push(Context.data.transfer_approve!);
  } else {
    transfer_application.data.transfer_approve = [];
    transfer_application.data.transfer_approve.push(Context.data.transfer_approve!);
  }
  await transfer_application.save();
}

async function set_contract_filed(): Promise<void> {
  let transfer_approve = await Context.data.transfer_approve!.fetch();
  transfer_approve.data.line_status = `${transfer_approve.data.__status!.code};${transfer_approve.data.__status!.name}`;
  await transfer_approve.save();
}

async function set_file_name_filed(): Promise<void> {
  let transfer_approve = await Context.data.transfer_approve!.fetch();
  transfer_approve.data.line_file_name = (await transfer_approve.data.__file!.fetch()).data.__name;
  await transfer_approve.save();
}

async function setStatusSigning(): Promise<void> {
  if (!Context.data.transfer_approve) {
    throw new Error("Context.data.transfer_approve is undefined");
  }

  const obj_status = {
    app: {
      namespace: Context.data.transfer_approve.namespace,
      code: Context.data.transfer_approve.code,
      id: Context.data.transfer_approve.id,
    },
    status: "signing",
  };

  Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusSigned(): Promise<void> {
  if (!Context.data.transfer_approve) {
    throw new Error("Context.data.transfer_approve is undefined");
  }

  const obj_status = {
    app: {
      namespace: Context.data.transfer_approve.namespace,
      code: Context.data.transfer_approve.code,
      id: Context.data.transfer_approve.id,
    },
    status: "signed",
  };

  Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusCancelled(): Promise<void> {
  if (!Context.data.transfer_approve) {
    throw new Error("Context.data.transfer_approve is undefined");
  }

  const obj_status = {
    app: {
      namespace: Context.data.transfer_approve.namespace,
      code: Context.data.transfer_approve.code,
      id: Context.data.transfer_approve.id,
    },
    status: "cancelled",
  };

  Context.data.kedo_status = JSON.stringify(obj_status);
}
