(() => {
  if (/^\/accounts\/[0-9]+\/terms/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        adminTermsMoveAddTerm: false,
      },
      function (items) {
        if (items.adminTermsMoveAddTerm) {
          moveAddTermButtonToTop();
        }
      }
    );
  }

  /*
    Gets the row with the Add Term button and moves it to the 
    first row of the table body
  */
  function moveAddTermButtonToTop() {
    const lastRow = document.querySelector(
      "table#terms > tbody > tr:last-child"
    );
    if (lastRow && lastRow.innerText.includes("Add New Term")) {
      const addTermLink = lastRow.querySelector("a");
      if (!addTermLink.classList.contains("btn")) {
        addTermLink.classList.add("btn");
        addTermLink.classList.add("btn-primary");
      }

      const termTableBody = document.querySelector("table#terms");
      termTableBody.insertAdjacentElement("beforebegin", addTermLink);
      lastRow.remove();
    }
  }
})();
