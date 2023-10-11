"use strict";

(() => {
  if (
    /^\/courses\/[0-9]+\/rubrics\/[0-9]+$/.test(window.location.pathname) ||
    /^\/accounts\/[0-9]+\/rubrics\/[0-9]+$/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        rubricDetailsReport: true,
      },
      function (items) {
        if (items.rubricDetailsReport) {
          SkiMonitorChanges.watchForElementById("content", addReports);
        }
      }
    );
  }

  async function addReports(contentDiv) {
    const existingCustomReports = document.getElementById("ski-custom-reports");
    if (!existingCustomReports) {
      const hr = document.createElement("hr");
      hr.role = "presentation";
      contentDiv.insertAdjacentElement("afterend", hr);

      const customReportsDiv = document.createElement("div");
      customReportsDiv.id = "ski-custom-reports";
      customReportsDiv.style.padding = "0 20px";

      const h2 = document.createElement("h2");
      h2.innerText = "Custom Report from Code with Ski";

      customReportsDiv.appendChild(h2);
      hr.insertAdjacentElement("afterend", customReportsDiv);

      addReport(customReportsDiv, SkiReportRubricAssociations);
    }
  }

  function addReport(container, ReportConstructor) {
    const report = new ReportConstructor();

    const details = document.createElement("details");
    details.classList.add("ski-ui");
    details.style.marginBottom = "1rem";

    const detailsSummary = document.createElement("summary");
    detailsSummary.innerText = report.getName();

    details.appendChild(detailsSummary);
    details.appendChild(report.getReportContainer());

    container.appendChild(details);
  }
})();
