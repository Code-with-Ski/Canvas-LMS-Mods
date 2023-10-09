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
          accountLinks.insertAdjacentHTML(
            "afterend",
            `<div style='color: var(--ic-brand-font-color-dark-lightened-15); font-size: 12px; font-size: 0.75rem;' class='ski-canvas-account-id'>Canvas Account ID: ${canvasId}</div>`
          );
        }
        if (isSisAccountIdShown) {
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
              accountLinks.insertAdjacentHTML(
                "afterend",
                `<div style='color: var(--ic-brand-font-color-dark-lightened-15); font-size: 12px; font-size: 0.75rem;' class='ski-canvas-account-id'>Canvas Account ID: ${canvasId}</div>`
              );
            }
            if (isSisAccountIdShown) {
              requestNum++;
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
          }
        });
      }
    }
  }
})();
