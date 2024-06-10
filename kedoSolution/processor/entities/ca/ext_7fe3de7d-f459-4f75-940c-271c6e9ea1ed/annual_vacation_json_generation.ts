//Ежегодный оплачиваемый отпуск
interface IKonturVacationData {
	processID: string,
	employeeID: string,
	firstName: string,
	lastName: string,
	middleName: string,
	jobID: string,
	vacationStartDate: string,
	vacationEndDate: string,
	attachmentFile: string,
	vacationType: "Ежегодный оплачиваемый отпуск"
}

async function action(): Promise<void> {
	const vacationApp = Namespace.params.fields.employee_app.app; // тут должны быть отпуска

	let vacation = await vacationApp.search().where((f, g) => g.and(
		f.__deletedAt.eq(null),
		f.__id.eq(Context.data.vacation_id as string)
	)).first();

	if (!vacation) {
		throw new Error('Нет отпуска с указанным id!')
	}
	if (!vacation.data.kedo_staff) {
		throw new Error('В отпуске не указан сотрудник (приложение КЭДО)!')
	}
	let employee = await vacation.data.kedo_staff.fetch();
	if (!employee.data.position) {
		throw new Error('У сотрудника не указана должность')
	}
	if (!employee.data.id_1c) {
		throw new Error('У сотрудника нет id 1c!')
	}
	let job = await employee.data.position.fetch();
	if (!job.data.ref_key) {
		throw new Error('У должности нет указанного ref_key!')
	}
	if (!vacation.data.statements) {
		throw new Error('В указанном отпуске нет заявлений!')
	}
	let attachment = await vacation.data.statements[0].fetch();
	if (!attachment.data.__file) {
		throw new Error('Нет файла заявления для прикрепления!')
	}
	let attachmentFile = await attachment.data.__file.fetch();
	let attachmentFileLink = await attachmentFile.getDownloadUrl();
	let incomeStatementFileBuffer = await fetch(attachmentFileLink).then(doc => doc.arrayBuffer());
	let incomeStatementFileB64String = btoa(String.fromCharCode(...new Uint8Array(incomeStatementFileBuffer)));

	let vacationData: IKonturVacationData = {
		processID: Context.data.process_id!,
		employeeID: employee.data.id_1c,
		firstName: employee.data.full_name ? employee.data.full_name.firstname : '',
		lastName: employee.data.full_name ? employee.data.full_name.lastname : '',
		middleName: employee.data.full_name ? employee.data.full_name.middlename : '',
		jobID: job.data.ref_key,
		vacationType: "Ежегодный оплачиваемый отпуск",
		vacationStartDate: vacation.data.start_string!,
		vacationEndDate: vacation.data.end_string!,
		attachmentFile: incomeStatementFileB64String,
	}

	Context.data.json = JSON.stringify(vacationData);
}