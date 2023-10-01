(() => {
  if (/^\/accounts\/[0-9]+\/users\/[0-9]+/.test(window.location.pathname) || 
      /^\/accounts\/self\/users\/[0-9]+/.test(window.location.pathname) || 
      /^\/users\/[0-9]+/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminUsersGroupsResizable: true,
      adminUsersGroupsDefaultHeight: 100,
    }, function (items) {
      // Update Groups List if available
      const groupsList = document.querySelector("div.groups ul");
      if (groupsList) {
        groupsList.style.height = `${items.adminUsersGroupsDefaultHeight}px`;
        groupsList.style.maxWidth = "";
        if (items.adminUsersGroupsResizable) {
          groupsList.style.maxHeight = "";
          groupsList.style.resize = "vertical";
        }
      }
    });
  }
})();