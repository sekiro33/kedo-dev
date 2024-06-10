async function updateContextSigned(): Promise<void> {
    Context.data.agreement_signed = true;
}

async function updateContextNotSigned(): Promise<void> {
    Context.data.agreement_signed = false;
}
