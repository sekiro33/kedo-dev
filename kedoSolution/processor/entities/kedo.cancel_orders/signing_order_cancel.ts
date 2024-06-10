

async function updateContextSigned(): Promise<void> {
    Context.data.order_signed = true;
}

async function updateContextNotSigned(): Promise<void> {
    Context.data.order_signed = false;
}