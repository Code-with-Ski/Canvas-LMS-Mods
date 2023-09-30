(() => {
  if (/^\/courses\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        allCoursesFilters: true,
        allCoursesSearchFields: true,
      },
      function (items) {
        addSearhFiltersToAllCoursesTables(
          items.allCoursesSearchFields,
          items.allCoursesFilters
        );
      }
    );
  }

  function addSearhFiltersToAllCoursesTables(
    areSearchFieldsEnabled,
    areFiltersEnabled
  ) {
    if (areSearchFieldsEnabled || areFiltersEnabled) {
      addSearchFiltersRowToAllCoursesTables();

      if (areSearchFieldsEnabled) {
        addSearchFieldsToAllCoursesTables();
      }

      if (areFiltersEnabled) {
        addFiltersToAllCoursesTables();
      }
    }
  }

  function addSearchFiltersRowToAllCoursesTables() {
    const courseTableIds = [
      "my_courses_table",
      "past_enrollments_table",
      "future_enrollments_table",
    ];
    for (let courseTableId of courseTableIds) {
      const coursesTable = document.getElementById(courseTableId);
      if (coursesTable) {
        const coursesTableHead = coursesTable.querySelector("thead");
        if (coursesTableHead) {
          const coursesSearchAndFiltersRow = coursesTableHead.querySelector(
            "tr.ski-search-filters-row"
          );
          if (!coursesSearchAndFiltersRow) {
            coursesTableHead.insertAdjacentHTML(
              "beforeend",
              `
              <tr class="ski-search-filters-row">
                <td class="course-list-star-column"></td>
                <td class="ski-column-search-field course-list-course-title-column course-list-no-left-border"></td>
                <td class="ski-column-search-field course-list-nickname-column course-list-no-left-border"></td>
                <td class="ski-column-filter-field course-list-term-column course-list-no-left-border"></td>
                <td class="ski-column-filter-field course-list-enrolled-as-column course-list-no-left-border"></td>
                <td class="ski-column-filter-field course-list-published-column course-list-no-left-border"></td>
              </tr>
            `
            );
          }
        }
      }
    }
  }

  function addSearchFieldsToAllCoursesTables() {
    const courseTableIds = [
      "my_courses_table",
      "past_enrollments_table",
      "future_enrollments_table",
    ];
    for (let courseTableId of courseTableIds) {
      const coursesSearchAndFiltersRow = document.querySelector(
        `#${courseTableId} thead tr.ski-search-filters-row`
      );
      if (coursesSearchAndFiltersRow) {
        const courseTitleSearchCell = coursesSearchAndFiltersRow.querySelector(
          ".ski-column-search-field.course-list-course-title-column"
        );
        if (courseTitleSearchCell) {
          const courseTitleSearch = courseTitleSearchCell.querySelector(
            ".ski-course-title-search"
          );
          if (!courseTitleSearch) {
            courseTitleSearchCell.insertAdjacentHTML(
              "afterbegin",
              `
              <input type="text" class="ski-course-title-search" placeholder="Search course title" style="margin-bottom: 0;">
            `
            );

            const newCourseTitleSearch = courseTitleSearchCell.querySelector(
              ".ski-course-title-search"
            );
            if (newCourseTitleSearch) {
              const courseRows = document.querySelectorAll(
                `#${courseTableId} tbody tr.course-list-table-row`
              );
              if (courseRows && courseRows.length > 1) {
                newCourseTitleSearch.addEventListener("keyup", () =>
                  updateTableFilteredDisplay(courseTableId)
                );
                newCourseTitleSearch.addEventListener("blur", () =>
                  updateTableFilteredDisplay(courseTableId)
                );
              } else {
                newCourseTitleSearch.disabled = true;
              }
            }
          }
        }

        const courseNicknameSearchCell =
          coursesSearchAndFiltersRow.querySelector(
            ".ski-column-search-field.course-list-nickname-column"
          );
        if (courseNicknameSearchCell) {
          const nicknameSearch = courseNicknameSearchCell.querySelector(
            ".ski-course-nickname-search"
          );
          if (!nicknameSearch) {
            courseNicknameSearchCell.insertAdjacentHTML(
              "afterbegin",
              `
              <input type="text" class="ski-course-nickname-search" placeholder="Search nickname" style="margin-bottom: 0;">
            `
            );

            const newCourseNicknameSearch =
              courseNicknameSearchCell.querySelector(
                ".ski-course-nickname-search"
              );
            if (newCourseNicknameSearch) {
              const courseNicknameCells = [
                ...document.querySelectorAll(
                  `#${courseTableId} tbody tr.course-list-table-row td.course-list-nickname-column`
                ),
              ];
              const nicknames = [
                ...new Set([
                  ...courseNicknameCells.map((cell) => cell.innerText),
                ]),
              ];
              if (nicknames.length > 1) {
                newCourseNicknameSearch.addEventListener("keyup", () =>
                  updateTableFilteredDisplay(courseTableId)
                );
                newCourseNicknameSearch.addEventListener("blur", () =>
                  updateTableFilteredDisplay(courseTableId)
                );
              } else {
                newCourseNicknameSearch.disabled = true;
              }
            }
          }
        }
      }
    }
  }

  function addFiltersToAllCoursesTables() {
    const courseTableIds = [
      "my_courses_table",
      "past_enrollments_table",
      "future_enrollments_table",
    ];
    for (let courseTableId of courseTableIds) {
      const coursesSearchAndFiltersRow = document.querySelector(
        `#${courseTableId} thead tr.ski-search-filters-row`
      );
      if (coursesSearchAndFiltersRow) {
        const courseTermFilterCell = coursesSearchAndFiltersRow.querySelector(
          ".ski-column-filter-field.course-list-term-column"
        );
        if (courseTermFilterCell) {
          const courseTermFilter = courseTermFilterCell.querySelector(
            ".ski-course-term-filter"
          );
          if (!courseTermFilter) {
            courseTermFilterCell.insertAdjacentHTML(
              "afterbegin",
              `
              <select class="ski-course-term-filter">
                <option value="">All</option>
              </select>
            `
            );

            const newCourseTermFilter = courseTermFilterCell.querySelector(
              ".ski-course-term-filter"
            );
            if (newCourseTermFilter) {
              const termCells = [
                ...document.querySelectorAll(
                  `#${courseTableId} tbody tr td.course-list-term-column`
                ),
              ];
              if (termCells) {
                terms = [
                  ...new Set([
                    ...termCells.map((termCell) => termCell.innerText),
                  ]),
                ];
                terms.sort();
                if (terms.length > 1) {
                  for (let term of terms) {
                    newCourseTermFilter.insertAdjacentHTML(
                      "beforeend",
                      `
                      <option value="${term}">${term}</option>
                    `
                    );
                  }

                  newCourseTermFilter.addEventListener("change", () =>
                    updateTableFilteredDisplay(courseTableId)
                  );
                } else {
                  newCourseTermFilter.disabled = true;
                }
              }
            }
          }
        }

        const courseRoleFilterCell = coursesSearchAndFiltersRow.querySelector(
          ".ski-column-filter-field.course-list-enrolled-as-column"
        );
        if (courseRoleFilterCell) {
          const courseRoleFilter = courseRoleFilterCell.querySelector(
            ".ski-course-role-filter"
          );
          if (!courseRoleFilter) {
            courseRoleFilterCell.insertAdjacentHTML(
              "afterbegin",
              `
              <select class="ski-course-role-filter">
                <option value="">All</option>
              </select>
            `
            );

            const newCourseRoleFilter = courseRoleFilterCell.querySelector(
              ".ski-course-role-filter"
            );
            if (newCourseRoleFilter) {
              const roleCells = [
                ...document.querySelectorAll(
                  `#${courseTableId} tbody tr td.course-list-enrolled-as-column`
                ),
              ];
              if (roleCells) {
                roles = [
                  ...new Set([
                    ...roleCells.map((roleCell) => roleCell.innerText),
                  ]),
                ];
                roles.sort();
                if (roles.length > 1) {
                  for (let role of roles) {
                    newCourseRoleFilter.insertAdjacentHTML(
                      "beforeend",
                      `
                      <option value="${role}">${role}</option>
                    `
                    );
                  }

                  newCourseRoleFilter.addEventListener("change", () =>
                    updateTableFilteredDisplay(courseTableId)
                  );
                } else {
                  newCourseRoleFilter.disabled = true;
                }
              }
            }
          }
        }

        const coursePublishedFilterCell =
          coursesSearchAndFiltersRow.querySelector(
            ".ski-column-filter-field.course-list-published-column"
          );
        if (coursePublishedFilterCell) {
          const coursePublishedFilter = coursePublishedFilterCell.querySelector(
            ".ski-course-published-filter"
          );
          if (!coursePublishedFilter) {
            coursePublishedFilterCell.insertAdjacentHTML(
              "afterbegin",
              `
              <select class="ski-course-published-filter">
                <option value="">All</option>
              </select>
            `
            );

            const newCoursePublishedFilter =
              coursePublishedFilterCell.querySelector(
                ".ski-course-published-filter"
              );
            if (newCoursePublishedFilter) {
              const publishedCells = [
                ...document.querySelectorAll(
                  `#${courseTableId} tbody tr td.course-list-published-column`
                ),
              ];
              if (publishedCells) {
                states = [
                  ...new Set([
                    ...publishedCells.map(
                      (publishedCell) =>
                        publishedCell.querySelector("span").innerText
                    ),
                  ]),
                ];
                if (states.length > 1) {
                  for (let state of states) {
                    newCoursePublishedFilter.insertAdjacentHTML(
                      "beforeend",
                      `
                      <option value="${state}">${state}</option>
                    `
                    );
                  }

                  newCoursePublishedFilter.addEventListener("change", () =>
                    updateTableFilteredDisplay(courseTableId)
                  );
                } else {
                  newCoursePublishedFilter.disabled = true;
                }
              }
            }
          }
        }
      }
    }
  }

  function updateTableFilteredDisplay(tableId) {
    const table = document.getElementById(tableId);
    if (table) {
      const searchAndFiltersRow = table.querySelector(
        "thead tr.ski-search-filters-row"
      );
      const filters = [];
      const searchCells = [
        ...searchAndFiltersRow.querySelectorAll("td.ski-column-search-field"),
      ];
      for (let searchCell of searchCells) {
        const searchInput = searchCell.querySelector("input");
        if (searchInput && !searchInput.disabled) {
          const searchInputValue = new DOMParser().parseFromString(
            searchInput.value,
            "text/html"
          ).body.innerText;
          const columnNameClass = [...searchCell.classList].reduce(
            (previousValue, currentValue) => {
              if (
                currentValue.startsWith("course-list-") &&
                currentValue.endsWith("-column")
              ) {
                previousValue = currentValue;
              }
              return previousValue;
            }
          );

          filters.push({
            type: "search",
            value: searchInputValue.trim(),
            column: columnNameClass,
          });
        }
      }

      const filterCells = [
        ...searchAndFiltersRow.querySelectorAll("td.ski-column-filter-field"),
      ];
      for (let filterCell of filterCells) {
        const selectInput = filterCell.querySelector("select");
        if (selectInput && !selectInput.disabled) {
          const selectInputValue = new DOMParser().parseFromString(
            selectInput.value,
            "text/html"
          ).body.innerText;
          const columnNameClass = [...filterCell.classList].reduce(
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

          filters.push({
            type: "filter",
            value: selectInputValue.trim(),
            column: columnNameClass,
          });
        }
      }

      if (searchAndFiltersRow) {
        const tableRows = [
          ...table.querySelectorAll("tbody tr.course-list-table-row"),
        ];
        if (tableRows) {
          for (let row of tableRows) {
            let displayValue = "table-row";
            for (let filter of filters) {
              if (filter.value) {
                const cellToCheck = row.querySelector(`.${filter.column}`);
                if (cellToCheck) {
                  if (filter.type == "search") {
                    if (
                      !cellToCheck.innerText
                        .toUpperCase()
                        .includes(filter.value.toUpperCase())
                    ) {
                      displayValue = "none";
                      break;
                    }
                  } else if ((filter.type = "filter")) {
                    if (filter.column.includes("-published-")) {
                      if (
                        cellToCheck.querySelector("span").innerText.trim() !=
                        filter.value
                      ) {
                        displayValue = "none";
                        break;
                      }
                    } else {
                      if (cellToCheck.innerText.trim() != filter.value) {
                        displayValue = "none";
                        break;
                      }
                    }
                  }
                }
              }
            }

            row.style.display = displayValue;
          }
        }
      }
    }
  }
})();
