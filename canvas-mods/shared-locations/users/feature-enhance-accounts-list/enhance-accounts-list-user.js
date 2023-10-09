(() => {
  if (/^\/accounts\/[0-9]+\/users\/[0-9]+/.test(window.location.pathname) || 
      /^\/accounts\/self\/users\/[0-9]+/.test(window.location.pathname) || 
      /^\/users\/[0-9]+/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminUsersAccountsResizable: true,
      adminUsersAccountsDefaultHeight: 100,
      adminUsersAccountsRoles: true,
    }, function (items) {
      // Update Accounts List if available
      const accountsList = document.querySelector("div.accounts ul");
      if (accountsList) {
        accountsList.style.height = `${items.adminUsersAccountsDefaultHeight}px`;
        if (items.adminUsersAccountsResizable) {
          accountsList.style.maxHeight = "";
          accountsList.style.resize = "vertical";
        }
        if (items.adminUsersAccountsRoles) {
          updateAccountsListWithRoles(accountsList);
        }
      }
    });
  }

  /*
    This goes through the list of accounts and adds in details about the 
    account admin role and status the user has in each account
  */
  function updateAccountsListWithRoles(accountsList) {
    const userId = window.location.pathname.split("/").pop();
    const accountsListItems = [...accountsList.querySelectorAll("li")];
    let requestNum = 0;
    accountsListItems.forEach(async (item) => {
      requestNum++;
      await new Promise(r => setTimeout(r, requestNum * 20 + 10));
      const accountNumber = item.querySelector("a").href.split("/").pop();
      const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
      const url = `${baseUrl}/api/v1/accounts/${accountNumber}/admins?user_id[]=${userId}`; // TODO Update to be paginated
      fetch(url)
        .then(response => response.json())
        .then(data => {
          let adminRoleDetails = "";
          data.forEach(adminRole => {
            adminRoleDetails += `${adminRole['role']} [${adminRole['workflow_state']}]; `;
          });
          item.querySelector("a span.subtitle").textContent = adminRoleDetails;
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        })
    });
  }
})();