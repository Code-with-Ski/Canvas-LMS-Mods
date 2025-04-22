(() => {
  if (
    /^\/accounts\/[0-9]+\/sub_accounts\??[^\/]*\/?$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        adminSubAccountsSearch: true,
      },
      function (items) {
        if (items.adminSubAccountsSearch) {
          addSearch();
        }
      }
    );
  }

  function addSearch() {
    const accountsWrapper = document.querySelector("#sub_account_mount");
    const accountsSearch = document.querySelector(
      "div#content input#ski-search"
    );
    if (!accountsWrapper || accountsSearch) {
      return;
    }

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.id = "ski-search";
    searchInput.placeholder = "Search for sub-account by name";
    searchInput.addEventListener("keyup", () => searchAccounts());

    let row = document.querySelector("div.ski-additional-features-row");
    if (!row) {
      row = document.createElement("div");
      row.classList.add("ski-additional-features-row");
      accountsWrapper.insertAdjacentElement("afterbegin", row);
      row.insertAdjacentHTML("afterend", "<hr>");
    }

    row.insertAdjacentElement("afterbegin", searchInput);

    searchInput.insertAdjacentHTML(
      "afterend",
      `
      <br>
      <div class='ic-Form-control ic-Form-control--checkbox'>
        <input type='checkbox' id='ski-search-show-parent'>
        <label class='ic-Label' for='ski-search-show-parent'>
          Show parent account(s) of match(es)
        </label>
      </div>
    `
    );
    const checkbox = document.getElementById("ski-search-show-parent");
    checkbox?.addEventListener("click", () => {
      searchAccounts();
    });
  }

  function searchAccounts() {
    const searchBox = document.querySelector("div#content input#ski-search");
    if (!searchBox) {
      return;
    }

    const showParentAccount = document.getElementById(
      "ski-search-show-parent"
    )?.checked;
    const searchPhrase = searchBox.value.toUpperCase();
    const subAccountRows = [
      ...document.querySelectorAll(
        "#sub_account_mount > span > span[direction='column'] > span[direction='row']"
      ),
    ];
    for (let index = 0; index < subAccountRows.length; index++) {
      const [newIndex, matchFound] = searchAccount(
        index,
        subAccountRows,
        searchPhrase,
        showParentAccount
      );
      index = newIndex;
    }
  }

  function searchAccount(
    currentRowIndex,
    subAccountRows,
    searchPhrase,
    showParent = true
  ) {
    const accountRow = subAccountRows[currentRowIndex];
    accountRow.style.display = "";
    const accountHeader = accountRow.querySelector(
      ":scope > [data-testid^='header_']"
    );
    const accountFiller = accountRow.querySelector(":scope > span");
    const accountFillerWidth = accountFiller?.clientWidth ?? 0;
    let shouldShow = true;
    if (searchPhrase) {
      shouldShow = false;

      const accountName = accountHeader.querySelector(
        "a[data-testid^='link_']"
      );
      if (
        accountName &&
        accountName.innerText.toUpperCase().includes(searchPhrase)
      ) {
        shouldShow = true;
      }
    }

    if (searchPhrase && shouldShow) {
      accountFiller.innerHTML = `
        <span title="Match found">
          <svg viewBox="0 0 1920 1920" width="1em" height="1em" aria-hidden="true" role="presentation" focusable="false" class="css-1gb5342-inlineSVG" style="width: 1em; height: 1em;">
            <g role="presentation">
              <path d="M168.941-.011v1920H56v-1920h112.941Zm112.941 68.453c308.669-81.656 496.15 26.429 677.196 133.045 203.407 119.944 413.59 244.066 833.844 139.03 20.217-4.969 41.676 1.469 55.793 17.168 13.892 15.699 18.07 37.835 10.843 57.487-203.407 542.343-504.17 552.734-794.993 562.786-223.285 7.906-454.25 15.811-686.344 247.906l-96.339 96.338Z" fill-rule="evenodd">
              </path>
            </g>
          </svg>
        </span>
      `;
    } else {
      accountFiller.innerHTML = "";
    }

    let hasSubAccountMatch = false;
    while (currentRowIndex < subAccountRows.length - 2) {
      const nextRow = subAccountRows[currentRowIndex + 1];
      nextRow.style.display = "";
      const nextRowFiller = nextRow.querySelector(":scope > span");
      const nextRowFillerWidth = nextRowFiller?.clientWidth ?? 0;

      // Assumes that a child sub-account will be indented more than the parent
      // This assumption may not hold true for deeply nested items and/or on a
      // compact screen
      if (nextRowFillerWidth <= accountFillerWidth) {
        break;
      }
      const [newIndex, matchFound] = searchAccount(
        currentRowIndex + 1,
        subAccountRows,
        searchPhrase,
        showParent
      );
      currentRowIndex = newIndex;
      if (matchFound) {
        hasSubAccountMatch = true;
      }
    }

    if (shouldShow || (hasSubAccountMatch && showParent)) {
      accountRow.style.display = "";
    } else {
      accountRow.style.display = "none";
    }

    return [currentRowIndex, shouldShow || hasSubAccountMatch];
  }
})();
