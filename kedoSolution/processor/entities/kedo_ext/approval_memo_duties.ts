/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function setStatusApproval(): Promise<void> {
    if (!Context.data.memo_execution) {
        throw new Error("Context.data.memo_execution is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.memo_execution.namespace,
            code: Context.data.memo_execution.code,
            id: Context.data.memo_execution.id,
        },
        status: "approval",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusAgreed(): Promise<void> {
    if (!Context.data.memo_execution) {
        throw new Error("Context.data.memo_execution is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.memo_execution.namespace,
            code: Context.data.memo_execution.code,
            id: Context.data.memo_execution.id,
        },
        status: "agreed_signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusCancelled(): Promise<void> {
    if (!Context.data.memo_execution) {
        throw new Error("Context.data.memo_execution is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.memo_execution.namespace,
            code: Context.data.memo_execution.code,
            id: Context.data.memo_execution.id,
        },
        status: "cancelled",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}
