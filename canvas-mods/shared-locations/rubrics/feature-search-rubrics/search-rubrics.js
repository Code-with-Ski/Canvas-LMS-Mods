(() => {
  if (
    /^\/(account|course)s\/[0-9]+\/rubrics\??[^\/]*\/?$/.test(
      window.location.pathname
    )
  ) {
    chrome.storage.sync.get(
      {
        rubricsSearch: true,
      },
      function (items) {
        if (items.rubricsSearch) {
          addRubricsSearch();
        }
      }
    );
  }

  /*
    Adds a search box at the top of the rubrics.
  */
  function addRubricsSearch() {
    const rubricsList = document.querySelector("div#rubrics ul");
    const rubricSearch = document.querySelector(
      "div#rubrics input#ski-rubric-search"
    );
    if (rubricsList && !rubricSearch) {
      rubricsList.insertAdjacentHTML(
        "beforebegin",
        "<input id='ski-rubric-search' type='text' placeholder='Search for rubric by name'>"
      );
      const newRubricSearch = document.querySelector(
        "div#rubrics input#ski-rubric-search"
      );
      newRubricSearch.addEventListener("keyup", () => searchRubrics());
    }
  }

  /*
    Checks the rubrics search bar for the value.
    If there is a value, it will go through each row and 
    hide those that don't include that value in the 
    rubric name
  */
  function searchRubrics() {
    const rubricListItems = [
      ...document.querySelectorAll("div#rubrics ul > li"),
    ];
    const searchBox = document.querySelector(
      "div#rubrics input#ski-rubric-search"
    );
    if (searchBox) {
      const searchPhrase = searchBox.value.toUpperCase();
      rubricListItems.forEach((item) => {
        let shouldShow = true;
        if (searchPhrase) {
          shouldShow = false;

          const rubricName = item.querySelector("a.title");
          if (
            rubricName &&
            rubricName.innerText.toUpperCase().includes(searchPhrase)
          ) {
            shouldShow = true;
          }
        }

        if (shouldShow) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    }
  }
})();
