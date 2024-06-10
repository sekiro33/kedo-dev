/* Client scripts module */
declare const document: any;
declare const console: any;
declare const window: any;
declare const performance: any;

interface StaffItem {
  description: string;
  division_key: null | string;
  owner_key: null | string;
  parent_key: null | string;
  position_key: null | string;
  ref_key: string;
  children: StaffItem[] | null;
}

enum OrgLevel {
  LegalEntity = "legal entity",
  Position = "position",
  Subdivision = "subdivision",
}

let elementTemplate: any;
let userTemplate: any;
let optionsPopupTemplate: any;
let optionsLegalPopupTemplate: any;
let optionsPositionPopupTemplate: any;
let deletePopupTemplate: any;
let addPopupTemplate: any;
let currentData: any;
let staff: any;
let staff_external_combination: any;
let staff_internal_combination: any;
let staffDataApp: any;
let positions: any;
let orgApps: any;
let subdivisionsApps: any;
let currentUser: any;
let editSubdivisionPermission: boolean;
let createSubdivisionPermission: boolean;
let createPositionPermission: boolean;
let editPositionPermission: boolean;
let deleteSubdivisionPermission: boolean;
let deletePositionPermission: boolean;
let editOrgPermission: boolean;
let deleteOrgPermission: boolean;
let createOrgPermission: boolean;
let staffOrgs: any[] = [];
let isSuperuser: boolean;

const showPopupBtnPreloader = () => {
  const btn = document.querySelector(".staff__popup-confirm")
  btn.innerText = "";
  const spinner = document.createElement("div");
  spinner.classList.add("staff-loader-img");
  btn.append(spinner)
}

const hideFormError = () => {
  const error = document.querySelector('.staff__popup-controls p')
  if (!!error) {
    error.remove();
  }
}

const showFormError = () => {
  const error = document.querySelector('.staff__popup-controls p')
  if (!error) {
    const errorElement = document.createElement('p')
    errorElement.innerText = "Заполните все поля"

    const container = document.querySelector(".staff__popup-controls")
    container.append(errorElement)
  }
}

const generateUUID = () => {
  let
    d = new Date().getTime(),
    d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
};

const closeActivePopup = () => {
  const activePopup = document.querySelector(
    ".list-item__options-popup--active"
  );

  if (!activePopup) return

  activePopup.classList.remove("list-item__options-popup--active");

  const activeOption = document.querySelector(
    ".list-item__actions--active"
  );
  if (!!activeOption) {
    activeOption.classList.remove("list-item__actions--active");
  }
}

const validate = (itemType: OrgLevel): boolean => {
  let isValid = true;

  switch (itemType) {
    case OrgLevel.Subdivision:
      isValid = !!Context.data.subdivision_name
      break;
    case OrgLevel.Position:
      isValid =
        !!Context.data.approval_date
        && !!Context.data.subdivision_amount
        && !!Context.data.subdivision_full_name
        && !!Context.data.subdivision_salary
        && !!Context.data.subdivision_short_name;
      break;
  }

  return isValid
}

const saveNewObject = async () => {
  if (!staffDataApp) {
    const staffDataset = await Namespace.app.staff_data.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
    const sortedApps = staffDataset.sort((a, b) => {
      const aDate: any = a.data.__createdAt.asDate()
      const bDate: any = b.data.__createdAt.asDate()
      return bDate - aDate
    })
    staffDataApp = sortedApps.length > 0 ? sortedApps[0] : undefined
  }
  if (!!staffDataApp) {
    staffDataApp.data.json_staffing_data = JSON.stringify(currentData)
    await staffDataApp.save()
  }
}

const getData = async () => {
  const staffDataset = await Namespace.app.staff_data.search().where(f => f.__deletedAt.eq(null)).size(10000).all()

  const sortedApps = staffDataset.sort((a, b) => {
    const aDate: any = a.data.__createdAt.asDate()
    const bDate: any = b.data.__createdAt.asDate()
    return bDate - aDate
  })
  staffDataApp = sortedApps.length > 0 ? sortedApps[0] : undefined

  if (!!staffDataApp) {
    const jsonData = JSON.parse(staffDataApp.data.json_staffing_data!);
    if (!Array.isArray(jsonData.children)) {
      staffDataApp.data.json_staffing_data = JSON.stringify({ children: [] })
      await staffDataApp.save()
      jsonData.children = []
    }
    currentData = jsonData;
    return jsonData;
  }
  const newObj = Namespace.app.staff_data.create()
  const currentDate = new Datetime()
  newObj.data.json_staffing_data = JSON.stringify({ children: [] })
  newObj.data.__name = `Штатное расписание от ${currentDate.format()}`
  currentData = { children: [] }
  await newObj.save();
  staffDataApp = newObj
  return { children: [] }

};

