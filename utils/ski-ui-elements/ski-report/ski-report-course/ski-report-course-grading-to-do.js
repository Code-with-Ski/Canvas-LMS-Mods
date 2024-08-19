class SkiReportCourseGradingToDo extends SkiReport {
  constructor() {
    super("Grading To Do Report");
    this.addAssignmentOptions();
  }

  createTable() {
    const table = new SkiTable(
      "grading-to-do-report",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Submission ID", true, true),
        new SkiTableHeadingConfig("User ID", true, true),
        new SkiTableHeadingConfig("Student Name"),
        new SkiTableHeadingConfig("Assignment ID", true, true),
        new SkiTableHeadingConfig("Assignment Name"),
        new SkiTableHeadingConfig("SpeedGrader Link", false),
        new SkiTableHeadingConfig("Attempt", true, true),
        new SkiTableHeadingConfig("Current Grade", true, true),
        new SkiTableHeadingConfig("Current Score", true, true),
        new SkiTableHeadingConfig("Points Possible", true, true),
        new SkiTableHeadingConfig("Omit from Final Grade", true, true),
        new SkiTableHeadingConfig("Submission Type", true, true),
        new SkiTableHeadingConfig("Submitted At"),
        new SkiTableHeadingConfig("Days Since Submission"),
        new SkiTableHeadingConfig("Due Date"),
        new SkiTableHeadingConfig("Days Since Due Date"),
        new SkiTableHeadingConfig("Min Days Since"),
        new SkiTableHeadingConfig("Excused"),
        new SkiTableHeadingConfig("Missing", true, true),
        new SkiTableHeadingConfig("Workflow State", true, true),
        new SkiTableHeadingConfig("Submission Comments"),
      ],
      []
    );

    return table;
  }

  addFormElements(table, formContainer) {
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
    label.innerText =
      "Select assignment to check for submissions that need grading:";
    label.setAttribute("for", `grading-to-do-report-assignment-select`);
    assignmentSelectionFieldset.appendChild(label);

    const assignmentSelect = document.createElement("select");
    assignmentSelect.classList.add("ski-ui", "ski-assignment-select");
    assignmentSelect.id = "grading-to-do-report-assignment-select";

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
      "#grading-to-do-report-assignment-select"
    );
    const courseId = SkiReport.contextDetails.get("courseId");
    if (!courseId) {
      console.error("Course ID not set in SkiReport");
      return;
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

  async loadData(table, formContainer) {
    this.updateLoadingMessage("clear");
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
        this.updateLoadingMessage(
          "info",
          `Getting assignment details [ID: ${selectedAssignmentId}]...`,
          true
        );
        let assignment;
        if (SkiReport.cache.has("assignments")) {
          const cachedAssignments = await SkiReport.cache.get("assignments");
          const filteredAssignments = cachedAssignments.filter(
            (currentAssignment) => {
              return currentAssignment.id == selectedAssignmentId;
            }
          );
          if (filteredAssignments.length > 0) {
            assignment = filteredAssignments[0];
          }
        }
        if (!assignment) {
          assignment = await SkiCanvasLmsApiCaller.getRequestAllPages(
            `/api/v1/courses/${courseId}/assignments/${selectedAssignmentId}`
          );
        }
        if (!assignment) {
          this.updateLoadingMessage(
            "error",
            `ERROR: Failed to get assignment [ID: ${selectedAssignmentId}]`,
            true
          );
        } else {
          assignments.push(assignment);
        }
      } else {
        this.updateLoadingMessage(
          "info",
          "Getting details of assignments...",
          true
        );
        const fetchedAssignments = await this.#getAssignments(courseId);
        if (!fetchedAssignments) {
          this.updateLoadingMessage(
            "error",
            `ERROR: Failed to get assignments`,
            true
          );
        } else {
          assignments = fetchedAssignments;
        }
      }
      const assignmentsDict = {};
      for (const assignment of assignments) {
        assignmentsDict[assignment.id] = assignment;
      }

      this.updateLoadingMessage(
        "info",
        "Getting enrolled active students...",
        true
      );
      const studentsDict = {};
      let students;
      if (SkiReport.cache.has("enrollments-active")) {
        const cachedEnrollmentsActive = await SkiReport.cache.get(
          "enrollments-active"
        );
        students = cachedEnrollmentsActive.filter((enrollment) => {
          enrollment.type == "StudentEnrollment";
        });
      }
      if (!students) {
        const fetchedStudents = await SkiCanvasLmsApiCaller.getRequestAllPages(
          `/api/v1/courses/${courseId}/enrollments`,
          { per_page: 100, "type[]": "StudentEnrollment", "state[]": "active" }
        );
        if (!fetchedStudents) {
          this.updateLoadingMessage(
            "error",
            `ERROR: Failed to get enrolled active students`,
            true
          );
          students = [];
        } else {
          students = fetchedStudents;
        }
      }
      for (const student of students) {
        studentsDict[student.user_id] = student.user;
      }

      let submissions = [];
      const submissionStatesToCheck = ["submitted", "pending_review"];

      if (selectedAssignmentId) {
        for (const submissionState of submissionStatesToCheck) {
          this.updateLoadingMessage(
            "info",
            `Getting ${submissionState} submissions of assignment [ID: ${selectedAssignmentId}]...`,
            true
          );
          const currentSubmissions =
            await SkiCanvasLmsApiCaller.getRequestAllPages(
              `/api/v1/${context}/${contextId}/students/submissions?student_ids[]=all&include[]=submission_comments&include[]=rubric_assessment&assignment_ids[]=${selectedAssignmentId}&workflow_state=${submissionState}`
            );
          if (!currentSubmissions) {
            this.updateLoadingMessage(
              "error",
              `ERROR: Failed to get ${submissionState} submissions of assignment [ID: ${selectedAssignmentId}]`,
              true
            );
          } else {
            submissions.push(...currentSubmissions);
          }
        }
      } else {
        for (const submissionState of submissionStatesToCheck) {
          this.updateLoadingMessage(
            "info",
            `Getting ${submissionState} submissions for all assignments...`,
            true
          );
          const currentSubmissions =
            await SkiCanvasLmsApiCaller.getRequestAllPages(
              `/api/v1/${context}/${contextId}/students/submissions?student_ids[]=all&include[]=submission_comments&include[]=rubric_assessment&workflow_state=${submissionState}`
            );
          if (!currentSubmissions) {
            this.updateLoadingMessage(
              "error",
              `ERROR: Failed to get ${submissionState} submissions for all assignments`,
              true
            );
          } else {
            submissions.push(...currentSubmissions);
          }
        }
      }

      this.updateLoadingMessage("info", "Formatting data for table...", true);
      const submissionsData = this.extractData(
        submissions,
        assignmentsDict,
        studentsDict
      );

      this.updateLoadingMessage("info", "Setting table data...", true);
      table.setTableBody(submissionsData);

      this.updateLoadingMessage("success", "Finished loading data", true);
    } catch (error) {
      cconsole.error(`Error: ${error}\n\nStack Trace: ${error.stack}`);
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
      let studentName = "Unknown";
      if (students.hasOwnProperty(submission.user_id)) {
        studentName = students[submission.user_id].sortable_name;
      }
      const assignment = assignments[submission.assignment_id];
      const assignmentName = assignment?.name ?? "ERROR";
      const assignmentNameLink = document.createElement("a");
      assignmentNameLink.href =
        assignment?.html_url ??
        `/courses/${courseId}/assignments/${submission.assignment_id}`;
      assignmentNameLink.target = "_blank";
      assignmentNameLink.innerText = assignmentName;
      const pointsPossible = assignment?.points_possible ?? "ERROR";
      const omitFromFinalGrade = assignment?.omit_from_final_grade ?? "ERROR";

      const speedGraderLink = document.createElement("a");
      speedGraderLink.href = `/courses/${courseId}/gradebook/speed_grader?assignment_id=${submission.assignment_id}&student_id=${submission.user_id}`;
      speedGraderLink.title = "Grade Submission";
      speedGraderLink.target = "_blank";
      speedGraderLink.innerText = "SpeedGrader";

      const today = new Date();

      let submittedDate = submission.submitted_at;
      let submittedDateIso = "";
      let daysSinceSubmission = "N/A";
      if (!submittedDate) {
        submittedDate = "None";
      } else {
        submittedDateIso = new Date(submittedDate).toISOString();
        submittedDate = new Date(submittedDate).toLocaleString();
        daysSinceSubmission = Math.floor(
          (today - new Date(submittedDateIso)) / (1000 * 60 * 60 * 24)
        );
      }

      let dueDate = submission.cached_due_date;
      let dueDateIso = "";
      let daysSinceDueDate = "N/A";
      if (!dueDate) {
        dueDate = "None";
      } else {
        dueDateIso = new Date(dueDate).toISOString();
        dueDate = new Date(dueDate).toLocaleString();
        daysSinceDueDate = Math.floor(
          (today - new Date(dueDateIso)) / (1000 * 60 * 60 * 24)
        );
      }

      let minDays = Math.min(daysSinceSubmission, daysSinceDueDate);
      if (Number.isNaN(minDays)) {
        if (!Number.isNaN(daysSinceSubmission)) {
          minDays = daysSinceSubmission;
        } else if (!Number.isNaN(daysSinceDueDate)) {
          minDays = daysSinceDueDate;
        } else {
          minDays = "N/A";
        }
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
        new SkiTableDataConfig(submission.submission_type),
        new SkiTableDataConfig(
          submittedDate,
          submittedDateIso,
          "dateISO",
          submittedDateIso
        ),
        new SkiTableDataConfig(daysSinceSubmission, undefined, "number"),
        new SkiTableDataConfig(dueDate, dueDateIso, "dateISO", dueDateIso),
        new SkiTableDataConfig(daysSinceDueDate, undefined, "number"),
        new SkiTableDataConfig(minDays, undefined, "number"),
        new SkiTableDataConfig(submission.excused),
        new SkiTableDataConfig(submission.missing),
        new SkiTableDataConfig(submission.workflow_state),
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
        { order_by: "due_at", per_page: 100 }
      );
    });
  }
}
