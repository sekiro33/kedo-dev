async function parseJson(): Promise<void> {
    Context.data.max_nesting_fact = 0;
    let countOfIterations: number = 40;
    const savedIds: string[] = []
    if (Context.data.maximum_nesting_in_staffing) {
        countOfIterations = Context.data.maximum_nesting_in_staffing;
    }

    let count: number = 0;

    class Element {
        [x: string]: any;
        constructor(data: { [x: string]: any; }) {
            this._id = data.data.__id ? data.data.__id : null;
            this._description = data.data.__name ? data.data.__name : null;
            this._ref_key = data.data.ref_key ? data.data.ref_key : null;
            this._owner_key = data.data.owner_key ? data.data.owner_key : null;
            this._parent_key = data.data.subdivision ? data.data.subdivision.id : null;
            this._division_key = data.data.division_key ? data.data.division_key : null;
            this._position_key = data.data.position_key ? data.data.position_key : null;
            this._org_id = data.data.organization ? data.data.organization.id : null
            this._element_template = {
                description: "",
                id: "",
                ref_key: "",
                owner_key: "",
                parent_key: "",
                division_key: "",
                position_key: "",
                org_id: "",
                children: null,
            }
        }

        getElement() {
            const element = Object.assign(this._element_template);
            element.id = this._id;
            element.description = this._description;
            element.ref_key = this._ref_key;
            element.owner_key = this._owner_key;
            element.parent_key = this._parent_key;
            element.division_key = this._division_key;
            element.position_key = this._position_key;
            element.org_id = this._org_id;
            element.is_subdiv = false

            return element;
        }
    }

  //  const positionsObj = await Namespace.app.position.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const positionsObj = await Namespace.app.position.search().where((f, g) => g.and(
            f.__deletedAt.eq(null),
        )).where((f, g) => g.or(
            f.is_closed.eq(false),
            f.is_closed.eq(null),
        )).size(10000).all();
    const subdivisions = await Namespace.app.structural_subdivision.search().where(f => f.__deletedAt.eq(null)).where((f, g) => g.or(
            f.is_closed.eq(false),
            f.is_closed.eq(null),
        )).size(10000).all();
    const organisations = await Namespace.app.organization.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    let resultObj: any = { children: null };

    // ==========================================================
    let lineOfElements: any = [];

    async function checkElementParent(element: { parent_key: any; ref_key: any; owner_key: any; org_id: any }) {
        // проверка на цикличные ссылки
        if (count > countOfIterations) {
            Context.data.error += 'Превышен лимит вложенности штатного расписания ';
            return;
        }

        if (element.parent_key != null) {
            if (element.parent_key !== "00000000-0000-0000-0000-000000000000") {
                let elementParentData: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params> | undefined;
                try {
                    elementParentData = subdivisions.find(x => x.data.__id == element.parent_key);
                }
                catch (err) {
                    Context.data.error += 'Ошибка при поиске приложения подразделения ';
                    throw new Error(err)
                }

                if (elementParentData) {
                    const elementClass = new Element(elementParentData);
                    const parentElement = elementClass.getElement();
                    lineOfElements.push(parentElement);
                    count++;

                    if (count > Context.data.max_nesting_fact!) {
                        Context.data.max_nesting_fact = count;
                    }

                    await checkElementParent(parentElement);
                }
            }
        } else {
            let elementOwnerData: ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params> | undefined;

            try {
                elementOwnerData = organisations.find(x => x.data.__id == element.org_id);
            }
            catch (err) {
                throw new Error(err);
            }

            if (elementOwnerData) {
                const elementClass = new Element(elementOwnerData);
                const ownerElement = elementClass.getElement();
                lineOfElements.push(ownerElement);
            }
        }
    }

    async function createElementTree(data: any) {
        lineOfElements = [];

        const elementClass = new Element(data);
        const element = elementClass.getElement();               
        lineOfElements.push(element);       
        count = 0;    
        await checkElementParent(element);
    }    

    function commitBranchIteartion(targetObj: { children: any[] | null; }, dataIndex: number) {
        if (dataIndex === -1) {
            return targetObj;
        }

        if (targetObj.children === null) {
            const nextTargetObj = commitBranchIteartion(lineOfElements[dataIndex], dataIndex - 1);
            targetObj.children = [];
            targetObj.children.push(nextTargetObj);
        } else {
            let ifFinded = false;

            targetObj.children.forEach((item) => {
                if (item.ref_key === lineOfElements[dataIndex].ref_key) {
                    const nextTargetObj = commitBranchIteartion(item, dataIndex - 1);
                    item = nextTargetObj;

                    ifFinded = true;
                }
            });

            if (!ifFinded) {
                const nextTargetObj = commitBranchIteartion(lineOfElements[dataIndex], dataIndex - 1);
                targetObj.children.push(nextTargetObj);
            }
        }
        return targetObj;
    }

    let promises: Promise<void>[] = []
    for (let i = 0; i < organisations.length; i++) {
        if (!organisations[i].data.ref_key) {
            organisations[i].data.ref_key = organisations[i].data.__id
            promises.push(organisations[i].save())
        }
    }
    await Promise.all(promises)
    promises = []

    for (let i = 0; i < positionsObj.length; i++) {
        Context.data.debug += ` ${i} `
        let positionItem = positionsObj[i];

        if(!positionItem.data.ref_key){
            positionItem.data.ref_key = positionItem.data.__id;
            await positionItem.save();
        }

        await createElementTree(positionsObj[i])
        resultObj = commitBranchIteartion(resultObj, lineOfElements.length - 1);       
        Context.data.debug += ` done ` 
        
    } 

    const processedDivIDs: string[] = [] 
    function createTreeForEmptySubdiv(subdivision: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params>, tree: any): [any, string] {
        const element = new Element(subdivision)
        const resultObjString = JSON.stringify(resultObj)
        processedDivIDs.push(subdivision.data.__id)
        
        if (!tree) {
            tree = element.getElement()
        } else {
            const elementObj = element.getElement()
            elementObj.is_subdiv = true
            elementObj.children = [tree]
            tree = elementObj
        }

        if (!!subdivision.data.subdivision) {
            const parentSubdivId = subdivision.data.subdivision!.id
            Context.data.debug += `SUBDIV ID ${parentSubdivId}`
            if (resultObjString.includes(parentSubdivId)) {
                return [tree, parentSubdivId]
            }
            const parentSubdiv = subdivisions.find((item: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params>) => {
                return item.data.__id === parentSubdivId
            })
            if (!!parentSubdiv)
                return createTreeForEmptySubdiv(parentSubdiv!, tree)
        } else{
            const orgId = subdivision.data.organization?.id
            if (!orgId) {
                return [null, ""]
            }

            if (resultObjString.includes(orgId)) {
                return [tree, orgId]
            } else {
                Context.data.debug += ` Couldnt find org of subdivision ${subdivision.data.__id} in resultObj`
                return [null, ""]
            }

        }

        return [null, ""]
    }

    function addChildByParentId(targetObj: any, parentId: string, child: any) {
        if (!targetObj.children || targetObj.children.length === 0) {
            return;
        }

        for (let i = 0; i < targetObj.children.length; i++) {
            const element = targetObj.children[i]
            if (element.id === parentId) {
                if (Array.isArray(element.children)) {
                    element.children.push(child)
                } else {
                    element.children = [child]
                }
                return
            }

            addChildByParentId(element, parentId, child)
        }
        return
    }

    // const processedOrgs: string[] = resultObj.children.map((item: any) => item.id)
    // const orgsWithoutPositions: ApplicationItem<Application$kedo$organization$Data, Application$kedo$organization$Params>[] =  organisations.filter(item => {
    //     const isProcessed = processedOrgs.find((id: string) => id === item.data.__id)
    //     return !isProcessed
    // })

    // for (let i = 0; i < orgsWithoutPositions.length; i++) {
    //     const currentOrg = orgsWithoutPositions[i]
    //     if (!currentOrg.data.ref_key) {
    //         currentOrg.data.ref_key = currentOrg.data.__id
    //         await currentOrg.save()
    //     }
    //     const orgElement = new Element(currentOrg)
    //     resultObj.children.push(orgElement.getElement())
    // }
    // const subdivisionsWithoutPositions: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params>[] = subdivisions.filter(
    //     (div: ApplicationItem<Application$kedo$structural_subdivision$Data, Application$kedo$structural_subdivision$Params>) => {
    //         return div.data.positions ? div.data.positions.length === 0 : true
    //     }
    // )
    

    // for (let i = 0; i < subdivisionsWithoutPositions.length; i++) {
    //     const item = subdivisionsWithoutPositions[i]

    //     if(!item.data.ref_key){
    //         item.data.ref_key = item.data.__id;
    //         promises.push(item.save());
    //     } 
    // }
    // Context.data.debug += ` subdivisions wo pos ${subdivisionsWithoutPositions.length} `
    // for (let i = 0; i < subdivisionsWithoutPositions.length; i++) {
    //     const item = subdivisionsWithoutPositions[i]

    //     const isProcessed = processedDivIDs.find((id: string) => id === item.data.__id)
    //     if (!!isProcessed) continue;
    //     const [tree, parentId] = createTreeForEmptySubdiv(item, null)
    //     Context.data.debug += ` parent id ${parentId} tree ${JSON.stringify(tree)}`
    //     addChildByParentId(resultObj, parentId, tree)

    // }

    if (!Context.data.error) {
        const jsonObj = Application.create();
        jsonObj.data.__name = "Объект штатного расписания от " + new Datetime().format();
        jsonObj.data.json_staffing_data = JSON.stringify(resultObj);
        await jsonObj.save();
    }
}

async function errorHandle(): Promise<void> {
    if (!Context.data.error) {
        Context.data.error = "Неизвестная ошибка выполнения сценария"
    }
}