function deleteSearch(obj: any, targetKey: string): any {
  if (obj.children) {
    let itemId: undefined | number;
    for (let i = 0; i < obj.children.length; i++) {
      if (obj.children[i].ref_key === targetKey) {
        itemId = i
        break;
      }
    }

    if (typeof itemId === 'number') {
      obj.children.splice(itemId, 1)
      return true;
    }

    for (let item of obj.children) {
      let check = deleteSearch(item, targetKey)
      if (!!check) {
        return check
      }
    }
  }

  return null
}

function addSearch(obj: any, targetId: string): any {
  if (obj.ref_key === targetId) {
    return obj
  }
  if (obj.children) {
    for (let item of obj.children) {
      let check = addSearch(item, targetId)
      if (check) {
        return check
      }
    }
  }
  return null
}

const deleteItem = async (e: any, refKey: string, itemType: OrgLevel) => {

  switch (itemType) {
    case OrgLevel.LegalEntity:
      const orgItem = orgApps.find((f: any) => f.ref_key == refKey);
      if (!!orgItem) {
        await orgItem.delete();
      }
      break;
    case OrgLevel.Subdivision:
      const subdivisionItem = subdivisionsApps.find((f: any) => f.ref_key == refKey);
      if (!!subdivisionItem) {
        await subdivisionItem.delete();
      }
      break;
    case OrgLevel.Position:
      const positionItem = positions.find((f: any) => f.ref_key == refKey);
      if (!!positionItem) {
        await positionItem.delete();
      }
      break;
  }

  let foundItem = null;

  deleteSearch(currentData, refKey);

  const refElement = document.querySelector(`[data-key='${refKey}']`);
  refElement.remove();



  await saveNewObject();
  closePopup(e);


}

const addItem = async (itemType: OrgLevel, refKey?: string, newOrg?: boolean) => {
  //console.log(refKey)
  if (!!newOrg) {
    const newOrg = orgApps.find((f: any) => f.data.ref_key == refKey!);
    const newItem: StaffItem = {
      description: newOrg!.data.__name,
      division_key: null,
      owner_key: null,
      parent_key: null,
      position_key: null,
      ref_key: newOrg!.data.ref_key || "",
      children: []
    }
    currentData.children.push(newItem);
    await saveNewObject();

    const root = document.querySelector('.staff-wrapper')
    renderBranch(newItem, root, 0)


  } else {
    let parent: any;

    for (let i = 0; i < currentData.children.length; i++) {
      const foundParent = addSearch(currentData.children[i], refKey!);
      if (!!foundParent) {
        parent = foundParent;
        const newItem: StaffItem = {
          description: "",
          division_key: null,
          owner_key: currentData.children[i].ref_key,
          parent_key: foundParent.ref_key,
          position_key: "00000000-0000-0000-0000-000000000000",
          ref_key: generateUUID(),
          children: []
        }

        switch (itemType) {
          case OrgLevel.LegalEntity:
            newItem.description = Context.data.subdivision_name || ""
            break;
          case OrgLevel.Subdivision:
            newItem.description = Context.data.subdivision_name || "";

            //console.log(currentData.children[i].description);
            //console.log(currentData.children[i].ref_key);
            //console.log(parent);

            const newAppItem = Namespace.app.structural_subdivision.create();
            const currentOrg = orgApps.find((f: any) => f.data.ref_key == (currentData.children[i].ref_key));
            //const parentSubdivisionApp = subdivisionsApps.find((f: any) => f.ref_key == (parent.ref_key));
            const parentSubdivisionApp = await Namespace.app.structural_subdivision.search().where((f: any) => f.__deletedAt.eq(null) && f.ref_key.eq(parent.ref_key)).size(10000).first();

            //console.log(!!parentSubdivisionApp);

            newAppItem.data.organization = currentOrg;
            newAppItem.data.ref_key = newItem.ref_key;
            newAppItem.data.__name = newItem.description;
            newAppItem.data.owner_key = newItem.owner_key || "00000000-0000-0000-0000-000000000000";
            newAppItem.data.parent_key = newItem.owner_key === newItem.parent_key ? "00000000-0000-0000-0000-000000000000" : newItem.parent_key || "00000000-0000-0000-0000-000000000000";
            newAppItem.data.position_key = "00000000-0000-0000-0000-000000000000";
            newAppItem.data.subdivision = parentSubdivisionApp;

            await newAppItem.save();

            break;
          case OrgLevel.Position:
            newItem.description = Context.data.subdivision_full_name || "";
            newItem.children = null;

            const newAppPositionItem = Namespace.app.position.create();
            //console.log(currentData.children[i].description);
            //console.log(currentData.children[i].ref_key);
            //console.log(parent);
            //const currentPosOrg = orgApps.find((f: any) => f.ref_key === (currentData.children[i].ref_key));
            const currentPosOrg = await Namespace.app.organization.search().where((f: any) => f.__deletedAt.eq(null) && f.ref_key.eq(currentData.children[i].ref_key)).size(10000).first();
            //console.log(currentPosOrg);
            //const parentSubdivisionPosApp = subdivisionsApps.find((f: any) => f.ref_key === (parent.ref_key));
            const parentSubdivisionPosApp = await Namespace.app.structural_subdivision.search().where((f: any) => f.__deletedAt.eq(null) && f.ref_key.eq(parent.ref_key)).size(10000).first();
            //console.log(parentSubdivisionPosApp);

            newAppPositionItem.data.organization = currentPosOrg;
            newAppPositionItem.data.__name = newItem.description;
            newAppPositionItem.data.owner_key = newItem.owner_key || "00000000-0000-0000-0000-000000000000";
            newAppPositionItem.data.parent_key = newItem.owner_key === newItem.parent_key ? "00000000-0000-0000-0000-000000000000" : newItem.parent_key || "00000000-0000-0000-0000-000000000000";;
            newAppPositionItem.data.ref_key = newItem.ref_key;
            newAppPositionItem.data.position_key = "00000000-0000-0000-0000-000000000000";
            newAppPositionItem.data.quantity = Context.data.subdivision_amount;
            newAppPositionItem.data.salary = Context.data.subdivision_salary;
            newAppPositionItem.data.subdivision = parentSubdivisionPosApp;
            newAppPositionItem.data.approval_date = Context.data.approval_date;

            await newAppPositionItem.save()
            break;
        }
        parent.children.push(newItem)
        break;
      };
    }

    if (!!parent) {
      const refElement = document.querySelector(`[data-key='${refKey}']`);
      const arrow = refElement.querySelector(".list-item__arrow");
      arrow.style.visibility = "visible";
      const refElementChildren = refElement.querySelector(".list-item__children");
      refElementChildren.innerHTML = "";

      parent.children.forEach((child: StaffItem) => {
        renderBranch(child, refElementChildren, parseInt(refElement.dataset.level) + 1)
      })

      await saveNewObject();
    }
  };

  Context.data.subdivision_amount = undefined;
  Context.data.subdivision_full_name = undefined;
  Context.data.subdivision_short_name = undefined;
  Context.data.subdivision_salary = undefined;
  Context.data.subdivision_name = undefined;
  Context.data.approval_date = undefined;
}

