// /* Server scripts module */
// async function search_entity():Promise<void>
// {
//     ViewContext.data.money_is_need = false;
//     ViewContext.data.money_is_required = true;
//     ViewContext.data.staff_hide = true;

//     let user = await System.users.getCurrentUser();
//     Context.data.staff = await Context.fields.staff.app.search().where(f => f.email.eq(user.data.email!)).first();
//     if (Context.data.staff) {
//         Context.data.organization = (await Context.data.staff.fetch()).data.entity!;
//         ViewContext.data.money_is_required = true;
//         ViewContext.data.money_is_required = false;
//     }
//     else {
//         ViewContext.data.staff_hide = false;
//     }
// }