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
          document.querySelector("#sub_account_mount"),
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
    if (!isCanvasAccountIdShown && !isSisAccountIdShown) {
      return;
    }

    const subAccountRows = [
      ...document.querySelectorAll(
        "#sub_account_mount > span > span[direction='column'] > span[direction='row']"
      ),
    ];
    if (subAccountRows.length == 0) {
      return;
    }

    let requestNum = 0;
    subAccountRows.forEach(async (item) => {
      const accountLink = item.querySelector(
        "[data-testid^='header_'] a[data-testid^='link_']"
      );
      const canvasId = accountLink?.href?.split("/").pop();
      if (!canvasId) {
        return;
      }

      if (isCanvasAccountIdShown) {
        addCanvasAccountId(item, accountLink, canvasId);
      }
      if (isSisAccountIdShown) {
        if (!item.querySelector(".ski-sis-account-id")) {
          requestNum++;
          addSisAccountId(item, accountLink, canvasId, requestNum);
        }
      }
    });
  }

  function addCanvasAccountId(accountRow, accountLink, canvasId) {
    if (!accountRow.querySelector(".ski-canvas-account-id")) {
      accountLink?.parentElement?.insertAdjacentHTML(
        "beforeend",
        `<div style='color: var(--ic-brand-font-color-dark-lightened-28); margin-left: 0.75rem; font-size: 1rem;' class='ski-canvas-account-id'>Canvas Account ID: ${canvasId}</div>`
      );
    }
  }

  async function addSisAccountId(
    accountRow,
    accountLink,
    canvasId,
    requestNum = 0
  ) {
    if (accountRow.querySelector(".ski-sis-account-id")) {
      return;
    }
    accountLink?.parentElement?.insertAdjacentHTML(
      "beforeend",
      `<div style='color: var(--ic-brand-font-color-dark-lightened-28); margin-left: 0.75rem; font-size: 1rem;' class='ski-sis-account-id'>SIS Account ID: Loading...</div>`
    );
    await new Promise((r) => setTimeout(r, requestNum * 10));
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    fetch(`${baseUrl}/api/v1/accounts/${canvasId}`)
      .then((response) => response.json())
      .then((data) => {
        let sisId = data["sis_account_id"];
        if (!sisId) {
          sisId = "No SIS ID";
        }
        const sisAccountIdDiv = accountRow.querySelector(".ski-sis-account-id");
        if (!sisAccountIdDiv) {
          return;
        }
        sisAccountIdDiv.innerText = `SIS Account ID: ${sisId}`;
      })
      .catch((error) => {
        console.error("Error:", error);
        const sisAccountIdDiv = accountRow.querySelector(".ski-sis-account-id");
        if (!sisAccountIdDiv) {
          return;
        }
        sisAccountIdDiv.innerText = `SIS Account ID: ERROR`;
      });
  }

  function handleAddedNode(
    addedNode,
    isCanvasAccountIdShown,
    isSisAccountIdShown
  ) {
    if (
      !addedNode ||
      addedNode?.nodeName == "#text" ||
      !addedNode?.querySelector(
        "[data-testid^='header_'] a[data-testid^='link_']"
      )
    ) {
      return;
    }
    updateSubAccountIds(isCanvasAccountIdShown, isSisAccountIdShown);
  }
})();