const loadPositions = async (app: any, level: number, root: any) => {
  if (!!app) {
    if (app.data.staff) {
      let userApps = staff.filter((userApp: any) => {
        return !!app.data.staff.find((staffRef: any) => staffRef.id === userApp.data.__id)
      })
      if (app.data.staff_external_combination) {
        const staffExternalCombination = staff.filter((userApp: any) => {
          return !!app.data.staff_external_combination.find((staffRef: any) => staffRef.id === userApp.data.__id)
        })
        userApps = userApps.concat(staffExternalCombination);
      }
      if (app.data.staff_internal_combination) {
        const staffInternalCombination = staff.filter((userApp: any) => {
          return !!app.data.staff_internal_combination.find((staffRef: any) => staffRef.id === userApp.data.__id)
        })
        userApps = userApps.concat(staffInternalCombination);
      }

      const user_ids = userApps.map((f: any) => f.id);
      console.log(user_ids);

      for (let user of userApps) {
        const element = userTemplate.content.cloneNode(true);
        const descriptionElement = element.querySelector(".list-item__text");
        const descriptionElementNew = element.querySelector(".list-item__new-user");
        const descriptionElementSumbol = element.querySelector(".list-item__sumbol");

        descriptionElement.innerText = user.data.__name;


        const replacements = await System.replacements.search()
          .where((f, g) => g.and(
            f.absent.eq(user.data.ext_user),
            f.isInterrupted.eq(false),
            f.__deletedAt.eq(null)))
          .first();

        if (replacements && replacements.data.replacement) {
          descriptionElement.style.color = "#9c9c9c";
          descriptionElementNew.innerText = (await replacements.data.replacement.fetch()).data.__name;
          descriptionElementNew.style.display = "block";
          descriptionElementSumbol.innerText = "➔";
          descriptionElementSumbol.style.display = "block";
        } else {
          descriptionElementNew.style.display = "none";
          descriptionElementSumbol.style.display = "none";
          descriptionElement.style.color = "#1e6599";
        }

        const nameElement = element.querySelector(".list-item-container");
        nameElement.style.paddingLeft = `${27 + level * 36}px`;


        if (replacements && replacements.data.replacement) {
          const replacement_user = await replacements.data.replacement.fetch();

          const replacement_staff = await Namespace.app.staff.search()
            .where(f => f.ext_user.eq(replacement_user))
            .first();

          if (replacement_staff) {
            const cardNew = element.querySelector(".user-card-new");
            cardNew.dataset.key = replacement_staff.data.__id + 'new'

            const cardNameNew = cardNew.querySelector(".user-card__name-new");
            cardNameNew.innerText = replacement_staff.data.__name;

            if (replacement_staff.data.email) {
              const cardEmailNew = cardNew.querySelector(".user-card__email-new");
              cardEmailNew.innerText = replacement_staff.data.email?.email;
              cardEmailNew.href = `mailto: ${replacement_staff.data.email?.email}`
            }

            if (replacement_staff.data.phone) {
              const cardPhoneNew = cardNew.querySelector(".user-card__phone-new");
              cardPhoneNew.innerText = replacement_staff.data.phone?.tel;
            }

            const userImageTextNew = element.querySelector(".user-card__image-text-new");
            userImageTextNew.innerText = replacement_staff.data.full_name!.lastname[0] + replacement_staff.data.full_name!.firstname[0];

            const userTextElementNew = element.querySelector(".list-item__new-user");

            userTextElementNew.addEventListener("click", async (e: any) => {
              e.stopPropagation();
              const activeCardNew = document.querySelector(".user-card-new--active");
              if (!!activeCardNew) {
                activeCardNew.classList.remove("user-card-new--active")
              }
              const userCardNew = document.querySelector(`[data-key='${replacement_staff.data.__id}new']`);
              userCardNew.classList.toggle("user-card-new--active");
            })

            cardNew.addEventListener("click", (e: any) => {
              e.stopPropagation();
            })
          }
        }

        const card = element.querySelector(".user-card");
        card.dataset.key = user.data.__id

        const cardName = card.querySelector(".user-card__name");
        cardName.innerText = user.data.__name;

        if (user.data.email) {
          const cardEmail = card.querySelector(".user-card__email");
          cardEmail.innerText = user.data.email?.email;
          cardEmail.href = `mailto: ${user.data.email?.email}`
        }

        if (user.data.phone) {
          const cardPhone = card.querySelector(".user-card__phone");
          cardPhone.innerText = user.data.phone?.tel;
        }

        const userImageText = element.querySelector(".user-card__image-text");
        userImageText.innerText = user.data.full_name.lastname[0] + user.data.full_name.firstname[0];

        const userTextElement = element.querySelector(".list-item__text");

        userTextElement.addEventListener("click", async (e: any) => {
          e.stopPropagation();
          const activeCard = document.querySelector(".user-card--active");
          if (!!activeCard) {
            activeCard.classList.remove("user-card--active")
          }
          const userCard = document.querySelector(`[data-key='${user.data.__id}']`);
          userCard.classList.toggle("user-card--active");
        })

        card.addEventListener("click", (e: any) => {
          e.stopPropagation();
        })

        root.append(element)
      }
    }
  }
}

