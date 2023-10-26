"use strict";

(() => {
  let currentCourseId = "";
  let currentSectionId = "";
  if (
    /^\/courses\/[0-9]+\/sections\/[0-9]+\??[^\/]*\/?$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        courseSectionsSectionReport: true,
      },
      function (items) {
        if (items.courseSectionsSectionReport) {
          currentCourseId = window.location.pathname.split("/")[2];
          currentSectionId = window.location.pathname.split("/")[4];
          SkiMonitorChanges.watchForElementById("content", addReports);
        }
      }
    );
  }

  async function addReports(contentDiv) {
    const existingCustomReports = document.getElementById(
      "ski-custom-section-reports"
    );
    if (!existingCustomReports) {
      const hr = document.createElement("hr");
      hr.role = "presentation";
      contentDiv.insertAdjacentElement("afterend", hr);

      const customReportsDiv = document.createElement("div");
      customReportsDiv.id = "ski-custom-section-reports";
      customReportsDiv.style.padding = "0 20px";

      const h2 = document.createElement("h2");
      h2.innerText = "Section Reports from Code with Ski";

      customReportsDiv.appendChild(h2);
      hr.insertAdjacentElement("afterend", customReportsDiv);

      addReport(customReportsDiv, SkiReportCourseSubmissions);
      addReport(customReportsDiv, SkiReportCourseGradingToDo);
      addReport(customReportsDiv, SkiReportCourseMissingRubricGrades);
      addReport(customReportsDiv, SkiReportCourseModulesProgress);
      addReport(customReportsDiv, SkiReportCourseEnrollments);
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
