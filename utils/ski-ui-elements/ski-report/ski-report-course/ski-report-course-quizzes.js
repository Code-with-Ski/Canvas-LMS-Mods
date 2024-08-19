class SkiReportCourseQuizzes extends SkiReport {
  constructor() {
    super("Quiz Details");
  }

  createTable() {
    const table = new SkiTable(
      "quiz-details",
      new SkiTableConfig("400px"),
      [
        new SkiTableHeadingConfig("Quiz ID", true, true),
        new SkiTableHeadingConfig("Title"),
        new SkiTableHeadingConfig("Quiz Type"),
        new SkiTableHeadingConfig("Question Count"),
        new SkiTableHeadingConfig("Points Possible"),
        new SkiTableHeadingConfig("Published"),
        new SkiTableHeadingConfig("Has Access Code", true, true),
        new SkiTableHeadingConfig("Shuffle Answers", true, true),
        new SkiTableHeadingConfig("Time Limit"),
        new SkiTableHeadingConfig("Allowed Attempts"),
        new SkiTableHeadingConfig("Show Correct Answers"),
        new SkiTableHeadingConfig("One Question at a Time", true, true),
        new SkiTableHeadingConfig("Require LockDown Browser"),
        new SkiTableHeadingConfig("Require LockDown Browser Monitor"),
      ],
      []
    );

    return table;
  }

  async loadData(table) {
    this.updateLoadingMessage("clear");
    try {
      const courseId = SkiReport.contextDetails.get("courseId");
      if (!courseId) {
        throw "Course ID not set in SkiReport";
      }

      this.updateLoadingMessage("info", "Getting quizzes...", true);
      const quizzes = await this.#getQuizzes(courseId);
      if (!quizzes) {
        this.updateLoadingMessage(
          "error",
          `ERROR: Failed to get quizzes`,
          true
        );
      } else {
        this.updateLoadingMessage("info", "Formatting data for table...", true);
        const quizzesData = this.extractData(quizzes);

        this.updateLoadingMessage("info", "Adding data to table...", true);
        table.setTableBody(quizzesData);
        this.updateLoadingMessage("success", `Finished loading data`, true);
      }
    } catch (error) {
      console.error(`Error: ${error}\n\nStack Trace: ${error.stack}`);
      this.updateLoadingMessage("error", `ERROR LOADING DATA: ${error}`);
    }
  }

  extractData(quizzes) {
    const data = [];
    for (const quiz of quizzes) {
      const quizTitle = quiz.title;
      const quizTitleLink = document.createElement("a");
      quizTitleLink.href = quiz.html_url;
      quizTitleLink.target = "_blank";
      quizTitleLink.innerText = quizTitle;

      const pointsPossible =
        quiz.points_possible == null ? "None" : quiz.points_possible;

      const timeLimit = quiz.time_limit == null ? "None" : quiz.time_limit;

      const rowData = [
        new SkiTableDataConfig(quiz.id, undefined, "number"),
        new SkiTableDataConfig(quizTitleLink),
        new SkiTableDataConfig(quiz.quiz_type),
        new SkiTableDataConfig(quiz.question_count, undefined, "number"),
        new SkiTableDataConfig(pointsPossible, undefined, "number"),
        new SkiTableDataConfig(quiz.published),
        new SkiTableDataConfig(quiz.has_access_code),
        new SkiTableDataConfig(quiz.shuffle_answers),
        new SkiTableDataConfig(timeLimit, undefined, "number"),
        new SkiTableDataConfig(quiz.allowed_attempts, undefined, "number"),
        new SkiTableDataConfig(quiz.show_correct_answers),
        new SkiTableDataConfig(quiz.one_question_at_a_time),
        new SkiTableDataConfig(quiz.require_lockdown_browser),
        new SkiTableDataConfig(quiz.require_lockdown_browser_monitor),
      ];

      data.push(rowData);
    }
    return data;
  }

  #getQuizzes(courseId) {
    return SkiReport.memoizeRequest("quizzes", () => {
      return SkiCanvasLmsApiCaller.getRequestAllPages(
        `/api/v1/courses/${courseId}/all_quizzes`,
        { per_page: 100 }
      );
    });
  }
}
