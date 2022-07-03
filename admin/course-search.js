(() => {
  if (/^\/accounts\/[0-9]+\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminCoursesCourseCode: true,
      adminCoursesBlueprintInputPreventFill: true
    }, function (items) {
      if (items.adminCoursesCourseCode) {
        updateCourseSearchResults();
      }
      if (items.adminCoursesBlueprintInputPreventFill) {
        updateSearchForm();
      }
    });
  }

  /*
    Modify the flex settings for "Show only blueprint courses" so it doesn't
    grow to the remaining space
  */
  function updateSearchForm() {
    const blueprintCoursesSpan = document.querySelector("div#main form > span > span > span > span > span:nth-child(2) > span:nth-child(2)");
    if (blueprintCoursesSpan) {
      blueprintCoursesSpan.style.flex = "initial";
    }
  }

  /*
    Uses a mutation observer to detect changes.  When a new table row is added
    for the course search results, it will perform an API call to get the course
    details. Then, it adds the course code in the table data cell with the 
    course name.
  */
  function updateCourseSearchResults() {
    const mainContentDiv = document.querySelector("div#content");

    const courseResultsObserver = new MutationObserver(mutations => {
      mutations.forEach(mutationRecord => {
        let newNodes = mutationRecord.addedNodes;
        newNodes.forEach(newNode => {
          if (newNode.nodeName == "TR") {
            const courseNameLink = newNode.querySelector("td > a[href*='/courses/']");
            if (courseNameLink) {
              const courseCode = courseNameLink.parentElement.querySelector("span.ski-course-code");
              if (!courseCode) {
                const canvasCourseCode = courseNameLink.href.split("/").pop();
                fetch(`https://${document.location.hostname}/api/v1/courses/${canvasCourseCode}`)
                  .then(response => response.json())
                  .then(data => {
                    const courseCode = data["course_code"];
                    courseNameLink.insertAdjacentHTML("afterend", `<br><span class="ski-course-code" style="font-style: italic;">${courseCode}</span>`);
                  })
                  .catch((error) => {
                    console.error('Error:', error);
                  });
              }
            }
          }
        });
      });
    });

    if (mainContentDiv) {
      const tableBodyRows = [...document.querySelectorAll("tbody[data-association='courses list'] tr")];
      tableBodyRows.forEach(row => {
        const courseNameLink = row.querySelector("td > a[href*='/courses/']");
        if (courseNameLink) {
          const courseCode = courseNameLink.parentElement.querySelector("span.ski-course-code");
          if (!courseCode) {
            const canvasCourseCode = courseNameLink.href.split("/").pop();
            fetch(`https://${document.location.hostname}/api/v1/courses/${canvasCourseCode}`)
              .then(response => response.json())
              .then(data => {
                const courseCode = data["course_code"];
                courseNameLink.insertAdjacentHTML("afterend", `<br><span class="ski-course-code" style="font-style: italic;">${courseCode}</span>`);
              })
              .catch((error) => {
                console.error('Error:', error);
              });
          }
        }
      });

      courseResultsObserver.observe(mainContentDiv, {
        subtree: true,
        childList: true
      });
    }
  }

})();