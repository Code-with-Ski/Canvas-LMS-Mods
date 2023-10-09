"use strict";

(() => {
  let IS_DEBUG_DETAILED = false;
  let currentCourseId = "";
  if (
    /^\/courses\/[0-9]+\/statistics\??[^\/]*\/?$/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        enableDetailedLogging: false,
        courseStatisticsCourseReport: true,
      },
      function (items) {
        IS_DEBUG_DETAILED = items.enableDetailedLogging;

        if (items.courseStatisticsCourseReport) {
          currentCourseId = window.location.pathname.split("/")[2];
          SkiMonitorChanges.watchForElementById("stats", addReports);
        }
      }
    );
  }

  async function addReports(statsDiv) {
    const existingCustomReports = document.getElementById(
      "ski-custom-course-reports"
    );
    if (!existingCustomReports) {
      const hr = document.createElement("hr");
      hr.role = "presentation";
      statsDiv.insertAdjacentElement("afterend", hr);

      const customReportsDiv = document.createElement("div");
      customReportsDiv.id = "ski-custom-course-reports";
      customReportsDiv.style.padding = "0 20px";

      const h2 = document.createElement("h2");
      h2.innerText = "Course Reports from Code with Ski";

      customReportsDiv.appendChild(h2);
      hr.insertAdjacentElement("afterend", customReportsDiv);

      addReport(customReportsDiv, SkiReportCourseAssignments);
      addReport(customReportsDiv, SkiReportCourseSubmissions);
      addReport(customReportsDiv, SkiReportCourseQuizzes);
      addReport(customReportsDiv, SkiReportCourseDiscussions);
      addReport(customReportsDiv, SkiReportCourseDiscussionReplies);
      addReport(customReportsDiv, SkiReportCourseAnnouncements);
      addReport(customReportsDiv, SkiReportCoursePages);
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
