(() => {
  if (/^\/courses\/[0-9]+\/users\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        coursePeopleExportEnabled: true,
      },
      async function (items) {
        if (items.coursePeopleExportEnabled) {
          const permissions = await getCoursePermissions();
          if (hasCoursePermissions(permissions, ["read_as_admin"])) {
            addExportButton();
          }
        }
      }
    );
  }

  function removePullRightFromAddPeopleButton() {
    const addPeopleButton = document.getElementById("addUsers");
    if (!addPeopleButton) {
      return;
    }

    addPeopleButton.classList.remove("pull-right");
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
    Adds a button to export the users to a CSV
  */
  function addExportButton() {
    const addPeopleButton = document.getElementById("addUsers");
    const tableWrapper = document.querySelector("div.roster-tab div.v-gutter");
    if (tableWrapper) {
      if (!addPeopleButton) {
        tableWrapper.insertAdjacentHTML(
          "beforebegin",
          `
        <button id="ski-users-download" class="btn" title="Export to CSV" aria-label="Export to CSV" style="margin-left: 0.25rem;">
          <i class="icon-download"></i> Export
        </button>
      `
        );
      } else {
        const wrapper = document.createElement("div");
        wrapper.classList.add("pull-right");
        wrapper.style.marginBottom = "0.5rem";
        wrapper.style.display = "flex";

        removePullRightFromAddPeopleButton();
        wrapper.append(addPeopleButton);
        wrapper.insertAdjacentHTML(
          "beforeend",
          `
            <button id="ski-users-download" class="btn" title="Export to CSV" aria-label="Export to CSV" style="margin-left: 0.25rem;">
              <i class="icon-download"></i> Export
            </button>
          `
        );
        tableWrapper.insertAdjacentElement("beforebegin", wrapper);
      }

      const downloadButton = document.getElementById("ski-users-download");
      if (downloadButton) {
        downloadButton.addEventListener("click", () => {
          const rows = document.querySelectorAll(
            "div.roster-tab table tbody tr"
          );
          if (rows.length >= 25) {
            const continueWithDownload = confirm(
              `This will only download the users that are currently listed in the table.\n\nIf the class is large, be sure all rows have loaded before downloading.\n\nClick 'OK' to continue with the download`
            );
            if (continueWithDownload) {
              downloadUsersAsCSV();
            }
          } else {
            downloadUsersAsCSV();
          }
        });
      }
    }
  }

  /*
    Gets the data from the table of users and formats it for CSV.
    After getting the data, it creates a temporary link to download
    the resulting file.
  */
  function downloadUsersAsCSV() {
    // Select rows from table_id
    const rows = document.querySelectorAll(
      "table.roster thead tr, table.roster tbody tr"
    );

    // Construct csv
    const csv = [];
    let lastActivityColumnIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = [];
      const cols = rows[i].querySelectorAll("td, th");
      for (let j = 1; j < cols.length - 1; j++) {
        let data = "";
        if (row > 0 && j == lastActivityColumnIndex) {
          data = cols[j].dataset.htmlTooltipTitle;
        } else {
          data = cols[j].innerText.trim();
        }
        data = data.replace(/(\r\n|\n|\r)/gm, ";");
        data = data.replace(/(\s\s)/gm, " ");
        data = data.replace(/(; )+/gm, ";");
        data = data.replace(/"/g, '""');

        // Push escaped string
        row.push(`"${data}"`);

        if (row == 0) {
          if (cols[j].innerText.trim() == "Last Activity") {
            lastActivityColumnIndex = j;
          }
        }
      }
      csv.push(row.join(","));
    }
    const csvString = csv.join("\n");

    // Download it
    const courseId = window.location.pathname.split("/")[2];
    const filename = `export_course_${courseId}_users_${new Date().toLocaleString()}.csv`;
    const link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");
    link.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvString)
    );
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
})();
