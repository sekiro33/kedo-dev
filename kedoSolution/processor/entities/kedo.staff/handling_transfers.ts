/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface TransferData {
    employeeIndividualId: string;
    typeWorkRelation: string;
    subdivisionId: string;
    orgId: string;
    id_1c: string;
    typeFromData: boolean;
    transferDate: string;
    rate: number;
    posId: string;
    existingPositions: boolean;
}

//основная процедура обработки пришедших данных по переводам
async function handleJSON(): Promise<void> {
    
    if (!Context.data.transfers) {
        return;
    }
    
    let data: TransferData[] = JSON.parse(Context.data.transfers);

    //длина массива для окончания итерирования
    Context.data.array_length = data.length; 

    //итератор
    Context.data.iterator!++;

    //условие на завершение цикла
    if (Context.data.iterator! >= Context.data.array_length!) {
        Context.data.loop_end = true; 
        return;   
    }

    //заполнение всех данных для посыла подпроцесс
    Context.data.staff = await Context.fields.staff.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.individual_id_1c.eq(data[Context.data.iterator!].employeeIndividualId)
    )).first();
    let transfer_datetime = new Datetime(data[Context.data.iterator!].transferDate);
    Context.data.transfer_date = new TDate(transfer_datetime.year, transfer_datetime.month, transfer_datetime.day);
    Context.data.type_work_relation = data[Context.data.iterator!].typeWorkRelation;
    Context.data.debug = data[Context.data.iterator!].transferDate;
    Context.data.position = await Context.fields.position.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ref_key.eq(data[Context.data.iterator!].posId)
    )).first();
    Context.data.subdivision = await Context.fields.subdivision.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ref_key.eq(data[Context.data.iterator!].subdivisionId)
    )).first();
    Context.data.organization = await Context.fields.organization.app.search().where((f, g) => g.and(
        f.__deletedAt.eq(null),
        f.ref_key.eq(data[Context.data.iterator!].orgId)
    )).first();
    Context.data.id_1c = data[Context.data.iterator!].id_1c;
    Context.data.rate = data[Context.data.iterator!].rate;
    Context.data.type_from_data = data[Context.data.iterator!].typeFromData;
    Context.data.existing_positions = data[Context.data.iterator!].existingPositions;
}
