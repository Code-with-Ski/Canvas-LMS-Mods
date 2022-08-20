(() => {
  if (/^\/courses\/[0-9]+\/users\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        coursePeopleExportEnabled: true,
        coursePeopleInactiveFilter: true,
      },
      function (items) {
        if (items.coursePeopleExportEnabled) {
          addExportButton();
        }

        if (items.coursePeopleInactiveFilter) {
          onElementRendered("div.roster-tab div.v-gutter", addInactiveUsersFilter);
        }
      }
    );
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

    setTimeout(function() {
      onElementRendered(selector, cb, _attempts);
    }, 250);
  }

  /*
    Adds a button to export the users to a CSV
  */
  function addExportButton() {
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
          const continueWithDownload = confirm(
            `This will only download the users that are currently listed in the table.\n\nIf the class is large, be sure all rows have loaded before downloading.\n\nClick 'OK' to continue with the download`
          );
          if (continueWithDownload) {
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
    for (let i = 0; i < rows.length; i++) {
      const row = [];
      const cols = rows[i].querySelectorAll("td, th");
      for (let j = 1; j < cols.length - 1; j++) {
        // Clean innertext to remove multiple spaces and jumpline (break csv)
        let data = cols[j].innerText
          .replace(/(\r\n|\n|\r)/gm, "; ")
          .replace(/(\s\s)/gm, " ");
        // Escape double-quote with double-double-quote
        data = data.replace(/"/g, '""');
        // Push escaped string
        row.push(`"${data}"`);
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
})();
