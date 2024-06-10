
declare const window: any;

async function onInit(): Promise<void> {
    if(window.location.href === `${System.getBaseUrl()}/_portal/kedo_ext/main_page`) {
        window.location.href = `/_portal/kedo_ext/main_page/main_page_kedo`;
    }
}