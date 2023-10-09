(() => {
  if (/^\/courses\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        allCoursesColumnSorts: true,
      },
      function (items) {
        if (items.allCoursesColumnSorts) {
          addColumnSortsToAllCoursesTables();
        }
      }
    );
  }

  function addColumnSortsToAllCoursesTables() {
    const courseTableIds = [
      "my_courses_table",
      "past_enrollments_table",
      "future_enrollments_table",
    ];
    for (let courseTableId of courseTableIds) {
      const table = document.getElementById(courseTableId);
      if (table) {
        const tableHeaders = table.querySelectorAll("thead tr th[scope='col']");
        for (let columnHeader of tableHeaders) {
          const columnNameClass = [...columnHeader.classList].reduce(
            (previousValue, currentValue) => {
              if (
                currentValue.startsWith("course-list-") &&
                currentValue.endsWith("-column")
              ) {
                previousValue = currentValue;
              }
              return previousValue;
            },
            ""
          );

          if (columnNameClass && !columnNameClass.includes("-star")) {
            const columnCells = [
              ...document.querySelectorAll(
                `#${courseTableId} tbody tr td.${columnNameClass}`
              ),
            ];
            if (columnCells) {
              values = [
                ...new Set([...columnCells.map((cell) => cell.innerText)]),
              ];
              if (values.length > 1) {
                const headingName = columnHeader.innerText.trim();
                columnHeader.innerHTML = `
                    <button class="ski-ui-column-sort-btn" data-ski-sort-dir="none">
                      ${headingName}
                    </button>
                  `;

                const columnSortButton = columnHeader.querySelector("button");
                if (columnSortButton) {
                  columnSortButton.addEventListener("click", () => {
                    const sortDirection = columnSortButton.dataset.skiSortDir;
                    if (sortDirection == "asc") {
                      columnSortButton.dataset.skiSortDir = "desc";
                    } else if (sortDirection == "desc") {
                      columnSortButton.dataset.skiSortDir = "asc";
                    } else {
                      columnSortButton.dataset.skiSortDir = "asc";
                    }

                    const sortButtons = [
                      ...document.querySelectorAll(
                        `#${courseTableId} thead th:not(.${columnNameClass}) button.ski-ui-column-sort-btn`
                      ),
                    ];
                    for (let sortButton of sortButtons) {
                      sortButton.dataset.skiSortDir = "none";
                    }

                    updateTableSortDisplay(
                      courseTableId,
                      columnNameClass,
                      columnSortButton.dataset.skiSortDir == "asc"
                    );
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  function updateTableSortDisplay(tableId, sortColumn, isOrderAscending) {
    const table = document.getElementById(tableId);
    if (table) {
      const tableBody = table.querySelector("tbody");
      const tableRows = [
        ...tableBody.querySelectorAll("tr.course-list-table-row"),
      ];
      if (tableRows.length > 1) {
        tableRows.sort((aRow, bRow) => {
          const aCell = aRow.querySelector(`td.${sortColumn}`);
          const bCell = bRow.querySelector(`td.${sortColumn}`);
          if (aCell && bCell) {
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
          } else {
            return 0;
          }
        });

        for (let row of tableRows) {
          row.remove();
          tableBody.insertAdjacentElement("beforeend", row);
        }
      }
    }
  }
})();
