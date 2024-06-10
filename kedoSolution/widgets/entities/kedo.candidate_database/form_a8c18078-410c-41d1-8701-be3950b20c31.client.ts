/* Client scripts module */
async function onInit(): Promise<void> {
    if (Context.data.job_offer_candidate) {
        ViewContext.data.view_signed_job_offer = true
    } else {
        ViewContext.data.view_signed_job_offer = false
    }
}