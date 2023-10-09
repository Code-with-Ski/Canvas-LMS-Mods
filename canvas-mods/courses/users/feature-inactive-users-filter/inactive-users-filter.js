(() => {
  if (/^\/courses\/[0-9]+\/users\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        coursePeopleInactiveFilter: true,
      },
      function (items) {
        if (items.coursePeopleInactiveFilter) {
          SkiMonitorChanges.watchForElementByQuery(
            "div.roster-tab div.v-gutter",
            addInactiveUsersFilter
          );
        }
      }
    );
  }

  /*
    Adds a checkbox to determine if inactive users should be shown or not.
    It defaults to not checked so that inactive users are hidden by default.
  */
  function addInactiveUsersFilter(rosterTableWrapper) {
    rosterTableWrapper.insertAdjacentHTML(
      "beforebegin",
      `
      <div class="ic-Form-control ic-Form-control--checkbox pull-right">
        <input type="checkbox" id="ski-users-inactive-filter">
        <label class="ic-Label" for="ski-users-inactive-filter">Show inactive users</label>
      </div>
    `
    );

    const inactiveUsersFilter = document.getElementById(
      "ski-users-inactive-filter"
    );
    inactiveUsersFilter.addEventListener("change", () => {
      const inactiveUsersCheckbox = document.getElementById(
        "ski-users-inactive-filter"
      );
      if (inactiveUsersCheckbox) {
        const table = document.querySelector("div.roster-tab table.roster");
        if (table) {
          if (inactiveUsersCheckbox.checked) {
            table.classList.remove("ski-ui-inactive-hide");
          } else {
            table.classList.add("ski-ui-inactive-hide");
          }
        }
      }
    });

    const table = document.querySelector("div.roster-tab table.roster");
    if (table) {
      table.classList.add("ski-ui-inactive-hide");
    }

    const tableRows = [
      ...document.querySelectorAll("div.roster-tab table tbody tr"),
    ];
    tableRows.forEach((row) => {
      updateInactiveUserClass(row);
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.nodeName == "TR") {
          updateInactiveUserClass(mutation.target);
        } else {
          const addedNodes = [...mutation.addedNodes];
          addedNodes.forEach((node) => {
            if (node.nodeName == "TR") {
              updateInactiveUserClass(node);
            } else if (node.nodeName == "TABLE") {
              const inactiveUsersCheckbox = document.getElementById(
                "ski-users-inactive-filter"
              );
              if (inactiveUsersCheckbox && !inactiveUsersCheckbox.checked) {
                node.classList.add("ski-ui-inactive-hide");
              }
            }
          });
        }
      });
    });
    observer.observe(rosterTableWrapper, { subtree: true, childList: true });
  }

  /*
    Checks to see if the row has a label for inactive.  If it does, then it
    will add a custom class to the row that it is an inactive user. Otherwise,
    it will remove the custom class from the row for an inactive user.
  */
  function updateInactiveUserClass(row) {
    const inactiveLabel = row.querySelector(
      "td:nth-of-type(2) span.label[title='This user is currently not able to access the course']"
    );
    if (inactiveLabel) {
      row.classList.add("ski-ui-inactive-user");
    } else {
      row.classList.remove("ski-ui-inactive-user");
    }
  }
})();
