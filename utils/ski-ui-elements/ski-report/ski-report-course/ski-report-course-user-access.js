class SkiReportCourseUserAccess extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];
  #isSectionReport = window.location.pathname.includes("/sections/");
  #currentSectionId;

  constructor() {
    super("User Access Report");
    if (this.#isSectionReport) {
      this.#currentSectionId = window.location.pathname
        .split("?")[0]
        .split("/")[4];
    }
  }

  createTable() {
    const table = new SkiTable(
      "user-access",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Assest Access ID", true, true),
        new SkiTableHeadingConfig("Assest Code", true, true),
        new SkiTableHeadingConfig("Assest Group Code", true, true),
        new SkiTableHeadingConfig("Assest Category", true, true),
        new SkiTableHeadingConfig("Assest Class Name", true, true),
        new SkiTableHeadingConfig("User ID", true, true),
        new SkiTableHeadingConfig("Student Name"),
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
    label.innerText = "Select user(s) for which to check the grade history:";
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

    const deletedOption = document.createElement("option");
    deletedOption.value = "deleted";
    deletedOption.text = "All Deleted";
    userSelect.appendChild(deletedOption);

    userSelectionFieldset.appendChild(userSelect);

    this.addUserOptions(userSelect);

    return userSelectionFieldset;
  }

  async addUserOptions(userSelect) {
    const activeGroup = document.createElement("optgroup");
    activeGroup.label = "Active Users";
    activeGroup.classList.add("ski-optgroup-users-active");
    const inactiveGroup = document.createElement("optgroup");
    inactiveGroup.label = "Inactive Users";
    inactiveGroup.classList.add("ski-optgroup-users-inactive");
    const concludedGroup = document.createElement("optgroup");
    concludedGroup.label = "Concluded Users";
    concludedGroup.classList.add("ski-optgroup-users-concluded");
    const deletedGroup = document.createElement("optgroup");
    deletedGroup.label = "Deleted Users";
    deletedGroup.classList.add("ski-optgroup-users-deleted");

    const enrollmentStates = ["active", "inactive", "concluded", "deleted"];
    const splitPathname = window.location.pathname.split("?")[0].split("/");
    const context = window.location.pathname.includes("/sections/")
      ? "sections"
      : "courses";
    const contextId =
      context == "sections" ? splitPathname[4] : splitPathname[2];
    for (const state of enrollmentStates) {
      const enrollments = await SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/${context}/${contextId}/enrollments`,
        {
          //"type[]": "StudentEnrollment",
          "state[]": state,
          per_page: 100,
        }
      );

      let optGroup = activeGroup;
      if (state == "inactive") {
        optGroup = inactiveGroup;
      } else if (state == "concluded") {
        optGroup = concludedGroup;
      } else if (state == "deleted") {
        optGroup = deletedGroup;
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
    try {
      this.updateLoadingMessage("info", "Getting selected option");
      const selectedUserId =
        formContainer.querySelector(".ski-user-select")?.value;

      const users = {};
      if (!selectedUserId) {
        const options = [...formContainer.querySelectorAll("option")];
        for (const option of options) {
          users[option.value] = option.innerText.split(" *(ID")[0];
        }
      } else if (selectedUserId == "active") {
        const options = [
          ...formContainer.querySelectorAll(
            ".ski-optgroup-users-active option"
          ),
        ];
        for (const option of options) {
          users[option.value] = option.innerText.split(" *(ID")[0];
        }
      } else if (selectedUserId == "inactive") {
        const options = [
          ...formContainer.querySelectorAll(
            ".ski-optgroup-users-inactive option"
          ),
        ];
        for (const option of options) {
          users[option.value] = option.innerText.split(" *(ID")[0];
        }
      } else if (selectedUserId == "concluded") {
        const options = [
          ...formContainer.querySelectorAll(
            ".ski-optgroup-users-concluded option"
          ),
        ];
        for (const option of options) {
          users[option.value] = option.innerText.split(" *(ID")[0];
        }
      } else if (selectedUserId == "deleted") {
        const options = [
          ...formContainer.querySelectorAll(
            ".ski-optgroup-users-deleted option"
          ),
        ];
        for (const option of options) {
          users[option.value] = option.innerText.split(" *(ID")[0];
        }
      } else {
        const options = [...formContainer.querySelectorAll("option[selected]")];
        for (const option of options) {
          users[option.value] = option.innerText.split(" *(ID")[0];
        }
      }

      const userIds = Object.keys(users);
      console.log(userIds);
      const accessData = [];
      const numOfUsers = userIds.length;
      for (let i = 0; i < numOfUsers; i++) {
        const userId = userIds[i];
        this.updateLoadingMessage(
          "info",
          "Getting access history of users (${i + 1} of ${numOfUsers})..."
        );
        const accessHistory = await SkiCanvasLmsApiCaller.getRequestAllPages(
          `/courses/${this.#currentCourseId}/users/${userId}/usage.json`
        );
        console.log(accessHistory);
        accessData.push(...accessHistory);
      }

      this.updateLoadingMessage("info", "Formatting data for table...");
      const extractedData = this.extractData(accessData, users);

      this.updateLoadingMessage("info", "Setting table data...");
      table.setTableBody(extractedData);

      this.updateLoadingMessage("success", "Finished loading data");
    } catch (error) {
      console.error(error);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(assetAccessData, users) {
    const data = [];
    for (const assetUserAccess of assetAccessData) {
      const userAccessData = assetUserAccess.asset_user_access;

      const studentName = users.hasOwnProperty(userAccessData.user_id)
        ? users[userAccessData.user_id]
        : "Unknown";
      let studentNameLink = document.createElement("a");
      studentNameLink.href = `/courses/${this.#currentCourseId}/users/${
        userAccessData.user_id
      }`;
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
      let url = `/courses/${this.#currentCourseId}`;
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
}
