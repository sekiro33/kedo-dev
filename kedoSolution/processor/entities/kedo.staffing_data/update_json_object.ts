/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/


async function parseJson(): Promise<void> {
    Context.data.max_nesting_fact = 0;
    let countOfIterations: number = 20;
    if(Context.data.maximum_nesting_in_staffing){
        countOfIterations = Context.data.maximum_nesting_in_staffing;
    }

    let count: number = 0;
    
    class Element {
        [x: string]: any;
        constructor(data: { [x: string]: any; }) {
            if (data.data.__name) {
            this._description = data.data.__name;
            } else {
            this._description = null;
            }
            if (data.data.ref_key) {
            this._ref_key = data.data.ref_key;
            } else {
            this._ref_key = null;
            }
            if (data.data.owner_key) {
            this._owner_key = data.data.owner_key;
            } else {
            this._owner_key = null;
            }
            if (data.data.parent_key) {
            this._parent_key = data.data.parent_key;
            } else {
            this._parent_key = null;
            }
            if (data.data.division_key) {
            this._division_key = data.data.division_key;
            } else {
            this._division_key = null;
            }
            if (data.data.position_key) {
            this._position_key = data.data.position_key;
            } else {
            this._position_key = null;
            }
            this._element_template = {
                description: "",
                ref_key: "",
                owner_key: "",
                parent_key: "",
                division_key: "",
                position_key: "",
                children: null,
            };
        }

        getElement() {
            const element = Object.assign(this._element_template);

            element.description = this._description;
            element.ref_key = this._ref_key;
            element.owner_key = this._owner_key;
            element.parent_key = this._parent_key;
            element.division_key = this._division_key;
            element.position_key = this._position_key;

            return element;
        }
    }

    let positionsObj: ApplicationItem<Application$kedo$position$Data,Application$kedo$position$Params>[]|undefined;
    positionsObj = await Namespace.app.position.search().where(f => f.__deletedAt.eq(null)).size(10000).all();

    let resultObj: any = { children: null };

    // ==========================================================
    let lineOfElements: any = [];

    async function checkElementParent(element: { parent_key: string; ref_key: any; owner_key: any; }) {
        // проверка на цикличные ссылки
        if(count > countOfIterations){
            Context.data.error += 'Превышен лимит вложенности штатного расписания ';
            return;
        }

        if (element.parent_key !== "00000000-0000-0000-0000-000000000000") {
            let elementParentData: ApplicationItem<Application$kedo$structural_subdivision$Data,Application$kedo$structural_subdivision$Params>|undefined;
            try {
                elementParentData = await Namespace.app.structural_subdivision.search()
                    .where((f, g) => g.and(
                        f.__deletedAt.eq(null),
                        f.ref_key.eq(element.parent_key)
                    ))
                    .first()
            }
            catch(err){
                Context.data.error += 'Ошибка при поиске приложения подразделения ';
                throw new Error(err)
            }

            if (elementParentData) {
                const elementClass = new Element(elementParentData);
                const parentElement = elementClass.getElement();
                lineOfElements.push(parentElement);
                
                count++;
                if (count > Context.data.max_nesting_fact!){
                    Context.data.max_nesting_fact = count;
                }
                
                await checkElementParent(parentElement);
            }
        } else {
            let elementOwnerData: ApplicationItem<Application$kedo$organization$Data,Application$kedo$organization$Params>|undefined;

            try {
                elementOwnerData = await Namespace.app.organization.search()
                    .where((f, g) => g.and(
                        f.__deletedAt.eq(null),
                        f.ref_key.eq(element.owner_key)
                    ))
                    .first()
            }
            catch(err){
                Context.data.error += 'Ошибка при поиске приложения юридического лица ';
                throw new Error(err)
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

    // ==========================================================

    function commitBranchIteartion(targetObj: { children: any[]|null; }, dataIndex: number) {
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

    for (let i = 0; i < positionsObj.length; i++) {
        if(!positionsObj[i].data.ref_key){
            continue;
        }
        
        await createElementTree(positionsObj[i]);

        resultObj = commitBranchIteartion(resultObj, lineOfElements.length - 1);

    }
    Context.data.json_data = JSON.stringify(resultObj);
}

async function errorHandle(): Promise<void> {
    if(!Context.data.error){
        Context.data.error = "Неизвестная ошибка выполнения сценария"
    }
}
