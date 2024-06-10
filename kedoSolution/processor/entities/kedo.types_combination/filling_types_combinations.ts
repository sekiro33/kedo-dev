/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface IDocument {
    name: string;
    code: string;
    need_memo: boolean;
}

let types: IDocument[] = [
    {
        code: 'performance_employee_duties',
        need_memo: true,
        name: 'Исполнение обязанностей сотрудника',
    },
    {
        code: 'combining_positions',
        need_memo: true,
        name: 'Совмещение должностей',
    },
    {
        code: 'expansion_service_areas',
        need_memo: true,
        name: 'Расширение зон обслуживания',
    },
    {
        code: 'substitution_only',
        need_memo: true,
        name: 'Только замещение',
    }
]

async function set_types(): Promise<void> {
    const types_code = types.map(f => f.code);

    const all_types = await Application.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.in(types_code)
        ))
        .size(10000)
        .all();

    let promises: Promise<void>[] = [];

    for (const type of types) {
        if (all_types.find(f => f.data.code == type.code)) {
            continue;
        }

        const new_type = Application.create();
        new_type.data.__name = type.name;
        new_type.data.code = type.code;
        new_type.data.need_memo = type.need_memo;
        promises.push(new_type.save());

        if (promises.length > 20) {
            await Promise.all(promises);
            promises = [];
        }
    }

    await Promise.all(promises);
}