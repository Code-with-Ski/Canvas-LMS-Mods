(() => {
  if (
    /^\/accounts\/[0-9]+\/users\/[0-9]+/.test(window.location.pathname) ||
    /^\/accounts\/self\/users\/[0-9]+/.test(window.location.pathname) ||
    /^\/users\/[0-9]+/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        userCourseEnrollmentsSimpleSearch: true,
      },
      function (items) {
        if (items.userCourseEnrollmentsSimpleSearch) {
          addSimpleSearch();
        }
      }
    );
  }

  function addSimpleSearch() {
    const coursesHeader = document.querySelector("#courses_list h3");
    console.log(coursesHeader);
    if (!coursesHeader) {
      return;
    }

    coursesHeader.insertAdjacentHTML(
      "beforebegin",
      `<button class="ski-simple-search Button" type="button" tabindex="0" title="Open Simple Search" style="margin-bottom: 0.5rem">
        <i class="icon-solid icon-search"></i>&nbsp;Simple Search
      </button>`
    );

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

    SkiReport.contextDetails.set("reportContext", "user");
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
