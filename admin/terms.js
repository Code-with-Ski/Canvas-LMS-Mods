(() => {
  if (/^\/accounts\/[0-9]+\/terms/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminTermsSearch: true,
      adminTermsMoveAddTerm: true,
      adminTermsTermId: true
    }, function (items) {
      if (items.adminTermsSearch) {
        addTermsSearch();
      }

      if (items.adminTermsMoveAddTerm) {
        moveAddTermButtonToTop();
      }

      if (items.adminTermsTermId) {
        addTermIdToRows();
      }
    });
  }

  /*
    Adds a search box at the top of the terms.
  */
  function addTermsSearch() {
    const termTable = document.querySelector("table#terms");
    const termSearch = document.querySelector("div#content input#ski-term-search");
    if (termTable && !termSearch) {
      termTable.insertAdjacentHTML("beforebegin", "<input id='ski-term-search' type='text' placeholder='Search for term by name or id'><hr>");
      const newTermSearch = document.querySelector("div#content input#ski-term-search");
      newTermSearch.addEventListener("keyup", () => searchTerms());
    }
  }

  /*
    Checks the terms search bar for the value.
    If there is a value, it will go through each row and 
    hide those that don't include that value in the 
    term name or id
  */
  function searchTerms() {
    const termRows = [...document.querySelectorAll("table#terms > tbody > tr[class='term']")];
    const searchBox = document.querySelector("div#content input#ski-term-search");
    if (searchBox) {
      const searchPhrase = searchBox.value.toUpperCase();
      termRows.forEach(row => {
        if (row.id != "term_blank") {
          let shouldShow = true;
          if (searchPhrase) {
            shouldShow = false;

            const termName = row.querySelector("td.header span.name");
            if (termName && termName.innerText.toUpperCase().includes(searchPhrase)) {
              shouldShow = true;
            }
            else {
              const sisTermId = row.querySelector("td.header span.sis_source_id");
              if (sisTermId && sisTermId.innerText.toUpperCase().includes(searchPhrase)) {
                shouldShow = true;
              }
              else {
                const canvasTermId = row.querySelector("td.header span.canvas-term-id");
                if (canvasTermId && canvasTermId.innerText.toUpperCase().includes(searchPhrase)) {
                  shouldShow = true;
                }
              }
            }
          }

          if (shouldShow) {
            row.style.display = "";
          }
          else {
            row.style.display = "none";
          }

        }
      });
    }
  }


  /*
    Gets the row with the Add Term button and moves it to the 
    first row of the table body
  */
  function moveAddTermButtonToTop() {
    const lastRow = document.querySelector("table#terms > tbody > tr:last-child");
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


  /*
    In each table row that is a term, it updates the information
    to show the Canvas Term ID too.
  */
  function addTermIdToRows() {
    const termTableRows = [...document.querySelectorAll("table#terms > tbody > tr")];

    termTableRows.forEach(row => {
      if (row.id && row.id.includes("term_")) {
        const termCanvasId = row.id.replace("term_", "");
        const rowHeaderDetails = row.querySelector("td.header div:nth-child(2) div");
        rowHeaderDetails.insertAdjacentHTML("afterbegin", "Canvas Term ID: <span class='ski-canvas-term-id'></span><br>");
        const termIdSpan = rowHeaderDetails.querySelector("span.ski-canvas-term-id");
        termIdSpan.insertAdjacentText("afterbegin", `${termCanvasId}`);
      }
    });
  }
})();