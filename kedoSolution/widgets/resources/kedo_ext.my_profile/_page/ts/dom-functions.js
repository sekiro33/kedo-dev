const dateRegex = /^([120]{1}[0-9]{1}|3[01]{1,2}|0[1-9])\.(1[0-2]|0[1-9])\.\d{4}/

function setActive(target, isMenuItem = false, mobileView = false) {
    dataAttributeCheck: 
        if (isMenuItem) {
            if (!target.dataset.menuItem) {
                break dataAttributeCheck;
            };
            let relativeItemExists = false;
            let restMenuItems;

            if (mobileView) {
                restMenuItems = Array.from(document.querySelectorAll(".main-page_mobile-footer_buttons-container_button")).filter(item => item.dataset.menuItem && !item.dataset.menuItem.includes(target.dataset.menuItem));
                restMenuItems.push(...Array.from(document.querySelectorAll(".left-menu_item.mobile")));
                console.log(target)
                if (target.classList.contains("left-menu_item") && target.classList.contains("mobile")) {
                    const otherButton = document.querySelector(".other-item");
                    otherButton.click();
                }
            } else {
                restMenuItems = Array.from(document.querySelectorAll(".left-menu_item")).filter(item => item.dataset.menuItem && !item.dataset.menuItem.includes(target.dataset.menuItem));
            }
            restMenuItems.forEach(item => {
                if (item.classList.contains("active")) {
                    item.classList.remove("active")
                };
            });

            const relativePageItems = document.querySelectorAll(`.page-widget[data-menu-item="${target.dataset.menuItem}"]`);

            if (relativePageItems && relativePageItems.length > 0) {
                relativeItemExists = true;
                relativePageItems.forEach(item => item.classList.remove("hidden"));
            };
            
            if (relativeItemExists) {
                const restPageItems = Array.from(document.querySelectorAll(".page-widget")).filter(item => !item.dataset.menuItem.includes(target.dataset.menuItem));
                restPageItems.forEach(item => item.classList.add("hidden")); 
            };

            if (window.screen.width <= 450) {
                const header = document.querySelector(".header-container");
                const pageContainer = document.querySelector(".main-page");
                
                if ([
                    "tasks",
                    "documents",
                    "vacatons",
                    "business_trips",
                    "services",
                    "vacations"
                ].indexOf(target.dataset.menuItem) !== -1) {
                    if (!header.classList.contains("hidden")) {
                        header.classList.toggle("hidden");
                        pageContainer.classList.toggle("mobile");
                    }
                } else {
                    if (header.classList.contains("hidden")) {
                        header.classList.remove("hidden");
                    };

                    if (pageContainer.classList.contains("mobile")) {
                        pageContainer.classList.remove("mobile");
                    }
                };
            }
        };
    target.classList.toggle("active");
};

function handleFavoritesExpand(target) {
    if (target.textContent === "Свернуть") {
        target.textContent = `Все (${localStorage.getItem("services_count")})`
    } else {
        target.textContent = "Свернуть";
    }
    
    target.parentElement.previousElementSibling.classList.toggle("expand")
};

function handleNewIssueContainer(target) {
    const issueContainer = document.querySelector(".portal_new-issue_container")
    issueContainer.classList.toggle("hidden");
};

function handleIssueExpand(target) {
    const issueList = target.querySelector(".portal-new-issue_container_item-issues");
    issueList.classList.toggle("hidden");
};

function handleMobileFooter(target) {
    target.classList.toggle("active");
    const mobileFooter = document.querySelector(".main-page_mobile-footer_expand-menu");
    mobileFooter.classList.toggle("hidden");
};

function handleMobileServices() {
    const mobileHeader = document.querySelector(".main-page_mobile-footer_services_header");
    const mobileServices = document.querySelector(".main-page_mobile-footer_services");
    mobileHeader.classList.toggle("hidden")
    mobileServices.classList.toggle("hidden")
};

function getNoun(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return five;
    };
    n %= 10;
    if (n === 1) {
      return one;
    };
    if (n >= 2 && n <= 4) {
      return two;
    };
    return five;
};

function expandSearch(target, mobileView = false) {
    let expandSearchContainer;
    let expandModal = document.querySelector(".dropdown-modal");

    if (Array.from(target.classList).some(cls => cls.includes("common-content_title_search-extend_title-img"))) {
        expandSearchContainer = target.parentElement.parentElement
    } else {
        expandSearchContainer = target.nextElementSibling
    };

    expandSearchContainer.classList.toggle("expanded");
    expandModal.classList.toggle("hidden");
};