const renderBranch = async (branch: any, root: any, level: number) => {
  const element = elementTemplate.content.cloneNode(true);
  const descriptionElement = element.querySelector(".list-item__text");
  descriptionElement.innerText = branch.description;

  const nameElement = element.querySelector(".list-item-container");
  nameElement.style.paddingLeft = `${27 + level * 36}px`;

  const wrapper = element.querySelector('.list-item__wrapper');
  wrapper.dataset.key = branch.ref_key;
  wrapper.dataset.level = level;

  if (branch.children || level === 0 || branch.is_subdiv) {
    nameElement.classList.add("list-item__department");
    const tableRow = element.querySelector(".table__row");
    tableRow.addEventListener("click", () => {
      closeActivePopup();
      const arrow = tableRow.querySelector(".list-item__arrow");
      arrow.classList.toggle("list-item__arrow--active");
      tableRow.nextElementSibling.classList.toggle(
        "list-item__children--active"
      );
    });
    const newRoot = element.querySelector(".list-item__children");
    const departments = branch.children ? branch.children.filter((child: any) => !!child.children) : [];
    const positions = branch.children ? branch.children.filter((child: any) => !child.children) : [];
    departments.forEach((child: any) => {
      renderBranch(child, newRoot, level + 1);
    });

    positions.forEach((child: any) => {
      renderBranch(child, newRoot, level + 1);
    });

    const actionsElement = element.querySelector(".list-item__actions");

    if (!branch.children || branch.children.length === 0) {
      const arrow = tableRow.querySelector(".list-item__arrow");
      arrow.style.visibility = "hidden";
    }

    //PERMISSIONS

    let optionsPopup: any;
    optionsPopup = optionsPopupTemplate.content.cloneNode(true);

    if (createPositionPermission) {
      if (level != 0) {
        const addPositionBtn = optionsPopup.querySelector(
          ".option-list__add-position"
        );

        addPositionBtn.classList.add('enabled')

        addPositionBtn.addEventListener("click", () => {
          openAddPopup(OrgLevel.Position, branch.ref_key)
        });
      }
    }

    if (createSubdivisionPermission) {
      const addDepBtn = optionsPopup.querySelector(
        ".option-list__add-department"
      );

      addDepBtn.classList.add('enabled')

      //ADD EVENT
      addDepBtn.addEventListener("click", () => {
        openAddPopup(OrgLevel.Subdivision, branch.ref_key);
      });
    }

    let app: any;
    if (level === 0) {
      app = orgApps?.find((org: any) => {
        return org.data.ref_key === branch.ref_key
      })

      if (!app) {
        app = await Namespace.app.organization.search().where(f => f.ref_key.eq(branch.ref_key)).first();
      }

      //разграничение прав по организациям
      if (!isSuperuser) {
        let found = false;
        for (let org of staffOrgs) {
          let orgApp = await org.fetch();
          if (app.data.__id === orgApp.data.__id) {
            found = true;
            break;
          }
        }

        if (!found) {
          return;
        }
      }

    } else {
      app = subdivisionsApps?.find((subDiv: any) => {
        return subDiv.data.ref_key === branch.ref_key
      })

      if (!app) {
        app = await Namespace.app.structural_subdivision.search().where(f => f.ref_key.eq(branch.ref_key)).first();
      }
    }

    descriptionElement.innerText = app.data.__name;

    const editPermission = level === 0 ? editOrgPermission : editSubdivisionPermission;

    if (editPermission) {
      const editBtn = optionsPopup.querySelector(".option-list__edit");
      editBtn.classList.add('enabled');
      editBtn.href = `${window.location.href}(p:item/kedo/${level === 0 ? "organization" : "structural_subdivision"}/${app!.data.__id}/edit)`
    }

    const deletePermission = level === 0 ? deleteOrgPermission : editSubdivisionPermission;

    if (deleteOrgPermission) {
      const deleteBtn = optionsPopup.querySelector(".option-list__delete");
      deleteBtn.classList.add("enabled")

      //DELETE EVENT
      deleteBtn.addEventListener("click", () => {
        openDeletePopup(level === 0 ? OrgLevel.LegalEntity : OrgLevel.Subdivision, branch.ref_key)
      });
    }

    actionsElement.append(optionsPopup);

    actionsElement.addEventListener("click", (event: any) => {
      event.stopPropagation();
      const isCloseCurrent = !!event.target.querySelector(
        ".list-item__options-popup--active"
      );

      if (!isCloseCurrent) {
        const activePopup = document.querySelector(
          ".list-item__options-popup--active"
        );
        if (!!activePopup) {
          activePopup.classList.remove("list-item__options-popup--active");
        }

        const activeOption = document.querySelector(
          ".list-item__actions--active"
        );
        if (!!activeOption) {
          activeOption.classList.remove("list-item__actions--active");
        }
      }

      actionsElement.classList.toggle("list-item__actions--active");
      const popup = actionsElement.querySelector(".list-item__options-popup");
      popup.classList.toggle("list-item__options-popup--active");
    });

    if (!editPermission && !deletePermission && !createPositionPermission && !createSubdivisionPermission) {
      actionsElement.style.display = 'none'
    }
  } else {
    nameElement.classList.add("list-item__position");
    const amountElement = element.querySelector(".list-item__amount");
    const dateElement = element.querySelector(".list-item__date");
    const salaryElement = element.querySelector(".list-item__salary");
    const tableRow = element.querySelector(".table__row");

    //-----------------------------

    const actionsElement = element.querySelector(".list-item__actions");

    const optionsPopup = optionsPositionPopupTemplate.content.cloneNode(true);
    let app = positions?.find((pos: any) => {
      return pos.data.ref_key === branch.ref_key
    })

    if (!app) {
      app = await Namespace.app.position.search().where(f => f.ref_key.eq(branch.ref_key)).first();
    }
    const positionsLength = app?.data.staff?.length + app?.data.staff_internal_combination?.length + app?.data.staff_external_combination?.length;

    if (!positionsLength) {
      const arrow = element.querySelector('.list-item__arrow')
      arrow.style.visibility = "hidden"
    }
    amountElement.innerText = app?.data.quantity || "";
    dateElement.innerText = app?.data.approval_date?.format("DD.MM.YYYY") || "";
    salaryElement.innerText = app?.data.salary?.asFloat() || "";

    if (editPositionPermission) {
      const editBtn = optionsPopup.querySelector(".option-list__edit");
      editBtn.classList.add('enabled');
      editBtn.href = `${window.location.href}(p:item/kedo/position/${app!.data.__id}/edit)`
    }

    if (deletePositionPermission) {
      const deleteBtn = optionsPopup.querySelector(".option-list__delete");
      deleteBtn.classList.add('enabled');
      deleteBtn.addEventListener("click", () => {
        openDeletePopup(OrgLevel.Position, branch.ref_key)
      });
    }

    if (!editPositionPermission && !deletePositionPermission) {
      actionsElement.style.display = 'none'
    }

    actionsElement.append(optionsPopup);

    tableRow.addEventListener("click", async () => {
      closeActivePopup();
      const arrow = tableRow.querySelector(".list-item__arrow");
      arrow.classList.toggle("list-item__arrow--active");
      tableRow.nextElementSibling.classList.toggle(
        "list-item__children--active"
      );
      const refElement = document.querySelector(`[data-key='${app?.data.ref_key}']`);
      const childrenContainer = refElement.querySelector('.list-item__children');
      if (childrenContainer.children?.length === 0) {
        loadPositions(app, ++level, childrenContainer)
      }
    })

    actionsElement.addEventListener("click", (event: any) => {
      event.stopPropagation();
      const isCloseCurrent = !!event.target.querySelector(
        ".list-item__options-popup--active"
      );

      if (!isCloseCurrent) {
        const activePopup = document.querySelector(
          ".list-item__options-popup--active"
        );
        if (!!activePopup) {
          activePopup.classList.remove("list-item__options-popup--active");
        }

        const activeOption = document.querySelector(
          ".list-item__actions--active"
        );
        if (!!activeOption) {
          activeOption.classList.remove("list-item__actions--active");
        }
      }

      actionsElement.classList.toggle("list-item__actions--active");
      const popup = actionsElement.querySelector(".list-item__options-popup");
      popup.classList.toggle("list-item__options-popup--active");
    });
  }

  root.append(element);
};

