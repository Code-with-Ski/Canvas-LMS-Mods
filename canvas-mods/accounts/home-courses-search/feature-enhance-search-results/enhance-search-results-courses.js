(() => {
  if (/^\/accounts\/[0-9]+\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        adminCoursesConcludedIcon: true,
        adminCoursesCourseCode: true,
        adminCoursesPeopleLink: true,
        adminCoursesSubaccountLink: true,
        adminCoursesGradesButton: true,
        adminCoursesBlueprintInputPreventFill: true,
        adminCoursesAdditionalSearchInputs: true,
      },
      async function (items) {
        if (
          items.adminCoursesConcludedIcon ||
          items.adminCoursesCourseCode ||
          items.adminCoursesPeopleLink ||
          items.adminCoursesSubaccountLink ||
          items.adminCoursesGradesButton
        ) {
          if (items.adminCoursesSubaccountLink) {
            const canManageAccountSettings = await hasPermission(
              "manage_account_settings"
            );
            watchForTable(
              items.adminCoursesConcludedIcon,
              items.adminCoursesCourseCode,
              items.adminCoursesPeopleLink,
              canManageAccountSettings,
              items.adminCoursesGradesButton
            );
          } else {
            watchForTable(
              items.adminCoursesConcludedIcon,
              items.adminCoursesCourseCode,
              items.adminCoursesPeopleLink,
              items.adminCoursesSubaccountLink,
              items.adminCoursesGradesButton
            );
          }
        }
      }
    );
  }

  function getCurrentCourses() {
    let courses = {};
    const url = new URL(
      `${window.location.protocol}//${window.location.hostname}/api/v1${
        window.location.pathname
      }/courses${
        window.location.search.length > 0 ? window.location.search : "?"
      }`
    );
    const searchParams = url.searchParams.keys();
    for (let param of searchParams) {
      if (url.searchParams.get(param) === "") {
        url.searchParams.delete(param);
      }
    }
    url.searchParams.set("include[]", "concluded");
    url.searchParams.set("per_page", 15);
    if (!url.searchParams.has("sort")) {
      url.searchParams.set("sort", "sis_course_id");
    }
    if (!url.searchParams.has("order")) {
      url.searchParams.set("order", "asc");
    }
    if (!url.searchParams.has("search_by")) {
      url.searchParams.set("search_by", "course");
    }
    url.searchParams.append("include[]", "ui_invoked");
    url.searchParams.append("teacher_limit", 25);
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        for (let course of data) {
          courses[`${course["id"]}`] = course;
        }
        return courses;
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
        return courses;
      });
  }

  function getCourse(courseId) {
    let course = {};
    const url = new URL(
      `${window.location.protocol}//${window.location.hostname}/api/v1${window.location.pathname}/courses/${courseId}`
    );
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
        return course;
      });
  }

  function getPermissions() {
    let userPermissions = {};
    const url = new URL(
      `${window.location.protocol}//${window.location.hostname}/api/v1/accounts/self/permissions`
    );
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

  async function hasPermission(permission) {
    const userPermissions = await getPermissions();
    return permission in userPermissions && userPermissions[permission];
  }

  async function watchForTable(
    addConcludedIndicator,
    addCourseCode,
    addPeopleLink,
    addSubaccountLink,
    addViewGradesButton
  ) {
    let currentUrl = window.location.href;
    let courses = await getCurrentCourses();
    const searchTable = document.querySelector("div#content > div > table");
    if (!searchTable) {
      const observer = new MutationObserver(() => {
        const loadedSearchTable = document.querySelector(
          "div#content > div > table"
        );
        if (loadedSearchTable) {
          observer.disconnect();
          const tableObserver = new MutationObserver(async (mutations) => {
            for (let mutationRecord of mutations) {
              let newNodes = mutationRecord.addedNodes;
              for (let newNode of newNodes) {
                if (newNode.nodeName == "TR") {
                  const courseNameLink = newNode.querySelector(
                    "td > a[href*='/courses/']"
                  );
                  if (courseNameLink) {
                    const canvasCourseCode = courseNameLink.href
                      .split("/")
                      .pop();
                    if (canvasCourseCode && !(canvasCourseCode in courses)) {
                      if (window.location.href != currentUrl) {
                        courses = await getCurrentCourses();
                        currentUrl = window.location.href;
                        if (!(canvasCourseCode in courses)) {
                          const currentCourse = await getCourse(
                            canvasCourseCode
                          );
                          courses[canvasCourseCode] = currentCourse;
                        }
                      } else {
                        const currentCourse = await getCourse(canvasCourseCode);
                        courses[canvasCourseCode] = currentCourse;
                      }
                    }
                    if (canvasCourseCode in courses) {
                      const course = courses[canvasCourseCode];
                      updateRow(
                        newNode,
                        course,
                        addConcludedIndicator,
                        addCourseCode,
                        addPeopleLink,
                        addSubaccountLink,
                        addViewGradesButton
                      );
                    }
                  }
                }
              }
            }
          });
          tableObserver.observe(loadedSearchTable, {
            childList: true,
            subtree: true,
          });
        }
      });
      observer.observe(document.body, { childList: true });
    } else {
      const tableRows = document.querySelectorAll(
        "div#content > div > table > tbody > tr"
      );
      for (let row of tableRows) {
        const courseNameLink = row.querySelector("td > a[href*='/courses/']");
        if (courseNameLink) {
          const canvasCourseCode = courseNameLink.href.split("/").pop();
          if (canvasCourseCode in courses) {
            const course = courses[canvasCourseCode];
            updateRow(
              row,
              course,
              addConcludedIndicator,
              addCourseCode,
              addPeopleLink,
              addSubaccountLink,
              addViewGradesButton
            );
          }
        }
      }

      const tableObserver = new MutationObserver(async (mutations) => {
        for (let mutationRecord of mutations) {
          let newNodes = mutationRecord.addedNodes;
          for (let newNode of newNodes) {
            if (newNode.nodeName == "TR") {
              const courseNameLink = newNode.querySelector(
                "td > a[href*='/courses/']"
              );
              if (courseNameLink) {
                const canvasCourseCode = courseNameLink.href.split("/").pop();
                if (canvasCourseCode && !(canvasCourseCode in courses)) {
                  if (window.location.href != currentUrl) {
                    courses = await getCurrentCourses();
                  } else {
                    const currentCourse = await getCourse(canvasCourseCode);
                    courses[canvasCourseCode] = currentCourse;
                  }
                }
                if (canvasCourseCode in courses) {
                  const course = courses[canvasCourseCode];
                  updateRow(
                    newNode,
                    course,
                    addConcludedIndicator,
                    addCourseCode,
                    addPeopleLink,
                    addSubaccountLink,
                    addViewGradesButton
                  );
                }
              }
            }
          }
        }
      });
      tableObserver.observe(searchTable, { childList: true, subtree: true });
    }
  }

  async function updateRow(
    row,
    course,
    addConcludedIndicator,
    addCourseCode,
    addPeopleLink,
    addSubaccountLink,
    addViewGradesButton
  ) {
    const courseNameLink = row.querySelector("td > a[href*='/courses/']");
    if (addConcludedIndicator) {
      if (course["concluded"]) {
        const concludedIcon = courseNameLink.querySelector(
          "i.ski-course-concluded"
        );
        if (!concludedIcon) {
          courseNameLink.insertAdjacentHTML(
            "afterbegin",
            `
            <i class="icon-line icon-lock ski-course-concluded" aria-hidden="true" title="This course is concluded"></i>
          `
          );
        }
      }
    }
    if (addCourseCode) {
      const courseCodeSpan = courseNameLink.parentElement.querySelector(
        "span.ski-course-code"
      );
      if (!courseCodeSpan) {
        const courseCode = course["course_code"];
        courseNameLink.insertAdjacentHTML(
          "afterend",
          `<br><span class="ski-course-code" style="font-style: italic;">${courseCode}</span>`
        );
      }
    }
    if (addPeopleLink) {
      const peopleLink = row.querySelector("td a.ski-course-people");
      if (!peopleLink) {
        const numOfStudentsTd = row.querySelector("td:nth-last-child(2)");
        numOfStudentsTd.style.textAlign = "center";
        if (numOfStudentsTd) {
          if (!numOfStudentsTd.querySelector("a.ski-course-people")) {
            numOfStudentsTd.innerHTML = `<a href='/courses/${course["id"]}/users' target='_blank' title='View People in course' class="ski-course-people"'>${numOfStudentsTd.innerText}</a>`;
          }
        }
        if (addViewGradesButton) {
          if (!numOfStudentsTd.querySelector("a.ski-course-view-grades")) {
            numOfStudentsTd.innerHTML += `
              <br><br>
              <a href='/courses/${course["id"]}/gradebook' target='_blank' title='View course gradebook' class='ski-course-view-grades Button' style="background: white; margin: 0px; padding: 0.4rem; border-radius: 0.25rem; border-width: 0px; width: auto; cursor: pointer;">
                <i class="icon-line icon-gradebook" aria-hidden="true"></i>
              </a>
            `;
          }
        }
      }
    }
    if (addSubaccountLink) {
      const subaccountLink = row.querySelector("td a.ski-course-subaccount");
      if (!subaccountLink) {
        const subaccountTd = row.querySelector("td:nth-last-child(3)");
        subaccountTd.style.textAlign = "center";
        if (subaccountTd) {
          subaccountTd.innerHTML = `<a href='/accounts/${course["account_id"]}?' target='_blank' title='Go to subaccount course search' class="ski-course-subaccount"'>${subaccountTd.innerText}</a>`;
        }
      }
    }
  }
})();
