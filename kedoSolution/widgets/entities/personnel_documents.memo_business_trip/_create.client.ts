// /* Client scripts module */
 async function onInit(): Promise<void> {
     ViewContext.data.staff_hide = true;
    let user = await System.users.getCurrentUser();
     let is_ext_user: boolean | undefined = undefined;
     Context.data.staff = await Context.fields.staff.app.search().where(f => f.ext_user.eq(user)).first();
  /*  if (!Context.data.staff) {
         ViewContext.data.staff_hide = false;
    }
    let date = new Date();
    date.getTimezoneOffset();
     Context.data.start_line = (-(date.getTimezoneOffset() / 60)).toString();*/
 }
// async function duration_calculate(): Promise<void> {
//     const time = new TTime(0, 0, 0, 0);
//     const start = Context.data.start_date? Context.data.start_date.asDatetime(time): undefined ;
//     const end = Context.data.end_date? Context.data.end_date.asDatetime(time): undefined
//     if (start && end) {
//         const duration = end.sub(start);
//         Context.data.duration = Math.floor(duration.hours / 24)+1;
//     }
// }
