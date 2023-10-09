class SkiReportCourseEnrollments extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];
  
  constructor() {
    super("Enrollment Report");
  }

  createTable() {
    const table = new SkiTable(
      "enrollment-report",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Enrollment ID", true, true),
        new SkiTableHeadingConfig("Section ID", true, true),
        new SkiTableHeadingConfig("Section SIS ID", true, true),
        new SkiTableHeadingConfig("Section Name"),
        new SkiTableHeadingConfig("User ID", true, true),
        new SkiTableHeadingConfig("User SIS ID", true, true),
        new SkiTableHeadingConfig("User Sortable Name"),
        new SkiTableHeadingConfig("User Display Name"),
        new SkiTableHeadingConfig("User Login ID", true, true),
        new SkiTableHeadingConfig("Enrollment State"),
        new SkiTableHeadingConfig("Enrollment Type"),
        new SkiTableHeadingConfig("Enrollment Role ID", true, true),
        new SkiTableHeadingConfig("Enrollment Role"),
        new SkiTableHeadingConfig("Created At"),
        new SkiTableHeadingConfig("Updated At"),
        new SkiTableHeadingConfig("Last Activity At"),
        new SkiTableHeadingConfig("Total Activity Time"),
        new SkiTableHeadingConfig("Current Score", true, true),
        new SkiTableHeadingConfig("Current Grade", true, true),
        new SkiTableHeadingConfig("Final Score", true, true),
        new SkiTableHeadingConfig("Final Grade", true, true),
        new SkiTableHeadingConfig("Last Attended At", true, true),
        new SkiTableHeadingConfig("Limit Access to Section", true, true),
        new SkiTableHeadingConfig("SIS Import ID", true, true),
        new SkiTableHeadingConfig("Start At", true, true),
        new SkiTableHeadingConfig("End At", true, true),
      ],
      []
    );

    return table;
  }

  addFormElements(table, formContainer) {
    // Enrollment State Fieldset
    const enrollmentStateFieldset = this.createEnrollmentStateFieldset();
    formContainer.appendChild(enrollmentStateFieldset);
    
    // Adds Load All button
    super.addFormElements(table, formContainer);
  }

  createEnrollmentStateFieldset() {
    const enrollmentStateFieldset = document.createElement("fieldset");
    enrollmentStateFieldset.classList.add("ski-ui");
    const legend = document.createElement("legend");
    legend.innerText = "Enrollment States to Include";
    enrollmentStateFieldset.appendChild(legend);
    
    const enrollmentStateOptions = [
      "active",
      "invited",
      "inactive",
      "completed",
      "deleted"
    ]
    for (const option of enrollmentStateOptions) {
      const optionCheckbox = document.createElement("input");
      optionCheckbox.type = "checkbox";
      if (option == "active") {
        optionCheckbox.checked = "true";
      }

      optionCheckbox.value = option;
      optionCheckbox.name = "enrollment-state";
      optionCheckbox.id = `enrollment-report-enrollment-state-${option}`;

      const label = document.createElement("label");
      label.setAttribute("for", `enrollment-report-enrollment-state-${option}`);
      label.innerText = option;

      const optionContainer = document.createElement("div");
      optionContainer.classList.add("ski-checkbox-inline");
      optionContainer.appendChild(optionCheckbox);
      optionContainer.appendChild(label);

      enrollmentStateFieldset.appendChild(optionContainer);
    }

    return enrollmentStateFieldset;
  }

  async loadData(table, formContainer) {
    const enrollmentStateCheckboxes = [...formContainer.querySelectorAll("input[name='enrollment-state']:checked")];
    if (enrollmentStateCheckboxes.length == 0) { alert("At least one enrollment state must be checked"); return; }
    
    const sections = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${this.#currentCourseId}/sections`,
      { per_page: 100 }
    );
    const sectionsDict = {};
    for (const section of sections) {
      sectionsDict[section.id] = section;
    }

    const enrollments = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${this.#currentCourseId}/enrollments`,
      { per_page: 100, "state[]": [...enrollmentStateCheckboxes.map((input) => input.value)] }
    );
    const extractedData = this.extractData(enrollments, sectionsDict);
    table.setTableBody(extractedData);
  }

  extractData(enrollments, sections) {
    const data = [];
    for (const enrollment of enrollments) {
      const userId = enrollment.user_id;
      
      const user = enrollment?.user;
      const userDisplayName = user?.short_name || user?.name;
      const userSortableName = user?.sortable_name;
      const userLoginId = user?.login_id;
      const userSisId = user?.sis_user_id;

      const enrollmentUserNameLink = document.createElement("a");
      enrollmentUserNameLink.href = enrollment.html_url;
      enrollmentUserNameLink.target = "_blank";
      enrollmentUserNameLink.innerText = userDisplayName;

      const grades = enrollment?.grades;

      let createdAtDate = enrollment.created_at;
      let createdAtDateIso = "";
      if (!createdAtDate) {
        createdAtDate = "None";
      } else {
        createdAtDateIso = new Date(createdAtDate).toISOString();
        createdAtDate = new Date(createdAtDate).toLocaleString();
      }

      let updatedAtDate = enrollment.updated_at;
      let updatedAtDateIso = "";
      if (!updatedAtDate) {
        updatedAtDate = "None";
      } else {
        updatedAtDateIso = new Date(updatedAtDate).toISOString();
        updatedAtDate = new Date(updatedAtDate).toLocaleString();
      }

      let lastActivityAtDate = enrollment.last_activity_at;
      let lastActivityAtDateIso = "";
      if (!lastActivityAtDate) {
        lastActivityAtDate = "None";
      } else {
        lastActivityAtDateIso = new Date(lastActivityAtDate).toISOString();
        lastActivityAtDate = new Date(lastActivityAtDate).toLocaleString();
      }

      let lastAttendedAtDate = enrollment.last_attended_at;
      let lastAttendedAtDateIso = "";
      if (!createdAtDate) {
        lastAttendedAtDate = "None";
      } else {
        lastAttendedAtDateIso = new Date(lastAttendedAtDate).toISOString();
        lastAttendedAtDate = new Date(lastAttendedAtDate).toLocaleString();
      }

      let startAtDate = enrollment.start_at;
      let startAtDateIso = "";
      if (!startAtDate) {
        startAtDate = "None";
      } else {
        startAtDateIso = new Date(startAtDate).toISOString();
        startAtDate = new Date(startAtDate).toLocaleString();
      }

      let endAtDate = enrollment.end_at;
      let endAtDateIso = "";
      if (!endAtDate) {
        endAtDate = "None";
      } else {
        endAtDateIso = new Date(endAtDate).toISOString();
        endAtDate = new Date(endAtDate).toLocaleString();
      }

      const rowData = [
        new SkiTableDataConfig(enrollment.id, undefined, "number"),
        new SkiTableDataConfig(enrollment.course_section_id, undefined, "number"),
        new SkiTableDataConfig(enrollment?.sis_section_id),
        new SkiTableDataConfig(sections[enrollment.course_section_id].name),
        new SkiTableDataConfig(userId, undefined, "number"),
        new SkiTableDataConfig(userSisId, undefined, "number"),
        new SkiTableDataConfig(userSortableName),
        new SkiTableDataConfig(enrollmentUserNameLink),
        new SkiTableDataConfig(userLoginId),
        new SkiTableDataConfig(enrollment.enrollment_state),
        new SkiTableDataConfig(enrollment.type),
        new SkiTableDataConfig(enrollment.role_id, undefined, "number"),
        new SkiTableDataConfig(enrollment.role),
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
        new SkiTableDataConfig(
          lastActivityAtDate,
          lastActivityAtDateIso,
          "dateISO",
          lastActivityAtDateIso
        ),
        new SkiTableDataConfig(enrollment.total_activity_time, undefined, "number"),
        new SkiTableDataConfig(grades?.current_score, undefined, "number"),
        new SkiTableDataConfig(grades?.current_grade),
        new SkiTableDataConfig(grades?.final_score, undefined, "number"),
        new SkiTableDataConfig(grades?.final_grade),
        new SkiTableDataConfig(
          lastAttendedAtDate,
          lastAttendedAtDateIso,
          "dateISO",
          lastAttendedAtDateIso
        ),
        new SkiTableDataConfig(enrollment.limit_privileges_to_course_section),
        new SkiTableDataConfig(enrollment?.sis_import_id || "N/A"),
        new SkiTableDataConfig(
          startAtDate,
          startAtDateIso,
          "dateISO",
          startAtDateIso
        ),
        new SkiTableDataConfig(
          endAtDate,
          endAtDateIso,
          "dateISO",
          endAtDateIso
        ),
      ];

      data.push(rowData);
    }
    return data;
  }
}