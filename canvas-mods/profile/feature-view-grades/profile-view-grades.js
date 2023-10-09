(() => {
  if (/^\/profile\??[^\/]*\/?$/.test(window.location.pathname)) {
    chrome.storage.sync.get(
      {
        accountProfileGradesButton: true,
      },
      function (items) {
        if (items.accountProfileGradesButton) {
          addViewGradesButtonToUserProfile();
        }
      }
    );
  }

  /*
    Adds a view grades button on the user's account profile page
  */
  function addViewGradesButtonToUserProfile() {
    const profileRightSide = document.querySelector(
      "div#content div.ic-Profile-layout__Secondary"
    );
    if (profileRightSide) {
      const editProfileButtons = profileRightSide.querySelectorAll("button");
      for (let button of editProfileButtons) {
        button.style.textAlign = "left";
        button.style.margin = "5px auto 5px 10%";
        button.style.width = "90%";
        button.style.display = "block";
      }

      profileRightSide.insertAdjacentHTML(
        "beforeend",
        `
        <a href="/users/self/grades" class="Button" style="text-align: left; margin: 5px auto 5px 10%; display: block;">
          <i class="icon-check-plus"></i> View Grades
        </a>
      `
      );
    }
  }
})();
