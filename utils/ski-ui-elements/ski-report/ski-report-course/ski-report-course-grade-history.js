class SkiReportCourseGradeHistory extends SkiReport {
  constructor() {
    super("Grade History Report");
    this.addAssignmentOptions();
    this.addUserOptions();
  }

  createTable() {
    const table = new SkiTable(
      "grade-history",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Submission ID", true, true),
        new SkiTableHeadingConfig("User ID", true, true),
        new SkiTableHeadingConfig("Student Name"),
        new SkiTableHeadingConfig("Assignment ID", true, true),
        new SkiTableHeadingConfig("Assignment Name"),
        new SkiTableHeadingConfig("SpeedGrader"),
        new SkiTableHeadingConfig("Submitted At"),
        new SkiTableHeadingConfig("Workflow State", true, true),
        new SkiTableHeadingConfig("Grade Matches Current Submission"),
        new SkiTableHeadingConfig("Grade"),
        new SkiTableHeadingConfig("Score"),
        new SkiTableHeadingConfig("Submission Type", true, true),
        new SkiTableHeadingConfig("Graded At"),
        new SkiTableHeadingConfig("Grader ID", true, true),
        new SkiTableHeadingConfig("Grader Name"),
      ],
      []
    );

    return table;
  }

  addFormElements(table, formContainer) {
    // Assignment Selection
    const assignmentSelection = this.createAssignmentSelection();
    formContainer.appendChild(assignmentSelection);

    // User Selection
    const userSelection = this.createUserSelection();
    formContainer.appendChild(userSelection);

    // Adds Load All button
    super.addFormElements(table, formContainer);
  }

  createAssignmentSelection() {
    const assignmentSelectionFieldset = document.createElement("fieldset");
    assignmentSelectionFieldset.classList.add("ski-ui");

    const label = document.createElement("label");
    label.innerText = "Select assignment for which to check grade history:";
    label.setAttribute("for", `grade-history-assignment-select`);
    assignmentSelectionFieldset.appendChild(label);

    const assignmentSelect = document.createElement("select");
    assignmentSelect.classList.add("ski-ui", "ski-assignment-select");
    assignmentSelect.id = "grade-history-report-assignment-select";

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
      "#grade-history-report-assignment-select"
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

  createUserSelection() {
    const userSelectionFieldset = document.createElement("fieldset");
    userSelectionFieldset.classList.add("ski-ui");

    const label = document.createElement("label");
    label.innerText = "Select user(s) for which to check the grade history:";
    label.setAttribute("for", `grade-history-report-user-select`);
    userSelectionFieldset.appendChild(label);

    const userSelect = document.createElement("select");
    userSelect.classList.add("ski-ui", "ski-user-select");
    userSelect.id = "grade-history-report-user-select";

    const defaultAllOption = document.createElement("option");
    defaultAllOption.value = "";
    defaultAllOption.text = "All";
    defaultAllOption.selected = true;
    userSelect.appendChild(defaultAllOption);

    const activeOption = document.createElement("option");
    activeOption.value = "active";
    activeOption.text = "All Active";
    userSelect.appendChild(activeOption);

    const inactiveOption = document.createElement("option");
    inactiveOption.value = "inactive";
    inactiveOption.text = "All Inactive";
    userSelect.appendChild(inactiveOption);

    const concludedOption = document.createElement("option");
    concludedOption.value = "concluded";
    concludedOption.text = "All Concluded";
    userSelect.appendChild(concludedOption);

    const deletedOption = document.createElement("option");
    deletedOption.value = "deleted";
    deletedOption.text = "All Deleted";
    deletedOption.selected = true;
    userSelect.appendChild(deletedOption);

    userSelectionFieldset.appendChild(userSelect);

    return userSelectionFieldset;
  }

  async addUserOptions() {
    const userSelect = this.getReportContainer().querySelector(
      "#grade-history-report-user-select"
    );

    const activeGroup = document.createElement("optgroup");
    activeGroup.label = "Active Users";
    activeGroup.classList.add("ski-optgroup-users-active");
    const inactiveGroup = document.createElement("optgroup");
    inactiveGroup.label = "Inactive Users";
    inactiveGroup.classList.add("ski-optgroup-users-inactive");
    const concludedGroup = document.createElement("optgroup");
    concludedGroup.label = "Concluded Users";
    concludedGroup.classList.add("ski-optgroup-users-concluded");
    const deletedGroup = document.createElement("optgroup");
    deletedGroup.label = "Deleted Users";
    deletedGroup.classList.add("ski-optgroup-users-deleted");

    const courseId = SkiReport.contextDetails.get("courseId");
    const context = SkiReport.contextDetails.get("reportContext");
    const sectionId = SkiReport.contextDetails.get("sectionId");
    const contextId = SkiReport.contextDetails.get("contextId");
    if (!courseId) {
      throw "Course ID not set in SkiReport";
    }

    const enrollmentStates = ["active", "inactive", "concluded", "deleted"];
    for (const state of enrollmentStates) {
      const enrollments = await this.#getEnrollments(context, contextId, state);

      let optGroup = activeGroup;
      if (state == "inactive") {
        optGroup = inactiveGroup;
      } else if (state == "concluded") {
        optGroup = concludedGroup;
      } else if (state == "deleted") {
        optGroup = deletedGroup;
      }

      for (const enrollment of enrollments) {
        if (enrollment.type != "StudentEnrollment") {
          continue;
        }
        const option = document.createElement("option");
        option.value = enrollment.user_id;
        option.text = `${enrollment?.user?.short_name ?? "Unknown"} *(ID: ${
          enrollment.user_id
        })`;
        optGroup.appendChild(option);
      }

      userSelect.appendChild(optGroup);
    }
  }

  async loadData(table, formContainer) {
    try {
      const courseId = SkiReport.contextDetails.get("courseId");
      let contextId = courseId;
      const context = SkiReport.contextDetails.get("reportContext");
      let sectionId;
      if (context == "sections") {
        sectionId = SkiReport.contextDetails.get("sectionId");
        contextId = sectionId;
      }
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }

      this.updateLoadingMessage("info", "Getting selected options");
      const selectedAssignmentId = formContainer.querySelector(
        ".ski-assignment-select"
      )?.value;

      const selectedUserId =
        formContainer.querySelector(".ski-user-select")?.value;

      let submissions = [];
      if (!selectedUserId) {
        if (!selectedAssignmentId) {
          this.updateLoadingMessage("info", "Getting grade history...");
          const submissionHistory =
            await SkiCanvasLmsApiCaller.getRequestAllPages(
              `/api/v1/courses/${courseId}/gradebook_history/feed`
            );
          submissions.push(...submissionHistory);
        } else {
          this.updateLoadingMessage("info", "Getting grade history...");
          const submissionHistory =
            await SkiCanvasLmsApiCaller.getRequestAllPages(
              `/api/v1/courses/${courseId}/gradebook_history/feed?assignment_id=${selectedAssignmentId}`
            );
          submissions.push(...submissionHistory);
        }
      } else {
        const enrollmentStates = ["active", "inactive", "concluded", "deleted"];
        const userIds = new Set();
        if (enrollmentStates.includes(selectedUserId)) {
          const enrollments = await this.#getEnrollments(
            context,
            contextId,
            selectedUserId
          );
          for (const enrollment of enrollments) {
            if (enrollment.type == "StudentEnrollment") {
              userIds.add(enrollment.user_id);
            }
          }
        } else {
          userIds.add(selectedUserId);
        }

        const numOfUsers = userIds.size;
        let currentCount = 0;
        for (const userId of userIds) {
          currentCount++;
          this.updateLoadingMessage(
            "info",
            "Getting grade history of users (${currentCount} of ${numOfUsers})..."
          );
          if (!selectedAssignmentId) {
            const submissionHistory =
              await SkiCanvasLmsApiCaller.getRequestAllPages(
                `/api/v1/courses/${courseId}/gradebook_history/feed?user_id=${userId}`
              );
            submissions.push(...submissionHistory);
          } else {
            const submissionHistory =
              await SkiCanvasLmsApiCaller.getRequestAllPages(
                `/api/v1/courses/${courseId}/gradebook_history/feed?user_id=${userId}&assignment_id=${selectedAssignmentId}`
              );
            submissions.push(...submissionHistory);
          }
        }
      }

      this.updateLoadingMessage("info", "Formatting data for table...");
      const submissionsData = this.extractData(submissions);

      this.updateLoadingMessage("info", "Setting table data...");
      table.setTableBody(submissionsData);

      this.updateLoadingMessage("success", "Finished loading data");
    } catch (error) {
      console.error(error);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(gradeHistorySubmissions) {
    const courseId = SkiReport.contextDetails.get("courseId");
    if (!courseId) {
      throw "Course ID not set in SkiReport";
    }

    const data = [];
    for (const submission of gradeHistorySubmissions) {
      const studentName = submission?.user_name ?? "Unknown";
      let studentNameLink = document.createElement("a");
      studentNameLink.href = `/courses/${courseId}/users/${submission.user_id}`;
      studentNameLink.target = "_blank";
      studentNameLink.innerText = studentName;

      const assignmentName = submission.assignment_name;
      const assignmentNameLink = document.createElement("a");
      assignmentNameLink.href = `/courses/${courseId}/assignments/${submission.assignment_id}`;
      assignmentNameLink.target = "_blank";
      assignmentNameLink.innerText = assignmentName;

      let graderNameLink = submission.grader;
      if (submission.grader_id) {
        graderNameLink = document.createElement("a");
        graderNameLink.href = `/courses/${courseId}/users/${submission.grader_id}`;
        graderNameLink.target = "_blank";
        graderNameLink.innerText = submission.grader;
      }

      const speedGraderLink = document.createElement("a");
      speedGraderLink.href = `/courses/${courseId}/gradebook/speed_grader?assignment_id=${submission.assignment_id}&student_id=${submission.user_id}`;
      speedGraderLink.title = "Go to SpeedGrader";
      speedGraderLink.target = "_blank";
      speedGraderLink.innerText = "SpeedGrader";

      let submittedAtDate = submission.submitted_at;
      let submittedAtDateIso = "";
      if (!submittedAtDate) {
        submittedAtDate = "None";
      } else {
        submittedAtDateIso = new Date(submittedAtDate).toISOString();
        submittedAtDate = new Date(submittedAtDate).toLocaleString();
      }

      let gradedAtDate = submission.graded_at;
      let gradedAtDateIso = "";
      if (!gradedAtDate) {
        gradedAtDate = "None";
      } else {
        gradedAtDateIso = new Date(gradedAtDate).toISOString();
        gradedAtDate = new Date(gradedAtDate).toLocaleString();
      }

      const rowData = [
        new SkiTableDataConfig(submission.id, undefined, "number"),
        new SkiTableDataConfig(submission.user_id, undefined, "number"),
        new SkiTableDataConfig(studentNameLink),
        new SkiTableDataConfig(submission.assignment_id, undefined, "number"),
        new SkiTableDataConfig(assignmentNameLink),
        new SkiTableDataConfig(
          speedGraderLink,
          undefined,
          undefined,
          speedGraderLink.href
        ),
        new SkiTableDataConfig(
          submittedAtDate,
          submittedAtDateIso,
          "dateISO",
          submittedAtDateIso
        ),
        new SkiTableDataConfig(submission.workflow_state),
        new SkiTableDataConfig(submission.grade_matches_current_submission),
        new SkiTableDataConfig(submission.grade, undefined, "number"),
        new SkiTableDataConfig(submission.score, undefined, "number"),
        new SkiTableDataConfig(submission.submission_type),
        new SkiTableDataConfig(
          gradedAtDate,
          gradedAtDateIso,
          "dateISO",
          gradedAtDateIso
        ),
        new SkiTableDataConfig(submission.grader_id, undefined, "number"),
        new SkiTableDataConfig(graderNameLink),
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
