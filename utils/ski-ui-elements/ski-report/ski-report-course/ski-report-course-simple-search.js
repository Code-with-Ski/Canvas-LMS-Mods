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

    // Search options
    const searchOptionsWrapper = this.createSearchOptions();
    formContainer.appendChild(searchOptionsWrapper);

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

  createSearchOptions() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("ski-simple-search-options");

    const fieldset = document.createElement("fieldset");
    fieldset.classList.add("ic-Fieldset", "ic-Fieldset--radio-checkbox");

    const legend = document.createElement("legend");
    legend.classList.add("ic-Legend");
    legend.innerText = `Course Content to Search`;
    fieldset.appendChild(legend);

    const checkboxesContainer = document.createElement("div");
    checkboxesContainer.style.marginBottom = "0.5rem";
    checkboxesContainer.classList.add(
      "ic-Checkbox-group",
      "ic-Checkbox-group--inline"
    );
    const optionSettings = [
      { name: "Syllabus (body)", value: "syllabus" },
      { name: "Pages (title and body)", value: "pages" },
      { name: "Assignments (title and body)", value: "assignments" },
      {
        name: "Discussion Topics (title and body)",
        value: "discussion-topics",
      },
      {
        name: "Announcement Topics (title and body)",
        value: "announcement-topics",
      },
      { name: "Files (name)", value: "files" },
      { name: "Module Items (name)", value: "module-items" },
    ];
    for (const settings of optionSettings) {
      const checkboxWrapper = document.createElement("div");
      checkboxWrapper.classList.add(
        "ic-Form-control",
        "ic-Form-control--checkbox"
      );
      checkboxWrapper.innerHTML = `
        <input type="checkbox" id='ski-simple-search-${settings.value}' value="${settings.value}" checked>
        <label class='ic-Label' for='ski-simple-search-${settings.value}'>${settings.name}</label>
      `;
      checkboxesContainer.appendChild(checkboxWrapper);
    }
    fieldset.appendChild(checkboxesContainer);

    const buttonSelectAll = document.createElement("button");
    buttonSelectAll.innerText = "Select All";
    buttonSelectAll.style.marginRight = "0.5rem";
    buttonSelectAll.classList.add("Button");
    buttonSelectAll.addEventListener("click", () => {
      const checkboxes = [...checkboxesContainer.querySelectorAll("input")];
      for (const checkbox of checkboxes) {
        checkbox.checked = true;
      }
    });

    const buttonSelectNone = document.createElement("button");
    buttonSelectNone.innerText = "Clear All";
    buttonSelectNone.classList.add("Button");
    buttonSelectNone.addEventListener("click", () => {
      const checkboxes = [...checkboxesContainer.querySelectorAll("input")];
      for (const checkbox of checkboxes) {
        checkbox.checked = false;
      }
    });

    fieldset.appendChild(buttonSelectAll);
    fieldset.appendChild(buttonSelectNone);
    wrapper.appendChild(fieldset);
    return wrapper;
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

    const selectedSearchOptionCheckboxes = [
      ...document.querySelectorAll(".ski-simple-search-options input:checked"),
    ];
    if (
      !selectedSearchOptionCheckboxes ||
      selectedSearchOptionCheckboxes.length == 0
    ) {
      this.updateLoadingMessage(
        "error",
        `ERROR: Need to select at least one search option`
      );
      return;
    }
    const searchOptions = [
      ...selectedSearchOptionCheckboxes.map((checkbox) => {
        return checkbox.value;
      }),
    ];

    try {
      const courseId = SkiReport.contextDetails.get("courseId");
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }

      const extractedData = [];

      if (searchOptions.includes("syllabus")) {
        this.updateLoadingMessage("info", "Getting syllabus...");
        const course = (
          await this.#getCourse(courseId, {
            "include[]": "syllabus_body",
          })
        )?.results;
        const syllabusBody = course?.syllabus_body ?? "";
        this.updateLoadingMessage("info", "Searching syllabus...");
        extractedData.push(
          ...this.extractSyllabusData(syllabusBody, searchValue)
        );
      }

      if (searchOptions.includes("pages")) {
        this.updateLoadingMessage("info", "Getting pages...");
        const pages = await this.#getPages(courseId);
        this.updateLoadingMessage("info", "Searching pages...");
        extractedData.push(...this.extractPageData(pages, searchValue));
      }

      if (searchOptions.includes("announcement-topics")) {
        this.updateLoadingMessage("info", "Getting announcements...");
        const announcements = await this.#getAnnouncements(courseId);
        this.updateLoadingMessage("info", "Searching announcements...");
        extractedData.push(
          ...this.extractDiscussionData(announcements, searchValue)
        );
      }

      if (searchOptions.includes("discussion-topics")) {
        this.updateLoadingMessage("info", "Getting discussions...");
        const discussions = await this.#getDiscussions(courseId);
        this.updateLoadingMessage("info", "Searching discussions...");
        extractedData.push(
          ...this.extractDiscussionData(discussions, searchValue)
        );
      }

      if (searchOptions.includes("assignments")) {
        this.updateLoadingMessage("info", "Getting assignments...");
        const assignments = await this.#getAssignments(courseId);
        this.updateLoadingMessage("info", "Searching assignments...");
        extractedData.push(
          ...this.extractAssignmentData(assignments, searchValue)
        );
      }

      if (searchOptions.includes("files")) {
        this.updateLoadingMessage("info", "Getting files...");
        const files = await this.#getFiles(courseId, {
          search_term: searchValue,
        });
        this.updateLoadingMessage("info", "Searching files...");
        extractedData.push(...this.extractFileData(files, searchValue));
      }

      if (searchOptions.includes("module-items")) {
        this.updateLoadingMessage("info", "Getting module items...");
        const modules = await this.#getModules(courseId, {
          "include[]": "items",
        });
        this.updateLoadingMessage("info", "Searching module items...");
        extractedData.push(...this.extractModuleItemData(modules, searchValue));
      }

      this.updateLoadingMessage("info", "Adding data to table...");
      table.setTableBody(extractedData);
      this.updateLoadingMessage("success", `Finished loading data`);
    } catch (error) {
      console.error(error);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractSyllabusData(syllabus, searchValue) {
    const upperCaseSearchValue = searchValue.toUpperCase();
    if (!syllabus.toUpperCase().includes(upperCaseSearchValue)) {
      return [];
    }

    const syllabusLink = document.createElement("a");
    syllabusLink.href = `/courses/${
      this.#currentCourseId
    }/assignments/syllabus`;
    syllabusLink.target = "_blank";
    syllabusLink.innerText = "Course Syllabus";

    const contentWrapper = document.createElement("div");
    contentWrapper.innerHTML = `
      ${
        syllabus
          ? syllabus.replace(new RegExp(searchValue, "gi"), (match, group) => {
              return `<mark>${match}</mark>`;
            })
          : ""
      }
    `;

    const htmlContentWrapper = document.createElement("div");
    htmlContentWrapper.innerHTML = `
      ${
        syllabus
          ? syllabus
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
      new SkiTableDataConfig("N/A"),
      new SkiTableDataConfig(syllabusLink.href),
      new SkiTableDataConfig("SYLLABUS"),
      new SkiTableDataConfig(syllabusLink),
      new SkiTableDataConfig(contentWrapper),
      new SkiTableDataConfig(htmlContentWrapper),
    ];

    return [rowData];
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
      discussionTitleLink.innerHTML = discussionTitle.replace(
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
        !assignmentDescription.toUpperCase().includes(upperCaseSearchValue)
      ) {
        continue;
      }

      const assignmentNameLink = document.createElement("a");
      assignmentNameLink.href = assignment.html_url;
      assignmentNameLink.target = "_blank";
      assignmentNameLink.innerHTML = assignmentName.replace(
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

  extractFileData(files, searchValue) {
    const data = [];
    for (const file of files) {
      const displayName = file.display_name ?? "";
      const fileName = file.filename ?? "";

      const downloadFileNameLink = document.createElement("a");
      downloadFileNameLink.href = file.url;
      downloadFileNameLink.title = `Download file: ${fileName}`;
      downloadFileNameLink.innerHTML = `Download: ${displayName.replace(
        new RegExp(searchValue, "gi"),
        (match, group) => {
          return `<mark>${match}</mark>`;
        }
      )}`;

      const previewFileNameLink = document.createElement("a");
      previewFileNameLink.href = `${file.url.split("?")[0]}?wrap=1`;
      previewFileNameLink.target = "_blank";
      previewFileNameLink.title = `Preview file: ${fileName}`;
      previewFileNameLink.innerHTML = displayName.replace(
        new RegExp(searchValue, "gi"),
        (match, group) => {
          return `<mark>${match}</mark>`;
        }
      );

      const rowData = [
        new SkiTableDataConfig(file.id, undefined, "number"),
        new SkiTableDataConfig(file.url),
        new SkiTableDataConfig(`FILE`),
        new SkiTableDataConfig(previewFileNameLink),
        new SkiTableDataConfig(downloadFileNameLink),
        new SkiTableDataConfig("N/A"),
      ];

      data.push(rowData);
    }

    return data;
  }

  extractModuleItemData(modules, searchValue) {
    const data = [];
    for (const module of modules) {
      const items = module?.items ?? [];
      for (const item of items) {
        const itemName = item.title ?? "";
        const upperCaseSearchValue = searchValue.toUpperCase();
        if (!itemName.toUpperCase().includes(upperCaseSearchValue)) {
          continue;
        }

        const itemNameLink = document.createElement("a");
        itemNameLink.href = item.html_url;
        itemNameLink.target = "_blank";
        itemNameLink.innerHTML = itemName.replace(
          new RegExp(searchValue, "gi"),
          (match, group) => {
            return `<mark>${match}</mark>`;
          }
        );

        const rowData = [
          new SkiTableDataConfig(item.id, undefined, "number"),
          new SkiTableDataConfig(item.html_url),
          new SkiTableDataConfig(`MODULE ITEM - ${item.type}`),
          new SkiTableDataConfig(itemNameLink),
          new SkiTableDataConfig("N/A"),
          new SkiTableDataConfig("N/A"),
        ];

        data.push(rowData);
      }
    }

    return data;
  }

  #getCourse(courseId, params = {}) {
    return SkiReport.memoizeRequest("course", () => {
      return SkiCanvasLmsApiCaller.getRequest(
        `/api/v1/courses/${courseId}`,
        params
      );
    });
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

  #getFiles(courseId, params = {}) {
    return SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${courseId}/files`,
      params
    );
  }

  #getModules(courseId, params = {}) {
    return SkiReport.memoizeRequest("modules", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/modules`,
        params
      );
    });
  }
}
