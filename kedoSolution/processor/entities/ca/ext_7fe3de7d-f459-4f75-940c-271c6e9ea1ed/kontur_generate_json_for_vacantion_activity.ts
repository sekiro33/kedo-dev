//Справка БК / Предоставление сведений
interface IKonturVacationData {
	processID: string,
	employeeID: string,
	firstName: string,
	lastName: string,
	middleName: string,
	jobID: string,
	incomeStatementFile: string
}

async function action(): Promise<void> {
	const employeeApp = Namespace.params.fields.employee_app.app;

	let employee = await employeeApp.search().where((f, g) => g.and (
		f.__deletedAt.eq(null),
		f.__id.eq(Context.data.employee_id as string)
	)).first();

	if (!employee){
		throw new Error ('Нет сотрудника с указанным id!')
	}
	if (!employee.data.position){
		throw new Error ('У сотрудника нет указанной должности!')
	}
	if (!employee.data.id_1c){
		throw new Error ('У сотрудника нет id 1c!')
	}
	let job = await employee.data.position.fetch();
	if (!job.data.ref_key){
		throw new Error ('У должности нет указанного ref_key!')
	}

	let incomeStatementFile = await Context.data.income_statement!.fetch();
	let incomeStatementFileLink = await incomeStatementFile.getDownloadUrl();
	let incomeStatementFileBuffer = await fetch(incomeStatementFileLink).then(doc => doc.arrayBuffer());
	let incomeStatementFileB64String = btoa(String.fromCharCode(...new Uint8Array(incomeStatementFileBuffer)));
	
	let vacationData: IKonturVacationData = {
		processID: Context.data.process_id!,
		employeeID: employee.data.id_1c,
		firstName: employee.data.full_name ? employee.data.full_name.firstname : '',
		lastName: employee.data.full_name ? employee.data.full_name.lastname : '',
		middleName: employee.data.full_name ? employee.data.full_name.middlename : '',
		jobID: job.data.ref_key,
		incomeStatementFile: incomeStatementFileB64String
	}
	Context.data.json = JSON.stringify(vacationData);
}