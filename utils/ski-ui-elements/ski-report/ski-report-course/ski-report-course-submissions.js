class SkiReportCourseSubmissions extends SkiReport {
  constructor() {
    super("Submission Details");
    this.addAssignmentOptions();
  }

  createTable() {
    const table = new SkiTable(
      "submission-details",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Submission ID", true, true),
        new SkiTableHeadingConfig("User ID", true, true),
        new SkiTableHeadingConfig("Student Name"),
        new SkiTableHeadingConfig("Assignment ID", true, true),
        new SkiTableHeadingConfig("Assignment Name"),
        new SkiTableHeadingConfig("Attempt", true, true),
        new SkiTableHeadingConfig("Grade"),
        new SkiTableHeadingConfig("Raw Score"),
        new SkiTableHeadingConfig("Points Possible"),
        new SkiTableHeadingConfig("Submission Type"),
        new SkiTableHeadingConfig("Submitted At"),
        new SkiTableHeadingConfig("Graded At"),
        new SkiTableHeadingConfig("Excused", true, true),
        new SkiTableHeadingConfig("Missing", true, true),
        new SkiTableHeadingConfig("Workflow State"),
        new SkiTableHeadingConfig("Submission Comments"),
        new SkiTableHeadingConfig("Associated Rubric", true, true),
      ],
      []
    );

    return table;
  }

  addFormElements(table, formContainer) {
    // Assignment Selection
    const assignmentSelection = this.createAssignmentSelection();
    formContainer.appendChild(assignmentSelection);

    // Submission State Selection
    const submissionStateSelection = this.createSubmissionsStateFieldset();
    formContainer.appendChild(submissionStateSelection);

    // Adds Load All button
    super.addFormElements(table, formContainer);
  }

  createAssignmentSelection() {
    const assignmentSelectionFieldset = document.createElement("fieldset");
    assignmentSelectionFieldset.classList.add("ski-ui");

    const label = document.createElement("label");
    label.innerText = "Select assignment to get submissions from:";
    label.setAttribute("for", `submission-report-assignment-select`);
    assignmentSelectionFieldset.appendChild(label);

    const assignmentSelect = document.createElement("select");
    assignmentSelect.classList.add("ski-ui", "ski-assignment-select");
    assignmentSelect.id = "submission-report-assignment-select";

    const defaultAllOption = document.createElement("option");
    defaultAllOption.value = "";
    defaultAllOption.text = "All";
    defaultAllOption.selected = true;
    assignmentSelect.appendChild(defaultAllOption);

    assignmentSelectionFieldset.appendChild(assignmentSelect);

    return assignmentSelectionFieldset;
  }

  async addAssignmentOptions() {
    const assignmentSelect = this.getReportContainer().querySelector(
      "#submission-report-assignment-select"
    );
    if (!assignmentSelect) {
      return;
    }

    const courseId = SkiReport.contextDetails.get("courseId");
    if (!courseId) {
      throw "Course ID not set in SkiReport";
    }
    const assignments = await this.#getAssignments(courseId);

    const assignmentsGroup = document.createElement("optgroup");
    assignmentsGroup.label = "Assignments";
    const discussionsGroup = document.createElement("optgroup");
    discussionsGroup.label = "Discussions";
    const quizzesGroup = document.createElement("optgroup");
    quizzesGroup.label = "Quizzes";

    for (const assignment of assignments) {
      if (!assignment?.published) {
        continue;
      }
      const option = document.createElement("option");
      option.value = assignment.id;
      option.text = `${assignment.name} *(ID: ${assignment.id})`;
      if (assignment.hasOwnProperty("discussion_topic")) {
        discussionsGroup.appendChild(option);
      } else if (
        assignment.hasOwnProperty("quiz_id") ||
        assignment?.is_quiz_assignment
      ) {
        quizzesGroup.appendChild(option);
      } else {
        assignmentsGroup.appendChild(option);
      }
    }

    assignmentSelect.appendChild(assignmentsGroup);
    assignmentSelect.appendChild(discussionsGroup);
    assignmentSelect.appendChild(quizzesGroup);
  }

  createSubmissionsStateFieldset() {
    const submissionStateFieldset = document.createElement("fieldset");
    submissionStateFieldset.classList.add(
      "ski-ui",
      "ski-submission-state-fieldset"
    );
    const legend = document.createElement("legend");
    legend.innerText = "Submission States to Include:";
    submissionStateFieldset.appendChild(legend);

    const submissionStateOptions = [
      "submitted",
      "unsubmitted",
      "graded",
      "pending_review",
    ];
    for (const option of submissionStateOptions) {
      const optionCheckbox = document.createElement("input");
      optionCheckbox.type = "checkbox";
      optionCheckbox.checked = "true";

      optionCheckbox.value = option;
      optionCheckbox.name = "submission-state";
      optionCheckbox.id = `submission-report-submission-state-${option}`;

      const label = document.createElement("label");
      label.setAttribute("for", `submission-report-submission-state-${option}`);
      label.innerText = option;

      const optionContainer = document.createElement("div");
      optionContainer.classList.add("ski-checkbox-inline");
      optionContainer.appendChild(optionCheckbox);
      optionContainer.appendChild(label);

      submissionStateFieldset.appendChild(optionContainer);
    }

    return submissionStateFieldset;
  }

  async loadData(table, formContainer) {
    try {
      this.updateLoadingMessage(
        "info",
        "Getting selected submission states..."
      );
      const submissionStateCheckboxes = [
        ...formContainer.querySelectorAll(
          "input[name='submission-state']:checked"
        ),
      ];
      if (submissionStateCheckboxes.length == 0) {
        alert("At least one submission state must be checked");
        this.updateLoadingMessage("error", "No submission states selected");
        return;
      }

      const courseId = SkiReport.contextDetails.get("courseId");
      const context = SkiReport.contextDetails.get("reportContext");
      const sectionId = SkiReport.contextDetails.get("sectionId");
      const contextId = SkiReport.contextDetails.get("contextId");
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }

      const selectedAssignmentId = formContainer.querySelector(
        ".ski-assignment-select"
      )?.value;
      let assignments = [];
      if (selectedAssignmentId) {
        this.updateLoadingMessage("info", "Getting assignment details...");
        let assignment;
        if (SkiReport.cache.has("assignments")) {
          const cachedAssignments = await SkiReport.cache.get("assignments");
          const filteredAssignments = cachedAssignments.filter((assignment) => {
            return assignment.id == selectedAssignmentId;
          });
          if (filteredAssignments.length > 0) {
            assignment = filteredAssignments[0];
          }
        }
        if (!assignment) {
          const assignment = await SkiCanvasLmsApiCaller.getRequestAllPages(
            `/api/v1/courses/${courseId}/assignments/${selectedAssignmentId}`,
            { order_by: "due_at" }
          );
        }
        assignments.push(assignment);
      } else {
        this.updateLoadingMessage("info", "Getting details of assignments...");
        assignments = await this.#getAssignments(courseId);
      }

      this.updateLoadingMessage(
        "info",
        "Determining maximum number of criteria for any associated rubric(s)..."
      );
      const assignmentsDict = {};
      let maxRubricCriteria = 0;
      for (const assignment of assignments) {
        assignmentsDict[assignment.id] = assignment;
        if (assignment.hasOwnProperty("rubric")) {
          maxRubricCriteria = Math.max(
            maxRubricCriteria,
            assignment.rubric.length
          );
        }
      }

      this.#addRubricHeadings(table, maxRubricCriteria);

      this.updateLoadingMessage("info", "Getting enrolled students...");
      const studentsDict = {};
      const enrollments = await this.#getEnrollments(
        context,
        contextId,
        "active"
      );
      for (const enrollment of enrollments) {
        if (enrollment.type == "StudentEnrollment") {
          studentsDict[enrollment.user_id] = enrollment.user;
        }
      }

      let submissions = [];
      if (selectedAssignmentId) {
        for (const checkbox of submissionStateCheckboxes) {
          this.updateLoadingMessage(
            "info",
            `Getting ${checkbox.value} submissions of assignment...`
          );
          const currentSubmissions =
            await SkiCanvasLmsApiCaller.getRequestAllPages(
              `/api/v1/${context}/${contextId}/students/submissions`,
              {
                "student_ids[]": "all",
                "include[]": ["submission_comments", "rubric_assessment"],
                workflow_state: checkbox.value,
                "assignment_ids[]": selectedAssignmentId,
              }
            );
          submissions.push(...currentSubmissions);
        }
      } else {
        for (const checkbox of submissionStateCheckboxes) {
          this.updateLoadingMessage(
            "info",
            `Getting ${checkbox.value} submissions for all assignments...`
          );
          const currentSubmissions =
            await SkiCanvasLmsApiCaller.getRequestAllPages(
              `/api/v1/${context}/${contextId}/students/submissions`,
              {
                "student_ids[]": "all",
                "include[]": ["submission_comments", "rubric_assessment"],
                workflow_state: checkbox.value,
              }
            );
          submissions.push(...currentSubmissions);
        }
      }

      this.updateLoadingMessage("info", "Formatting data for table...");
      const submissionsData = this.extractData(
        submissions,
        assignmentsDict,
        studentsDict
      );

      this.updateLoadingMessage("info", "Setting table data...");
      table.setTableBody(submissionsData);

      this.updateLoadingMessage("success", "Finished loading data");
    } catch (error) {
      console.error(error);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(submissions, assignments, students) {
    const data = [];
    for (const submission of submissions) {
      let studentName = "Unknown";
      if (students.hasOwnProperty(submission.user_id)) {
        studentName = students[submission.user_id].sortable_name;
      }
      const assignment = assignments[submission.assignment_id];
      const assignmentName = assignment.name;
      const assignmentNameLink = document.createElement("a");
      assignmentNameLink.href = assignment.html_url;
      assignmentNameLink.target = "_blank";
      assignmentNameLink.innerText = assignmentName;
      const pointsPossible = assignment.points_possible;

      let submittedDate = submission.submitted_at;
      let submittedDateIso = "";
      if (!submittedDate) {
        submittedDate = "None";
      } else {
        submittedDateIso = new Date(submittedDate).toISOString();
        submittedDate = new Date(submittedDate).toLocaleString();
      }

      let gradedDate = submission.graded_at;
      let gradedDateIso = "";
      if (!gradedDate) {
        gradedDate = "None";
      } else {
        gradedDateIso = new Date(gradedDate).toISOString();
        gradedDate = new Date(gradedDate).toLocaleString();
      }

      let submissionComments = [];
      for (const comment of submission.submission_comments) {
        submissionComments.push(
          `${comment.comment} [Author: ${comment.author_name}]`
        );
      }
      submissionComments = submissionComments.join("; ");

      let rubricGrading = "No rubric associated";
      let hasRubricGrade = false;
      if (assignment.hasOwnProperty("use_rubric_for_grading")) {
        if (assignment.use_rubric_for_grading) {
          if (submission.hasOwnProperty("rubric_assessment")) {
            rubricGrading = "Used for grading";
            hasRubricGrade = true;
          } else {
            rubricGrading = "Awaiting grading with rubric";
          }
        } else {
          rubricGrading = "Not used for grading";
        }
      }

      const rowData = [
        new SkiTableDataConfig(submission.id, undefined, "number"),
        new SkiTableDataConfig(submission.user_id, undefined, "number"),
        new SkiTableDataConfig(studentName),
        new SkiTableDataConfig(submission.assignment_id, undefined, "number"),
        new SkiTableDataConfig(assignmentNameLink),
        new SkiTableDataConfig(submission.attempt, undefined, "number"),
        new SkiTableDataConfig(submission.grade, undefined, "number"),
        new SkiTableDataConfig(submission.score, undefined, "number"),
        new SkiTableDataConfig(pointsPossible, undefined, "number"),
        new SkiTableDataConfig(submission.submission_type),
        new SkiTableDataConfig(
          submittedDate,
          submittedDateIso,
          "dateISO",
          submittedDateIso
        ),
        new SkiTableDataConfig(
          gradedDate,
          gradedDateIso,
          "dateISO",
          gradedDateIso
        ),
        new SkiTableDataConfig(submission.excused),
        new SkiTableDataConfig(submission.missing),
        new SkiTableDataConfig(submission.workflow_state),
        new SkiTableDataConfig(submissionComments),
        new SkiTableDataConfig(rubricGrading),
      ];

      if (hasRubricGrade) {
        rowData.push(...this.#extractRubricData(assignment, submission));
      } else {
        rowData.push({ content: "N/A" });
      }

      data.push(rowData);
    }
    return data;
  }

  #addRubricHeadings(table, numOfCriteria) {
    const rubricHeadings = [
      new SkiTableHeadingConfig("Rubric ID", true, true),
      new SkiTableHeadingConfig("Rubric Title"),
      new SkiTableHeadingConfig("Rubric Points Possible", true, true),
    ];
    for (let i = 1; i <= numOfCriteria; i++) {
      rubricHeadings.push(
        new SkiTableHeadingConfig(`Criteria ID ${i}`, true, true)
      );
      rubricHeadings.push(
        new SkiTableHeadingConfig(`Outcome ID ${i}`, true, true)
      );
      rubricHeadings.push(
        new SkiTableHeadingConfig(`Criteria Description ${i}`, true, true)
      );
      rubricHeadings.push(new SkiTableHeadingConfig(`Score ${i}`, true, true));
      rubricHeadings.push(
        new SkiTableHeadingConfig(`Points Possible ${i}`, true, true)
      );
      rubricHeadings.push(
        new SkiTableHeadingConfig(`Comments ${i}`, true, true)
      );
    }

    table.appendColumnHeadings(rubricHeadings);
  }

  #extractRubricData(assignment, submission) {
    const rubricData = [];

    const rubric = assignment.rubric;
    const rubricDict = {};
    for (const criteria of rubric) {
      rubricDict[criteria["id"]] = criteria;
    }

    const rubricSettings = assignment.rubric_settings;
    rubricData.push(
      new SkiTableDataConfig(rubricSettings.id, undefined, "number")
    );
    rubricData.push(new SkiTableDataConfig(rubricSettings.title));
    rubricData.push(
      new SkiTableDataConfig(
        rubricSettings.points_possible,
        undefined,
        "number"
      )
    );

    const rubricAssessment = submission.rubric_assessment;
    for (const criteriaId in rubricAssessment) {
      const criteriaAssessment = rubricAssessment[criteriaId];
      const criteria = rubricDict[criteriaId];
      rubricData.push(new SkiTableDataConfig(criteriaId, undefined, "number"));
      rubricData.push(
        new SkiTableDataConfig(
          criteria?.outcome_id ?? "N/A",
          undefined,
          "number"
        )
      );
      rubricData.push(new SkiTableDataConfig(criteria.description));
      rubricData.push(
        new SkiTableDataConfig(criteriaAssessment.points, undefined, "number")
      );
      rubricData.push(
        new SkiTableDataConfig(criteria.points, undefined, "number")
      );
      rubricData.push({ content: criteriaAssessment.comments });
    }

    return rubricData;
  }

  #getAssignments(courseId) {
    return SkiReport.memoizeRequest("assignments", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/assignments`,
        { order_by: "due_at" }
      );
    });
  }

  #getEnrollments(context, contextId, state) {
    return SkiReport.memoizeRequest(`enrollments-${state}`, () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/${context}/${contextId}/enrollments`,
        {
          per_page: 100,
          "state[]": state,
        }
      );
    });
  }
}
