/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function set_contract_filed(): Promise<void> {
  if (Context.data.additional_transfer_agreement) {
    let additional_transfer_agreement = await Context.data.additional_transfer_agreement.fetch();
    additional_transfer_agreement.data.line_status = `${additional_transfer_agreement.data.__status!.code};${additional_transfer_agreement.data.__status!.name}`;
    await additional_transfer_agreement.save();
  }

  const transfer_order = await Context.data.transfer_order!.fetch();
  transfer_order.data.line_file_name = `${transfer_order.data.__status!.code};${transfer_order.data.__status!.name}`;
  await transfer_order.save();
}

async function set_file_name_filed(): Promise<void> {
  if (Context.data.additional_transfer_agreement) {
    const additional_transfer_agreement = await Context.data.additional_transfer_agreement.fetch();
    additional_transfer_agreement.data.line_file_name = (await additional_transfer_agreement.data.__file!.fetch()).data.__name;
    await additional_transfer_agreement.save();
  }

  const transfer_order = await Context.data.transfer_order!.fetch();
  transfer_order.data.line_file_name = (await transfer_order.data.__file!.fetch()).data.__name;
  await transfer_order.save();
}

async function get_labor_contract(): Promise<void> {
  const labor_contract = await Context.fields.labor_contract.app.search()
    .where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.staff.link(Context.data.staff!)
    ))
    .first();

  if (labor_contract) {
    Context.data.labor_contract = labor_contract;
    Context.data.employment_contract_date = labor_contract.data.__createdAt.getDate();
    Context.data.employment_contract_number = labor_contract.data.__index!.toString();
  }
}

async function getEmploymentPlace(): Promise<void> {
    if (!Context.data.staff) {
      throw new Error("staff is undefined");
    }

    if (Context.data.transfer_table && Context.data.transfer_table.length > 0) {
      const row = Context.data.transfer_table.find(field => field.transfer_staff.id == Context.data.staff!.id);

      if (row) {
        const place = await row.transfer_employment_place.fetch();

        Context.data.employment_place = row.transfer_employment_place;
        Context.data.current_posotion = place.data.position;
      }
    }
}
