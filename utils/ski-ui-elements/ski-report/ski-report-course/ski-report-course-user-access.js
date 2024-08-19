class SkiReportCourseUserAccess extends SkiReport {
  constructor() {
    super("User Access Report");
    this.addUserOptions();
  }

  createTable() {
    const table = new SkiTable(
      "user-access",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Asset Access ID", true, true),
        new SkiTableHeadingConfig("Asset Code", true, true),
        new SkiTableHeadingConfig("Asset Group Code", true, true),
        new SkiTableHeadingConfig("Asset Category", true, true),
        new SkiTableHeadingConfig("Asset Class Name", true, true),
        new SkiTableHeadingConfig("User ID", true, true),
        new SkiTableHeadingConfig("User Name"),
        new SkiTableHeadingConfig("Membership Type"),
        new SkiTableHeadingConfig("Context ID", true, true),
        new SkiTableHeadingConfig("Context Type"),
        new SkiTableHeadingConfig("Content Name"),
        new SkiTableHeadingConfig("Content Display Name", true, true),
        new SkiTableHeadingConfig("Last Access"),
        new SkiTableHeadingConfig("First Access"),
        new SkiTableHeadingConfig("Updated At", true, true),
        new SkiTableHeadingConfig("Times Viewed"),
        new SkiTableHeadingConfig("Times Participated"),
        new SkiTableHeadingConfig("Action Level", true, true),
      ],
      []
    );

    return table;
  }

  addFormElements(table, formContainer) {
    // User Selection
    const userSelection = this.createUserSelection();
    formContainer.appendChild(userSelection);

    // Adds Load All button
    super.addFormElements(table, formContainer);
  }

  createUserSelection() {
    const userSelectionFieldset = document.createElement("fieldset");
    userSelectionFieldset.classList.add("ski-ui");

    const label = document.createElement("label");
    label.innerText = "Select user(s) for which to check access history:";
    label.setAttribute("for", `user-access-report-user-select`);
    userSelectionFieldset.appendChild(label);

    const userSelect = document.createElement("select");
    userSelect.classList.add("ski-ui", "ski-user-select");
    userSelect.id = "user-access-report-user-select";

    const defaultAllOption = document.createElement("option");
    defaultAllOption.value = "";
    defaultAllOption.text = "All";
    defaultAllOption.selected = true;
    userSelect.appendChild(defaultAllOption);

    const activeOption = document.createElement("option");
    activeOption.value = "active";
    activeOption.text = "All Active";
    activeOption.selected = true;
    userSelect.appendChild(activeOption);

    const inactiveOption = document.createElement("option");
    inactiveOption.value = "inactive";
    inactiveOption.text = "All Inactive";
    userSelect.appendChild(inactiveOption);

    const concludedOption = document.createElement("option");
    concludedOption.value = "concluded";
    concludedOption.text = "All Concluded";
    userSelect.appendChild(concludedOption);

    userSelectionFieldset.appendChild(userSelect);

    return userSelectionFieldset;
  }

  async addUserOptions() {
    const userSelect = this.getReportContainer().querySelector(
      "#user-access-report-user-select"
    );
    if (!userSelect) {
      return;
    }
    const activeGroup = document.createElement("optgroup");
    activeGroup.label = "Active Users";
    activeGroup.classList.add("ski-optgroup-users-active");
    const inactiveGroup = document.createElement("optgroup");
    inactiveGroup.label = "Inactive Users";
    inactiveGroup.classList.add("ski-optgroup-users-inactive");
    const concludedGroup = document.createElement("optgroup");
    concludedGroup.label = "Concluded Users";
    concludedGroup.classList.add("ski-optgroup-users-concluded");

    const courseId = SkiReport.contextDetails.get("courseId");
    const context = SkiReport.contextDetails.get("reportContext");
    const sectionId = SkiReport.contextDetails.get("sectionId");
    const contextId = SkiReport.contextDetails.get("contextId");
    if (!courseId) {
      throw "Course ID not set in SkiReport";
    }

    const enrollmentStates = ["active", "inactive", "concluded"];
    for (const state of enrollmentStates) {
      const enrollments = await this.#getEnrollments(context, contextId, state);
      enrollments.sort((enrollmentA, enrollmentB) => {
        const shortNameA = enrollmentA?.user?.short_name ?? "";
        const shortNameB = enrollmentB?.user?.short_name ?? "";
        return shortNameA.localeCompare(shortNameB);
      });

      let optGroup = activeGroup;
      if (state == "inactive") {
        optGroup = inactiveGroup;
      } else if (state == "concluded") {
        optGroup = concludedGroup;
      }
      for (const enrollment of enrollments) {
        const option = document.createElement("option");
        option.value = enrollment.user_id;
        option.text = `${enrollment?.user?.short_name ?? "Unknown"} *(ID: ${
          enrollment.user_id
        })`;
        optGroup.appendChild(option);
      }
      userSelect.appendChild(optGroup);
    }
  }

  async loadData(table, formContainer) {
    this.updateLoadingMessage("clear");
    try {
      const courseId = SkiReport.contextDetails.get("courseId");
      const context = SkiReport.contextDetails.get("reportContext");
      const sectionId = SkiReport.contextDetails.get("sectionId");
      const contextId = SkiReport.contextDetails.get("contextId");
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }

      this.updateLoadingMessage("info", "Getting selected option", true);
      const userSelect = formContainer.querySelector(".ski-user-select");
      const selectedUserId = userSelect?.value;

      const users = {};
      const enrollmentStates = ["active", "inactive", "concluded"];
      if (!selectedUserId) {
        for (const state of enrollmentStates) {
          const enrollments = await this.#getEnrollments(
            context,
            contextId,
            state
          );
          if (!enrollments) {
            this.updateLoadingMessage(
              "error",
              `ERROR: Failed to get ${state} enrollments`,
              true
            );
            continue;
          }
          for (const enrollment of enrollments) {
            users[enrollment.user_id] = enrollment?.user?.short_name;
          }
        }
      } else if (enrollmentStates.includes(selectedUserId)) {
        const enrollments = await this.#getEnrollments(
          context,
          contextId,
          selectedUserId
        );
        if (!enrollments) {
          this.updateLoadingMessage(
            "error",
            `ERROR: Failed to get ${selectedUserId} enrollments`,
            true
          );
        } else {
          for (const enrollment of enrollments) {
            users[enrollment.user_id] = enrollment?.user?.short_name;
          }
        }
      } else {
        const selectedOption = userSelect.options[userSelect.selectedIndex];
        users[selectedOption.value] =
          selectedOption.innerText.split(" *(ID")[0];
      }

      const userIds = Object.keys(users);
      const accessData = [];
      const numOfUsers = userIds.length;
      for (let i = 0; i < numOfUsers; i++) {
        const userId = userIds[i];
        this.updateLoadingMessage(
          "info",
          `Getting access history of user [ID: ${userId}] (${
            i + 1
          } of ${numOfUsers})...`,
          true
        );
        const accessHistory = await SkiCanvasLmsApiCaller.getRequestAllPages(
          `/courses/${courseId}/users/${userId}/usage.json`
        );
        if (!accessHistory) {
          this.updateLoadingMessage(
            "error",
            `ERROR: Failed to get access history of user [ID: ${userId}]`,
            true
          );
          continue;
        }
        accessData.push(...accessHistory);
      }

      this.updateLoadingMessage("info", "Formatting data for table...", true);
      const extractedData = this.extractData(accessData, users);

      this.updateLoadingMessage("info", "Setting table data...", true);
      table.setTableBody(extractedData);

      this.updateLoadingMessage("success", "Finished loading data", true);
    } catch (error) {
      console.error(`Error: ${error}\n\nStack Trace: ${error.stack}`);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(assetAccessData, users) {
    const courseId = SkiReport.contextDetails.get("courseId");
    if (!courseId) {
      throw "Course ID not set in SkiReport";
    }

    const data = [];
    for (const assetUserAccess of assetAccessData) {
      const userAccessData = assetUserAccess.asset_user_access;

      const studentName = users.hasOwnProperty(userAccessData.user_id)
        ? users[userAccessData.user_id]
        : "Unknown";
      let studentNameLink = document.createElement("a");
      studentNameLink.href = `/courses/${courseId}/users/${userAccessData.user_id}`;
      studentNameLink.target = "_blank";
      studentNameLink.innerText = studentName;

      let lastAccessDate = userAccessData.last_access;
      let lastAccessDateIso = "";
      if (!lastAccessDate) {
        lastAccessDate = "None";
      } else {
        lastAccessDateIso = new Date(lastAccessDate).toISOString();
        lastAccessDate = new Date(lastAccessDate).toLocaleString();
      }

      let createdAtDate = userAccessData.created_at;
      let createdAtDateIso = "";
      if (!createdAtDate) {
        createdAtDate = "None";
      } else {
        createdAtDateIso = new Date(createdAtDate).toISOString();
        createdAtDate = new Date(createdAtDate).toLocaleString();
      }

      let updatedAtDate = userAccessData.created_at;
      let updatedAtDateIso = "";
      if (!updatedAtDate) {
        updatedAtDate = "None";
      } else {
        updatedAtDateIso = new Date(updatedAtDate).toISOString();
        updatedAtDate = new Date(updatedAtDate).toLocaleString();
      }

      const contentName = document.createElement("span");
      let url = `/courses/${courseId}`;
      const assetCode = userAccessData.asset_code;
      const assetCategory = userAccessData.asset_category;
      if (assetCategory != "home") {
        if (assetCategory == "syllabus") {
          url = `${url}/assignments/syllabus`;
        } else if (assetCategory == "wiki") {
          url = `${url}/pages/${assetCode.split("_").pop()}`;
        } else if (assetCode.includes(":")) {
          const splitAssetCode = assetCode.split(":");
          const splitContext = splitAssetCode.pop().split("_");
          const assetId = splitContext.pop();
          if (splitContext[0] == "course") {
            if (splitAssetCode[0] == "topics") {
              url = `${url}/discussion_topics`;
            } else if (splitAssetCode[0] == "speed_grader") {
              url = `${url}/grades`;
            } else if (assetCategory == "roster") {
              url = `${url}/users`;
            } else {
              url = `${url}/${splitAssetCode[0]}`;
            }
          } else {
            url = `${url}/${splitAssetCode[0]}/${assetId}`;
          }
        } else {
          const splitAssetCode = assetCode.split("_");
          const assetId = splitAssetCode.pop();
          if (splitAssetCode[0] == "enrollment") {
            url = `#`;
          } else if (assetCategory == "topics") {
            url = `${url}/discussion_topics/${assetId}`;
          } else {
            url = `${url}/${assetCategory}/${assetId}`;
          }
        }
      }
      if (url == "#") {
        contentName.innerHTML = `<i class='icon-line ${userAccessData.icon}'></i> ${userAccessData.readable_name}`;
      } else {
        let readableName = userAccessData.readable_name;
        if (readableName == "" && assetCategory == "outcomes") {
          readableName = assetCode.replaceAll("_", " ");
        }
        contentName.innerHTML = `<a href=${url} target="_blank"><i class='icon-line ${userAccessData.icon}'></i> ${readableName}</a>`;
      }

      const rowData = [
        new SkiTableDataConfig(userAccessData.id, undefined, "number"),
        new SkiTableDataConfig(assetCode),
        new SkiTableDataConfig(userAccessData.asset_group_code),
        new SkiTableDataConfig(assetCategory),
        new SkiTableDataConfig(userAccessData.asset_class_name),
        new SkiTableDataConfig(userAccessData.user_id, undefined, "number"),
        new SkiTableDataConfig(studentNameLink),
        new SkiTableDataConfig(userAccessData.membership_type),
        new SkiTableDataConfig(userAccessData.context_id, undefined, "number"),
        new SkiTableDataConfig(userAccessData.context_type),
        new SkiTableDataConfig(contentName),
        new SkiTableDataConfig(userAccessData.display_name),
        new SkiTableDataConfig(
          lastAccessDate,
          lastAccessDateIso,
          "dateISO",
          lastAccessDateIso
        ),
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
        new SkiTableDataConfig(userAccessData.view_score, undefined, "number"),
        new SkiTableDataConfig(
          userAccessData.participate_score,
          undefined,
          "number"
        ),
        new SkiTableDataConfig(userAccessData.action_level),
      ];

      data.push(rowData);
    }
    return data;
  }

  #getEnrollments(context, contextId, state) {
    return SkiReport.memoizeRequest(`enrollments-${state}`, () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/${context}/${contextId}/enrollments`,
        {
          per_page: 100,
          "state[]": state,
        }
      );
    });
  }
}
