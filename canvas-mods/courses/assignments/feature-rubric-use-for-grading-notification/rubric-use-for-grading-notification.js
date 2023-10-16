"use strict";

(() => {
  if (
    /^\/courses\/[0-9]+\/assignments\/[0-9]+$/.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        courseAssignmentRubricUsedForGradingCheck: true,
      },
      function (items) {
        if (items.courseAssignmentRubricUsedForGradingCheck) {
          watchForRubricsContainer();
        }
      }
    );
  }

  function watchForRubricsContainer() {
    SkiMonitorChanges.watchForElementById(
      "rubrics",
      addUsedForGradingIndicator
    );
  }

  async function addUsedForGradingIndicator(rubricsContainer) {
    const rubricContainers = [
      ...rubricsContainer.querySelectorAll(
        ".rubric_container:not([style*='display: none'])"
      ),
    ];
    if (rubricContainers.length == 0) {
      return;
    }

    const rubricContainer = rubricContainers[0];
    console.log(rubricContainer);
    if (!rubricContainer || rubricContainer?.style?.display == "none") {
      return;
    }

    const rubricTitleSpan = rubricContainer.querySelector(
      ".rubric_title .displaying .title"
    );
    if (rubricTitleSpan) {
      const assignment = await getCurrentAssignment();

      if (assignment) {
        const useForGrading = assignment?.use_rubric_for_grading;
        if (useForGrading) {
          rubricTitleSpan.parentElement.insertAdjacentHTML(
            "afterend",
            `<div class="ski-rubric-grading-notification" style="font-size: 1rem; font-weight: normal;">
              <span class="text-success"><i class="icon-line icon-check-plus"></i> Used for grading</span>
            </div>`
          );
        } else if (useForGrading === false) {
          rubricTitleSpan.parentElement.insertAdjacentHTML(
            "afterend",
            `<div class="ski-rubric-grading-notification" style="font-size: 1rem; font-weight: normal;">
              <span class="text-warning"><i class="icon-line icon-warning"></i> Not used for grading</span>
            </div>`
          );
        }

        SkiMonitorChanges.watchForAttributeChangeOfElement(
          rubricContainer,
          () => {
            const exisitingNotifications = [
              ...document.querySelectorAll(".ski-rubric-grading-notification"),
            ];
            for (const exisitingNotification of exisitingNotifications) {
              exisitingNotification.innerHTML = `
                <span class="text-info"><i class="icon-line icon-info"></i> Refresh page to update indicator</span>
              `;
            }
          },
          () => {
            return true;
          }
        );
      }
    }
  }

  async function getCurrentAssignment() {
    const endPointUrl = `/api/v1${window.location.pathname}`;
    const assignment = await SkiCanvasLmsApiCaller.getRequestAllPages(
      endPointUrl,
      {}
    );
    return assignment;
  }
})();