const renderList = async (data: any, rootElement: any) => {
  if (data.children) {
    for (let i = 0; i < data.children.length; i++) {
      renderBranch(data.children[i], rootElement, 0);
    }
  }
};

const init = async () => {
  const root = document.querySelector(".staff-wrapper");

  const data = await getData();

  const addOrgBtn = document.querySelector('.staff__new-org-button');

  if (createOrgPermission) {
    addOrgBtn.classList.add('staff__new-org-button--active')
    addOrgBtn.href = `${window.location.href}(p:item/kedo/organization)`;

    addOrgBtn.addEventListener("click", () => {
      let popupInterval: any

      popupInterval = window.setInterval(async () => {
        const modal = document.querySelector(".complex-popup");
        //console.log('start1')
        if (!!modal) {
          //console.log('start1 modal found')
          const confirmBtn = modal.querySelector(".btn.btn-primary")
          const numberOfOrgs = await Namespace.app.organization.search().count();

          confirmBtn.addEventListener("click", async () => {
            //console.log('start2')
            let checkInterval: any;

            checkInterval = window.setInterval(async () => {
              const testOrgNumber = await Namespace.app.organization.search().count();

              if (testOrgNumber > numberOfOrgs) {
                window.clearInterval(checkInterval)
                const allOrg = await Namespace.app.organization.search().where(f => f.__deletedAt.eq(null)).size(10000).all();
                const sortedOrgs = allOrg.sort((a, b) => {
                  const aDate: any = a.data.__createdAt.asDate()
                  const bDate: any = b.data.__createdAt.asDate()
                  return bDate - aDate
                })
                const newOrg = sortedOrgs[0]
                if (newOrg) {
                  //console.log('new org')
                  //console.log(newOrg)
                  newOrg.data.ref_key = generateUUID()
                  //console.log(newOrg.data.ref_key)
                  await newOrg.save()
                  orgApps.push(newOrg)

                  await addItem(OrgLevel.LegalEntity, newOrg.data.ref_key, true)
                }
              }
            }, 1500)

          })

          window.clearInterval(popupInterval);
        }
      }, 1000)
    })



  }

  renderList(data, root);
};

