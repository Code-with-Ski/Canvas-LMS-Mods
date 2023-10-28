class SkiReportCourseModulesProgress extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];
  #isSectionReport = window.location.pathname.includes("/sections/");
  #currentSectionId;

  constructor() {
    super("Modules Progress Report");
    if (this.#isSectionReport) {
      this.#currentSectionId = window.location.pathname
        .split("?")[0]
        .split("/")[4];
    }
  }

  createTable() {
    const table = new SkiTable(
      "modules-progress-details",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("User ID", true, true),
        new SkiTableHeadingConfig("Name"),
        new SkiTableHeadingConfig("Module ID", true, true),
        new SkiTableHeadingConfig("Module Name"),
        new SkiTableHeadingConfig("Module Item ID", true, true),
        new SkiTableHeadingConfig("Module Item Name"),
        new SkiTableHeadingConfig("Requirement Type"),
        new SkiTableHeadingConfig("Status"),
        new SkiTableHeadingConfig("Module % Complete"),
        new SkiTableHeadingConfig("Total % Complete"),
      ],
      []
    );

    return table;
  }

  async loadData(table) {
    try {
      const context = this.#isSectionReport ? "sections" : "courses";
      const contextId = this.#isSectionReport
        ? this.#currentSectionId
        : this.#currentCourseId;

      this.updateLoadingMessage("info", "Getting enrolled students...");
      const students = await SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/${context}/${contextId}/enrollments?type[]=StudentEnrollment`,
        {}
      );

      const numOfStudents = students.length;
      for (let i = 0; i < numOfStudents; i++) {
        this.updateLoadingMessage(
          "info",
          `Getting module progress of student (${i + 1} of ${numOfStudents})...`
        );
        const studentEnrollment = students[i];
        const studentId = studentEnrollment["user_id"];
        const studentModulesProgress =
          await SkiCanvasLmsApiCaller.getRequestAllPages(
            `/api/v1/courses/${
              this.#currentCourseId
            }/modules?include[]=items&student_id=${studentId}`,
            {}
          );

        // TODO Find reason for the error
        if (!studentModulesProgress || !Array.isArray(studentModulesProgress)) {
          console.warn(
            `Issue retrieving module progress for student ID ${studentId}. Skipping student`
          );
          continue;
        }

        let totalNumOfItemsWithRequirements = 0;
        let totalNumOfItemsCompleted = 0;
        for (const module of studentModulesProgress) {
          const items = module.items;
          let numOfItemsWithRequirements = items.filter((item) => {
            return item.hasOwnProperty("completion_requirement");
          }).length;
          module.requiredItems = numOfItemsWithRequirements;
          totalNumOfItemsWithRequirements += numOfItemsWithRequirements;

          let numOfItemsCompleted = items.filter((item) => {
            return (
              item.hasOwnProperty("completion_requirement") &&
              item.completion_requirement.completed
            );
          }).length;
          module.completedItems = numOfItemsCompleted;
          totalNumOfItemsCompleted += numOfItemsCompleted;
        }
        studentEnrollment.modulesProgress = studentModulesProgress;
        studentEnrollment.requiredItems = totalNumOfItemsWithRequirements;
        studentEnrollment.completedItems = totalNumOfItemsCompleted;
      }

      this.updateLoadingMessage("info", "Formatting data for table...");
      const modulesProgressData = this.extractData(students);

      this.updateLoadingMessage("info", "Adding data to table...");
      table.setTableBody(modulesProgressData);
      this.updateLoadingMessage("success", `Finished loading data`);
    } catch (error) {
      console.error(error);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(students) {
    const data = [];
    for (const student of students) {
      const studentId = student["user_id"];
      const studentSortableName = student["user"]["sortable_name"];

      const totalCompletion =
        student.requiredItems > 0
          ? Math.round((student.completedItems / student.requiredItems) * 100)
          : -1;

      const modulesProgress = student.modulesProgress;
      for (
        let moduleIndex = 0;
        moduleIndex < modulesProgress.length;
        moduleIndex++
      ) {
        const module = modulesProgress[moduleIndex];
        const moduleId = module.id;
        const moduleName = module.name;
        const moduleState = module.state;

        const moduleCompletion =
          module.requiredItems > 0
            ? Math.round((module.completedItems / module.requiredItems) * 100)
            : -1;

        const moduleItems = module.items;
        for (let itemIndex = 0; itemIndex < moduleItems.length; itemIndex++) {
          const item = moduleItems[itemIndex];
          const requirementType = item?.completion_requirement?.type || "N/A";
          const itemStatus = this.#determineModuleItemStatus(item, moduleState);

          data.push([
            new SkiTableDataConfig(studentId, undefined, "number"),
            new SkiTableDataConfig(studentSortableName),
            new SkiTableDataConfig(moduleId, undefined, "number"),
            new SkiTableDataConfig(moduleName),
            new SkiTableDataConfig(item.id, undefined, "number"),
            new SkiTableDataConfig(item.title),
            new SkiTableDataConfig(requirementType),
            new SkiTableDataConfig(itemStatus),
            new SkiTableDataConfig(
              moduleCompletion == -1 ? "N/A" : `${moduleCompletion}%`,
              moduleCompletion,
              "number",
              undefined,
              {
                backgroundColor:
                  this.#determineModuleCompletionBackgroundColor(
                    moduleCompletion
                  ),
              }
            ),
            new SkiTableDataConfig(
              totalCompletion == -1 ? "N/A" : `${totalCompletion}%`,
              totalCompletion,
              "number",
              undefined,
              {
                backgroundColor:
                  this.#determineModuleCompletionBackgroundColor(
                    totalCompletion
                  ),
              }
            ),
          ]);
        }
      }
    }

    return data;
  }

  #determineModuleItemStatus(item, moduleState) {
    if (!item.hasOwnProperty("completion_requirement")) {
      return "N/A";
    }

    if (item.completion_requirement.completed) {
      return "completed";
    }

    if (moduleState == "started") {
      return "to do";
    }

    return moduleState;
  }

  #determineModuleCompletionBackgroundColor(completionPercentage) {
    const RATING_COLORS = [
      "#FFD6D6",
      "#FFD6D6",
      "#FFC085",
      "#FFFB8F",
      "#AAF9A9",
    ];

    if (completionPercentage < 0) {
      return "";
    }

    if (completionPercentage >= 100) {
      return RATING_COLORS[RATING_COLORS.length - 1];
    }

    return RATING_COLORS[(completionPercentage / 100) * RATING_COLORS.length];
  }
}
