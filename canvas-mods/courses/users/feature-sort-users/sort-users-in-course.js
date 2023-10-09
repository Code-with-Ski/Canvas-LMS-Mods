(() => {
  if (/^\/courses\/[0-9]+\/users\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        coursePeopleSortEnabled: true,
      },
      function (items) {
        if (items.coursePeopleSortEnabled) {
          SkiMonitorChanges.watchForElementByQuery(
            "div.roster-tab div.v-gutter table.roster",
            (table) => {
              addColumnSorts(table);
            }
          );
        }
      }
    );
  }

  /*
    Changes sortable columns into buttons to use for sorting with data for
    the column name, position, and sort direction
  */
  function addColumnSorts(table) {
    const sortableColumnNames = [
      "Name",
      "Login ID",
      "SIS ID",
      "Section",
      "Role",
      "Last Activity",
      "Total Activity",
    ];
    const tableHeaders = table.querySelectorAll("thead tr th[scope='col']");
    if (!tableHeaders) { return; }
    let columnNum = 0;
    for (let columnHeader of tableHeaders) {
      columnNum++;
      const columnName = columnHeader.innerText.trim();
      if (sortableColumnNames.includes(columnName)) {
        columnHeader.innerHTML = `
            <button class="ski-ui-column-sort-btn" data-ski-sort-dir="none" data-ski-col-name="${columnName}" data-ski-col-position="${columnNum}">
              ${columnName}
            </button>
          `;

        const columnSortButton = columnHeader.querySelector("button");
        if (columnSortButton) {
          columnSortButton.addEventListener("click", () => {
            const sortDirection = columnSortButton.dataset.skiSortDir;

            const sortButtons = [
              ...document.querySelectorAll(
                `table.roster thead th button.ski-ui-column-sort-btn`
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
          "button.ski-ui-column-sort-btn[data-ski-sort-dir=asc], button.ski-ui-column-sort-btn[data-ski-sort-dir=desc]"
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
                "button.ski-ui-column-sort-btn[data-ski-sort-dir=asc], button.ski-ui-column-sort-btn[data-ski-sort-dir=desc]"
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
