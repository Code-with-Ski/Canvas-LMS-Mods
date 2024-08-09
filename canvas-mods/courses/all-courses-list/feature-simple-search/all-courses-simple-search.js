(() => {
  if (/^\/courses\??/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        allCoursesSimpleSearch: true,
      },
      function (items) {
        if (items.allCoursesSimpleSearch) {
          addSimpleSearch();
        }
      }
    );
  }

  function addSimpleSearch() {
    const allCoursesHeaderDiv = document.querySelector(".ic-Action-header");
    allCoursesHeaderDiv.insertAdjacentHTML(
      "beforeend",
      `<button class="ski-simple-search Button" type="button" tabindex="0" title="Open Simple Search">
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
    dialog.style.width = "800px";
    dialog.style.maxWidth = "90%";
    dialog.style.height = "600px";
    dialog.style.maxHeight = "90%";
    dialog.style.resize = "both";
    dialog.style.overflow = "hidden";

    SkiReport.contextDetails.set("reportContext", "all-courses");
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
