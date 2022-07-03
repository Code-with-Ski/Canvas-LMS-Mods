(() => {
  if (/^\/accounts\/[0-9]+\/question_banks\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminQuestionBanksSearch: true
    }, function (items) {
      if (items.adminQuestionBanksSearch) {
        addQuestionBanksSearch();
      }
    });
  }

  /*
    Adds a search box at the top of the question banks.
  */
  function addQuestionBanksSearch() {
    const questionBanksDiv = document.querySelector("div#questions");
    const questionBanksSearch = document.querySelector("div#questions input#skiquestion-bank-search");
    if (questionBanksDiv && !questionBanksSearch) {
      questionBanksDiv.insertAdjacentHTML("afterbegin", "<input id='ski-question-bank-search' type='text' placeholder='Search for question bank by name'>");
      const newQuestionBanksSearch = document.querySelector("div#questions input#ski-question-bank-search");
      newQuestionBanksSearch.addEventListener("keyup", () => searchQuestionBanks());
    }
  }

  /*
    Checks the question banks search bar for the value.
    If there is a value, it will go through each question bank
    div and hide those that don't include that value in the 
    question bank name
  */
  function searchQuestionBanks() {
    const questionBankDivs = [...document.querySelectorAll("div#questions div.question_bank")];
    const searchBox = document.querySelector("div#questions input#ski-question-bank-search");
    if (searchBox) {
      const searchPhrase = searchBox.value.toUpperCase();
      questionBankDivs.forEach(item => {
        let shouldShow = true;
        if (searchPhrase) {
          shouldShow = false;

          const questionBankName = item.querySelector("a.title");
          if (questionBankName && questionBankName.innerText.toUpperCase().includes(searchPhrase)) {
            shouldShow = true;
          }
        }

        if (shouldShow) {
          item.style.display = "";
        }
        else {
          item.style.display = "none";
        }
      });
    }
  }
})();