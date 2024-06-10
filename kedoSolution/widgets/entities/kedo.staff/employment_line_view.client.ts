/* Client scripts module */

interface DetailsStatus {
    id: number,
    show_details: boolean
}

async function show_details_onchange(): Promise<void> {
    if (!Array.isArray(Context.data.details_status)) {
        Context.data.details_status = [];
    }

    const details_status: DetailsStatus[] = Context.data.details_status;

    const old_element: DetailsStatus | undefined = details_status.find(f => f.id == Context.data.id);

    if (old_element) {
        old_element.show_details = Context.data.show_details!;
    } else {
        details_status.push({
            id: Context.data.id!,
            show_details: Context.data.show_details!,
        })
    }
}
