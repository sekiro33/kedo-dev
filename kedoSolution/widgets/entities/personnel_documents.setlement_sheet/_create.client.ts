/* Client scripts module */
async function onInit():Promise<void>
{
    Context.data.responsible_user = await System.users.getCurrentUser();
}