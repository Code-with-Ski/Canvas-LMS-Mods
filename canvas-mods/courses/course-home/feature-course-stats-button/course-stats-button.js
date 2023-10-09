"use strict";

(() => {
  if (/^\/courses\/[0-9]+$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        courseStatisticsButtonOnHome: true,
      },
      function (items) {
        if (items.courseStatisticsButtonOnHome) {
          watchForRightSideButtons();
        }
      }
    );
  }

  function watchForRightSideButtons() {
    SkiMonitorChanges.watchForElementByQuery("#right-side div.course-options", addCourseStatisticsButton);
  }

  function addCourseStatisticsButton(rightSideButtons) {
    const courseStatisticsButton = createCourseStatisticsButton();
    rightSideButtons.insertAdjacentElement("beforeend", courseStatisticsButton);
  }

  function createCourseStatisticsButton() {
    const BASE_URL = `${window.location.protocol}//${window.location.hostname}`;
    const courseId = window.location.pathname.split("/")[2];

    const courseStatisticsButton = document.createElement("a");
    courseStatisticsButton.classList.add("btn", "button-sidebar-wide");
    courseStatisticsButton.href = `${BASE_URL}/courses/${courseId}/statistics`;
    courseStatisticsButton.target = "_blank";
    courseStatisticsButton.title = "View course statistics and Code with Ski custom course reports";
    courseStatisticsButton.innerHTML = `<i class="icon-line icon-analytics"></i> Course Statistics`;

    return courseStatisticsButton;
  }
})();
