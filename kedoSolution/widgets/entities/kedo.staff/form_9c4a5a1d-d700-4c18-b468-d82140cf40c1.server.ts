async function testDocs(): Promise<void> {
    let filesArr: any[] = []
        await Namespace.app.documents_for_employment.search()
            .where(item => item.staff.link(Context.data.staff!))
            .size(100)
            .all()
            .then((items) => {
                if(items){
                    filesArr.push(...items)
                }
            })

    filesArr = filesArr ? filesArr.filter((file:any) => {
        return file.data.__sourceRef.code !== 'order_for_transfer'
            && file.data.__sourceRef.code !== 'transfer_application'
            && file.data.__sourceRef.code !== 'letter_of_resignation'
            && file.data.__sourceRef.code !== 'dismissal_order'
            && file.data.__sourceRef.code !== 'job_application'
            && file.data.__sourceRef.code !== 'information_about_labor_activity'
            && file.data.__sourceRef.code !== 'electronic_interaction_agreement'
    }) : []

    filesArr = filesArr.sort((item1, item2) => {
        if(item2.data.__createdAt.after(item1.data.__createdAt)){
            return -1;
        } else {
            return 1
        }
    })
    Context.data.test = filesArr.map(doc => doc.id).join(" ");
}