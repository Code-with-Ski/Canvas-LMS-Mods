(() => {
  if (
    /^\/accounts\/[0-9]+\/sub_accounts\??[^\/]*\/?$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        adminSubAccountsExpand: true,
      },
      function (items) {
        if (items.adminSubAccountsExpand) {
          addExpandButton();
        }
      }
    );
  }

  function addExpandButton() {
    const accountsWrapper = document.querySelector("#content > div.account");
    if (accountsWrapper) {
      const expandButton = createExpandButton(accountsWrapper);

      let row = document.querySelector("div.ski-additional-features-row");
      if (!row) {
        row = document.createElement("div");
        row.classList.add("ski-additional-features-row");
        accountsWrapper.insertAdjacentElement("beforebegin", row);
        accountsWrapper.insertAdjacentHTML("beforebegin", "<hr>");
      }

      row.insertAdjacentElement("afterbegin", expandButton);
      row.insertAdjacentHTML(
        "afterend",
        `
        <div style="clear: both;">
        </div>  
      `
      );
    }
  }

  function createExpandButton(accountsWrapper) {
    const button = document.createElement("button");
    button.classList.add("Button", "ski-expand");
    button.innerText = "Expand All";
    button.style.float = "right";

    button.addEventListener("click", () => {
      expandAccounts(document);
    });

    return button;
  }

  function watchForAddedAccountsOnExpand(parent = document) {
    SkiMonitorChanges.watchForAddedNodeOfElement(
      parent,
      ":scope > ul.sub_accounts > li.sub_account",
      () => {
        expandAccounts(parent);
      }
    );
  }

  function expandAccounts(parent = document) {
    const accountDivs = [
      ...parent.querySelectorAll("div.account:not(#account_blank)"),
    ];
    for (const accountDiv of accountDivs) {
      let accountButton = accountDiv.querySelector(
        ":scope > div.header .expand_sub_accounts_link:not([style*='display: none']):not([style*='display:none'])"
      );

      if (!accountButton) {
        continue;
      }

      watchForAddedAccountsOnExpand(accountDiv);
      accountButton.click();
    }
  }
})();
