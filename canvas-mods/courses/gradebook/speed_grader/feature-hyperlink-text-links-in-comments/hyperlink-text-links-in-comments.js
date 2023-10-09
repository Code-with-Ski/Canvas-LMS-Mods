(() => {
  if (
    /^\/courses\/[0-9]+\/gradebook\/speed_grader\??[^\/]*\/?$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        courseSpeedGraderCommentsWithHyperlinksEnabled: true,
      },
      function (items) {
        if (items.courseSpeedGraderCommentsWithHyperlinksEnabled) {
          watchForComments();
        }
      }
    );
  }

  function watchForComments() {
    const commentsDiv = document.getElementById("comments");
    if (!commentsDiv) {
      const observer = new MutationObserver(() => {
        const loadedCommentsDiv = document.getElementById("comments");
        if (loadedCommentsDiv) {
          observer.disconnect();
          const commentsObserver = new MutationObserver(() => {
            const comments = document.querySelectorAll(
              "div#comments div.comment span.comment:not(.ski-links-converted)"
            );
            for (let comment of comments) {
              updateLinksInComment(comment);
            }
          });
          commentsObserver.observe(loadedCommentsDiv, {
            childList: true,
            subtree: true,
          });
        }
      });
      observer.observe(document.body, { childList: true });
    } else {
      const comments = document.querySelectorAll(
        "div#comments div.comment span.comment:not(.ski-links-converted)"
      );
      for (let comment of comments) {
        updateLinksInComment(comment);
      }

      const commentsObserver = new MutationObserver(() => {
        const comments = document.querySelectorAll(
          "div#comments div.comment span.comment:not(.ski-links-converted)"
        );
        for (let comment of comments) {
          updateLinksInComment(comment);
        }
      });
      commentsObserver.observe(commentsDiv, {
        childList: true,
        subtree: true,
      });
    }
  }

  function updateLinksInComment(comment) {
    let commentText = comment.innerText;
    commentText = commentText.replaceAll("\n", "<br>");
    let splitCommentText = commentText.split(" ");
    splitCommentText.forEach((element, index, array) => {
      if (element.startsWith("https://") || element.startsWith("http://")) {
        if (
          element.endsWith(".") ||
          element.endsWith(",") ||
          element.endsWith(";") ||
          element.endsWith(")")
        ) {
          let linkText = element.substring(0, element.length - 1);
          let endCharacter = element.substring(element.length - 1);
          array.splice(index, 1, `<a href='${linkText}' target='_blank'>${linkText}</a>${endCharacter}`);
        } else {
          array.splice(index, 1, `<a href='${element}' target='_blank'>${element}</a>`);
        }
      }
    });
    comment.innerHTML = splitCommentText.join(" ");
    if (commentText.length > 0) {
      comment.classList.add("ski-links-converted");
    }
  }
})();
