

async function setCancelDocName(): Promise<void> {
    if (Context.data.agreement_file) {
        const doc_name = await Context.data.agreement_file.fetch();
        Context.data.agreement_name = doc_name.data.__name;
    }
}
async function generateFile(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff.fetch();

        Context.data.staff_full_name = `${staff.data.surname} ${staff.data.name} ${staff.data.middlename}`;

        if (staff.data.position) {
            const position = await staff.data.position.fetch();

            Context.data.staff_position = position.data.__name;
        }
    }

    if (Context.data.director) {
        const director = await Context.data.director.fetch();

        Context.data.director_full_name = `${director.data.surname} ${director.data.name} ${director.data.middlename}`;

        if (director.data.position) {
            const position = await director.data.position.fetch();

            Context.data.director_position = position.data.__name;
        }
    }
}
