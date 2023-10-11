class SkiReportRubricAssociations extends SkiReport {
  #currentContext = window.location.pathname.split("/")[1];
  #currentContextId = window.location.pathname.split("/")[2];
  #currentRubricId = window.location.pathname.split("/")[4].split("?")[0];

  constructor() {
    super("Rubric Associations");
  }

  createTable() {
    const table = new SkiTable(
      "rubric-association-details",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("ID", true, true),
        new SkiTableHeadingConfig("Associated Item ID"),
        new SkiTableHeadingConfig("Associated Item Type"), // TODO Consider trying to get item name
        new SkiTableHeadingConfig("Use for Grading"),
        new SkiTableHeadingConfig("Purpose"),
        new SkiTableHeadingConfig("Hide Score Total", true, true),
        new SkiTableHeadingConfig("Hide Points", true, true),
        new SkiTableHeadingConfig("Hide Outcome Results", true, true),
      ],
      []
    );

    return table;
  }

  async loadData(table) {
    const rubricDetails = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/${this.#currentContext}/${this.#currentContextId}/rubrics/${
        this.#currentRubricId
      }`,
      { "include[]": "associations" }
    );
    const data = this.extractData(rubricDetails);
    table.setTableBody(data);
  }

  extractData(rubricDetails) {
    const data = [];

    const associations = rubricDetails.associations;
    for (const association of associations) {
      const rowData = [
        new SkiTableDataConfig(association.id, undefined, "number"),
        new SkiTableDataConfig(association.association_id, undefined, "number"),
        new SkiTableDataConfig(association.association_type),
        new SkiTableDataConfig(association.use_for_grading),
        new SkiTableDataConfig(association.purpose),
        new SkiTableDataConfig(association.hide_score_total),
        new SkiTableDataConfig(association.hide_points),
        new SkiTableDataConfig(association.hide_outcome_results),
      ];

      data.push(rowData);
    }
    return data;
  }
}
