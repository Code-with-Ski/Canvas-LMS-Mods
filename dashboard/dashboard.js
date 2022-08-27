(() => {
  if (/^\/\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        dashboardAddAllCoursesButton: true,
        dashboardShowCourseGrades: true,
      },
      function (items) {
        if (items.dashboardAddAllCoursesButton) {
          addAllCoursesButton();
        }

        if (items.dashboardShowCourseGrades) {
          showCourseGrades();
        }
      }
    );
  }

  /*
    Adds a button that links to the All Courses page to the dashboard in the dashboard header area
  */
  function addAllCoursesButton() {
    const dashboardHeader = document.getElementById(
      "dashboard_header_container"
    );
    if (dashboardHeader) {
      const dashboardActionsDiv = document.querySelector(
        "#dashboard_header_container div.ic-Dashboard-header__actions"
      );
      const dashboardAllCoursesButton = document.getElementById(
        "ski-all-courses-btn"
      );
      if (dashboardActionsDiv && !dashboardAllCoursesButton) {
        dashboardActionsDiv.insertAdjacentHTML(
          "beforebegin",
          "<a href='/courses' class='Button' style='margin: 0px 1.5rem 0px 0px; border-radius: 0.25rem; cursor: pointer;'>See all courses</a>"
        );
      }
    }
  }

  /*
    Adds a course grade overlay to each course tile, similar to the mobile app
  */
  async function showCourseGrades() {
    const userCourses = await getCoursesOfUser("self");
    const studentEnrollmentGrades = {};
    for (let course of userCourses) {
      const enrollments = course.enrollments;
      for (let enrollment of enrollments) {
        if (enrollment.role == "StudentEnrollment") {
          studentEnrollmentGrades[course.id] = enrollment.computed_current_grade;
        }
      }
    }
    
    if (document.readyState == "complete"){
      const dashboardCards = [...document.querySelectorAll("div#DashboardCard_Container div.ic-DashboardCard")];
        for (let card of dashboardCards) {
          const cardLink = card.querySelector("a.ic-DashboardCard__link");
          if (cardLink) {
            const cardCourseId = cardLink.href.split("/").pop();
            if (studentEnrollmentGrades.hasOwnProperty(cardCourseId)) {
              addCourseGrade(card, studentEnrollmentGrades[cardCourseId]);
            }
          }
        }
    } else {
      window.addEventListener("load", () => {
        const dashboardCards = [...document.querySelectorAll("div#DashboardCard_Container div.ic-DashboardCard")];
        for (let card of dashboardCards) {
          const cardLink = card.querySelector("a.ic-DashboardCard__link");
          if (cardLink) {
            const cardCourseId = cardLink.href.split("/").pop();
            if (studentEnrollmentGrades.hasOwnProperty(cardCourseId)) {
              addCourseGrade(card, studentEnrollmentGrades[cardCourseId]);
            }
          }
        }
      });
    }   
  }

  /*
    Adds the given current grade to the given dashboard card
  */
  function addCourseGrade(dashboardCard, currentGrade) {
    if (dashboardCard) {
      const dashboardCardHeader = dashboardCard.querySelector("div.ic-DashboardCard__header_hero");
      if (dashboardCardHeader) {
        const headerOpacity = dashboardCardHeader.style.opacity;
        const headerBackgroundColor = dashboardCardHeader.style.backgroundColor;
        if (headerOpacity != 1) {
          dashboardCardHeader.style.opacity = 1;
          dashboardCardHeader.style.backgroundColor = headerBackgroundColor.replace("rgb(", "rgba(").replace(")", `, ${headerOpacity})`);
        }

        dashboardCardHeader.insertAdjacentHTML("afterbegin", `
          <div style="position: absolute; top: 12px; left: 12px; height: 36px; padding: 0.5rem;">
            <span class="ski-dashboard-card-grade" style="position: relative; padding: 0.5rem; background-color: white; color: ${headerBackgroundColor}; border: 0; border-radius: 0.5rem;">
              ${currentGrade ? currentGrade : "N/A"}
            </span>
          </div>
        `);
      }
    }
  }

  /*
    Gets the active and availble courses for the current user and include the 
    total scores
  */
  async function getCoursesOfUser(userId) {
    let courses = [];
    const url = `/api/v1/users/${userId}/courses?include[]=total_scores&state[]=available&enrollment_state=active&per_page=100`;

    // TODO Handle pagination
    const fetches = [];
    fetches.push(
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          courses = data;
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        })
    );

    await Promise.all(fetches);

    return courses;
  }
})();
