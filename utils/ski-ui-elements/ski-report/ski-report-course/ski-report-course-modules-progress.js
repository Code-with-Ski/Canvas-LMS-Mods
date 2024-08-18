class SkiReportCourseModulesProgress extends SkiReport {
  constructor() {
    super("Modules Progress Report");
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
    this.updateLoadingMessage("clear");
    try {
      const courseId = SkiReport.contextDetails.get("courseId");
      const context = SkiReport.contextDetails.get("reportContext");
      const sectionId = SkiReport.contextDetails.get("sectionId");
      const contextId = SkiReport.contextDetails.get("contextId");
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }

      this.updateLoadingMessage(
        "info",
        "Getting enrolled active students...",
        true
      );
      let students = [];
      const enrollments = await this.#getEnrollments(
        context,
        contextId,
        "active"
      );
      if (!enrollments) {
        this.updateLoadingMessage(
          "error",
          `ERROR: Failed to get enrolled active students`,
          true
        );
      } else {
        students = enrollments.filter((enrollment) => {
          return enrollment.type == "StudentEnrollment";
        });
      }

      const numOfStudents = students.length;
      for (let i = 0; i < numOfStudents; i++) {
        const studentEnrollment = students[i];
        const studentId = studentEnrollment["user_id"];
        this.updateLoadingMessage(
          "info",
          `Getting module progress of student [ID: ${studentId}] (${
            i + 1
          } of ${numOfStudents})...`,
          true
        );
        const studentModulesProgress =
          await SkiCanvasLmsApiCaller.getRequestAllPages(
            `/api/v1/courses/${courseId}/modules?include[]=items&student_id=${studentId}`,
            {}
          );

        // TODO Find reason for the error
        if (!studentModulesProgress || !Array.isArray(studentModulesProgress)) {
          console.warn(
            `Issue retrieving module progress for student ID ${studentId}. Skipping student`
          );
          this.updateLoadingMessage(
            "error",
            `ERROR: Failed to get modules with items for student [ID: ${studentId}]`,
            true
          );
          continue;
        }

        let totalNumOfItemsWithRequirements = 0;
        let totalNumOfItemsCompleted = 0;
        for (const module of studentModulesProgress) {
          this.updateLoadingMessage(
            "info",
            `Checking module [ID: ${module.id}] progress of student [ID: ${studentId}]`,
            true
          );
          let items = module.items;

          // Attempt to get module items if not included with module details
          if (!items) {
            this.updateLoadingMessage(
              "info",
              `Getting items of module [ID: ${module.id}] for student [ID: ${studentId}]`
            );
            items = await SkiCanvasLmsApiCaller.getRequestAllPages(
              `/api/v1/courses/${courseId}/modules/${module.id}/items?student_id=${studentId}`,
              {}
            );

            // Check if items have now been retrieved
            if (!items || !Array.isArray(items)) {
              console.warn(
                `Issue retrieving module items of module for student ID ${studentId}. Skipping module (${module}).`
              );
              this.updateLoadingMessage(
                "error",
                `ERROR: Failed to get items in module [ID: ${module.id}] for student [ID: ${studentId}]`,
                true
              );
              continue;
            } else {
              module.items = items;
            }
          }

          let numOfItemsWithRequirements =
            items?.filter((item) => {
              return item.hasOwnProperty("completion_requirement");
            })?.length ?? 0;
          module.requiredItems = numOfItemsWithRequirements;
          totalNumOfItemsWithRequirements += numOfItemsWithRequirements;

          let numOfItemsCompleted =
            items?.filter((item) => {
              return (
                item.hasOwnProperty("completion_requirement") &&
                item.completion_requirement.completed
              );
            })?.length ?? 0;
          module.completedItems = numOfItemsCompleted;
          totalNumOfItemsCompleted += numOfItemsCompleted;
        }
        studentEnrollment.modulesProgress = studentModulesProgress;
        studentEnrollment.requiredItems = totalNumOfItemsWithRequirements;
        studentEnrollment.completedItems = totalNumOfItemsCompleted;
      }

      this.updateLoadingMessage("info", "Formatting data for table...", true);
      const modulesProgressData = this.extractData(students);

      this.updateLoadingMessage("info", "Adding data to table...", true);
      table.setTableBody(modulesProgressData);
      this.updateLoadingMessage("success", `Finished loading data`, true);
    } catch (error) {
      console.error(`Error: ${error}\n\nStack Trace: ${error.stack}`);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(students) {
    const data = [];
    for (const student of students) {
      if (!student.modulesProgress) {
        continue;
      }

      const studentId = student["user_id"];
      const studentSortableName = student["user"]["sortable_name"];

      const totalCompletion =
        student.requiredItems > 0
          ? Math.round((student.completedItems / student.requiredItems) * 100)
          : -1;

      const modulesProgress = student.modulesProgress ?? [];
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

        const moduleItems = module.items ?? [];
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
