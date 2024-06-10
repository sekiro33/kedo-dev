/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function designInPaper(): Promise<void> {
    Context.data.set_documents = [];
    const document = await Context.data.document!.fetch()
    if (document.fields.__status) {
        let statuses = document.fields.__status.all;
        let status = statuses.find((i: { code: string; }) => i.code == 'design_in_paper');
        if (status) {
            await document.setStatus(status);
        }
        await document.save();
    }
    Context.data.set_documents.push(document)

    if (Context.data.additional_agreement) {
        const additional_agreement = await Context.data.additional_agreement.fetch()
        if (additional_agreement.fields.__status) {
            let statuses = additional_agreement.fields.__status.all;
            let status = statuses.find((i: { code: string; }) => i.code == 'design_in_paper');
            if (status) {
                await additional_agreement.setStatus(status);
            }
            await additional_agreement.save();
        }
        Context.data.set_documents.push(Context.data.additional_agreement)
    }

    if (Context.data.documents) {
        Context.data.set_documents = Context.data.set_documents.concat(Context.data.documents);
    }
    Context.data.set_documents = Context.data.set_documents;
    Context.data.number_documents = Context.data.set_documents.length;
}

async function signedInPaper(): Promise<void> {
    const document = await Context.data.document!.fetch()
    if (document.fields.__status) {
        let statuses = document.fields.__status.all;
        let status = statuses.find((i: { code: string; }) => i.code == 'signed_in_paper');
        if (status) {
            await document.setStatus(status);
        }
        await document.save();
    }

    if (Context.data.additional_agreement) {
        const additional_agreement = await Context.data.additional_agreement.fetch()
        if (additional_agreement.fields.__status) {
            let statuses = additional_agreement.fields.__status.all;
            let status = statuses.find((i: { code: string; }) => i.code == 'signed_in_paper');
            if (status) {
                await additional_agreement.setStatus(status);
            }
            await additional_agreement.save();
        }
    }
    Context.data.number_documents = Context.data.set_documents!.length;
}

async function getDocumentFromMassive(status: string): Promise<void> {
    const document = Context.data.document!;
    const obj_status = {
        app: {
            namespace: document.namespace,
            code: document.code,
            id: document.id,
        },
        status: status,
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusDocumentsDesign(): Promise<void> {
    await getDocumentFromMassive('design_in_paper');
}

async function setStatusDocumentsSigned(): Promise<void> {
    await getDocumentFromMassive('signed_in_paper');
}