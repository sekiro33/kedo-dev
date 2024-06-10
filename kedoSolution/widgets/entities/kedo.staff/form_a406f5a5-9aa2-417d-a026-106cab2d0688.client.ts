/* Client scripts module */
async function onInit():Promise<void>
{
    if(!Context.data.staff)
    {
        let user = await System.users.getCurrentUser();
        let staff = await Context.fields.staff.app.search().where(f=> f.ext_user.eq(user)).first();
        if(staff)
        Context.data.staff = staff;
    }
}