class SkiReportCourseAnnouncements extends SkiReport {
  constructor() {
    super("Announcement Details");
  }

  createTable() {
    const table = new SkiTable(
      "announcement-details",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Announcement ID", true, true),
        new SkiTableHeadingConfig("Title"),
        new SkiTableHeadingConfig("Message", false),
        new SkiTableHeadingConfig("Author ID", true, true),
        new SkiTableHeadingConfig("Author"),
        new SkiTableHeadingConfig("Created At"),
        new SkiTableHeadingConfig("Delayed Post At"),
        new SkiTableHeadingConfig("Last Reply At"),
        new SkiTableHeadingConfig("Requires Initial Post"),
        new SkiTableHeadingConfig("Posts Count"),
        new SkiTableHeadingConfig("Unread Posts Count"),
        new SkiTableHeadingConfig("Locked"),
        new SkiTableHeadingConfig("Allow Rating"),
      ],
      []
    );

    return table;
  }

  async loadData(table) {
    this.updateLoadingMessage("clear");
    try {
      this.updateLoadingMessage("info", "Getting announcements...", true);
      const courseId = SkiReport.contextDetails.get("courseId");
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }
      const announcements = await this.#getAnnouncements(courseId);
      if (!announcements) {
        this.updateLoadingMessage(
          "error",
          "ERROR: Failed to get announcements",
          true
        );
      } else {
        this.updateLoadingMessage("info", "Formatting data for table...", true);
        const data = this.extractData(announcements);

        this.updateLoadingMessage("info", "Adding data to table...", true);
        table.setTableBody(data);
        this.updateLoadingMessage("success", "Finished loading data", true);
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

      let createdAtDate = discussion.created_at;
      let createdAtDateIso = "";
      if (!createdAtDate) {
        createdAtDate = "None";
      } else {
        createdAtDateIso = new Date(createdAtDate).toISOString();
        createdAtDate = new Date(createdAtDate).toLocaleString();
      }

      let delayedUntilDate = discussion.delayed_post_at;
      let delayedUntilDateIso = "";
      if (!delayedUntilDate) {
        delayedUntilDate = "None";
      } else {
        delayedUntilDateIso = new Date(delayedUntilDate).toISOString();
        delayedUntilDate = new Date(delayedUntilDate).toLocaleString();
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
        new SkiTableDataConfig(
          discussion.user_name ? discussion?.author?.id : "N/A"
        ),
        new SkiTableDataConfig(discussion.user_name),
        new SkiTableDataConfig(
          createdAtDate,
          createdAtDateIso,
          "dateISO",
          createdAtDateIso
        ),
        new SkiTableDataConfig(
          delayedUntilDate,
          delayedUntilDateIso,
          "dateISO",
          delayedUntilDateIso
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
        new SkiTableDataConfig(discussion.locked),
        new SkiTableDataConfig(discussion.allow_rating),
      ];

      data.push(rowData);
    }
    return data;
  }

  #getAnnouncements(courseId) {
    return SkiReport.memoizeRequest("announcements", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/discussion_topics`,
        { only_announcements: true, per_page: 100 }
      );
    });
  }
}
