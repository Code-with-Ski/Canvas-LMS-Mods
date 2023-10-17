"use strict";

(() => {
  if (
    /^\/courses\/[0-9]+\/discussion_topics\/[0-9]+$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        courseDiscussionExportGrades: true,
      },
      function (items) {
        if (items.courseDiscussionExportGrades) {
          SkiMonitorChanges.watchForElementByQuery(
            ".admin-links ul.ui-menu",
            addExportGradesButton
          );
        }
      }
    );
  }

  async function addExportGradesButton(menu) {
    const splitPathname = document.location.pathname.split("/");
    const courseId = splitPathname[2];
    const discussionId = splitPathname[4].split("?")[0];
    const discussion = await getDiscussion(courseId, discussionId);
    const assignmentId = discussion?.assignment_id;

    if (assignmentId) {
      const exportGrades = createExportGradesButton(courseId, assignmentId);
      const item1 = document.createElement("li");
      item1.classList.add("ui-menu-item");
      item1.setAttribute("role", "presentation");
      item1.appendChild(exportGrades);
      menu.appendChild(item1);

      const rubricLink = menu.querySelector(".rubric_dialog_trigger");
      const rubricLinkText = rubricLink.innerText.trim();
      const hasRubric = rubricLinkText != "Add Rubric";
      if (hasRubric) {
        const exportGradesByCriteria = createExportGradesByCriteriaButton(
          courseId,
          assignmentId
        );
        const item2 = document.createElement("li");
        item2.classList.add("ui-menu-item");
        item2.setAttribute("role", "presentation");
        item2.appendChild(exportGradesByCriteria);
        menu.appendChild(item2);
      }
    }
  }

  function createExportGradesButton(courseId, assignmentId) {
    const button = document.createElement("a");
    button.href = "#";
    button.innerText = "Export Grades";
    button.classList.add("ui-corner-all");
    button.setAttribute("role", "menuitem");

    button.addEventListener("click", async () => {
      button.disabled = true;
      const params = {
        per_page: 100,
        "include[]": [
          "submission_comments",
          "rubric_assessment",
          "assignment",
          "course",
          "user",
          "read_status",
        ],
      };
      const submissions = await getSubmissions(courseId, assignmentId, params);
      const [exportData, maxNumOfCriteria] = extractDataForExport(submissions);
      downloadDataAsCSV(exportData, maxNumOfCriteria);
      button.disabled = false;
    });

    return button;
  }

  function createExportGradesByCriteriaButton(courseId, assignmentId) {
    const button = document.createElement("a");
    button.href = "#";
    button.innerText = "Export Grades by Criteria";
    button.classList.add("ui-corner-all");
    button.setAttribute("role", "menuitem");

    button.addEventListener("click", async () => {
      button.disabled = true;
      const params = {
        per_page: 100,
        "include[]": [
          "submission_comments",
          "rubric_assessment",
          "assignment",
          "course",
          "user",
          "read_status",
        ],
      };
      const submissions = await getSubmissions(courseId, assignmentId, params);
      const exportData = extractDataForExportByCriteria(submissions);
      downloadDataAsCSV(exportData, 1, true);
      button.disabled = false;
    });

    return button;
  }

  function extractDataForExport(submissions) {
    const data = [];
    let maxNumOfCriteria = 0;
    for (const submission of submissions) {
      const course = submission.course;
      const assignment = submission.assignment;
      const user = submission.user;
      const rowData = [
        user.id,
        user.sortable_name,
        user.short_name,
        course.id,
        course.name,
        course.course_code,
        course.sis_course_id,
        assignment.id,
        assignment.name,
        assignment.points_possible,
        submission.id,
        submission.workflow_state,
        submission.submitted_at,
        submission.graded_at,
        submission.submission_type,
        submission.comments
          ? [
              ...submission.comments.map((comment) => {
                return `${comment.comment} [Author: ${comment?.author?.display_name}]`;
              }),
            ].join("; ")
          : "",
        submission.grade,
        submission.score,
      ];

      const rubric = submission.assignment.rubric;
      if (!rubric) {
        data.push(rowData);
        continue;
      }

      maxNumOfCriteria = Math.max(maxNumOfCriteria, rubric.length);

      const rubricDict = {};
      for (const criteria of rubric) {
        rubricDict[criteria.id] = criteria;
      }

      const rubricSettings = submission.assignment.rubric_settings;
      rowData.push(rubricSettings.id);
      rowData.push(rubricSettings.title);
      rowData.push(rubricSettings.points_possible);

      const rubricAssessment = submission.rubric_assessment;
      const hasRubricAssessment = !!rubricAssessment;
      rowData.push(hasRubricAssessment);
      if (!hasRubricAssessment) {
        data.push(rowData);
        continue;
      }

      for (const criteriaId of Object.keys(rubricAssessment)) {
        const criteriaRating = rubricAssessment[criteriaId];
        const criteriaDetails = rubricDict[criteriaId];
        rowData.push(criteriaId);
        rowData.push(
          criteriaDetails.outcome_id || criteriaDetails.learning_outcome_id
        );
        rowData.push(criteriaDetails.description);
        rowData.push(criteriaDetails.long_description);
        rowData.push(criteriaDetails.points);
        rowData.push(criteriaRating.points);
        rowData.push(criteriaRating.comments);
      }

      data.push(rowData);
    }

    return [data, maxNumOfCriteria];
  }

  function extractDataForExportByCriteria(submissions) {
    const data = [];
    let maxNumOfCriteria = 0;
    for (const submission of submissions) {
      const course = submission.course;
      const assignment = submission.assignment;
      const user = submission.user;
      const rowData = [
        user.id,
        user.sortable_name,
        user.short_name,
        course.id,
        course.name,
        course.course_code,
        course.sis_course_id,
        assignment.id,
        assignment.name,
        assignment.points_possible,
        submission.id,
        submission.workflow_state,
        submission.submitted_at,
        submission.graded_at,
        submission.submission_type,
        submission.comments
          ? [
              ...submission.comments.map((comment) => {
                return `${comment.comment} [Author: ${comment?.author?.display_name}]`;
              }),
            ].join("; ")
          : "",
        submission.grade,
        submission.score,
      ];

      const rubric = submission.assignment.rubric;
      if (!rubric) {
        data.push(rowData);
        continue;
      }

      maxNumOfCriteria = Math.max(maxNumOfCriteria, rubric.length);

      const rubricDict = {};
      for (const criteria of rubric) {
        rubricDict[criteria.id] = criteria;
      }

      const rubricSettings = submission.assignment.rubric_settings;
      rowData.push(rubricSettings.id);
      rowData.push(rubricSettings.title);
      rowData.push(rubricSettings.points_possible);

      const rubricAssessment = submission.rubric_assessment;
      const hasRubricAssessment = !!rubricAssessment;
      rowData.push(hasRubricAssessment);
      if (!hasRubricAssessment) {
        data.push(rowData);
        continue;
      }

      for (const criteriaId of Object.keys(rubricAssessment)) {
        const rowDataCopy = [...rowData];
        const criteriaRating = rubricAssessment[criteriaId];
        const criteriaDetails = rubricDict[criteriaId];
        rowDataCopy.push(criteriaId);
        rowDataCopy.push(
          criteriaDetails.outcome_id || criteriaDetails.learning_outcome_id
        );
        rowDataCopy.push(criteriaDetails.description);
        rowDataCopy.push(criteriaDetails.long_description);
        rowDataCopy.push(criteriaDetails.points);
        rowDataCopy.push(criteriaRating.points);
        rowDataCopy.push(criteriaRating.comments);
        data.push(rowDataCopy);
      }
    }

    return data;
  }

  function cleanData(data) {
    if (typeof data !== "string") {
      return data;
    }
    // Remove multiple spaces and new line characters to avoid breaking CSV
    data = data.replace(/(\r\n|\n|\r)/gm, "").replace(/(\s\s)/gm, " ");
    // Escape double-quote with double-double-quote
    data = data.replace(/"/g, '""');
    data = data.trim();
    return data;
  }

  function downloadDataAsCSV(data, maxNumOfCriteria, isByCriteria = false) {
    // Construct csv
    const csv = [];
    const headerRow = [
      "user_id",
      "user_sortable_name",
      "user_display_name",
      "canvas_course_id",
      "course_name",
      "course_code",
      "course_sis_id",
      "assignment_id",
      "assignment_name",
      "points_possible",
      "submission_id",
      "workflow_state",
      "submitted_at",
      "graded_at",
      "submission_type",
      "submission_comments",
      "grade",
      "score",
      "rubric_id",
      "rubric_title",
      "rubric_points_possible",
      "has_rubric_assessment",
    ];
    if (isByCriteria) {
      headerRow.push(`criteria_id`);
      headerRow.push(`outcome_id`);
      headerRow.push(`description`);
      headerRow.push(`long_desc`);
      headerRow.push(`points_possible`);
      headerRow.push(`score`);
      headerRow.push(`comment`);
    } else {
      for (let i = 1; i <= maxNumOfCriteria; i++) {
        headerRow.push(`criteria_id_${i}`);
        headerRow.push(`outcome_id_${i}`);
        headerRow.push(`description_${i}`);
        headerRow.push(`long_desc_${i}`);
        headerRow.push(`points_possible_${i}`);
        headerRow.push(`score_${i}`);
        headerRow.push(`comment_${i}`);
      }
    }
    csv.push(headerRow.join(","));
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      for (let j = 0; j < row.length; j++) {
        if (typeof row[j] === "string") {
          row[j] = `"${cleanData(row[j])}"`;
        }
      }
      csv.push(row.join(","));
    }
    const csvString = csv.join("\n");

    // Download it
    const filename = `export_grades_${
      isByCriteria ? "by_criteria_" : ""
    }${new Date().toLocaleString()}.csv`;
    const link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");
    link.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvString)
    );
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function getDiscussion(courseId, discussionId, params = {}) {
    const endPointUrl = `/api/v1/courses/${courseId}/discussion_topics/${discussionId}`;
    const discussion = await SkiCanvasLmsApiCaller.getRequestAllPages(
      endPointUrl,
      params
    );
    return discussion;
  }

  async function getSubmissions(courseId, assignmentId, params = {}) {
    const endPointUrl = `/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`;
    const submissions = await SkiCanvasLmsApiCaller.getRequestAllPages(
      endPointUrl,
      params
    );
    return submissions;
  }
})();
