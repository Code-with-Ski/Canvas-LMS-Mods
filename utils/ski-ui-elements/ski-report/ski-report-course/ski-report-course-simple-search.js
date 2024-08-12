class SkiReportCourseSimpleSearch extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];

  constructor() {
    super("Simple Search");
  }

  createTable() {
    const reportContext = SkiReport.contextDetails.get("reportContext");
    const headingConfigs = [];
    if (reportContext == "all-courses") {
      headingConfigs.push(
        ...[
          new SkiTableHeadingConfig("Canvas Course ID", true, true),
          new SkiTableHeadingConfig("Course Name", true),
          new SkiTableHeadingConfig("Course Code", true, true),
          new SkiTableHeadingConfig("SIS Course ID", true, true),
        ]
      );
    }
    headingConfigs.push(
      ...[
        new SkiTableHeadingConfig("Item ID", true, true),
        new SkiTableHeadingConfig("URL", true, true),
        new SkiTableHeadingConfig("Item Type"),
        new SkiTableHeadingConfig("Title"),
        new SkiTableHeadingConfig("Content", false),
        new SkiTableHeadingConfig("HTML Content", false, true),
      ]
    );
    const table = new SkiTable(
      "simple-search-results",
      new SkiTableConfig("400px"),
      headingConfigs,
      []
    );

    return table;
  }

  addFormElements(table, formContainer) {
    // Search input
    const searchFieldset = this.createSearchFieldset();
    formContainer.appendChild(searchFieldset);

    // Enrollment Options for All Courses report
    const reportContext = SkiReport.contextDetails.get("reportContext");
    if (reportContext == "all-courses") {
      const enrollmentOptionsWrapper = this.createEnrollmentOptions();
      formContainer.appendChild(enrollmentOptionsWrapper);
    }

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

  createEnrollmentOptions() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("ski-simple-search-enrollment-options");

    const fieldset = document.createElement("fieldset");
    fieldset.classList.add("ic-Fieldset", "ic-Fieldset--radio-checkbox");

    const legend = document.createElement("legend");
    legend.classList.add("ic-Legend");
    legend.innerText = `Course Enrollments to Search`;
    fieldset.appendChild(legend);

    const message = document.createElement("p");
    message.innerHTML = `
      <em>*Note:</em>This will only search courses that are shown on the All Courses list. Using the column filters will focus the Simple Search on only the courses still showing.
    `;
    fieldset.appendChild(message);

    const checkboxesContainer = document.createElement("div");
    checkboxesContainer.style.marginBottom = "0.5rem";
    checkboxesContainer.classList.add(
      "ic-Checkbox-group",
      "ic-Checkbox-group--inline"
    );
    const optionSettings = [
      { name: "Current", value: "current" },
      { name: "Past", value: "past" },
      { name: "Future", value: "future" },
    ];
    for (const settings of optionSettings) {
      const checkboxWrapper = document.createElement("div");
      checkboxWrapper.classList.add(
        "ic-Form-control",
        "ic-Form-control--checkbox"
      );
      checkboxWrapper.innerHTML = `
        <input type="checkbox" id='ski-simple-search-enrollment-${settings.value}' value="${settings.value}" checked>
        <label class='ic-Label' for='ski-simple-search-enrollment-${settings.value}'>${settings.name}</label>
      `;
      checkboxesContainer.appendChild(checkboxWrapper);
    }

    fieldset.appendChild(checkboxesContainer);
    wrapper.appendChild(fieldset);

    return wrapper;
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

    const enrollmentOptions = [];
    const reportContext = SkiReport.contextDetails.get("reportContext");
    if (reportContext == "all-courses") {
      const selectedEnrollmentOptionCheckboxes = [
        ...document.querySelectorAll(
          ".ski-simple-search-enrollment-options input:checked"
        ),
      ];
      if (
        !selectedEnrollmentOptionCheckboxes ||
        selectedEnrollmentOptionCheckboxes.length == 0
      ) {
        this.updateLoadingMessage(
          "error",
          `ERROR: Need to select at least one course enrollment state option`
        );
        return;
      }
      enrollmentOptions.push(
        ...selectedEnrollmentOptionCheckboxes.map((checkbox) => {
          return checkbox.value;
        })
      );
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
      const extractedData = [];
      const courseIds = [];
      if (reportContext == "all-courses") {
        courseIds.push(...this.#getVisibleCourseIds(enrollmentOptions));
      } else {
        const courseId = SkiReport.contextDetails.get("courseId");
        if (!courseId) {
          throw "Course ID not set in SkiReport";
        }
        courseIds.push(courseId);
      }

      let currentCourse = 0;
      const TOTAL_COURSES = courseIds.length;
      for (const courseId of courseIds) {
        currentCourse++;
        this.updateLoadingMessage(
          "info",
          `Getting course (Course ${currentCourse} of ${TOTAL_COURSES})...`
        );
        const course = (
          await this.#getCourse(courseId, {
            "include[]": "syllabus_body",
          })
        )?.results;

        if (searchOptions.includes("syllabus")) {
          this.updateLoadingMessage(
            "info",
            `Getting syllabus (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          const syllabusBody = course?.syllabus_body ?? "";
          this.updateLoadingMessage(
            "info",
            `Searching syllabus (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          extractedData.push(
            ...this.extractData(syllabusBody, "syllabus", searchValue, course)
          );
        }

        if (searchOptions.includes("pages")) {
          this.updateLoadingMessage(
            "info",
            `Getting pages (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          const pages = await this.#getPages(courseId, {
            "include[]": "body",
            per_page: 100,
          });
          this.updateLoadingMessage(
            "info",
            `Searching pages (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          extractedData.push(
            ...this.extractData(pages, "pages", searchValue, course)
          );
        }

        if (searchOptions.includes("announcement-topics")) {
          this.updateLoadingMessage(
            "info",
            `Getting announcements (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          const announcements = await this.#getDiscussions(courseId, {
            only_announcements: true,
            per_page: 100,
          });
          this.updateLoadingMessage(
            "info",
            `Searching announcements (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          extractedData.push(
            ...this.extractData(
              announcements,
              "announcement-topics",
              searchValue,
              course
            )
          );
        }

        if (searchOptions.includes("discussion-topics")) {
          this.updateLoadingMessage(
            "info",
            `Getting discussions (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          const discussions = await this.#getDiscussions(courseId, {
            per_page: 100,
          });
          this.updateLoadingMessage(
            "info",
            `Searching discussions (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          extractedData.push(
            ...this.extractData(
              discussions,
              "discussion-topics",
              searchValue,
              course
            )
          );
        }

        if (searchOptions.includes("assignments")) {
          this.updateLoadingMessage(
            "info",
            `Getting assignments (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          const assignments = await this.#getAssignments(courseId, {
            per_page: 100,
          });
          this.updateLoadingMessage(
            "info",
            `Searching assignments (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          extractedData.push(
            ...this.extractData(assignments, "assignments", searchValue, course)
          );
        }

        if (searchOptions.includes("files")) {
          this.updateLoadingMessage(
            "info",
            `Getting files (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          const files = await this.#getFiles(courseId, {
            search_term: searchValue,
            per_page: 100,
          });
          this.updateLoadingMessage(
            "info",
            `Searching files (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          extractedData.push(
            ...this.extractData(files, "files", searchValue, course)
          );
        }

        if (searchOptions.includes("module-items")) {
          this.updateLoadingMessage(
            "info",
            `Getting module items (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          const modules = await this.#getModules(courseId, {
            "include[]": "items",
            per_page: 100,
          });
          this.updateLoadingMessage(
            "info",
            `Searching module items (Course ${currentCourse} of ${TOTAL_COURSES})...`
          );
          for (const module of modules) {
            const moduleItems = module.items ?? [];
            extractedData.push(
              ...this.extractData(
                moduleItems,
                "module-items",
                searchValue,
                course
              )
            );
          }
        }
      }

      this.updateLoadingMessage("info", "Adding data to table...");
      table.setTableBody(extractedData);
      this.updateLoadingMessage("success", `Finished loading data`);
    } catch (error) {
      console.error(error);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  #getVisibleCourseIds(enrollmentOptions) {
    const courseRows = [];
    if (enrollmentOptions.includes("current")) {
      const currentCourseRows = [
        ...document.querySelectorAll(
          "#my_courses_table tr.course-list-table-row"
        ),
      ];
      courseRows.push(...currentCourseRows);
    }
    if (enrollmentOptions.includes("past")) {
      const pastCourseRows = [
        ...document.querySelectorAll(
          "#past_enrollments_table tr.course-list-table-row"
        ),
      ];
      courseRows.push(...pastCourseRows);
    }
    if (enrollmentOptions.includes("future")) {
      const futureCourseRows = [
        ...document.querySelectorAll(
          "#future_enrollments_table tr.course-list-table-row"
        ),
      ];
      courseRows.push(...futureCourseRows);
    }

    const visibleCourseRows = [
      ...courseRows.filter((row) => {
        return row.style.display != "none";
      }),
    ];

    const courseIds = [
      ...visibleCourseRows.map((row) => {
        return row
          .querySelector(".course-list-course-title-column a")
          ?.href?.split("/")
          ?.pop();
      }),
    ];

    // User may have multiple enrollments in the same course
    const uniqueCourseIds = Array.from(new Set(courseIds));

    return uniqueCourseIds;
  }

  #isFound(text, searchValue, ignoreCase = true) {
    if (ignoreCase) {
      text = text.toUpperCase();
      searchValue = searchValue.toUpperCase();
    }
    return text.includes(searchValue);
  }

  #highlightMatches(content, searchValue, encodeHTMLTags = false) {
    if (!content) {
      return "";
    }

    if (encodeHTMLTags) {
      content = content.replace(/(<([^>]+)>)/gi, (match, group) => {
        return match.replace("<", "&lt;").replace(">", "&gt;");
      });
    }

    /* 
      This regular expressions tries to ensure there isn't an 
      unclosed HTML tag before the search value. Adding the 
      mark element within an HTML tag will usually cause 
      errors with the HTML output
    */
    const highlightedContent = content.replace(
      new RegExp(`(?<!<[A-Za-z\\/][^>]+)${searchValue}`, "gi"),
      (match, group) => {
        return `<mark>${match}</mark>`;
      }
    );

    return highlightedContent;
  }

  #createAnchor(url, text, newTab = true) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.innerHTML = text;
    if (newTab) {
      anchor.target = "_blank";
    }
    return anchor;
  }

  #createContentWrapper(content, searchValue, isHTMLEncodedContent = false) {
    let contentWrapper = document.createElement("div");
    contentWrapper.innerHTML = this.#highlightMatches(
      content,
      searchValue,
      isHTMLEncodedContent
    );
    contentWrapper = this.#addExpandCollapseWrapper(contentWrapper);

    if (isHTMLEncodedContent) {
      contentWrapper.style.minWidth = "300px";
      contentWrapper.style.maxWidth = "500px";
      contentWrapper.style.wordBreak = "break-word";
    }

    return contentWrapper;
  }

  extractData(content, contentType, searchValue, course) {
    const data = [];

    const reportContext = SkiReport.contextDetails.get("reportContext");
    if (contentType == "syllabus") {
      const extractedData = this.extractSyllabusData(content, searchValue);
      if (extractedData) {
        if (reportContext == "all-courses") {
          extractedData.unshift(...this.extractCourseData(course));
        }
        data.push(extractedData);
      }
      return data;
    }

    if (!Array.isArray(content)) {
      console.warn(`WARNING: Unexpected content to search - ${content}`);
      return data;
    }
    for (const item of content) {
      let extractedData;
      if (contentType == "pages") {
        extractedData = this.extractPageData(item, searchValue);
      } else if (contentType == "announcement-topics") {
        extractedData = this.extractDiscussionData(item, searchValue);
      } else if (contentType == "discussion-topics") {
        extractedData = this.extractDiscussionData(item, searchValue);
      } else if (contentType == "assignments") {
        extractedData = this.extractAssignmentData(item, searchValue);
      } else if (contentType == "files") {
        extractedData = this.extractFileData(item, searchValue);
      } else if (contentType == "module-items") {
        extractedData = this.extractModuleItemData(item, searchValue);
      }

      if (extractedData) {
        if (reportContext == "all-courses") {
          extractedData.unshift(...this.extractCourseData(course));
        }
        data.push(extractedData);
      }
    }

    return data;
  }

  extractCourseData(course) {
    const courseNameLink = document.createElement("a");
    courseNameLink.href = `/courses/${course.id}`;
    courseNameLink.target = "_blank";
    courseNameLink.innerText = course.name;

    const data = [
      new SkiTableDataConfig(course.id, undefined, "number"),
      new SkiTableDataConfig(courseNameLink),
      new SkiTableDataConfig(course.course_code),
      new SkiTableDataConfig(course.sis_course_id),
    ];

    return data;
  }

  extractSyllabusData(syllabus, searchValue) {
    if (!this.#isFound(syllabus, searchValue)) {
      return;
    }

    const syllabusLink = this.#createAnchor(
      `/courses/${this.#currentCourseId}/assignments/syllabus`,
      "Course Syllabus"
    );

    const contentWrapper = this.#createContentWrapper(syllabus, searchValue);
    const htmlContentWrapper = this.#createContentWrapper(
      syllabus,
      searchValue,
      true
    );

    const rowData = [
      new SkiTableDataConfig("N/A"),
      new SkiTableDataConfig(syllabusLink.href),
      new SkiTableDataConfig("SYLLABUS"),
      new SkiTableDataConfig(syllabusLink),
      new SkiTableDataConfig(contentWrapper),
      new SkiTableDataConfig(htmlContentWrapper),
    ];

    return rowData;
  }

  extractPageData(page, searchValue) {
    const pageTitle = page.title ?? "";
    const pageBody = page.body ?? "";
    if (
      !this.#isFound(pageTitle, searchValue) &&
      !this.#isFound(pageBody, searchValue)
    ) {
      return;
    }

    const pageTitleLink = this.#createAnchor(
      page.html_url,
      this.#highlightMatches(pageTitle, searchValue)
    );

    const contentWrapper = this.#createContentWrapper(pageBody, searchValue);
    const htmlContentWrapper = this.#createContentWrapper(
      pageBody,
      searchValue,
      true
    );

    const rowData = [
      new SkiTableDataConfig(page.page_id, undefined, "number"),
      new SkiTableDataConfig(page.html_url),
      new SkiTableDataConfig("PAGE"),
      new SkiTableDataConfig(pageTitleLink),
      new SkiTableDataConfig(contentWrapper),
      new SkiTableDataConfig(htmlContentWrapper),
    ];

    return rowData;
  }

  extractDiscussionData(discussion, searchValue) {
    const discussionTitle = discussion.title ?? "";
    const discussionTopic = discussion.message ?? "";
    if (
      !this.#isFound(discussionTitle, searchValue) &&
      !this.#isFound(discussionTitle, searchValue)
    ) {
      return;
    }

    const discussionTitleLink = this.#createAnchor(
      discussion.html_url,
      this.#highlightMatches(discussionTitle, searchValue)
    );

    const contentWrapper = this.#createContentWrapper(
      discussionTopic,
      searchValue
    );
    const htmlContentWrapper = this.#createContentWrapper(
      discussionTopic,
      searchValue,
      true
    );

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

    return rowData;
  }

  extractAssignmentData(assignment, searchValue) {
    const assignmentName = assignment.name ?? "";
    const assignmentDescription = assignment.description ?? "";
    if (
      !this.#isFound(assignmentName, searchValue) &&
      !this.#isFound(assignmentDescription, searchValue)
    ) {
      return;
    }

    const assignmentNameLink = this.#createAnchor(
      assignment.html_url,
      this.#highlightMatches(assignmentName, searchValue)
    );

    const contentWrapper = this.#createContentWrapper(
      assignmentDescription,
      searchValue
    );
    const htmlContentWrapper = this.#createContentWrapper(
      assignmentDescription,
      searchValue,
      true
    );

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

    return rowData;
  }

  extractFileData(file, searchValue) {
    const displayName = file.display_name ?? "";
    const fileName = file.filename ?? "";

    const downloadFileNameLink = this.#createAnchor(
      file.url,
      `Download: ${this.#highlightMatches(displayName, searchValue)}`
    );
    downloadFileNameLink.title = `Download file: ${fileName}`;

    const previewFileNameLink = this.#createAnchor(
      `${file.url.split("?")[0]}?wrap=1`,
      `Preview file: ${this.#highlightMatches(displayName, searchValue)}`
    );
    previewFileNameLink.title = `Preview file: ${fileName}`;

    const rowData = [
      new SkiTableDataConfig(file.id, undefined, "number"),
      new SkiTableDataConfig(file.url),
      new SkiTableDataConfig(`FILE`),
      new SkiTableDataConfig(previewFileNameLink),
      new SkiTableDataConfig(downloadFileNameLink),
      new SkiTableDataConfig("N/A"),
    ];

    return rowData;
  }

  extractModuleItemData(item, searchValue) {
    const itemName = item.title ?? "";
    if (!this.#isFound(itemName, searchValue)) {
      return;
    }

    const itemNameLink = this.#createAnchor(
      item.html_url,
      this.#highlightMatches(itemName, searchValue)
    );

    const rowData = [
      new SkiTableDataConfig(item.id, undefined, "number"),
      new SkiTableDataConfig(item.html_url),
      new SkiTableDataConfig(`MODULE ITEM - ${item.type}`),
      new SkiTableDataConfig(itemNameLink),
      new SkiTableDataConfig("N/A"),
      new SkiTableDataConfig("N/A"),
    ];

    return rowData;
  }

  #addExpandCollapseWrapper(contentDiv) {
    const wrapper = document.createElement("div");

    contentDiv.classList.add("ski-line-clamp");

    const expandCollapseButton = document.createElement("button");
    expandCollapseButton.classList.add(
      "ski-show-more",
      "ski-expand-collapse-button"
    );
    expandCollapseButton.title = "Show more";
    expandCollapseButton.innerHTML = `<i class="icon-arrow-open-down"></i>`;
    expandCollapseButton.addEventListener("click", () => {
      if (expandCollapseButton.classList.contains("ski-show-more")) {
        expandCollapseButton.title = "Show less";
        expandCollapseButton.innerHTML = `<i class="icon-arrow-open-up"></i>`;
        expandCollapseButton.classList.remove("ski-show-more");
      } else {
        expandCollapseButton.title = "Show more";
        expandCollapseButton.innerHTML = `<i class="icon-arrow-open-down"></i>`;
        expandCollapseButton.classList.add("ski-show-more");
      }
      contentDiv.classList.toggle("ski-line-clamp");
    });

    // Handle hiding the expand/collapse button if the content is fully showing
    this.#updateExpandCollapseButtonVisibility(
      expandCollapseButton,
      contentDiv
    );
    new ResizeObserver(() => {
      this.#updateExpandCollapseButtonVisibility(
        expandCollapseButton,
        contentDiv
      );
    }).observe(contentDiv);

    wrapper.appendChild(contentDiv);
    wrapper.appendChild(expandCollapseButton);

    return wrapper;
  }

  #updateExpandCollapseButtonVisibility(button, contentDiv) {
    if (contentDiv.scrollHeight > contentDiv.clientHeight) {
      button.style.display = "";
    } else {
      if (contentDiv.classList.contains("ski-line-clamp")) {
        button.style.display = "none";
      }
    }
  }

  #getCourse(courseId, params = {}) {
    const reportContext = SkiReport.contextDetails.get("reportContext");
    if (reportContext == "course") {
      return SkiReport.memoizeRequest("course", () => {
        return SkiCanvasLmsApiCaller.getRequest(
          `/api/v1/courses/${courseId}`,
          params
        );
      });
    } else {
      return SkiCanvasLmsApiCaller.getRequest(
        `/api/v1/courses/${courseId}`,
        params
      );
    }
  }

  #getPages(courseId, params = {}) {
    const reportContext = SkiReport.contextDetails.get("reportContext");
    if (reportContext == "course") {
      return SkiReport.memoizeRequest("pages", () => {
        return SkiCanvasLmsApiCaller.getRequestAllPages(
          `/api/v1/courses/${courseId}/pages`,
          params
        );
      });
    } else {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/pages`,
        params
      );
    }
  }

  #getDiscussions(courseId, params = {}) {
    const reportContext = SkiReport.contextDetails.get("reportContext");
    if (reportContext == "course") {
      return SkiReport.memoizeRequest("discussions", () => {
        return SkiCanvasLmsApiCaller.getRequestAllPages(
          `/api/v1/courses/${courseId}/discussion_topics`,
          params
        );
      });
    } else {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/discussion_topics`,
        params
      );
    }
  }

  #getAssignments(courseId, params = {}) {
    const reportContext = SkiReport.contextDetails.get("reportContext");
    if (reportContext == "course") {
      return SkiReport.memoizeRequest("assignments", () => {
        return SkiCanvasLmsApiCaller.getRequestAllPages(
          `/api/v1/courses/${courseId}/assignments`,
          params
        );
      });
    } else {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/assignments`,
        params
      );
    }
  }

  #getFiles(courseId, params = {}) {
    return SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${courseId}/files`,
      params
    );
  }

  #getModules(courseId, params = {}) {
    const reportContext = SkiReport.contextDetails.get("reportContext");
    if (reportContext == "course") {
      return SkiReport.memoizeRequest("modules", () => {
        return SkiCanvasLmsApiCaller.getRequestAllPages(
          `/api/v1/courses/${courseId}/modules`,
          params
        );
      });
    } else {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/modules`,
        params
      );
    }
  }
}
