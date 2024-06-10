async function onInit(): Promise<void> {
    if ((Context.data.provider && Context.data.provider.find(p => p.code === "kontur")) || (Context.data.sign_provider && Context.data.sign_provider.find(p => p.code === "kontur"))) {
        ViewContext.data.kontur = true;
    }
}