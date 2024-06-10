/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function createReplacement(): Promise<void> {
	if (!Context.data.execution_duties) {
		throw new Error("Context.data.execution_duties is undefined");
	}

	const execution_duties = await Context.data.execution_duties.fetch();

	const replacement_staff = await execution_duties.data.substitute!.fetch()
	const absent = await execution_duties.data.staff!.fetch();
	const newReplacement = System.replacements.create();

	newReplacement.data.type = newReplacement.fields.type.variants.reassign;
	newReplacement.data.absent = absent.data.ext_user;
	newReplacement.data.replacement = replacement_staff.data.ext_user;
	newReplacement.data.begin = execution_duties.data.start_date;
	newReplacement.data.end = execution_duties.data.end_date;

	await newReplacement.save();

	execution_duties.data.replacement_id = newReplacement.id;
	await execution_duties.save()

	Context.data.alert_body = `Вас назначили как временно замещающего для сотрудника ${absent.data.__name} с ${execution_duties.data.start_day_line!} по ${execution_duties.data.end_date_line!}`;

}