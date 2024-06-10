
async function prepareMedicalRequest(): Promise<void> {
    Context.data.is_it_employment_process = true;
    const medical_request = Context.fields.medical_request.app.create();
    medical_request.data.staff = Context.data.staff;
    await medical_request.save();
}