function searchStatusExpand(target) {
    let expandContainer;
    if (!target.classList.contains("input-status-values_item")) {
        expandContainer = target.parentElement.nextElementSibling;
        if (expandContainer.classList.contains("expanded")) {
            target.style.transform = "rotateZ(0)"
        } else {
            target.style.transform = "rotateZ(180deg)"
        };
    } else {
        expandContainer = target.parentElement;
        const arrow = expandContainer.parentElement.querySelector(".common-content_title_search-extend_input-status-arrow");
        arrow.style.transform = 'rotateZ(0)';
    };
    
    expandContainer.classList.toggle("expanded");
};


function handleStatusSearch(target) {
    const statusValues = target.parentElement.nextElementSibling;
    if (!statusValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
        statusValues.classList.toggle("expanded");
    };
    const statusItems = statusValues.querySelectorAll(".input-status-values_item");

    statusItems.forEach(item => {
        if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
            item.classList.toggle("hidden");
        } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
            item.classList.toggle("hidden")
        }
    });
};

function handleAuthorSearch(target) {
    const authorValues = target.parentElement.querySelector(".search-choice-items");
    if (!authorValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
        authorValues.classList.toggle("expanded");
    };
    const authorItems = authorValues.querySelectorAll(".input-author-values_item");

    authorItems.forEach(item => {
        if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
            item.classList.toggle("hidden");
        } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
            item.classList.toggle("hidden")
        };
    });
};

function handleCitySearch(target) {
    const cityValues = target.parentElement.nextElementSibling;
    if (!cityValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
        cityValues.classList.toggle("expanded");
    };
    const cityItems = cityValues.querySelectorAll(".search-item");

    cityItems.forEach(item => {
        if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
            item.classList.toggle("hidden");
        } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
            item.classList.toggle("hidden")
        };
    });
};

function handleStaffSearch(target) {
    const staffValues = target.parentElement.nextElementSibling;
    if (!staffValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
        staffValues.classList.toggle("expanded");
    };
    const staffItems = staffValues.querySelectorAll(".search-item");

    staffItems.forEach(item => {
        if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
            item.classList.toggle("hidden");
        } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
            item.classList.toggle("hidden")
        };
    });
};

function handleVacationTypeSearch(target) {
    const typeValues = target.parentElement.nextElementSibling;
    if (!typeValues.classList.contains("expanded") || !target.value || target.value.length < 1) {
        typeValues.classList.toggle("expanded");
    };
    const typeItems = typeValues.querySelectorAll(".search-item");

    typeItems.forEach(item => {
        if (!item.textContent.toLowerCase().includes(target.value.toLowerCase()) && !item.classList.contains("hidden")) {
            item.classList.toggle("hidden");
        } else if (item.textContent.toLowerCase().includes(target.value.toLowerCase()) && item.classList.contains("hidden")) {
            item.classList.toggle("hidden")
        };
    });
};

function handleStatusChoice(target) {
    const statusInput = target.parentElement.previousElementSibling.querySelector("input");
    statusInput.value = target.textContent.trim();
    statusInput.dataset.statusCode = target.dataset.statusCode;
    searchStatusExpand(target);
}

function handleStaffChoice(target) {
    const staffInput = target.parentElement.previousElementSibling.querySelector("input");
    staffInput.value = target.textContent.trim();
    staffInput.dataset.staffId = target.dataset.staffId;
    searchStatusExpand(target);
}

function handleCityChoice(target) {
    const cityInput = target.parentElement.previousElementSibling.querySelector("input");
    cityInput.value = target.textContent.trim();
    cityInput.dataset.cityId = target.dataset.cityId;
    searchStatusExpand(target);
}

function handlevacationChoice(target) {
    const typeInput = target.parentElement.previousElementSibling.querySelector("input");
    typeInput.value = target.textContent.trim();
    typeInput.dataset["vacation_code"] = target.dataset["vacation_code"];
    searchStatusExpand(target);
}

function handleAuthorChoice(target) {
    const authorInput = target.parentElement.parentElement.querySelector("input")
    authorInput.value = target.textContent.trim();
    authorInput.dataset.userId = target.dataset.userId;
    expandAuthorContainer(target);
}

