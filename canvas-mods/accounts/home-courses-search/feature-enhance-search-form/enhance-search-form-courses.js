(() => {
  if (/^\/accounts\/[0-9]+\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        adminCoursesConcludedIcon: true,
        adminCoursesCourseCode: true,
        adminCoursesPeopleLink: true,
        adminCoursesSubaccountLink: true,
        adminCoursesGradesButton: true,
        adminCoursesBlueprintInputPreventFill: true,
        adminCoursesAdditionalSearchInputs: true,
      },
      async function (items) {
        if (
          items.adminCoursesBlueprintInputPreventFill ||
          items.adminCoursesAdditionalSearchInputs
        ) {
          watchForSearchForm(
            items.adminCoursesBlueprintInputPreventFill,
            items.adminCoursesAdditionalSearchInputs
          );
        }
      }
    );
  }

  /*
    Modify the flex settings for "Show only blueprint courses" so it doesn't
    grow to the remaining space
  */
  function updateSearchFormBlueprintOverflow() {
    const blueprintCoursesSpan = document.querySelector(
      "div#content form > span > span > span > span > span:nth-child(2) > span:nth-child(2)"
    );
    if (blueprintCoursesSpan) {
      blueprintCoursesSpan.style.flex = "initial";
    }
  }

  function watchForSearchForm(adjustButtonOverflow, addAdditionalInputs) {
    const searchForm = document.querySelector("div#content > div > div > form");
    if (!searchForm) {
      const observer = new MutationObserver(() => {
        const loadedSearchForm = document.querySelector(
          "div#content > div > div > form"
        );
        if (loadedSearchForm) {
          observer.disconnect();
          if (adjustButtonOverflow) {
            updateSearchFormBlueprintOverflow();
          }
          if (addAdditionalInputs) {
            addAdditionalSearchOptions();
          }
        }
      });
      observer.observe(document.body, { childList: true });
    } else {
      if (adjustButtonOverflow) {
        updateSearchFormBlueprintOverflow();
      }
      if (addAdditionalInputs) {
        addAdditionalSearchOptions();
      }
    }
  }

  function addAdditionalSearchOptions() {
    const rowOfSearchOptions = document.querySelector(
      "div#content form > span > span > span > span > span:nth-child(2)"
    );
    if (rowOfSearchOptions) {
      rowOfSearchOptions.insertAdjacentHTML(
        "afterbegin",
        `
        <div class="ic-Form-control" style="max-width: 20rem; padding-left: 0.375rem; padding-right: 0.375rem;">
          <select id="ski-course-search-state-select" class="ic-Input">
            <optgroup label="Select course state">
              <option value="">All Course States</option>
              <option value="true">Published Only</option>
              <option value="false">Unpublished Only</option>
            </optgroup>
          </select>
        </div>
      `
      );

      const searchForm = document.querySelector("div#content form");
      searchForm.insertAdjacentHTML(
        "afterend",
        `
        <div style="text-align: right;">
          <button data-sort="" id="ski-course-search-course-id-sort-btn" class="Button">Sort by Course ID - Descending</button>
        </div>
      `
      );

      const url = new URL(window.location);
      const stateSelect = document.getElementById(
        "ski-course-search-state-select"
      );
      if (stateSelect) {
        if (url.searchParams.has("published")) {
          stateSelect.value = url.searchParams.get("published");
        }
      }
      stateSelect.addEventListener("change", () => {
        const selectedState = document.getElementById(
          "ski-course-search-state-select"
        )?.value;
        const newUrl = new URL(window.location);
        if (selectedState) {
          newUrl.searchParams.set("published", selectedState);
        } else {
          if (newUrl.searchParams.has("published")) {
            newUrl.searchParams.delete("published");
          }
        }

        window.location.href = newUrl;
      });

      const canvasIdSortButton = document.getElementById(
        "ski-course-search-course-id-sort-btn"
      );
      if (canvasIdSortButton) {
        if (url.searchParams.get("sort") == "course_id") {
          if (url.searchParams.get("order") == "desc") {
            canvasIdSortButton.dataset.sort = "desc";
            canvasIdSortButton.innerText = "Sort by Course ID - Ascending";
          } else {
            canvasIdSortButton.dataset.sort = "";
            canvasIdSortButton.innerText = "Sort by Course ID - Descending";
          }
        }
      }
      canvasIdSortButton.addEventListener("click", () => {
        const sortButton = document.getElementById(
          "ski-course-search-course-id-sort-btn"
        );
        if (sortButton) {
          const sortOrder = sortButton.dataset?.sort;
          const newUrl = new URL(window.location);
          if (sortOrder == "desc") {
            canvasIdSortButton.dataset.sort = "";
            canvasIdSortButton.innerText = "Sort by Course ID - Ascending";
            newUrl.searchParams.set("sort", "course_id");
            if (newUrl.searchParams.has("order")) {
              newUrl.searchParams.delete("order");
            }
          } else {
            canvasIdSortButton.dataset.sort = "desc";
            canvasIdSortButton.innerText = "Sort by Course ID - Descending";
            newUrl.searchParams.set("sort", "course_id");
            newUrl.searchParams.set("order", "desc");
          }
          window.location.href = newUrl;
        }
      });
    }
  }
})();
