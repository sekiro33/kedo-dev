/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function PreloadReport(): Promise<void> {         //Подготовка отчёта от исполнителя
    //Подготовка отчета
    let e_result = "";
    let e_user = (await Context.data.responsible!.fetch());
    // e_result += "Проведенные мероприятия:\n" + (await Context.data.raport_comment);
    // e_result += "\n\n";
    // e_result += "ИСПОЛНИТЕЛЬ:\n · " + e_user.data.fullname!.lastname + " " + (e_user.data.fullname!.firstname ? (e_user.data.fullname!.firstname.charAt(0)) + "." : "") + (e_user.data.fullname!.middlename ? (e_user.data.fullname!.middlename.charAt(0)) + "." : "");
    e_result = `Проведенные мероприятия ${Context.data.raport_comment}
    ИСПОЛНИТЕЛЬ: ${e_user.data.fullname!.lastname} ${e_user.data.fullname!.firstname.charAt(0)}. ${e_user.data.fullname!.middlename.charAt(0)}.`
    Context.data.result = e_result;
    if(!Context.data.executor_staff) return;
    let author = await Context.data.executor_staff!.fetch();
    if(!author.data.position) return;
    let author_position = await author.data.position.fetch();
    Context.data.author_position = author_position.data.__name;
}

/////////////////////////////////////////////////////////////////////////helpers
async function createStatusObj(app: any, status: string): Promise<void> {  
    
    const obj_status = {
        'app' : {
            'namespace' : app.namespace,
            'code'      : app.code,
            'id'        : app.id,
        },
        'status'    : status,
    }

    Context.data.kedo_status = JSON.stringify(obj_status);
}

//statuses
async function createStatusLNASigning(): Promise<void> {

    createStatusObj(Context.data.orders_lna, 'signing');
    
}

async function createStatusLNASigned(): Promise<void> {

    createStatusObj(Context.data.orders_lna, 'signing');
    
}

async function createStatusLNANew(): Promise<void> {

    createStatusObj(Context.data.orders_lna, 'new');
    
}