class SkiReportCourseSubmissions extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];
  
  constructor() {
    super("Submission Details");
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

  async loadData(table) {
    const assignments = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${this.#currentCourseId}/assignments`,
      { order_by: "due_at" }
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

    const studentsDict = {};
    const students = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${this.#currentCourseId}/enrollments?type[]=StudentEnrollment`,
      {}
    );
    for (const student of students) {
      studentsDict[student.user_id] = student.user;
    }

    const submissions = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${this.#currentCourseId}/students/submissions?student_ids[]=all&include[]=submission_comments&include[]=rubric_assessment`
    );

    const submissionsData = this.extractData(
      submissions,
      assignmentsDict,
      studentsDict
    );

    table.setTableBody(submissionsData);
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
      assignmentNameLink.href = submission.html_url;
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
      rubricHeadings.push(new SkiTableHeadingConfig(
        `Criteria ID ${i}`,
        true,
        true,
      ));
      rubricHeadings.push(new SkiTableHeadingConfig(
        `Criteria Description ${i}`,
        true,
        true,
      ));
      rubricHeadings.push(new SkiTableHeadingConfig(
        `Score ${i}`,
        true,
        true,
      ));
      rubricHeadings.push(new SkiTableHeadingConfig(
        `Points Possible ${i}`,
        true,
        true,
      ));
      rubricHeadings.push(new SkiTableHeadingConfig(
        `Comments ${i}`,
        true,
        true,
      ));
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
      rubricData.push(new SkiTableDataConfig(criteria.description));
      rubricData.push(
        new SkiTableDataConfig(criteriaAssessment.points, undefined, "number")
      );
      rubricData.push({ content: criteriaAssessment.comments });
    }

    return rubricData;
  }
}