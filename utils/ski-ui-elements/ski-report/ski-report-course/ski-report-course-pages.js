class SkiReportCoursePages extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];

  constructor() {
    super("Page Details");
  }

  createTable() {
    const table = new SkiTable(
      "page-details",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Page ID", true, true),
        new SkiTableHeadingConfig("Title"),
        new SkiTableHeadingConfig("URL"),
        new SkiTableHeadingConfig("Created At"),
        new SkiTableHeadingConfig("Updated At"),
        new SkiTableHeadingConfig("Published"),
        new SkiTableHeadingConfig("Front Page"),
        new SkiTableHeadingConfig("Body"),
      ],
      []
    );

    return table;
  }

  async loadData(table) {
    const pages = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${this.#currentCourseId}/pages`,
      {}
    );
    const extractedData = this.extractData(pages);
    table.setTableBody(extractedData);
  }

  extractData(pages) {
    const data = [];
    for (const page of pages) {
      const pageTitleLink = document.createElement("a");
      pageTitleLink.href = `/courses/${this.#currentCourseId}/pages/${page.url}`;
      pageTitleLink.target = "_blank";
      pageTitleLink.innerText = page.url;

      let createdAtDate = page.created_at;
      let createdAtDateIso = "";
      if (!createdAtDate) {
        createdAtDate = "None";
      } else {
        createdAtDateIso = new Date(createdAtDate).toISOString();
        createdAtDate = new Date(createdAtDate).toLocaleString();
      }

      let updatedAtDate = page.updated_at;
      let updatedAtDateIso = "";
      if (!updatedAtDate) {
        updatedAtDate = "None";
      } else {
        updatedAtDateIso = new Date(updatedAtDate).toISOString();
        updatedAtDate = new Date(updatedAtDate).toLocaleString();
      }

      const pageBody = page.body;

      const rowData = [
        new SkiTableDataConfig(page.id, undefined, "number"),
        new SkiTableDataConfig(pageTitleLink),
        new SkiTableDataConfig(page.url),
        new SkiTableDataConfig(
          createdAtDate,
          createdAtDateIso,
          "dateISO",
          createdAtDateIso
        ),
        new SkiTableDataConfig(
          updatedAtDate,
          updatedAtDateIso,
          "dateISO",
          updatedAtDateIso
        ),
        new SkiTableDataConfig(page.published),
        new SkiTableDataConfig(page.front_page),
        new SkiTableDataConfig(`${pageBody ? pageBody : ""}`),
      ];

      data.push(rowData);
    }
    return data;
  }
}