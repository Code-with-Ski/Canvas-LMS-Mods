(() => {
  if (/^\/courses\/[0-9]+\/users\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        coursePeopleExportEnabled: true,
        coursePeopleInactiveFilter: true,
        coursePeopleSectionFilter: true,
        coursePeopleSortEnabled: true,
      },
      function (items) {
        if (items.coursePeopleExportEnabled) {
          addExportButton();
        }

        if (items.coursePeopleInactiveFilter) {
          onElementRendered(
            "div.roster-tab div.v-gutter",
            addInactiveUsersFilter
          );
        }

        if (items.coursePeopleSectionFilter) {
          onElementRendered("div.roster-tab div.v-gutter", addSectionFilter);
        }

        if (items.coursePeopleSortEnabled) {
          onElementRendered(
            "div.roster-tab div.v-gutter table.roster",
            addColumnSorts
          );
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
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    const url = `${baseUrl}/api/v1/courses/${courseId}/permissions`;

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
      return permissions.hasOwnProperty(permissionKey) && permissions[permissionKey];
    } else {
      return false;
    }
  }

  /*
    Checks to see if an element exists that matches the selector
    before calling a function.  If it exists, it calls the function.
    Otherwise, it increases the attempts and tries again after a short
    wait if the max attempts hasn't been reached yet.
  */
  function onElementRendered(selector, cb, _attempts) {
    let el = document.querySelectorAll(selector);
    _attempts = ++_attempts || 1;

    if (el.length) return cb(el);
    if (_attempts == 60) return;

    setTimeout(function () {
      onElementRendered(selector, cb, _attempts);
    }, 250);
  }

  /*
    Adds a button to export the users to a CSV
  */
  async function addExportButton() {
    let hasPermission = await hasCoursePermission("read_as_admin");
    if (hasPermission) {
      const roleSelect = document.querySelector(
        "div.roster-tab select[name='enrollment_role_id']"
      );
      if (roleSelect) {
        roleSelect.insertAdjacentHTML(
          "afterend",
          `
          <button id="ski-users-download" class="btn pull-right" title="Export to CSV" aria-label="Export to CSV">
            <i class="icon-download"></i> Export
          </button>
        `
        );

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
          data = cols[j].dataset.htmlTooltipTitle
        } else {
          data = cols[j].innerText.trim()
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

  /*
    Adds a checkbox to determine if inactive users should be shown or not.
    It defaults to not checked so that inactive users are hidden by default.
  */
  function addInactiveUsersFilter() {
    const rosterTableWrapper = document.querySelector(
      "div.roster-tab div.v-gutter"
    );
    if (rosterTableWrapper) {
      rosterTableWrapper.insertAdjacentHTML(
        "beforebegin",
        `
        <div class="ic-Form-control ic-Form-control--checkbox pull-right">
          <input type="checkbox" id="ski-users-inactive-filter">
          <label class="ic-Label" for="ski-users-inactive-filter">Show inactive users</label>
        </div>
      `
      );

      const inactiveUsersFilter = document.getElementById(
        "ski-users-inactive-filter"
      );
      inactiveUsersFilter.addEventListener("change", () => {
        const inactiveUsersCheckbox = document.getElementById(
          "ski-users-inactive-filter"
        );
        if (inactiveUsersCheckbox) {
          const table = document.querySelector("div.roster-tab table.roster");
          if (table) {
            if (inactiveUsersCheckbox.checked) {
              table.classList.remove("ski-inactive-hide");
            } else {
              table.classList.add("ski-inactive-hide");
            }
          }
        }
      });

      const table = document.querySelector("div.roster-tab table.roster");
      if (table) {
        table.classList.add("ski-inactive-hide");
      }

      const tableRows = [
        ...document.querySelectorAll("div.roster-tab table tbody tr"),
      ];
      tableRows.forEach((row) => {
        updateInactiveUserClass(row);
      });

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target.nodeName == "TR") {
            updateInactiveUserClass(mutation.target);
          } else {
            const addedNodes = [...mutation.addedNodes];
            addedNodes.forEach((node) => {
              if (node.nodeName == "TR") {
                updateInactiveUserClass(node);
              } else if (node.nodeName == "TABLE") {
                const inactiveUsersCheckbox = document.getElementById(
                  "ski-users-inactive-filter"
                );
                if (inactiveUsersCheckbox && !inactiveUsersCheckbox.checked) {
                  node.classList.add("ski-inactive-hide");
                }
              }
            });
          }
        });
      });
      observer.observe(rosterTableWrapper, { subtree: true, childList: true });
    }
  }

  /*
    Checks to see if the row has a label for inactive.  If it does, then it
    will add a custom class to the row that it is an inactive user. Otherwise,
    it will remove the custom class from the row for an inactive user.
  */
  function updateInactiveUserClass(row) {
    const inactiveLabel = row.querySelector(
      "td:nth-of-type(2) span.label[title='This user is currently not able to access the course']"
    );
    if (inactiveLabel) {
      row.classList.add("ski-inactive-user");
    } else {
      row.classList.remove("ski-inactive-user");
    }
  }

  /*
    Adds a select menu that will be used to filter the displayed users by 
    section name
  */
  async function addSectionFilter() {
    const roleSelect = document.querySelector(
      "div.roster-tab select[name='enrollment_role_id']"
    );
    if (roleSelect) {
      roleSelect.insertAdjacentHTML(
        "afterend",
        `
        <select name="ski-section-names" id="ski-users-section-filter" title="Show users in the selected section" aria-label="Show users in the selected section">
          <option value="">All Sections</option>
        </select>
      `
      );

      await loadSectionNames();

      const sectionsFilter = document.getElementById(
        "ski-users-section-filter"
      );
      if (sectionsFilter) {
        sectionsFilter.addEventListener("change", () => {
          const sectionsFilter = document.getElementById(
            "ski-users-section-filter"
          );
          const parsedValue = new DOMParser()
            .parseFromString(sectionsFilter.value, "text/html")
            .body.innerText.trim();

          const tableRows = [
            ...document.querySelectorAll("div.roster-tab table tbody tr"),
          ];
          tableRows.forEach((row) => {
            updateRowDisplayBasedOnSection(row, parsedValue);
          });
        });
      }

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          const sectionsFilter = document.getElementById(
            "ski-users-section-filter"
          );
          const section = new DOMParser()
            .parseFromString(sectionsFilter.value, "text/html")
            .body.innerText.trim();

          if (mutation.target.nodeName == "TR") {
            updateRowDisplayBasedOnSection(mutation.target, section);
          } else {
            const addedNodes = [...mutation.addedNodes];
            addedNodes.forEach((node) => {
              if (node.nodeName == "TR") {
                updateRowDisplayBasedOnSection(node, section);
              }
            });
          }
        });
      });

      const rosterTableWrapper = document.querySelector(
        "div.roster-tab div.v-gutter"
      );
      observer.observe(rosterTableWrapper, { subtree: true, childList: true });
    }
  }

  /*
    Gets the section names in the course and loads them into the select menu
  */
  async function loadSectionNames() {
    let sections = [];
    const courseId = window.location.pathname.split("/")[2];
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    const url = `${baseUrl}/api/v1/courses/${courseId}/sections`;

    // TODO Handle pagination
    const fetches = [];
    fetches.push(
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          sections = data;
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        })
    );

    await Promise.all(fetches);

    const sectionNames = [
      ...new Set([...sections.map((section) => section.name)]),
    ];
    sectionNames.sort();

    const sectionFilter = document.getElementById("ski-users-section-filter");
    if (sectionFilter) {
      for (let name of sectionNames) {
        sectionFilter.insertAdjacentHTML(
          "beforeend",
          `
          <option value="${name}">${name}</option>
        `
        );
      }
    }
  }

  /*
    Checks to see if the given row as a section name that matches
    the given section name
    If it does, it removes a custom class to hide the row.
    Otherwise, it adds a custom class to hide the row.
  */
  function updateRowDisplayBasedOnSection(row, section) {
    if (row) {
      if (section == "") {
        row.classList.remove("ski-hide");
      } else {
        const sections = [...row.querySelectorAll("td div.section")];
        const hasMatchingSection = sections.some((rowSection) => {
          return rowSection && rowSection.innerText.trim() == section;
        });
        if (hasMatchingSection) {
          row.classList.remove("ski-hide");
        } else {
          row.classList.add("ski-hide");
        }
      }
    }
  }

  /*
    Changes sortable columns into buttons to use for sorting with data for
    the column name, position, and sort direction
  */
  function addColumnSorts() {
    const sortableColumnNames = [
      "Name",
      "Login ID",
      "SIS ID",
      "Section",
      "Role",
      "Last Activity",
      "Total Activity",
    ];
    const table = document.querySelector("div.v-gutter table.roster");
    if (table) {
      const tableHeaders = table.querySelectorAll("thead tr th[scope='col']");
      let columnNum = 0;
      for (let columnHeader of tableHeaders) {
        columnNum++;
        const columnName = columnHeader.innerText.trim();
        if (sortableColumnNames.includes(columnName)) {
          columnHeader.innerHTML = `
              <button class="ski-column-sort-btn" data-ski-sort-dir="none" data-ski-col-name="${columnName}" data-ski-col-position="${columnNum}">
                ${columnName}
              </button>
            `;

          const columnSortButton = columnHeader.querySelector("button");
          if (columnSortButton) {
            columnSortButton.addEventListener("click", () => {
              const sortDirection = columnSortButton.dataset.skiSortDir;

              const sortButtons = [
                ...document.querySelectorAll(
                  `table.roster thead th button.ski-column-sort-btn`
                ),
              ];
              for (let sortButton of sortButtons) {
                sortButton.dataset.skiSortDir = "none";
              }

              if (sortDirection == "asc") {
                columnSortButton.dataset.skiSortDir = "desc";
              } else if (sortDirection == "desc") {
                columnSortButton.dataset.skiSortDir = "asc";
              } else {
                columnSortButton.dataset.skiSortDir = "asc";
              }

              updateTableSortDisplay(
                columnSortButton.dataset.skiColName,
                columnSortButton.dataset.skiColPosition,
                columnSortButton.dataset.skiSortDir == "asc"
              );
            });
          }
        }
      }

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          const sortButton = document.querySelector(
            "button.ski-column-sort-btn[data-ski-sort-dir=asc], button.ski-column-sort-btn[data-ski-sort-dir=desc]"
          );
          const addedNodes = [...mutation.addedNodes];
          if (sortButton) {
            if (
              addedNodes.some(
                (node) =>
                  node.nodeName == "TR" &&
                  !node.classList.contains("ski-existing-row")
              )
            ) {
              updateTableSortDisplay(
                sortButton.dataset.skiColName,
                sortButton.dataset.skiColPosition,
                sortButton.dataset.skiSortDir == "asc"
              );
            } 
          } else if (addedNodes.some((node) => node.nodeName == "TABLE")) {
              const removedNodes = [...mutation.removedNodes];
              observer.disconnect();
              addColumnSorts(); // TODO Remove recursive call

              const removedTableNodes = [...removedNodes.filter((node) => node.nodeName == "TABLE")];
              if (removedTableNodes.length > 0) {
                const removedTable = removedTableNodes[0];
                const removedSortButton = removedTable.querySelector(
                  "button.ski-column-sort-btn[data-ski-sort-dir=asc], button.ski-column-sort-btn[data-ski-sort-dir=desc]"
                );
                if (removedSortButton) {
                  const removedSortedColumnPosition = removedSortButton.dataset.skiColPosition;
                  const newSortButton = document.querySelector(`table th:nth-of-type(${removedSortedColumnPosition}) button`);
                  if (newSortButton) {
                    newSortButton.dataset.skiSortDir = removedSortButton.dataset.skiSortDir;
                    updateTableSortDisplay(
                      newSortButton.dataset.skiColName,
                      newSortButton.dataset.skiColPosition,
                      newSortButton.dataset.skiSortDir == "asc"
                    );
                  }
                }
              }
            }
        });
      });

      const rosterTableWrapper = document.querySelector(
        "div.roster-tab div.v-gutter"
      );
      observer.observe(rosterTableWrapper, { subtree: true, childList: true });
    }
  }

  /*
    Sorts the rows in the table based on the given column name, position,
    and sort order
  */
  function updateTableSortDisplay(
    sortColumnName,
    sortColumnPosition,
    isOrderAscending
  ) {
    const table = document.querySelector("table.roster");
    if (table) {
      const tableBody = table.querySelector("tbody");
      const tableRows = [...tableBody.querySelectorAll("tr.rosterUser")];
      if (tableRows.length > 1) {
        tableRows.sort((aRow, bRow) => {
          const aCell = aRow.querySelector(
            `td:nth-of-type(${sortColumnPosition})`
          );
          const bCell = bRow.querySelector(
            `td:nth-of-type(${sortColumnPosition})`
          );
          if (aCell && bCell) {
            if (sortColumnName == "Last Activity") {
              const multiplier = isOrderAscending ? 1 : -1;
              const aCellDiv = aCell.querySelector("div");
              const bCellDiv = bCell.querySelector("div");
              const aCellDivTitle = aCellDiv.dataset.htmlTooltipTitle;
              const bCellDivTitle = bCellDiv.dataset.htmlTooltipTitle;

              if (!aCellDivTitle) {
                return -1 * multiplier;
              } else if (!bCellDivTitle) {
                return 1 * multiplier;
              } else {
                const months = {
                  "Jan": 0,
                  "Feb": 1,
                  "Mar": 2,
                  "Apr": 3,
                  "May": 4,
                  "Jun": 5,
                  "Jul": 6,
                  "Aug": 7,
                  "Sep": 8,
                  "Oct": 9,
                  "Nov": 10,
                  "Dec": 11
                };

                // Handle special format case
                // TODO Determine how to handle other locale formats that may be used or update to use API calls to get time
                if (/[A-Z][a-z]{2} [0-9]{1,2}(, [0-9]{4})? at [0-9]{1,2}(:[0-9]{2})?(am|pm)/.test(aCellDivTitle) && /[A-Z][a-z]{2} [0-9]{1,2}(, [0-9]{4})? at [0-9]{1,2}(:[0-9]{2})?(am|pm)/.test(aCellDivTitle)) {
                  const aCellSplitTitle = aCellDivTitle.split(" at ");
                  const aCellDateDetails = aCellSplitTitle[0].replace(",", "").split(" ");
                  if (aCellDateDetails.length == 2) {
                    aCellDateDetails.push(new Date().getFullYear());
                  }
                  aCellDateDetails[0] = months[aCellDateDetails[0]]
                  const isACellTimeAM = aCellSplitTitle[1].endsWith("am");
                  const aCellTimeDetails = aCellSplitTitle[1].replace("am", "").replace("pm", "").split(":");
                  if (aCellTimeDetails.length == 1) {
                    aCellTimeDetails.push("00");
                  }
                  if (isACellTimeAM && Number(aCellTimeDetails[0]) == 12) {
                    aCellTimeDetails[0] = 0;
                  } else if (!isACellTimeAM && Number(aCellTimeDetails[0]) < 12) {
                    aCellTimeDetails[0] = Number(aCellTimeDetails[0]) + 12;
                  }
                  const aCellDate = new Date(aCellDateDetails[2], aCellDateDetails[0], aCellDateDetails[1], aCellTimeDetails[0], aCellTimeDetails[1]);
                  
                  const bCellSplitTitle = bCellDivTitle.split(" at ");
                  const bCellDateDetails = bCellSplitTitle[0].replace(",", "").split(" ");
                  if (bCellDateDetails.length == 2) {
                    bCellDateDetails.push(new Date().getFullYear());
                  }
                  bCellDateDetails[0] = months[bCellDateDetails[0]]
                  const isBCellTimeAM = bCellSplitTitle[1].endsWith("am");
                  const bCellTimeDetails = bCellSplitTitle[1].replace("am", "").replace("pm", "").split(":");
                  if (bCellTimeDetails.length == 1) {
                    bCellTimeDetails.push("00");
                  }
                  if (isBCellTimeAM && Number(bCellTimeDetails[0]) == 12) {
                    bCellTimeDetails[0] = 0;
                  } else if (!isBCellTimeAM && Number(bCellTimeDetails[0]) < 12) {
                    bCellTimeDetails[0] = Number(bCellTimeDetails[0]) + 12;
                  }
                  const bCellDate = new Date(bCellDateDetails[2], bCellDateDetails[0], bCellDateDetails[1], bCellTimeDetails[0], bCellTimeDetails[1]);
                  
                  return aCellDate > bCellDate ? 1 * multiplier : aCellDate < bCellDate ? -1 * multiplier : 0;
                } else {
                  return aCellDivTitle.localeCompare(bCellDivTitle) * multiplier;
                }
              }
            } else if (sortColumnName == "Total Activity") {
              const multiplier = isOrderAscending ? 1 : -1;
              const aCellTotal = aCell.innerText.trim();
              const bCellTotal = bCell.innerText.trim();
              if (aCellTotal && bCellTotal) {
                if (aCellTotal == bCellTotal) {
                  return 0;
                } else {
                  let aCellTotalTimes = aCellTotal.split(":");
                  let bCellTotalTimes = bCellTotal.split(":");
                  if (aCellTotalTimes.length > bCellTotalTimes.length) {
                    return 1 * multiplier;
                  } else if (
                    aCellTotalTimes.length < bCellTotalTimes.length
                  ) {
                    return -1 * multiplier;
                  } else {
                    if (aCellTotalTimes.length == 1) {
                      aCellTotalTimes = [...["00", "00"], ...aCellTotalTimes];
                      bCellTotalTimes = [...["00", "00"], ...bCellTotalTimes];
                    } else if (aCellTotalTimes.length == 2) {
                      aCellTotalTimes = [...["00"], ...aCellTotalTimes];
                      bCellTotalTimes = [...["00"], ...bCellTotalTimes];
                    }
                    
                    if (
                      Number(aCellTotalTimes[0]) > Number(bCellTotalTimes[0])
                    ) {
                      return 1 * multiplier;
                    } else if (
                      Number(aCellTotalTimes[0]) < Number(bCellTotalTimes[0])
                    ) {
                      return -1 * multiplier;
                    } else {
                      if (
                        Number(aCellTotalTimes[1]) >
                        Number(bCellTotalTimes[1])
                      ) {
                        return 1 * multiplier;
                      } else if (
                        Number(aCellTotalTimes[1]) <
                        Number(bCellTotalTimes[1])
                      ) {
                        return -1 * multiplier;
                      } else {
                        if (
                          Number(aCellTotalTimes[2]) >
                          Number(bCellTotalTimes[2])
                        ) {
                          return 1 * multiplier;
                        } else if (
                          Number(aCellTotalTimes[2]) <
                          Number(bCellTotalTimes[2])
                        ) {
                          return -1 * multiplier;
                        } else {
                          return 0;
                        }
                      }
                    }
                  }
                }
              } else if (aCellTotal) {
                return 1 * multiplier;
              } else {
                return -1 * multiplier;
              }
            } else {
              if (isOrderAscending) {
                return aCell.innerText
                  .toUpperCase()
                  .trim()
                  .localeCompare(bCell.innerText.toUpperCase().trim());
              } else {
                return bCell.innerText
                  .toUpperCase()
                  .trim()
                  .localeCompare(aCell.innerText.toUpperCase().trim());
              }
            }
          } else {
            return 0;
          }
        });

        for (let row of tableRows) {
          row.classList.add("ski-existing-row");
          tableBody.insertBefore(row, null);
        }
      }
    }
  }
})();