const closeOptionsPopup = () => {
  const activeActions = document.querySelector(
    ".list-item__actions--active"
  );
  if (!!activeActions) {
    activeActions.classList.remove("list-item__actions--active");
  }

  const activeOptions = document.querySelector(".list-item__options-popup--active");
  if (!!activeOptions) {
    activeOptions.classList.remove("list-item__options-popup--active");
  }
}

const closePopup = (e: any, containerId?: string) => {
  e.stopPropagation()
  if (containerId) {
    const elements = document.querySelector(`#${containerId}`)
    const preloadContainer = document.querySelector('.ui-teml');

    preloadContainer.append(elements)
  }

  const wrapper = document.querySelector(".staff__backdrop")
  wrapper.remove();
  closeOptionsPopup()
}

const openDeletePopup = (type: OrgLevel, refKey: string) => {
  let title: string = "";
  let description: string = "";

  switch (type) {
    case OrgLevel.LegalEntity:
      title = "Удалить организацию ?";
      description = "Организация и данные о ней удалятся навсегда — восстановить его её получится.";
      break;
    case OrgLevel.Subdivision:
      title = "Удалить подразделение ?";
      description = "Подразделение и данные о нём удалятся навсегда — восстановить его не получится.";
      break;
    case OrgLevel.Position:
      title = "Удалить должность ?";
      description = "Должность и данные о ней удалятся навсегда — восстановить её не получится.";
      break;
  }
  const popup = deletePopupTemplate.content.cloneNode(true);
  const popupTitle = popup.querySelector(".staff__popup-title-text");
  popupTitle.innerText = title;

  const popupDescription = popup.querySelector(".staff__popup-description-text");
  popupDescription.innerText = description;

  const innerPopup = popup.querySelector(".staff__popup");
  innerPopup.addEventListener("click", (e: any) => {
    e.stopPropagation()
  })

  const backdrop = popup.querySelector(".staff__backdrop")
  backdrop.addEventListener("click", closePopup)

  const cancelIcon = popup.querySelector('.staff__popup-exit-icon')
  cancelIcon.addEventListener("click", closePopup)

  const cancelBtn = popup.querySelector('.staff__popup-cancel')
  cancelBtn.addEventListener("click", closePopup)

  const confirmBtn = popup.querySelector('.staff__popup-confirm')
  confirmBtn.addEventListener("click", async (e: any) => {
    showPopupBtnPreloader()
    await deleteItem(e, refKey, type)
  })

  const wrapper = document.querySelector(".app-wrapper");
  wrapper.append(popup)
}

