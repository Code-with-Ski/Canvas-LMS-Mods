(() => {
  if (/^\/courses\/[0-9]+\/users\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        coursePeopleSectionFilter: true,
      },
      function (items) {
        if (items.coursePeopleSectionFilter) {
          SkiMonitorChanges.watchForElementByQuery("div.roster-tab select[name='enrollment_role_id']", addSectionFilter);
        }
      }
    );
  }

  /*
    Adds a select menu that will be used to filter the displayed users by 
    section name
  */
  async function addSectionFilter(roleSelect) {
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

  /*
    Gets the section names in the course and loads them into the select menu
  */
  async function loadSectionNames() {
    const courseId = window.location.pathname.split("/")[2];
    const url = `/api/v1/courses/${courseId}/sections`;
    const sections = await SkiCanvasLmsApiCaller.getRequestAllPages(url);

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
        row.classList.remove("ski-ui-hide");
      } else {
        const sections = [...row.querySelectorAll("td div.section")];
        const hasMatchingSection = sections.some((rowSection) => {
          return rowSection && rowSection.innerText.trim() == section;
        });
        if (hasMatchingSection) {
          row.classList.remove("ski-ui-hide");
        } else {
          row.classList.add("ski-ui-hide");
        }
      }
    }
  }
})();
