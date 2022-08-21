(() => {
  if (/^\/accounts\/[0-9]+\/users\/[0-9]+/.test(window.location.pathname) || 
      /^\/accounts\/self\/users\/[0-9]+/.test(window.location.pathname) || 
      /^\/users\/[0-9]+/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminUsersEnrollmentsResizable: true,
      adminUsersEnrollmentsDefaultHeight: 400,
      adminUsersEnrollmentsSort: true,
      adminUsersEnrollmentsFilter: true,
      adminUsersEnrollmentsCourseCode: true,
      adminUsersAccountsResizable: true,
      adminUsersAccountsDefaultHeight: 100,
      adminUsersAccountsRoles: true,
      adminUsersGroupsResizable: true,
      adminUsersGroupsDefaultHeight: 100,
      adminUsersAvatarResizable: true,
      adminUsersAddGradesLink: true,
    }, function (items) {
      // Update Courses List if available
      const coursesList = document.querySelector("div.courses ul");
      if (coursesList) {
        coursesList.style.height = `${items.adminUsersEnrollmentsDefaultHeight}px`;
        if (items.adminUsersEnrollmentsResizable) {
          coursesList.style.maxHeight = "";
          coursesList.style.resize = "vertical";
        }
        if (items.adminUsersEnrollmentsSort) {
          sortEnrollments(coursesList);
        }
        if (items.adminUsersEnrollmentsFilter) {
          addCourseStatusFilter(coursesList);
          addCourseEnrollmentsStatusFilter(coursesList);
          addCourseEnrollmentsTermFilter(coursesList);
        }
        if (items.adminUsersEnrollmentsCourseCode) {
          addCourseCodeToEnrollmentsList(coursesList);
        }
      }

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

      // Make avatar clickable to resize if available
      const avatarImgWrapper = document.querySelector("span.avatar_image");
      if (items.adminUsersAvatarResizable && avatarImgWrapper) {
        makeAvatarImageResizable(avatarImgWrapper);
      }

      if (items.adminUsersAddGradesLink) {
        addGradesButton();
      }
    });
  }

  /*
    This modifies the avatar img and its container so that it is manually resizable
    and allows you to enlarge and shrink the image to defined sizes by clicking on it.
  */
  function makeAvatarImageResizable(avatarImgWrapper) {
    avatarImgWrapper.style.display = "inline-block"
    avatarImgWrapper.style.resize = "both"
    avatarImgWrapper.style.overflow = "auto"
    avatarImgWrapper.style.minWidth = "60px";
    avatarImgWrapper.style.minHeight = "60px";
    avatarImgWrapper.style.width = "60px";
    avatarImgWrapper.style.height = "60px";

    const imgSpan = avatarImgWrapper.querySelector("span.avatar");
    imgSpan.style.width = "90%";
    imgSpan.style.height = "90%";

    imgSpan.addEventListener("click", () => {
      if (parseInt(avatarImgWrapper.style.width) < 100) {
        avatarImgWrapper.style.width = "180px";
        avatarImgWrapper.style.height = "180px";
      }
      else {
        avatarImgWrapper.style.width = "60px";
        avatarImgWrapper.style.height = "60px";
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
      const url = `/api/v1/accounts/${accountNumber}/admins?user_id[]=${userId}`; // TODO Update to be paginated
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


  /*
    This creates a filter in the course enrollments section filled with the terms
    that are shown in the list of enrollments and the default term.
  */
  function addCourseEnrollmentsTermFilter(coursesList) {
    const coursesListItems = coursesList.querySelectorAll("li");
    const courseTerms = [...coursesListItems].filter(item => {
      return item.querySelectorAll("a span.subtitle").length > 1;
    }).map(item => {
      return item.querySelector("a span.subtitle").textContent.replaceAll("\n", "").trim();
    });

    let terms = new Set();
    courseTerms.forEach(term => {
      terms.add(term);
    })
    terms = Array.from(terms).sort();

    let termSelectMenu =
      `<select id="ski-course-term-select-filter" style="margin-right: 5px;">
      <option value="">All Terms</option>
      <option value="Default Term">Default Term</option>`;
    terms.forEach(term => {
      termSelectMenu += `<option value="${term}">${term}</option>`;
    });
    termSelectMenu += `</select>`;
    coursesList.insertAdjacentHTML("beforebegin", termSelectMenu);
    document.getElementById("ski-course-term-select-filter").onchange = () => { filterCourseEnrollments() };
  }


  /*
    This adds a filter in the course enrollments section for the different 
    enrollment statues a user may have for a course
  */
  function addCourseEnrollmentsStatusFilter(coursesList) {
    const enrollmentStatuses = {
      "Active": "active",
      "Completed": "completed",
      "Pending/Invited": "creation_pending",
      "Inactive": "inactive",
      "Rejected": "rejected"
    };

    let statusSelectMenu =
      `<select id="ski-enrollment-status-select-filter" style="margin-right: 5px;">
      <option value="">All Enrollment Statuses</option>`;
    for (let status in enrollmentStatuses) {
      statusSelectMenu += `<option value="${enrollmentStatuses[status]}">${status}</option>`;
    }
    statusSelectMenu += `</select>`;
    coursesList.insertAdjacentHTML("beforebegin", statusSelectMenu);
    document.getElementById("ski-enrollment-status-select-filter").onchange = () => { filterCourseEnrollments() };
  }


  /*
    This adds a filter in the course enrollments section for the different
    published states of a course
  */
  function addCourseStatusFilter(coursesList) {
    const courseStatuses = {
      "Published": "published",
      "Unpublished": "unpublished"
    };

    let statusSelectMenu =
      `<select id="ski-course-status-select-filter" style="margin-right: 5px;">
      <option value="">All Course Statuses</option>`;
    for (let status in courseStatuses) {
      statusSelectMenu += `<option value="${courseStatuses[status]}">${status}</option>`;
    }
    statusSelectMenu += `</select>`;
    coursesList.insertAdjacentHTML("beforebegin", statusSelectMenu);
    document.getElementById("ski-course-status-select-filter").onchange = () => { filterCourseEnrollments() };
  }


  /*
    This function will filter the list of course enrollments for a user based on the
    current values of the filter select menus
  */
  function filterCourseEnrollments() {
    const coursesListItems = document.querySelectorAll("div.courses ul li");
    [...coursesListItems].forEach(item => {
      let shouldShow = true;

      // Check for filtering needed by term
      const termSelectMenu = document.querySelector("select#ski-course-term-select-filter");
      if (termSelectMenu) {
        const selectedTerm = termSelectMenu.value;
        if (selectedTerm) {
          const subtitles = item.querySelectorAll("span[class='subtitle']");
          if (subtitles.length == 1) {
            if (selectedTerm != "Default Term") {
              shouldShow = false;
            }
          }
          else {
            if (selectedTerm != subtitles[0].textContent.replaceAll("\n", "").trim()) {
              shouldShow = false;
            }
          }
        }
      }

      // Check for filtering needed by course status if it currently should still show
      if (shouldShow) {
        const statuses = [...item.classList];
        const courseStatusSelectMenu = document.querySelector("select#ski-course-status-select-filter");
        if (courseStatusSelectMenu) {
          const selectedCourseStatus = courseStatusSelectMenu.value;
          if (selectedCourseStatus) {
            if (selectedCourseStatus == "published") {
              if (statuses.indexOf("unpublished") > -1) {
                shouldShow = false;
              }
            }
            else {
              if (statuses.indexOf(selectedCourseStatus) == -1) {
                shouldShow = false;
              }
            }
          }
        }

        // Check for filtering needed by enrollment status if it currently should still show
        if (shouldShow) {
          const enrollmentStatusSelectMenu = document.querySelector("select#ski-enrollment-status-select-filter");
          if (enrollmentStatusSelectMenu) {
            const selectedEnrollmentStatus = enrollmentStatusSelectMenu.value;
            if (selectedEnrollmentStatus) {
              if (statuses.indexOf(selectedEnrollmentStatus) == -1) {
                shouldShow = false;
              }
            }
          }
        }
      }

      if (shouldShow) {
        item.style.display = "";
      }
      else {
        item.style.display = "none";
      }
    });
  }


  /*
    This will sort the list of course enrollments by enrollment status,
    then by term in reverse alphabetical order (based on the term name 
    with default term last), and then by the role within the course.
  */
  function sortEnrollments(coursesList) {
    const courseListItems = coursesList.querySelectorAll("li");
    if (courseListItems) {
      const sortedList = [...courseListItems].sort((a, b) => {
        const aSubtitles = [...a.querySelectorAll("a span[class='subtitle']")];
        const aTerm = aSubtitles.length > 1 ? aSubtitles[0].textContent : "";
        const aStatusAndRole = aSubtitles.pop().textContent.trim().replaceAll("\n", " ").split(",");
        const aStatus = aStatusAndRole[0];
        const aRole = aStatusAndRole[1].trim().replace("Enrolled as: ", "");

        const bSubtitles = [...b.querySelectorAll("a span[class='subtitle']")];
        const bTerm = bSubtitles.length > 1 ? bSubtitles[0].textContent : "";
        const bStatusAndRole = bSubtitles.pop().textContent.trim().replaceAll("\n", " ").split(",");
        const bStatus = bStatusAndRole[0];
        const bRole = bStatusAndRole[1].trim().replace("Enrolled as: ", "");

        if (aStatus < bStatus) {
          return -1;
        }
        else if (aStatus > bStatus) {
          return 1;
        }
        else {
          if (aTerm && bTerm && aTerm < bTerm) {
            return 1;
          }
          else if (aTerm && bTerm && aTerm > bTerm) {
            return -1;
          }
          else if (!aTerm && bTerm) {
            return 1;
          }
          else if (!bTerm && aTerm) {
            return -1;
          }
          else if (aRole < bRole) {
            return 1;
          }
          else if (aRole > bRole) {
            return -1;
          }
          else {
            return 0;
          }
        }
      });

      for (const item of sortedList) {
        coursesList.appendChild(item);
      }
    }
  }


  /*
    Takes in the list of course enrollments.
    For each enrollment in the list of course enrollments,
    it will fetch the course code and add it to the shown details.
  */
  function addCourseCodeToEnrollmentsList(coursesList) {
    const coursesListItems = [...coursesList.querySelectorAll("li")];
    if (coursesListItems) {
      let requestNum = 0;
      coursesListItems.forEach(async (listItem) => {
        requestNum++;
        await new Promise(r => setTimeout(r, requestNum * 20));
        const courseNameLink = listItem.querySelector("a[href*='/courses/']");
        if (courseNameLink) {
          const courseCode = courseNameLink.parentElement.querySelector("span.ski-course-code");
          if (!courseCode) {
            const canvasCourseCode = courseNameLink.href.match(/\/courses\/[0-9]+\//)[0].replace("courses", "").replaceAll("/", "");
            fetch(`/api/v1/courses/${canvasCourseCode}`)
              .then(response => response.json())
              .then(data => {
                const courseCode = data["course_code"];
                const courseName = courseNameLink.querySelector("span.name");
                courseName.insertAdjacentHTML("afterend", `<span class="ski-course-code subtitle" style="word-break: break-word; font-style: italic;">Course Code: ${courseCode}</span>`);
              })
              .catch((error) => {
                console.error('Error:', error);
              });
          }
        }
      });
    }
  }

  function addGradesButton() {
    const rightSide = document.getElementById("right-side");
    if (rightSide) {
      const userId = window.location.pathname.split("/").pop();
      rightSide.insertAdjacentHTML("beforeend", `
        <div>
          <a href="/users/${userId}/grades" target="_blank" class="btn button-sidebar-wide">
            <i class="icon-check-plus"></i> View Current Grades
          </a>
        </div>
      `);
    }
  }
})();