(() => {
  if (/^\/accounts\/[0-9]+\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminCoursesCourseCode: true,
      adminCoursesBlueprintInputPreventFill: true
    }, function (items) {
      if (items.adminCoursesCourseCode) {
        updateCourseSearchResults();
      }
      if (items.adminCoursesBlueprintInputPreventFill) {
        updateSearchForm();
      }
      addAdditionalSearchOptions();
    });
  }

  /*
    Modify the flex settings for "Show only blueprint courses" so it doesn't
    grow to the remaining space
  */
  function updateSearchForm() {
    const blueprintCoursesSpan = document.querySelector("div#content form > span > span > span > span > span:nth-child(2) > span:nth-child(2)");
    if (blueprintCoursesSpan) {
      blueprintCoursesSpan.style.flex = "initial";
    }
  }

  /*
    Uses a mutation observer to detect changes.  When a new table row is added
    for the course search results, it will perform an API call to get the course
    details. Then, it adds the course code in the table data cell with the 
    course name.
  */
  function updateCourseSearchResults() {
    const mainContentDiv = document.querySelector("div#content");

    const courseResultsObserver = new MutationObserver(mutations => {
      mutations.forEach(mutationRecord => {
        let newNodes = mutationRecord.addedNodes;
        newNodes.forEach(newNode => {
          if (newNode.nodeName == "TR") {
            const courseNameLink = newNode.querySelector("td > a[href*='/courses/']");
            if (courseNameLink) {
              const courseCode = courseNameLink.parentElement.querySelector("span.ski-course-code");
              if (!courseCode) {
                const canvasCourseCode = courseNameLink.href.split("/").pop();
                fetch(`/api/v1/courses/${canvasCourseCode}`)
                  .then(response => response.json())
                  .then(data => {
                    const courseCode = data["course_code"];
                    courseNameLink.insertAdjacentHTML("afterend", `<br><span class="ski-course-code" style="font-style: italic;">${courseCode}</span>`);
                  })
                  .catch((error) => {
                    console.error('Error:', error);
                  });
              }
            }
          }
        });
      });
    });

    if (mainContentDiv) {
      const tableBodyRows = [...document.querySelectorAll("tbody[data-association='courses list'] tr")];
      tableBodyRows.forEach(row => {
        const courseNameLink = row.querySelector("td > a[href*='/courses/']");
        if (courseNameLink) {
          const courseCode = courseNameLink.parentElement.querySelector("span.ski-course-code");
          if (!courseCode) {
            const canvasCourseCode = courseNameLink.href.split("/").pop();
            fetch(`/api/v1/courses/${canvasCourseCode}`)
              .then(response => response.json())
              .then(data => {
                const courseCode = data["course_code"];
                courseNameLink.insertAdjacentHTML("afterend", `<br><span class="ski-course-code" style="font-style: italic;">${courseCode}</span>`);
              })
              .catch((error) => {
                console.error('Error:', error);
              });
          }
        }
      });

      courseResultsObserver.observe(mainContentDiv, {
        subtree: true,
        childList: true
      });
    }
  }

  function addAdditionalSearchOptions() {
    window.addEventListener("load", () => {
      const rowOfSearchOptions = document.querySelector("div#content form > span > span > span > span > span:nth-child(2)");
      if (rowOfSearchOptions) {
        rowOfSearchOptions.insertAdjacentHTML("afterbegin", `
          <div class="ic-Form-control" style="max-width: 20rem; padding-left: 0.375rem; padding-right: 0.375rem;">
            <select id="ski-course-search-state-select" class="ic-Input">
              <optgroup label="Select course state">
                <option value="">All Course States</option>
                <option value="true">Published Only</option>
                <option value="false">Unpublished Only</option>
              </optgroup>
            </select>
          </div>
        `);
        
        rowOfSearchOptions.insertAdjacentHTML("afterend", `
          <div class="content-box-mini" style="text-align: right;">
            <button data-sort="" id="ski-course-search-course-id-sort-btn" class="Button Button--secondary">Sort by Canvas Course ID - Descending</button>
          </div>
        `);

        const url = window.location.href;
        const stateSelect = document.getElementById("ski-course-search-state-select");
        if (stateSelect) {
          if (url.includes("published=true")) {
            stateSelect.value = "true";
          } else if (url.includes("published=false")) {
            stateSelect.value = "false";
          }
        }
        stateSelect.addEventListener("change", () => {
          const selectedState = document.getElementById("ski-course-search-state-select")?.value;
          const currentUrl = window.location.href;
          let newUrl = currentUrl.replace(/&?published=(true|false)/, "")
          if (selectedState) {
            if (selectedState == "true") {
              newUrl += "&published=true";
            } else if (selectedState == "false") {
              newUrl += "&published=false";
            }
          }
          window.location.href = newUrl;
        });

        const canvasIdSortButton = document.getElementById("ski-course-search-course-id-sort-btn");
        if (canvasIdSortButton) {
          if (url.includes("sort=course_id")) {
            if (url.includes("order=desc")) {
              canvasIdSortButton.dataset.sort = "desc";
              canvasIdSortButton.innerText = "Sort by Canvas Course ID - Ascending";
            } else {
              canvasIdSortButton.dataset.sort = "";
              canvasIdSortButton.innerText = "Sort by Canvas Course ID - Descending";
            }
          }
        }
        canvasIdSortButton.addEventListener("click", () => {
          const sortButton = document.getElementById("ski-course-search-course-id-sort-btn");
          if (sortButton) {
            const sortOrder = sortButton.dataset?.sort;
            const currentUrl = window.location.href;
            let newUrl = currentUrl.replace(/&?sort=(course_name|term|teacher|subaccount|course_id)/, "");
            newUrl = newUrl.replace(/&?order=(desc|asc)/, "");
            if (sortOrder == "desc") {
              canvasIdSortButton.dataset.sort = "";
              canvasIdSortButton.innerText = "Sort by Canvas Course ID - Ascending";
              newUrl += "&sort=course_id";
            } else {
              canvasIdSortButton.dataset.sort = "desc";
              canvasIdSortButton.innerText = "Sort by Canvas Course ID - Descending";
              newUrl += "&sort=course_id&order=desc";
            }
            window.location.href = newUrl;
          }
        });

      }
    });
  }

})();