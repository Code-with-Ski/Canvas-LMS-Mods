(() => {
  if (/^\/accounts\/[0-9]+\/terms/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        adminTermsTermId: true,
      },
      function (items) {
        if (items.adminTermsTermId) {
          addTermIdToRows();
        }
      }
    );
  }

  /*
    In each table row that is a term, it updates the information
    to show the Canvas Term ID too.
  */
  function addTermIdToRows() {
    const termTableRows = [
      ...document.querySelectorAll("table#terms > tbody > tr"),
    ];

    termTableRows.forEach((row) => {
      if (row.id && row.id.includes("term_")) {
        const termCanvasId = row.id.replace("term_", "");
        const rowHeaderDetails = row.querySelector(
          "td.header div:nth-child(2) div"
        );
        rowHeaderDetails.insertAdjacentHTML(
          "afterbegin",
          "Canvas Term ID: <span class='ski-canvas-term-id'></span><br>"
        );
        const termIdSpan = rowHeaderDetails.querySelector(
          "span.ski-canvas-term-id"
        );
        termIdSpan.insertAdjacentText("afterbegin", `${termCanvasId}`);
      }
    });
  }
})();
