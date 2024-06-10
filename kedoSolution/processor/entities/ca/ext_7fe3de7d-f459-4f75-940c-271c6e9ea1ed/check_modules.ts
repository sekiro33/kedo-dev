async function action(): Promise<void>{
	const baseUrl = System.getBaseUrl();
    const tokenSetting = await Context.fields.settings_app.app.search().where(f => f.code.eq("api_key")).first();

    if (!tokenSetting || !tokenSetting.data.value) {
        Context.data.enabled_module_code = "null";
        return;
    };

    let goskeyEnabled = false;
    let commonIntegrationEnabled = false

    const goskeyResponse = await fetch(`${baseUrl}/pub/v1/scheme/modules/7fb0a0d0-fc8d-452e-843f-6a7f2f28a8bf`, {
        headers: {
            Authorization: `Bearer ${tokenSetting.data.value}`
        }
    });

    if (goskeyResponse.ok) {
        const responseJson = await goskeyResponse.json();
        goskeyEnabled = responseJson.module.enabled;
    };

    const commonIntegrationResponse = await fetch(`${baseUrl}/pub/v1/scheme/modules/27c1fb4a-e011-47a6-aa26-cf0fc42c39cd`, {
        headers: {
            Authorization: `Bearer ${tokenSetting.data.value}`
        }
    });

    if (commonIntegrationResponse.ok) {
        const responseJson = await commonIntegrationResponse.json();
        commonIntegrationEnabled = responseJson.module.enabled;
    };

    Context.data.enabled_module_code = [goskeyEnabled, commonIntegrationEnabled].every(item => item) ? "all" :
        goskeyEnabled ? "goskey" :
        commonIntegrationEnabled ? "common_integration" : "null"
};