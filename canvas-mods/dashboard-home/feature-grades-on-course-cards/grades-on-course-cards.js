"use strict";

(() => {
  if (/^\/\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        dashboardShowCourseGrades: true,
      },
      async function (items) {
        if (items.dashboardShowCourseGrades) {
          const studentGrades = await getStudentGradesByCourse();
          SkiMonitorChanges.waitForDocumentReady(() => {
            addCourseGrades(studentGrades);
          })
        }
      }
    );
  }
  
  /*
    Gets the active and available courses for the current user where they are
    a student and include the total scores
  */
  async function getStudentCoursesOfSelf() {
    const url = `/api/v1/courses`;
    const params = {
      "include[]": "total_scores",
      "state[]": "available",
      enrollment_state: "active",
      enrollment_type: "student",
      per_page: 100,
    };

    return await SkiCanvasLmsApiCaller.getRequestAllPages(url, params);
  }

  /*
    Gets the courses of the user and returns an object with the current grade
    of the user in courses where they are an active Student.
  */
  async function getStudentGradesByCourse() {
    const userCourses = await getStudentCoursesOfSelf();
    const studentEnrollmentGrades = {};
    for (const course of userCourses) {
      const enrollments = course.enrollments;
      for (const enrollment of enrollments) {
        if (enrollment.role == "StudentEnrollment") {
          if (enrollment.hasOwnProperty("computed_current_grade")) {
            studentEnrollmentGrades[course.id] =
              enrollment.computed_current_grade;
          } else {
            studentEnrollmentGrades[course.id] = "LOCKED";
          }
          break;
        }
      }
    }

    return studentEnrollmentGrades;
  }

  /*
    Gets the course cards and adds the course grades to each one where the user is actively enrolled
    as a Student
  */
  function addCourseGrades(studentEnrollmentGrades) {
    const dashboardCards = [
      ...document.querySelectorAll(
        "div#DashboardCard_Container div.ic-DashboardCard"
      ),
    ];
    for (const card of dashboardCards) {
      const cardLink = card.querySelector("a.ic-DashboardCard__link");
      if (cardLink) {
        const cardCourseId = cardLink.href.split("/").pop();
        if (studentEnrollmentGrades.hasOwnProperty(cardCourseId)) {
          addCourseGrade(card, studentEnrollmentGrades[cardCourseId]);
        }
      }
    }
  }

  /*
    Adds the given current grade to the given dashboard card
  */
  function addCourseGrade(dashboardCard, currentGrade) {
    if (dashboardCard) {
      const dashboardCardHeader = dashboardCard.querySelector(
        "div.ic-DashboardCard__header_hero"
      );
      if (dashboardCardHeader) {
        const headerOpacity = dashboardCardHeader.style.opacity;
        const headerBackgroundColor = dashboardCardHeader.style.backgroundColor;
        if (headerOpacity != 1) {
          dashboardCardHeader.style.opacity = 1;
          dashboardCardHeader.style.backgroundColor = headerBackgroundColor
            .replace("rgb(", "rgba(")
            .replace(")", `, ${headerOpacity})`);
        }

        dashboardCardHeader.insertAdjacentHTML(
          "afterbegin",
          `
          <div style="position: absolute; top: 12px; left: 12px; height: 36px; padding: 0.5rem;">
            <span class="ski-dashboard-card-grade" style="position: relative; padding: 0.5rem; background-color: white; color: ${headerBackgroundColor}; border: 0; border-radius: 0.5rem;">
              ${
                currentGrade
                  ? currentGrade == "LOCKED"
                    ? "<i class='icon-Solid icon-lock'></i>"
                    : currentGrade
                  : "N/A"
              }
            </span>
          </div>
        `
        );
      }
    }
  }
})();
