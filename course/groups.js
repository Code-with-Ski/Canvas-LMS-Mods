(() => {
  if (
    /^\/courses\/[0-9]+\/groups\??[^\/]*\/?$/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        courseGroupsExportEnabled: true,
      },
      function (items) {
        if (items.courseGroupsExportEnabled) {
          addExportButton();
        }
      }
    );
  }

  /*
    Checks if user has the given course permission
  */
  async function hasCoursePermission(permissionKey) {
    let permissions = [];
    const courseId = window.location.pathname.split("/")[2];
    const url = `/api/v1/courses/${courseId}/permissions`;

    const fetches = [];
    fetches.push(
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          permissions = data;
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        })
    );

    await Promise.all(fetches);

    if (permissions) {
      return (
        permissions.hasOwnProperty(permissionKey) && permissions[permissionKey]
      );
    } else {
      return false;
    }
  }

  /*
    Adds a button to export the groups to a CSV
  */
  async function addExportButton() {
    let hasPermission = await hasCoursePermission("read_as_admin");
    if (hasPermission) {
      const groupsPanels = document.querySelectorAll(
        "div#group_categories_tabs div.tab-panel"
      );
      for (let panel of groupsPanels) {
        const importButton = panel.querySelector("button.import-groups");
        if (importButton) {
          const url = `/api/v1/group_categories/${panel.id.replace(
            "tab-",
            ""
          )}/export`;
          importButton.insertAdjacentHTML(
            "beforebegin",
            `
            <a href="${url}" class="btn" title="Export to CSV" aria-label="Export to CSV">
              <i class="icon-download"></i> Export
            </a>
          `
          );
        } else {
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.addedNodes.length > 0) {
                const importButton = panel.querySelector("button.import-groups");
                if (importButton) {
                  const url = `/api/v1/group_categories/${panel.id.replace(
                    "tab-",
                    ""
                  )}/export`;
                  const exportButton = panel.querySelector(`a[href="${url}"]`);
                  if (!exportButton) {
                    importButton.insertAdjacentHTML(
                      "beforebegin",
                      `
                      <a href="${url}" class="btn" title="Export to CSV" aria-label="Export to CSV">
                        <i class="icon-download"></i> Export
                      </a>
                    `
                    );
                  }
                }
              }
            });
          });
          observer.observe(panel, { subtree: true, childList: true });
        }
      }
    }
    
  }
})();
