/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function fill_doc_types(): Promise<void> {
    interface docType {
        app_name: string,
        app_code: string,
        doc_type?: string,
        doc_type_id_1c: string,
    }
    const docTypes: docType[] = [
        {
            app_name: 'Приказ на командировку',
            app_code: 'order_for_a_business_trip',
            doc_type: "StandardODATA.Document_Командировка",
            doc_type_id_1c: '1ED46407EA7CB1DE3A761BDF05A9E806',
        },
        {
            app_name: 'Приказ на материальную помощь',
            app_code: 'order_financial_assistance',
            doc_type_id_1c: '9F7E19F06543131B20BFFDC877FC9F78',
        },
        {
            app_name: 'Приказ о приеме',
            app_code: 'admission_order',
            doc_type_id_1c: '38CC20A9DD45F8EE81126B5D024401A0',
        },
        {
            app_name: 'Трудовой договоре',
            app_code: 'labor_contract',
            doc_type_id_1c: '4BC28437B12F282B695C7DF7DCEE3CC4',
        },
        {
            app_name: 'Приказ на перевод',
            app_code: 'order_for_transfer',
            doc_type_id_1c: 'F126ACA5BF0AAE28246CDD6312200C8E',
        },
        {
            app_name: 'Приказ на увольнение',
            app_code: 'dismissal_order',
            doc_type_id_1c: '2C555146B9A0501714EAF33792CB70D1',
        },
        {
            app_name: 'Прочие документы',
            app_code: 'other_documents',
            doc_type_id_1c: ''
        },
        {
            app_name: "Трудовой договор",
            app_code: "labor_contract",
            doc_type_id_1c: "4BC28437B12F282B695C7DF7DCEE3CC4"
        },
        {
            app_name: "Трудовой договор при дистанционной работе",
            app_code: "labor_contract",
            doc_type_id_1c: "AC7400F60307F5E4DE43CECC31E75C50"
        },
        {
            app_name: "Приказ на ежегодный оплачиваемый отпуск",
            app_code: "vacation_orders",
            doc_type_id_1c: "0980DDEB351855C4A080298A5298923F"
        },
        {
            app_name: "Приказ на отпуск без сохранения заработной платы",
            app_code: "vacation_orders",
            doc_type_id_1c: "0980DDEB351855C4A080298A5298923F"
        },
        {
            app_name: "Приказ о предоставлении дополнительного времени отдыха",
            app_code: "vacation_orders",
            doc_type_id_1c: "C742514F1ED0F69F7946AD407852DE0E"
        },
        {
            app_name: "Приказ на отпуск по беременности и родам",
            app_code: "vacation_orders",
            doc_type_id_1c: "06EC8ED305A97C6657E4880FE7DCF3BB"
        },
        {
            app_name: 'Прочие документы для трудоустройства',
            app_code: 'additional_agreement_to_the_contract',
            doc_type_id_1c: ''
        }
    ]

    const existingApps = await Application.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    let promises: Promise<void>[] = [];

    for (const docType of docTypes) {
        if (!existingApps.find(f => f.data.app_code === docType.app_code)) {
            const newDoc = Application.create();
            newDoc.data.__name = docType.app_name;
            newDoc.data.app_code = docType.app_code
            newDoc.data.document_type = docType.doc_type || ''
            newDoc.data.doc_type_id_1c = docType.doc_type_id_1c
            promises.push(newDoc.save());

            if (promises.length > 20) {
                await Promise.all(promises);
                promises = [];
            }
        }
    }

    await Promise.all(promises)
}

