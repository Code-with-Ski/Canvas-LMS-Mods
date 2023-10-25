class SkiReportCourseAssignments extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];

  constructor() {
    super("Assignment Details");
  }

  createTable() {
    const table = new SkiTable(
      "assignment-details",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Assignment ID", true, true),
        new SkiTableHeadingConfig("Name"),
        new SkiTableHeadingConfig("Description HTML", false, true),
        new SkiTableHeadingConfig("Description Text", false, true),
        new SkiTableHeadingConfig("Due Date"),
        new SkiTableHeadingConfig("Submission Types"),
        new SkiTableHeadingConfig("Grading Type"),
        new SkiTableHeadingConfig("Points Possible"),
        new SkiTableHeadingConfig("Rubric Grading"),
        new SkiTableHeadingConfig("Omit from Final Grade"),
        new SkiTableHeadingConfig("Needs Grading"),
        new SkiTableHeadingConfig("Published"),
        new SkiTableHeadingConfig("Allowed Attempts", true, true),
        new SkiTableHeadingConfig("Peer Reviews", true, true),
        new SkiTableHeadingConfig("Anonymous Grading", true, true),
        new SkiTableHeadingConfig("Muted", true, true),
      ],
      []
    );

    return table;
  }

  async loadData(table) {
    try {
      this.updateLoadingMessage("info", "Getting assignments...");
      const assignments = await SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${this.#currentCourseId}/assignments`,
        { order_by: "due_at" }
      );

      this.updateLoadingMessage("info", "Formatting data for table...");
      const extractedData = this.extractData(assignments);

      this.updateLoadingMessage("info", "Adding data to table...");
      table.setTableBody(extractedData);
      this.updateLoadingMessage("success", `Finished loading data`);
    } catch (error) {
      console.error(error);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(assignments) {
    const data = [];
    for (const assignment of assignments) {
      const assignmentNameLink = document.createElement("a");
      assignmentNameLink.href = assignment.html_url;
      assignmentNameLink.target = "_blank";
      assignmentNameLink.innerText = assignment.name;

      let assignmentDueDate = assignment.due_at;
      let assignmentDueDateIso = "";
      if (!assignmentDueDate) {
        assignmentDueDate = "None";
      } else {
        assignmentDueDateIso = new Date(assignmentDueDate).toISOString();
        assignmentDueDate = new Date(assignmentDueDate).toLocaleString();
      }

      let rubricGrading = "No rubric associated";
      if (assignment.hasOwnProperty("use_rubric_for_grading")) {
        if (assignment.use_rubric_for_grading) {
          rubricGrading = "Used for grading";
        } else {
          rubricGrading = "Not used for grading";
        }
      }

      const pointsPossible =
        assignment.points_possible == null
          ? "None"
          : assignment.points_possible;

      let assignmentAttempts = assignment.allowed_attempts;
      if (assignmentAttempts == -1) {
        assignmentAttempts = "Unlimited";
      }

      const rowData = [
        new SkiTableDataConfig(assignment.id, undefined, "number"),
        new SkiTableDataConfig(assignmentNameLink),
        new SkiTableDataConfig(assignment.description),
        new SkiTableDataConfig(SkiReport.sanitizeText(assignment.description)),
        new SkiTableDataConfig(
          assignmentDueDate,
          assignmentDueDateIso,
          "dateISO",
          assignmentDueDateIso
        ),
        new SkiTableDataConfig(assignment.submission_types?.join("; ")),
        new SkiTableDataConfig(assignment.grading_type),
        new SkiTableDataConfig(pointsPossible),
        new SkiTableDataConfig(rubricGrading),
        new SkiTableDataConfig(assignment.omit_from_final_grade),
        new SkiTableDataConfig(assignment.needs_grading_count),
        new SkiTableDataConfig(assignment.published),
        new SkiTableDataConfig(
          assignmentAttempts,
          assignment.allowed_attempts,
          "number"
        ),
        new SkiTableDataConfig(assignment.peer_reviews),
        new SkiTableDataConfig(assignment.anonymous_grading),
        new SkiTableDataConfig(assignment.muted),
      ];

      data.push(rowData);
    }
    return data;
  }
}
