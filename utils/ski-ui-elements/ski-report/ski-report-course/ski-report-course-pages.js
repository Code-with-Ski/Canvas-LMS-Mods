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
    this.updateLoadingMessage("clear");
    try {
      const courseId = SkiReport.contextDetails.get("courseId");
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }

      this.updateLoadingMessage("info", "Getting pages...", true);
      const pages = await this.#getPages(courseId);
      if (!pages) {
        this.updateLoadingMessage("error", `ERROR: Failed to get pages`, true);
      } else {
        this.updateLoadingMessage("info", "Formatting data for table...", true);
        const extractedData = this.extractData(pages);

        this.updateLoadingMessage("info", "Adding data to table...", true);
        table.setTableBody(extractedData);
        this.updateLoadingMessage("success", `Finished loading data`, true);
      }
    } catch (error) {
      console.error(`Error: ${error}\n\nStack Trace: ${error.stack}`);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(pages) {
    const data = [];
    for (const page of pages) {
      const pageTitleLink = document.createElement("a");
      pageTitleLink.href = `/courses/${this.#currentCourseId}/pages/${
        page.url
      }`;
      pageTitleLink.target = "_blank";
      pageTitleLink.innerText = page.title;

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
        new SkiTableDataConfig(page.page_id, undefined, "number"),
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

  #getPages(courseId) {
    return SkiReport.memoizeRequest("pages", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/pages`,
        { "include[]": "body", per_page: 100 }
      );
    });
  }
}
