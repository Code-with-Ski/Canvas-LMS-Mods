class SkiReportCourseDiscussionReplies extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];

  constructor() {
    super("Discussion Replies Report");
  }

  createTable() {
    const table = new SkiTable(
      "discussion-reply-details",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Author ID", true, true),
        new SkiTableHeadingConfig("Author Name"),
        new SkiTableHeadingConfig("Post ID", true, true),
        new SkiTableHeadingConfig("Post Parent ID", true, true),
        new SkiTableHeadingConfig("Discussion Title"),
        new SkiTableHeadingConfig("Message Body", false),
        new SkiTableHeadingConfig("Created At"),
        new SkiTableHeadingConfig("Updated At"),
        new SkiTableHeadingConfig("Message Type"),
        new SkiTableHeadingConfig("# of Replies to Discussion"),
      ],
      []
    );

    return table;
  }

  async loadData(table) {
    const discussions = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${this.#currentCourseId}/discussion_topics`,
      {}
    );
    for (const discussion of discussions) {
      const discussionId = discussion.id;
      const fullDiscussion = await SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${
          this.#currentCourseId
        }/discussion_topics/${discussionId}/view`
      );

      discussion.fullDiscussion = fullDiscussion;
    }

    const discussionRepliesData = this.extractData(discussions);
    table.setTableBody(discussionRepliesData);
  }

  extractData(discussions) {
    const data = [];
    for (const discussion of discussions) {
      data.push(this.#extractDiscussionOriginData(discussion));

      const fullDiscussion = discussion.fullDiscussion;

      const nestedReplies = fullDiscussion.view;
      if (!nestedReplies) {
        continue;
      }

      const participants = fullDiscussion.participants;
      if (!participants) {
        continue;
      }

      const participantsDict = {};
      for (const participant of participants) {
        participantsDict[participant.id] = {
          name: participant.display_name,
          replyCount: new ReplyCounter(),
        };
      }

      const repliesData = this.#extractNestedRepliesData(
        discussion.title,
        participantsDict,
        nestedReplies
      );

      data.push(...repliesData);
    }

    return data;
  }

  #extractDiscussionOriginData(discussion) {
    const author = discussion.author;
    let authorId = "None";
    let authorName = "N/A";
    if (author) {
      authorId = author.id;
      authorName = author.display_name;
    }

    let createdAtDate = discussion.created_at;
    let createdAtDateIso = "";
    if (!createdAtDate) {
      createdAtDate = "None";
    } else {
      createdAtDateIso = new Date(createdAtDate).toISOString();
      createdAtDate = new Date(createdAtDate).toLocaleString();
    }

    let postedAtDate = discussion.posted_at;
    let postedAtDateIso = "";
    if (!postedAtDate) {
      postedAtDate = "None";
    } else {
      postedAtDateIso = new Date(postedAtDate).toISOString();
      postedAtDate = new Date(postedAtDate).toLocaleString();
    }

    return [
      new SkiTableDataConfig(authorId, undefined, "number"),
      new SkiTableDataConfig(authorName),
      new SkiTableDataConfig(discussion.id, undefined, "number"),
      new SkiTableDataConfig("N/A"),
      new SkiTableDataConfig(discussion.title),
      new SkiTableDataConfig(discussion.message),
      new SkiTableDataConfig(
        createdAtDate,
        createdAtDateIso,
        "dateISO",
        createdAtDateIso
      ),
      new SkiTableDataConfig(
        postedAtDate,
        postedAtDateIso,
        "dateISO",
        postedAtDateIso
      ),
      new SkiTableDataConfig("ORIGIN"),
      new SkiTableDataConfig("N/A"),
    ];
  }

  #extractNestedRepliesData(discussionTitle, participants, nestedReplies) {
    const nestedRepliesData = [];
    for (const reply of nestedReplies) {
      nestedRepliesData.push(
        ...this.#extractDiscussionReplyData(
          discussionTitle,
          participants,
          reply
        )
      );
    }
    return nestedRepliesData;
  }

  #extractDiscussionReplyData(discussionTitle, participants, reply) {
    const replyData = [];

    const authorId = reply.user_id;
    let authorName = "Unknown";
    if (participants.hasOwnProperty(authorId)) {
      authorName = participants[authorId]["name"];
      participants[authorId]["replyCount"].addReply();
    }

    let createdAtDate = reply.created_at;
    let createdAtDateIso = "";
    if (!createdAtDate) {
      createdAtDate = "None";
    } else {
      createdAtDateIso = new Date(createdAtDate).toISOString();
      createdAtDate = new Date(createdAtDate).toLocaleString();
    }

    let updatedAtDate = reply.updated_at;
    let updatedAtDateIso = "";
    if (!updatedAtDate) {
      updatedAtDate = "None";
    } else {
      updatedAtDateIso = new Date(updatedAtDate).toISOString();
      updatedAtDate = new Date(updatedAtDate).toLocaleString();
    }

    replyData.push([
      new SkiTableDataConfig(authorId, undefined, "number"),
      new SkiTableDataConfig(authorName),
      new SkiTableDataConfig(reply.id, undefined, "number"),
      new SkiTableDataConfig(reply.parent_id, undefined, "number"),
      new SkiTableDataConfig(discussionTitle),
      new SkiTableDataConfig(reply.message),
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
      new SkiTableDataConfig("REPLY"),
      new SkiTableDataConfig(participants[authorId]["replyCount"]),
    ]);

    if (reply.hasOwnProperty("replies")) {
      replyData.push(
        ...this.#extractNestedRepliesData(
          discussionTitle,
          participants,
          reply.replies
        )
      );
    }

    return replyData;
  }
}

class ReplyCounter {
  constructor() {
    this.replyCount = 0;
  }

  addReply() {
    this.replyCount++;
  }

  toString() {
    return this.replyCount;
  }
}
