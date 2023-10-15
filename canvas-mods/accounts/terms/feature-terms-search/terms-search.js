(() => {
  if (/^\/accounts\/[0-9]+\/terms/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        adminTermsSearch: false,
      },
      function (items) {
        if (items.adminTermsSearch) {
          addTermsSearch();
        }
      }
    );
  }

  /*
    Adds a search box at the top of the terms.
  */
  function addTermsSearch() {
    const termTable = document.querySelector("table#terms");
    const termSearch = document.querySelector(
      "div#content input#ski-term-search"
    );
    if (termTable && !termSearch) {
      termTable.insertAdjacentHTML(
        "beforebegin",
        "<input id='ski-term-search' type='text' placeholder='Search for term by name or id'><hr>"
      );
      const newTermSearch = document.querySelector(
        "div#content input#ski-term-search"
      );
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
    const termRows = [
      ...document.querySelectorAll("table#terms > tbody > tr[class='term']"),
    ];
    const searchBox = document.querySelector(
      "div#content input#ski-term-search"
    );
    if (searchBox) {
      const searchPhrase = searchBox.value.toUpperCase();
      termRows.forEach((row) => {
        if (row.id != "term_blank") {
          let shouldShow = true;
          if (searchPhrase) {
            shouldShow = false;

            const termName = row.querySelector("td.header span.name");
            if (
              termName &&
              termName.innerText.toUpperCase().includes(searchPhrase)
            ) {
              shouldShow = true;
            } else {
              const sisTermId = row.querySelector(
                "td.header span.sis_source_id"
              );
              if (
                sisTermId &&
                sisTermId.innerText.toUpperCase().includes(searchPhrase)
              ) {
                shouldShow = true;
              } else {
                const canvasTermId = row.querySelector(
                  "td.header span.canvas-term-id"
                );
                if (
                  canvasTermId &&
                  canvasTermId.innerText.toUpperCase().includes(searchPhrase)
                ) {
                  shouldShow = true;
                }
              }
            }
          }

          if (shouldShow) {
            row.style.display = "";
          } else {
            row.style.display = "none";
          }
        }
      });
    }
  }
})();
