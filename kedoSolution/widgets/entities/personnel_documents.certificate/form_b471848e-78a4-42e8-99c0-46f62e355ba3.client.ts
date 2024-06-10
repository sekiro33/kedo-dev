/* Client scripts module */
async function onInit(): Promise<void> {
    const certificate = await Context.data.certificate!.fetch();
    if (certificate.data.method_providing_certificate && certificate.data.method_providing_certificate.code === 'paper') {
        ViewContext.data.show_comment = true;
        ViewContext.data.file_required = false;
    } else {
        ViewContext.data.show_comment = false;
        ViewContext.data.file_required = true;
    }
}