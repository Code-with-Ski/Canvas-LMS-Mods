(() => {
  if (
    /^\/courses\/[0-9]+\/groups\??[^\/]*\/?$/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        courseGroupsExpandCollapseEnabled: true,
      },
      async function (items) {
        if (items.courseGroupsExpandCollapseEnabled) {
          addExpandCollapseButtonToGroupPanels();
        }
      }
    );
  }

  function addExpandCollapseButtonToGroupPanels() {
    const groupsPanels = document.querySelectorAll(
      "div#group_categories_tabs div.tab-panel"
    );

    for (let panel of groupsPanels) {
      addExpandCollapseButtonToGroupPanel(panel);
      SkiMonitorChanges.watchForAddedNodesOfElement(panel, () => {
        if (!panel.querySelector(".ski-expand-collapse")) {
          addExpandCollapseButtonToGroupPanel(panel);
        }
      });
    }

    SkiMonitorChanges.watchForAddedNodesByParentId(
      "group_categories_tabs",
      (addedNode) => {
        if (addedNode.classList?.contains("tab-panel")) {
          addExpandCollapseButtonToGroupPanel(addedNode);
        }
      }
    );
  }

  function addExpandCollapseButtonToGroupPanel(panel) {
    const groupActionsWrapper = panel.querySelector(".group-category-actions");
    if (groupActionsWrapper) {
      const expandCollapseButton = createExpandCollapseButton(panel);
      groupActionsWrapper.insertAdjacentElement(
        "afterbegin",
        expandCollapseButton
      );
    }
  }

  function createExpandCollapseButton(panel) {
    const button = document.createElement("button");
    button.classList.add("Button", "ski-expand-collapse");
    button.innerText = "Expand All";

    button.addEventListener("click", () => {
      const isCollapseAll = button.innerText == "Collapse All";
      let groupButtons = [];
      if (isCollapseAll) {
        groupButtons = [
          ...panel.querySelectorAll("li.group-expanded a.toggle-group"),
        ];
      } else {
        groupButtons = [
          ...panel.querySelectorAll("li.group-collapsed a.toggle-group"),
        ];
      }
      for (const groupButton of groupButtons) {
        groupButton.click();
      }

      button.innerText = isCollapseAll ? "Expand All" : "Collapse All";
    });

    return button;
  }
})();