const openAddPopup = (itemType: OrgLevel, refKey?: string) => {
  let elementId: string = "";
  let title: string = "";
  switch (itemType) {
    case OrgLevel.LegalEntity:
      return;
      title = "Добавить организацию";
      elementId = "org-add-popup";
      break;
    case OrgLevel.Subdivision:
      title = "Добавить подразделение";
      elementId = "subdivision-add-popup";
      break;
    case OrgLevel.Position:
      title = "Добавить должность";
      elementId = "position-add-popup";
      break;
  }

  const innerPopupContent = document.querySelector(`#${elementId}`)

  const popup = addPopupTemplate.content.cloneNode(true);
  const popupTitle = popup.querySelector(".staff__popup-title-text");
  popupTitle.innerText = title;

  const popupDescription = popup.querySelector(".staff__popup-description");
  popupDescription.append(innerPopupContent);

  const innerPopup = popup.querySelector(".staff__popup");
  innerPopup.addEventListener("click", (e: any) => {
    e.stopPropagation();
  })

  const backdrop = popup.querySelector(".staff__backdrop");
  backdrop.addEventListener("click", (e: any) => {
    closePopup(e, elementId);
  })

  const cancelIcon = popup.querySelector('.staff__popup-exit-icon');
  cancelIcon.addEventListener("click", (e: any) => {
    closePopup(e, elementId);
  })

  const cancelBtn = popup.querySelector('.staff__popup-cancel');
  cancelBtn.addEventListener("click", (e: any) => {
    closePopup(e, elementId);
  })

  //@TODO confirm add function
  const confirmBtn = popup.querySelector('.staff__popup-confirm');
  confirmBtn.addEventListener("click", async (e: any) => {
    const isValid = validate(itemType)
    if (isValid) {
      hideFormError()
      showPopupBtnPreloader()
      await addItem(itemType, refKey);
      closePopup(e, elementId);
    } else {
      showFormError()
    }
  })

  const wrapper = document.querySelector(".app-wrapper");
  wrapper.append(popup);

}

