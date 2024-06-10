/* Client scripts module */
async function onInit():Promise<void>{
    if(Context.data.medical_examination_data!.length > 0){
        for(let item of Context.data.medical_examination_data!){
            let row = Context.data.results_of_medical_examinations!.insert();
            row.type_medical_examinations = item.type_medical_examination;
        }
        Context.data.results_of_medical_examinations = Context.data.results_of_medical_examinations;
    }
}