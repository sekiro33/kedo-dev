async function getDataFromServer(): Promise<void> {
    const currentDate = new Datetime()

    let personalDocsAppsArr = await Context.fields.vacation_contract.app
        .search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.staff_user.eq(Context.data.current_user!),
            f.__createdAt.gt(new Datetime(`01.01.${currentDate.year}`, 'DD.MM.YYYY')),
        ))
        .sort("__createdAt")
        .size(8000)
        .all()

    personalDocsAppsArr = personalDocsAppsArr.filter((vacation) => {
        let vacationStatus = vacation.data.status;
        if (!!vacationStatus) {
            return !vacationStatus.includes("new") || !vacationStatus.includes("cancelled");
        };
    });

    Context.data.debug = JSON.stringify(personalDocsAppsArr.map(item => {
        if (!item.data.start || !item.data.end) {
            return;
        };
        return {
            start: item.data.start.format("DD.MM.YYYY"),
            end: item.data.end.format("DD.MM.YYYY"),
            id: item.data.__id
        };
    }));
}