async function renderPage() {
  elementTemplate = document.querySelector(".schedule__template");
  optionsPopupTemplate = document.querySelector(".options-template");
  userTemplate = document.querySelector(".schedule__template--person")
  optionsLegalPopupTemplate = document.querySelector(
    ".options-template__legal"
  );
  optionsPositionPopupTemplate = document.querySelector(
    ".options-template__position"
  );
  deletePopupTemplate = document.querySelector(".staff-delete-popup");
  addPopupTemplate = document.querySelector(".staff-add-popup")

  const pageWrapper = document.querySelector('.staff-page-wrapper');

  pageWrapper.addEventListener("click", () => {
    const activeCard = document.querySelector(".user-card--active");
    if (!activeCard) return;

    activeCard.classList.remove("user-card--active");
  })

  pageWrapper.addEventListener("click", () => {
    const activeCard = document.querySelector(".user-card-new--active");
    if (!activeCard) return;

    activeCard.classList.remove("user-card-new--active");
  })

  const positionsPromise = Namespace.app.position.search().where((f: any) => f.__deletedAt.eq(null)).size(10000).all();
  const subdivisionsAppsPromise = Namespace.app.structural_subdivision.search().where((f: any) => f.__deletedAt.eq(null)).size(10000).all();
  const orgAppsPromise = Namespace.app.organization.search().where((f: any) => f.__deletedAt.eq(null)).size(1000).all();
  const currentUserPromise = System.users.getCurrentUser();

  const positionPermissionPromise = Namespace.app.position.getPermissions();
  const orgPermissionPromise = Namespace.app.organization.getPermissions();
  const subdivisionPermissionPromise = Namespace.app.structural_subdivision.getPermissions();
  //console.log(await positionPermissionPromise)

  let positionPermissions: any, orgPermissions: any, subdivisionPermissions: any;

  [positionPermissions, orgPermissions, subdivisionPermissions, positions, orgApps, subdivisionsApps, currentUser] = await Promise.all(
    [positionPermissionPromise, orgPermissionPromise, subdivisionPermissionPromise, positionsPromise, orgAppsPromise, subdivisionsAppsPromise, currentUserPromise]);

  // FILL PERMISSIONS
  //console.log(orgPermissions);

  isSuperuser = !!currentUser.data.groupIds.find((group: any) => group.id === '331e62d2-072e-58ac-9581-74abcc67f050' || group.id === 'd6000da0-c9aa-55eb-9882-f118b432730b')

  if (isSuperuser) {
    createOrgPermission = true;
    editOrgPermission = true;
    deleteOrgPermission = true;
    createSubdivisionPermission = true;
    editSubdivisionPermission = true;
    deleteSubdivisionPermission = true;
    createPositionPermission = true;
    editPositionPermission = true;
    deletePositionPermission = true;
  } else {

    //разграничение прав по организациям
    const staff = await Namespace.app.staff.search().where((f, g) => g.and(
      f.__deletedAt.eq(null),
      f.ext_user.eq(currentUser)
    )).first();

    //console.log(staff);

    if (staff && staff.data.employment_table) {
      for (let item of staff.data.employment_table) {
        if (item.organization) {
          staffOrgs.push(item.organization);
        }
      };
      //console.log(staffOrg);
    }

    //org
    const orgPermissionGroups = orgPermissions.__permissions.values;
    const orgPermissionsSet = new Set();
    for (let i = 0; i < orgPermissionGroups.length; i++) {
      const userGroupPermiss = currentUser.data.groupIds?.find((group: any) => group.id === orgPermissionGroups[i].group.id);
      if (!userGroupPermiss) continue;

      orgPermissionGroups[i].types?.forEach((typePermiss: string) => {
        orgPermissionsSet.add(typePermiss)
      })
    };

    createOrgPermission = orgPermissionsSet.has('create');
    editOrgPermission = orgPermissionsSet.has('update');
    deleteOrgPermission = orgPermissionsSet.has('delete');
    //------------

    //subdivision
    const subPermissionGroups = subdivisionPermissions.__permissions.values;
    const subPermissionsSet = new Set();
    for (let i = 0; i < subPermissionGroups.length; i++) {
      const userGroupPermiss = currentUser.data.groupIds?.find((group: any) => group.id === subPermissionGroups[i].group.id);
      if (!userGroupPermiss) continue;

      subPermissionGroups[i].types?.forEach((typePermiss: string) => {
        subPermissionsSet.add(typePermiss)
      })
    };

    createSubdivisionPermission = subPermissionsSet.has('create');
    editSubdivisionPermission = subPermissionsSet.has('update');
    deleteSubdivisionPermission = subPermissionsSet.has('delete');
    //------------

    //position
    const posPermissionGroups = positionPermissions.__permissions.values;
    const posPermissionsSet = new Set();
    for (let i = 0; i < posPermissionGroups.length; i++) {
      const userGroupPermiss = currentUser.data.groupIds?.find((group: any) => group.id === posPermissionGroups[i].group.id);
      if (!userGroupPermiss) continue;

      posPermissionGroups[i].types?.forEach((typePermiss: string) => {
        posPermissionsSet.add(typePermiss)
      })
    };

    createPositionPermission = posPermissionsSet.has('create');
    editPositionPermission = posPermissionsSet.has('update');
    deletePositionPermission = posPermissionsSet.has('delete');
    //------------
  }

  init();

  staff = await Namespace.app.staff.search().where((f: any) => f.__deletedAt.eq(null)).size(10000).all();
}