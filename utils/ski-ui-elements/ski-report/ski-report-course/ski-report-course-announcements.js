class SkiReportCourseAnnouncements extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];

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
    const discussions = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${this.#currentCourseId}/discussion_topics`,
      { only_announcements: true }
    );
    const discussionsData = this.extractData(discussions);
    table.setTableBody(discussionsData);
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
        new SkiTableDataConfig(discussion.user_name ? discussion?.author?.id : "N/A"),
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
}
