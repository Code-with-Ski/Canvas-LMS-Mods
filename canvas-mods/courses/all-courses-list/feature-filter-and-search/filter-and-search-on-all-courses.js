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
      addSearchFilterWrappersToAllCoursesTables();

      if (areSearchFieldsEnabled) {
        addSearchFieldsToAllCoursesTables();
      }

      if (areFiltersEnabled) {
        addFiltersToAllCoursesTables();
      }
    }
  }

  function addSearchFilterWrappersToAllCoursesTables() {
    const courseTableIds = [
      "my_courses_table",
      "past_enrollments_table",
      "future_enrollments_table",
    ];
    for (let courseTableId of courseTableIds) {
      const coursesTable = document.getElementById(courseTableId);
      if (coursesTable) {
        const coursesTableHeadRow = coursesTable.querySelector("thead tr");
        if (coursesTableHeadRow) {
          const columnHeaders = coursesTableHeadRow.querySelectorAll("th");
          for (const header of columnHeaders) {
            const searchFilterSpan = header.querySelector(
              "span.ski-column-search-field"
            );
            if (!searchFilterSpan) {
              header.insertAdjacentHTML(
                "beforeend",
                `
                  <br />
                  <span class='ski-column-search-field'></span> 
                `
              );
            }
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
      const headings = document.querySelectorAll(
        `#${courseTableId} thead tr th`
      );
      for (const heading of headings) {
        const headingSpan = heading.querySelector("span");
        if (heading.classList.contains("course-list-course-title-column")) {
          const courseTitleSearch = heading.querySelector(
            ".ski-course-title-search"
          );
          if (!courseTitleSearch) {
            headingSpan.insertAdjacentHTML(
              "afterbegin",
              `
              <input type="text" class="ski-course-title-search" placeholder="Search course title">
            `
            );

            const newCourseTitleSearch = headingSpan.querySelector(
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
        } else if (heading.classList.contains("course-list-nickname-column")) {
          const nicknameSearch = heading.querySelector(
            ".ski-course-nickname-search"
          );
          if (!nicknameSearch) {
            headingSpan.insertAdjacentHTML(
              "afterbegin",
              `
              <input type="text" class="ski-course-nickname-search" placeholder="Search nickname">
            `
            );

            const newCourseNicknameSearch = heading.querySelector(
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
      const headings = document.querySelectorAll(
        `#${courseTableId} thead tr th`
      );
      for (const heading of headings) {
        const headingSpan = heading.querySelector("span");
        if (heading.classList.contains("course-list-term-column")) {
          const courseTermFilter = heading.querySelector(
            ".ski-course-term-filter"
          );
          if (!courseTermFilter) {
            headingSpan.insertAdjacentHTML(
              "afterbegin",
              `
              <select class="ski-course-term-filter" title="Select term to show">
                <option value="">All</option>
              </select>
            `
            );

            const newCourseTermFilter = heading.querySelector(
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
        } else if (
          heading.classList.contains("course-list-enrolled-as-column")
        ) {
          const courseRoleFilter = heading.querySelector(
            ".ski-course-role-filter"
          );
          if (!courseRoleFilter) {
            headingSpan.insertAdjacentHTML(
              "afterbegin",
              `
                <select class="ski-course-role-filter" title="Select course role to show">
                  <option value="">All</option>
                </select>
              `
            );

            const newCourseRoleFilter = headingSpan.querySelector(
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
        } else if (heading.classList.contains("course-list-published-column")) {
          const coursePublishedFilter = heading.querySelector(
            ".ski-course-published-filter"
          );
          if (!coursePublishedFilter) {
            headingSpan.insertAdjacentHTML(
              "afterbegin",
              `
              <select class="ski-course-published-filter" style="min-width: 60px;" title="Select published states to show">
                <option value="">All</option>
              </select>
            `
            );

            const newCoursePublishedFilter = headingSpan.querySelector(
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
        } else if (heading.classList.contains("course-list-star-column")) {
          const favoriteFilter = heading.querySelector(
            ".ski-course-favorite-filter"
          );
          if (!favoriteFilter) {
            headingSpan.insertAdjacentHTML(
              "afterbegin",
              `
              <select class="ski-course-favorite-filter" title="Select favorite status to show">
                <option value="">All</option>
                <option value="favorite">Favorite</option>
                <option value="not">Not Favorite</option>
              </select>
            `
            );

            const newCourseFavoriteFilter = headingSpan.querySelector(
              ".ski-course-favorite-filter"
            );
            if (newCourseFavoriteFilter) {
              const favoriteCells = [
                ...document.querySelectorAll(
                  `#${courseTableId} tbody tr td.course-list-star-column`
                ),
              ];
              if (favoriteCells) {
                const hasFavorite =
                  [
                    ...document.querySelectorAll(
                      `#${courseTableId} tbody tr td.course-list-star-column span.course-list-favoritable.course-list-favorite-course`
                    ),
                  ].length > 0;
                const hasNotFavorite =
                  [
                    ...document.querySelectorAll(
                      `#${courseTableId} tbody tr td.course-list-star-column span.course-list-favoritable:not(.course-list-favorite-course)`
                    ),
                  ].length > 0;
                if (hasFavorite && hasNotFavorite) {
                  newCourseFavoriteFilter.addEventListener("change", () =>
                    updateTableFilteredDisplay(courseTableId)
                  );
                } else {
                  newCourseFavoriteFilter.disabled = true;
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
      const searchAndFiltersRow = table.querySelector("thead tr");
      const filters = [];
      const searchCells = [
        ...searchAndFiltersRow.querySelectorAll(".ski-column-search-field"),
      ];
      for (let searchCell of searchCells) {
        const searchInput = searchCell.querySelector("input");
        if (searchInput && !searchInput.disabled) {
          const searchInputValue = new DOMParser().parseFromString(
            searchInput.value,
            "text/html"
          ).body.innerText;
          const columnNameClass = [
            ...searchCell.parentElement.classList,
          ].reduce((previousValue, currentValue) => {
            if (
              currentValue.startsWith("course-list-") &&
              currentValue.endsWith("-column")
            ) {
              previousValue = currentValue;
            }
            return previousValue;
          });

          filters.push({
            type: "search",
            value: searchInputValue.trim(),
            column: columnNameClass,
          });
        }

        const selectInput = searchCell.querySelector("select");
        if (selectInput && !selectInput.disabled) {
          const selectInputValue = new DOMParser().parseFromString(
            selectInput.value,
            "text/html"
          ).body.innerText;
          const columnNameClass = [
            ...searchCell.parentElement.classList,
          ].reduce((previousValue, currentValue) => {
            if (
              currentValue.startsWith("course-list-") &&
              currentValue.endsWith("-column")
            ) {
              previousValue = currentValue;
            }
            return previousValue;
          }, "");

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
                    } else if (filter.column.includes("-star-")) {
                      if (
                        filter.value == "favorite" &&
                        cellToCheck.querySelector(
                          "span.course-list-favoritable:not(.course-list-favorite-course)"
                        )
                      ) {
                        displayValue = "none";
                        break;
                      } else if (
                        filter.value == "not" &&
                        cellToCheck.querySelector(
                          "span.course-list-favoritable.course-list-favorite-course"
                        )
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
