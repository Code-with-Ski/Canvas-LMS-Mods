"use strict";

(() => {
  if (
    /^\/(course|account)s\/[0-9]+\/rubrics/.test(window.location.pathname) &&
    !/^\/(course|account)s\/[0-9]+\/rubrics\//.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        rubricsLoadDetails: true,
      },
      function (items) {
        if (items.rubricsLoadDetails) {
          SkiMonitorChanges.watchForElementById(
            "right-side",
            addLoadDetailsButton
          );
        }
      }
    );
  }

  function addLoadDetailsButton(rightSide) {
    const button = document.createElement("button");
    button.classList.add("Button", "button-sidebar-wide");
    button.title = "Load rubric details";
    button.innerHTML = `
      <i class='icon-line icon-refresh'></i> Load Rubric Details
    `;
    button.addEventListener("click", loadRubricDetails);

    rightSide.appendChild(button);
  }

  async function loadRubricDetails() {
    const rubricItems = [...document.querySelectorAll("#rubrics ul > li")];
    if (rubricItems) {
      const courseId = window.location.pathname.split("/")[2];
      for (const rubricItem of rubricItems) {
        const rubricLink = rubricItem.querySelector("a");
        const rubricId = rubricLink?.href?.split("/").pop();
        if (!rubricId) {
          continue;
        }

        const rubric = await getRubric(courseId, rubricId, {
          "include[]": "assignment_associations",
        });
        if (!rubric) {
          continue;
        }

        let messageContainer = rubricItem.querySelector(
          ".ski-rubric-additional-info"
        );
        if (!messageContainer) {
          messageContainer = document.createElement("div");
          messageContainer.classList.add("ski-rubric-additional-info");
          messageContainer.style.fontSize = "0.7rem";
          messageContainer.style.marginLeft = "20px";
          rubricItem.appendChild(messageContainer);
        }

        const rubricAssociations = rubric.associations;
        messageContainer.innerHTML = `
        <span class='text-info'>
          Context Type: ${rubric.context_type} (ID: ${rubric.context_id})
        </span><br>
        <span class='text-info'>
            ${
              rubricAssociations.length > 0 &&
              rubricAssociations.some((association) => {
                return association.association_id == courseId;
              })
                ? "Has assignment association(s) in this course"
                : rubricAssociations.length > 0
                ? "No assignment associations in this course. Has assignment association(s) in other course(s)."
                : "No assignment associations"
            }
          </span><br>
          <span class='text-info'>
            ${
              rubric.data.some((criteria) => {
                return !!criteria?.learning_outcome_id;
              })
                ? "Has outcome criteria"
                : "No outcome criteria"
            }
          </span>
        `;
      }
    }
  }

  async function getRubric(courseId, rubricId, params) {
    const endPointUrl = `/api/v1/courses/${courseId}/rubrics/${rubricId}`;
    const rubric = await SkiCanvasLmsApiCaller.getRequestAllPages(
      endPointUrl,
      params
    );
    return rubric;
  }
})();
