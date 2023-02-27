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
          setTimeout(() => convertLinkText(), 10000);
        }
      }
    );
  }

  function convertLinkText() {
    console.log("checking for comments")
    const comments = document.querySelectorAll(
      "#right_side div.comment span.comment"
    );
    console.log(comments);
    for (const comment of comments) {
      console.log(comment);
      let commentInnerHTML = comment.innerHTML;
      const linkMatches = commentInnerHTML.match(/(http|https):\/\/\S+[a-zA-Z0-9\/]/g)
      if (linkMatches) {
        linkMatches.sort()
        const uniqueMatches = new Set(linkMatches);
        for (const match of uniqueMatches) {
          commentInnerHTML = commentInnerHTML.replaceAll(`${match} `, `<a href="${match}" target="_blank">${match}</a> `)
          commentInnerHTML = commentInnerHTML.replaceAll(`${match}.`, `<a href="${match}" target="_blank">${match}</a>.`)
        }
        console.log(`New inner: ${commentInnerHTML}`);
        comment.innerHTML = commentInnerHTML;
        console.log(comment);
      }
      
    }
  }
})();
