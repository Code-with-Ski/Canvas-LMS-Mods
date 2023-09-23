class SkiReportCourseQuizzes extends SkiReport {
  #currentCourseId = window.location.pathname.split("/")[2];

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
    const quizzes = await SkiCanvasLmsApiCaller.getRequestAllPages(
      `/api/v1/courses/${this.#currentCourseId}/all_quizzes`,
      {}
    );
    const quizzesData = this.extractData(quizzes);
    table.setTableBody(quizzesData);
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
}