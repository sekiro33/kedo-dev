/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function prepareData(): Promise<void> {
    if (Context.data.staff) {
        const staff = await Context.data.staff!.fetch();
        if (staff.data.structural_subdivision) {
            Context.data.division = staff.data.structural_subdivision;
        }
        if (staff.data.position) {
            Context.data.position = staff.data.position;
        }
        if (staff.data.list_sign_lna && staff.data.list_sign_lna.length > 0) {
            let index = 0
            for (let item of staff.data.list_sign_lna) {
                const lna = await item.fetch();
                if (lna.data.list_acquaintances && lna.data.list_acquaintances.length > 0) {
                    const row_lna = lna.data.list_acquaintances.find(f=>f.staff.id == staff.id);
                    if (row_lna) {
                        const date_review = row_lna.date_review;
                        const row_report = Context.data.list_lna!.insert();
                        index += 1;
                        row_report.number = index;
                        row_report.lna = item;
                        row_report.date_review = 'Ознакомлен,' + date_review.format('DD.MM.YYYY') + ' г.'
                    }
                }
                
            }
            Context.data.list_lna = Context.data.list_lna;          

        } 
    }
}
