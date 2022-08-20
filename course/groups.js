(() => {
  if (/^\/courses\/[0-9]+\/groups\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        courseGroupsExportEnabled: true
      },
      function (items) {
        if (items.courseGroupsExportEnabled) {
          addExportButton();
        }
      }
    );
  }

  /*
    Adds a button to export the groups to a CSV
  */
  function addExportButton() {
    const groupsPanels = document.querySelectorAll("div#group_categories_tabs div.tab-panel");
    for (let panel of groupsPanels) {
      const importButton = panel.querySelector("button.import-groups");
      if (importButton) {
        const url = `/api/v1/group_categories/${panel.id.replace("tab-", "")}/export`;
        importButton.insertAdjacentHTML("beforebegin", `
          <a href="${url}" class="btn" title="Export to CSV" aria-label="Export to CSV">
            <i class="icon-download"></i> Export
          </a>
        `);
      }
    }
  }
})();
