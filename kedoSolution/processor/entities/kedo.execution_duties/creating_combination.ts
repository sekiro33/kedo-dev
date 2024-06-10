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
	if (!Context.data.execution_duties) {
		throw new Error("Context.data.execution_duties is undefined");
	}

	const execution_duties = await Context.data.execution_duties.fetch();

	if (execution_duties.data.type_combination) {
		const type_combination = await execution_duties.data.type_combination.fetch();
		
		// Только замещение
		if (type_combination.data.code === "substitution_only") {
			return true;
		}
	}

	return false;
}
