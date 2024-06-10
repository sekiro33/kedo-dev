/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function check_create_result(): Promise<boolean> {
	if (Context.data.execution_duties) {
		let app = await Context.data.execution_duties.fetch();
		if (app.data.create_result) {
			if (app.data.create_result.code == app.fields.create_result.variants.cancel.code) {
				return true;
			} else {
				return false;
			}
		} else {
			return false
		}
	} else {
		return false;
	}
}
async function checkTypeCombination(): Promise<boolean> {
	const app = await Context.data.execution_duties!.fetch();
    if (app.data.type_combination) {
        const type_combination = await app.data.type_combination!.fetch();
        if (type_combination.data.code == 'substitution_only') {
			return true
		}
	}
	return false
}
