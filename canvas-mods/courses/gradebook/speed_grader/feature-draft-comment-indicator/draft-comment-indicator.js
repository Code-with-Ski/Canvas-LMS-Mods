(() => {
  if (
    /^\/courses\/[0-9]+\/gradebook\/speed_grader\??[^\/]*\/?$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        courseSpeedGraderDraftCommentIndicator: true,
      },
      function (items) {
        if (items.courseSpeedGraderDraftCommentIndicator) {
          replaceDraftCommentIndicator();
        }
      }
    );
  }

  function replaceDraftCommentIndicator() {
    const body = document.body;
    if (body) {
      if (!body.classList.contains("ski-speedgrader-draft-comment-indicator")) {
        body.classList.add("ski-speedgrader-draft-comment-indicator");
      }
    }
  }
})();