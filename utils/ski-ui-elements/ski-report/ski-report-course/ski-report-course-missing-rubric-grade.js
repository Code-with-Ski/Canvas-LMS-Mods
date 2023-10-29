class SkiReportCourseMissingRubricGrades extends SkiReport {
  constructor() {
    super("Missing Rubric Grade");
    this.addAssignmentOptions();
  }

  createTable() {
    const table = new SkiTable(
      "missing-rubric-grade-report",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Submission ID", true, true),
        new SkiTableHeadingConfig("User ID", true, true),
        new SkiTableHeadingConfig("Student Name"),
        new SkiTableHeadingConfig("Assignment ID", true, true),
        new SkiTableHeadingConfig("Assignment Name"),
        new SkiTableHeadingConfig("SpeedGrader Link", false),
        new SkiTableHeadingConfig("Attempt", true, true),
        new SkiTableHeadingConfig("Current Grade"),
        new SkiTableHeadingConfig("Current Score"),
        new SkiTableHeadingConfig("Points Possible", true, true),
        new SkiTableHeadingConfig("Omit from Final Grade", true, true),
        new SkiTableHeadingConfig("Use Rubric for Grading"),
        new SkiTableHeadingConfig("Submission Type", true, true),
        new SkiTableHeadingConfig("Submitted At", true, true),
        new SkiTableHeadingConfig("Excused"),
        new SkiTableHeadingConfig("Missing"),
        new SkiTableHeadingConfig("Submission Comments"),
      ],
      []
    );

    return table;
  }

  addFormElements(table, formContainer) {
    // Description
    const description = document.createElement("p");
    description.innerText =
      "This report provides a list of assignment submissions that are graded, but have a rubric associated that wasn't used for grading.";
    formContainer.appendChild(description);

    // Assignment Selection
    const assignmentSelection = this.createAssignmentSelection();
    formContainer.appendChild(assignmentSelection);

    // Adds Load All button
    super.addFormElements(table, formContainer);
  }

  createAssignmentSelection() {
    const assignmentSelectionFieldset = document.createElement("fieldset");
    assignmentSelectionFieldset.classList.add("ski-ui");

    const label = document.createElement("label");
    label.innerText = "Select assignment to check for submissions:";
    label.setAttribute("for", `missing-rubric-grade-report-assignment-select`);
    assignmentSelectionFieldset.appendChild(label);

    const assignmentSelect = document.createElement("select");
    assignmentSelect.classList.add("ski-ui", "ski-assignment-select");
    assignmentSelect.id = "missing-rubric-grade-report-assignment-select";

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
      "#missing-rubric-grade-report-assignment-select"
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
      if (!assignment?.rubric_settings) {
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

  async loadData(table, formContainer) {
    try {
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
      const assignmentsDict = {};
      for (const assignment of assignments) {
        if (!assignment?.rubric_settings) {
          continue;
        }
        assignmentsDict[assignment.id] = assignment;
      }

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

      const submissions = [];
      if (selectedAssignmentId) {
        this.updateLoadingMessage(
          "info",
          `Getting graded submissions of assignment...`
        );
        const currentSubmissions =
          await SkiCanvasLmsApiCaller.getRequestAllPages(
            `/api/v1/${context}/${contextId}/students/submissions`,
            {
              "student_ids[]": "all",
              "include[]": ["submission_comments", "rubric_assessment"],
              workflow_state: "graded",
              "assignment_ids[]": selectedAssignmentId,
            }
          );
        submissions.push(...currentSubmissions);
      } else {
        const assignmentIds = Object.keys(assignmentsDict);
        const numOfAssignments = assignmentIds.length;
        for (let i = 0; i < numOfAssignments; i++) {
          const assignmentId = assignmentIds[i];
          this.updateLoadingMessage(
            "info",
            `Getting graded submissions of assignment (${
              i + 1
            } of ${numOfAssignments})...`
          );
          const currentSubmissions =
            await SkiCanvasLmsApiCaller.getRequestAllPages(
              `/api/v1/${context}/${contextId}/students/submissions`,
              {
                "student_ids[]": "all",
                "include[]": ["submission_comments", "rubric_assessment"],
                workflow_state: "graded",
                "assignment_ids[]": assignmentId,
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
    const courseId = SkiReport.contextDetails.get("courseId");
    if (!courseId) {
      throw "Course ID not set in SkiReport";
    }

    const data = [];
    for (const submission of submissions) {
      if (submission?.rubric_assessment) {
        continue;
      }
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
      const omitFromFinalGrade = assignment.omit_from_final_grade;

      const speedGraderLink = document.createElement("a");
      speedGraderLink.href = `/courses/${courseId}/gradebook/speed_grader?assignment_id=${submission.assignment_id}&student_id=${submission.user_id}`;
      speedGraderLink.title = "Grade Submission";
      speedGraderLink.target = "_blank";
      speedGraderLink.innerText = "SpeedGrader";

      let submittedDate = submission.submitted_at;
      let submittedDateIso = "";
      if (!submittedDate) {
        submittedDate = "None";
      } else {
        submittedDateIso = new Date(submittedDate).toISOString();
        submittedDate = new Date(submittedDate).toLocaleString();
      }

      let submissionComments = [];
      for (const comment of submission.submission_comments) {
        submissionComments.push(
          `${comment.comment} [Author: ${comment.author_name}]`
        );
      }
      submissionComments = submissionComments.join("; ");

      const rowData = [
        new SkiTableDataConfig(submission.id, undefined, "number"),
        new SkiTableDataConfig(submission.user_id, undefined, "number"),
        new SkiTableDataConfig(studentName),
        new SkiTableDataConfig(submission.assignment_id, undefined, "number"),
        new SkiTableDataConfig(assignmentNameLink),
        new SkiTableDataConfig(
          speedGraderLink,
          undefined,
          undefined,
          speedGraderLink.href
        ),
        new SkiTableDataConfig(submission.attempt, undefined, "number"),
        new SkiTableDataConfig(submission.grade, undefined, "number"),
        new SkiTableDataConfig(submission.score, undefined, "number"),
        new SkiTableDataConfig(pointsPossible, undefined, "number"),
        new SkiTableDataConfig(omitFromFinalGrade),
        new SkiTableDataConfig(assignment.use_rubric_for_grading),
        new SkiTableDataConfig(submission.submission_type),
        new SkiTableDataConfig(
          submittedDate,
          submittedDateIso,
          "dateISO",
          submittedDateIso
        ),
        new SkiTableDataConfig(submission.excused),
        new SkiTableDataConfig(submission.missing),
        new SkiTableDataConfig(submissionComments),
      ];

      data.push(rowData);
    }
    return data;
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
