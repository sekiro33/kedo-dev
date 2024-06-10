/* Client scripts module */

declare const document: any;
declare const console: any;

interface LineDetail {
    id: number,
    position?: string,
    organizatoin?: string,
    subdivision?: string,
    type_employment?: string,
    work_place?: string,
    work_schedules?: string,
    employment_relationship_type?: string,
    remote_work?: boolean,
    rate?: number,
    date_by?: string,
    admission_date_position?: string,
    admission_date_organization?: string,
    id_1c? : string,
    number_employment_contract?: string,
    date_employment_contract_as_date?: string,
}

interface DetailsStatus {
    id: number,
    show_details: boolean
}

interface ErrorLine {
    id: number,
    error_text: string,
}

async function onInit(): Promise<void> {
    Context.fields.position.data.setFilter((appFields, context, globalFilters) => globalFilters.and(
        appFields.is_closed.eq(false)
    ));
    await init_details_status();
    await initialzie_errors();
}

async function init_details_status(): Promise<void> {
    if (!Context.data.details_status) {
        Context.data.details_status = [];
    }

    const details_status: DetailsStatus[] = Context.data.details_status;

    const row: DetailsStatus | undefined = details_status.find(f => f.id == Context.data.id);

    if (row) {
        Context.data.show_details = row.show_details;
    } else {
        details_status.push({
            id: Context.data.id!,
            show_details: Context.data.show_details!,
        })
    }
}

async function initialzie_errors(): Promise<void> {
    const errors: ErrorLine[] = Context.data.errors ?? [];

    const error_line: ErrorLine | undefined = errors.find(f => f.id == Context.data.id);

    if (error_line) {
        show_error(error_line.error_text);
    }
}

async function update_line(): Promise<void> {
    const line_details: LineDetail = {
        id: Context.data.id!,
        position: Context.data.position?.id,
        organizatoin: Context.data.organization?.id,
        subdivision: Context.data.subdivision?.id,
        type_employment: Context.data.type_employment?.code,
        work_place: Context.data.work_place?.id,
        remote_work: Context.data.remote_work,
        work_schedules: Context.data.work_schedules?.id,
        employment_relationship_type: Context.data.employment_relationship_type?.id,
        rate: Context.data.rate,
        date_by: Context.data.date_by?.format(),
        admission_date_position: Context.data.position_admission_date?.format(),
        admission_date_organization: Context.data.organization_admission_date?.format(),
        id_1c : Context.data.id_1c,
        number_employment_contract: Context.data.number_employment_contract,
        date_employment_contract_as_date: Context.data.date_employment_contract_as_date?.format()
    }

    await System.cache.setItem(`update_line_${Context.data.cache_guid}`, JSON.stringify(line_details));

    document.querySelector('.update_button_trigger').querySelector('button').click();
}

async function delete_line_custom(): Promise<void> {
    const line_details: LineDetail = {
        id: Context.data.id!,
    }

    await System.cache.setItem(`delete_line_${Context.data.cache_guid}`, JSON.stringify(line_details));

    document.querySelector('.delete_button_trigger').querySelector('button').click();
}

function show_error(text: string): void {
    Context.data.error_text = Context.data.error_text ? `${Context.data.error_text} | ${text}` : text;
    Context.data.show_errors = true;
}

function hide_error(): void {
    Context.data.error_text = undefined;
    Context.data.show_errors = false;
}

async function errors_onchanged(): Promise<void> {
    if (!Context.data.errors) {
        return;
    }

    const errors: ErrorLine[] = Context.data.errors;
    const line_erros = errors.filter(f => f.id == Context.data.id);

    hide_error();

    for (const error of line_erros) {
        show_error(error.error_text);
    }
}

/** Событие при изменении позиции ШР. */
async function position_onchange(): Promise<void> {
    if (!Context.data.position) {
        Context.data.subdivision = undefined;
        Context.data.organization = undefined;
        return;
    }

    const position = await Context.data.position.fetch();

    Context.data.subdivision = position.data.subdivision;
    Context.data.organization = position.data.organization;

    await update_line();
}

async function details_status_onchange(): Promise<void> {
    if (!Array.isArray(Context.data.details_status)) {
        Context.data.details_status = [];
    }

    const details_status: DetailsStatus[] = Context.data.details_status;

    const old_element: DetailsStatus | undefined = details_status.find((f: any) => f.id == Context.data.id);

    if (old_element) {
        old_element.show_details = Context.data.show_details!;
    } else {
        details_status.push({
            id: Context.data.id!,
            show_details: Context.data.show_details!,
        })
    }
}
