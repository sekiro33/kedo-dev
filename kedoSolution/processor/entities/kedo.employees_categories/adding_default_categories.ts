/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts; use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

interface category {
    name: string;
    additional_vacation_days?: number | undefined;
    name_type_vacation?: string | undefined;
    additional_vacation_days_month?: number | undefined;
    consider_additional_vacation?: boolean | undefined;
    taken_forming_vacation_schedule?: boolean | undefined;
    vacation_at_convenience?: boolean | undefined;
    possibility_recall_from_vacation?: boolean | undefined;
    possibility_replace_monetary_compensation?: boolean | undefined;
    possibility_work_blood_donation_day? : boolean;
    possibility_business_trip?: TEnum<Enum$kedo$employees_categories$possibility_business_trip> | undefined;
    training_business_trips?: boolean | undefined;
    possibility_overtime_work?: TEnum<Enum$kedo$employees_categories$possibility_overtime_work> | undefined;
    possibility_night_work?: TEnum<Enum$kedo$employees_categories$possibility_night_work> | undefined;
    possibility_weekends_work?: TEnum<Enum$kedo$employees_categories$possibility_weekends_work> | undefined;
    max_shift_duration?: number | undefined;
    max_shift_duration_week?: number | undefined;
    assigning_category_employee_application?: boolean | undefined;
    unpaid_vacation_days?: number | undefined;
    code?: string | undefined;
    perpetual: boolean;

}

