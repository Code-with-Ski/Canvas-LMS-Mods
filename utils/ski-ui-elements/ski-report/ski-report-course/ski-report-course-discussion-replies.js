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

  addFormElements(table, formContainer) {
    // Discussion Selection
    const discussionSelection = this.createDiscussionSelection();
    formContainer.appendChild(discussionSelection);

    // Adds Load All button
    super.addFormElements(table, formContainer);
  }

  createDiscussionSelection() {
    const discussionSelectionFieldset = document.createElement("fieldset");
    discussionSelectionFieldset.classList.add("ski-ui");

    const label = document.createElement("label");
    label.innerText = "Select discussion board to get replies from:";
    discussionSelectionFieldset.appendChild(label);

    const discussionSelect = document.createElement("select");
    discussionSelect.classList.add("ski-ui", "ski-discussion-select");

    const defaultAllOption = document.createElement("option");
    defaultAllOption.value = "";
    defaultAllOption.text = "All";
    defaultAllOption.selected = true;
    discussionSelect.appendChild(defaultAllOption);

    discussionSelectionFieldset.appendChild(discussionSelect);

    this.addDiscussionOptions(discussionSelect);

    return discussionSelectionFieldset;
  }

  async addDiscussionOptions(discussionSelect) {
    const courseId = window.location.pathname.split("/")[2];
    const discussions = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${courseId}/discussion_topics`,
      {}
    );

    for (const discussion of discussions) {
      const option = document.createElement("option");
      option.value = discussion.id;
      option.text = `${discussion.title} *(ID: ${discussion.id})`;
      discussionSelect.appendChild(option);
    }
  }

  async loadData(table, formContainer) {
    try {
      const selectedDiscussionId = formContainer.querySelector(
        "select.ski-discussion-select"
      )?.value;

      let discussions = [];
      if (selectedDiscussionId) {
        this.updateLoadingMessage("info", "Getting discussion details...");
        const discussion = await SkiCanvasLmsApiCaller.getRequestAllPages(
          `/api/v1/courses/${
            this.#currentCourseId
          }/discussion_topics/${selectedDiscussionId}`,
          {}
        );
        this.updateLoadingMessage("info", "Getting replies for discussion...");
        const fullDiscussion = await SkiCanvasLmsApiCaller.getRequestAllPages(
          `/api/v1/courses/${
            this.#currentCourseId
          }/discussion_topics/${selectedDiscussionId}/view`
        );

        discussion.fullDiscussion = fullDiscussion;
        discussions.push(discussion);
      } else {
        this.updateLoadingMessage("info", "Getting all discussions...");
        discussions = await SkiCanvasLmsApiCaller.getRequestAllPages(
          `/api/v1/courses/${this.#currentCourseId}/discussion_topics`,
          {}
        );
        const numOfDiscussions = discussions.length;
        for (let i = 0; i < numOfDiscussions; i++) {
          this.updateLoadingMessage(
            "info",
            `Getting replies for discussion (${
              i + 1
            } of ${numOfDiscussions})...`
          );
          const discussion = discussions[i];
          const discussionId = discussion.id;
          const fullDiscussion = await SkiCanvasLmsApiCaller.getRequestAllPages(
            `/api/v1/courses/${
              this.#currentCourseId
            }/discussion_topics/${discussionId}/view`
          );

          discussion.fullDiscussion = fullDiscussion;
        }
      }

      this.updateLoadingMessage("info", "Formatting data for table...");
      const discussionRepliesData = this.extractData(discussions);

      table.setTableBody(discussionRepliesData);
      this.updateLoadingMessage("success", "Finished loading data");
    } catch (error) {
      console.error(error);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
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
          html_url: participant.html_url,
          replyCount: new ReplyCounter(),
        };
      }

      const repliesData = this.#extractNestedRepliesData(
        discussion,
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
      const authorUrl = author.html_url;
      const link = document.createElement("a");
      link.href = authorUrl;
      link.target = "_blank";
      link.title = `View Course Profile of ${author.display_name}`;
      link.innerHTML = author.display_name;
      authorName = link;
    }

    const discussionTitle = discussion.title;
    const discussionLink = document.createElement("a");
    discussionLink.href = discussion.html_url;
    discussionLink.target = "_blank";
    discussionLink.title = "Go to discussion";
    discussionLink.innerHTML = discussionTitle;

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
      new SkiTableDataConfig(discussionLink),
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

  #extractNestedRepliesData(discussion, participants, nestedReplies) {
    const nestedRepliesData = [];
    for (const reply of nestedReplies) {
      nestedRepliesData.push(
        ...this.#extractDiscussionReplyData(discussion, participants, reply)
      );
    }
    return nestedRepliesData;
  }

  #extractDiscussionReplyData(discussion, participants, reply) {
    const replyData = [];

    const authorId = reply.user_id;
    let authorName = "Unknown";
    if (participants.hasOwnProperty(authorId)) {
      const participant = participants[authorId];
      const authorUrl = participant.html_url;
      const link = document.createElement("a");
      link.href = authorUrl;
      link.target = "_blank";
      link.title = `View Course Profile of ${participant.name}`;
      link.innerHTML = participant.name;
      authorName = link;
      participants[authorId]["replyCount"].addReply();
    }

    const discussionTitle = discussion.title;
    const discussionLink = document.createElement("a");
    discussionLink.href = discussion.html_url;
    discussionLink.target = "_blank";
    discussionLink.title = "Go to discussion";
    discussionLink.innerHTML = discussionTitle;

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
      new SkiTableDataConfig(discussionLink),
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
          discussion,
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
