/**
Здесь вы можете написать скрипты для сложной серверной обработки контекста во время выполнения процесса.
Для написания скриптов используйте TypeScript (https://www.typescriptlang.org).
Документация TS SDK доступна на сайте https://tssdk.elma365.com.
**/

interface IRelatedDocuments {
    namespace: string,
    code: string,
    documents: IDocument[],
}

interface IDocument {
    namespace: string,
    code: string,
    related_field_code: string,
}

const related_documents: IRelatedDocuments[] = [
    {
        "namespace": "business_trips",
        "code": "businesstrip_requests",
        "documents": [
            {
                "namespace": "business_trips",
                "code": "trip_requests",
                "related_field_code": "businesstrip_requests"
            },
            {
                "namespace": "business_trips",
                "code": "business_trip_consent",
                "related_field_code": "business_trip"
            },
            {
                "namespace": "business_trips",
                "code": "business_trip_change_service_note",
                "related_field_code": "business_trip"
            },
            {
                "namespace": "business_trips",
                "code": "service_note_accountable_funds",
                "related_field_code": "business_trip"
            },
            {
                "namespace": "business_trips",
                "code": "order_for_a_business_trip",
                "related_field_code": "business_trip"
            },
            {
                "namespace": "business_trips",
                "code": "avansovyi_otchet",
                "related_field_code": "businesstrip_requests"
            },
            {
                "namespace": "business_trips",
                "code": "service_assignments",
                "related_field_code": "businesstrip_requests"
            }
        ]
    },
    {
        "namespace": "time_tracking",
        "code": "overtime_work",
        "documents": [
            {
                "namespace": "time_tracking",
                "code": "overtime_requests",
                "related_field_code": "overtime_work"
            },
            {
                "namespace": "time_tracking",
                "code": "overtimeWorkOrders",
                "related_field_code": "overtime_work"
            },
            {
                "namespace": "time_tracking",
                "code": "overtimeWorkNotifications",
                "related_field_code": "overtime_work"
            },
            {
                "namespace": "time_tracking",
                "code": "overtimeWorkConsent",
                "related_field_code": "overtime_work"
            },
            {
                "namespace": "time_tracking",
                "code": "overtime_order",
                "related_field_code": "overtime_work"
            }
        ]
    },
    {
        "namespace": "absences",
        "code": "vacations",
        "documents": [
            {
                "namespace": "absences",
                "code": "vacation_docs",
                "related_field_code": "vacation"
            },
            {
                "namespace": "absences",
                "code": "vacation_orders",
                "related_field_code": "vacation"
            },
            {
                "namespace": "absences",
                "code": "memo_recall_vacation",
                "related_field_code": "vacation"
            },
            {
                "namespace": "absences",
                "code": "consent_recall_vacation",
                "related_field_code": "vacation"
            }
        ]
    },
    {
        "namespace": "kedo",
        "code": "staff",
        "documents": [
            {
                "namespace": "personnel_documents",
                "code": "application_for_financial_assistance",
                "related_field_code": "staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "benefit_application",
                "related_field_code": "staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "application_for_the_transfer_of_salary_to_the_current_account",
                "related_field_code": "staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "free_from",
                "related_field_code": "staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "certificate",
                "related_field_code": "staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "other_documents",
                "related_field_code": "staff"
            },
            {
                "namespace": "absences",
                "code": "vacation_docs",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "absences",
                "code": "vacation_orders",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "time_tracking",
                "code": "overtime_work",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "kedo",
                "code": "additional_agreement",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "employees_personal_data",
                "related_field_code": "staff"
            },
            {
                "namespace": "business_trips",
                "code": "trip_requests",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "business_trips",
                "code": "order_for_a_business_trip",
                "related_field_code": "kedo_staff"
            },
            {
                "namespace": "personnel_documents",
                "code": "combination",
                "related_field_code": "substitute"
            },
            {
                "namespace": "personnel_documents",
                "code": "combination_additional_agreement",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "letter_of_resignation",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "electronic_interaction_agreement",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "labor_contract",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "admission_order",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "information_about_labor_activity",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "job_application",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "additional_agreement_to_the_contract",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "consent_processing_personal_data",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "transfer_application",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "order_for_transfer",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "transfer_approve",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "additional_transfer_agreement",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "dismissal_app",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "letter_of_resignation",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "dismissal_order",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "recall_dismissal",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "category_assignment",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "application_category_assignment",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "employees_personal_data",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "passport_data_application",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "passport_data_change_order",
                "related_field_code": "staff"
            },
            {
                "namespace": "kedo",
                "code": "child_personal_data_consent",
                "related_field_code": "staff"
            }
        ]
    }
]

async function fillRelatedDocumentsTable(): Promise<void> {
    await Namespace.storage.setItem("related_documents", JSON.stringify(related_documents));
}
