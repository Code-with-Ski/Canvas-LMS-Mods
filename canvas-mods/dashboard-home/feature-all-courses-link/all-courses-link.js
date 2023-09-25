"use strict";

(() => {
  if (/^\/\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        dashboardAddAllCoursesButton: true,
      },
      function (items) {
        if (items.dashboardAddAllCoursesButton) {
          SkiMonitorChanges.watchForElementByQuery(
            "#dashboard_header_container div.ic-Dashboard-header__actions",
            addAllCoursesLink
          );
        }
      }
    );
  }

  /*
    Adds a link to the All Courses page on the dashboard in the dashboard header area
  */
  function addAllCoursesLink(headerActionsDiv) {
    const allCoursesLink = document.createElement("a");
    allCoursesLink.href = "/courses";
    allCoursesLink.classList.add("Button");
    allCoursesLink.innerText = "See all courses";
    allCoursesLink.style.marginRight = "1.5rem";
    
    headerActionsDiv.insertAdjacentElement(
      "afterbegin",
      allCoursesLink
    );
  }
})();
