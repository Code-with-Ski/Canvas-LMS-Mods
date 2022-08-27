(() => {
  if (
    /^\/courses\/[0-9]+\/users\/[0-9]+\/usage\??[^\/]*\/?$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        courseUserAccessExportEnabled: true,
      },
      function (items) {
        if (items.courseUserAccessExportEnabled) {
          addExportButton();
        }
      }
    );
  }

  /*
    Adds a button to export the user access report to a CSV
  */
  function addExportButton() {
    const rightSide = document.querySelector(
      "div#right-side-wrapper aside#right-side"
    );
    if (rightSide) {
      rightSide.insertAdjacentHTML(
        "beforeend",
        `
        <button id="ski-user-access-report-download" title="Export to CSV" aria-label="Export to CSV" class="btn button-sidebar-wide">
          <i class="icon-download"></i> Export
        </button>
      `
      );

      const downloadButton = document.getElementById(
        "ski-user-access-report-download"
      );
      if (downloadButton) {
        downloadButton.addEventListener("click", () => {
          downloadUserAccessReportAsCSV();
        });
      }
    }
  }

  /*
    Gets the data from the access report table and formats it for CSV.
    After getting the data, it creates a temporary link to download
    the resulting file.
  */
  function downloadUserAccessReportAsCSV() {
    // Select rows from table
    const rows = document.querySelectorAll(
      "div#usage_report table thead tr, div#usage_report table tbody tr"
    );
    // Construct csv
    const csv = [];
    for (let i = 0; i < rows.length; i++) {
      const row = [];
      const cols = rows[i].querySelectorAll("td, th");
      if (rows[i].style.display != "none") {
        for (let j = 0; j < cols.length; j++) {
          if (j == 0) {
            let contentType = "ERROR";
            if (i == 0) {
              contentType = "Content Type";
            } else {
              const icon = cols[j].querySelector("i.icon");
              if (icon) {
                const iconClasses = [...icon.classList];
                iconClasses.forEach((iconClass) => {
                  if (iconClass.startsWith("icon-")) {
                    contentType = iconClass.replace("icon-", "");
                  }
                });
              }
            }

            row.push(`"${contentType}"`);
          }

          if (i == 0 || j < cols.length - 1) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            let data = cols[j].innerText
              .replace(/(\r\n|\n|\r)/gm, "; ")
              .replace(/(\s\s)/gm, " ");
            // Escape double-quote with double-double-quote
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push(`"${data}"`);
          } else {
            row.push(`"${cols[j].dataset.timestamp}"`);
          }
        }
      }

      csv.push(row.join(","));
    }
    const csvString = csv.join("\n");
    // Download it
    const splitPathname = window.location.pathname.split("/");
    const courseId = splitPathname[2];
    const userHeading = document.querySelector("div#content h1");
    const userName = userHeading ? userHeading.innerText.replace(" ", "_"): "user_access_report";
    const filename = `export_course_${courseId}_${userName}_${new Date().toLocaleString()}.csv`;
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
