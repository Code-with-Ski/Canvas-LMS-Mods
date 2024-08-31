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
    dialog.classList.add("ski-ui-dialog");

    const wrapper = document.createElement("div");
    wrapper.classList.add("ski-ui-dialog-content-wrapper");

    const dialogHeader = document.createElement("div");
    dialogHeader.classList.add("ski-ui-dialog-header");

    const dialogHeading = document.createElement("h2");
    dialogHeading.innerText = "Simple Search";

    const exitButton = document.createElement("button");
    exitButton.classList.add("Button");
    exitButton.innerText = "X";
    exitButton.style.padding = "0.25rem 1rem";
    exitButton.addEventListener("click", () => {
      closeSimpleSearchModal(dialog);
    });

    dialogHeader.append(dialogHeading);
    dialogHeader.append(exitButton);

    const dialogBody = document.createElement("div");
    dialogBody.classList.add("ski-ui-dialog-body");

    const splitPathname = window.location.pathname.split("?")[0].split("/");
    SkiReport.contextDetails.set("reportContext", "course");
    SkiReport.contextDetails.set("courseId", splitPathname[2]);
    SkiReport.contextDetails.set("contextId", splitPathname[2]);
    const report = new SkiReportCourseSimpleSearch();
    const reportContainer = report.getReportContainer();
    dialogBody.append(reportContainer);

    const dialogFooter = document.createElement("div");
    dialogFooter.classList.add("ski-ui-dialog-footer");

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.classList.add("Button", "Button--secondary");
    closeButton.addEventListener("click", () => {
      closeSimpleSearchModal(dialog);
    });
    dialogFooter.append(closeButton);

    wrapper.append(dialogHeader);
    wrapper.append(dialogBody);
    wrapper.append(dialogFooter);
    dialog.append(wrapper);

    const content = document.getElementById("content");
    content.append(dialog);

    return dialog;
  }

  function closeSimpleSearchModal(dialog) {
    // reset?
    dialog.close();
  }
})();
