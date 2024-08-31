(() => {
  if (
    /^\/accounts\/[0-9]+\/users\/[0-9]+/.test(window.location.pathname) ||
    /^\/accounts\/self\/users\/[0-9]+/.test(window.location.pathname) ||
    /^\/users\/[0-9]+/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        adminUsersEnrollmentsResizable: true,
        adminUsersEnrollmentsDefaultHeight: 400,
        adminUsersEnrollmentsSort: true,
        adminUsersEnrollmentsFilter: true,
        adminUsersEnrollmentsCourseCode: true,
        adminUsersEnrollmentsCanvasId: true,
      },
      function (items) {
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
            addCourseEnrollmentsRoleFilter(coursesList);
            addCourseEnrollmentsNameSearch(coursesList);
            if (items.adminUsersEnrollmentsCourseCode) {
              addCourseEnrollmentsCourseCodeSearch(coursesList);
            }
          }
          if (items.adminUsersEnrollmentsCourseCode) {
            addCourseCodeToEnrollmentsList(coursesList);
          }
          if (items.adminUsersEnrollmentsCanvasId) {
            addCanvasIdToEnrollmentsList(coursesList);
          }
        }
      }
    );
  }

  /*
    This creates a filter in the course enrollments section filled with the terms
    that are shown in the list of enrollments and the default term.
  */
  function addCourseEnrollmentsTermFilter(coursesList) {
    const coursesListItems = coursesList.querySelectorAll("li");
    const courseTerms = [...coursesListItems]
      .filter((item) => {
        return item.querySelectorAll("a span.subtitle").length > 1;
      })
      .map((item) => {
        return item
          .querySelector("a span.subtitle")
          .textContent.replaceAll("\n", "")
          .trim();
      });

    let terms = new Set();
    courseTerms.forEach((term) => {
      terms.add(term);
    });
    terms = Array.from(terms).sort();

    let termSelectMenu = `<select id="ski-course-term-select-filter" style="margin-right: 5px;">
      <option value="">All Terms</option>
      <option value="Default Term">Default Term</option>`;
    terms.forEach((term) => {
      termSelectMenu += `<option value="${term}">${term}</option>`;
    });
    termSelectMenu += `</select>`;
    coursesList.insertAdjacentHTML("beforebegin", termSelectMenu);
    document.getElementById("ski-course-term-select-filter").onchange = () => {
      filterCourseEnrollments();
    };
  }

  /*
    This creates a filter in the course enrollments section filled with the enrollment roles
    that are shown in the list of enrollments.
  */
  function addCourseEnrollmentsRoleFilter(coursesList) {
    const coursesListItems = coursesList.querySelectorAll("li");
    const courseRoles = [...coursesListItems]
      .map((item) => {
        const lastSubtitle = [
          ...item.querySelectorAll("a span.subtitle"),
        ]?.pop();
        const hasEnrollment =
          lastSubtitle?.textContent?.includes("Enrolled as: ");
        if (hasEnrollment) {
          return lastSubtitle.textContent
            .split("Enrolled as: ")[1]
            ?.replaceAll("\n", "")
            ?.trim();
        } else {
          return "";
        }
      })
      .filter((item) => {
        return item && item.length > 0;
      });

    let roles = new Set();
    courseRoles.forEach((role) => {
      roles.add(role);
    });
    roles = Array.from(roles).sort();

    let roleSelectMenu = `<select id="ski-course-role-select-filter" style="margin-right: 5px;">
        <option value="">All Roles</option>`;
    roles.forEach((role) => {
      roleSelectMenu += `<option value="${role}">${role}</option>`;
    });
    roleSelectMenu += `</select>`;
    coursesList.insertAdjacentHTML("beforebegin", roleSelectMenu);
    document.getElementById("ski-course-role-select-filter").onchange = () => {
      filterCourseEnrollments();
    };
  }

  /*
    This adds a filter in the course enrollments section for the different 
    enrollment statues a user may have for a course
  */
  function addCourseEnrollmentsStatusFilter(coursesList) {
    const enrollmentStatuses = {
      Active: "active",
      Completed: "completed",
      "Pending/Invited": "creation_pending",
      Inactive: "inactive",
      Rejected: "rejected",
    };

    let statusSelectMenu = `<select id="ski-enrollment-status-select-filter" style="margin-right: 5px;">
      <option value="">All Enrollment Statuses</option>`;
    for (let status in enrollmentStatuses) {
      statusSelectMenu += `<option value="${enrollmentStatuses[status]}">${status}</option>`;
    }
    statusSelectMenu += `</select>`;
    coursesList.insertAdjacentHTML("beforebegin", statusSelectMenu);
    document.getElementById("ski-enrollment-status-select-filter").onchange =
      () => {
        filterCourseEnrollments();
      };
  }

  /*
    This adds a filter in the course enrollments section for the different
    published states of a course
  */
  function addCourseStatusFilter(coursesList) {
    const courseStatuses = {
      Published: "published",
      Unpublished: "unpublished",
    };

    let statusSelectMenu = `<select id="ski-course-status-select-filter" style="margin-right: 5px;">
      <option value="">All Course Statuses</option>`;
    for (let status in courseStatuses) {
      statusSelectMenu += `<option value="${courseStatuses[status]}">${status}</option>`;
    }
    statusSelectMenu += `</select>`;
    coursesList.insertAdjacentHTML("beforebegin", statusSelectMenu);
    document.getElementById("ski-course-status-select-filter").onchange =
      () => {
        filterCourseEnrollments();
      };
  }

  /*
    This adds a search input for the course name
  */
  function addCourseEnrollmentsNameSearch(coursesList) {
    coursesList.insertAdjacentHTML(
      "beforebegin",
      `
      <label><span class="screenreader-only">Search course name </span>
        <input type="text" id="ski-course-name-search" placeholder="Search course name" title="Search course name">
      </label>
    `
    );

    const newCourseNameSearch = document.getElementById(
      "ski-course-name-search"
    );
    if (newCourseNameSearch) {
      newCourseNameSearch.addEventListener("keyup", () =>
        filterCourseEnrollments()
      );
      newCourseNameSearch.addEventListener("blur", () =>
        filterCourseEnrollments()
      );
    }
  }

  /*
    This adds a search input for the course code
  */
  function addCourseEnrollmentsCourseCodeSearch(coursesList) {
    coursesList.insertAdjacentHTML(
      "beforebegin",
      `
        <label><span class="screenreader-only">Search course code </span>
          <input type="text" id="ski-course-code-search" placeholder="Search course code" title="Search course code">
        </label>
      `
    );

    const newCourseCodeSearch = document.getElementById(
      "ski-course-code-search"
    );
    if (newCourseCodeSearch) {
      newCourseCodeSearch.addEventListener("keyup", () =>
        filterCourseEnrollments()
      );
      newCourseCodeSearch.addEventListener("blur", () =>
        filterCourseEnrollments()
      );
    }
  }

  /*
    This function will filter the list of course enrollments for a user based on the
    current values of the filter select menus
  */
  function filterCourseEnrollments() {
    const coursesListItems = document.querySelectorAll("div.courses ul li");
    [...coursesListItems].forEach((item) => {
      let shouldShow = true;

      const subtitles = [...item.querySelectorAll("span[class='subtitle']")];
      // Check for filtering needed by term
      const termSelectMenu = document.querySelector(
        "select#ski-course-term-select-filter"
      );
      if (termSelectMenu) {
        const selectedTerm = termSelectMenu.value;
        if (selectedTerm) {
          if (subtitles.length == 1) {
            if (selectedTerm != "Default Term") {
              shouldShow = false;
            }
          } else {
            if (
              selectedTerm !=
              subtitles[0].textContent.replaceAll("\n", "").trim()
            ) {
              shouldShow = false;
            }
          }
        }
      }

      // Check for filtering needed by course status if it currently should still show
      if (shouldShow) {
        const statuses = [...item.classList];
        const courseStatusSelectMenu = document.querySelector(
          "select#ski-course-status-select-filter"
        );
        if (courseStatusSelectMenu) {
          const selectedCourseStatus = courseStatusSelectMenu.value;
          if (selectedCourseStatus) {
            if (selectedCourseStatus == "published") {
              if (statuses.indexOf("unpublished") > -1) {
                shouldShow = false;
              }
            } else {
              if (statuses.indexOf(selectedCourseStatus) == -1) {
                shouldShow = false;
              }
            }
          }
        }

        // Check for filtering needed by enrollment status if it currently should still show
        if (shouldShow) {
          const enrollmentStatusSelectMenu = document.querySelector(
            "select#ski-enrollment-status-select-filter"
          );
          if (enrollmentStatusSelectMenu) {
            const selectedEnrollmentStatus = enrollmentStatusSelectMenu.value;
            if (selectedEnrollmentStatus) {
              if (statuses.indexOf(selectedEnrollmentStatus) == -1) {
                shouldShow = false;
              }
            }
          }

          // Check for filtering by enrollment role if filtering is still needed
          if (shouldShow) {
            const enrollmentRoleSelectMenu = document.querySelector(
              "select#ski-course-role-select-filter"
            );
            if (enrollmentRoleSelectMenu) {
              const selectedEnrollmentRole = enrollmentRoleSelectMenu.value;
              if (selectedEnrollmentRole) {
                const lastSubtitle = subtitles?.pop();
                const hasEnrollment =
                  lastSubtitle?.textContent?.includes("Enrolled as: ");
                if (hasEnrollment) {
                  const currentRole = lastSubtitle.textContent
                    .split("Enrolled as: ")[1]
                    ?.replaceAll("\n", "")
                    ?.trim();
                  if (currentRole != selectedEnrollmentRole) {
                    shouldShow = false;
                  }
                } else {
                  shouldShow = false;
                }
              }
            }

            // Check for filtering by course name if filtering is still needed
            if (shouldShow) {
              const courseNameSearchInput = document.getElementById(
                "ski-course-name-search"
              );
              if (courseNameSearchInput) {
                const courseNameSearchValue = new DOMParser()
                  .parseFromString(courseNameSearchInput.value, "text/html")
                  .body.innerText?.toUpperCase();
                if (courseNameSearchValue && courseNameSearchValue.length > 0) {
                  const courseName =
                    item
                      .querySelector("a span.name")
                      ?.innerText?.trim()
                      ?.toUpperCase() ?? "";
                  if (
                    !courseName ||
                    !courseName.includes(courseNameSearchValue)
                  ) {
                    shouldShow = false;
                  }
                }
              }
              // Check for filtering by course code if filtering is still needed
              if (shouldShow) {
                const courseCodeSearchInput = document.getElementById(
                  "ski-course-code-search"
                );
                if (courseCodeSearchInput) {
                  const courseCodeSearchValue = new DOMParser()
                    .parseFromString(courseCodeSearchInput.value, "text/html")
                    .body.innerText?.toUpperCase();
                  if (
                    courseCodeSearchValue &&
                    courseCodeSearchValue.length > 0
                  ) {
                    const courseCode =
                      item
                        .querySelector("a span.ski-course-code")
                        ?.innerText?.trim()
                        .toUpperCase() ?? "";
                    if (
                      !courseCode ||
                      !courseCode.includes(courseCodeSearchValue)
                    ) {
                      shouldShow = false;
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (shouldShow) {
        item.style.display = "";
      } else {
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
        const aStatusAndRole = aSubtitles
          .pop()
          .textContent.trim()
          .replaceAll("\n", " ")
          .split(",");
        const aStatus = aStatusAndRole[0];
        const aRole = aStatusAndRole[1].trim().replace("Enrolled as: ", "");

        const bSubtitles = [...b.querySelectorAll("a span[class='subtitle']")];
        const bTerm = bSubtitles.length > 1 ? bSubtitles[0].textContent : "";
        const bStatusAndRole = bSubtitles
          .pop()
          .textContent.trim()
          .replaceAll("\n", " ")
          .split(",");
        const bStatus = bStatusAndRole[0];
        const bRole = bStatusAndRole[1].trim().replace("Enrolled as: ", "");

        if (aStatus < bStatus) {
          return -1;
        } else if (aStatus > bStatus) {
          return 1;
        } else {
          if (aTerm && bTerm && aTerm < bTerm) {
            return 1;
          } else if (aTerm && bTerm && aTerm > bTerm) {
            return -1;
          } else if (!aTerm && bTerm) {
            return 1;
          } else if (!bTerm && aTerm) {
            return -1;
          } else if (aRole < bRole) {
            return 1;
          } else if (aRole > bRole) {
            return -1;
          } else {
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
        await new Promise((r) => setTimeout(r, requestNum * 20));
        const courseNameLink = listItem.querySelector("a[href*='/courses/']");
        if (courseNameLink) {
          const courseCode = courseNameLink.parentElement.querySelector(
            "span.ski-course-code"
          );
          if (!courseCode) {
            const canvasCourseCode = courseNameLink.href
              .match(/\/courses\/[0-9]+\//)[0]
              .replace("courses", "")
              .replaceAll("/", "");
            const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
            fetch(`${baseUrl}/api/v1/courses/${canvasCourseCode}`)
              .then((response) => response.json())
              .then((data) => {
                const courseCode = data["course_code"];
                const courseName = courseNameLink.querySelector("span.name");
                courseName.insertAdjacentHTML(
                  "afterend",
                  `<span class="ski-course-code subtitle" style="word-break: break-word; font-style: italic;">Course Code: ${courseCode}</span>`
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

  /*
    Takes in the list of course enrollments.
    For each enrollment in the list of course enrollments,
    it will add the Canvas ID to the shown details.
  */
  function addCanvasIdToEnrollmentsList(coursesList) {
    const coursesListItems = [...coursesList.querySelectorAll("li")];
    if (coursesListItems) {
      coursesListItems.forEach(async (listItem) => {
        const courseNameLink = listItem.querySelector("a[href*='/courses/']");
        if (courseNameLink) {
          const canvasIdSpan =
            courseNameLink.parentElement.querySelector("span.ski-canvas-id");
          if (!canvasIdSpan) {
            const canvasCourseCode = courseNameLink.href
              .match(/\/courses\/[0-9]+\//)[0]
              .replace("courses", "")
              .replaceAll("/", "");
            const courseName = courseNameLink.querySelector("span.name");
            courseName.insertAdjacentHTML(
              "afterend",
              `<span class="ski-canvas-id subtitle" style="word-break: break-word; font-style: italic;">Canvas Course ID: ${canvasCourseCode}</span>`
            );
          }
        }
      });
    }
  }
})();
