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
        adminUsersEnrollmentsSisCourseId: true,
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
            addSearchFilters(
              coursesList,
              items.adminUsersEnrollmentsCourseCode,
              items.adminUsersEnrollmentsSisCourseId
            );
            addSelectMenuFilters(coursesList);
            //addCourseStatusFilter(coursesList);
            //addCourseEnrollmentsStatusFilter(coursesList);
            //addCourseEnrollmentsTermFilter(coursesList);
            //addCourseEnrollmentsRoleFilter(coursesList);
            /*
            addCourseEnrollmentsNameSearch(coursesList);
            if (items.adminUsersEnrollmentsCourseCode) {
              addCourseEnrollmentsCourseCodeSearch(coursesList);
            }
            if (items.adminUsersEnrollmentsSisCourseId) {
              addCourseEnrollmentsSisCourseIdSearch(coursesList);
            }
              */
          }
          if (
            items.adminUsersEnrollmentsCourseCode ||
            items.adminUsersEnrollmentsSisCourseId
          ) {
            addCourseCodesToEnrollmentsList(
              coursesList,
              items.adminUsersEnrollmentsCourseCode,
              items.adminUsersEnrollmentsSisCourseId
            );
          }
          if (items.adminUsersEnrollmentsCanvasId) {
            addCanvasIdToEnrollmentsList(coursesList);
          }
        }
      }
    );
  }

  function addSearchFilters(
    coursesList,
    isCourseCodeEnabled,
    isSisCourseIdEnabled
  ) {
    const wrapper = document.createElement("div");
    coursesList.insertAdjacentElement("beforebegin", wrapper);

    addCourseEnrollmentsNameSearch(wrapper);
    if (isCourseCodeEnabled) {
      addCourseEnrollmentsCourseCodeSearch(wrapper);
    }
    if (isSisCourseIdEnabled) {
      addCourseEnrollmentsSisCourseIdSearch(wrapper);
    }
  }

  function addSelectMenuFilters(coursesList) {
    const wrapper = document.createElement("div");
    coursesList.insertAdjacentElement("beforebegin", wrapper);
    addCourseStatusFilter(wrapper, coursesList);
    addCourseEnrollmentsTermFilter(wrapper, coursesList);
    addCourseEnrollmentsStatusFilter(wrapper, coursesList);
    addCourseEnrollmentsRoleFilter(wrapper, coursesList);
  }

  /*
    This creates a filter in the course enrollments section filled with the terms
    that are shown in the list of enrollments and the default term.
  */
  function addCourseEnrollmentsTermFilter(wrapper, coursesList) {
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
    wrapper.insertAdjacentHTML("beforeend", termSelectMenu);
    document.getElementById("ski-course-term-select-filter").onchange = () => {
      filterCourseEnrollments();
    };
  }

  /*
    This creates a filter in the course enrollments section filled with the enrollment roles
    that are shown in the list of enrollments.
  */
  function addCourseEnrollmentsRoleFilter(wrapper, coursesList) {
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
    wrapper.insertAdjacentHTML("beforeend", roleSelectMenu);
    document.getElementById("ski-course-role-select-filter").onchange = () => {
      filterCourseEnrollments();
    };
  }

  /*
    This adds a filter in the course enrollments section for the different 
    enrollment statues a user may have for a course
  */
  function addCourseEnrollmentsStatusFilter(wrapper, coursesList) {
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
    wrapper.insertAdjacentHTML("beforeend", statusSelectMenu);
    document.getElementById("ski-enrollment-status-select-filter").onchange =
      () => {
        filterCourseEnrollments();
      };
  }

  /*
    This adds a filter in the course enrollments section for the different
    published states of a course
  */
  function addCourseStatusFilter(wrapper, coursesList) {
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
    wrapper.insertAdjacentHTML("beforeend", statusSelectMenu);
    document.getElementById("ski-course-status-select-filter").onchange =
      () => {
        filterCourseEnrollments();
      };
  }

  /*
    This adds a search input for the course name
  */
  function addCourseEnrollmentsNameSearch(wrapper) {
    wrapper.insertAdjacentHTML(
      "beforeend",
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
  function addCourseEnrollmentsCourseCodeSearch(wrapper) {
    wrapper.insertAdjacentHTML(
      "beforeend",
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
    This adds a search input for the course code
  */
  function addCourseEnrollmentsSisCourseIdSearch(wrapper) {
    wrapper.insertAdjacentHTML(
      "beforeend",
      `
          <label><span class="screenreader-only">Search SIS course code </span>
            <input type="text" id="ski-sis-course-id-search" placeholder="Search SIS course code" title="Search SIS course code">
          </label>
        `
    );

    const newSisCourseIdSearch = document.getElementById(
      "ski-sis-course-id-search"
    );
    if (newSisCourseIdSearch) {
      newSisCourseIdSearch.addEventListener("keyup", () =>
        filterCourseEnrollments()
      );
      newSisCourseIdSearch.addEventListener("blur", () =>
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

                // Check for filtering by SIS course code if filtering is still needed
                if (shouldShow) {
                  const sisCourseIdSearchInput = document.getElementById(
                    "ski-sis-course-id-search"
                  );
                  if (sisCourseIdSearchInput) {
                    const sisCourseIdSearchValue = new DOMParser()
                      .parseFromString(
                        sisCourseIdSearchInput.value,
                        "text/html"
                      )
                      .body.innerText?.toUpperCase();
                    if (
                      sisCourseIdSearchValue &&
                      sisCourseIdSearchValue.length > 0
                    ) {
                      const sisCourseId =
                        item
                          .querySelector("a span.ski-sis-course-id")
                          ?.innerText?.trim()
                          .toUpperCase() ?? "";
                      if (
                        !sisCourseId ||
                        !sisCourseId.includes(sisCourseIdSearchValue)
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

  function addCourseCodesToEnrollmentsList(
    coursesList,
    isCourseCodeEnabled,
    isSisCourseIdEnabled
  ) {
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
          const sisCourseId = courseNameLink.parentElement.querySelector(
            "span.ski-sis-course-id"
          );
          if (
            (isCourseCodeEnabled && !courseCode) ||
            (isSisCourseIdEnabled && !sisCourseId)
          ) {
            const canvasCourseCode = courseNameLink.href
              .match(/\/courses\/[0-9]+\//)[0]
              .replace("courses", "")
              .replaceAll("/", "");
            const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
            fetch(`${baseUrl}/api/v1/courses/${canvasCourseCode}`)
              .then((response) => response.json())
              .then((data) => {
                const courseCode = data?.course_code;
                const sisCourseId = data?.sis_course_id;
                const courseName = courseNameLink.querySelector("span.name");
                let courseCodes = "";
                if (isCourseCodeEnabled) {
                  courseCodes += `<span class="subtitle" style="word-break: break-word; font-style: italic;">Course Code: <span class="ski-course-code">${courseCode}</span></span>`;
                }
                if (isSisCourseIdEnabled) {
                  courseCodes += `<span class="subtitle" style="word-break: break-word; font-style: italic;">SIS Course ID: <span class="ski-sis-course-id">${sisCourseId}</span></span>`;
                }
                courseName.insertAdjacentHTML("afterend", courseCodes);
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
