/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function getFile(): Promise<void> {
    if (Context.data.document) {
        const document = await Context.data.document.fetch();
        if (document.data.__file) {
            Context.data.file = document.data.__file;
        }
    }
}

async function setScan(): Promise<void> {
    if (Context.data.document && Context.data.document_scan) {
        const document = await Context.data.document.fetch();
        document.data.__file = Context.data.document_scan;
        await document.save();
    }
}