function expandAuthorContainer(target, fromSearchButton = false) {
    let authorValuesContainer;
    if (fromSearchButton) {
        authorValuesContainer = target.parentElement.querySelector(".search-choice-items");
    } else {
        authorValuesContainer = target.parentElement;
    }
    authorValuesContainer.classList.toggle("expanded");
}

function checkAndSetDate(target) {
    if (!target.value || target.value.length < 1) {
        return;
    };
    const createdAtField = target.classList.contains(".created-at-input");

    if (target.value.match(dateRegex)) {
        const searchFilterData = window.sessionStorage.searchSettings
            ? JSON.parse(window.sessionStorage.getItem("searchSettings"))
            : {
                
            };
        searchFilterData.createdAt = createdAtField
            ? target.value
            : ""

        searchFilterData.validTo = createdAtField
            ? ""
            : target.value
        
        window.sessionStorage.setItem("searchSettings", JSON.stringify(searchFilterData));    
    };
};

function expandCalendar(target) {
    target.style.transform = target.style.transform 
    ? ""
    : "rotateZ(180deg)"
    const calendar = target.parentElement.nextElementSibling;
    calendar.classList.toggle("hidden");
}

function handleGlobalTasks(target) {
    const subordinateTable = document.querySelector(".tasks-page_main-content_table-content_subordinate");
    const subordinateTableMobile = document.querySelector(".tasks-page_main-content_table_subordinate_mobile");

    if (!subordinateTable.classList.contains) {
        subordinateTable.classList.toggle("hidden");
    };

    if (!subordinateTableMobile.classList.contains) {
        subordinateTable.classList.toggle("hidden");
    };

    const tasksListItems = document.querySelector(".tasks-page_main-content_task-types");

    if (target.dataset.dataType && target.dataset.dataType === "outgoingTasksChunks" || target.dataset.dataType === "subordinateTasks") {
        tasksListItems.classList.add("hidden");
    } else if (tasksListItems.classList.contains("hidden")) {
        tasksListItems.classList.remove("hidden");
    };
};

function handleSubordinateSwitch() {
    const mainTable = document.querySelector(".tasks-page_main-content_table");
    const mainTableMobile = document.querySelector(".tasks-page_main-content_mobile_container");
    const subordinateTable = document.querySelector(".tasks-page_main-content_table-content_subordinate");
    const subordinateTableMobile = document.querySelector(".tasks-page_main-content_table_subordinate_mobile");
    const paginator = document.querySelector(".tasks-page_main-content_paginator");
    [subordinateTableMobile, mainTable, paginator, subordinateTable, mainTableMobile].forEach(node => node.classList.toggle("hidden"));
};

function expandMobileTasks() {
    const mobileFooterTasksTypes = document.querySelector(".tasks-page_main-content_mobile_footer");
    mobileFooterTasksTypes.classList.toggle("hidden");
};

function expandMobileDocuments() {
    const mobileFooterDocumentsTypes = document.querySelector(".documents-page_main-content_mobile_footer")
    mobileFooterDocumentsTypes.classList.toggle("hidden");
}

function handleTasksTitle(target) {
    const tasksTitle = document.querySelector(".tasks-page_main-content_mobile_title");
    tasksTitle.textContent = target.textContent;
};

function handleServiceSelect(target) {
    target.classList.toggle("selected");
    target.selected = !target.selected;
    
    const favoriteServicesCount = localStorage.getItem("favorite_services")
        ? JSON.parse(localStorage.getItem("favorite_services")).count
        : 0
    
    let tempServicesCount = Number(localStorage.getItem("temp_services_count")) || 0;

    if (target.classList.contains("selected")) {
        tempServicesCount++;
    } else {
        tempServicesCount--;
    };
    
    localStorage.setItem("temp_services_count", tempServicesCount);

    const saveButton = document.querySelector(".services-save-button");

    if (favoriteServicesCount + tempServicesCount > 5) {
        saveButton.classList.add("blocked");
    } else if (saveButton.classList.contains("blocked")) {
        saveButton.classList.remove("blocked");
    };
};

function closeServices() {
    const servicesModal = document.querySelector(".services-page_main-content_modal");
    servicesModal.classList.toggle("hidden");
};

