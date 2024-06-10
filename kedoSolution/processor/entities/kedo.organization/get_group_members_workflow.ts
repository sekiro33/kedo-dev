/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

const StaffStatuses = Namespace.app.staff.fields.__status.variants;

async function getGroupMembers(): Promise<void> {
    if (!Context.data.organization) {
        throw new Error("Не указана организация");
    }

    const organization = await Context.data.organization.fetch();
    const position_head = await organization.data.position_head?.fetch();

    const head_staffs = [
        ...(position_head?.data.staff ?? []),
        ...(position_head?.data.staff_internal_combination ?? []),
        ...(position_head?.data.staff_external_combination ?? [])
    ];

    const staff_ids = [
        ...(organization.data.hr_department ?? []),
        ...(organization.data.accounting ?? []),
        ...(organization.data.signatories ?? []),
        ...(organization.data.office_managers ?? []),
        ...(organization.data.matching_finance ?? []),
        ...head_staffs,
    ].map(s => s.id);

    const staffs = await Namespace.app.staff.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.__id.in(staff_ids),
            f.__status.eq(StaffStatuses.signed_documents),
            f.ext_user.neq(null)
        ))
        .size(staff_ids.length)
        .all();

    // Отдел Кадров
    if (organization.data.hr_department && organization.data.hr_department.length > 0) {
        Context.data.hr_dep = staffs
            .filter(s => (organization.data.hr_department ?? []).findIndex(hr => hr.id === s.id) !== -1)
            .map(s => s.data.ext_user!)
    }

    // Бухгалтерия
    if (organization.data.accounting && organization.data.accounting.length > 0) {
        Context.data.accounting = staffs
            .filter(s => (organization.data.accounting ?? []).findIndex(account => account.id === s.id) !== -1)
            .map(s => s.data.ext_user!)
    }

    // Подписантов
    if (organization.data.signatories && organization.data.signatories.length > 0) {
        Context.data.signatories = staffs
            .filter(s => (organization.data.signatories ?? []).findIndex(signatory => signatory.id === s.id) !== -1)
            .map(s => s.data.ext_user!)
    }

    // Офис-менеджеров
    if (organization.data.office_managers && organization.data.office_managers.length > 0) {
        Context.data.office_managers = staffs
            .filter(s => (organization.data.office_managers ?? []).findIndex(manager => manager.id === s.id) !== -1)
            .map(s => s.data.ext_user!)
    }

    // Ответственные за финансы
    if (organization.data.matching_finance && organization.data.matching_finance.length > 0) {
        Context.data.matching_finance = staffs
            .filter(s => (organization.data.matching_finance ?? []).findIndex(finance => finance.id === s.id) !== -1)
            .map(s => s.data.ext_user!)
    }

    // Руководитель компании
    if (head_staffs && head_staffs.length > 0) {
        const org_head = staffs.find(s => head_staffs.findIndex(head => head.id === s.id) !== -1);

        Context.data.organization_head = org_head?.data.ext_user;
        Context.data.organization_head_app = org_head;
    }
}