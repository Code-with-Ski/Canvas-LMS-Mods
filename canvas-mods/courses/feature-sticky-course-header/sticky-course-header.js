(() => {
  if (/^\/courses\/[0-9]+/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        courseGlobalStickyHeader: true,
      },
      function (items) {
        if (items.courseGlobalStickyHeader) {
          makeCourseHeaderSticky();
        }
      }
    );
  }

  /*
    Adds a class to the course header to make it sticky at the top
  */
  function makeCourseHeaderSticky() {
    const courseHeader = document.querySelector("div.ic-app-nav-toggle-and-crumbs");
    if (courseHeader) {
      courseHeader.classList.add("ski-ui-sticky-top");
      courseHeader.parentElement.classList.add("ski-ui-sticky-container");
    }

    const courseMenu = document.getElementById("sticky-container");
    if (courseMenu) {
      courseMenu.style.top = "4.5rem";
      courseMenu.style.maxHeight = "calc(100vh - 4.5rem)";
    }
  }
})();
