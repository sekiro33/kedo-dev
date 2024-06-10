
async function updateContext(): Promise<void> {
    Context.data.is_agreement = true;
}



async function checkCurrentUser(): Promise<boolean> {
    if (Context.data.director_user && Context.data.signatory_user) {
        const director = await Context.data.director_user.fetch();
        const signatory = await Context.data.signatory_user.fetch();
        if (director.data.__id == signatory.data.__id) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}