const categories: category[] = [
    {
        "name": "Особый характер работы",
        "name_type_vacation": 'Дополнительный оплачиваемый (особый характер работы)',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": true,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "special_nature",
        "perpetual": false
    },
    {
        "name": "Ненормированный рабочий день",
        "name_type_vacation": 'Дополнительный оплачиваемый (ненормированный рабочий день)',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": true,
        "possibility_replace_monetary_compensation": true,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "irregular",
        "perpetual": false
    },
    {
        "name": "Ветеран боевых действий",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": true,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 35,
        "code": "veteran",
        "perpetual": true
    },
    {
        "name": "Пенсионер",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "pensioner",
        "perpetual": true
    },
    {
        "name": "Работник, вышедший на работу после прохождения военной службы по мобилизации",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "after_mobilization",
        "perpetual": false
    },
    {
        "name": "Сотрудник работает в остальных районах Севера, где установлены районный коэффициент",
        "name_type_vacation": 'Дополнительный оплачиваемый (ОКС)',
        "additional_vacation_days": 8,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "other_North",
        "perpetual": false
    },
    {
        "name": "Сотрудник работает в районах приравненных к районам Крайнего севера ",
        "name_type_vacation": 'Дополнительный оплачиваемый (МКС)',
        "additional_vacation_days": 16,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "equal_Far_North",
        "perpetual": false
    },
    {
        "name": "Сотрудник работает в районах Крайнего севера",
        "name_type_vacation": 'Дополнительный оплачиваемый (РКС)',
        "additional_vacation_days": 24,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "Far_North",
        "perpetual": false
    },
    {
        "name": "Сотрудник работает при вредных/опасных условиях труда",
        "name_type_vacation": 'Дополнительный оплачиваемый (вредность)',
        "additional_vacation_days": 7,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : false,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "harmful_dangerous",
        "perpetual": false
    },
    {
        "name": "Инвалид III группы",
        "name_type_vacation": 'Ежегодный основной оплачиваемый отпуск (инвалидность)',
        "additional_vacation_days": 2,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_overtime_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_night_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_weekends_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 60,
        "code": "3rd_group_invalid",
        "perpetual": false
    },
    {
        "name": "Работник, пострадавшие в результате радиационных аварий или катастроф",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": true,
        "possibility_work_blood_donation_day" : false,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "radiation_accident_victim",
        "perpetual": true
    },
    {
        "name": "Сотрудник, который совмещает работу и получение образования",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": true,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "education",
        "perpetual": false
    },
    {
        "name": "Участник ликвидации последствий аварии в пределах зоны отчуждения на период 1986–1987 гг.",
        "name_type_vacation": 'Дополнительный оплачиваемый (ликвидатор)',
        "additional_vacation_days": 14,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : false,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "exclusion_zone_liquidator",
        "perpetual": true
    },
    {
        "name": "Работник/ветеран удостоенный высшего звания или награжденный государственными орденами высшей степени",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 21,
        "code": "awared_the_highest_rank",
        "perpetual": true
    },
    {
        "name": "Беременная женщина",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": false,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : false,
        "possibility_business_trip": {
            "code": "not_allowed",
            "name": "Не допускаются"
        },
        "possibility_overtime_work": {
            "code": "not_allowed",
            "name": "Не допускаются"
        },
        "possibility_night_work": {
            "code": "not_allowed",
            "name": "Не допускаются"
        },
        "possibility_weekends_work": {
            "code": "not_allowed",
            "name": "Не допускаются"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "pregnant",
        "perpetual": false
    },
    {
        "name": "Сотрудник постоянно проживал (работал) в зоне отселения до переселения с 26.04.1986г.",
        "name_type_vacation": '',
        "additional_vacation_days": 21,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "lived_in_the_resettlement_zone_1986",
        "perpetual": true
    },
    {
        "name": "Сотрудник постоянно проживал (работал) в зоне отселения до переселения с 02.12.1995г.",
        "name_type_vacation": '',
        "additional_vacation_days": 14,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "lived_in_the_resettlement_zone_1995",
        "perpetual": true
    },
    {
        "name": "Супруга военнослужащего",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 32,
        "code": "military_spouse",
        "perpetual": false
    },
    {
        "name": "Работник в период нахождения его жены в отпуске по беременности и родам",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "wife_is_on_maternity_leave",
        "perpetual": false
    },
    {
        "name": "Родитель в случае, если другой родитель работает вахтовым методом",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_overtime_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_night_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_weekends_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "other_parent_works_on_a_rotational_basis",
        "perpetual": false
    },
    {
        "name": "Работник, ухаживающий за больным членом семьи",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "sick_family_member",
        "perpetual": false
    },
    {
        "name": "Почетный донор",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "honorary_donor",
        "perpetual": true
    },
    {
        "name": "Работник воспитывает ребенка-инвалида",
        "name_type_vacation": 'Дополнительные оплачиваемые выходные дни',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 4,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "invalid_child",
        "perpetual": false
    },
    {
        "name": "Многодетный родитель",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_night_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "large_parent",
        "perpetual": false
    },
    {
        "name": "Родитель, воспитывающий без супруга (супруги) детей в возрасте до четырнадцати лет",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_overtime_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_night_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "single_parent",
        "perpetual": false
    },
    {
        "name": "Родитель ребенка до четырнадцати лет, если второй родитель призван на военную службу по мобилизации",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_overtime_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_night_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_weekends_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 14,
        "code": "second_parent_are_mobilized",
        "perpetual": false
    },
    {
        "name": "Женщина, имеющая детей в возрасте до трех лет",
        "name_type_vacation": '',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_overtime_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_night_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_weekends_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "childrens_under_three_years",
        "perpetual": false
    },
    {
        "name": "Инвалид I или II группы",
        "name_type_vacation": 'Ежегодный основной оплачиваемый отпуск (инвалидность)',
        "additional_vacation_days": 2,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "training_business_trips": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_overtime_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_night_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "possibility_weekends_work": {
            "code": "allowed_with_restrictions",
            "name": "Допускается с ограничениями"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": 35,
        "assigning_category_employee_application": true,
        "unpaid_vacation_days": 60,
        "code": "1st_or_2nd_group_invalid",
        "perpetual": false
    },
    {
        "name": "Сотрудник в возрасте до 18 лет",
        "name_type_vacation": 'Ежегодный основной оплачиваемый отпуск (до 18 лет)',
        "additional_vacation_days": 3,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": true,
        "vacation_at_convenience": true,
        "possibility_recall_from_vacation": false,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : false,
        "possibility_business_trip": {
            "code": "not_allowed",
            "name": "Не допускаются"
        },
        "training_business_trips": false,
        "possibility_overtime_work": {
            "code": "not_allowed",
            "name": "Не допускаются"
        },
        "possibility_night_work": {
            "code": "not_allowed",
            "name": "Не допускаются"
        },
        "possibility_weekends_work": {
            "code": "not_allowed",
            "name": "Не допускаются"
        },
        "max_shift_duration": undefined,
        "max_shift_duration_week": undefined,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "under_18",
        "perpetual": false
    },
    {
        "name": "Сотрудник без ограничений",
        "name_type_vacation": 'Ежегодный основной оплачиваемый отпуск',
        "additional_vacation_days": 0,
        "additional_vacation_days_month": 0,
        "consider_additional_vacation": false,
        "taken_forming_vacation_schedule": false,
        "vacation_at_convenience": false,
        "possibility_recall_from_vacation": true,
        "possibility_replace_monetary_compensation": false,
        "possibility_work_blood_donation_day" : true,
        "possibility_business_trip": {
            "code": "allowed",
            "name": "Допускается"
        },
        "training_business_trips": true,
        "possibility_overtime_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_night_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "possibility_weekends_work": {
            "code": "allowed",
            "name": "Допускается"
        },
        "max_shift_duration": 8,
        "max_shift_duration_week": 40,
        "assigning_category_employee_application": false,
        "unpaid_vacation_days": 14,
        "code": "default",
        "perpetual": true
    }
]

async function get_categories(): Promise<void> {
    const allCategories = await Application.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const promises: Promise<void>[] = [];
    for (const category of categories) {
        if (!allCategories.find(f => f.data.code == category.code)) {
            const newCategory = Application.create();
            newCategory.data.__name = category.name;
            newCategory.data.name_type_vacation = category.name_type_vacation;
            newCategory.data.additional_vacation_days = category.additional_vacation_days;
            newCategory.data.additional_vacation_days_month = category.additional_vacation_days_month;
            newCategory.data.assigning_category_employee_application = category.assigning_category_employee_application;
            newCategory.data.consider_additional_vacation = category.consider_additional_vacation;
            newCategory.data.max_shift_duration = category.max_shift_duration;
            newCategory.data.max_shift_duration_week = category.max_shift_duration_week;
            newCategory.data.possibility_business_trip = category.possibility_business_trip;
            newCategory.data.possibility_night_work = category.possibility_night_work;
            newCategory.data.possibility_overtime_work = category.possibility_overtime_work;
            newCategory.data.possibility_recall_from_vacation = category.possibility_recall_from_vacation;
            newCategory.data.possibility_replace_monetary_compensation = category.possibility_replace_monetary_compensation;
            newCategory.data.possibility_weekends_work = category.possibility_weekends_work;
            newCategory.data.possibility_work_blood_donation_day = category.possibility_work_blood_donation_day;
            newCategory.data.taken_forming_vacation_schedule = category.taken_forming_vacation_schedule;
            newCategory.data.training_business_trips = category.training_business_trips;
            newCategory.data.unpaid_vacation_days = category.unpaid_vacation_days;
            newCategory.data.vacation_at_convenience = category.vacation_at_convenience;
            newCategory.data.code = category.code;
            newCategory.data.perpetual = category.perpetual;
            promises.push(newCategory.save())
        } else {
            let app = allCategories.find(f => f.data.code == category.code)
            if (app) {
                if (!app.data.name_type_vacation || !app.data.perpetual) {
                    if (!app.data.perpetual) { app.data.perpetual = category.perpetual; }
                    if (!app.data.name_type_vacation) { app.data.name_type_vacation = category.name_type_vacation; }
                    promises.push(app.save())
                }
            }
        }
    }
    await Promise.all(promises)
}
