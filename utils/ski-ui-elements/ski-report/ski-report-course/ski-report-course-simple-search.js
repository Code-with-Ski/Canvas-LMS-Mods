class SkiReportCourseSimpleSearch extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];

  constructor() {
    super("Simple Search");
  }

  createTable() {
    const table = new SkiTable(
      "simple-search-results",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Item ID", true, true),
        new SkiTableHeadingConfig("URL", true, true),
        new SkiTableHeadingConfig("Item Type"),
        new SkiTableHeadingConfig("Title"),
        new SkiTableHeadingConfig("Content", false),
        new SkiTableHeadingConfig("HTML Content", false, true),
      ],
      []
    );

    return table;
  }

  addFormElements(table, formContainer) {
    // Search input
    const searchFieldset = this.createSearchFieldset();
    formContainer.appendChild(searchFieldset);

    // Adds Load All button
    super.addFormElements(table, formContainer);
  }

  createSearchFieldset() {
    const searchFieldset = document.createElement("fieldset");
    searchFieldset.classList.add("ski-ui");

    const label = document.createElement("label");
    label.innerText = "Search value: ";
    label.setAttribute("for", `simple-search-search-input`);
    searchFieldset.appendChild(label);

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("ski-ui");
    input.placeholder = "Enter value to search for";
    input.id = "simple-search-search-input";
    input.required = true;
    searchFieldset.appendChild(input);

    return searchFieldset;
  }

  async loadData(table) {
    const searchTermInput = document.getElementById(
      "simple-search-search-input"
    );
    if (!searchTermInput) {
      return;
    }
    const searchValue = SkiReport.sanitizeText(searchTermInput.value);
    if (!searchValue) {
      this.updateLoadingMessage("error", `ERROR: Need to enter a search value`);
      return;
    }
    try {
      const courseId = SkiReport.contextDetails.get("courseId");
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }

      this.updateLoadingMessage("info", "Getting pages...");
      const pages = await this.#getPages(courseId);

      this.updateLoadingMessage("info", "Getting announcements...");
      const announcements = await this.#getAnnouncements(courseId);

      this.updateLoadingMessage("info", "Getting discussions...");
      const discussions = await this.#getDiscussions(courseId);

      this.updateLoadingMessage("info", "Getting assignments...");
      const assignments = await this.#getAssignments(courseId);

      this.updateLoadingMessage("info", "Searching pages...");
      const extractedData = this.extractPageData(pages, searchValue);

      this.updateLoadingMessage("info", "Searching announcements...");
      extractedData.push(
        ...this.extractDiscussionData(announcements, searchValue)
      );

      this.updateLoadingMessage("info", "Searching discussions...");
      extractedData.push(
        ...this.extractDiscussionData(discussions, searchValue)
      );

      this.updateLoadingMessage("info", "Searching assignments...");
      extractedData.push(
        ...this.extractAssignmentData(assignments, searchValue)
      );

      this.updateLoadingMessage("info", "Adding data to table...");
      table.setTableBody(extractedData);
      this.updateLoadingMessage("success", `Finished loading data`);
    } catch (error) {
      console.error(error);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractPageData(pages, searchValue) {
    const data = [];
    for (const page of pages) {
      const pageTitle = page.title ?? "";
      const pageBody = page.body ?? "";
      const upperCaseSearchValue = searchValue.toUpperCase();
      if (
        !pageTitle.toUpperCase().includes(upperCaseSearchValue) &&
        !pageBody.toUpperCase().includes(upperCaseSearchValue)
      ) {
        continue;
      }

      const pageTitleLink = document.createElement("a");
      pageTitleLink.href = `/courses/${this.#currentCourseId}/pages/${
        page.url
      }`;
      pageTitleLink.target = "_blank";
      pageTitleLink.innerHTML = pageTitle.replace(
        new RegExp(searchValue, "gi"),
        (match, group) => {
          return `<mark>${match}</mark>`;
        }
      );

      const contentWrapper = document.createElement("div");
      contentWrapper.innerHTML = `
        ${
          pageBody
            ? pageBody.replace(
                new RegExp(searchValue, "gi"),
                (match, group) => {
                  return `<mark>${match}</mark>`;
                }
              )
            : ""
        }
      `;

      const htmlContentWrapper = document.createElement("div");
      htmlContentWrapper.innerHTML = `
        ${
          pageBody
            ? pageBody
                .replace(/(<([^>]+)>)/gi, (match, group) => {
                  return match.replace("<", "&lt;").replace(">", "&gt;");
                })
                .replace(new RegExp(searchValue, "gi"), (match, group) => {
                  return `<mark>${match}</mark>`;
                })
            : ""
        }
      `;

      const rowData = [
        new SkiTableDataConfig(page.page_id, undefined, "number"),
        new SkiTableDataConfig(page.html_url),
        new SkiTableDataConfig("PAGE"),
        new SkiTableDataConfig(pageTitleLink),
        new SkiTableDataConfig(contentWrapper),
        new SkiTableDataConfig(htmlContentWrapper),
      ];

      data.push(rowData);
    }
    return data;
  }

  extractDiscussionData(discussions, searchValue) {
    const data = [];
    for (const discussion of discussions) {
      const discussionTitle = discussion.title ?? "";
      const discussionTopic = discussion.message ?? "";
      const upperCaseSearchValue = searchValue.toUpperCase();
      if (
        !!discussion.assignment_id ||
        (!discussionTitle.toUpperCase().includes(upperCaseSearchValue) &&
          !discussionTopic.toUpperCase().includes(upperCaseSearchValue))
      ) {
        continue;
      }

      const discussionTitleLink = document.createElement("a");
      discussionTitleLink.href = discussion.html_url;
      discussionTitleLink.target = "_blank";
      discussionTitleLink.innerText = discussionTitle.replace(
        new RegExp(searchValue, "gi"),
        (match, group) => {
          return `<mark>${match}</mark>`;
        }
      );

      const contentWrapper = document.createElement("div");
      contentWrapper.innerHTML = `
        ${
          discussionTopic
            ? discussionTopic.replace(
                new RegExp(searchValue, "gi"),
                (match, group) => {
                  return `<mark>${match}</mark>`;
                }
              )
            : ""
        }
      `;

      const htmlContentWrapper = document.createElement("div");
      htmlContentWrapper.innerHTML = `
        ${
          discussionTopic
            ? discussionTopic
                .replace(/(<([^>]+)>)/gi, (match, group) => {
                  return match.replace("<", "&lt;").replace(">", "&gt;");
                })
                .replace(new RegExp(searchValue, "gi"), (match, group) => {
                  return `<mark>${match}</mark>`;
                })
            : ""
        }
      `;

      const rowData = [
        new SkiTableDataConfig(discussion.id, undefined, "number"),
        new SkiTableDataConfig(discussion.html_url),
        new SkiTableDataConfig(
          discussion.is_announcement ? "Announcement" : "Discussion"
        ),
        new SkiTableDataConfig(discussionTitleLink),
        new SkiTableDataConfig(contentWrapper),
        new SkiTableDataConfig(htmlContentWrapper),
      ];

      data.push(rowData);
    }
    return data;
  }

  extractAssignmentData(assignments, searchValue) {
    const data = [];
    for (const assignment of assignments) {
      const assignmentName = assignment.name ?? "";
      const assignmentDescription = assignment.description ?? "";
      const upperCaseSearchValue = searchValue.toUpperCase();
      if (
        !assignmentName.toUpperCase().includes(upperCaseSearchValue) &&
        !assignmentName.toUpperCase().includes(upperCaseSearchValue)
      ) {
        continue;
      }

      const assignmentNameLink = document.createElement("a");
      assignmentNameLink.href = assignment.html_url;
      assignmentNameLink.target = "_blank";
      assignmentNameLink.innerText = assignmentName.replace(
        new RegExp(searchValue, "gi"),
        (match, group) => {
          return `<mark>${match}</mark>`;
        }
      );

      const contentWrapper = document.createElement("div");
      contentWrapper.innerHTML = `
        ${
          assignmentDescription
            ? assignmentDescription.replace(
                new RegExp(searchValue, "gi"),
                (match, group) => {
                  return `<mark>${match}</mark>`;
                }
              )
            : ""
        }
      `;

      const htmlContentWrapper = document.createElement("div");
      htmlContentWrapper.innerHTML = `
        ${
          assignmentDescription
            ? assignmentDescription
                .replace(/(<([^>]+)>)/gi, (match, group) => {
                  return match.replace("<", "&lt;").replace(">", "&gt;");
                })
                .replace(new RegExp(searchValue, "gi"), (match, group) => {
                  return `<mark>${match}</mark>`;
                })
            : ""
        }
      `;

      const rowData = [
        new SkiTableDataConfig(assignment.id, undefined, "number"),
        new SkiTableDataConfig(assignment.html_url),
        new SkiTableDataConfig(
          `ASSIGNMENT - ${assignment.submission_types?.join("; ")}`
        ),
        new SkiTableDataConfig(assignmentNameLink),
        new SkiTableDataConfig(contentWrapper),
        new SkiTableDataConfig(htmlContentWrapper),
      ];

      data.push(rowData);
    }

    return data;
  }

  #getPages(courseId) {
    return SkiReport.memoizeRequest("pages", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/pages?include[]=body`,
        {}
      );
    });
  }

  #getAnnouncements(courseId) {
    return SkiReport.memoizeRequest("announcements", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/discussion_topics`,
        { only_announcements: true }
      );
    });
  }

  #getDiscussions(courseId) {
    return SkiReport.memoizeRequest("discussions", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/discussion_topics`,
        {}
      );
    });
  }

  #getAssignments(courseId) {
    return SkiReport.memoizeRequest("assignments", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/assignments`,
        { order_by: "due_at" }
      );
    });
  }
}
