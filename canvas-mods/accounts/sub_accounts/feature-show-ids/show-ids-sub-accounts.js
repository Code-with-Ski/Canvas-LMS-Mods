(() => {
  if (
    /^\/accounts\/[0-9]+\/sub_accounts\??[^\/]*\/?$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        adminSubAccountsCanvasId: true,
        adminSubAccountsSisId: true,
      },
      function (items) {
        updateSubAccountIds(
          items.adminSubAccountsCanvasId,
          items.adminSubAccountsSisId
        );
        SkiMonitorChanges.watchForAddedNodesOfElement(
          document.querySelector("#content div.account"),
          (addedNode) => {
            handleAddedNode(
              addedNode,
              items.adminSubAccountsCanvasId,
              items.adminSubAccountsSisId
            );
          }
        );
      }
    );
  }

  /*
    Takes in booleans to represent if the Canvas Account ID and SIS Account
    ID should be shown.
    If either is true, it will loop over the list of sub-accounts and add
    the account id(s) that is to be shown.
  */
  function updateSubAccountIds(isCanvasAccountIdShown, isSisAccountIdShown) {
    if (isCanvasAccountIdShown || isSisAccountIdShown) {
      const topLevelAccount = document.querySelector(
        "div#content > div.account"
      );
      const canvasId = topLevelAccount.querySelector(
        "div.show_account span.id"
      )?.textContent;
      if (canvasId) {
        const accountLinks = topLevelAccount.querySelector(
          "div.show_account span.links"
        );
        if (isCanvasAccountIdShown) {
          addCanvasAccountId(topLevelAccount, accountLinks, canvasId);
        }
        if (isSisAccountIdShown) {
          if (
            !topLevelAccount.querySelector(
              "div.show_account .ski-sis-account-id"
            )
          ) {
            addSisAccountId(accountLinks, canvasId);
          }
        }
      }

      const subAccountDivs = [
        ...topLevelAccount.querySelectorAll("ul.sub_accounts div.account"),
      ];
      if (subAccountDivs) {
        let requestNum = 0;
        subAccountDivs.forEach(async (item) => {
          const canvasId = item.querySelector(
            "div.show_account span.id"
          )?.textContent;
          if (canvasId) {
            const accountLinks = item.querySelector(
              "div.show_account span.links"
            );
            if (isCanvasAccountIdShown) {
              addCanvasAccountId(item, accountLinks, canvasId);
            }
            if (isSisAccountIdShown) {
              if (!item.querySelector("div.show_account .ski-sis-account-id")) {
                requestNum++;
                await new Promise((r) => setTimeout(r, requestNum * 10));
                addSisAccountId(accountLinks, canvasId);
              }
            }
          }
        });
      }
    }
  }

  function addAccountIds(
    accountDiv,
    isCanvasAccountIdShown,
    isSisAccountIdShown,
    requestNum = 0
  ) {
    const canvasId = accountDiv.querySelector(
      "div.show_account span.id"
    )?.textContent;
    if (canvasId) {
      const accountLinks = accountDiv.querySelector(
        "div.show_account span.links"
      );
      if (isCanvasAccountIdShown) {
        addCanvasAccountId(accountDiv, accountLinks, canvasId);
      }
      if (isSisAccountIdShown) {
        if (!accountDiv.querySelector("div.show_account .ski-sis-account-id")) {
          addSisAccountId(accountLinks, canvasId);
        }
      }
    }

    const subAccountDivs = [
      ...accountDiv.querySelectorAll("ul.sub_accounts div.account"),
    ];
    if (subAccountDivs) {
      subAccountDivs.forEach(async (item) => {
        requestNum++;
        addAccountIds(
          item,
          isCanvasAccountIdShown,
          isSisAccountIdShown,
          requestNum
        );
      });
    }
  }

  function addCanvasAccountId(accountDiv, accountLinks, canvasId) {
    if (!accountDiv.querySelector("div.show_account .ski-canvas-account-id")) {
      accountLinks.insertAdjacentHTML(
        "afterend",
        `<div style='color: var(--ic-brand-font-color-dark-lightened-15); font-size: 12px; font-size: 0.75rem;' class='ski-canvas-account-id'>Canvas Account ID: ${canvasId}</div>`
      );
    }
  }

  async function addSisAccountId(accountLinks, canvasId, requestNum = 0) {
    await new Promise((r) => setTimeout(r, requestNum * 10));
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    fetch(`${baseUrl}/api/v1/accounts/${canvasId}`)
      .then((response) => response.json())
      .then((data) => {
        let sisId = data["sis_account_id"];
        if (!sisId) {
          sisId = "No SIS ID";
        }
        accountLinks.insertAdjacentHTML(
          "afterend",
          `<div style='color: var(--ic-brand-font-color-dark-lightened-15); font-size: 12px; font-size: 0.75rem;' class='ski-sis-account-id'>SIS Account ID: ${sisId}</div>`
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleAddedNode(
    addedNode,
    isCanvasAccountIdShown,
    isSisAccountIdShown
  ) {
    if (addedNode?.classList?.contains("account")) {
      addAccountIds(addedNode, isCanvasAccountIdShown, isSisAccountIdShown);
    } else {
      const addedAccounts = [
        ...(addedNode?.querySelectorAll("div.account") ?? []),
      ];
      for (const addedAccount of addedAccounts) {
        addAccountIds(
          addedAccount,
          isCanvasAccountIdShown,
          isSisAccountIdShown
        );
      }
    }
  }
})();
