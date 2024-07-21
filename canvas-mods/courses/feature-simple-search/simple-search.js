(() => {
  if (/^\/courses\/[0-9]+/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        courseGlobalSimpleSearch: true,
        courseGlobalSimpleSearchPosition: 2,
      },
      function (items) {
        if (items.courseGlobalSimpleSearch) {
          addSimpleSearch(items.courseGlobalSimpleSearchPosition);
        }
      }
    );
  }

  function addSimpleSearch(courseNavigationPosition) {
    const navigationMenu = document.querySelector(
      ".ic-app-course-menu nav ul#section-tabs"
    );
    if (courseNavigationPosition <= 1) {
      navigationMenu.insertAdjacentHTML(
        "afterbegin",
        `
        <li class="section"><button class="ski-simple-search Button Button--link" style="padding-left: 6px;" type="button" tabindex="0" title="Open Simple Search">Simple Search</button></li>
      `
      );
    } else {
      const navigationMenuItems = document.querySelectorAll(
        ".ic-app-course-menu nav ul#section-tabs li.section"
      );
      if (courseNavigationPosition > navigationMenuItems.length) {
        navigationMenu.insertAdjacentHTML(
          "beforeend",
          `
          <li class="section"><button class="ski-simple-search Button Button--link" style="padding-left: 6px;" type="button" tabindex="0" title="Open Simple Search">Simple Search</button></li>
        `
        );
      } else {
        navigationMenuItems[courseNavigationPosition - 1].insertAdjacentHTML(
          "beforebegin",
          `
          <li class="section"><button class="ski-simple-search Button Button--link" style="padding-left: 6px;" type="button" tabindex="0" title="Open Simple Search">Simple Search</button></li>
        `
        );
      }
    }

    const dialog = addSimpleSearchModal();

    const simpleSearchButton = document.querySelector(
      "button.ski-simple-search"
    );
    simpleSearchButton?.addEventListener("click", () => {
      dialog?.showModal();
    });
  }

  function addSimpleSearchModal() {
    const dialog = document.createElement("dialog");
    dialog.id = "ski-simple-search-dialog";
    dialog.style.width = "600px";
    dialog.style.maxWidth = "90%";
    dialog.style.height = "400px";
    dialog.style.maxHeight = "90%";
    dialog.style.resize = "both";

    const splitPathname = window.location.pathname.split("?")[0].split("/");
    SkiReport.contextDetails.set("reportContext", "courses");
    SkiReport.contextDetails.set("courseId", splitPathname[2]);
    SkiReport.contextDetails.set("contextId", splitPathname[2]);
    const report = new SkiReportCourseSimpleSearch();
    const reportContainer = report.getReportContainer();
    reportContainer.style.maxHeight = "calc(100% - 4rem)";
    reportContainer.style.overflow = "auto";
    dialog.appendChild(reportContainer);

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.classList.add("Button", "Button--secondary");
    closeButton.style.float = "right";
    closeButton.style.marginTop = "1rem";
    closeButton.addEventListener("click", () => {
      closeSimpleSearchModal(dialog);
    });
    dialog.appendChild(closeButton);

    const content = document.getElementById("content");
    content.appendChild(dialog);

    return dialog;
  }

  function closeSimpleSearchModal(dialog) {
    // reset?
    dialog.close();
  }
})();
