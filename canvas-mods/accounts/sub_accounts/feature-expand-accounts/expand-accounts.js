(() => {
  let expandObserver;

  if (
    /^\/accounts\/[0-9]+\/sub_accounts\??[^\/]*\/?$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        adminSubAccountsExpand: true,
        adminSubAccountsAutoExpand: true,
      },
      function (items) {
        if (items.adminSubAccountsExpand) {
          watchForSubAccounts(items.adminSubAccountsAutoExpand);
        }
      }
    );
  }

  function watchForSubAccounts(shouldAutoExpand) {
    SkiMonitorChanges.watchForElementById(
      "sub_account_mount",
      (subAccountWrapper) =>
        addExpandButton(subAccountWrapper, shouldAutoExpand)
    );
  }

  function addExpandButton(subAccountWrapper, shouldAutoExpand) {
    if (!subAccountWrapper) {
      return;
    }

    const expandButton = createExpandButton(shouldAutoExpand);

    let row = document.querySelector("div.ski-additional-features-row");
    if (!row) {
      row = document.createElement("div");
      row.classList.add("ski-additional-features-row");
      subAccountWrapper.insertAdjacentElement("afterbegin", row);
      row.insertAdjacentHTML("afterend", "<hr>");
    }

    row.insertAdjacentElement("afterbegin", expandButton);
    row.insertAdjacentHTML(
      "afterend",
      `
      <div style="clear: both;">
      </div>  
    `
    );

    if (shouldAutoExpand) {
      expandAccounts();
    }
  }

  function createExpandButton(shouldAutoExpand) {
    const wrapper = document.createElement("div");
    wrapper.classList.add(
      "ic-Form-control",
      "ic-Form-control--checkbox",
      "pull-right"
    );

    const button = document.createElement("input");
    button.type = "checkbox";
    button.id = "ski-expand-sub-accounts";
    button.classList.add("ski-expand");
    button.checked = shouldAutoExpand;

    button.addEventListener("change", () => {
      if (button.checked) {
        expandAccounts();
        updateCollapseButtons(true);
      } else {
        expandObserver?.disconnect();
        updateCollapseButtons(false);
      }
    });

    const label = document.createElement("label");
    label.classList.add("ic-Label");
    label.innerText = "Expand all sub-accounts";
    label.setAttribute("for", "ski-expand-sub-accounts");

    wrapper.appendChild(button);
    wrapper.appendChild(label);

    return wrapper;
  }

  function updateCollapseButtons(isDisabled) {
    let collapseButtons = [
      ...document.querySelectorAll(
        "#sub_account_mount > span > span[direction='column'] > span[direction='row'] button[data-testid^='collapse-']"
      ),
    ];

    for (const button of collapseButtons) {
      button.disabled = isDisabled;
      if (isDisabled) {
        button.style.display = "none";
      } else {
        button.style.display = "";
      }
    }
  }

  function watchForAddedAccounts() {
    expandObserver?.disconnect();
    console.log("watching for newly added accounts");
    expandObserver = SkiMonitorChanges.watchForAddedNodeOfElement(
      document,
      "#sub_account_mount > span > span[direction='column']",
      expandAccounts
    );
  }

  function expandAccounts() {
    let expandButtons = [
      ...document.querySelectorAll(
        "#sub_account_mount > span > span[direction='column'] > span[direction='row'] button[data-testid^='expand-']"
      ),
    ];
    for (const expandButton of expandButtons) {
      expandButton.click();
    }

    updateCollapseButtons(true);

    watchForAddedAccounts();
  }
})();
