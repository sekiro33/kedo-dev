type WithoutPayLeave = ApplicationItem<Application$personnel_documents$application_for_leave_without_pay$Data, Application$personnel_documents$application_for_leave_without_pay$Params>;
type BusinessTrip = ApplicationItem<Application$personnel_documents$memo_business_trip$Data, Application$personnel_documents$memo_business_trip$Params>;
type PaidLeave = ApplicationItem<Application$personnel_documents$paid_leave$Data, Application$personnel_documents$paid_leave$Params>;
type MatHelp = ApplicationItem<Application$personnel_documents$application_for_financial_assistance$Data, Application$personnel_documents$application_for_financial_assistance$Params>;

async function get_doc(): Promise<void> {
    let ref: RefItem | undefined = undefined;

    if (Context.data.business_trip_application) {
        const business_trip = Context.data.business_trip_application;
        ref = new RefItem<BusinessTrip>(business_trip.namespace, business_trip.code, business_trip.id);
    }

    if (Context.data.withoutpay_leave_application) {
        const withoutpay_leave_application = Context.data.withoutpay_leave_application;
        ref = new RefItem<WithoutPayLeave>(withoutpay_leave_application.namespace, withoutpay_leave_application.code, withoutpay_leave_application.id);
    }

    if (Context.data.paid_leave_application) {
        const paid_leave_application = Context.data.paid_leave_application;
        ref = new RefItem<PaidLeave>(paid_leave_application.namespace, paid_leave_application.code, paid_leave_application.id);
    }

    if (Context.data.mat_help) {
        const mat_help = Context.data.mat_help;
        ref = new RefItem<MatHelp>(mat_help.namespace, mat_help.code, mat_help.id);
    }

    if (ref) {
        Context.data.kad_docs = await Context.fields.kad_docs.app.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__sourceRef.eq(ref!)
        )).first();
    }
}

async function runProcess(): Promise<void> {
    const process_template = Namespace.processes.typical_business_process;

    if (!Context.data.kad_docs) {
        throw new Error("Context.data.kad_docs is undefined");
    }

    const kad_docs = await Context.data.kad_docs.fetch();

    if (!kad_docs.data.__sourceRef) {
        throw new Error("__sourceRef of kad_docs is undefined");
    }

    const source = kad_docs.data.__sourceRef;

    const context: any = {
        personnel_documents: [Context.data.kad_docs.id],
        leave_application_withoutpay: Context.data.withoutpay_leave_application ? [Context.data.withoutpay_leave_application.id] : null,
        leavle_application: Context.data.paid_leave_application ? [Context.data.paid_leave_application.id] : null,
        financial_assistance_application: Context.data.mat_help ? [Context.data.mat_help.id] : null,
        business_trip: Context.data.business_trip_application ? [Context.data.business_trip_application.id] : null,
        employment_placement: Context.data.employment_placement ? [Context.data.employment_placement.id] : null,
        __item: {
            id: source.id,
            code: source.code,
            namespace: source.namespace,
        }
    }

    await process_template.run(context);
}
