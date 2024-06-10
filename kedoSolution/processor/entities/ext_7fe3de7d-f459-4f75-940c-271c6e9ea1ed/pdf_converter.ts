/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
Документация TS SDK доступна на сайте https://tssdk.elma365.com.
**/
async function check_file_format(): Promise<number> {
    const file = await Context.data.file!.fetch();
    const file_name = file.data.__name;

    if (file_name.endsWith('.pdf')) {
        return 1;
    } else if (file_name.endsWith('.docx') || file_name.endsWith('.DOCX') || file_name.endsWith('.xlsx')) {
        return 2;
    } else {
        return -1;
    }
}

async function create_file_name(): Promise<void> {
    if (Context.data.file_name) {
        return;
    }

    const file = await Context.data.file!.fetch();

    const file_name = file.data.__name.replace(/\.[^.$]+$/, '');

    Context.data.file_name = file_name; 
    Context.data.orignial_file_name = file_name;
}

async function change_file_name(): Promise<void> {
    const file = await Context.data.file!.fetch();
    const file_url = await file.getDownloadUrl();
    const file_body = await (await fetch(file_url)).arrayBuffer();

    const file_name = Context.data.file_name ?? "empty_name";

    Context.data.new_file = await Context.fields.new_file.create(`${file_name}.pdf`, file_body);
}

async function get_new_file_name(): Promise<void> {
    if (!Context.data.new_file) {
        return;
    }

    const file = await Context.data.new_file.fetch();
    Context.data.new_file_name = file.data.__name.replace(/\.[^.$]+$/, '');
}
