"use strict";

(() => {
  if (
    /^\/courses\/[0-9]+\/assignments/.test(window.location.pathname) &&
    !/^\/courses\/[0-9]+\/assignments\//.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        courseAssignmentsExpandCollapse: true,
      },
      function (items) {
        if (items.courseAssignmentsExpandCollapse) {
          SkiMonitorChanges.watchForElementByQuery(
            "div.header-bar-right",
            (rightHeaderBar) => {
              addExpandCollapseButton(rightHeaderBar);
            }
          );
        }
      }
    );
  }

  function addExpandCollapseButton(rightHeaderBar) {
    const button = document.createElement("button");
    button.classList.add("Button");
    button.innerText = "Collapse All";

    button.addEventListener("click", () => {
      const groupButtons = [
        ...document.querySelectorAll(
          "#ag-list .ig-list .item-group-condensed .ig-header-title button"
        ),
      ];
      if (!groupButtons) {
        return;
      }

      const isCollapseAll = button.innerText == "Collapse All";
      for (const groupButton of groupButtons) {
        const isGroupExpanded = !!groupButton.querySelector(
          "i.icon-mini-arrow-down"
        );
        if (isCollapseAll && isGroupExpanded) {
          groupButton.click();
        } else if (!isCollapseAll && !isGroupExpanded) {
          groupButton.click();
        }
      }

      button.innerText = isCollapseAll ? "Expand All" : "Collapse All";
    });

    rightHeaderBar.insertAdjacentElement("afterbegin", button);

    return button;
  }
})();
