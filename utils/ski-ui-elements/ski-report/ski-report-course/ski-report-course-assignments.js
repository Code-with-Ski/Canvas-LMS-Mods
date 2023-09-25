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
        new SkiTableHeadingConfig("Due Date"),
        new SkiTableHeadingConfig("Submission Types"),
        new SkiTableHeadingConfig("Grading Type"),
        new SkiTableHeadingConfig("Points Possible"),
        new SkiTableHeadingConfig("Rubric Grading"),
        new SkiTableHeadingConfig("Omit from Final Grade"),
        new SkiTableHeadingConfig("Needs Grading"),
        new SkiTableHeadingConfig("Published"),
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
    const extractedData = this.extractData(assignments);
    table.setTableBody(extractedData);
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

      const rowData = [
        new SkiTableDataConfig(assignment.id, undefined, "number"),
        new SkiTableDataConfig(assignmentNameLink),
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
      ];

      data.push(rowData);
    }
    return data;
  }
}