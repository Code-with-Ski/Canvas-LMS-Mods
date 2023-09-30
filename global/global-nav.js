"use strict";

(() => {
  chrome.storage.sync.get(
    {
      globalNavAdminQuickAccess: true,
    },
    function (items) {
      if (items.globalNavAdminQuickAccess) {
        watchForGlobalNavPortal();
      }
    }
  );

  function watchForGlobalNavPortal() {
    // Add mutation observer for global navigation
    const globalNavTrayPortal = document.getElementById("nav-tray-portal");
    if (!globalNavTrayPortal) {
      const observer = new MutationObserver(() => {
        const loadedGlobalNavTrayPortal =
          document.getElementById("nav-tray-portal");
        if (loadedGlobalNavTrayPortal) {
          observer.disconnect();
          const globalNavTrayObserver = new MutationObserver(
            handleGlobalNavTrayChanges
          );
          globalNavTrayObserver.observe(loadedGlobalNavTrayPortal, {
            childList: true,
            subtree: true,
          });
        }
      });
      observer.observe(document.body, { childList: true });
    } else {
      const globalNavTrayObserver = new MutationObserver(
        handleGlobalNavTrayChanges
      );
      globalNavTrayObserver.observe(globalNavTrayPortal, {
        childList: true,
        subtree: true,
      });
    }
  }

  async function handleGlobalNavTrayChanges() {
    // Check for visible Admin Tray
    const accountsTray = document.querySelector(
      "#nav-tray-portal div[role='dialog'] div.navigation-tray-container.accounts-tray"
    );
    if (accountsTray) {
      const listOfAccounts = accountsTray.querySelector("ul");
      const skiCustom = accountsTray.querySelector(".ski-added");
      if (listOfAccounts && !skiCustom) {
        listOfAccounts.insertAdjacentHTML(
          "afterend",
          `
          <div id="ski-global-nav-admin-added" class="ski-added">
            <hr role='presentation'>
            <h3>Admin Quick Access</h3>
            <div class="ic-Form-control">
              <label for="ski-account-select" class="ic-Label">Select Account to Use Below</label>
              <select id="ski-account-select" class="ic-Input"></select>
              <div class="ski-loading-icon" id="ski-global-nav-admin-account-loading" style="width: 2rem; height: 2rem; border-width: 0.5rem;" title="Loading manageable accounts">
              </div>
            </div>
            <hr role='presentation'>

            <div id="ski=global-nav-admin-course-search" style="display: none;">
              <h4>Course Search</h4>
              <div class="ic-Form-control">
                <select id="ski-term-select" class="ic-Input">
                  <option value="">All Terms</option>
                  <optgroup label="Active Terms"></optgroup>
                  <optgroup label="Future Terms"></optgroup>
                  <optgroup label="Past Terms"></optgroup>
                </select>
                <div class="ski-loading-icon" id="ski-global-nav-admin-term-loading" style="width: 2rem; height: 2rem; border-width: 0.5rem;" title="Loading terms">
                </div>
              </div>
              <div class="ic-Form-control">
                <select id="ski-course-search-by-select" class="ic-Input">
                  <optgroup label="Search By">
                    <option value="">Course</option>
                    <option value="teacher">Teacher</option>
                  </optgroup>
                </select>
              </div>
              <div class="ic-Form-control">
                <input id="ski-course-search-input" type="text" class="ic-Input" placeholder="Search courses...">
              </div>
              <div class="content-box-mini" style="text-align: right;">
                <button id="ski-course-search-additional-options-btn" class="Button">Use advanced search options</button>
              </div>
              <div id="ski-course-search-additional-options" style="display: none;">
                <div class="ic-Checkbox-group">
                  <div class="ic-Form-control ic-Form-control--checkbox">
                    <input type="checkbox" id="ski-hide-courses-without-students-check">
                    <label class="ic-Label" for="ski-hide-courses-without-students-check">Hide courses without students</label>
                  </div>
                </div>
                <div class="ic-Checkbox-group">
                  <div class="ic-Form-control ic-Form-control--checkbox">
                    <input type="checkbox" id="ski-blueprint-only-check">
                    <label class="ic-Label" for="ski-blueprint-only-check">Show only blueprint courses</label>
                  </div>
                </div>
                <div class="ic-Form-control">
                  <select id="ski-course-state-select" class="ic-Input">
                    <optgroup label="Select course state">
                      <option value="">All Course States</option>
                      <option value="true">Published Only</option>
                      <option value="false">Unpublished Only</option>
                    </optgroup>
                  </select>
                </div>
                <div class="ic-Form-control">
                  <select id="ski-course-sort-select" class="ic-Input">
                    <optgroup label="Select sort by">
                      <option value="">Course SIS ID</option>
                      <option value="course_name">Course Name</option>
                      <option value="term">Term</option>
                      <option value="teacher">Teacher</option>
                      <option value="subaccount">Subaccount</option>
                      <option value="course_id">Canvas Course ID</option>
                    </optgroup>
                  </select>
                </div>
                <div class="ic-Form-control">
                  <select id="ski-course-sort-order-select" class="ic-Input">
                    <optgroup label="Select sort order">
                      <option value="">Ascending</option>
                      <option value="desc">Descending</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div class="content-box-mini">
                <button id="ski-course-search-btn" class="Button Button--primary Button--block">Search Courses</button>
              </div>
              <hr role='presentation'>
            </div>

            <div id="ski-global-nav-admin-people-search" style="display: none;">
              <h4>People Search</h4>
              <div class="ic-Form-control">
                  <select id="ski-user-role-select" class="ic-Input">
                    <optgroup label="Select course role">
                      <option value="">All Roles</option>
                    </optgroup>
                  </select>
                </div>
              <div class="ic-Form-control">
                <input id="ski-people-search-input" type="text" class="ic-Input" placeholder="Search people...">
              </div>
              <div class="content-box-mini">
                <button id="ski-people-search-btn" class="Button Button--primary Button--block">Search People</button>
              </div>
              <hr role='presentation'>
            </div>

            <div id="ski-global-nav-admin-account-links">
              <div class="content-box-mini" id="ski-global-nav-admin-admin-tools">
                <button id="ski-admin-tools-btn" class="Button Button--primary Button--block">Admin Tools</button>
              </div>
              <div class="content-box-mini" id="ski-global-nav-admin-account-reports">
                <button id="ski-account-reports-btn" class="Button Button--primary Button--block">Account Reports</button>
              </div>
            </div>
          </div>
        `
        );

        const accountLoadingIndicator = document.getElementById("ski-global-nav-admin-account-loading");
        if (!accountLoadingIndicator) {
          return;
        }
        accountLoadingIndicator.style.display = "block";
        await loadAccountSelect();
        accountLoadingIndicator.style.display = "none";

        updateVisibleElements();
        
        const termLoadingIndicator = document.getElementById("ski-global-nav-admin-term-loading");
        if (!termLoadingIndicator) {
          return;
        }
        termLoadingIndicator.style.display = "block";
        loadTermsSelect();
        termLoadingIndicator.style.display = "none";

        loadRoleSelect();

        const accountSelect = document.getElementById("ski-account-select");
        if (accountSelect) {
          accountSelect.addEventListener("change", () => {
            updateVisibleElements();
            loadRoleSelect();
          });
        }

        const courseSearchMoreOptions = document.getElementById(
          "ski-course-search-additional-options-btn"
        );
        if (courseSearchMoreOptions) {
          courseSearchMoreOptions.addEventListener("click", () => {
            const additionalOptionsDiv = document.getElementById(
              "ski-course-search-additional-options"
            );
            if (additionalOptionsDiv) {
              const courseSearchMoreOptions = document.getElementById(
                "ski-course-search-additional-options-btn"
              );
              if (additionalOptionsDiv.style.display == "none") {
                additionalOptionsDiv.style.display = "block";
                courseSearchMoreOptions.innerText = "Use basic search options";
              } else {
                additionalOptionsDiv.style.display = "none";
                courseSearchMoreOptions.innerText =
                  "Use advanced search options";
              }
            }
          });
        }

        const courseSearchButton = document.getElementById(
          "ski-course-search-btn"
        );
        if (courseSearchButton) {
          courseSearchButton.addEventListener("click", openCourseSearch);
        }

        const peopleSearchButton = document.getElementById(
          "ski-people-search-btn"
        );
        if (peopleSearchButton) {
          peopleSearchButton.addEventListener("click", openPeopleSearch);
        }

        const adminToolsButton = document.getElementById("ski-admin-tools-btn");
        if (adminToolsButton) {
          adminToolsButton.addEventListener("click", openAdminTools);
        }

        const accountReportsButton = document.getElementById(
          "ski-account-reports-btn"
        );
        if (accountReportsButton) {
          accountReportsButton.addEventListener("click", openAccountReports);
        }
      }
    }
  }

  function getPermissions(accountId = "self") {
    let userPermissions = {};
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    const url = `${baseUrl}/api/v1/accounts/${accountId}/permissions`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
        return userPermissions;
      });
  }

  function hasPermission(userPermissions, permission) {
    return permission in userPermissions && userPermissions[permission];
  }

  function openCourseSearch() {
    const baseUrl = window.location.origin;
    const selectedAccountId =
      document.getElementById("ski-account-select")?.value;
    if (selectedAccountId) {
      let destination = `${baseUrl}/accounts/${selectedAccountId}?`;

      const courseSearchTerm =
        document.getElementById("ski-term-select")?.value;
      if (courseSearchTerm) {
        destination += `&enrollment_term_id=${encodeURIComponent(
          courseSearchTerm
        )}`;
      }

      const courseSearchBy = document.getElementById(
        "ski-course-search-by-select"
      )?.value;
      if (courseSearchBy) {
        destination += `&search_by=${encodeURIComponent(courseSearchBy)}`;
      }

      const courseSearchText = document.getElementById(
        "ski-course-search-input"
      )?.value;
      if (courseSearchText) {
        destination += `&search_term=${encodeURIComponent(courseSearchText)}`;
      }

      const additionalSearchOptionsDiv = document.getElementById(
        "ski-course-search-additional-options"
      );
      if (
        additionalSearchOptionsDiv &&
        additionalSearchOptionsDiv.style.display == "block"
      ) {
        const courseSearchHideEnrollmentless = document.getElementById(
          "ski-hide-courses-without-students-check"
        )?.checked;
        if (courseSearchHideEnrollmentless) {
          destination += `&enrollment_type%5B0%5D=student`;
        }

        const courseSearchBlueprint = document.getElementById(
          "ski-blueprint-only-check"
        )?.checked;
        if (courseSearchBlueprint) {
          destination += `&blueprint=true`;
        }

        const courseSearchState = document.getElementById(
          "ski-course-state-select"
        )?.value;
        if (courseSearchState) {
          destination += `&published=${encodeURIComponent(courseSearchState)}`;
        }

        const courseSortOption = document.getElementById(
          "ski-course-sort-select"
        )?.value;
        if (courseSortOption) {
          destination += `&sort=${encodeURIComponent(courseSortOption)}`;
        }

        const courseSortOrder = document.getElementById(
          "ski-course-sort-order-select"
        )?.value;
        if (courseSortOrder) {
          destination += `&order=${encodeURIComponent(courseSortOrder)}`;
        }
      }

      window.open(destination, "_blank");
    }
  }

  function openPeopleSearch() {
    const baseUrl = window.location.origin;
    const selectedAccountId =
      document.getElementById("ski-account-select")?.value;
    if (selectedAccountId) {
      let destination = `${baseUrl}/accounts/${selectedAccountId}/users?`;

      const peopleSearchText = document.getElementById(
        "ski-people-search-input"
      )?.value;
      if (peopleSearchText) {
        destination += `search_term=${encodeURIComponent(peopleSearchText)}`;
      }

      window.open(destination, "_blank");
    }
  }

  function openAdminTools() {
    const baseUrl = window.location.origin;
    const selectedAccountId =
      document.getElementById("ski-account-select")?.value;
    if (selectedAccountId) {
      let destination = `${baseUrl}/accounts/${selectedAccountId}/admin_tools`;
      window.open(destination, "_blank");
    }
  }

  function openAccountReports() {
    const baseUrl = window.location.origin;
    const selectedAccountId =
      document.getElementById("ski-account-select")?.value;
    if (selectedAccountId) {
      let destination = `${baseUrl}/accounts/${selectedAccountId}/settings#tab-reports`;
      window.open(destination, "_blank");
    }
  }

  async function loadAccountSelect() {
    let manageableAccounts = await getManageableAccounts();
    if (manageableAccounts.length == 0) {
      manageableAccounts = await getAccounts();
    }
    manageableAccounts.sort((a, b) => {
      const parentIdA = a.parent_account_id;
      const parentIdB = b.parent_account_id;
      const nameA = a.name;
      const nameB = b.name;
      if (!parentIdA) {
        return -1;
      } else if (!parentIdB) {
        return 1;
      } else if (parentIdA < parentIdB) {
        return -1;
      } else if (parentIdA > parentIdB) {
        return 1;
      } else {
        return nameA.localeCompare(nameB);
      }
    });

    const nestedAccounts = {};
    for (let account of manageableAccounts) {
      const parentAccountId = account.parent_account_id;
      if (!parentAccountId) {
        nestedAccounts[account.id] = {
          level: 0,
          children: [],
          details: account,
        };
      } else if (parentAccountId in nestedAccounts) {
        nestedAccounts[parentAccountId].children.push(account.id);
        nestedAccounts[account.id] = {
          level: nestedAccounts[parentAccountId].level + 1,
          children: [],
          details: account,
        };
      } else {
        nestedAccounts[account.id] = {
          level: 1,
          children: [],
          details: account,
        };
      }
    }

    const accountSelect = document.getElementById("ski-account-select");
    if (accountSelect) {
      for (let accountId in nestedAccounts) {
        const account = nestedAccounts[accountId];
        addAccountOption(accountSelect, account.details, 0);

        let children = account.children;
        if (children.length > 0) {
          addChildrenOptions(accountSelect, children, 1, nestedAccounts);
        }
      }
    }
    
  }

  function getManageableAccounts() {
    const manageableAccounts = [];
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    const url = `${baseUrl}/api/v1/manageable_accounts?per_page=100`;
    return paginatedRequest(url, manageableAccounts);
  }

  function getAccounts() {
    const accounts = [];
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    const url = `${baseUrl}/api/v1/accounts?per_page=100`;
    return paginatedRequest(url, accounts);
  }

  async function loadTermsSelect() {
    const terms = await getEnrollmentTerms();
    terms.sort((a, b) => {
      const startDateA = a.start_at;
      const startDateB = b.start_at;
      const endDateA = a.end_at;
      const endDateB = b.end_at;
      if (!startDateA && startDateB) {
        return -1;
      } else if (startDateA && !startDateB) {
        return 1;
      } else {
        let dateA = new Date(startDateA);
        let dateB = new Date(startDateB);
        if (dateA > dateB) {
          return -1;
        } else if (dateA < dateB) {
          return 1;
        } else {
          if (!endDateA && endDateB) {
            return -1;
          } else if (endDateA && !endDateB) {
            return 1;
          } else {
            dateA = new Date(startDateA);
            dateB = new Date(startDateB);
            if (dateA > dateB) {
              return -1;
            }
            if (dateA < dateB) {
              return 1;
            } else {
              return 0;
            }
          }
        }
      }
    });

    const termSelect = document.getElementById("ski-term-select");
    const activeGroup = termSelect.querySelector(
      "optgroup[label='Active Terms']"
    );
    const futureGroup = termSelect.querySelector(
      "optgroup[label='Future Terms']"
    );
    const pastGroup = termSelect.querySelector("optgroup[label='Past Terms']");
    const currentDate = new Date();
    for (let term of terms) {
      const termStart = term.start_at;
      const termEnd = term.end_at;
      if (!termStart) {
        if (!termEnd) {
          addTermOption(activeGroup, term);
        } else {
          const endDate = new Date(termEnd);
          if (endDate > currentDate) {
            addTermOption(activeGroup, term);
          } else {
            addTermOption(pastGroup, term);
          }
        }
      } else if (!termEnd) {
        const startDate = new Date(termStart);
        if (startDate > currentDate) {
          addTermOption(futureGroup, term);
        } else {
          addTermOption(activeGroup, term);
        }
      } else {
        const startDate = new Date(termStart);
        const endDate = new Date(termEnd);
        if (startDate > currentDate) {
          addTermOption(futureGroup, term);
        } else if (endDate > currentDate) {
          addTermOption(activeGroup, term);
        } else {
          addTermOption(pastGroup, term);
        }
      }
    }
  }

  function getEnrollmentTerms() {
    const terms = [];
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    const url = `${baseUrl}/api/v1/accounts/self/terms?per_page=100`;
    return paginatedRequest(url, terms, "enrollment_terms");
  }

  async function loadRoleSelect() {
    const roles = await getRoles();
    const roleSets = {
      StudentEnrollment: [],
      TeacherEnrollment: [],
      TaEnrollment: [],
      DesignerEnrollment: [],
      ObserverEnrollment: [],
    };
    for (let role of roles) {
      const baseRoleType = role.base_role_type;
      if (baseRoleType in roleSets) {
        roleSets[baseRoleType].push(role);
      }
    }
    const roleSelect = document.getElementById("ski-user-role-select");
    if (roleSelect) {
      let roleSelectOptions = `
        <optgroup label="Select course role">
          <option value="">All Roles</option>
      `;
      for (let baseRoleType in roleSets) {
        const rolesOfType = roleSets[baseRoleType];
        for (let role of rolesOfType) {
          roleSelectOptions += `<option value="${role.id}">${role.label}</option>`;
        }
      }
      roleSelectOptions += `</optgroup>`;
      roleSelect.innerHTML = roleSelectOptions;
    }
  }

  async function updateVisibleElements() {
    const selectedAccountId =
      document.getElementById("ski-account-select")?.value;
    const userPermissions = await getPermissions(selectedAccountId);
    
    const canSearchCourses = hasPermission(
      userPermissions,
      "read_course_list"
    );
    const courseSearch = document.getElementById("ski=global-nav-admin-course-search");
    if (courseSearch) {
      if (canSearchCourses) {
        courseSearch.style.display = "block";
      } else {
        courseSearch.style.display = "none";
      }
    }

    const canSearchUsers = hasPermission(userPermissions, "read_roster");
    const peopleSearch = document.getElementById("ski-global-nav-admin-people-search");
    if (peopleSearch) {
      if (canSearchUsers) {
        peopleSearch.style.display = "block";
      } else {
        peopleSearch.style.display = "none";
      }
    }
    
    
    const canViewAdminTools =
      hasPermission(userPermissions, "undelete_courses") ||
      hasPermission(userPermissions, "view_notifications") ||
      hasPermission(userPermissions, "view_grade_changes") ||
      hasPermission(userPermissions, "view_course_changes");
    const adminToolsDiv = document.getElementById("ski-global-nav-admin-admin-tools");
    if (adminToolsDiv) {
      if (canViewAdminTools) {
        adminToolsDiv.style.display = "block";
      } else {
        adminToolsDiv.style.display = "none";
      }
    }
    
    
    const canViewAccountReports = hasPermission(
      userPermissions,
      "read_reports"
    );
    const accountReportsDiv = document.getElementById("ski-global-nav-admin-account-reports");
    if (accountReportsDiv) {
      if (canViewAccountReports) {
        accountReportsDiv.style.display = "block";
      } else {
        accountReportsDiv.style.display = "none";
      }
    }
    
  }

  function getRoles() {
    const roles = [];
    const accountId = document.getElementById("ski-account-select")?.value;
    if (accountId) {
      const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
      const url = `${baseUrl}/api/v1/accounts/${accountId}/roles?show_inherited=true&per_page=100`;
      return paginatedRequest(url, roles);
    }
    return roles;
  }

  function paginatedRequest(url, results, keyForArray) {
    let nextUrl = "";
    return fetch(url)
      .then((response) => {
        let links = response.headers.get("link");
        links = links
          .replaceAll("<", "")
          .replaceAll(">", "")
          .replaceAll(" rel=", "")
          .replaceAll('"', "");
        links = links.split(",");
        links = links.map((link) => link.split(";"));
        const linkDictionary = {};
        links.forEach((link) => (linkDictionary[link[1]] = link[0]));

        nextUrl = linkDictionary["next"];

        return response.json();
      })
      .then((data) => {
        if (keyForArray) {
          const resultArray = data[keyForArray];
          results.push(...resultArray);
        } else {
          results.push(...data);
        }
        if (nextUrl) {
          return paginatedRequest(nextUrl, results, keyForArray);
        }

        return results;
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
        return results;
      });
  }

  function addAccountOption(selectMenu, account, indentLevel) {
    let indentation = "";
    if (indentLevel > 0) {
      indentation = "|";
      for (let x = 0; x < indentLevel; x++) {
        indentation += "--";
      }
      indentation += "> ";
    }

    selectMenu?.insertAdjacentHTML(
      "beforeend",
      `
      <option value="${account.id}">${indentation}${account.name}</option>
    `
    );
  }

  function addChildrenOptions(
    selectMenu,
    childrenAccounts,
    indentLevel,
    allAccounts
  ) {
    for (let childId of childrenAccounts) {
      const currentAccount = allAccounts[childId];
      addAccountOption(selectMenu, currentAccount.details, indentLevel);
      let children = currentAccount.children;
      if (children.length > 0) {
        addChildrenOptions(selectMenu, children, indentLevel + 1, allAccounts);
      }
      delete allAccounts[childId];
    }
  }

  function addTermOption(termSelectGroup, term) {
    termSelectGroup?.insertAdjacentHTML(
      "beforeend",
      `
      <option value="${term.id}">${term.name}</option>
    `
    );
  }
})();
