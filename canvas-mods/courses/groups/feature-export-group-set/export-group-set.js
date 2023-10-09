(() => {
  if (
    /^\/courses\/[0-9]+\/groups\??[^\/]*\/?$/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        courseGroupsExportEnabled: true,
      },
      async function (items) {
        if (items.courseGroupsExportEnabled) {
          const coursePermissions = await getCoursePermissions();
          if (hasCoursePermissions(coursePermissions, ["read_as_admin"])) {
            addExportButtonToGroupPanels();
          }
        }
      }
    );
  }

  /*
    Get the user's course permissions
  */
  async function getCoursePermissions() {
    const courseId = window.location.pathname.split("/")[2];
    const url = `/api/v1/courses/${courseId}/permissions`;
    return (await SkiCanvasLmsApiCaller.getRequest(url))?.results;
  }

  /*
    Checks if user has the given course permissions
  */
  async function hasCoursePermissions(coursePermissions, permissionKeys) {
    if (!coursePermissions) {
      return false;
    }

    for (const key of permissionKeys) {
      if (!coursePermissions.hasOwnProperty(key)) {
        return false;
      }
      if (!coursePermissions[key]) {
        return false;
      }
    }

    return true;
  }

  /*
    Adds a button to export the groups to a CSV to each Group panel
  */
  function addExportButtonToGroupPanels() {
    const groupsPanels = document.querySelectorAll(
      "div#group_categories_tabs div.tab-panel"
    );
    
    for (let panel of groupsPanels) {
      addExportButtonToGroupPanel(panel);
    }

    SkiMonitorChanges.watchForAddedNodesByParentId("group_categories_tabs", (addedNode) => {
      if (addedNode.classList?.contains("tab-panel")) {
        addExportButtonToGroupPanel(addedNode);
      }
    })
  }

  function addExportButtonToGroupPanel(panel) {
    const importButton = panel.querySelector("button.import-groups");
    if (importButton) {
      const groupSetId = panel.id.replace("tab-", "");
      const exportButton = createExportButton(groupSetId);
      importButton.insertAdjacentElement("beforebegin", exportButton);
    }

    SkiMonitorChanges.watchForAddedNodesOfElement(panel, () => {
      if (!panel.querySelector(".ski-export-group")) {
        const newImportButton = panel.querySelector("button.import-groups");
        const groupSetId = panel.id.replace("tab-", "");
        const exportButton = createExportButton(groupSetId);
        newImportButton.insertAdjacentElement("beforebegin", exportButton);
      }
    });
  }

  function createExportButton(groupSetId) {
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    const url = `${baseUrl}/api/v1/group_categories/${groupSetId}/export`;
    
    const exportButton = document.createElement("a");
    exportButton.href = `${url}`
    exportButton.classList.add("Button", "ski-export-group");
    exportButton.title = "Export to CSV";
    exportButton.ariaLabel = "Export to CSV";
    exportButton.style.marginRight = "0.25rem";
    exportButton.innerHTML = `<i class="icon-line icon-download"></i> Export`;
    
    return exportButton;
  }
})();