function handleServicesSearch(target) {
    const value = target.value;
    const issues = document.querySelectorAll(".new-issue_container_item-list");
    const columns = document.querySelectorAll(".favorite-services_choice_column");

    issues.forEach(issue => {
        const issueLabel = issue.querySelector("p");
        if (!value && issue.classList.contains("hidden")) {
            issue.classList.remove("hidden");
            return;
        };
        if (!issueLabel.textContent.toLowerCase().includes(value.toLowerCase()) && !issue.classList.contains("hidden")) {
            issue.classList.add("hidden")
        } else if (issueLabel.textContent.toLowerCase().includes(value.toLowerCase()) && issue.classList.contains("hidden")) {
            issue.classList.remove("hidden");
        };
    });
    
    columns.forEach(column => {
        const columnIssues = column.querySelectorAll(".new-issue_container_item-list");

        if (Array.from(columnIssues).every(item => item.classList.contains("hidden"))) {
            column.classList.add("hidden")
        } else if (!Array.from(columnIssues).every(item => item.classList.contains("hidden")) && column.classList.contains("hidden")) {
            column.classList.remove("hidden");
        };
    });
};

function setMiscItems(target) {
    const choice = target.dataset["choice"]
    const otherButton = choice === "family" ? document.querySelector("[data-choice='category']") : document.querySelector("[data-choice='family']");
    const itemToShow = document.querySelector(`#${choice}`);
    const otherItem = choice === "family" ? document.querySelector("#category") : document.querySelector("#family")
    itemToShow.classList.toggle("hidden");
    otherItem.classList.toggle("hidden");
    [target, otherButton].forEach(item => item.classList.toggle("pressed"));
}

function copyPassportData(copyAllData = false) {
    const allPassportNodes = document.querySelectorAll(".passport-info-item");
    let copyString = "";

    allPassportNodes.forEach(node => {
        const nodeTitle = node.querySelector(".passport-info-item_label").textContent.trim();
        const nodeValue = node.querySelector(".passport-info-item_value").textContent.trim();

        copyString += `${nodeTitle}: ${nodeValue} `;
    });

    navigator.clipboard.writeText(copyString.trim());

    if (copyAllData) {
        return copyString.trim();
    };
};

function copyMiscData(target) {
    const miscValue = target.parentElement.nextElementSibling.textContent;
    
    navigator.clipboard.writeText(miscValue);
};

function copyAll() {
    let copyString = copyPassportData(true);
    const miscValues = document.querySelectorAll(".kedo__my-profle_docs-other-info_item");

    miscValues.forEach(node => {
        const nodeLabel = node.querySelector(".other-info_text");
        const nodeValue = node.querySelector(".kedo__my-profle_docs-other-info_item-content");
        
        copyString += `${nodeLabel.textContent.trim()}: ${nodeValue.textContent.trim()} `;
    });
    
    navigator.clipboard.writeText(copyString.trim());
};

function handleUserInfoPopup() {
    const userInfoPopup = document.querySelector(".left-menu_user-info_popup");
    const popoverModal = document.querySelector(".popover-modal");
    [popoverModal, userInfoPopup].forEach(node => node.classList.toggle("hidden"));
};

function handleAppContainer(target) {
    if (!target.classList.contains("qr-modal") && !target.classList.contains("elma-app")) {
        return;
    };
    const appContainer = document.querySelector(".qr-modal");
    appContainer.classList.toggle("hidden");
};

function handleIssueDropdownModal(target) {
    const dropdown = document.querySelector(".portal_new-issue_container");
    let modal;

    if (target.classList.contains("dropdown-modal")) {
        modal = target;
    } else {
        modal = document.querySelector(".dropdown-modal");
    };

    const searchDropdowns = document.querySelectorAll(".common-content_title_search-extend.expanded");
    if (searchDropdowns && searchDropdowns.length > 0) {
        searchDropdowns.forEach(node => {
            if (node.classList.contains("expanded")) {
                node.classList.remove("expanded");
            };
        });
        modal.classList.toggle("hidden")
        return;
    };
    [dropdown, modal].forEach(node => node.classList.toggle("hidden"));

    const calendar = document.querySelectorAll(".vanilla-calendar_default")
    calendar.forEach(item => {
        if (!item.classList.contains("hidden")) {
            item.classList.toggle("hidden")
        }
    })
}