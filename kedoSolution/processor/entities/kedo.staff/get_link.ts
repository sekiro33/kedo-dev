/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getKedoSettings(): Promise<void> {
    const codes : string[] = [
        "med_exam_process",
    ];
    
    const settings = await Namespace.app.settings.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.in(codes)
        ))
        .size(codes.length)
        .all();

    // Определяем необходимость медосмотра
    const medExam = settings.find(f => f.data.code == 'med_exam_process');
    Context.data.med_need = medExam ? medExam.data.status : false;
}
