(() => {
  if (/^\/users\/[0-9]+\/grades/.test(window.location.pathname)) {
    chrome.storage.sync.get({
      adminUsersGradesPersonalized: true
    }, function (items) {
      if (items.adminUsersGradesPersonalized) {
        updateDisplayedName();
      }
    });
  }

  /*
    Updates the name in the breadcrumb and headings to reflect that
    of the user being viewed.
  */
  async function updateDisplayedName() {
    const userIdForGrades = window.location.pathname.split("/")[2];
    const userForGrades = await getUser(userIdForGrades);
    if (userForGrades) {
      const userDisplayName = userForGrades.short_name;

      const breadcrumbNavUserNameSpan = document.querySelector("nav#breadcrumbs ul li:nth-of-type(2) span");
      if (breadcrumbNavUserNameSpan) {
        breadcrumbNavUserNameSpan.innerHTML = userDisplayName;
      }

      const headings = [...document.querySelectorAll("div#content h2")];
      for (let heading of headings) {
        if (heading.innerText.includes("I'm")) {
          heading.innerHTML = heading.innerHTML.replace("I'm", `${userDisplayName} is`);
        }
      }
    }
  }

  /*
    Returns the user with the given userId
  */
  async function getUser(userId) {
    let user = {};

    const url = `/api/v1/users/${userId}`;

    const fetches = [];
    fetches.push(
      fetch(url)
        .then(response => response.json())
        .then(data => {
          user = data;
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        })
    );

    await Promise.all(fetches);

    return user;
  }
})();