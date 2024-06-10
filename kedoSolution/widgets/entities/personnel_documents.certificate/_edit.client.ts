/* Client scripts module */
async function onInit(): Promise <void> {
    if (Context.data.__file) {
        ViewContext.data.docVisibility = true;
    } else {
        ViewContext.data.docVisibility = false;
    }
}

async function checkResolution(): Promise <void> {
    if (Context.data.further_action) {
        if (Context.data.further_action.code === 'correct') {
            ViewContext.data.commentVisibility = true
        } else {
            ViewContext.data.commentVisibility = false;
        }
    }
}