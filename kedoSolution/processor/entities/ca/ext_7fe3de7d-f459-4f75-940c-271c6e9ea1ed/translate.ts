/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
Документация TS SDK доступна на сайте https://tssdk.elma365.com.

Сигнатуры функций

Для синхронного взаимодействия:
    async function action(): Promise<void>;

Для модели проверки результата:
    async function action(): Promise<void>;
    async function check(): Promise<boolean>;

Для модели обратного вызова:
    async function action(url: string): Promise<void>;
    async function callback(req: HTTPRequest): Promise<void>;

**/

const dict = {" ": "_", "Ё": "YO", "Й": "I", "Ц": "TS", "У": "U", "К": "K", "Е": "E", "Н": "N", "Г": "G", "Ш": "SH", "Щ": "SCH", "З": "Z", "Х": "H", "Ъ": "'", "ё": "yo", "й": "i", "ц": "ts", "у": "u", "к": "k", "е": "e", "н": "n", "г": "g", "ш": "sh", "щ": "sch", "з": "z", "х": "h", "ъ": "'", "Ф": "F", "Ы": "I", "В": "V", "А": "A", "П": "P", "Р": "R", "О": "O", "Л": "L", "Д": "D", "Ж": "ZH", "Э": "E", "ф": "f", "ы": "i", "в": "v", "а": "a", "п": "p", "р": "r", "о": "o", "л": "l", "д": "d", "ж": "zh", "э": "e", "Я": "Ya", "Ч": "CH", "С": "S", "М": "M", "И": "I", "Т": "T", "Ь": "'", "Б": "B", "Ю": "YU", "я": "ya", "ч": "ch", "с": "s", "м": "m", "и": "i", "т": "t", "ь": "'", "б": "b", "ю": "yu" };
type dictKey = keyof typeof dict;

async function action(): Promise<void> {
    const file = await Context.data.file!.fetch();
    const url = await Context.data.file!.getDownloadUrl();
    const buffer = await fetch(url).then(r => r.arrayBuffer());

    let newName = file.data.__name.split('').map((char) => {
        return dict[char as dictKey] || char;
    }).join("").replace(/[^a-zA-Z0-9_.]/g, "");
    
    file.data.__name = newName;
    await file.addVersion(newName, buffer);
    Context.data.file = file;
}