class SkiReportCourseDiscussions extends SkiReport {
  constructor() {
    super("Discussion Details");
  }

  createTable() {
    const table = new SkiTable(
      "discussion-details",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Discussion ID", true, true),
        new SkiTableHeadingConfig("Title"),
        new SkiTableHeadingConfig("Message", false),
        new SkiTableHeadingConfig("Author"),
        new SkiTableHeadingConfig("Posted At"),
        new SkiTableHeadingConfig("Last Reply At"),
        new SkiTableHeadingConfig("Requires Initial Post"),
        new SkiTableHeadingConfig("Posts Count"),
        new SkiTableHeadingConfig("Unread Posts Count"),
        new SkiTableHeadingConfig("Published"),
        new SkiTableHeadingConfig("Locked"),
        new SkiTableHeadingConfig("Discussion Type"),
        new SkiTableHeadingConfig("Assignment ID", true, true),
      ],
      []
    );

    return table;
  }

  async loadData(table) {
    this.updateLoadingMessage("clear");
    try {
      this.updateLoadingMessage("info", "Getting discussions...", true);
      const courseId = SkiReport.contextDetails.get("courseId");
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }
      const discussions = await this.#getDiscussions(courseId);
      if (!discussions) {
        this.updateLoadingMessage(
          "error",
          "ERROR: Failed to get discussions",
          true
        );
      } else {
        this.updateLoadingMessage("info", "Formatting data for table...", true);
        const discussionsData = this.extractData(discussions);

        this.updateLoadingMessage("info", "Adding data to table...", true);
        table.setTableBody(discussionsData);
        this.updateLoadingMessage("success", `Finished loading data`, true);
      }
    } catch (error) {
      console.error(`Error: ${error}\n\nStack Trace: ${error.stack}`);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(discussions) {
    const data = [];
    for (const discussion of discussions) {
      const discussionTitleLink = document.createElement("a");
      discussionTitleLink.href = discussion.html_url;
      discussionTitleLink.target = "_blank";
      discussionTitleLink.innerText = discussion.title;

      let postedAtDate = discussion.posted_at;
      let postedAtDateIso = "";
      if (!postedAtDate) {
        postedAtDate = "None";
      } else {
        postedAtDateIso = new Date(postedAtDate).toISOString();
        postedAtDate = new Date(postedAtDate).toLocaleString();
      }

      let lastReplyAtDate = discussion.last_reply_at;
      let lastReplyAtDateIso = "";
      if (!lastReplyAtDate) {
        lastReplyAtDate = "None";
      } else {
        lastReplyAtDateIso = new Date(lastReplyAtDate).toISOString();
        lastReplyAtDate = new Date(lastReplyAtDate).toLocaleString();
      }

      const rowData = [
        new SkiTableDataConfig(discussion.id, undefined, "number"),
        new SkiTableDataConfig(discussionTitleLink),
        new SkiTableDataConfig(discussion.message),
        new SkiTableDataConfig(discussion.user_name),
        new SkiTableDataConfig(
          postedAtDate,
          postedAtDateIso,
          "dateISO",
          postedAtDateIso
        ),
        new SkiTableDataConfig(
          lastReplyAtDate,
          lastReplyAtDateIso,
          "dateISO",
          lastReplyAtDateIso
        ),
        new SkiTableDataConfig(discussion.require_initial_post || false),
        new SkiTableDataConfig(discussion.discussion_subentry_count),
        new SkiTableDataConfig(discussion.unread_count),
        new SkiTableDataConfig(discussion.published),
        new SkiTableDataConfig(discussion.locked),
        new SkiTableDataConfig(discussion.discussion_type),
        new SkiTableDataConfig(discussion.assignment_id, undefined, "number"),
      ];

      data.push(rowData);
    }
    return data;
  }

  #getDiscussions(courseId) {
    return SkiReport.memoizeRequest("discussions", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/discussion_topics`,
        { per_page: 100 }
      );
    });
  }
}
