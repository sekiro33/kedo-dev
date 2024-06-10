/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function set_contract_filed(): Promise<void> {
  let order_for_transfer = await Context.data.order_for_transfer!.fetch();
  order_for_transfer.data.line_status = `${order_for_transfer.data.__status!.code};${order_for_transfer.data.__status!.name}`;
  await order_for_transfer.save();
}

async function createStatusObj(app: any, status: string): Promise<void> {  
    const obj_status = {
        'app' : {
            'namespace' : app.namespace,
            'code'      : app.code,
            'id'        : app.id,
        },
        'status'    : status,
    }
    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function createStatusAppChiefDocSigning(): Promise<void> {
    createStatusObj(Context.data.application_transfer, 'chief_doc_signing');
}
async function createStatusAppStaffDocSigning(): Promise<void> {
    createStatusObj(Context.data.application_transfer, 'staff_doc_signing');
}
async function createStatusAppPaperPrepare(): Promise<void> {
    createStatusObj(Context.data.application_transfer, 'paper_prepare');
}
async function createStatusAppPaperSigned(): Promise<void> {
    createStatusObj(Context.data.application_transfer, 'paper_signed');
}
async function createStatusAppCorrection(): Promise<void> {
    createStatusObj(Context.data.application_transfer, 'correction');
}
async function createStatusAppOrderSigned(): Promise<void> {
    createStatusObj(Context.data.application_transfer, 'order_signed');
}

async function createStatusCanceled(): Promise<void> {
    createStatusObj(Context.data.order_for_transfer, 'cancelled');
}
async function createStatusChiefOrderSigning(): Promise<void> {
    createStatusObj(Context.data.order_for_transfer, 'chief_order_signing');
}
async function createStatusStaffOrderSigning(): Promise<void> {
    createStatusObj(Context.data.order_for_transfer, 'staff_order_signing');
}
async function createStatusSigned(): Promise<void> {
    createStatusObj(Context.data.order_for_transfer, 'signed');
}
async function createStatusCorrection(): Promise<void> {
    createStatusObj(Context.data.order_for_transfer, 'correction');
}
async function createStatusPaperPrepare(): Promise<void> {
    createStatusObj(Context.data.order_for_transfer, 'paper_prepare');
}
async function createStatusPaperSigned(): Promise<void> {
    createStatusObj(Context.data.order_for_transfer, 'paper_signed');
}

// async function setStatusSigning(): Promise<void> {
//   if (!Context.data.order_for_transfer) {
//     throw new Error("Context.data.order_for_transfer is undefined");
//   }

//   const obj_status = {
//     app: {
//       namespace: Context.data.order_for_transfer.namespace,
//       code: Context.data.order_for_transfer.code,
//       id: Context.data.order_for_transfer.id,
//     },
//     status: "signing",
//   };

//   Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function setStatusCancelled(): Promise<void> {
//   if (!Context.data.order_for_transfer) {
//     throw new Error("Context.data.order_for_transfer is undefined");
//   }

//   const obj_status = {
//     app: {
//       namespace: Context.data.order_for_transfer.namespace,
//       code: Context.data.order_for_transfer.code,
//       id: Context.data.order_for_transfer.id,
//     },
//     status: "cancelled",
//   };

//   Context.data.kedo_status = JSON.stringify(obj_status);
// }

// async function setStatusSigned(): Promise<void> {
//   if (!Context.data.order_for_transfer) {
//     throw new Error("Context.data.order_for_transfer is undefined");
//   }

//   const obj_status = {
//     app: {
//       namespace: Context.data.order_for_transfer.namespace,
//       code: Context.data.order_for_transfer.code,
//       id: Context.data.order_for_transfer.id,
//     },
//     status: "signed",
//   };

//   Context.data.kedo_status = JSON.stringify(obj_status);
// }

async function setDeadlineSigning(): Promise<void> {
  Context.data.deadline_signing = await System.productionSchedule.calcDate(new Datetime,new Duration(4,'hours'));
}

async function getSigners(): Promise<void> {
    const kedo_settings = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('head_signing_notification')
        ))
        .first();
    Context.data.head_signing_notification = kedo_settings ? kedo_settings.data.status : false;
    const order = await Context.data.order_for_transfer?.fetch();
    const staff = await order?.data.staff?.fetch();
    const organization_staff = await staff?.data.organization?.fetch();
    Context.data.signers_app = organization_staff?.data.signatories;
}
