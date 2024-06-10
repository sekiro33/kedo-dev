/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/
async function prepare_staffs(): Promise<boolean> {
    if (Context.data.staff && Context.data.staff.length > 0) {
        Context.data.staff_kedo = Context.data.staff.pop();
        Context.data.counter! += 1;
        return true
    } else {
        return false
    }
}
async function setStartData(): Promise<void> {
    Context.data.counter = 0;
}

