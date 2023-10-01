(() => {
  if (/^\/accounts\/[0-9]+\/users\/[0-9]+/.test(window.location.pathname) || 
      /^\/accounts\/self\/users\/[0-9]+/.test(window.location.pathname) || 
      /^\/users\/[0-9]+/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminUsersAddGradesLink: true,
    }, function (items) {
      if (items.adminUsersAddGradesLink) {
        addGradesButton();
      }
    });
  }

  /*
    Adds a link to view the user's grades in their current courses
  */
  function addGradesButton() {
    const rightSide = document.getElementById("right-side");
    if (rightSide) {
      const userId = window.location.pathname.split("/").pop();
      rightSide.insertAdjacentHTML("beforeend", `
        <div>
          <a href="/users/${userId}/grades" target="_blank" class="btn button-sidebar-wide">
            <i class="icon-check-plus"></i> View Current Grades
          </a>
        </div>
      `);
    }
  }
})();