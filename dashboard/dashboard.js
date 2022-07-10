(() => {
  if (/^\/\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        dashboardAddAllCoursesButton: true,
      },
      function (items) {
        if (items.dashboardAddAllCoursesButton) {
          addAllCoursesButton();
        }
      }
    );
  }

  /*
    Adds a button that links to the All Courses page to the dashboard in the dashboard header area
  */
  function addAllCoursesButton() {
    const dashboardHeader = document.getElementById(
      "dashboard_header_container"
    );
    if (dashboardHeader) {
      const dashboardActionsDiv = document.querySelector(
        "#dashboard_header_container div.ic-Dashboard-header__actions"
      );
      const dashboardAllCoursesButton = document.getElementById(
        "ski-all-courses-btn"
      );
      if (dashboardActionsDiv && !dashboardAllCoursesButton) {
        dashboardActionsDiv.insertAdjacentHTML(
          "beforebegin",
          "<a href='/courses' class='Button' style='margin: 0px 1.5rem 0px 0px; border-radius: 0.25rem; cursor: pointer;'>See all courses</a>"
        );
      }
    }
  }
})();
