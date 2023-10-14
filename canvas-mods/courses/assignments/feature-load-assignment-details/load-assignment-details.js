"use strict";

(() => {
  if (
    /^\/courses\/[0-9]+\/assignments/.test(window.location.pathname) &&
    !/^\/courses\/[0-9]+\/assignments\//.test(window.location.pathname)
  ) {
    chrome.storage.sync.get(
      {
        courseAssignmentsLoadDetails: true,
      },
      function (items) {
        if (items.courseAssignmentsLoadDetails) {
          SkiMonitorChanges.watchForElementByQuery(
            "#settingsMountPoint ul.ui-menu",
            addLoadDetailsItem
          );
        }
      }
    );
  }

  function addLoadDetailsItem(menu) {
    const listItem = document.createElement("li");
    listItem.setAttribute("role", "presentation");
    listItem.classList.add("ui-menu-item");

    const link = document.createElement("a");
    link.href = "#";
    link.id = "ski-load-details";
    link.classList.add("ui-corner-all");
    link.setAttribute("role", "menuitem");
    link.title = "Load assignment details";
    link.innerHTML = `
      <i class="icon-blank"></i> Load assignment details
    `;
    link.addEventListener("click", async () => {
      menu.removeChild(listItem);
      await loadAssignmentDetails();
      menu.insertAdjacentElement("beforeend", listItem);
    });

    listItem.appendChild(link);

    menu.insertAdjacentElement("beforeend", listItem);
  }

  async function loadAssignmentDetails() {
    const assignmentRows = [
      ...document.querySelectorAll(".assignment-list .ig-row"),
    ];
    if (assignmentRows) {
      const assignments = await getAssignments();
      const assignmentsDict = {};
      for (const assignment of assignments) {
        assignmentsDict[assignment.id] = assignment;
      }

      const externalTools = await getExternalTools();
      const externalToolsDict = {};
      for (const tool of externalTools) {
        externalToolsDict[tool.id] = tool;
      }

      for (const row of assignmentRows) {
        const rowAssignmentId = row.dataset.itemId;
        if (!rowAssignmentId) {
          continue;
        }

        const assignment = assignmentsDict[rowAssignmentId];
        if (!assignment) {
          continue;
        }

        const rowInfo = row.querySelector(".ig-info");

        const submissionTypes = assignment.submission_types;
        const submissionTypesFormatted = [
          ...submissionTypes.map((type) => {
            return type.replaceAll("_", " ");
          }),
        ];
        let submissionTypesMessageContainer = row.querySelector(
          ".ski-submission-types-info"
        );
        if (!submissionTypesMessageContainer) {
          submissionTypesMessageContainer = document.createElement("div");
          submissionTypesMessageContainer.classList.add(
            "ski-submission-types-info"
          );
          submissionTypesMessageContainer.style.fontSize = "0.75rem";
        }

        let submissionTypesInfo = submissionTypesFormatted.join("; ");
        if (submissionTypesInfo == "external tool") {
          if (assignment.is_quiz_assignment) {
            submissionTypesInfo = "New Quiz";
          } else {
            const toolId = assignment.external_tool_tag_attributes?.content_id;
            if (toolId) {
              const toolName = externalToolsDict[toolId]?.name;
              if (toolName) {
                submissionTypesInfo += ` (${toolName})`;
              }
            }
          }
        }
        submissionTypesMessageContainer.innerHTML = `
          <span class="text-info">Submission Types: ${submissionTypesInfo}</span>
        `;
        rowInfo.appendChild(submissionTypesMessageContainer);

        const isOmitted = assignment.omit_from_final_grade;
        let affectsGradeMessageContainer = row.querySelector(
          ".ski-affects-grades-info"
        );
        if (!affectsGradeMessageContainer) {
          affectsGradeMessageContainer = document.createElement("div");
          affectsGradeMessageContainer.classList.add("ski-affects-grades-info");
          affectsGradeMessageContainer.style.fontSize = "0.75rem";
        }

        if (isOmitted) {
          affectsGradeMessageContainer.innerHTML = `
            <span class="text-warning"><i class="icon-line icon-warning" style="font-size: 0.75rem;"></i> Doesn't affect final grade</span>
          `;
        } else {
          affectsGradeMessageContainer.innerHTML = `
            <span class="text-info">Does affect final grade</span>
          `;
        }
        rowInfo.appendChild(affectsGradeMessageContainer);

        const rubric = assignment.rubric;
        const useRubricForGrading = assignment.use_rubric_for_grading;
        const rubricSettings = assignment.rubric_settings;
        const hasOutcomeCriteria = rubric?.some((criteria) => {
          return !!criteria.outcome_id;
        });

        let rubricMessageContainer = row.querySelector(".ski-rubric-info");
        if (!rubricMessageContainer) {
          rubricMessageContainer = document.createElement("div");
          rubricMessageContainer.classList.add("ski-rubric-info");
          rubricMessageContainer.style.fontSize = "0.75rem";
        }

        if (rubric) {
          const courseId = window.location.pathname.split("/")[2];
          if (useRubricForGrading) {
            rubricMessageContainer.innerHTML = `
              <span class="text-info">
                <a target="_blank" href="/courses/${courseId}/rubrics/${
              rubricSettings.id
            }" title="View rubric">${rubricSettings.title}</a> | 
                Used for grading | 
                ${
                  hasOutcomeCriteria
                    ? "Has outcome criteria"
                    : "No outcome criteria"
                }
              </span>
            `;
          } else {
            rubricMessageContainer.innerHTML = `
              <span class="text-info">
                <a target="_blank" href="/courses/${courseId}/rubrics/${
              rubricSettings.id
            }" title="View rubric">${rubricSettings.title}</a> | 
                <span class="text-warning"><i class="icon-line icon-warning" style="font-size: 0.75rem;"></i> Not used for grading</span> | 
                ${
                  hasOutcomeCriteria
                    ? "Has outcome criteria"
                    : "No outcome criteria"
                }
              </span>
            `;
          }
        } else {
          rubricMessageContainer.innerHTML = `
            <span class="text-info">No associated rubric</span>
          `;
        }
        rowInfo.appendChild(rubricMessageContainer);
      }
    }
  }

  async function getAssignments() {
    const courseId = window.location.pathname.split("/")[2];
    const endPointUrl = `/api/v1/courses/${courseId}/assignments`;
    const assignments = await SkiCanvasLmsApiCaller.getRequestAllPages(
      endPointUrl,
      { per_page: 50 }
    );
    return assignments;
  }

  async function getExternalTools() {
    const courseId = window.location.pathname.split("/")[2];
    const endPointUrl = `/api/v1/courses/${courseId}/external_tools`;
    const tools = await SkiCanvasLmsApiCaller.getRequestAllPages(endPointUrl, {
      include_parents: true,
      per_page: 50,
    });
    return tools;
  }
})();
