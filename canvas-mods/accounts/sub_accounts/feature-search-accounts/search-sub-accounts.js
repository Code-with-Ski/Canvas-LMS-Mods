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
    const accountsWrapper = document.querySelector("#content > div.account");
    const accountsSearch = document.querySelector(
      "div#content input#ski-search"
    );
    if (accountsWrapper && !accountsSearch) {
      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.id = "ski-search";
      searchInput.placeholder = "Search for sub-account by name";
      searchInput.addEventListener("keyup", () => searchAccounts());

      let row = document.querySelector("div.ski-additional-features-row");
      if (!row) {
        row = document.createElement("div");
        row.classList.add("ski-additional-features-row");
        accountsWrapper.insertAdjacentElement("beforebegin", row);
        accountsWrapper.insertAdjacentHTML("beforebegin", "<hr>");
      }

      row.insertAdjacentElement("afterbegin", searchInput);

      searchInput.insertAdjacentHTML(
        "afterend",
        `
        <br>
        <label>
          <input type='checkbox' id='ski-search-show-parent'>
          Show parent account(s) of match(es)
        </label>
      `
      );
      const checkbox = document.getElementById("ski-search-show-parent");
      checkbox?.addEventListener("click", () => {
        searchAccounts();
      });
    }
  }

  function searchAccounts() {
    const rootAccount = document.querySelector(
      "#content > div.account:not(#account_blank)"
    );
    const searchBox = document.querySelector("div#content input#ski-search");
    if (searchBox) {
      const showParentAccount = document.getElementById(
        "ski-search-show-parent"
      )?.checked;
      const searchPhrase = searchBox.value.toUpperCase();
      searchAccount(rootAccount, searchPhrase, showParentAccount);
    }
  }

  function searchAccount(accountDiv, searchPhrase, showParent = true) {
    const accountHeader = accountDiv.querySelector(":scope > .header");
    let shouldShow = true;
    if (searchPhrase) {
      shouldShow = false;

      const accountName = accountHeader.querySelector("a.name");
      if (
        accountName &&
        accountName.innerText.toUpperCase().includes(searchPhrase)
      ) {
        shouldShow = true;
      }
    }

    let hasSubAccountMatch = false;
    const subAccounts = [
      ...accountDiv.querySelectorAll(":scope > ul > li > div.account"),
    ];
    for (const subAccount of subAccounts) {
      if (searchAccount(subAccount, searchPhrase, showParent)) {
        hasSubAccountMatch = true;
      }
    }

    const subAccountList = accountDiv.querySelector(":scope > ul");
    if (hasSubAccountMatch) {
      subAccountList.style.display = "";
    } else {
      subAccountList.style.display = "none";
    }

    if (shouldShow || (hasSubAccountMatch && showParent)) {
      accountHeader.style.display = "";
    } else {
      accountHeader.style.display = "none";
    }

    if (searchPhrase && shouldShow && showParent) {
      accountHeader.style.backgroundColor = "lightyellow";
    } else {
      accountHeader.style.backgroundColor = "";
    }

    if (shouldShow || hasSubAccountMatch) {
      accountDiv.style.display = "";
    } else {
      accountDiv.style.display = "none";
    }

    return shouldShow || hasSubAccountMatch;
  }
})();
